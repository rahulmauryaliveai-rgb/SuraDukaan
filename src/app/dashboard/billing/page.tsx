import type { Metadata } from "next";
import { Check } from "lucide-react";
import { db } from "@/lib/db";
import { requireShop } from "@/lib/auth/session";
import { getActivePlan } from "@/lib/plans";
import { formatINR } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UpgradeButton } from "@/components/dashboard/upgrade-button";

export const metadata: Metadata = { title: "Plan & Billing" };
export const dynamic = "force-dynamic";

function planFeatures(plan: {
  productLimit: number;
  hasAnalytics: boolean;
  hasAdvancedThemes: boolean;
  hasAi: boolean;
  hasCustomDomain: boolean;
  hasStaffAccounts: boolean;
  removeBranding: boolean;
}): string[] {
  return [
    plan.productLimit < 0 ? "Unlimited products" : `${plan.productLimit} products`,
    "Shop URL + QR code",
    "WhatsApp orders",
    ...(plan.hasAnalytics ? ["Analytics"] : []),
    ...(plan.hasAdvancedThemes ? ["Advanced customization"] : []),
    ...(plan.hasAi ? ["AI tools"] : []),
    ...(plan.hasCustomDomain ? ["Custom domain support"] : []),
    ...(plan.removeBranding ? ["Remove SURA SHOP branding"] : []),
    ...(plan.hasStaffAccounts ? ["Staff accounts", "Priority support"] : []),
  ];
}

export default async function BillingPage({
  searchParams,
}: {
  searchParams: Promise<{ limit?: string }>;
}) {
  const { shop } = await requireShop();
  const { limit } = await searchParams;
  const [plans, activePlan, productCount] = await Promise.all([
    db.plan.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } }),
    getActivePlan(shop.id),
    db.product.count({ where: { shopId: shop.id, deletedAt: null } }),
  ]);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold">Plan &amp; Billing</h1>
        <p className="mt-1 text-sm text-ink-500">
          You are on the <strong>{activePlan.name}</strong> plan
          {activePlan.productLimit > 0 && <> · {productCount}/{activePlan.productLimit} products used</>}
        </p>
      </div>

      {limit && (
        <Card className="border-amber-200 bg-amber-50 p-4">
          <p className="text-sm font-medium text-amber-900">
            You&apos;ve reached your {activePlan.name} plan limit. Upgrade to keep adding products.
          </p>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {plans.map((plan) => {
          const isCurrent = plan.id === activePlan.id;
          return (
            <Card key={plan.id} className={isCurrent ? "border-brand-600 ring-1 ring-brand-600" : ""}>
              <CardContent className="flex h-full flex-col p-5">
                <div className="flex items-center justify-between">
                  <h2 className="font-bold">{plan.name}</h2>
                  {isCurrent && <Badge tone="brand">Current</Badge>}
                </div>
                <p className="mt-2">
                  <span className="text-2xl font-extrabold">{formatINR(plan.priceInr)}</span>
                  {plan.priceInr > 0 && <span className="text-sm text-ink-500">/year</span>}
                </p>
                <ul className="mt-4 flex-1 space-y-1.5">
                  {planFeatures(plan).map((f) => (
                    <li key={f} className="flex items-start gap-1.5 text-sm text-ink-700">
                      <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" /> {f}
                    </li>
                  ))}
                </ul>
                <div className="mt-5">
                  {isCurrent ? (
                    <p className="text-center text-sm font-medium text-ink-500">Your plan</p>
                  ) : plan.priceInr === 0 ? (
                    <p className="text-center text-sm text-ink-500">Default plan</p>
                  ) : (
                    <UpgradeButton planCode={plan.code} planName={plan.name} />
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
      <p className="text-xs text-ink-500">
        Payments are processed securely via Razorpay. In development (no keys configured) upgrades
        are simulated in sandbox mode.
      </p>
    </div>
  );
}
