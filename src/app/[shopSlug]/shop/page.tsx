import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { MapPin, Search, Store, PauseCircle, Share2, ChevronLeft } from "lucide-react";
import { getPublicShop, getPublicProducts, getFeaturedProducts } from "@/lib/storefront";
import { appUrl, cn } from "@/lib/utils";
import { shopContactMessage } from "@/lib/whatsapp";
import { getTheme, themeCssVars, themeFontHref } from "@/lib/themes";
import { ProductCard } from "@/components/storefront/product-card";
import { WhatsAppButton } from "@/components/storefront/whatsapp-button";
import { ShareShopButton } from "@/components/share-buttons";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ shopSlug: string }>;
  searchParams: Promise<{ q?: string; category?: string; sort?: string; stock?: string; page?: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { shopSlug } = await params;
  const shop = await getPublicShop(shopSlug);
  if (!shop) return { title: "Shop not found" };
  const title = `Products — ${shop.name}`;
  const description =
    shop.description ??
    `Browse products from ${shop.name}${shop.city ? ` in ${shop.city}` : ""} and order directly on WhatsApp.`;
  return {
    title: { absolute: title },
    description,
    alternates: { canonical: appUrl(`/${shop.slug}/shop`) },
    openGraph: { title, description, url: appUrl(`/${shop.slug}/shop`), type: "website", siteName: shop.name },
  };
}

