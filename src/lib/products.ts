import "server-only";
import { db } from "@/lib/db";
import { slugify, uniqueSlug } from "@/lib/slug";
import type { ProductInput } from "@/lib/validation";

/** All product operations are scoped by shopId (from the session, never the client). */

export async function createProduct(shopId: string, input: ProductInput) {
  const slug = await uniqueSlug(slugify(input.name), async (s) =>
    !!(await db.product.findUnique({ where: { shopId_slug: { shopId, slug: s } }, select: { id: true } })),
  );

  // Category must belong to the same shop.
  let categoryId: string | null = null;
  if (input.categoryId) {
    const cat = await db.category.findFirst({
      where: { id: input.categoryId, shopId, deletedAt: null },
      select: { id: true },
    });
    categoryId = cat?.id ?? null;
  }

  return db.product.create({
    data: {
      shopId,
      slug,
      name: input.name,
      price: input.price,
      discountPrice: input.discountPrice ?? null,
      categoryId,
      description: input.description || null,
      sku: input.sku || null,
      stock: input.stock ?? null,
      brand: input.brand || null,
      weight: input.weight || null,
      productCode: input.productCode || null,
      isPublished: input.isPublished ?? true,
      inStock: input.inStock ?? true,
      isFeatured: input.isFeatured ?? false,
      images: input.images?.length
        ? { create: input.images.map((url, i) => ({ url, isMain: i === 0, sortOrder: i })) }
        : undefined,
      tags: input.tags?.length
        ? { create: [...new Set(input.tags)].map((tag) => ({ tag })) }
        : undefined,
      variants: input.variants?.length
        ? { create: input.variants.map((v) => ({ name: v.name, options: JSON.stringify(v.options) })) }
        : undefined,
    },
    include: { images: true },
  });
}

export async function updateProduct(shopId: string, productId: string, input: ProductInput) {
  // Tenant isolation: the product must belong to this shop.
  const existing = await db.product.findFirst({
    where: { id: productId, shopId, deletedAt: null },
  });
  if (!existing) return null;

  let categoryId: string | null = null;
  if (input.categoryId) {
    const cat = await db.category.findFirst({
      where: { id: input.categoryId, shopId, deletedAt: null },
      select: { id: true },
    });
    categoryId = cat?.id ?? null;
  }

  return db.$transaction(async (tx) => {
    if (input.images) {
      await tx.productImage.deleteMany({ where: { productId } });
    }
    if (input.tags) {
      await tx.productTag.deleteMany({ where: { productId } });
    }
    if (input.variants) {
      await tx.productVariant.deleteMany({ where: { productId } });
    }
    return tx.product.update({
      where: { id: productId },
      data: {
        name: input.name,
        price: input.price,
        discountPrice: input.discountPrice ?? null,
        categoryId,
        description: input.description || null,
        sku: input.sku || null,
        stock: input.stock ?? null,
        brand: input.brand || null,
        weight: input.weight || null,
        productCode: input.productCode || null,
        isPublished: input.isPublished ?? existing.isPublished,
        inStock: input.inStock ?? existing.inStock,
        isFeatured: input.isFeatured ?? existing.isFeatured,
        images: input.images?.length
          ? { create: input.images.map((url, i) => ({ url, isMain: i === 0, sortOrder: i })) }
          : undefined,
        tags: input.tags?.length
          ? { create: [...new Set(input.tags)].map((tag) => ({ tag })) }
          : undefined,
        variants: input.variants?.length
          ? { create: input.variants.map((v) => ({ name: v.name, options: JSON.stringify(v.options) })) }
          : undefined,
      },
      include: { images: true },
    });
  });
}
