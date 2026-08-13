import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import {
  Eye,
  Package,
  MessageCircle,
  MousePointerClick,
  Plus,
  FolderPlus,
  Share2,
  QrCode,
  Pencil,
} from "lucide-react";
import { db } from "@/lib/db";
import { requireShop } from "@/lib/auth/session";
import { formatINR, formatDate, appUrl } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { OnboardingChecklist } from "@/components/dashboard/onboarding-checklist";
import { ShareShopButton } from "@/components/share-buttons";

export const metadata: Metadata = { title: "Dashboard" };
export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const { shop } = await requireShop();

  const [shopViews, productViews, enquiryCount, productCount, recentProducts, recentEnquiries, categoryCount] =
    await Promise.all([
      db.analyticsEvent.count({ where: { shopId: shop.id, type: "SHOP_VIEW" } }),
      db.analyticsEvent.count({ where: { shopId: shop.id, type: "PRODUCT_VIEW" } }),
      db.enquiry.count({ where: { shopId: shop.id } }),
      db.product.count({ where: { shopId: shop.id, deletedAt: null } }),
      db.product.findMany({
        where: { shopId: shop.id, deletedAt: null },
        include: { images: { where: { isMain: true }, take: 1 } },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
      db.enquiry.findMany({
        where: { shopId: shop.id },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
      db.category.count({ where: { shopId: shop.id, deletedAt: null } }),
    ]);

  const stats = [
    { label: "Shop Views", value: shopViews, icon: Eye },
    { label: "Product Views", value: productViews, icon: MousePointerClick },
    { label: "WhatsApp Enquiries", value: enquiryCount, icon: MessageCircle },
    { label: "Products", value: productCount, icon: Package },
  ];

  return (
    <div className="space-y-6">
      <OnboardingChecklist
        hasLogo={!!shop.logoUrl}
        productCount={productCount}
        categoryCount={categoryCount}
        hasDescription={!!shop.description}
      />

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardContent className="flex items-center gap-3 p-4">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
                <s.icon className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <p className="text-2xl font-bold leading-tight">{s.value.toLocaleString("en-IN")}</p>
                <p className="truncate text-xs text-ink-500">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick actions */}
      <div className="flex flex-wrap gap-2">
        <Link href="/dashboard/products/new">
          <Button size="sm">
            <Plus className="h-4 w-4" /> Add Product
          </Button>
        </Link>
        <Link href="/dashboard/categories">
          <Button size="sm" variant="outline">
            <FolderPlus className="h-4 w-4" /> Add Category
          </Button>
        </Link>
        <ShareShopButton shopName={shop.name} shopUrl={appUrl(`/${shop.slug}`)}>
          <Button size="sm" variant="outline">
            <Share2 className="h-4 w-4" /> Share Shop
          </Button>
        </ShareShopButton>
        <Link href="/dashboard/qr-code">
          <Button size="sm" variant="outline">
            <QrCode className="h-4 w-4" /> Download QR
          </Button>
        </Link>
        <Link href="/dashboard/settings">
          <Button size="sm" variant="ghost">
            <Pencil className="h-4 w-4" /> Edit Shop
          </Button>
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent products */}
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-semibold">Recent Products</h2>
            <Link href="/dashboard/products" className="text-sm font-medium text-brand-700 hover:underline">
              View all
            </Link>
          </div>
          {recentProducts.length === 0 ? (
            <EmptyState
              icon={<Package className="h-10 w-10" />}
              title="Your shop is waiting for its first product"
              description="Add a product with a photo and price — it takes less than a minute."
              action={
                <Link href="/dashboard/products/new">
                  <Button>+ Add Your First Product</Button>
                </Link>
              }
            />
          ) : (
            <Card>
              <ul className="divide-y divide-ink-100">
                {recentProducts.map((p) => (
                  <li key={p.id}>
                    <Link
                      href={`/dashboard/products/${p.id}`}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-ink-50"
                    >
                      {p.images[0] ? (
                        <Image
                          src={p.images[0].url}
                          alt=""
                          width={44}
                          height={44}
                          className="h-11 w-11 rounded-lg object-cover bg-ink-100"
                        />
                      ) : (
                        <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-ink-100 text-ink-300">
                          <Package className="h-5 w-5" />
                        </span>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{p.name}</p>
                        <p className="text-sm text-ink-500">{formatINR(Number(p.discountPrice ?? p.price))}</p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <Badge tone={p.isPublished ? "success" : "default"}>
                          {p.isPublished ? "Published" : "Draft"}
                        </Badge>
                        {!p.inStock && <Badge tone="danger">Out of stock</Badge>}
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </section>

        {/* Recent enquiries */}
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-semibold">Recent Enquiries</h2>
            <Link href="/dashboard/enquiries" className="text-sm font-medium text-brand-700 hover:underline">
              View all
            </Link>
          </div>
          {recentEnquiries.length === 0 ? (
            <EmptyState
              icon={<MessageCircle className="h-10 w-10" />}
              title="No enquiries yet"
              description="When customers tap 'Order on WhatsApp' in your shop, their enquiries appear here."
            />
          ) : (
            <Card>
              <ul className="divide-y divide-ink-100">
                {recentEnquiries.map((e) => (
                  <li key={e.id} className="flex items-center gap-3 px-4 py-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-wa/10 text-wa-dark">
                      <MessageCircle className="h-4 w-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">
                        {e.productName ?? "General enquiry"}
                        {e.variant ? <span className="text-ink-500"> · {e.variant}</span> : null}
                      </p>
                      <p className="text-xs text-ink-500">
                        Qty {e.quantity} · {formatDate(e.createdAt)}
                      </p>
                    </div>
                    <Badge tone="brand">WhatsApp</Badge>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </section>
      </div>
    </div>
  );
}
