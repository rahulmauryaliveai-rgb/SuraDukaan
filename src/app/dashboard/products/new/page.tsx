import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requireShop } from "@/lib/auth/session";
import { canAddProduct } from "@/lib/plans";
import { ProductForm, emptyProduct } from "@/components/dashboard/product-form";

export const metadata: Metadata = { title: "Add Product" };
export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  const { shop } = await requireShop();
  const gate = await canAddProduct(shop.id);
  if (!gate.allowed) redirect("/dashboard/billing?limit=1");

  const categories = await db.category.findMany({
    where: { shopId: shop.id, deletedAt: null, isActive: true },
    orderBy: { sortOrder: "asc" },
    select: { id: true, name: true },
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Add Product</h1>
        <Link href="/dashboard/products" className="text-sm font-medium text-ink-500 hover:underline">
          Cancel
        </Link>
      </div>
      <ProductForm initial={emptyProduct} categories={categories} />
    </div>
  );
}
