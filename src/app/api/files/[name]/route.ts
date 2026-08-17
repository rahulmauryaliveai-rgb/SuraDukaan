import { readFile } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";
import { UPLOAD_DIR } from "@/lib/storage";

/**
 * Serves locally stored uploads.
 *
 * Next.js maps the `public/` directory once, when the server boots. A photo a
 * shop owner uploads while the server is running is therefore written to disk
 * but returns 404 until the next restart — which is every uploaded photo, on
 * every deploy that keeps files on local disk. Reading the file per request
 * fixes that.
 *
 * In production STORAGE_PROVIDER is `blob` or `s3` and this route is unused;
 * those providers already return absolute CDN urls.
 */

export const runtime = "nodejs";

const CONTENT_TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
};

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ name: string }> },
) {
  const { name } = await params;

  // Only ever a bare filename — no traversal, no dotfiles, no nested paths.
  if (!name || name !== path.basename(name) || name.startsWith(".")) {
    return new NextResponse("Not found", { status: 404 });
  }

  const contentType = CONTENT_TYPES[path.extname(name).toLowerCase()];
  if (!contentType) return new NextResponse("Not found", { status: 404 });

  try {
    const file = await readFile(path.join(UPLOAD_DIR, name));
    return new NextResponse(new Uint8Array(file), {
      headers: {
        "Content-Type": contentType,
        "Content-Length": String(file.length),
        // Names are random and never reused, so these can be cached hard.
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }
}
