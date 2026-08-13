import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/session";
import { ok, fail, handleApiError } from "@/lib/api";

const patchSchema = z.object({
  userId: z.string().min(1),
  action: z.enum(["suspend", "activate", "delete"]),
});

export async function PATCH(req: Request) {
  try {
    const admin = await requireAdmin();
    const { userId, action } = patchSchema.parse(await req.json());
    if (userId === admin.id) return fail("You cannot modify your own account.", 400);

    const user = await db.user.findUnique({ where: { id: userId } });
    if (!user) return fail("User not found.", 404);

    if (action === "suspend") {
      await db.user.update({ where: { id: userId }, data: { isActive: false } });
      await db.shop.updateMany({
        where: { members: { some: { userId, role: "SHOP_OWNER" } } },
        data: { status: "SUSPENDED" },
      });
    } else if (action === "activate") {
      await db.user.update({ where: { id: userId }, data: { isActive: true } });
      await db.shop.updateMany({
        where: { members: { some: { userId, role: "SHOP_OWNER" } }, status: "SUSPENDED" },
        data: { status: "LIVE" },
      });
    } else {
      // Soft delete.
      await db.user.update({
        where: { id: userId },
        data: { deletedAt: new Date(), isActive: false },
      });
    }
    await db.auditLog.create({
      data: { userId: admin.id, action: `admin.user.${action}`, entity: "User", entityId: userId },
    });
    return ok({ done: true });
  } catch (err) {
    return handleApiError(err);
  }
}
