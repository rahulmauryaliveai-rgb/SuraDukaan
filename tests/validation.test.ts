import { describe, it, expect } from "vitest";
import { phoneSchema, otpSchema, productSchema, shopCreateSchema } from "@/lib/validation";
import { checkProductLimit } from "@/lib/plans-core";
import { formatINR, discountPercent } from "@/lib/utils";

describe("phoneSchema", () => {
  it("accepts valid Indian mobiles in many formats", () => {
    expect(phoneSchema.parse("9876543210")).toBe("9876543210");
    expect(phoneSchema.parse("+919876543210")).toBe("9876543210");
    expect(phoneSchema.parse("09876543210")).toBe("9876543210");
    expect(phoneSchema.parse("98765 43210")).toBe("9876543210");
  });
  it("rejects invalid numbers", () => {
    expect(() => phoneSchema.parse("12345")).toThrow();
    expect(() => phoneSchema.parse("5876543210")).toThrow(); // must start 6-9
    expect(() => phoneSchema.parse("abcdefghij")).toThrow();
  });
});

describe("otpSchema", () => {
  it("requires exactly 6 digits", () => {
    expect(otpSchema.parse("123456")).toBe("123456");
    expect(() => otpSchema.parse("12345")).toThrow();
    expect(() => otpSchema.parse("12345a")).toThrow();
  });
});

describe("productSchema", () => {
  const base = { name: "Cotton Shirt", price: 899 };

  it("accepts a minimal product", () => {
    const p = productSchema.parse(base);
    expect(p.name).toBe("Cotton Shirt");
    expect(p.price).toBe(899);
  });

  it("rejects discount >= price", () => {
    expect(() => productSchema.parse({ ...base, discountPrice: 899 })).toThrow();
    expect(() => productSchema.parse({ ...base, discountPrice: 999 })).toThrow();
    expect(productSchema.parse({ ...base, discountPrice: 749 }).discountPrice).toBe(749);
  });

  it("rejects non-positive prices", () => {
    expect(() => productSchema.parse({ ...base, price: 0 })).toThrow();
    expect(() => productSchema.parse({ ...base, price: -5 })).toThrow();
  });

  it("coerces string prices from forms", () => {
    expect(productSchema.parse({ name: "Tee", price: "899" }).price).toBe(899);
  });
});

describe("shopCreateSchema", () => {
  it("validates a complete shop", () => {
    const shop = shopCreateSchema.parse({
      name: "Sharma Fashion",
      category: "Clothing",
      city: "Lucknow",
      whatsapp: "9876543210",
      slug: "sharma-fashion",
    });
    expect(shop.template).toBe("modern");
  });
  it("rejects reserved slugs", () => {
    expect(() =>
      shopCreateSchema.parse({
        name: "Admin Shop",
        category: "Other",
        whatsapp: "9876543210",
        slug: "admin",
      }),
    ).toThrow();
  });
});

describe("plan limits", () => {
  it("enforces finite limits", () => {
    expect(checkProductLimit(19, 20)).toBe(true);
    expect(checkProductLimit(20, 20)).toBe(false);
    expect(checkProductLimit(21, 20)).toBe(false);
  });
  it("treats -1 as unlimited", () => {
    expect(checkProductLimit(10_000, -1)).toBe(true);
  });
});

describe("pricing helpers", () => {
  it("formats INR", () => {
    expect(formatINR(899)).toContain("899");
    expect(formatINR(1499)).toContain("1,499");
  });
  it("computes discount percent", () => {
    expect(discountPercent(1000, 750)).toBe(25);
    expect(discountPercent(899, 749)).toBe(17);
    expect(discountPercent(100, 100)).toBe(0);
    expect(discountPercent(100, 150)).toBe(0);
  });
});
