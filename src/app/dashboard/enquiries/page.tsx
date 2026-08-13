import type { Metadata } from "next";
import { MessageCircle } from "lucide-react";
import { db } from "@/lib/db";
import { requireShop } from "@/lib/auth/session";
import { formatDate } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";

export const metadata: Metadata = { title: "Enquiries" };
export const dynamic = "force-dynamic";

const PAGE_SIZE = 30;

export default async function EnquiriesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { shop } = await requireShop();
  const { page: pageRaw = "1" } = await searchParams;
  const page = Math.max(1, Number(pageRaw) || 1);

  const [enquiries, total] = await Promise.all([
    db.enquiry.findMany({
      where: { shopId: shop.id },
      include: { product: { select: { name: true, slug: true } } },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    db.enquiry.count({ where: { shopId: shop.id } }),
  ]);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold">WhatsApp Enquiries</h1>
        <p className="mt-1 text-sm text-ink-500">
          Recorded when a customer taps “Order on WhatsApp”. An enquiry is an interest signal —
          confirm the actual order in your WhatsApp chat.
        </p>
      </div>

      {enquiries.length === 0 ? (
        <EmptyState
          icon={<MessageCircle className="h-10 w-10" />}
          title="No enquiries yet"
          description="Share your shop link on WhatsApp and social media to start receiving enquiries."
        />
      ) : (
        <Card>
          <ul className="divide-y divide-ink-100">
            {enquiries.map((e) => (
              <li key={e.id} className="flex items-center gap-3 px-4 py-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-wa/10 text-wa-dark">
                  <MessageCircle className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">
                    {e.productName ?? e.product?.name ?? "General enquiry"}
                    {e.variant && <span className="text-ink-500"> · {e.variant}</span>}
                  </p>
                  <p className="text-xs text-ink-500">
                    Qty {e.quantity} · {formatDate(e.createdAt)} ·{" "}
                    {e.source === "PRODUCT_PAGE" ? "Product page" : e.source === "STOREFRONT" ? "Shop page" : "Shared link"}
                  </p>
                </div>
                <Badge tone="brand">WhatsApp</Badge>
              </li>
            ))}
          </ul>
        </Card>
      )}
      {total > PAGE_SIZE && (
        <p className="text-center text-sm text-ink-500">
          Showing {Math.min(page * PAGE_SIZE, total)} of {total}
        </p>
      )}
    </div>
  );
}
