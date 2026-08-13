import type { Metadata } from "next";
import { db } from "@/lib/db";
import { requireShop } from "@/lib/auth/session";
import { CategoryManager } from "@/components/dashboard/category-manager";

export const metadata: Metadata = { title: "Categories" };
export const dynamic = "force-dynamic";

export default async function CategoriesPage() {
  const { shop } = await requireShop();
  const categories = await db.category.findMany({
    where: { shopId: shop.id, deletedAt: null },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    include: { _count: { select: { products: { where: { deletedAt: null } } } } },
  });

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">Categories</h1>
      <CategoryManager
        initial={categories.map((c) => ({
          id: c.id,
          name: c.name,
          isActive: c.isActive,
          productCount: c._count.products,
        }))}
      />
    </div>
  );
}
