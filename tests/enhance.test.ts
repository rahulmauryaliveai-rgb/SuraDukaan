import { describe, it, expect } from "vitest";
import sharp from "sharp";
import { segmentProduct, applyMask } from "@/lib/ai/segment";
import { enhanceProductPhoto } from "@/lib/ai/enhance";

/**
 * These run against generated photos rather than fixtures so the suite stays
 * fast and the repo stays small. The shapes mimic what sellers actually send:
 * one object, roughly centred, on a fairly plain background.
 */

async function photo(opts: {
  bg: string;
  fg: string;
  width?: number;
  height?: number;
  /** Product radius as a share of the short edge. */
  radius?: number;
  noise?: boolean;
}): Promise<Buffer> {
  const w = opts.width ?? 800;
  const h = opts.height ?? 800;
  const r = Math.round((Math.min(w, h) / 2) * (opts.radius ?? 0.45));
  const svg = `<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
    <rect width="${w}" height="${h}" fill="${opts.bg}"/>
    <circle cx="${w / 2}" cy="${h / 2}" r="${r}" fill="${opts.fg}"/>
  </svg>`;
  let img = sharp(Buffer.from(svg));
  if (opts.noise) img = sharp(await img.jpeg({ quality: 40 }).toBuffer());
  return img.jpeg().toBuffer();
}

/**
 * Busy background: a full-bleed patchwork so every frame edge is multi-coloured,
 * which is what a photo taken on a shop counter actually looks like.
 */
async function clutteredPhoto(): Promise<Buffer> {
  const cell = 80;
  const tiles: string[] = [];
  for (let y = 0; y < 800; y += cell) {
    for (let x = 0; x < 800; x += cell) {
      const hue = ((x / cell) * 61 + (y / cell) * 137) % 360;
      tiles.push(`<rect x="${x}" y="${y}" width="${cell}" height="${cell}" fill="hsl(${hue},75%,55%)"/>`);
    }
  }
  const svg = `<svg width="800" height="800" xmlns="http://www.w3.org/2000/svg">
    ${tiles.join("")}<circle cx="400" cy="400" r="150" fill="#222"/>
  </svg>`;
  return sharp(Buffer.from(svg)).jpeg().toBuffer();
}

/** Product cropped so tightly there is barely any background left. */
async function fillsFramePhoto(): Promise<Buffer> {
  const svg = `<svg width="800" height="800" xmlns="http://www.w3.org/2000/svg">
    <rect width="800" height="800" fill="#c9bda4"/>
    <rect x="6" y="6" width="788" height="788" rx="10" fill="#7a2029"/>
  </svg>`;
  return sharp(Buffer.from(svg)).jpeg().toBuffer();
}

describe("segmentProduct", () => {
  it("finds a product on a plain background", async () => {
    const seg = await segmentProduct(await photo({ bg: "#c9bda4", fg: "#7a2029" }));
    expect(seg).not.toBeNull();
    // A circle of radius 0.45*400 covers roughly 16% of an 800x800 frame.
    expect(seg!.productRatio).toBeGreaterThan(0.1);
    expect(seg!.productRatio).toBeLessThan(0.25);
  });

  it("produces a real alpha channel, not an opaque copy", async () => {
    const src = await photo({ bg: "#c9bda4", fg: "#7a2029" });
    const seg = await segmentProduct(src);
    const cut = await applyMask(src, seg!);

    const meta = await sharp(cut).metadata();
    expect(meta.channels).toBe(4);
    expect(meta.hasAlpha).toBe(true);

    // Rendered over magenta, the corners must BE magenta.
    const onMagenta = await sharp({
      create: { width: seg!.width, height: seg!.height, channels: 3, background: "#ff00ff" },
    })
      .composite([{ input: cut }])
      .raw()
      .toBuffer();
    const [r, g, b] = [onMagenta[0]!, onMagenta[1]!, onMagenta[2]!];
    expect(r).toBeGreaterThan(240);
    expect(g).toBeLessThan(15);
    expect(b).toBeGreaterThan(240);
  });

  it("refuses rather than guessing on a cluttered background", async () => {
    expect(await segmentProduct(await clutteredPhoto())).toBeNull();
  });

  it("refuses when the product fills almost the whole frame", async () => {
    expect(await segmentProduct(await fillsFramePhoto())).toBeNull();
  });
});

describe("enhanceProductPhoto", () => {
  it("returns a square jpeg at the requested size", async () => {
    const r = await enhanceProductPhoto(await photo({ bg: "#c9bda4", fg: "#7a2029" }), { size: 600 });
    const meta = await sharp(r.buffer).metadata();
    expect(meta.format).toBe("jpeg");
    expect(meta.width).toBe(600);
    expect(meta.height).toBe(600);
  });

  it("cuts out the background when the photo allows it", async () => {
    const r = await enhanceProductPhoto(await photo({ bg: "#c9bda4", fg: "#7a2029" }));
    expect(r.backgroundRemoved).toBe(true);
    expect(r.provider).toContain("builtin");
  });

  it("still succeeds — without a fake backdrop — on a cluttered photo", async () => {
    const r = await enhanceProductPhoto(await clutteredPhoto(), { size: 600 });
    expect(r.backgroundRemoved).toBe(false);
    expect(r.provider).toBe("sharp");
    expect((await sharp(r.buffer).metadata()).width).toBe(600);
  });

  it("keeps the product's real colour instead of stretching it to black", async () => {
    // A dark red shirt must not come back near-black: sellers would be
    // advertising a product that isn't the one in the box.
    const r = await enhanceProductPhoto(await photo({ bg: "#c9bda4", fg: "#7a2029" }), { size: 400 });
    const { data, info } = await sharp(r.buffer).raw().toBuffer({ resolveWithObject: true });
    const centre = (Math.round(info.height / 2) * info.width + Math.round(info.width / 2)) * info.channels;
    const red = data[centre]!;
    const green = data[centre + 1]!;
    expect(red).toBeGreaterThan(90); // recognisably red, not crushed
    expect(red).toBeGreaterThan(green * 1.8); // hue preserved
  });

  it("honours keepBackground", async () => {
    const r = await enhanceProductPhoto(await photo({ bg: "#c9bda4", fg: "#7a2029" }), {
      size: 400,
      keepBackground: true,
    });
    expect(r.backgroundRemoved).toBe(false);
  });
});
