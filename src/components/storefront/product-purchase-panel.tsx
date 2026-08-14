"use client";

import { useState } from "react";
import { Minus, Plus, Share2 } from "lucide-react";
import { formatINR, discountPercent, cn } from "@/lib/utils";
import { WhatsAppButton } from "@/components/storefront/whatsapp-button";
import { ShareProductButton } from "@/components/share-buttons";
import type { ThemeTokens } from "@/lib/themes";

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
  theme,
}: {
  shop: { name: string; slug: string; whatsapp: string };
  product: PanelProduct;
  productUrl: string;
  theme: ThemeTokens;
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

  const shareTrigger = (
    <span
      role="button"
      className="inline-flex h-12 w-12 items-center justify-center border"
      style={{
        borderColor: "var(--sf-border)",
        background: "var(--sf-surface)",
        borderRadius: "var(--sf-radius)",
      }}
      aria-label="Share product"
    >
      <Share2 className="h-5 w-5" />
    </span>
  );

  return (
    <div className="flex flex-col">
      <h1
        className={cn("text-2xl font-bold leading-snug", theme.upperHeadings && "uppercase tracking-[0.1em]")}
        style={{ fontFamily: "var(--sf-font-heading)" }}
      >
        {product.name}
      </h1>
      {product.brand && (
        <p className="mt-1 text-sm" style={{ color: "var(--sf-muted)" }}>
          by {product.brand}
        </p>
      )}

      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-3xl font-extrabold" style={{ fontFamily: "var(--sf-font-heading)" }}>
          {formatINR(effective)}
        </span>
        {product.discountPrice && (
          <>
            <span className="text-lg line-through" style={{ color: "var(--sf-muted)" }}>
              {formatINR(product.price)}
            </span>
            <span
              className="px-2 py-0.5 text-xs font-bold"
              style={{
                background: "var(--sf-accent)",
                color: "var(--sf-accent-ink)",
                borderRadius: "var(--sf-radius)",
              }}
            >
              {pct}% OFF
            </span>
          </>
        )}
      </div>

      <p className={cn("mt-2 text-sm font-medium", product.inStock ? "text-emerald-600" : "text-red-500")}>
        {product.inStock
          ? product.stock != null && product.stock <= 5
            ? `Only ${product.stock} left`
            : "In stock"
          : "Currently out of stock"}
      </p>

      {/* Variants */}
      {product.variants.map((variant) => (
        <fieldset key={variant.name} className="mt-5">
          <legend className="mb-2 text-sm font-semibold">{variant.name}</legend>
          <div className="flex flex-wrap gap-2">
            {variant.options.map((opt) => {
              const active = selected[variant.name] === opt;
              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setSelected((s) => ({ ...s, [variant.name]: opt }))}
                  className="min-w-11 border px-3.5 py-2 text-sm font-medium transition"
                  style={{
                    borderRadius: "var(--sf-radius)",
                    background: active ? "var(--sf-accent)" : "var(--sf-surface)",
                    color: active ? "var(--sf-accent-ink)" : "var(--sf-ink)",
                    borderColor: active ? "var(--sf-accent)" : "var(--sf-border)",
                  }}
                  aria-pressed={active}
                >
                  {opt}
                </button>
              );
            })}
          </div>
        </fieldset>
      ))}

      {/* Quantity */}
      <div className="mt-5">
        <p className="mb-2 text-sm font-semibold">Quantity</p>
        <div
          className="inline-flex items-center border"
          style={{ borderColor: "var(--sf-border)", background: "var(--sf-surface)", borderRadius: "var(--sf-radius)" }}
        >
          <button
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            className="flex h-11 w-11 items-center justify-center disabled:opacity-40"
            disabled={qty <= 1}
            aria-label="Decrease quantity"
          >
            <Minus className="h-4 w-4" />
          </button>
          <span className="w-10 text-center font-semibold" aria-live="polite">
            {qty}
          </span>
          <button
            onClick={() => setQty((q) => Math.min(99, q + 1))}
            className="flex h-11 w-11 items-center justify-center"
            aria-label="Increase quantity"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </div>

      {product.sku && (
        <p className="mt-3 text-xs" style={{ color: "var(--sf-muted)" }}>
          SKU: {product.sku}
        </p>
      )}

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
          {shareTrigger}
        </ShareProductButton>
      </div>

      {/* Description */}
      {product.description && (
        <section className="mt-8">
          <h2
            className="mb-2 text-sm font-bold uppercase tracking-wide"
            style={{ color: "var(--sf-muted)" }}
          >
            Description
          </h2>
          <p className="whitespace-pre-line text-sm leading-relaxed">{product.description}</p>
        </section>
      )}

      {/* Sticky mobile CTA */}
      <div
        className="fixed inset-x-0 bottom-0 z-40 flex gap-2 border-t p-3 backdrop-blur sm:hidden"
        style={{ background: "var(--sf-surface)", borderColor: "var(--sf-border)" }}
      >
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
          {shareTrigger}
        </ShareProductButton>
      </div>
    </div>
  );
}
