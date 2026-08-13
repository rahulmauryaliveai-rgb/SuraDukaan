import { requireShop } from "@/lib/auth/session";
import { getStorage, extForMime, MAX_UPLOAD_BYTES } from "@/lib/storage";
import { ok, fail, handleApiError } from "@/lib/api";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(req: Request) {
  try {
    const { shop } = await requireShop();
    if (!rateLimit(`upload:${shop.id}`, 60, 60 * 60 * 1000)) {
      return fail("Upload limit reached. Try again later.", 429);
    }
    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File)) return fail("No file provided.");
    if (file.size > MAX_UPLOAD_BYTES) return fail("Image must be under 5 MB.");
    const ext = extForMime(file.type);
    if (!ext) return fail("Only JPG, PNG and WebP images are allowed.");

    const buffer = Buffer.from(await file.arrayBuffer());
    // Basic magic-byte validation on top of MIME.
    const isJpg = buffer[0] === 0xff && buffer[1] === 0xd8;
    const isPng = buffer[0] === 0x89 && buffer[1] === 0x50;
    const isWebp = buffer.subarray(8, 12).toString("ascii") === "WEBP";
    if (!isJpg && !isPng && !isWebp) return fail("File does not look like a valid image.");

    const url = await getStorage().save(buffer, ext);
    return ok({ url });
  } catch (err) {
    return handleApiError(err);
  }
}
