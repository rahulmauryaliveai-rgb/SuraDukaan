import { z } from "zod";
import { db } from "@/lib/db";
import { trackEvent, anonymousVisitorId } from "@/lib/analytics";
import { ok, fail, handleApiError } from "@/lib/api";
import { rateLimit, clientIp } from "@/lib/rate-limit";

/**
 * Public tracking endpoint used by storefronts.
 * Records analytics events and WhatsApp enquiries. No PII collected.
 */
const schema = z.object({
  shopSlug: z.string().trim().min(1).max(80),
  type: z.enum(["SHOP_VIEW", "PRODUCT_VIEW", "WHATSAPP_CLICK", "PRODUCT_SHARE", "SHOP_SHARE", "SEARCH", "QR_SCAN"]),
  productId: z.string().trim().max(50).optional(),
  variant: z.string().trim().max(200).optional(),
  quantity: z.coerce.number().int().min(1).max(999).optional(),
  query: z.string().trim().max(120).optional(),
  source: z.enum(["PRODUCT_PAGE", "STOREFRONT", "SHARE"]).optional(),
});

export async function POST(req: Request) {
  try {
    const ip = clientIp(req);
    if (!rateLimit(`track:${ip}`, 120, 60 * 1000)) return fail("Rate limited", 429);

    const input = schema.parse(await req.json());
    const shop = await db.shop.findUnique({
      where: { slug: input.shopSlug },
      select: { id: true, deletedAt: true },
    });
    if (!shop || shop.deletedAt) return fail("Shop not found", 404);

    const visitorId = anonymousVisitorId(ip, req.headers.get("user-agent") ?? "");

    // Validate product belongs to this shop before recording.
    let product: { id: string; name: string } | null = null;
    if (input.productId) {
      product = await db.product.findFirst({
        where: { id: input.productId, shopId: shop.id },
        select: { id: true, name: true },
      });
    }

    await trackEvent({
      shopId: shop.id,
      type: input.type,
      entityId: product?.id,
      visitorId,
      meta: input.query ? { query: input.query } : undefined,
    });

    if (input.type === "WHATSAPP_CLICK") {
      await db.enquiry.create({
        data: {
          shopId: shop.id,
          productId: product?.id,
          productName: product?.name,
          variant: input.variant,
          quantity: input.quantity ?? 1,
          source: input.source ?? "PRODUCT_PAGE",
        },
      });
    }
    return ok({ tracked: true });
  } catch (err) {
    return handleApiError(err);
  }
}
