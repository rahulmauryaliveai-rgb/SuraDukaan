import "server-only";
import sharp from "sharp";
import { segmentProduct, applyMask } from "@/lib/ai/segment";

/**
 * Phase 1 — photo clean-up.
 *
 * This is deliberately NOT generative. The seller's product pixels are never
 * redrawn, only corrected and re-framed, so an enhanced photo can never
 * misrepresent what the customer will receive.
 *
 * Two stages:
 *   1. Optional background removal (pluggable provider).
 *   2. Studio finishing with sharp — always runs, needs no external service.
 */

export interface EnhanceOptions {
  /** Output edge length in pixels. */
  size?: number;
  /** Backdrop behind the product. */
  backdrop?: BackdropId;
  /** Skip background removal even when a provider is configured. */
  keepBackground?: boolean;
}

export interface EnhanceResult {
  buffer: Buffer;
  format: "jpeg";
  width: number;
  height: number;
  /** Whether the background was actually cut out. */
  backgroundRemoved: boolean;
  provider: string;
}

export type BackdropId = "studio" | "warm" | "cool" | "white" | "charcoal";

const BACKDROPS: Record<BackdropId, { top: string; bottom: string; shadow: string }> = {
  studio: { top: "#ffffff", bottom: "#e9edf2", shadow: "#9aa4b0" },
  warm: { top: "#fffdf8", bottom: "#f2e6d6", shadow: "#b9a68f" },
  cool: { top: "#f7fbfd", bottom: "#dce8f0", shadow: "#94a8b6" },
  white: { top: "#ffffff", bottom: "#ffffff", shadow: "#b8bfc7" },
  charcoal: { top: "#2a2d31", bottom: "#141618", shadow: "#000000" },
};

const DEFAULT_SIZE = 1200;
/** Product occupies this share of the canvas; the rest is breathing room. */
const PRODUCT_SCALE = 0.82;
/** Mean channel value we nudge a photo towards. */
const TARGET_LUMA = 148;

/**
 * Gentle exposure lift measured from the photo itself.
 *
 * sharp's normalise() stretches every channel to the full range, which on a
 * flat product photo (one colour on one backdrop) drags the product towards
 * black and the backdrop towards white — it "fixes" the photo into something
 * the seller never sold. Nudging the mean towards a target instead can lighten
 * a dim shot without ever distorting the product's real colour.
 */
async function exposureFactor(image: Buffer): Promise<number> {
  try {
    const rgb = (await sharp(image).stats()).channels.slice(0, 3);
    if (rgb.length < 3) return 1;
    const mean = rgb.reduce((acc, c) => acc + c.mean, 0) / rgb.length;
    if (mean <= 1) return 1;
    return Math.min(1.45, Math.max(0.95, TARGET_LUMA / mean));
  } catch {
    return 1;
  }
}

/* ------------------------------------------------------------------ */
/* Background removal providers                                        */
/* ------------------------------------------------------------------ */

export interface BackgroundRemover {
  readonly name: string;
  /** Returns a PNG with transparency, or null if it could not run. */
  cutout(input: Buffer): Promise<Buffer | null>;
}

/** No-op: keeps the original background. Always available. */
class NoopRemover implements BackgroundRemover {
  readonly name = "none";
  async cutout(): Promise<Buffer | null> {
    return null;
  }
}

/** remove.bg — highest quality, paid per image. */
class RemoveBgRemover implements BackgroundRemover {
  readonly name = "removebg";
  constructor(private apiKey: string) {}

  async cutout(input: Buffer): Promise<Buffer | null> {
    try {
      const form = new FormData();
      form.append("image_file", new Blob([new Uint8Array(input)]), "product.jpg");
      form.append("size", "auto");
      form.append("format", "png");

      const res = await fetch("https://api.remove.bg/v1.0/removebg", {
        method: "POST",
        headers: { "X-Api-Key": this.apiKey },
        body: form,
      });
      if (!res.ok) return null;
      return Buffer.from(await res.arrayBuffer());
    } catch {
      return null;
    }
  }
}

/**
 * Self-hosted cutout service (e.g. rembg or BiRefNet behind a small HTTP
 * wrapper). Costs nothing per image once running — the cheapest option at
 * scale. Expects POST multipart "file" → PNG with alpha.
 */
class SelfHostedRemover implements BackgroundRemover {
  readonly name = "selfhosted";
  constructor(private endpoint: string) {}

  async cutout(input: Buffer): Promise<Buffer | null> {
    try {
      const form = new FormData();
      form.append("file", new Blob([new Uint8Array(input)]), "product.jpg");
      const res = await fetch(this.endpoint, { method: "POST", body: form });
      if (!res.ok) return null;
      return Buffer.from(await res.arrayBuffer());
    } catch {
      return null;
    }
  }
}

/**
 * Built-in segmentation. Free, offline, and refuses rather than guessing when
 * the background is too busy — see lib/ai/segment.ts.
 */
class BuiltInRemover implements BackgroundRemover {
  readonly name = "builtin";
  async cutout(input: Buffer): Promise<Buffer | null> {
    try {
      const seg = await segmentProduct(input);
      if (!seg) return null;
      return await applyMask(input, seg);
    } catch {
      return null;
    }
  }
}

