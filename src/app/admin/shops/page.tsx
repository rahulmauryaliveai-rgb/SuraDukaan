import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { formatDate } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AdminEntityActions } from "@/components/admin/entity-actions";

export const metadata: Metadata = { title: "Shops — Admin" };
export const dynamic = "force-dynamic";

export default async function AdminShopsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string; page?: string }>;
}) {
  const { q = "", category = "", page: pageRaw = "1" } = await searchParams;
  const page = Math.max(1, Number(pageRaw) || 1);
  const PAGE_SIZE = 25;

  const where = {
    deletedAt: null,
    ...(category ? { category } : {}),
    ...(q
      ? {
          OR: [
            { name: { contains: q, mode: "insensitive" as const } },
            { slug: { contains: q, mode: "insensitive" as const } },
            { city: { contains: q, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  const [shops, total, categories] = await Promise.all([
    db.shop.findMany({
      where,
      include: { _count: { select: { products: { where: { deletedAt: null } } } } },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    db.shop.count({ where }),
    db.shop.groupBy({ by: ["category"], where: { deletedAt: null } }),
  ]);

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">Shops <span className="text-base font-normal text-ink-500">({total})</span></h1>
      <form action="/admin/shops" className="flex gap-2">
        <input
          type="search"
          name="q"
          defaultValue={q}
          placeholder="Search shops…"
          className="h-11 flex-1 rounded-xl border border-ink-300 bg-white px-4 text-sm focus:border-brand-600 focus:outline-none"
        />
        <select
          name="category"
          defaultValue={category}
          className="h-11 rounded-xl border border-ink-300 bg-white px-3 text-sm"
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c.category} value={c.category}>{c.category}</option>
          ))}
        </select>
      </form>
      <Card>
        <ul className="divide-y divide-ink-100">
          {shops.map((s) => (
            <li key={s.id} className="flex flex-wrap items-center gap-3 px-4 py-3">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">
                  {s.name}{" "}
                  <Link href={`/${s.slug}`} target="_blank" className="text-brand-700 hover:underline">
                    /{s.slug}
                  </Link>
                </p>
                <p className="text-xs text-ink-500">
                  {s.category} {s.city && `· ${s.city}`} · {s._count.products} products · Created {formatDate(s.createdAt)}
                </p>
              </div>
              <Badge tone={s.status === "LIVE" ? "success" : s.status === "SUSPENDED" ? "danger" : "warning"}>
                {s.status}
              </Badge>
              <AdminEntityActions kind="shop" id={s.id} isActive={s.status !== "SUSPENDED"} />
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
