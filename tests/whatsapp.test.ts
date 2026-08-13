import { describe, it, expect } from "vitest";
import {
  normalizeWhatsAppNumber,
  waChatUrl,
  productOrderMessage,
  productShareMessage,
  shopShareMessage,
} from "@/lib/whatsapp";

describe("normalizeWhatsAppNumber", () => {
  it("adds country code for 10-digit Indian numbers", () => {
    expect(normalizeWhatsAppNumber("9876543210")).toBe("919876543210");
  });
  it("keeps already prefixed numbers", () => {
    expect(normalizeWhatsAppNumber("919876543210")).toBe("919876543210");
  });
  it("strips formatting characters", () => {
    expect(normalizeWhatsAppNumber("+91 98765-43210")).toBe("919876543210");
  });
  it("handles leading zero", () => {
    expect(normalizeWhatsAppNumber("09876543210")).toBe("919876543210");
  });
});

describe("waChatUrl", () => {
  it("builds a valid wa.me URL with encoded message", () => {
    const url = waChatUrl("9876543210", "Hi there & welcome");
    expect(url).toContain("https://wa.me/919876543210?text=");
    expect(url).toContain(encodeURIComponent("Hi there & welcome"));
  });
});

describe("message templates", () => {
  it("order message contains product, price, qty and link", () => {
    const msg = productOrderMessage({
      shopName: "Sharma Fashion",
      productName: "Premium Cotton Shirt",
      price: "₹899",
      quantity: 2,
      variant: "Size: L",
      productUrl: "https://sura.shop/sharma-fashion/product/premium-cotton-shirt",
    });
    expect(msg).toContain("Hi Sharma Fashion,");
    expect(msg).toContain("Product: Premium Cotton Shirt");
    expect(msg).toContain("Variant: Size: L");
    expect(msg).toContain("Price: ₹899");
    expect(msg).toContain("Quantity: 2");
    expect(msg).toContain("https://sura.shop/sharma-fashion/product/premium-cotton-shirt");
    expect(msg).toContain("Please confirm availability.");
  });

  it("share messages include shop name and URL", () => {
    expect(
      productShareMessage({ shopName: "S", productName: "P", price: "₹1", productUrl: "u" }),
    ).toContain("🔥");
    expect(shopShareMessage({ shopName: "Sharma Fashion", shopUrl: "https://x" })).toContain(
      "🛍️ Welcome to Sharma Fashion!",
    );
  });
});
