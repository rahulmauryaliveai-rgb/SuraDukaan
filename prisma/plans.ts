/**
 * Plan catalogue.
 *
 * Every paid plan exists twice — once billed monthly, once billed yearly —
 * sharing a `familyCode` so the pricing page can offer a Monthly/Yearly
 * toggle. Yearly is priced at a ~20% discount ("2 months free").
 *
 * Prices are whole rupees charged per interval:
 *   monthly plan → charged that amount every month
 *   yearly plan  → charged that amount once a year
 */

export interface PlanSeed {
  code: string;
  familyCode: string;
  name: string;
  interval: "MONTHLY" | "YEARLY";
  priceInr: number;
  productLimit: number; // -1 = unlimited
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

/**
 * Old single-price plan codes, retired when monthly/yearly pricing went live.
 * "free" is deliberately absent — that code is reused by the new Free plan.
 */
export const LEGACY_PLAN_CODES = ["starter", "business", "pro"];

export const PLANS: PlanSeed[] = [
  {
    code: "free",
    familyCode: "free",
    name: "Free",
    interval: "YEARLY",
    priceInr: 0,
    productLimit: 20,
    aiEnhanceEnabled: false,
    aiCreditsPerMonth: 0, // 3 lifetime trial credits granted at signup
    hasAnalytics: false,
    hasAdvancedThemes: false,
    hasAi: false,
    hasCustomDomain: false,
    hasStaffAccounts: false,
    removeBranding: false,
    sortOrder: 0,
  },

  // ---------------------------------------------------------------- STARTER
  {
    code: "starter-monthly",
    familyCode: "starter",
    name: "Starter",
    interval: "MONTHLY",
    priceInr: 699,
    productLimit: 100,
    aiEnhanceEnabled: true,
    aiCreditsPerMonth: 5, // taste of generation, drives the upgrade
    hasAnalytics: true,
    hasAdvancedThemes: true,
    hasAi: false,
    hasCustomDomain: false,
    hasStaffAccounts: false,
    removeBranding: false,
    sortOrder: 10,
  },
  {
    code: "starter-yearly",
    familyCode: "starter",
    name: "Starter",
    interval: "YEARLY",
    priceInr: 6588, // ₹549/month
    productLimit: 100,
    aiEnhanceEnabled: true,
    aiCreditsPerMonth: 5,
    hasAnalytics: true,
    hasAdvancedThemes: true,
    hasAi: false,
    hasCustomDomain: false,
    hasStaffAccounts: false,
    removeBranding: false,
    sortOrder: 11,
  },

  // --------------------------------------------------------------- BUSINESS
  {
    code: "business-monthly",
    familyCode: "business",
    name: "Business",
    interval: "MONTHLY",
    priceInr: 1999,
    productLimit: -1,
    aiEnhanceEnabled: true,
    aiCreditsPerMonth: 30,
    hasAnalytics: true,
    hasAdvancedThemes: true,
    hasAi: true,
    hasCustomDomain: true,
    hasStaffAccounts: false,
    removeBranding: true,
    sortOrder: 20,
  },
  {
    code: "business-yearly",
    familyCode: "business",
    name: "Business",
    interval: "YEARLY",
    priceInr: 19188, // ₹1,599/month
    productLimit: -1,
    aiEnhanceEnabled: true,
    aiCreditsPerMonth: 30,
    hasAnalytics: true,
    hasAdvancedThemes: true,
    hasAi: true,
    hasCustomDomain: true,
    hasStaffAccounts: false,
    removeBranding: true,
    sortOrder: 21,
  },

  // -------------------------------------------------------------------- PRO
  {
    code: "pro-monthly",
    familyCode: "pro",
    name: "Pro",
    interval: "MONTHLY",
    priceInr: 4999,
    productLimit: -1,
    aiEnhanceEnabled: true,
    aiCreditsPerMonth: 100,
    hasAnalytics: true,
    hasAdvancedThemes: true,
    hasAi: true,
    hasCustomDomain: true,
    hasStaffAccounts: true,
    removeBranding: true,
    sortOrder: 30,
  },
  {
    code: "pro-yearly",
    familyCode: "pro",
    name: "Pro",
    interval: "YEARLY",
    priceInr: 47988, // ₹3,999/month
    productLimit: -1,
    aiEnhanceEnabled: true,
    aiCreditsPerMonth: 100,
    hasAnalytics: true,
    hasAdvancedThemes: true,
    hasAi: true,
    hasCustomDomain: true,
    hasStaffAccounts: true,
    removeBranding: true,
    sortOrder: 31,
  },
];

/** Credits granted once to a brand-new shop so it can try generation. */
export const TRIAL_CREDITS = 3;

/** Top-up packs. Purchased credits never expire. */
export const CREDIT_PACKS = [
  { code: "pack-25", credits: 25, priceInr: 199 },
  { code: "pack-60", credits: 60, priceInr: 449 },
  { code: "pack-150", credits: 150, priceInr: 999 },
];

/** What each AI operation costs the seller. */
export const CREDIT_COST = {
  ENHANCE: 0,
  GENERATE: 1,
  TRY_ON: 2,
} as const;