export function getBackgroundRemover(): BackgroundRemover {
  const provider = process.env.BG_REMOVAL_PROVIDER ?? "builtin";
  if (provider === "removebg" && process.env.REMOVEBG_API_KEY) {
    return new RemoveBgRemover(process.env.REMOVEBG_API_KEY);
  }
  if (provider === "selfhosted" && process.env.BG_REMOVAL_ENDPOINT) {
    return new SelfHostedRemover(process.env.BG_REMOVAL_ENDPOINT);
  }
  if (provider === "none") return new NoopRemover();
  return new BuiltInRemover();
}

/* ------------------------------------------------------------------ */
/* Studio finishing                                                    */
/* ------------------------------------------------------------------ */

/** Vertical gradient backdrop with a soft elliptical contact shadow. */
function backdropSvg(size: number, backdrop: BackdropId): Buffer {
  const c = BACKDROPS[backdrop];
  const shadowY = Math.round(size * 0.86);
  const shadowRx = Math.round(size * 0.3);
  const shadowRy = Math.round(size * 0.035);

  return Buffer.from(`
    <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="${c.top}"/>
          <stop offset="100%" stop-color="${c.bottom}"/>
        </linearGradient>
        <radialGradient id="sh">
          <stop offset="0%" stop-color="${c.shadow}" stop-opacity="0.38"/>
          <stop offset="70%" stop-color="${c.shadow}" stop-opacity="0.12"/>
          <stop offset="100%" stop-color="${c.shadow}" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <rect width="${size}" height="${size}" fill="url(#bg)"/>
      <ellipse cx="${size / 2}" cy="${shadowY}" rx="${shadowRx}" ry="${shadowRy}" fill="url(#sh)"/>
    </svg>
  `);
}

/**
 * Trims fully transparent margins so a cut-out product fills the frame
 * consistently regardless of how much empty space the seller's photo had.
 */
async function trimTransparent(png: Buffer): Promise<Buffer> {
  try {
    return await sharp(png).trim({ threshold: 1 }).png().toBuffer();
  } catch {
    return png;
  }
}

/**
 * Corrects a phone photo and places it on a clean backdrop.
 * Never alters the product itself beyond exposure, colour and sharpness.
 */
export async function enhanceProductPhoto(
  input: Buffer,
  options: EnhanceOptions = {},
): Promise<EnhanceResult> {
  const size = options.size ?? DEFAULT_SIZE;
  const backdrop = options.backdrop ?? "studio";

  // Measured on the original frame — the cut-out still carries the old
  // background pixels underneath its transparency, so it would skew the mean.
  const brightness = await exposureFactor(input);

  // 1. Background removal, if a provider is configured.
  let working = input;
  let backgroundRemoved = false;
  let provider = "sharp";

  if (!options.keepBackground) {
    const remover = getBackgroundRemover();
    if (remover.name !== "none") {
      const cutout = await remover.cutout(input);
      if (cutout) {
        working = await trimTransparent(cutout);
        backgroundRemoved = true;
        provider = `sharp+${remover.name}`;
      }
    }
  }

  // 2a. No clean cutout — correct the photo and crop it square.
  //     We deliberately do NOT paste it on a fake backdrop: a dark phone photo
  //     letterboxed onto white looks worse than the original.
  if (!backgroundRemoved) {
    const buffer = await sharp(working)
      .rotate() // honour EXIF orientation from phone cameras
      .modulate({ saturation: 1.06, brightness })
      .sharpen({ sigma: 1.1 })
      .resize(size, size, { fit: "cover", position: sharp.strategy.attention })
      .jpeg({ quality: 86, mozjpeg: true })
      .toBuffer();

    return { buffer, format: "jpeg", width: size, height: size, backgroundRemoved: false, provider };
  }

  // 2b. Clean cutout — correct it, then place on a studio backdrop.
  const target = Math.round(size * PRODUCT_SCALE);

  const corrected = await sharp(working)
    .rotate()
    .modulate({ saturation: 1.08, brightness })
    .sharpen({ sigma: 1.1 })
    .resize(target, target, {
      fit: "inside",
      withoutEnlargement: false,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toBuffer();

  // 3. Compose onto the backdrop, product sitting slightly above centre.
  const meta = await sharp(corrected).metadata();
  const left = Math.round((size - (meta.width ?? target)) / 2);
  const top = Math.round((size - (meta.height ?? target)) / 2 - size * 0.02);

  const buffer = await sharp(backdropSvg(size, backdrop))
    .composite([{ input: corrected, left: Math.max(0, left), top: Math.max(0, top) }])
    .jpeg({ quality: 86, mozjpeg: true })
    .toBuffer();

  return { buffer, format: "jpeg", width: size, height: size, backgroundRemoved, provider };
}

/** Small side-by-side preview so the seller can judge the change quickly. */
export async function makeComparisonThumb(
  before: Buffer,
  after: Buffer,
  height = 320,
): Promise<Buffer> {
  const half = Math.round(height * 0.75);
  const [b, a] = await Promise.all([
    sharp(before).rotate().resize(half, height, { fit: "cover" }).toBuffer(),
    sharp(after).resize(half, height, { fit: "cover" }).toBuffer(),
  ]);

  return sharp({
    create: { width: half * 2 + 8, height, channels: 3, background: "#ffffff" },
  })
    .composite([
      { input: b, left: 0, top: 0 },
      { input: a, left: half + 8, top: 0 },
    ])
    .jpeg({ quality: 82 })
    .toBuffer();
}
