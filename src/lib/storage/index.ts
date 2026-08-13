import "server-only";
import { mkdir, writeFile, unlink } from "fs/promises";
import path from "path";
import { randomBytes } from "crypto";

/** File storage abstraction: local disk for dev, S3/R2-compatible for production. */

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

class LocalStorageProvider implements StorageProvider {
  private dir = path.join(process.cwd(), "public", "uploads");
  async save(buffer: Buffer, ext: string): Promise<string> {
    await mkdir(this.dir, { recursive: true });
    const name = `${Date.now()}-${randomBytes(6).toString("hex")}.${ext}`;
    await writeFile(path.join(this.dir, name), buffer);
    return `/uploads/${name}`;
  }
  async remove(url: string): Promise<void> {
    if (!url.startsWith("/uploads/")) return;
    const file = path.join(this.dir, path.basename(url));
    try {
      await unlink(file);
    } catch {
      /* already gone */
    }
  }
}

class S3StorageProvider implements StorageProvider {
  // Production: implement with @aws-sdk/client-s3 against STORAGE_ENDPOINT
  // (Cloudflare R2 / S3). Kept behind the same interface.
  async save(): Promise<string> {
    throw new Error("S3 storage not configured. Set STORAGE_* env vars and install @aws-sdk/client-s3.");
  }
  async remove(): Promise<void> {}
}

export function getStorage(): StorageProvider {
  return (process.env.STORAGE_PROVIDER ?? "local") === "s3"
    ? new S3StorageProvider()
    : new LocalStorageProvider();
}
