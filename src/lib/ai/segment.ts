import "server-only";
import sharp from "sharp";

/**
 * Background segmentation without any external service.
 *
 * Shop photos are overwhelmingly "product on a table / cloth / wall" — a
 * reasonably uniform background touching the frame edges. We flood-fill inward
 * from the border, keeping pixels that match the background colour, and treat
 * everything unreached as the product.
 *
 * This is classical computer vision, not a neural network: it is free, runs in
 * ~100ms, and needs no API key. It deliberately REFUSES rather than guessing
 * when the background is busy — a wrong cutout looks far worse than none.
 */

const WORK_SIZE = 320;
/** Mask is never computed larger than this on the long edge. */
const MAX_MASK_EDGE = 1600;
/** Colour distance (0-255 per channel, euclidean) tolerated as background. */
const TOLERANCE = 34;
/** Reject the result unless the product occupies a sensible share of frame. */
const MIN_PRODUCT_RATIO = 0.04;
const MAX_PRODUCT_RATIO = 0.92;

export interface SegmentResult {
  /** Greyscale mask at full resolution: 255 = product, 0 = background. */
  mask: Buffer;
  width: number;
  height: number;
  productRatio: number;
}

function colourDistance(
  data: Buffer,
  i: number,
  r: number,
  g: number,
  b: number,
): number {
  const dr = data[i]! - r;
  const dg = data[i + 1]! - g;
  const db = data[i + 2]! - b;
  return Math.sqrt(dr * dr + dg * dg + db * db);
}

/**
 * Returns a product mask, or null when the image doesn't suit this technique
 * (busy background, product bleeding off every edge, etc.).
 */
export async function segmentProduct(input: Buffer): Promise<SegmentResult | null> {
  const meta = await sharp(input).rotate().metadata();
  const srcW = meta.width ?? 0;
  const srcH = meta.height ?? 0;
  if (!srcW || !srcH) return null;

  // Cap the mask resolution. Output is 1200px, so masking a 12MP phone photo
  // at full size would burn memory for no visible gain.
  const scale = Math.min(1, MAX_MASK_EDGE / Math.max(srcW, srcH));
  const fullW = Math.max(1, Math.round(srcW * scale));
  const fullH = Math.max(1, Math.round(srcH * scale));

  const { data, info } = await sharp(input)
    .rotate()
    .resize(WORK_SIZE, WORK_SIZE, { fit: "inside" })
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const w = info.width;
  const h = info.height;
  const channels = info.channels;
  const px = (x: number, y: number) => (y * w + x) * channels;

  // --- Estimate the background colour from the frame border ---
  const samples: number[][] = [];
  for (let x = 0; x < w; x++) {
    samples.push([data[px(x, 0)]!, data[px(x, 0) + 1]!, data[px(x, 0) + 2]!]);
    samples.push([data[px(x, h - 1)]!, data[px(x, h - 1) + 1]!, data[px(x, h - 1) + 2]!]);
  }
  for (let y = 0; y < h; y++) {
    samples.push([data[px(0, y)]!, data[px(0, y) + 1]!, data[px(0, y) + 2]!]);
    samples.push([data[px(w - 1, y)]!, data[px(w - 1, y) + 1]!, data[px(w - 1, y) + 2]!]);
  }
  const median = (idx: number) => {
    const vals = samples.map((s) => s[idx]!).sort((a, b) => a - b);
    return vals[Math.floor(vals.length / 2)]!;
  };
  const bgR = median(0);
  const bgG = median(1);
  const bgB = median(2);

  // If the border itself is highly varied, the background is cluttered.
  const spread =
    samples.reduce((acc, s) => {
      const dr = s[0]! - bgR;
      const dg = s[1]! - bgG;
      const db = s[2]! - bgB;
      return acc + Math.sqrt(dr * dr + dg * dg + db * db);
    }, 0) / samples.length;
  if (spread > 58) return null;

  // --- Flood fill inward from every border pixel ---
  const isBackground = new Uint8Array(w * h);
  const queue: number[] = [];

  const push = (x: number, y: number) => {
    const flat = y * w + x;
    if (isBackground[flat]) return;
    if (colourDistance(data, px(x, y), bgR, bgG, bgB) > TOLERANCE) return;
    isBackground[flat] = 1;
    queue.push(flat);
  };

  for (let x = 0; x < w; x++) {
    push(x, 0);
    push(x, h - 1);
  }
  for (let y = 0; y < h; y++) {
    push(0, y);
    push(w - 1, y);
  }

  while (queue.length) {
    const flat = queue.pop()!;
    const x = flat % w;
    const y = (flat - x) / w;
    if (x > 0) push(x - 1, y);
    if (x < w - 1) push(x + 1, y);
    if (y > 0) push(x, y - 1);
    if (y < h - 1) push(x, y + 1);
  }

  // --- Build the mask and sanity-check it ---
  const small = Buffer.alloc(w * h);
  let product = 0;
  for (let i = 0; i < w * h; i++) {
    const keep = isBackground[i] ? 0 : 255;
    small[i] = keep;
    if (keep) product++;
  }
  const productRatio = product / (w * h);
  if (productRatio < MIN_PRODUCT_RATIO || productRatio > MAX_PRODUCT_RATIO) return null;

  // Scale the mask up FIRST, then soften. Blurring at 320px and enlarging
  // afterwards leaves visible stair-stepping on curved edges.
  const mask = await sharp(small, { raw: { width: w, height: h, channels: 1 } })
    .resize(fullW, fullH, { fit: "fill", kernel: "cubic" })
    .blur(Math.max(0.8, Math.max(fullW, fullH) / 700))
    .toColourspace("b-w")
    .raw()
    .toBuffer();

  return { mask, width: fullW, height: fullH, productRatio };
}

/**
 * Applies the mask as an alpha channel, producing a PNG cutout.
 *
 * The RGBA buffer is assembled explicitly rather than via joinChannel, which
 * silently produced a 3-channel image on this sharp build.
 */
export async function applyMask(input: Buffer, seg: SegmentResult): Promise<Buffer> {
  const { data } = await sharp(input)
    .rotate()
    .resize(seg.width, seg.height, { fit: "fill" })
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const pixels = seg.width * seg.height;
  const rgba = Buffer.allocUnsafe(pixels * 4);
  for (let i = 0; i < pixels; i++) {
    rgba[i * 4] = data[i * 3]!;
    rgba[i * 4 + 1] = data[i * 3 + 1]!;
    rgba[i * 4 + 2] = data[i * 3 + 2]!;
    rgba[i * 4 + 3] = seg.mask[i]!;
  }

  return sharp(rgba, { raw: { width: seg.width, height: seg.height, channels: 4 } })
    .png()
    .toBuffer();
}
