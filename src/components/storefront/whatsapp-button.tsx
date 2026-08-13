"use client";

import { MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * WhatsApp click-to-chat CTA. Tracks the click as an enquiry, then opens WhatsApp.
 */
export function WhatsAppButton({
  phone,
  message,
  shopSlug,
  productId,
  variant,
  quantity,
  source = "PRODUCT_PAGE",
  label = "Order on WhatsApp",
  className,
  track = true,
}: {
  phone: string;
  message: string;
  shopSlug?: string;
  productId?: string;
  variant?: string;
  quantity?: number;
  source?: "PRODUCT_PAGE" | "STOREFRONT" | "SHARE";
  label?: string;
  className?: string;
  track?: boolean;
}) {
  function digitsOnly(raw: string): string {
    const d = raw.replace(/\D/g, "");
    if (d.length === 10) return `91${d}`;
    return d;
  }

  function onClick() {
    if (track && shopSlug) {
      void fetch("/api/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shopSlug,
          type: "WHATSAPP_CLICK",
          productId,
          variant,
          quantity,
          source,
        }),
        keepalive: true,
      }).catch(() => undefined);
    }
    window.open(
      `https://wa.me/${digitsOnly(phone)}?text=${encodeURIComponent(message)}`,
      "_blank",
      "noopener",
    );
  }

  return (
    <button
      onClick={onClick}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl bg-wa-dark px-5 py-3 font-semibold text-white shadow-sm transition hover:brightness-110 active:scale-[0.99]",
        className,
      )}
    >
      <MessageCircle className="h-5 w-5" />
      {label}
    </button>
  );
}
