import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { MapPin, Search, Store, PauseCircle } from "lucide-react";
import { getPublicShop, getPublicProducts, getFeaturedProducts } from "@/lib/storefront";
import { appUrl } from "@/lib/utils";
import { shopContactMessage } from "@/lib/whatsapp";
import { ProductCard } from "@/components/storefront/product-card";
import { WhatsAppButton } from "@/components/storefront/whatsapp-button";
import { TrackView } from "@/components/storefront/track-view";
import { ShareShopButton } from "@/components/share-buttons";
import { Share2 } from "lucide-react";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ shopSlug: string }>;
  searchParams: Promise<{ q?: string; category?: string; sort?: string; stock?: string; page?: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { shopSlug } = await params;
  const shop = await getPublicShop(shopSlug);
  if (!shop) return { title: "Shop not found" };
  const title = `${shop.name} — Online Shop`;
  const description =
    shop.description ??
    `Browse products from ${shop.name}${shop.city ? ` in ${shop.city}` : ""} and order directly on WhatsApp.`;
  const url = appUrl(`/${shop.slug}`);
  return {
    title: { absolute: title },
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      type: "website",
      siteName: shop.name,
      ...(shop.coverUrl || shop.logoUrl ? { images: [shop.coverUrl ?? shop.logoUrl!] } : {}),
    },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function StorefrontPage({ params, searchParams }: Props) {
  const { shopSlug } = await params;
  const sp = await searchParams;
  const shop = await getPublicShop(shopSlug);
  if (!shop) notFound();

  if (shop.status !== "LIVE") {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center bg-ink-50 px-4 text-center">
        <PauseCircle className="mb-4 h-12 w-12 text-ink-300" />
        <h1 className="text-xl font-bold">{shop.name}</h1>
        <p className="mt-2 text-ink-500">This shop is temporarily unavailable.</p>
      </div>
    );
  }

  const filters = {
    q: sp.q?.trim() || undefined,
    category: sp.category || undefined,
    sort: (["new", "price-asc", "price-desc"].includes(sp.sort ?? "") ? sp.sort : "new") as
      | "new"
      | "price-asc"
      | "price-desc",
    inStock: sp.stock === "in",
    page: Number(sp.page) || 1,
  };
  const isFiltered = !!(filters.q || filters.category || sp.sort || sp.stock);

  if (filters.q && filters.page === 1) {
    const { trackEvent } = await import("@/lib/analytics");
    void trackEvent({ shopId: shop.id, type: "SEARCH", meta: { query: filters.q } });
  }

  const [{ items, total, page, totalPages }, featured] = await Promise.all([
    getPublicProducts(shop.id, filters),
    isFiltered ? Promise.resolve([]) : getFeaturedProducts(shop.id),
  ]);

  const primary = shop.theme?.primaryColor ?? "#0f766e";
  const shopUrl = appUrl(`/${shop.slug}`);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: shop.name,
    url: shopUrl,
    ...(shop.description ? { description: shop.description } : {}),
    ...(shop.city ? { address: { "@type": "PostalAddress", addressLocality: shop.city, addressCountry: "IN" } } : {}),
    ...(shop.logoUrl ? { image: shop.logoUrl } : {}),
  };

  function filterUrl(next: Record<string, string | undefined>): string {
    const merged = { q: sp.q, category: sp.category, sort: sp.sort, stock: sp.stock, ...next };
    const usp = new URLSearchParams();
    for (const [k, v] of Object.entries(merged)) if (v) usp.set(k, v);
    const qs = usp.toString();
    return `/${shop!.slug}${qs ? `?${qs}` : ""}`;
  }

  return (
    <div className="min-h-dvh bg-ink-50 pb-24" style={{ ["--sf-primary" as string]: primary }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <TrackView shopSlug={shop.slug} type="SHOP_VIEW" />

      {/* Cover */}
      <div className="relative h-36 w-full bg-gradient-to-r from-ink-900 to-ink-700 sm:h-48">
        {shop.coverUrl && (
          <Image src={shop.coverUrl} alt="" fill className="object-cover" priority sizes="100vw" />
        )}
      </div>

      {/* Shop header */}
      <header className="mx-auto max-w-6xl px-4">
        {/* Only the logo overlaps the cover; name stays on the white area below */}
        <div className="-mt-10 flex items-end justify-between gap-4">
          <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl border-4 border-white bg-white shadow-card">
            {shop.logoUrl ? (
              <Image src={shop.logoUrl} alt={`${shop.name} logo`} fill className="object-cover" sizes="80px" />
            ) : (
              <span className="flex h-full items-center justify-center text-ink-300">
                <Store className="h-8 w-8" />
              </span>
            )}
          </div>
          <ShareShopButton shopName={shop.name} shopUrl={shopUrl} shopSlug={shop.slug}>
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-ink-300 bg-white text-ink-700 shadow-sm hover:bg-ink-50" aria-label="Share shop" role="button">
              <Share2 className="h-4 w-4" />
            </span>
          </ShareShopButton>
        </div>
        <div className="mt-3 min-w-0">
          <h1 className="truncate text-2xl font-bold sm:text-3xl">{shop.name}</h1>
          <p className="mt-0.5 flex flex-wrap items-center gap-x-2 text-sm text-ink-500">
            <span>{shop.category}</span>
            {shop.city && (
              <span className="inline-flex items-center gap-0.5">
                <MapPin className="h-3.5 w-3.5" /> {shop.city}
              </span>
            )}
          </p>
        </div>
        {shop.description && <p className="mt-3 max-w-2xl text-sm text-ink-700">{shop.description}</p>}
        <div className="mt-4">
          <WhatsAppButton
            phone={shop.whatsapp}
            message={shopContactMessage(shop.name)}
            shopSlug={shop.slug}
            source="STOREFRONT"
            label="Chat on WhatsApp"
            className="h-11 px-4 py-0 text-sm"
          />
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4">
        {/* Search */}
        <form className="relative mt-6" action={`/${shop.slug}`}>
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-500" />
          <input
            type="search"
            name="q"
            defaultValue={filters.q ?? ""}
            placeholder={`Search in ${shop.name}…`}
            className="h-12 w-full rounded-2xl border border-ink-100 bg-white pl-10 pr-4 text-sm shadow-card focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-600/20"
          />
          {sp.category && <input type="hidden" name="category" value={sp.category} />}
        </form>

        {/* Categories */}
        {shop.categories.length > 0 && (
          <nav className="no-scrollbar -mx-4 mt-4 flex gap-2 overflow-x-auto px-4 pb-1" aria-label="Categories">
            <Link
              href={filterUrl({ category: undefined, page: undefined })}
              className={cn(
                "shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition",
                !filters.category
                  ? "border-transparent bg-ink-900 text-white"
                  : "border-ink-300 bg-white text-ink-700 hover:bg-ink-100",
              )}
            >
              All
            </Link>
            {shop.categories.map((c) => (
              <Link
                key={c.id}
                href={filterUrl({ category: c.slug, page: undefined })}
                className={cn(
                  "shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition",
                  filters.category === c.slug
                    ? "border-transparent bg-ink-900 text-white"
                    : "border-ink-300 bg-white text-ink-700 hover:bg-ink-100",
                )}
              >
                {c.name}
              </Link>
            ))}
          </nav>
        )}

        {/* Featured */}
        {featured.length > 0 && (
          <section className="mt-8">
            <h2 className="mb-3 text-lg font-bold">Featured</h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {featured.map((p) => (
                <ProductCard
                  key={p.id}
                  shopSlug={shop.slug}
                  product={{
                    name: p.name,
                    slug: p.slug,
                    price: Number(p.price),
                    discountPrice: p.discountPrice ? Number(p.discountPrice) : null,
                    inStock: p.inStock,
                    imageUrl: p.images[0]?.url ?? null,
                  }}
                />
              ))}
            </div>
          </section>
        )}

        {/* All products + filters */}
        <section className="mt-8">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-lg font-bold">
              {filters.q ? `Results for “${filters.q}”` : "All Products"}{" "}
              <span className="text-sm font-normal text-ink-500">({total})</span>
            </h2>
            <div className="flex gap-2 text-sm">
              <Link
                href={filterUrl({ stock: sp.stock === "in" ? undefined : "in", page: undefined })}
                className={cn(
                  "rounded-full border px-3 py-1.5 font-medium",
                  sp.stock === "in" ? "border-transparent bg-ink-900 text-white" : "border-ink-300 bg-white text-ink-700",
                )}
              >
                In stock
              </Link>
              <Link
                href={filterUrl({ sort: sp.sort === "price-asc" ? "price-desc" : "price-asc", page: undefined })}
                className="rounded-full border border-ink-300 bg-white px-3 py-1.5 font-medium text-ink-700"
              >
                Price {sp.sort === "price-asc" ? "↑" : sp.sort === "price-desc" ? "↓" : ""}
              </Link>
            </div>
          </div>

          {items.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-ink-300 bg-white/60 py-16 text-center">
              <p className="font-medium text-ink-700">No products found</p>
              <p className="mt-1 text-sm text-ink-500">Try a different search or category.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {items.map((p) => (
                <ProductCard
                  key={p.id}
                  shopSlug={shop.slug}
                  product={{
                    name: p.name,
                    slug: p.slug,
                    price: Number(p.price),
                    discountPrice: p.discountPrice ? Number(p.discountPrice) : null,
                    inStock: p.inStock,
                    imageUrl: p.images[0]?.url ?? null,
                  }}
                />
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <nav className="mt-6 flex items-center justify-center gap-3 text-sm" aria-label="Pagination">
              {page > 1 && (
                <Link href={filterUrl({ page: String(page - 1) })} className="rounded-xl border border-ink-300 bg-white px-4 py-2 font-medium">
                  Previous
                </Link>
              )}
              <span className="text-ink-500">Page {page} / {totalPages}</span>
              {page < totalPages && (
                <Link href={filterUrl({ page: String(page + 1) })} className="rounded-xl border border-ink-300 bg-white px-4 py-2 font-medium">
                  Next
                </Link>
              )}
            </nav>
          )}
        </section>

        {/* Branding footer */}
        <footer className="mt-14 border-t border-ink-100 py-8 text-center text-sm text-ink-500">
          <p>
            {shop.name} · Powered by{" "}
            <Link href="/" className="font-semibold text-brand-700 hover:underline">
              SURA SHOP
            </Link>
          </p>
        </footer>
      </main>

      {/* Sticky WhatsApp CTA (mobile) */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-ink-100 bg-white/95 p-3 backdrop-blur sm:hidden">
        <WhatsAppButton
          phone={shop.whatsapp}
          message={shopContactMessage(shop.name)}
          shopSlug={shop.slug}
          source="STOREFRONT"
          label="Chat on WhatsApp"
          className="w-full"
        />
      </div>
    </div>
  );
}
