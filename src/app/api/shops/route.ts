import { db } from "@/lib/db";
import { requireUser, requireShop } from "@/lib/auth/session";
import { shopCreateSchema, shopUpdateSchema } from "@/lib/validation";
import { isValidSlug } from "@/lib/slug";
import { ok, fail, handleApiError } from "@/lib/api";

/** Create the user's shop (one shop per owner in V1). */
export async function POST(req: Request) {
  try {
    const user = await requireUser();
    const existing = await db.shopMember.findFirst({ where: { userId: user.id } });
    if (existing) return fail("You already have a shop.", 409);

    const input = shopCreateSchema.parse(await req.json());
    if (!isValidSlug(input.slug)) return fail("This shop URL is not allowed.", 422);

    const taken = await db.shop.findUnique({ where: { slug: input.slug } });
    if (taken) return fail("This shop URL is already taken.", 409);

    const shop = await db.shop.create({
      data: {
        slug: input.slug,
        name: input.name,
        category: input.category,
        city: input.city || null,
        whatsapp: input.whatsapp,
        members: { create: { userId: user.id, role: "SHOP_OWNER" } },
        theme: { create: { template: input.template } },
      },
    });

    await db.user.update({ where: { id: user.id }, data: { onboardedAt: new Date() } });
    await db.auditLog.create({
      data: { userId: user.id, shopId: shop.id, action: "shop.create", entity: "Shop", entityId: shop.id },
    });

    return ok({ shopId: shop.id, slug: shop.slug });
  } catch (err) {
    return handleApiError(err);
  }
}

/** Update the current user's shop (tenant derived from session). */
export async function PATCH(req: Request) {
  try {
    const { shop, memberRole } = await requireShop();
    if (memberRole === "STAFF") return fail("Staff cannot edit shop settings.", 403);

    const input = shopUpdateSchema.parse(await req.json());
    const data = Object.fromEntries(
      Object.entries(input).map(([k, v]) => [k, v === "" ? null : v]),
    );
    const updated = await db.shop.update({ where: { id: shop.id }, data });
    return ok({ shop: { id: updated.id, slug: updated.slug } });
  } catch (err) {
    return handleApiError(err);
  }
}
