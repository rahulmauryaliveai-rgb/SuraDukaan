import { z } from "zod";
import { db } from "@/lib/db";
import { requireShop } from "@/lib/auth/session";
import { createOrder, isSandbox } from "@/lib/payments";
import { ok, fail, handleApiError } from "@/lib/api";

const schema = z.object({ planCode: z.string().trim().min(1).max(30) });

export async function POST(req: Request) {
  try {
    const { shop, user, memberRole } = await requireShop();
    if (memberRole !== "SHOP_OWNER") return fail("Only the shop owner can change the plan.", 403);

    const { planCode } = schema.parse(await req.json());
    const plan = await db.plan.findFirst({ where: { code: planCode, isActive: true } });
    if (!plan) return fail("Plan not found.", 404);
    if (plan.priceInr === 0) return fail("You are already on the Free plan by default.");

    const order = await createOrder(plan.priceInr, `${shop.id}-${plan.code}`);

    const subscription = await db.subscription.create({
      data: {
        shopId: shop.id,
        planId: plan.id,
        status: order.sandbox ? "ACTIVE" : "PENDING",
        endsAt: new Date(Date.now() + 365 * 86400000),
        payments: {
          create: {
            amountInr: plan.priceInr,
            status: order.sandbox ? "PAID" : "CREATED",
            providerOrderId: order.providerOrderId,
          },
        },
      },
      include: { payments: true },
    });

    if (order.sandbox) {
      const payment = subscription.payments[0];
      if (payment) {
        await db.invoice.create({
          data: {
            paymentId: payment.id,
            number: `INV-${Date.now()}`,
            amountInr: plan.priceInr,
          },
        });
      }
      // Expire older active subscriptions for this shop.
      await db.subscription.updateMany({
        where: { shopId: shop.id, id: { not: subscription.id }, status: "ACTIVE" },
        data: { status: "CANCELLED" },
      });
    }

    await db.auditLog.create({
      data: { userId: user.id, shopId: shop.id, action: "subscription.create", entity: "Subscription", entityId: subscription.id },
    });

    return ok({
      sandbox: isSandbox(),
      subscriptionId: subscription.id,
      providerOrderId: order.providerOrderId,
      // In production the client opens Razorpay Checkout with this order id.
      activated: order.sandbox,
    });
  } catch (err) {
    return handleApiError(err);
  }
}
