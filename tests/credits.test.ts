import { describe, it, expect } from "vitest";
import { planSpend, isRenewalDue, nextRenewalDate, totalCredits } from "@/lib/credits-core";
import { PLANS, LEGACY_PLAN_CODES, CREDIT_COST, CREDIT_PACKS } from "../prisma/plans";

describe("planSpend", () => {
  it("spends the expiring monthly allowance before purchased credits", () => {
    expect(planSpend({ allowance: 10, topup: 50 }, 4)).toEqual({ fromAllowance: 4, fromTopup: 0 });
  });

  it("falls through to top-ups once the allowance runs out", () => {
    expect(planSpend({ allowance: 2, topup: 50 }, 5)).toEqual({ fromAllowance: 2, fromTopup: 3 });
  });

  it("uses top-ups only when there is no allowance left", () => {
    expect(planSpend({ allowance: 0, topup: 10 }, 2)).toEqual({ fromAllowance: 0, fromTopup: 2 });
  });

  it("refuses a spend the shop cannot afford", () => {
    expect(planSpend({ allowance: 1, topup: 1 }, 3)).toBeNull();
    expect(planSpend({ allowance: 0, topup: 0 }, 1)).toBeNull();
  });

  it("allows spending the exact remaining balance", () => {
    expect(planSpend({ allowance: 1, topup: 1 }, 2)).toEqual({ fromAllowance: 1, fromTopup: 1 });
  });

  it("treats a free operation as always affordable", () => {
    expect(planSpend({ allowance: 0, topup: 0 }, 0)).toEqual({ fromAllowance: 0, fromTopup: 0 });
  });

  it("rejects a negative cost", () => {
    expect(() => planSpend({ allowance: 5, topup: 5 }, -1)).toThrow();
  });

  it("totals both buckets", () => {
    expect(totalCredits({ allowance: 7, topup: 3 })).toBe(10);
  });
});

describe("monthly renewal", () => {
  it("is due for a shop that has never been granted credits", () => {
    expect(isRenewalDue(null)).toBe(true);
  });

  it("is not due later in the same month", () => {
    const granted = new Date(Date.UTC(2026, 4, 1));
    expect(isRenewalDue(granted, new Date(Date.UTC(2026, 4, 28)))).toBe(false);
  });

  it("is due in the next month", () => {
    const granted = new Date(Date.UTC(2026, 4, 28));
    expect(isRenewalDue(granted, new Date(Date.UTC(2026, 5, 1)))).toBe(true);
  });

  it("is due across a year boundary", () => {
    const granted = new Date(Date.UTC(2026, 11, 20));
    expect(isRenewalDue(granted, new Date(Date.UTC(2027, 0, 2)))).toBe(true);
  });

  it("points at the first of next month", () => {
    expect(nextRenewalDate(new Date(Date.UTC(2026, 4, 15))).toISOString()).toBe(
      "2026-06-01T00:00:00.000Z",
    );
    // December must roll into next January, not month 13.
    expect(nextRenewalDate(new Date(Date.UTC(2026, 11, 15))).toISOString()).toBe(
      "2027-01-01T00:00:00.000Z",
    );
  });
});

describe("plan catalogue", () => {
  it("has a monthly and a yearly variant for every paid family", () => {
    for (const family of ["starter", "business", "pro"]) {
      const variants = PLANS.filter((p) => p.familyCode === family);
      expect(variants.map((v) => v.interval).sort()).toEqual(["MONTHLY", "YEARLY"]);
    }
  });

  it("uses unique plan codes", () => {
    const codes = PLANS.map((p) => p.code);
    expect(new Set(codes).size).toBe(codes.length);
  });

  it("prices yearly about 20% below monthly", () => {
    for (const family of ["starter", "business", "pro"]) {
      const monthly = PLANS.find((p) => p.familyCode === family && p.interval === "MONTHLY")!;
      const yearly = PLANS.find((p) => p.familyCode === family && p.interval === "YEARLY")!;
      const saving = 1 - yearly.priceInr / 12 / monthly.priceInr;
      expect(saving).toBeGreaterThan(0.18);
      expect(saving).toBeLessThan(0.25);
    }
  });

  it("keeps AI cost under 10% of revenue on every paid plan", () => {
    const COST_PER_CREDIT = 3.5;
    for (const plan of PLANS.filter((p) => p.priceInr > 0)) {
      const perMonth = plan.interval === "YEARLY" ? plan.priceInr / 12 : plan.priceInr;
      const aiCost = plan.aiCreditsPerMonth * COST_PER_CREDIT;
      expect(aiCost / perMonth).toBeLessThan(0.1);
    }
  });

  it("grants no credits and no AI on the free plan", () => {
    const free = PLANS.find((p) => p.code === "free")!;
    expect(free.aiCreditsPerMonth).toBe(0);
    expect(free.hasAi).toBe(false);
  });

  it("gives higher tiers at least as many credits as lower ones", () => {
    const credits = (f: string) =>
      PLANS.find((p) => p.familyCode === f && p.interval === "MONTHLY")!.aiCreditsPerMonth;
    expect(credits("starter")).toBeLessThan(credits("business"));
    expect(credits("business")).toBeLessThan(credits("pro"));
  });

  it("does not retire the free plan code, which is reused", () => {
    expect(LEGACY_PLAN_CODES).not.toContain("free");
    for (const code of LEGACY_PLAN_CODES) {
      expect(PLANS.some((p) => p.code === code)).toBe(false);
    }
  });

  it("charges more for a try-on than a plain generation", () => {
    expect(CREDIT_COST.ENHANCE).toBe(0);
    expect(CREDIT_COST.TRY_ON).toBeGreaterThan(CREDIT_COST.GENERATE);
  });

  it("prices every top-up pack above its own cost", () => {
    const COST_PER_CREDIT = 3.5;
    for (const pack of CREDIT_PACKS) {
      expect(pack.priceInr).toBeGreaterThan(pack.credits * COST_PER_CREDIT);
    }
  });

  it("makes bigger packs cheaper per credit", () => {
    const perCredit = CREDIT_PACKS.map((p) => p.priceInr / p.credits);
    for (let i = 1; i < perCredit.length; i++) {
      expect(perCredit[i]!).toBeLessThan(perCredit[i - 1]!);
    }
  });
});
