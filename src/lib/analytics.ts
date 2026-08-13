import "server-only";
import { createHash } from "crypto";
import { db } from "@/lib/db";
import type { AnalyticsType } from "@/generated/prisma/enums";

/**
 * Privacy-respecting analytics: no cookies, no PII.
 * Visitors are identified by a daily-rotating hash of IP + UA.
 */
export function anonymousVisitorId(ip: string, userAgent: string): string {
  const day = new Date().toISOString().slice(0, 10);
  return createHash("sha256")
    .update(`${ip}:${userAgent}:${day}:${process.env.AUTH_SECRET}`)
    .digest("hex")
    .slice(0, 24);
}

export async function trackEvent(opts: {
  shopId: string;
  type: AnalyticsType;
  entityId?: string;
  meta?: Record<string, unknown>;
  visitorId?: string;
}): Promise<void> {
  try {
    await db.analyticsEvent.create({
      data: {
        shopId: opts.shopId,
        type: opts.type,
        entityId: opts.entityId,
        meta: opts.meta ? JSON.stringify(opts.meta) : undefined,
        visitorId: opts.visitorId,
      },
    });
  } catch {
    // Analytics must never break the user flow.
  }
}
