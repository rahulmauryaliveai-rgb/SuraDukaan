import type { Metadata } from "next";
import { db } from "@/lib/db";
import { formatDate } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AdminEntityActions } from "@/components/admin/entity-actions";

export const metadata: Metadata = { title: "Users — Admin" };
export const dynamic = "force-dynamic";

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const { q = "", page: pageRaw = "1" } = await searchParams;
  const page = Math.max(1, Number(pageRaw) || 1);
  const PAGE_SIZE = 25;

  const where = {
    deletedAt: null,
    ...(q
      ? {
          OR: [
            { phone: { contains: q } },
            { name: { contains: q, mode: "insensitive" as const } },
            { email: { contains: q, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  const [users, total] = await Promise.all([
    db.user.findMany({
      where,
      include: { shops: { include: { shop: { select: { name: true, slug: true } } } } },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    db.user.count({ where }),
  ]);

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">Users <span className="text-base font-normal text-ink-500">({total})</span></h1>
      <form action="/admin/users">
        <input
          type="search"
          name="q"
          defaultValue={q}
          placeholder="Search by phone, name or email…"
          className="h-11 w-full rounded-xl border border-ink-300 bg-white px-4 text-sm focus:border-brand-600 focus:outline-none"
        />
      </form>
      <Card>
        <ul className="divide-y divide-ink-100">
          {users.map((u) => (
            <li key={u.id} className="flex flex-wrap items-center gap-3 px-4 py-3">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">
                  {u.name ?? "Unnamed"} <span className="text-ink-500">· +91 {u.phone}</span>
                </p>
                <p className="text-xs text-ink-500">
                  {u.role} · Joined {formatDate(u.createdAt)}
                  {u.shops[0] && <> · Shop: {u.shops[0].shop.name} (/{u.shops[0].shop.slug})</>}
                </p>
              </div>
              <Badge tone={u.isActive ? "success" : "danger"}>{u.isActive ? "Active" : "Suspended"}</Badge>
              {u.role !== "SUPER_ADMIN" && (
                <AdminEntityActions kind="user" id={u.id} isActive={u.isActive} />
              )}
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
