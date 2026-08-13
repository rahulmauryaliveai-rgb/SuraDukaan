import { db } from "@/lib/db";
import { requireShop } from "@/lib/auth/session";
import { productSchema } from "@/lib/validation";
import { updateProduct } from "@/lib/products";
import { ok, fail, handleApiError } from "@/lib/api";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params) {
  try {
    const { shop } = await requireShop();
    const { id } = await params;
    const product = await db.product.findFirst({
      where: { id, shopId: shop.id, deletedAt: null },
      include: {
        images: { orderBy: { sortOrder: "asc" } },
        tags: true,
        variants: true,
        category: true,
      },
    });
    if (!product) return fail("Product not found.", 404);
    return ok({ product });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function PATCH(req: Request, { params }: Params) {
  try {
    const { shop, user } = await requireShop();
    const { id } = await params;
    const input = productSchema.parse(await req.json());
    const product = await updateProduct(shop.id, id, input);
    if (!product) return fail("Product not found.", 404);
    await db.auditLog.create({
      data: { userId: user.id, shopId: shop.id, action: "product.update", entity: "Product", entityId: id },
    });
    return ok({ product });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function DELETE(_req: Request, { params }: Params) {
  try {
    const { shop, user, memberRole } = await requireShop();
    if (memberRole === "STAFF") return fail("Staff cannot delete products.", 403);
    const { id } = await params;
    const product = await db.product.findFirst({ where: { id, shopId: shop.id, deletedAt: null } });
    if (!product) return fail("Product not found.", 404);
    // Soft delete — recoverable.
    await db.product.update({
      where: { id },
      data: { deletedAt: new Date(), isPublished: false },
    });
    await db.auditLog.create({
      data: { userId: user.id, shopId: shop.id, action: "product.delete", entity: "Product", entityId: id },
    });
    return ok({ deleted: true });
  } catch (err) {
    return handleApiError(err);
  }
}
