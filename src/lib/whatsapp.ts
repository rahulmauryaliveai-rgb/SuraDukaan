/** WhatsApp click-to-chat URL generation (V1 — no Business API required). */

export function normalizeWhatsAppNumber(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  // Indian 10-digit numbers get country code 91.
  if (digits.length === 10) return `91${digits}`;
  if (digits.length === 12 && digits.startsWith("91")) return digits;
  if (digits.startsWith("0") && digits.length === 11) return `91${digits.slice(1)}`;
  return digits;
}

export function waChatUrl(phone: string, message: string): string {
  return `https://wa.me/${normalizeWhatsAppNumber(phone)}?text=${encodeURIComponent(message)}`;
}

export function productOrderMessage(opts: {
  shopName: string;
  productName: string;
  price: string;
  quantity: number;
  variant?: string;
  productUrl: string;
}): string {
  const lines = [
    `Hi ${opts.shopName},`,
    "",
    "I am interested in this product:",
    "",
    `Product: ${opts.productName}`,
    ...(opts.variant ? [`Variant: ${opts.variant}`] : []),
    `Price: ${opts.price}`,
    `Quantity: ${opts.quantity}`,
    "",
    "Product Link:",
    opts.productUrl,
    "",
    "Please confirm availability.",
  ];
  return lines.join("\n");
}

export function productShareMessage(opts: {
  shopName: string;
  productName: string;
  price: string;
  productUrl: string;
}): string {
  return [
    `🔥 Check out this product from ${opts.shopName}`,
    "",
    opts.productName,
    "",
    opts.price,
    "",
    "View:",
    opts.productUrl,
  ].join("\n");
}

export function shopShareMessage(opts: { shopName: string; shopUrl: string }): string {
  return [
    `🛍️ Welcome to ${opts.shopName}!`,
    "",
    "Explore our products online:",
    "",
    opts.shopUrl,
  ].join("\n");
}

export function shopContactMessage(shopName: string): string {
  return `Hi ${shopName}, I found your shop online and I have a question.`;
}
