import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requireShop } from "@/lib/auth/session";
import { ProductForm, type ProductFormValues } from "@/components/dashboard/product-form";

export const metadata: Metadata = { title: "Edit Product" };
export const dynamic = "force-dynamic";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { shop } = await requireShop();
  const { id } = await params;

  const product = await db.product.findFirst({
    where: { id, shopId: shop.id, deletedAt: null },
    include: {
      images: { orderBy: { sortOrder: "asc" } },
      tags: true,
      variants: true,
    },
  });
  if (!product) notFound();

  const categories = await db.category.findMany({
    where: { shopId: shop.id, deletedAt: null, isActive: true },
    orderBy: { sortOrder: "asc" },
    select: { id: true, name: true },
  });

  const initial: ProductFormValues = {
    id: product.id,
    name: product.name,
    price: String(product.price),
    discountPrice: product.discountPrice ? String(product.discountPrice) : "",
    categoryId: product.categoryId ?? "",
    description: product.description ?? "",
    sku: product.sku ?? "",
    stock: product.stock != null ? String(product.stock) : "",
    brand: product.brand ?? "",
    weight: product.weight ?? "",
    productCode: product.productCode ?? "",
    isPublished: product.isPublished,
    inStock: product.inStock,
    isFeatured: product.isFeatured,
    tags: product.tags.map((t) => t.tag),
    variants: product.variants.map((v) => ({
      name: v.name,
      options: JSON.parse(v.options) as string[],
    })),
    images: product.images.map((i) => i.url),
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Edit Product</h1>
        <Link href="/dashboard/products" className="text-sm font-medium text-ink-500 hover:underline">
          Back
        </Link>
      </div>
      <ProductForm initial={initial} categories={categories} />
    </div>
  );
}
