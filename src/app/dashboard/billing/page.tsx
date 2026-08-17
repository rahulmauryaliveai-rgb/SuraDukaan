import type { Metadata } from "next";
import { Check, Sparkles, Wand2 } from "lucide-react";
import { db } from "@/lib/db";
import { requireShop } from "@/lib/auth/session";
import { getActivePlan } from "@/lib/plans";
import { getCreditState, getCreditHistory } from "@/lib/credits";
import { formatINR, formatDate, cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UpgradeButton } from "@/components/dashboard/upgrade-button";

export const metadata: Metadata = { title: "Plan & Billing" };
export const dynamic = "force-dynamic";

interface PlanLike {
  productLimit: number;
  aiEnhanceEnabled: boolean;
  aiCreditsPerMonth: number;
  hasAnalytics: boolean;
  hasAdvancedThemes: boolean;
  hasAi: boolean;
  hasCustomDomain: boolean;
  hasStaffAccounts: boolean;
  removeBranding: boolean;
}

function planFeatures(plan: PlanLike): string[] {
  return [
    plan.productLimit < 0 ? "Unlimited products" : `${plan.productLimit} products`,
    "Shop URL + QR code",
    "WhatsApp orders",
    ...(plan.aiEnhanceEnabled ? ["AI photo clean-up (unlimited)"] : []),
    ...(plan.aiCreditsPerMonth > 0 ? [`${plan.aiCreditsPerMonth} AI credits/month`] : []),
    ...(plan.hasAnalytics ? ["Analytics"] : []),
    ...(plan.hasAdvancedThemes ? ["All storefront themes"] : []),
    ...(plan.hasCustomDomain ? ["Custom domain support"] : []),
    ...(plan.removeBranding ? ["Remove SURA SHOP branding"] : []),
    ...(plan.hasStaffAccounts ? ["Staff accounts", "Priority support"] : []),
  ];
}

const LEDGER_LABEL: Record<string, string> = {
  monthly_grant: "Monthly credits added",
  job_spend: "AI image created",
  job_refund: "Refund — job failed",
  topup_purchase: "Credit pack purchased",
  trial_grant: "Welcome credits",
  admin_adjust: "Adjusted by support",
};

export default async function BillingPage({
  searchParams,
}: {
  searchParams: Promise<{ limit?: string }>;
}) {
  const { shop } = await requireShop();
  const { limit } = await searchParams;

  const [plans, activePlan, productCount, credits, history] = await Promise.all([
    db.plan.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } }),
    getActivePlan(shop.id),
    db.product.count({ where: { shopId: shop.id, deletedAt: null } }),
    getCreditState(shop.id),
    getCreditHistory(shop.id, 10),
  ]);

  // Show one card per plan family, matching the interval the shop is on.
  const families = [...new Set(plans.map((p) => p.familyCode))];
  const visiblePlans = families
    .map((family) => {
      const inFamily = plans.filter((p) => p.familyCode === family);
      return (
        inFamily.find((p) => p.interval === activePlan.interval) ?? inFamily[0]!
      );
    })
    .sort((a, b) => a.sortOrder - b.sortOrder);

  const usedPct =
    credits.creditsPerMonth > 0
      ? Math.round(((credits.creditsPerMonth - credits.allowance) / credits.creditsPerMonth) * 100)
      : 0;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold">Plan &amp; Billing</h1>
        <p className="mt-1 text-sm text-ink-500">
          You are on the <strong>{activePlan.name}</strong> plan
          {activePlan.priceInr > 0 && (
            <> · {formatINR(activePlan.priceInr)} {activePlan.interval === "MONTHLY" ? "per month" : "per year"}</>
          )}
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

      {/* AI credits */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-brand-700" /> AI image credits
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {credits.creditsPerMonth === 0 && credits.topup === 0 ? (
            <p className="text-sm text-ink-500">
              Your plan doesn&apos;t include AI image credits.{" "}
              <span className="font-medium text-ink-700">
                Upgrade to Business for 30 credits every month.
              </span>
            </p>
          ) : (
            <>
              <div className="flex flex-wrap items-end gap-6">
                <div>
                  <p className="text-3xl font-bold">{credits.total}</p>
                  <p className="text-xs text-ink-500">credits available</p>
                </div>
                <div className="text-sm text-ink-700">
                  <p>
                    <span className="font-semibold">{credits.allowance}</span> monthly
                    <span className="text-ink-500"> · refills {formatDate(credits.renewsAt)}</span>
                  </p>
                  <p>
                    <span className="font-semibold">{credits.topup}</span> purchased
                    <span className="text-ink-500"> · never expire</span>
                  </p>
                </div>
              </div>

              {credits.creditsPerMonth > 0 && (
                <div>
                  <div className="h-2 overflow-hidden rounded-full bg-ink-100">
                    <div
                      className="h-2 rounded-full bg-brand-600 transition-all"
                      style={{ width: `${Math.min(100, Math.max(0, 100 - usedPct))}%` }}
                    />
                  </div>
                  <p className="mt-1 text-xs text-ink-500">
                    {credits.allowance} of {credits.creditsPerMonth} monthly credits left
                  </p>
                </div>
              )}
            </>
          )}

          <div className="rounded-xl bg-ink-50 p-3 text-sm text-ink-700">
            <p className="flex items-center gap-1.5 font-medium">
              <Wand2 className="h-4 w-4" /> What credits are for
            </p>
            <ul className="mt-1.5 space-y-0.5 text-ink-500">
              <li>Photo clean-up — background removal &amp; lighting: <strong>free</strong></li>
              <li>New scene, flat-lay or extra angle: <strong>1 credit</strong></li>
              <li>Model try-on photo: <strong>2 credits</strong></li>
            </ul>
          </div>

          {history.length > 0 && (
            <details className="rounded-xl border border-ink-100">
              <summary className="cursor-pointer px-3 py-2 text-sm font-medium">
                Credit history
              </summary>
              <ul className="divide-y divide-ink-100 border-t border-ink-100">
                {history.map((row) => (
                  <li key={row.id} className="flex items-center justify-between px-3 py-2 text-sm">
                    <span className="min-w-0">
                      <span className="block truncate">{LEDGER_LABEL[row.reason] ?? row.reason}</span>
                      <span className="text-xs text-ink-500">{formatDate(row.createdAt)}</span>
                    </span>
                    <span
                      className={cn(
                        "font-semibold tabular-nums",
                        row.delta > 0 ? "text-emerald-700" : "text-ink-700",
                      )}
                    >
                      {row.delta > 0 ? `+${row.delta}` : row.delta}
                    </span>
                  </li>
                ))}
              </ul>
            </details>
          )}
        </CardContent>
      </Card>

      {/* Plans */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {visiblePlans.map((plan) => {
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
                  {plan.priceInr > 0 && (
                    <span className="text-sm text-ink-500">
                      /{plan.interval === "MONTHLY" ? "month" : "year"}
                    </span>
                  )}
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
