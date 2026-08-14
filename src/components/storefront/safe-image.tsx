"use client";

import { useState } from "react";
import Image, { type ImageProps } from "next/image";
import { Package } from "lucide-react";

/**
 * Image that degrades to a themed placeholder instead of a broken-image icon.
 * Product photos come from shop owners and third-party URLs, so any of them can
 * disappear at any time — the storefront must never look broken because of it.
 */
export function SafeImage({
  src,
  alt,
  label,
  ...props
}: Omit<ImageProps, "src"> & { src: string | null | undefined; label?: string }) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <span
        className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 px-2 text-center"
        style={{ background: "var(--sf-surface)", color: "var(--sf-muted)" }}
        aria-label={alt || label || "Image unavailable"}
      >
        <Package className="h-7 w-7 opacity-40" />
        {label && <span className="line-clamp-2 text-[10px] font-medium opacity-70">{label}</span>}
      </span>
    );
  }

  return <Image src={src} alt={alt} onError={() => setFailed(true)} {...props} />;
}
