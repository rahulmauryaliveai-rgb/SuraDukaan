"use client";

import { useEffect } from "react";

/** Fire-and-forget view tracking. No cookies, no PII. */
export function TrackView({
  shopSlug,
  type,
  productId,
}: {
  shopSlug: string;
  type: "SHOP_VIEW" | "PRODUCT_VIEW";
  productId?: string;
}) {
  useEffect(() => {
    const t = setTimeout(() => {
      void fetch("/api/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ shopSlug, type, productId }),
        keepalive: true,
      }).catch(() => undefined);
    }, 400);
    return () => clearTimeout(t);
  }, [shopSlug, type, productId]);
  return null;
}
