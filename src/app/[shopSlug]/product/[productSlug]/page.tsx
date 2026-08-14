import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { getPublicProduct } from "@/lib/storefront";
import { appUrl } from "@/lib/utils";
import { getTheme, themeCssVars, themeFontHref } from "@/lib/themes";
import { TrackView } from "@/components/storefront/track-view";
import { ProductPurchasePanel } from "@/components/storefront/product-purchase-panel";
import { ProductGallery } from "@/components/storefront/product-gallery";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ shopSlug: string; productSlug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { shopSlug, productSlug } = await params;
  const data = await getPublicProduct(shopSlug, productSlug);
  if (!data) return { title: "Product not found" };
  const { shop, product } = data;
  const title = `${product.name} — ${shop.name}`;
  const description =
    product.description?.slice(0, 160) ?? `${product.name} available at ${shop.name}. Order on WhatsApp.`;
  const url = appUrl(`/${shop.slug}/product/${product.slug}`);
  return {
    title: { absolute: title },
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      type: "website",
      ...(product.images[0] ? { images: [product.images[0].url] } : {}),
    },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function ProductPage({ params }: Props) {
  const { shopSlug, productSlug } = await params;
  const data = await getPublicProduct(shopSlug, productSlug);
  if (!data) notFound();
  const { shop, product } = data;
  if (shop.status !== "LIVE") notFound();

  const price = Number(product.price);
  const discountPrice = product.discountPrice ? Number(product.discountPrice) : null;
  const productUrl = appUrl(`/${shop.slug}/product/${product.slug}`);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    ...(product.description ? { description: product.description } : {}),
    ...(product.images.length ? { image: product.images.map((i) => i.url) } : {}),
    ...(product.sku ? { sku: product.sku } : {}),
    ...(product.brand ? { brand: { "@type": "Brand", name: product.brand } } : {}),
    offers: {
      "@type": "Offer",
      url: productUrl,
      priceCurrency: "INR",
      price: discountPrice ?? price,
      availability: product.inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
    },
  };

  const theme = getTheme(shop.theme?.template);
  const cssVars = themeCssVars(theme, shop.theme?.primaryColor);

  return (
    <div
      className="min-h-dvh pb-28 sm:pb-10"
      style={{ ...cssVars, background: "var(--sf-bg)", color: "var(--sf-ink)", fontFamily: "var(--sf-font-body)" }}
    >
      <link rel="stylesheet" href={themeFontHref(theme)} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <TrackView shopSlug={shop.slug} type="PRODUCT_VIEW" productId={product.id} />

      <header
        className="sticky top-0 z-30 border-b backdrop-blur"
        style={{ background: "var(--sf-surface)", borderColor: "var(--sf-border)" }}
      >
        <div className="mx-auto flex h-14 max-w-5xl items-center gap-2 px-4">
          <Link
            href={`/${shop.slug}/shop`}
            className="inline-flex items-center gap-1 px-2 py-1.5 text-sm font-medium"
            style={{ color: "var(--sf-ink)" }}
          >
            <ChevronLeft className="h-4 w-4" />
            {shop.name}
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6">
        <div className="grid gap-8 md:grid-cols-2">
          <ProductGallery
            images={product.images.map((i) => ({ url: i.url, alt: i.alt ?? product.name }))}
            productName={product.name}
          />
          <ProductPurchasePanel
            theme={theme}
            shop={{ name: shop.name, slug: shop.slug, whatsapp: shop.whatsapp }}
            product={{
              id: product.id,
              name: product.name,
              price,
              discountPrice,
              description: product.description,
              inStock: product.inStock,
              stock: product.stock,
              sku: product.sku,
              brand: product.brand,
              variants: product.variants.map((v) => ({
                name: v.name,
                options: JSON.parse(v.options) as string[],
              })),
            }}
            productUrl={productUrl}
          />
        </div>
      </main>
    </div>
  );
}
