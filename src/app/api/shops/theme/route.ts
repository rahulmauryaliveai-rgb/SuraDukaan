import { db } from "@/lib/db";
import { requireShop } from "@/lib/auth/session";
import { themeUpdateSchema } from "@/lib/validation";
import { ok, fail, handleApiError } from "@/lib/api";

export async function PATCH(req: Request) {
  try {
    const { shop, memberRole } = await requireShop();
    if (memberRole === "STAFF") return fail("Staff cannot customize the storefront.", 403);
    const input = themeUpdateSchema.parse(await req.json());
    const theme = await db.shopTheme.upsert({
      where: { shopId: shop.id },
      create: { shopId: shop.id, ...input },
      update: input,
    });
    return ok({ theme });
  } catch (err) {
    return handleApiError(err);
  }
}
