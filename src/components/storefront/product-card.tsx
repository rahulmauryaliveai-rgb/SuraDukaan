import Link from "next/link";
import Image from "next/image";
import { Package } from "lucide-react";
import { formatINR, discountPercent, cn } from "@/lib/utils";
import type { ThemeTokens } from "@/lib/themes";

export interface ProductCardData {
  name: string;
  slug: string;
  price: number;
  discountPrice: number | null;
  inStock: boolean;
  imageUrl: string | null;
}

export function ProductCard({
  shopSlug,
  product,
  theme,
}: {
  shopSlug: string;
  product: ProductCardData;
  theme: ThemeTokens;
}) {
  const pct = product.discountPrice ? discountPercent(product.price, product.discountPrice) : 0;

  const cardChrome =
    theme.cardStyle === "shadow"
      ? "shadow-card hover:shadow-card-hover border"
      : theme.cardStyle === "border"
        ? "border hover:brightness-105"
        : "border-0";

  return (
    <Link
      href={`/${shopSlug}/product/${product.slug}`}
      className={cn(
        "group flex flex-col overflow-hidden transition",
        cardChrome,
        theme.cardStyle === "flat" ? "bg-transparent" : "bg-[var(--sf-surface)]",
      )}
      style={{
        borderRadius: "var(--sf-radius)",
        borderColor: "var(--sf-border)",
      }}
    >
      <div
        className="relative overflow-hidden bg-black/5"
        style={{ aspectRatio: theme.grid.aspect }}
      >
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition duration-300 group-hover:scale-[1.03]"
            loading="lazy"
          />
        ) : (
          <span className="flex h-full items-center justify-center opacity-30">
            <Package className="h-10 w-10" />
          </span>
        )}
        {pct > 0 && (
          <span
            className="absolute left-2 top-2 px-2 py-0.5 text-xs font-bold"
            style={{
              borderRadius: "var(--sf-radius)",
              background: "var(--sf-accent)",
              color: "var(--sf-accent-ink)",
            }}
          >
            {pct}% OFF
          </span>
        )}
        {!product.inStock && (
          <span className="absolute inset-x-0 bottom-0 bg-black/70 py-1 text-center text-xs font-semibold text-white">
            Out of stock
          </span>
        )}
      </div>

      <div className={cn("flex flex-1 flex-col p-3", theme.cardStyle === "flat" && "px-0")}>
        <h3
          className={cn(
            "line-clamp-2 text-sm",
            theme.upperHeadings ? "font-medium uppercase tracking-wide" : "font-medium",
          )}
          style={{ color: "var(--sf-ink)", fontFamily: "var(--sf-font-body)" }}
        >
          {product.name}
        </h3>
        <div className="mt-auto flex items-baseline gap-1.5 pt-2">
          <span
            className="text-base font-bold"
            style={{ color: "var(--sf-ink)", fontFamily: "var(--sf-font-heading)" }}
          >
            {formatINR(product.discountPrice ?? product.price)}
          </span>
          {product.discountPrice && (
            <span className="text-xs line-through" style={{ color: "var(--sf-muted)" }}>
              {formatINR(product.price)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
