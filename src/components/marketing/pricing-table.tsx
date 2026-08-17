"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, Sparkles } from "lucide-react";
import { formatINR, cn } from "@/lib/utils";

export interface PricingPlan {
  code: string;
  familyCode: string;
  name: string;
  interval: "MONTHLY" | "YEARLY";
  priceInr: number;
  productLimit: number;
  aiEnhanceEnabled: boolean;
  aiCreditsPerMonth: number;
  hasAnalytics: boolean;
  hasAdvancedThemes: boolean;
  hasAi: boolean;
  hasCustomDomain: boolean;
  hasStaffAccounts: boolean;
  removeBranding: boolean;
  sortOrder: number;
}

function features(plan: PricingPlan): string[] {
  return [
    plan.productLimit < 0 ? "Unlimited products" : `${plan.productLimit} products`,
    "Shop link, QR code & WhatsApp orders",
    ...(plan.aiEnhanceEnabled ? ["AI photo clean-up — unlimited"] : []),
    ...(plan.aiCreditsPerMonth > 0
      ? [`${plan.aiCreditsPerMonth} AI image credits every month`]
      : []),
    ...(plan.hasAnalytics ? ["Analytics"] : []),
    ...(plan.hasAdvancedThemes ? ["All 16 storefront themes"] : []),
    ...(plan.hasCustomDomain ? ["Custom domain"] : []),
    ...(plan.removeBranding ? ["Remove SURA SHOP branding"] : []),
    ...(plan.hasStaffAccounts ? ["Staff accounts & priority support"] : []),
  ];
}

export function PricingTable({ plans }: { plans: PricingPlan[] }) {
  const [yearly, setYearly] = useState(true);

  const free = plans.find((p) => p.familyCode === "free");
  const paidFamilies = [...new Set(plans.filter((p) => p.familyCode !== "free").map((p) => p.familyCode))];

  const shown: PricingPlan[] = [
    ...(free ? [free] : []),
    ...paidFamilies
      .map((family) => {
        const wanted = plans.find(
          (p) => p.familyCode === family && p.interval === (yearly ? "YEARLY" : "MONTHLY"),
        );
        return wanted ?? plans.find((p) => p.familyCode === family);
      })
      .filter((p): p is PricingPlan => Boolean(p)),
  ].sort((a, b) => a.sortOrder - b.sortOrder);

  /** Headline figure is always "per month" so tiers compare honestly. */
  function perMonth(plan: PricingPlan): number {
    return plan.interval === "YEARLY" && plan.priceInr > 0 ? Math.round(plan.priceInr / 12) : plan.priceInr;
  }

  function savingPercent(family: string): number | null {
    const m = plans.find((p) => p.familyCode === family && p.interval === "MONTHLY");
    const y = plans.find((p) => p.familyCode === family && p.interval === "YEARLY");
    if (!m || !y || m.priceInr === 0) return null;
    return Math.round((1 - y.priceInr / 12 / m.priceInr) * 100);
  }

  const headlineSaving = savingPercent("business") ?? 20;

  return (
    <>
      {/* Billing toggle */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        <div className="inline-flex rounded-pill bg-soft-100 p-1.5" role="group" aria-label="Billing period">
          {([false, true] as const).map((isYearly) => (
            <button
              key={String(isYearly)}
              type="button"
              onClick={() => setYearly(isYearly)}
              aria-pressed={yearly === isYearly}
              className={cn(
                "rounded-pill px-6 py-2.5 text-sm font-semibold transition duration-300",
                yearly === isYearly ? "bg-deep-800 text-white" : "text-deep-700 hover:bg-white/60",
              )}
            >
              {isYearly ? "Yearly" : "Monthly"}
            </button>
          ))}
        </div>
        <span className="rounded-pill bg-mint-400 px-4 py-1.5 text-sm font-bold text-deep-800">
          {yearly ? `Saving ${headlineSaving}% — about 2 months free` : `Save ${headlineSaving}% yearly`}
        </span>
      </div>

      {/* Plan cards */}
      <div className="mt-10 grid items-start gap-4 md:grid-cols-2 xl:grid-cols-4">
        {shown.map((plan) => {
          const popular = plan.familyCode === "business";
          const monthly = perMonth(plan);
          const isPaid = plan.priceInr > 0;

          return (
            <div
              key={plan.code}
              className={cn(
                "flex flex-col rounded-card border p-8 transition duration-300",
                popular
                  ? "border-deep-800 bg-deep-800 text-white xl:scale-[1.03]"
                  : "border-line-200 bg-white",
              )}
            >
              {popular && (
                <span className="mb-2 self-start text-[11px] font-bold uppercase tracking-[0.08em] text-mint-400">
                  Most popular
                </span>
              )}
              <h3 className={cn("text-xl font-bold", popular ? "text-white" : "text-deep-700")}>
                {plan.name}
              </h3>

              <p className="mt-3">
                <span
                  className={cn(
                    "text-[32px] font-extrabold leading-none",
                    popular ? "text-white" : "text-deep-700",
                  )}
                >
                  {formatINR(monthly)}
                </span>
                {isPaid && (
                  <span className={cn("text-sm", popular ? "text-white/75" : "text-moss-600")}>
                    /month
                  </span>
                )}
              </p>

              <p className={cn("mt-1 text-xs", popular ? "text-white/70" : "text-moss-600")}>
                {!isPaid
                  ? "Free forever"
                  : plan.interval === "YEARLY"
                    ? `${formatINR(plan.priceInr)} billed once a year`
                    : "Billed monthly · cancel anytime"}
              </p>

              {plan.aiCreditsPerMonth > 0 && (
                <p
                  className={cn(
                    "mt-4 inline-flex items-center gap-1.5 self-start rounded-pill px-3 py-1 text-xs font-semibold",
                    popular ? "bg-white/15 text-mint-400" : "bg-soft-100 text-deep-800",
                  )}
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  {plan.aiCreditsPerMonth} AI credits/month
                </p>
              )}

              <ul
                className={cn(
                  "mt-5 flex-1 space-y-2.5 text-sm",
                  popular ? "text-white/90" : "text-moss-600",
                )}
              >
                {features(plan).map((f) => (
                  <li key={f} className="flex gap-2">
                    <Check
                      className={cn(
                        "mt-0.5 h-3.5 w-3.5 shrink-0",
                        popular ? "text-mint-400" : "text-deep-800",
                      )}
                    />
                    {f}
                  </li>
                ))}
              </ul>

              <Link
                href="/register"
                className={cn(
                  "mt-8 rounded-pill px-6 py-3 text-center text-sm font-semibold transition duration-300",
                  popular
                    ? "bg-mint-400 text-deep-800 shadow-raise hover:bg-mint-500"
                    : "border-[1.5px] border-line-200 text-deep-700 hover:bg-soft-50",
                )}
              >
                {isPaid ? "Get started" : "Start free"}
              </Link>
            </div>
          );
        })}
      </div>

      <p className="mt-8 text-center text-xs text-moss-600">
        Prices in INR. AI credits refill on the 1st of each month and don&apos;t carry over.
        Need more? Top-up packs start at ₹199 for 25 credits and never expire.
      </p>
    </>
  );
}
