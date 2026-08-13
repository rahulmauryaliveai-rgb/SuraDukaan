import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/session";
import { ok, fail, handleApiError } from "@/lib/api";

const planSchema = z.object({
  id: z.string().optional(),
  code: z.string().trim().min(2).max(30).regex(/^[a-z0-9-]+$/),
  name: z.string().trim().min(2).max(40),
  priceInr: z.coerce.number().int().min(0),
  productLimit: z.coerce.number().int().min(-1),
  hasAnalytics: z.boolean().optional(),
  hasAdvancedThemes: z.boolean().optional(),
  hasAi: z.boolean().optional(),
  hasCustomDomain: z.boolean().optional(),
  hasStaffAccounts: z.boolean().optional(),
  removeBranding: z.boolean().optional(),
  isActive: z.boolean().optional(),
  sortOrder: z.coerce.number().int().min(0).optional(),
});

export async function POST(req: Request) {
  try {
    const admin = await requireAdmin();
    const input = planSchema.parse(await req.json());
    const { id, ...data } = input;

    const plan = id
      ? await db.plan.update({ where: { id }, data })
      : await db.plan.create({ data });

    await db.auditLog.create({
      data: { userId: admin.id, action: id ? "admin.plan.update" : "admin.plan.create", entity: "Plan", entityId: plan.id },
    });
    return ok({ plan });
  } catch (err) {
    if (err instanceof Error && err.message.includes("Unique constraint")) {
      return fail("A plan with this code already exists.", 409);
    }
    return handleApiError(err);
  }
}
