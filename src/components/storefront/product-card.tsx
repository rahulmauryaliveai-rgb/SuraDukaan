import Link from "next/link";
import Image from "next/image";
import { Package } from "lucide-react";
import { formatINR, discountPercent } from "@/lib/utils";

export interface ProductCardData {
  name: string;
  slug: string;
  price: number;
  discountPrice: number | null;
  inStock: boolean;
  imageUrl: string | null;
}

export function ProductCard({ shopSlug, product }: { shopSlug: string; product: ProductCardData }) {
  const pct = product.discountPrice ? discountPercent(product.price, product.discountPrice) : 0;
  return (
    <Link
      href={`/${shopSlug}/product/${product.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-ink-100 bg-white shadow-card transition hover:shadow-card-hover"
    >
      <div className="relative aspect-square overflow-hidden bg-ink-100">
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
          <span className="flex h-full items-center justify-center text-ink-300">
            <Package className="h-10 w-10" />
          </span>
        )}
        {pct > 0 && (
          <span className="absolute left-2 top-2 rounded-full bg-red-600 px-2 py-0.5 text-xs font-bold text-white">
            {pct}% OFF
          </span>
        )}
        {!product.inStock && (
          <span className="absolute inset-x-0 bottom-0 bg-ink-900/70 py-1 text-center text-xs font-semibold text-white">
            Out of stock
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-3">
        <h3 className="line-clamp-2 text-sm font-medium text-ink-900">{product.name}</h3>
        <div className="mt-auto flex items-baseline gap-1.5 pt-2">
          <span className="text-base font-bold text-ink-900">
            {formatINR(product.discountPrice ?? product.price)}
          </span>
          {product.discountPrice && (
            <span className="text-xs text-ink-500 line-through">{formatINR(product.price)}</span>
          )}
        </div>
      </div>
    </Link>
  );
}
