import { db } from "@/lib/db";
import { verifyWebhookSignature } from "@/lib/payments";
import { ok, fail } from "@/lib/api";

/** Razorpay webhook: payment.captured / payment.failed. */
export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get("x-razorpay-signature") ?? "";
  if (!verifyWebhookSignature(body, signature)) {
    return fail("Invalid signature.", 401);
  }

  try {
    const event = JSON.parse(body) as {
      event: string;
      payload?: { payment?: { entity?: { id: string; order_id: string } } };
    };
    const entity = event.payload?.payment?.entity;
    if (!entity?.order_id) return ok({ ignored: true });

    const payment = await db.payment.findFirst({ where: { providerOrderId: entity.order_id } });
    if (!payment) return ok({ ignored: true });

    await db.paymentEvent.create({
      data: { paymentId: payment.id, type: event.event, payload: body },
    });

    if (event.event === "payment.captured") {
      await db.payment.update({
        where: { id: payment.id },
        data: { status: "PAID", providerPaymentId: entity.id },
      });
      await db.subscription.update({
        where: { id: payment.subscriptionId },
        data: { status: "ACTIVE" },
      });
      await db.invoice.upsert({
        where: { paymentId: payment.id },
        create: { paymentId: payment.id, number: `INV-${Date.now()}`, amountInr: payment.amountInr },
        update: {},
      });
    } else if (event.event === "payment.failed") {
      await db.payment.update({ where: { id: payment.id }, data: { status: "FAILED" } });
    }
    return ok({ processed: true });
  } catch {
    return fail("Malformed webhook payload.", 400);
  }
}
