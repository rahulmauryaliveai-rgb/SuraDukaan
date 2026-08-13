import type { Metadata } from "next";
import { db } from "@/lib/db";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = { title: "Admin" };
export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const [totalUsers, totalShops, activeShops, totalProducts, totalVisits, waEnquiries, activeSubs, monthlyRevenue] =
    await Promise.all([
      db.user.count({ where: { deletedAt: null } }),
      db.shop.count({ where: { deletedAt: null } }),
      db.shop.count({ where: { deletedAt: null, status: "LIVE" } }),
      db.product.count({ where: { deletedAt: null } }),
      db.analyticsEvent.count({ where: { type: "SHOP_VIEW" } }),
      db.enquiry.count(),
      db.subscription.count({ where: { status: "ACTIVE", plan: { priceInr: { gt: 0 } } } }),
      db.payment.aggregate({
        where: { status: "PAID", createdAt: { gte: monthStart } },
        _sum: { amountInr: true },
      }),
    ]);

  const stats = [
    { label: "Total Users", value: totalUsers },
    { label: "Total Shops", value: totalShops },
    { label: "Active Shops", value: activeShops },
    { label: "Total Products", value: totalProducts },
    { label: "Shop Visits", value: totalVisits },
    { label: "WhatsApp Enquiries", value: waEnquiries },
    { label: "Active Paid Subscriptions", value: activeSubs },
    { label: "Revenue This Month (₹)", value: monthlyRevenue._sum.amountInr ?? 0 },
  ];

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-bold">Platform overview</h1>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardContent className="p-4">
              <p className="text-2xl font-bold">{s.value.toLocaleString("en-IN")}</p>
              <p className="text-xs text-ink-500">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
