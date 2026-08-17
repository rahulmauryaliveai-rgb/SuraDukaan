import "server-only";
import { mkdir, writeFile, unlink, readFile } from "fs/promises";
import path from "path";
import { randomBytes } from "crypto";

/**
 * File storage abstraction.
 *   local  → disk (development)
 *   blob   → Vercel Blob (production on Vercel; token auto-injected)
 *   s3     → S3 / Cloudflare R2 compatible
 */

export interface StorageProvider {
  save(buffer: Buffer, ext: string): Promise<string>; // returns public URL/path
  remove(url: string): Promise<void>;
}

const ALLOWED_MIME: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};
export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

export function extForMime(mime: string): string | null {
  return ALLOWED_MIME[mime] ?? null;
}

function randomName(ext: string): string {
  return `${Date.now()}-${randomBytes(6).toString("hex")}.${ext}`;
}

/** Where locally stored uploads live on disk. */
export const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

/** Path prefix that serves those files. See app/api/files/[name]/route.ts. */
export const LOCAL_URL_PREFIX = "/api/files/";

/** Older rows still point straight at the public directory. */
const LEGACY_URL_PREFIX = "/uploads/";

/** True for any url this app stores locally, new or legacy. */
export function isLocalUrl(url: string): boolean {
  return url.startsWith(LOCAL_URL_PREFIX) || url.startsWith(LEGACY_URL_PREFIX);
}

class LocalStorageProvider implements StorageProvider {
  async save(buffer: Buffer, ext: string): Promise<string> {
    await mkdir(UPLOAD_DIR, { recursive: true });
    const name = randomName(ext);
    await writeFile(path.join(UPLOAD_DIR, name), buffer);
    // Deliberately NOT `/uploads/${name}`. Next.js indexes the public directory
    // when the server boots, so a file written at runtime 404s until restart.
    return `${LOCAL_URL_PREFIX}${name}`;
  }
  async remove(url: string): Promise<void> {
    if (!isLocalUrl(url)) return;
    try {
      await unlink(path.join(UPLOAD_DIR, path.basename(url)));
    } catch {
      /* already gone */
    }
  }
}

/** Vercel Blob — imported lazily so local dev never needs the package. */
class VercelBlobProvider implements StorageProvider {
  async save(buffer: Buffer, ext: string): Promise<string> {
    const { put } = await import("@vercel/blob");
    const contentType =
      ext === "png" ? "image/png" : ext === "webp" ? "image/webp" : "image/jpeg";
    const result = await put(`products/${randomName(ext)}`, buffer, {
      access: "public",
      contentType,
      addRandomSuffix: false,
    });
    return result.url;
  }
  async remove(url: string): Promise<void> {
    try {
      const { del } = await import("@vercel/blob");
      await del(url);
    } catch {
      /* non-fatal */
    }
  }
}

class S3StorageProvider implements StorageProvider {
  // Cloudflare R2 / S3: install @aws-sdk/client-s3 and implement with STORAGE_* env vars.
  async save(): Promise<string> {
    throw new Error("S3 storage not configured. Set STORAGE_* env vars and install @aws-sdk/client-s3.");
  }
  async remove(): Promise<void> {}
}

/**
 * Reads back a file this app previously stored.
 *
 * Deliberately strict about what it will open: a local `/uploads/` path is read
 * straight off disk (never over HTTP), and a remote URL must live on our own
 * blob host. An arbitrary URL from the client is refused, so this can't be used
 * to make the server fetch internal addresses on someone else's behalf.
 */
export async function readStored(url: string): Promise<Buffer | null> {
  if (isLocalUrl(url)) {
    const prefix = url.startsWith(LOCAL_URL_PREFIX) ? LOCAL_URL_PREFIX : LEGACY_URL_PREFIX;
    const name = path.basename(url);
    // basename() already strips traversal, but be explicit about it.
    if (name !== url.slice(prefix.length)) return null;
    try {
      return await readFile(path.join(UPLOAD_DIR, name));
    } catch {
      return null;
    }
  }

  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return null;
  }
  if (parsed.protocol !== "https:") return null;
  if (!parsed.hostname.endsWith(".public.blob.vercel-storage.com")) return null;

  try {
    const res = await fetch(parsed.toString());
    if (!res.ok) return null;
    const buf = Buffer.from(await res.arrayBuffer());
    return buf.length > MAX_UPLOAD_BYTES ? null : buf;
  } catch {
    return null;
  }
}

export function getStorage(): StorageProvider {
  switch (process.env.STORAGE_PROVIDER) {
    case "blob":
      return new VercelBlobProvider();
    case "s3":
      return new S3StorageProvider();
    default:
      return new LocalStorageProvider();
  }
}