export default async function ShopCatalogPage({ params, searchParams }: Props) {
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

  const theme = getTheme(shop.theme?.template);
  const cssVars = themeCssVars(theme, shop.theme?.primaryColor);

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

  const shopUrl = appUrl(`/${shop.slug}`);

  function filterUrl(next: Record<string, string | undefined>): string {
    const merged = { q: sp.q, category: sp.category, sort: sp.sort, stock: sp.stock, ...next };
    const usp = new URLSearchParams();
    for (const [k, v] of Object.entries(merged)) if (v) usp.set(k, v);
    const qs = usp.toString();
    return `/${shop!.slug}/shop${qs ? `?${qs}` : ""}`;
  }

  const headingFont = { fontFamily: "var(--sf-font-heading)" };
  const minimalHero = theme.heroStyle === "minimal";

  return (
    <div
      className="min-h-dvh pb-24"
      style={{ ...cssVars, background: "var(--sf-bg)", color: "var(--sf-ink)", fontFamily: "var(--sf-font-body)" }}
    >
      <link rel="stylesheet" href={themeFontHref(theme)} />

      {/* Compact shop header — the full introduction lives on the welcome page */}
      {!minimalHero && (
        <div className="relative h-28 w-full sm:h-36" style={{ background: "var(--sf-surface)" }}>
          {shop.coverUrl && (
            <Image src={shop.coverUrl} alt="" fill className="object-cover" priority sizes="100vw" />
          )}
          <div className="absolute inset-0 bg-black/25" />
        </div>
      )}

      <header className={cn("mx-auto max-w-6xl px-4", minimalHero && "pt-8")}>
        <div className={cn("flex items-end justify-between gap-4", !minimalHero && "-mt-9")}>
          <div
            className="relative h-18 w-18 shrink-0 overflow-hidden border-4"
            style={{
              height: "4.5rem",
              width: "4.5rem",
              borderColor: "var(--sf-bg)",
              background: "var(--sf-surface)",
              borderRadius: "var(--sf-radius)",
            }}
          >
            {shop.logoUrl ? (
              <Image src={shop.logoUrl} alt={`${shop.name} logo`} fill className="object-cover" sizes="72px" />
            ) : (
              <span className="flex h-full items-center justify-center opacity-30">
                <Store className="h-7 w-7" />
              </span>
            )}
          </div>
          <ShareShopButton shopName={shop.name} shopUrl={shopUrl} shopSlug={shop.slug}>
            <span
              className="inline-flex h-10 w-10 items-center justify-center border"
              style={{
                borderColor: "var(--sf-border)",
                background: "var(--sf-surface)",
                borderRadius: "var(--sf-radius)",
              }}
              aria-label="Share shop"
              role="button"
            >
              <Share2 className="h-4 w-4" />
            </span>
          </ShareShopButton>
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
          <div className="min-w-0">
            <h1
              className={cn("truncate text-2xl font-bold", theme.upperHeadings && "uppercase tracking-[0.12em]")}
              style={headingFont}
            >
              {shop.name}
            </h1>
            <p className="mt-0.5 flex flex-wrap items-center gap-x-2 text-sm" style={{ color: "var(--sf-muted)" }}>
              <span>{shop.category}</span>
              {shop.city && (
                <span className="inline-flex items-center gap-0.5">
                  <MapPin className="h-3.5 w-3.5" /> {shop.city}
                </span>
              )}
            </p>
          </div>
          <Link
            href={`/${shop.slug}`}
            className="inline-flex items-center gap-1 text-sm font-medium hover:underline"
            style={{ color: "var(--sf-accent)" }}
          >
            <ChevronLeft className="h-4 w-4" /> Shop info
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4">
        {/* Search */}
        <form className="relative mt-6" action={`/${shop.slug}/shop`}>
          <Search
            className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2"
            style={{ color: "var(--sf-muted)" }}
          />
          <input
            type="search"
            name="q"
            defaultValue={filters.q ?? ""}
            placeholder={`Search in ${shop.name}…`}
            className="h-12 w-full border pl-10 pr-4 text-sm focus:outline-none"
            style={{
              background: "var(--sf-surface)",
              borderColor: "var(--sf-border)",
              color: "var(--sf-ink)",
              borderRadius: "var(--sf-radius)",
            }}
          />
          {sp.category && <input type="hidden" name="category" value={sp.category} />}
        </form>

        {/* Categories */}
        {shop.categories.length > 0 && (
          <nav className="no-scrollbar -mx-4 mt-4 flex gap-2 overflow-x-auto px-4 pb-1" aria-label="Categories">
            {[{ slug: "", name: "All" }, ...shop.categories].map((c) => {
              const active = (c.slug || undefined) === filters.category;
              return (
                <Link
                  key={c.slug || "all"}
                  href={filterUrl({ category: c.slug || undefined, page: undefined })}
                  className="shrink-0 border px-4 py-2 text-sm font-medium transition"
                  style={{
                    borderRadius: "999px",
                    background: active ? "var(--sf-accent)" : "var(--sf-surface)",
                    color: active ? "var(--sf-accent-ink)" : "var(--sf-ink)",
                    borderColor: active ? "var(--sf-accent)" : "var(--sf-border)",
                  }}
                >
                  {c.name}
                </Link>
              );
            })}
          </nav>
        )}

        {/* Featured */}
        {featured.length > 0 && (
          <section className="mt-8">
            <h2
              className={cn("mb-3 text-lg font-bold", theme.upperHeadings && "uppercase tracking-[0.14em]")}
              style={headingFont}
            >
              Featured
            </h2>
            <div
              className={cn(
                "grid gap-3 sm:grid-cols-3 lg:grid-cols-4",
                theme.grid.mobileCols === 3 ? "grid-cols-3" : "grid-cols-2",
              )}
            >
              {featured.map((p) => (
                <ProductCard
                  key={p.id}
                  shopSlug={shop.slug}
                  theme={theme}
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

        {/* All products */}
        <section className="mt-8">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h2
              className={cn("text-lg font-bold", theme.upperHeadings && "uppercase tracking-[0.14em]")}
              style={headingFont}
            >
              {filters.q ? `Results for “${filters.q}”` : "All Products"}{" "}
              <span className="text-sm font-normal" style={{ color: "var(--sf-muted)" }}>
                ({total})
              </span>
            </h2>
            <div className="flex gap-2 text-sm">
              <Link
                href={filterUrl({ stock: sp.stock === "in" ? undefined : "in", page: undefined })}
                className="border px-3 py-1.5 font-medium"
                style={{
                  borderRadius: "999px",
                  background: sp.stock === "in" ? "var(--sf-accent)" : "var(--sf-surface)",
                  color: sp.stock === "in" ? "var(--sf-accent-ink)" : "var(--sf-ink)",
                  borderColor: sp.stock === "in" ? "var(--sf-accent)" : "var(--sf-border)",
                }}
              >
                In stock
              </Link>
              <Link
                href={filterUrl({ sort: sp.sort === "price-asc" ? "price-desc" : "price-asc", page: undefined })}
                className="border px-3 py-1.5 font-medium"
                style={{
                  borderRadius: "999px",
                  background: "var(--sf-surface)",
                  color: "var(--sf-ink)",
                  borderColor: "var(--sf-border)",
                }}
              >
                Price {sp.sort === "price-asc" ? "↑" : sp.sort === "price-desc" ? "↓" : ""}
              </Link>
            </div>
          </div>

          {items.length === 0 ? (
            <div
              className="border border-dashed py-16 text-center"
              style={{ borderColor: "var(--sf-border)", borderRadius: "var(--sf-radius)" }}
            >
              <p className="font-medium">No products found</p>
              <p className="mt-1 text-sm" style={{ color: "var(--sf-muted)" }}>
                Try a different search or category.
              </p>
            </div>
          ) : (
            <div
              className={cn(
                "grid gap-3 sm:grid-cols-3 lg:grid-cols-4",
                theme.grid.mobileCols === 3 ? "grid-cols-3" : "grid-cols-2",
              )}
            >
              {items.map((p) => (
                <ProductCard
                  key={p.id}
                  shopSlug={shop.slug}
                  theme={theme}
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
                <Link
                  href={filterUrl({ page: String(page - 1) })}
                  className="border px-4 py-2 font-medium"
                  style={{ borderColor: "var(--sf-border)", borderRadius: "var(--sf-radius)" }}
                >
                  Previous
                </Link>
              )}
              <span style={{ color: "var(--sf-muted)" }}>
                Page {page} / {totalPages}
              </span>
              {page < totalPages && (
                <Link
                  href={filterUrl({ page: String(page + 1) })}
                  className="border px-4 py-2 font-medium"
                  style={{ borderColor: "var(--sf-border)", borderRadius: "var(--sf-radius)" }}
                >
                  Next
                </Link>
              )}
            </nav>
          )}
        </section>

        <footer
          className="mt-14 border-t py-8 text-center text-sm"
          style={{ borderColor: "var(--sf-border)", color: "var(--sf-muted)" }}
        >
          <p>
            {shop.name} · Powered by{" "}
            <Link href="/" className="font-semibold" style={{ color: "var(--sf-accent)" }}>
              SURA SHOP
            </Link>
          </p>
        </footer>
      </main>

      {/* Sticky mobile CTA */}
      <div
        className="fixed inset-x-0 bottom-0 z-40 border-t p-3 backdrop-blur sm:hidden"
        style={{ background: "var(--sf-surface)", borderColor: "var(--sf-border)" }}
      >
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
