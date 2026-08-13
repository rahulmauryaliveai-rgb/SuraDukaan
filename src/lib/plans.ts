import "server-only";
import { db } from "@/lib/db";
import { checkProductLimit } from "@/lib/plans-core";

export { checkProductLimit };

/**
 * Central feature gating. Plan limits live in the database (admin-editable),
 * never hard-coded across the app.
 */

export async function getActivePlan(shopId: string) {
  const sub = await db.subscription.findFirst({
    where: {
      shopId,
      status: "ACTIVE",
      OR: [{ endsAt: null }, { endsAt: { gt: new Date() } }],
    },
    include: { plan: true },
    orderBy: { createdAt: "desc" },
  });
  if (sub) return sub.plan;
  // Fall back to the free plan.
  const free = await db.plan.findUnique({ where: { code: "free" } });
  if (!free) throw new Error("Free plan missing — run the database seed.");
  return free;
}

export async function canAddProduct(shopId: string): Promise<{ allowed: boolean; limit: number; used: number; planName: string }> {
  const plan = await getActivePlan(shopId);
  if (plan.productLimit < 0) return { allowed: true, limit: -1, used: 0, planName: plan.name };
  const used = await db.product.count({ where: { shopId, deletedAt: null } });
  return { allowed: used < plan.productLimit, limit: plan.productLimit, used, planName: plan.name };
}

export async function planHas(shopId: string, feature: "hasAnalytics" | "hasAi" | "hasAdvancedThemes" | "hasCustomDomain" | "hasStaffAccounts" | "removeBranding") {
  const plan = await getActivePlan(shopId);
  return plan[feature];
}
