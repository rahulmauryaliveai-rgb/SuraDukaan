"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, Sparkles } from "lucide-react";
import { formatINR, cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

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
      <div className="mt-8 flex flex-col items-center gap-2">
        <div
          className="inline-flex rounded-full border border-ink-200 bg-white p-1"
          role="group"
          aria-label="Billing period"
        >
          <button
            type="button"
            onClick={() => setYearly(false)}
            aria-pressed={!yearly}
            className={cn(
              "rounded-full px-5 py-2 text-sm font-semibold transition",
              !yearly ? "bg-ink-900 text-white" : "text-ink-700 hover:bg-ink-50",
            )}
          >
            Monthly
          </button>
          <button
            type="button"
            onClick={() => setYearly(true)}
            aria-pressed={yearly}
            className={cn(
              "rounded-full px-5 py-2 text-sm font-semibold transition",
              yearly ? "bg-ink-900 text-white" : "text-ink-700 hover:bg-ink-50",
            )}
          >
            Yearly
          </button>
        </div>
        <p className="text-sm font-medium text-brand-700">
          {yearly ? `You're saving ${headlineSaving}% — about 2 months free` : `Pay yearly and save ${headlineSaving}%`}
        </p>
      </div>

      {/* Plan cards */}
      <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {shown.map((plan) => {
          const popular = plan.familyCode === "business";
          const monthly = perMonth(plan);
          const isPaid = plan.priceInr > 0;

          return (
            <div
              key={plan.code}
              className={cn(
                "flex flex-col rounded-2xl border bg-white p-6",
                popular
                  ? "border-brand-600 shadow-card-hover ring-1 ring-brand-600"
                  : "border-ink-100 shadow-card",
              )}
            >
              {popular && (
                <span className="mb-2 self-start rounded-full bg-brand-700 px-2.5 py-0.5 text-xs font-bold text-white">
                  Most popular
                </span>
              )}
              <h3 className="font-bold">{plan.name}</h3>

              <p className="mt-2">
                <span className="text-3xl font-extrabold">{formatINR(monthly)}</span>
                {isPaid && <span className="text-sm text-ink-500">/month</span>}
              </p>

              {isPaid && (
                <p className="mt-1 text-xs text-ink-500">
                  {plan.interval === "YEARLY"
                    ? `${formatINR(plan.priceInr)} billed once a year`
                    : "Billed monthly · cancel anytime"}
                </p>
              )}
              {!isPaid && <p className="mt-1 text-xs text-ink-500">Free forever</p>}

              {plan.aiCreditsPerMonth > 0 && (
                <p className="mt-3 inline-flex items-center gap-1.5 self-start rounded-full bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-800">
                  <Sparkles className="h-3.5 w-3.5" />
                  {plan.aiCreditsPerMonth} AI credits/month
                </p>
              )}

              <ul className="mt-4 flex-1 space-y-1.5 text-sm text-ink-700">
                {features(plan).map((f) => (
                  <li key={f} className="flex gap-1.5">
                    <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" />
                    {f}
                  </li>
                ))}
              </ul>

              <Link href="/register" className="mt-6">
                <Button variant={popular ? "primary" : "outline"} className="w-full">
                  {isPaid ? "Get Started" : "Start Free"}
                </Button>
              </Link>
            </div>
          );
        })}
      </div>

      <p className="mt-6 text-center text-xs text-ink-500">
        Prices in INR. AI credits refill on the 1st of each month and don&apos;t carry over.
        Need more? Top-up packs start at ₹199 for 25 credits and never expire.
      </p>
    </>
  );
}
