import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Package, Plus, Search } from "lucide-react";
import { db } from "@/lib/db";
import { requireShop } from "@/lib/auth/session";
import { canAddProduct } from "@/lib/plans";
import { formatINR } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { CsvTools } from "@/components/dashboard/csv-tools";

export const metadata: Metadata = { title: "Products" };
export const dynamic = "force-dynamic";

const PAGE_SIZE = 20;

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const { shop } = await requireShop();
  const { q = "", page: pageRaw = "1" } = await searchParams;
  const page = Math.max(1, Number(pageRaw) || 1);

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

  const [products, total, gate] = await Promise.all([
    db.product.findMany({
      where,
      include: { images: { where: { isMain: true }, take: 1 }, category: true },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    db.product.count({ where }),
    canAddProduct(shop.id),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-bold">Products {total > 0 && <span className="text-ink-500 font-normal text-base">({total})</span>}</h1>
        <div className="flex items-center gap-2">
          <CsvTools />
          <Link href="/dashboard/products/new">
            <Button size="sm">
              <Plus className="h-4 w-4" /> Add Product
            </Button>
          </Link>
        </div>
      </div>

      {!gate.allowed && (
        <Card className="border-amber-200 bg-amber-50 p-4">
          <p className="text-sm text-amber-900">
            You&apos;ve reached your <strong>{gate.planName}</strong> plan limit of {gate.limit} products.
          </p>
          <Link href="/dashboard/billing" className="mt-1 inline-block text-sm font-semibold text-brand-700 hover:underline">
            Upgrade Plan →
          </Link>
        </Card>
      )}

      <form className="relative" action="/dashboard/products">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-500" />
        <input
          type="search"
          name="q"
          defaultValue={q}
          placeholder="Search by name, SKU or tag…"
          className="h-11 w-full rounded-xl border border-ink-300 bg-white pl-10 pr-4 text-sm focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-600/20"
        />
      </form>

      {products.length === 0 ? (
        <EmptyState
          icon={<Package className="h-10 w-10" />}
          title={q ? "No products match your search" : "Your shop is waiting for its first product"}
          description={q ? "Try a different keyword." : "Add a product with a photo and price — it takes less than a minute."}
          action={
            !q ? (
              <Link href="/dashboard/products/new">
                <Button>+ Add Your First Product</Button>
              </Link>
            ) : undefined
          }
        />
      ) : (
        <Card>
          <ul className="divide-y divide-ink-100">
            {products.map((p) => (
              <li key={p.id}>
                <Link href={`/dashboard/products/${p.id}`} className="flex items-center gap-3 px-4 py-3 hover:bg-ink-50">
                  {p.images[0] ? (
                    <Image src={p.images[0].url} alt="" width={48} height={48} className="h-12 w-12 rounded-lg object-cover bg-ink-100" />
                  ) : (
                    <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-ink-100 text-ink-300">
                      <Package className="h-5 w-5" />
                    </span>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{p.name}</p>
                    <p className="text-sm text-ink-500">
                      {p.discountPrice ? (
                        <>
                          <span className="font-medium text-ink-900">{formatINR(Number(p.discountPrice))}</span>{" "}
                          <span className="line-through">{formatINR(Number(p.price))}</span>
                        </>
                      ) : (
                        formatINR(Number(p.price))
                      )}
                      {p.category && <span> · {p.category.name}</span>}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Badge tone={p.isPublished ? "success" : "default"}>{p.isPublished ? "Published" : "Draft"}</Badge>
                    {!p.inStock && <Badge tone="danger">Out of stock</Badge>}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {totalPages > 1 && (
        <nav className="flex items-center justify-center gap-2" aria-label="Pagination">
          {page > 1 && (
            <Link href={`/dashboard/products?q=${encodeURIComponent(q)}&page=${page - 1}`}>
              <Button variant="outline" size="sm">Previous</Button>
            </Link>
          )}
          <span className="px-3 text-sm text-ink-500">
            Page {page} of {totalPages}
          </span>
          {page < totalPages && (
            <Link href={`/dashboard/products?q=${encodeURIComponent(q)}&page=${page + 1}`}>
              <Button variant="outline" size="sm">Next</Button>
            </Link>
          )}
        </nav>
      )}
    </div>
  );
}
