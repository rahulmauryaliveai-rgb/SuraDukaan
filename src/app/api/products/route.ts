import { db } from "@/lib/db";
import { requireShop } from "@/lib/auth/session";
import { productSchema } from "@/lib/validation";
import { canAddProduct } from "@/lib/plans";
import { createProduct } from "@/lib/products";
import { ok, fail, handleApiError } from "@/lib/api";

export async function GET(req: Request) {
  try {
    const { shop } = await requireShop();
    const url = new URL(req.url);
    const q = url.searchParams.get("q")?.trim();
    const page = Math.max(1, Number(url.searchParams.get("page") ?? 1));
    const pageSize = 20;

    const where = {
      shopId: shop.id,
      deletedAt: null,
      ...(q
        ? {
            OR: [
              { name: { contains: q, mode: "insensitive" as const } },
              { sku: { contains: q, mode: "insensitive" as const } },
              { tags: { some: { tag: { contains: q, mode: "insensitive" as const } } } },
            ],
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      db.product.findMany({
        where,
        include: { images: { orderBy: { sortOrder: "asc" } }, category: true },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      db.product.count({ where }),
    ]);
    return ok({ items, total, page, pageSize });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(req: Request) {
  try {
    const { shop, user } = await requireShop();
    const gate = await canAddProduct(shop.id);
    if (!gate.allowed) {
      return fail(
        `You've reached your ${gate.planName} plan limit of ${gate.limit} products. Upgrade to add more.`,
        402,
      );
    }
    const input = productSchema.parse(await req.json());
    const product = await createProduct(shop.id, input);
    await db.auditLog.create({
      data: { userId: user.id, shopId: shop.id, action: "product.create", entity: "Product", entityId: product.id },
    });
    return ok({ product }, { status: 201 });
  } catch (err) {
    return handleApiError(err);
  }
}
