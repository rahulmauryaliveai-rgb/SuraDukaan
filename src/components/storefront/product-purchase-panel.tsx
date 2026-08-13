"use client";

import { useState } from "react";
import { Minus, Plus, Share2 } from "lucide-react";
import { formatINR, discountPercent } from "@/lib/utils";
import { WhatsAppButton } from "@/components/storefront/whatsapp-button";
import { ShareProductButton } from "@/components/share-buttons";
import { cn } from "@/lib/utils";

interface PanelProduct {
  id: string;
  name: string;
  price: number;
  discountPrice: number | null;
  description: string | null;
  inStock: boolean;
  stock: number | null;
  sku: string | null;
  brand: string | null;
  variants: { name: string; options: string[] }[];
}

export function ProductPurchasePanel({
  shop,
  product,
  productUrl,
}: {
  shop: { name: string; slug: string; whatsapp: string };
  product: PanelProduct;
  productUrl: string;
}) {
  const [qty, setQty] = useState(1);
  const [selected, setSelected] = useState<Record<string, string>>({});

  const effective = product.discountPrice ?? product.price;
  const pct = product.discountPrice ? discountPercent(product.price, product.discountPrice) : 0;
  const variantText = Object.entries(selected)
    .map(([k, v]) => `${k}: ${v}`)
    .join(", ");

  const message = [
    `Hi ${shop.name},`,
    "",
    "I am interested in this product:",
    "",
    `Product: ${product.name}`,
    ...(variantText ? [`Variant: ${variantText}`] : []),
    `Price: ${formatINR(effective)}`,
    `Quantity: ${qty}`,
    "",
    "Product Link:",
    productUrl,
    "",
    "Please confirm availability.",
  ].join("\n");

  return (
    <div className="flex flex-col">
      <h1 className="text-2xl font-bold leading-snug">{product.name}</h1>
      {product.brand && <p className="mt-1 text-sm text-ink-500">by {product.brand}</p>}

      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-3xl font-extrabold">{formatINR(effective)}</span>
        {product.discountPrice && (
          <>
            <span className="text-lg text-ink-500 line-through">{formatINR(product.price)}</span>
            <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-bold text-red-700">{pct}% OFF</span>
          </>
        )}
      </div>

      <p className={cn("mt-2 text-sm font-medium", product.inStock ? "text-emerald-700" : "text-red-600")}>
        {product.inStock
          ? product.stock != null && product.stock <= 5
            ? `Only ${product.stock} left`
            : "In stock"
          : "Currently out of stock"}
      </p>

      {/* Variants */}
      {product.variants.map((variant) => (
        <fieldset key={variant.name} className="mt-5">
          <legend className="mb-2 text-sm font-semibold text-ink-700">{variant.name}</legend>
          <div className="flex flex-wrap gap-2">
            {variant.options.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => setSelected((s) => ({ ...s, [variant.name]: opt }))}
                className={cn(
                  "min-w-11 rounded-xl border px-3.5 py-2 text-sm font-medium transition",
                  selected[variant.name] === opt
                    ? "border-brand-700 bg-brand-700 text-white"
                    : "border-ink-300 bg-white text-ink-700 hover:border-ink-500",
                )}
                aria-pressed={selected[variant.name] === opt}
              >
                {opt}
              </button>
            ))}
          </div>
        </fieldset>
      ))}

      {/* Quantity */}
      <div className="mt-5">
        <p className="mb-2 text-sm font-semibold text-ink-700">Quantity</p>
        <div className="inline-flex items-center rounded-xl border border-ink-300 bg-white">
          <button
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            className="flex h-11 w-11 items-center justify-center text-ink-700 hover:bg-ink-50 disabled:opacity-40"
            disabled={qty <= 1}
            aria-label="Decrease quantity"
          >
            <Minus className="h-4 w-4" />
          </button>
          <span className="w-10 text-center font-semibold" aria-live="polite">{qty}</span>
          <button
            onClick={() => setQty((q) => Math.min(99, q + 1))}
            className="flex h-11 w-11 items-center justify-center text-ink-700 hover:bg-ink-50"
            aria-label="Increase quantity"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </div>

      {product.sku && <p className="mt-3 text-xs text-ink-500">SKU: {product.sku}</p>}

      {/* CTAs (desktop) */}
      <div className="mt-6 hidden gap-3 sm:flex">
        <WhatsAppButton
          phone={shop.whatsapp}
          message={message}
          shopSlug={shop.slug}
          productId={product.id}
          variant={variantText || undefined}
          quantity={qty}
          className="flex-1"
        />
        <ShareProductButton
          shopName={shop.name}
          shopSlug={shop.slug}
          productId={product.id}
          productName={product.name}
          price={formatINR(effective)}
          productUrl={productUrl}
        >
          <span role="button" className="inline-flex h-12 w-12 items-center justify-center rounded-xl border border-ink-300 bg-white text-ink-700 hover:bg-ink-50" aria-label="Share product">
            <Share2 className="h-5 w-5" />
          </span>
        </ShareProductButton>
      </div>

      {/* Description */}
      {product.description && (
        <section className="mt-8">
          <h2 className="mb-2 text-sm font-bold uppercase tracking-wide text-ink-500">Description</h2>
          <p className="whitespace-pre-line text-sm leading-relaxed text-ink-700">{product.description}</p>
        </section>
      )}

      {/* Sticky mobile CTA */}
      <div className="fixed inset-x-0 bottom-0 z-40 flex gap-2 border-t border-ink-100 bg-white/95 p-3 backdrop-blur sm:hidden">
        <WhatsAppButton
          phone={shop.whatsapp}
          message={message}
          shopSlug={shop.slug}
          productId={product.id}
          variant={variantText || undefined}
          quantity={qty}
          className="flex-1"
        />
        <ShareProductButton
          shopName={shop.name}
          shopSlug={shop.slug}
          productId={product.id}
          productName={product.name}
          price={formatINR(effective)}
          productUrl={productUrl}
        >
          <span role="button" className="inline-flex h-12 w-12 items-center justify-center rounded-xl border border-ink-300 bg-white text-ink-700" aria-label="Share product">
            <Share2 className="h-5 w-5" />
          </span>
        </ShareProductButton>
      </div>
    </div>
  );
}
