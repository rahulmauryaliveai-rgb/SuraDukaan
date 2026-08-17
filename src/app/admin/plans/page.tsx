import type { Metadata } from "next";
import { db } from "@/lib/db";
import { PlanEditorGrid } from "@/components/admin/plan-editor";

export const metadata: Metadata = { title: "Plans — Admin" };
export const dynamic = "force-dynamic";

export default async function AdminPlansPage() {
  const plans = await db.plan.findMany({
    orderBy: { sortOrder: "asc" },
    include: { _count: { select: { subscriptions: { where: { status: "ACTIVE" } } } } },
  });

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold">Plans</h1>
        <p className="mt-1 text-sm text-ink-500">
          Edit pricing, limits and features directly — changes apply to the pricing page and
          product-limit gating immediately. Shops already subscribed keep their plan until renewal.
        </p>
      </div>
      <PlanEditorGrid
        plans={plans.map((p) => ({
          id: p.id,
          code: p.code,
          name: p.name,
          familyCode: p.familyCode,
          interval: p.interval,
          priceInr: p.priceInr,
          aiEnhanceEnabled: p.aiEnhanceEnabled,
          aiCreditsPerMonth: p.aiCreditsPerMonth,
          productLimit: p.productLimit,
          hasAnalytics: p.hasAnalytics,
          hasAdvancedThemes: p.hasAdvancedThemes,
          hasAi: p.hasAi,
          hasCustomDomain: p.hasCustomDomain,
          hasStaffAccounts: p.hasStaffAccounts,
          removeBranding: p.removeBranding,
          isActive: p.isActive,
          sortOrder: p.sortOrder,
          activeSubscriptions: p._count.subscriptions,
        }))}
      />
    </div>
  );
}
