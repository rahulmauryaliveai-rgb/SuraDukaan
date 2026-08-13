/**
 * CRITICAL: tenant isolation integration tests.
 * Shop A must NEVER be able to read or modify Shop B's data.
 *
 * These tests need a running PostgreSQL (DATABASE_URL). They are skipped
 * automatically when the database is unreachable, and always run in CI.
 */
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const url = process.env.DATABASE_URL ?? "postgresql://sura:sura@localhost:5432/surashop?schema=public";
const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: url }) });

let dbAvailable = false;
try {
  await db.$queryRaw`SELECT 1`;
  dbAvailable = true;
} catch {
  dbAvailable = false;
}

const suite = describe.skipIf(!dbAvailable);

suite("tenant isolation", () => {
  let shopA: { id: string };
  let shopB: { id: string };
  let productB: { id: string };

  beforeAll(async () => {
    const stamp = Date.now().toString(36);
    shopA = await db.shop.create({
      data: { slug: `test-shop-a-${stamp}`, name: "Test Shop A", category: "Other", whatsapp: "919876543210" },
    });
    shopB = await db.shop.create({
      data: { slug: `test-shop-b-${stamp}`, name: "Test Shop B", category: "Other", whatsapp: "919876543211" },
    });
    productB = await db.product.create({
      data: { shopId: shopB.id, slug: "secret-product", name: "Secret Product B", price: 100 },
    });
    await db.enquiry.create({ data: { shopId: shopB.id, productName: "Secret Product B" } });
    await db.analyticsEvent.create({ data: { shopId: shopB.id, type: "SHOP_VIEW" } });
  });

  afterAll(async () => {
    await db.shop.deleteMany({ where: { id: { in: [shopA.id, shopB.id] } } });
    await db.$disconnect();
  });

  it("shop A cannot list shop B products", async () => {
    const products = await db.product.findMany({ where: { shopId: shopA.id } });
    expect(products.find((p) => p.id === productB.id)).toBeUndefined();
  });

  it("shop A cannot fetch shop B product by id when scoped", async () => {
    // This mirrors every data access in the app: always { id, shopId } together.
    const product = await db.product.findFirst({ where: { id: productB.id, shopId: shopA.id } });
    expect(product).toBeNull();
  });

  it("shop A cannot update shop B product through the service layer", async () => {
    const { updateProduct } = await import("@/lib/products");
    const result = await updateProduct(shopA.id, productB.id, { name: "Hacked", price: 1 });
    expect(result).toBeNull();
    const untouched = await db.product.findUnique({ where: { id: productB.id } });
    expect(untouched?.name).toBe("Secret Product B");
  });

  it("shop A sees no shop B enquiries", async () => {
    const enquiries = await db.enquiry.findMany({ where: { shopId: shopA.id } });
    expect(enquiries.length).toBe(0);
  });

  it("shop A sees no shop B analytics", async () => {
    const events = await db.analyticsEvent.findMany({ where: { shopId: shopA.id } });
    expect(events.length).toBe(0);
  });

  it("category assignment cannot cross tenants", async () => {
    const catB = await db.category.create({
      data: { shopId: shopB.id, name: "B Cat", slug: `b-cat-${Date.now()}` },
    });
    const { createProduct } = await import("@/lib/products");
    const created = await createProduct(shopA.id, {
      name: "A Product",
      price: 50,
      categoryId: catB.id, // hostile input: category from another shop
    });
    expect(created.categoryId).toBeNull(); // silently rejected
  });
});

if (!dbAvailable) {
  describe("tenant isolation (skipped)", () => {
    it("database not reachable — run with docker compose up -d to execute isolation tests", () => {
      expect(true).toBe(true);
    });
  });
}
