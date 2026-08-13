import "server-only";
import { cache } from "react";
import { db } from "@/lib/db";

/** Public storefront data access. Only published, non-deleted data. */

export const getPublicShop = cache(async (slug: string) => {
  return db.shop.findFirst({
    where: { slug, deletedAt: null },
    include: {
      theme: true,
      categories: {
        where: { deletedAt: null, isActive: true },
        orderBy: { sortOrder: "asc" },
      },
    },
  });
});

export interface StorefrontFilters {
  q?: string;
  category?: string;
  sort?: "new" | "price-asc" | "price-desc";
  inStock?: boolean;
  page?: number;
}

const PAGE_SIZE = 24;

export async function getPublicProducts(shopId: string, filters: StorefrontFilters) {
  const where = {
    shopId,
    deletedAt: null,
    isPublished: true,
    ...(filters.inStock ? { inStock: true } : {}),
    ...(filters.category ? { category: { slug: filters.category, shopId } } : {}),
    ...(filters.q
      ? {
          OR: [
            { name: { contains: filters.q, mode: "insensitive" as const } },
            { sku: { contains: filters.q, mode: "insensitive" as const } },
            { tags: { some: { tag: { contains: filters.q, mode: "insensitive" as const } } } },
          ],
        }
      : {}),
  };

  const orderBy =
    filters.sort === "price-asc"
      ? [{ price: "asc" as const }]
      : filters.sort === "price-desc"
        ? [{ price: "desc" as const }]
        : [{ createdAt: "desc" as const }];

  const page = Math.max(1, filters.page ?? 1);
  const [items, total] = await Promise.all([
    db.product.findMany({
      where,
      include: { images: { orderBy: { sortOrder: "asc" }, take: 1 } },
      orderBy,
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    db.product.count({ where }),
  ]);
  return { items, total, page, pageSize: PAGE_SIZE, totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)) };
}

export async function getFeaturedProducts(shopId: string) {
  return db.product.findMany({
    where: { shopId, deletedAt: null, isPublished: true, isFeatured: true },
    include: { images: { orderBy: { sortOrder: "asc" }, take: 1 } },
    orderBy: { createdAt: "desc" },
    take: 8,
  });
}

export const getPublicProduct = cache(async (shopSlug: string, productSlug: string) => {
  const shop = await getPublicShop(shopSlug);
  if (!shop) return null;
  const product = await db.product.findFirst({
    where: { shopId: shop.id, slug: productSlug, deletedAt: null, isPublished: true },
    include: {
      images: { orderBy: { sortOrder: "asc" } },
      variants: true,
      tags: true,
      category: true,
    },
  });
  if (!product) return null;
  return { shop, product };
});
