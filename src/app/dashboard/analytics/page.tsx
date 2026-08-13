import type { Metadata } from "next";
import { BarChart3 } from "lucide-react";
import { db } from "@/lib/db";
import { requireShop } from "@/lib/auth/session";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";

export const metadata: Metadata = { title: "Analytics" };
export const dynamic = "force-dynamic";

function dayKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export default async function AnalyticsPage() {
  const { shop } = await requireShop();
  const since = new Date(Date.now() - 29 * 86400000);
  since.setHours(0, 0, 0, 0);

  const events = await db.analyticsEvent.findMany({
    where: { shopId: shop.id, createdAt: { gte: since } },
    select: { type: true, createdAt: true, visitorId: true, entityId: true, meta: true },
    orderBy: { createdAt: "asc" },
  });

  const totals = {
    shopViews: events.filter((e) => e.type === "SHOP_VIEW").length,
    productViews: events.filter((e) => e.type === "PRODUCT_VIEW").length,
    waClicks: events.filter((e) => e.type === "WHATSAPP_CLICK").length,
    shares: events.filter((e) => e.type === "PRODUCT_SHARE" || e.type === "SHOP_SHARE").length,
    visitors: new Set(events.map((e) => e.visitorId).filter(Boolean)).size,
    searches: events.filter((e) => e.type === "SEARCH").length,
  };

  // Daily views for the chart
  const days: { key: string; label: string; views: number }[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400000);
    days.push({
      key: dayKey(d),
      label: d.toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
      views: 0,
    });
  }
  const dayMap = new Map(days.map((d) => [d.key, d]));
  for (const e of events) {
    if (e.type === "SHOP_VIEW" || e.type === "PRODUCT_VIEW") {
      const entry = dayMap.get(dayKey(e.createdAt));
      if (entry) entry.views++;
    }
  }
  const maxViews = Math.max(1, ...days.map((d) => d.views));

  // Top products by views
  const productViewCounts = new Map<string, number>();
  for (const e of events) {
    if (e.type === "PRODUCT_VIEW" && e.entityId) {
      productViewCounts.set(e.entityId, (productViewCounts.get(e.entityId) ?? 0) + 1);
    }
  }
  const topIds = [...productViewCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);
  const topProducts = topIds.length
    ? await db.product.findMany({
        where: { id: { in: topIds.map(([id]) => id) }, shopId: shop.id },
        select: { id: true, name: true },
      })
    : [];
  const nameById = new Map(topProducts.map((p) => [p.id, p.name]));

  // Top searches
  const searchCounts = new Map<string, number>();
  for (const e of events) {
    if (e.type === "SEARCH" && e.meta) {
      try {
        const q = (JSON.parse(e.meta) as { query?: string }).query?.toLowerCase().trim();
        if (q) searchCounts.set(q, (searchCounts.get(q) ?? 0) + 1);
      } catch {
        /* ignore */
      }
    }
  }
  const topSearches = [...searchCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);

  const statCards = [
    { label: "Shop views (30d)", value: totals.shopViews },
    { label: "Product views (30d)", value: totals.productViews },
    { label: "Unique visitors (30d)", value: totals.visitors },
    { label: "WhatsApp clicks (30d)", value: totals.waClicks },
    { label: "Shares (30d)", value: totals.shares },
    { label: "Searches (30d)", value: totals.searches },
  ];

  const hasData = events.length > 0;

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-bold">Analytics</h1>

      {!hasData ? (
        <EmptyState
          icon={<BarChart3 className="h-10 w-10" />}
          title="No data yet"
          description="Analytics appear once customers start visiting your shop. Share your link to get started."
        />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {statCards.map((s) => (
              <Card key={s.label}>
                <CardContent className="p-4">
                  <p className="text-2xl font-bold">{s.value.toLocaleString("en-IN")}</p>
                  <p className="text-xs text-ink-500">{s.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Daily views — last 30 days</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex h-40 items-end gap-[2px]" role="img" aria-label="Daily views bar chart">
                {days.map((d) => (
                  <div key={d.key} className="group relative flex-1">
                    <div
                      className="w-full rounded-t bg-brand-600/80 transition group-hover:bg-brand-700"
                      style={{ height: `${Math.max(2, (d.views / maxViews) * 152)}px` }}
                    />
                    <span className="pointer-events-none absolute -top-7 left-1/2 hidden -translate-x-1/2 whitespace-nowrap rounded bg-ink-900 px-1.5 py-0.5 text-[10px] text-white group-hover:block">
                      {d.label}: {d.views}
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-1 flex justify-between text-[10px] text-ink-500">
                <span>{days[0]?.label}</span>
                <span>{days[days.length - 1]?.label}</span>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-5 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Top products</CardTitle>
              </CardHeader>
              <CardContent>
                {topIds.length === 0 ? (
                  <p className="text-sm text-ink-500">No product views yet.</p>
                ) : (
                  <ol className="space-y-2">
                    {topIds.map(([id, count], i) => (
                      <li key={id} className="flex items-center gap-2 text-sm">
                        <span className="w-5 text-ink-500">{i + 1}.</span>
                        <span className="flex-1 truncate font-medium">{nameById.get(id) ?? "Deleted product"}</span>
                        <span className="text-ink-500">{count} views</span>
                      </li>
                    ))}
                  </ol>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Top searches</CardTitle>
              </CardHeader>
              <CardContent>
                {topSearches.length === 0 ? (
                  <p className="text-sm text-ink-500">No searches recorded yet.</p>
                ) : (
                  <ol className="space-y-2">
                    {topSearches.map(([q, count], i) => (
                      <li key={q} className="flex items-center gap-2 text-sm">
                        <span className="w-5 text-ink-500">{i + 1}.</span>
                        <span className="flex-1 truncate font-medium">“{q}”</span>
                        <span className="text-ink-500">{count}×</span>
                      </li>
                    ))}
                  </ol>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
