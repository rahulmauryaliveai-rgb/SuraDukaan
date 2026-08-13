import "server-only";
import { createHmac } from "crypto";

/**
 * Razorpay payment provider abstraction.
 * Runs in sandbox mode when keys are absent: orders are simulated locally so the
 * full subscription flow works end-to-end in development.
 */

export interface PaymentOrder {
  providerOrderId: string;
  amountInr: number;
  currency: "INR";
  sandbox: boolean;
}

export function isSandbox(): boolean {
  return !process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET;
}

export async function createOrder(amountInr: number, receipt: string): Promise<PaymentOrder> {
  if (isSandbox()) {
    return {
      providerOrderId: `sandbox_order_${Date.now()}_${receipt}`,
      amountInr,
      currency: "INR",
      sandbox: true,
    };
  }
  const auth = Buffer.from(`${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`).toString("base64");
  const res = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: { Authorization: `Basic ${auth}`, "Content-Type": "application/json" },
    body: JSON.stringify({ amount: amountInr * 100, currency: "INR", receipt }),
  });
  if (!res.ok) throw new Error(`Razorpay order failed: ${res.status}`);
  const order = (await res.json()) as { id: string };
  return { providerOrderId: order.id, amountInr, currency: "INR", sandbox: false };
}

/** Verify Razorpay webhook signature (X-Razorpay-Signature). */
export function verifyWebhookSignature(body: string, signature: string): boolean {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret) return false;
  const expected = createHmac("sha256", secret).update(body).digest("hex");
  return expected === signature;
}
