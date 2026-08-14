"use client";

import { MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * WhatsApp click-to-chat CTA. Tracks the click as an enquiry, then opens WhatsApp.
 * Keeps WhatsApp green by default; `useThemeAccent` styles it with the shop theme.
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
  useThemeAccent = false,
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
  useThemeAccent?: boolean;
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
        "inline-flex items-center justify-center gap-2 px-5 py-3 font-semibold shadow-sm transition hover:brightness-110 active:scale-[0.99]",
        !useThemeAccent && "bg-wa-dark text-white rounded-xl",
        className,
      )}
      style={
        useThemeAccent
          ? {
              background: "var(--sf-accent)",
              color: "var(--sf-accent-ink)",
              borderRadius: "var(--sf-radius)",
            }
          : undefined
      }
    >
      <MessageCircle className="h-5 w-5" />
      {label}
    </button>
  );
}
