import { describe, it, expect } from "vitest";
import { slugify, isValidSlug, uniqueSlug, RESERVED_SLUGS } from "@/lib/slug";

describe("slugify", () => {
  it("converts names to lowercase hyphenated slugs", () => {
    expect(slugify("Sharma Fashion")).toBe("sharma-fashion");
    expect(slugify("  Gupta   Sweets  ")).toBe("gupta-sweets");
    expect(slugify("RK Electronics!!")).toBe("rk-electronics");
    expect(slugify("Rahul's Handicrafts")).toBe("rahuls-handicrafts");
  });

  it("strips special characters and Hindi-safe input", () => {
    expect(slugify("Café & Bakery @Delhi")).toBe("caf-bakery-delhi");
    expect(slugify("---shop---")).toBe("shop");
  });

  it("caps length at 60", () => {
    expect(slugify("a".repeat(100)).length).toBeLessThanOrEqual(60);
  });
});

describe("isValidSlug", () => {
  it("accepts valid slugs", () => {
    expect(isValidSlug("sharma-fashion")).toBe(true);
    expect(isValidSlug("shop123")).toBe(true);
  });

  it("rejects invalid slugs", () => {
    expect(isValidSlug("ab")).toBe(false); // too short
    expect(isValidSlug("Has-Caps")).toBe(false);
    expect(isValidSlug("has space")).toBe(false);
    expect(isValidSlug("-leading")).toBe(false);
    expect(isValidSlug("trailing-")).toBe(false);
    expect(isValidSlug("double--hyphen")).toBe(false);
  });

  it("rejects every reserved slug", () => {
    for (const reserved of RESERVED_SLUGS) {
      expect(isValidSlug(reserved)).toBe(false);
    }
  });
});

describe("uniqueSlug", () => {
  it("returns base slug when free", async () => {
    expect(await uniqueSlug("Sharma Fashion", async () => false)).toBe("sharma-fashion");
  });

  it("appends counter when taken", async () => {
    const taken = new Set(["sharma-fashion", "sharma-fashion-2"]);
    const slug = await uniqueSlug("Sharma Fashion", async (s) => taken.has(s));
    expect(slug).toBe("sharma-fashion-3");
  });

  it("never returns a reserved slug", async () => {
    const slug = await uniqueSlug("admin", async () => false);
    expect(RESERVED_SLUGS.has(slug)).toBe(false);
  });
});
