import "server-only";
import { db } from "@/lib/db";
import { getActivePlan } from "@/lib/plans";
import { planSpend, isRenewalDue, nextRenewalDate, type Balance } from "@/lib/credits-core";

export { nextRenewalDate } from "@/lib/credits-core";

/** What each AI operation costs. Mirrors prisma/plans.ts. */
export const CREDIT_COST = {
  ENHANCE: 0,
  GENERATE: 1,
  TRY_ON: 2,
} as const;

export type AiOperation = keyof typeof CREDIT_COST;

export interface CreditState extends Balance {
  total: number;
  creditsPerMonth: number;
  enhanceEnabled: boolean;
  renewsAt: Date;
}

/**
 * Current balance for a shop, refilling the monthly allowance first if a new
 * month has started. Unused allowance does NOT roll over.
 */
export async function getCreditState(shopId: string): Promise<CreditState> {
  const plan = await getActivePlan(shopId);
  const shop = await db.shop.findUniqueOrThrow({
    where: { id: shopId },
    select: { aiCredits: true, aiTopupCredits: true, aiCreditsRenewedAt: true },
  });

  let allowance = shop.aiCredits;

  if (isRenewalDue(shop.aiCreditsRenewedAt) && plan.aiCreditsPerMonth > 0) {
    const now = new Date();
    await db.$transaction(async (tx) => {
      const fresh = await tx.shop.findUniqueOrThrow({
        where: { id: shopId },
        select: { aiCreditsRenewedAt: true },
      });
      // Another request may have refilled while we waited.
      if (!isRenewalDue(fresh.aiCreditsRenewedAt)) return;

      await tx.shop.update({
        where: { id: shopId },
        data: { aiCredits: plan.aiCreditsPerMonth, aiCreditsRenewedAt: now },
      });
      await tx.creditLedger.create({
        data: {
          shopId,
          delta: plan.aiCreditsPerMonth,
          reason: "monthly_grant",
          balance: plan.aiCreditsPerMonth + shop.aiTopupCredits,
          note: `${plan.name} monthly allowance`,
        },
      });
      allowance = plan.aiCreditsPerMonth;
    });
  }

  return {
    allowance,
    topup: shop.aiTopupCredits,
    total: allowance + shop.aiTopupCredits,
    creditsPerMonth: plan.aiCreditsPerMonth,
    enhanceEnabled: plan.aiEnhanceEnabled,
    renewsAt: nextRenewalDate(),
  };
}

export class InsufficientCreditsError extends Error {
  constructor(
    public required: number,
    public available: number,
  ) {
    super("Not enough AI credits");
  }
}

/**
 * Charges a shop for an AI operation and records it in the ledger.
 *
 * The deduction is guarded by a conditional update, so two requests racing
 * for the last credit cannot both succeed.
 */
export async function spendCredits(opts: {
  shopId: string;
  operation: AiOperation;
  jobId?: string;
  note?: string;
}): Promise<{ charged: number; remaining: number }> {
  const cost = CREDIT_COST[opts.operation];
  const state = await getCreditState(opts.shopId);

  if (cost === 0) return { charged: 0, remaining: state.total };

  const split = planSpend({ allowance: state.allowance, topup: state.topup }, cost);
  if (!split) throw new InsufficientCreditsError(cost, state.total);

  return db.$transaction(async (tx) => {
    // Only succeeds if the balances are still what we planned against.
    const updated = await tx.shop.updateMany({
      where: {
        id: opts.shopId,
        aiCredits: { gte: split.fromAllowance },
        aiTopupCredits: { gte: split.fromTopup },
      },
      data: {
        aiCredits: { decrement: split.fromAllowance },
        aiTopupCredits: { decrement: split.fromTopup },
      },
    });
    if (updated.count === 0) throw new InsufficientCreditsError(cost, state.total);

    const after = await tx.shop.findUniqueOrThrow({
      where: { id: opts.shopId },
      select: { aiCredits: true, aiTopupCredits: true },
    });
    const remaining = after.aiCredits + after.aiTopupCredits;

    await tx.creditLedger.create({
      data: {
        shopId: opts.shopId,
        delta: -cost,
        reason: "job_spend",
        balance: remaining,
        jobId: opts.jobId,
        note: opts.note ?? opts.operation,
      },
    });

    return { charged: cost, remaining };
  });
}

/** Returns credits when a job fails. Always goes back to the top-up bucket
 *  so a refund is never lost to a month rollover. */
export async function refundCredits(opts: {
  shopId: string;
  amount: number;
  jobId?: string;
  note?: string;
}): Promise<void> {
  if (opts.amount <= 0) return;

  await db.$transaction(async (tx) => {
    const shop = await tx.shop.update({
      where: { id: opts.shopId },
      data: { aiTopupCredits: { increment: opts.amount } },
      select: { aiCredits: true, aiTopupCredits: true },
    });
    await tx.creditLedger.create({
      data: {
        shopId: opts.shopId,
        delta: opts.amount,
        reason: "job_refund",
        balance: shop.aiCredits + shop.aiTopupCredits,
        jobId: opts.jobId,
        note: opts.note ?? "Refund for failed job",
      },
    });
  });
}

/** Adds purchased credits after a successful top-up payment. */
export async function grantTopupCredits(opts: {
  shopId: string;
  amount: number;
  note: string;
  reason?: string;
}): Promise<void> {
  await db.$transaction(async (tx) => {
    const shop = await tx.shop.update({
      where: { id: opts.shopId },
      data: { aiTopupCredits: { increment: opts.amount } },
      select: { aiCredits: true, aiTopupCredits: true },
    });
    await tx.creditLedger.create({
      data: {
        shopId: opts.shopId,
        delta: opts.amount,
        reason: opts.reason ?? "topup_purchase",
        balance: shop.aiCredits + shop.aiTopupCredits,
        note: opts.note,
      },
    });
  });
}

/** Recent credit movements, newest first — shown on the billing page. */
export async function getCreditHistory(shopId: string, take = 20) {
  return db.creditLedger.findMany({
    where: { shopId },
    orderBy: { createdAt: "desc" },
    take,
  });
}
