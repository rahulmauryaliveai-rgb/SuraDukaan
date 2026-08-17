/**
 * Pure credit arithmetic — no database, so it can be unit tested directly.
 */

export interface Balance {
  /** Monthly allowance remaining. Expires at renewal. */
  allowance: number;
  /** Purchased credits. Never expire. */
  topup: number;
}

export interface SpendPlan {
  fromAllowance: number;
  fromTopup: number;
}

export function totalCredits(b: Balance): number {
  return b.allowance + b.topup;
}

/**
 * Works out where a spend comes from. The monthly allowance is always used
 * first, because it expires and purchased credits do not.
 * Returns null when the shop cannot afford the cost.
 */
export function planSpend(balance: Balance, cost: number): SpendPlan | null {
  if (cost < 0) throw new Error("Credit cost cannot be negative");
  if (cost === 0) return { fromAllowance: 0, fromTopup: 0 };
  if (totalCredits(balance) < cost) return null;

  const fromAllowance = Math.min(balance.allowance, cost);
  return { fromAllowance, fromTopup: cost - fromAllowance };
}

/**
 * True when the monthly allowance is due to refill — i.e. we have moved into
 * a later calendar month than the last renewal.
 */
export function isRenewalDue(renewedAt: Date | null | undefined, now: Date = new Date()): boolean {
  if (!renewedAt) return true;
  return (
    now.getUTCFullYear() > renewedAt.getUTCFullYear() ||
    (now.getUTCFullYear() === renewedAt.getUTCFullYear() &&
      now.getUTCMonth() > renewedAt.getUTCMonth())
  );
}

/** First moment of next month, shown to the seller as "credits refill on…". */
export function nextRenewalDate(now: Date = new Date()): Date {
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));
}
