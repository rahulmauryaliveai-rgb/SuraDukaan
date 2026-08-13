"use client";

import { useState, type ReactNode } from "react";
import { MessageCircle, Link2, Share2, X, Check } from "lucide-react";

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5.02 3.66 9.18 8.44 9.94v-7.03H7.9v-2.91h2.54V9.85c0-2.52 1.5-3.91 3.78-3.91 1.09 0 2.24.2 2.24.2v2.47H15.2c-1.24 0-1.63.78-1.63 1.57v1.88h2.78l-.45 2.9h-2.33V22c4.78-.76 8.43-4.92 8.43-9.94Z" />
    </svg>
  );
}

function track(shopSlug: string | undefined, type: "SHOP_SHARE" | "PRODUCT_SHARE", productId?: string) {
  if (!shopSlug) return;
  void fetch("/api/track", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ shopSlug, type, productId }),
    keepalive: true,
  }).catch(() => undefined);
}

function ShareSheet({
  open,
  onClose,
  url,
  waMessage,
  onShared,
}: {
  open: boolean;
  onClose: () => void;
  url: string;
  waMessage: string;
  onShared: () => void;
}) {
  const [copied, setCopied] = useState(false);
  if (!open) return null;

  const options = [
    {
      label: "WhatsApp",
      icon: <MessageCircle className="h-5 w-5 text-wa-dark" />,
      action: () => {
        onShared();
        window.open(`https://wa.me/?text=${encodeURIComponent(waMessage)}`, "_blank", "noopener");
      },
    },
    {
      label: copied ? "Copied!" : "Copy Link",
      icon: copied ? <Check className="h-5 w-5 text-emerald-600" /> : <Link2 className="h-5 w-5 text-ink-500" />,
      action: async () => {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        onShared();
        setTimeout(() => setCopied(false), 2000);
      },
    },
    {
      label: "Facebook",
      icon: <FacebookIcon className="h-5 w-5 text-blue-600" />,
      action: () => {
        onShared();
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, "_blank", "noopener");
      },
    },
    ...(typeof navigator !== "undefined" && "share" in navigator
      ? [
          {
            label: "More…",
            icon: <Share2 className="h-5 w-5 text-ink-500" />,
            action: () => {
              onShared();
              void navigator.share({ url, text: waMessage }).catch(() => undefined);
            },
          },
        ]
      : []),
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center" role="dialog" aria-modal="true">
      <button className="absolute inset-0 bg-ink-900/40" onClick={onClose} aria-label="Close" />
      <div className="relative w-full max-w-sm rounded-t-2xl bg-white p-5 shadow-xl sm:rounded-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-semibold">Share</h3>
          <button onClick={onClose} className="rounded-lg p-1 hover:bg-ink-100" aria-label="Close share sheet">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {options.map((o) => (
            <button
              key={o.label}
              onClick={o.action}
              className="flex items-center gap-2.5 rounded-xl border border-ink-100 px-4 py-3 text-sm font-medium hover:bg-ink-50"
            >
              {o.icon}
              {o.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export function ShareShopButton({
  shopName,
  shopUrl,
  shopSlug,
  children,
}: {
  shopName: string;
  shopUrl: string;
  shopSlug?: string;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const message = `🛍️ Welcome to ${shopName}!\n\nExplore our products online:\n\n${shopUrl}`;
  return (
    <>
      <span onClick={() => setOpen(true)} className="inline-flex cursor-pointer">
        {children}
      </span>
      <ShareSheet
        open={open}
        onClose={() => setOpen(false)}
        url={shopUrl}
        waMessage={message}
        onShared={() => track(shopSlug, "SHOP_SHARE")}
      />
    </>
  );
}

export function ShareProductButton({
  shopName,
  shopSlug,
  productId,
  productName,
  price,
  productUrl,
  children,
}: {
  shopName: string;
  shopSlug?: string;
  productId?: string;
  productName: string;
  price: string;
  productUrl: string;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const message = `🔥 Check out this product from ${shopName}\n\n${productName}\n\n${price}\n\nView:\n${productUrl}`;
  return (
    <>
      <span onClick={() => setOpen(true)} className="inline-flex cursor-pointer">
        {children}
      </span>
      <ShareSheet
        open={open}
        onClose={() => setOpen(false)}
        url={productUrl}
        waMessage={message}
        onShared={() => track(shopSlug, "PRODUCT_SHARE", productId)}
      />
    </>
  );
}
