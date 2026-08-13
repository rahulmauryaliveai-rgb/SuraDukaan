import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/session";
import { ok, fail, handleApiError } from "@/lib/api";

const patchSchema = z.object({
  shopId: z.string().min(1),
  action: z.enum(["suspend", "activate", "delete"]),
});

export async function PATCH(req: Request) {
  try {
    const admin = await requireAdmin();
    const { shopId, action } = patchSchema.parse(await req.json());
    const shop = await db.shop.findUnique({ where: { id: shopId } });
    if (!shop) return fail("Shop not found.", 404);

    if (action === "suspend") {
      await db.shop.update({ where: { id: shopId }, data: { status: "SUSPENDED" } });
    } else if (action === "activate") {
      await db.shop.update({ where: { id: shopId }, data: { status: "LIVE" } });
    } else {
      await db.shop.update({ where: { id: shopId }, data: { deletedAt: new Date(), status: "SUSPENDED" } });
    }
    await db.auditLog.create({
      data: { userId: admin.id, shopId, action: `admin.shop.${action}`, entity: "Shop", entityId: shopId },
    });
    return ok({ done: true });
  } catch (err) {
    return handleApiError(err);
  }
}
