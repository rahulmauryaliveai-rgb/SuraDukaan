import { db } from "@/lib/db";
import { slugify, isValidSlug } from "@/lib/slug";
import { ok, handleApiError } from "@/lib/api";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const raw = url.searchParams.get("slug") ?? "";
    const slug = slugify(raw);
    if (!isValidSlug(slug)) {
      return ok({ slug, available: false, reason: "invalid" });
    }
    const existing = await db.shop.findUnique({ where: { slug }, select: { id: true } });
    return ok({ slug, available: !existing, reason: existing ? "taken" : null });
  } catch (err) {
    return handleApiError(err);
  }
}
