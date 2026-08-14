/**
 * SURA SHOP seed data — DEVELOPMENT ONLY credentials.
 * Run: npm run db:seed
 */
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { SHOWCASE_SHOPS } from "./showcase";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const db = new PrismaClient({ adapter });

const PLANS = [
  {
    code: "free",
    name: "Free",
    priceInr: 0,
    productLimit: 20,
    hasAnalytics: false,
    hasAdvancedThemes: false,
    hasAi: false,
    hasCustomDomain: false,
    hasStaffAccounts: false,
    removeBranding: false,
    sortOrder: 0,
  },
  {
    code: "starter",
    name: "Starter",
    priceInr: 499,
    productLimit: 100,
    hasAnalytics: true,
    hasAdvancedThemes: true,
    hasAi: false,
    hasCustomDomain: false,
    hasStaffAccounts: false,
    removeBranding: false,
    sortOrder: 1,
  },
  {
    code: "business",
    name: "Business",
    priceInr: 1499,
    productLimit: -1,
    hasAnalytics: true,
    hasAdvancedThemes: true,
    hasAi: true,
    hasCustomDomain: true,
    hasStaffAccounts: false,
    removeBranding: true,
    sortOrder: 2,
  },
  {
    code: "pro",
    name: "Pro",
    priceInr: 2999,
    productLimit: -1,
    hasAnalytics: true,
    hasAdvancedThemes: true,
    hasAi: true,
    hasCustomDomain: true,
    hasStaffAccounts: true,
    removeBranding: true,
    sortOrder: 3,
  },
];

const DEMO_PRODUCTS = [
  {
    name: "Premium Cotton Shirt",
    slug: "premium-cotton-shirt",
    price: 899,
    discountPrice: 749,
    category: "Men",
    description:
      "Breathable 100% cotton shirt with a tailored fit. Perfect for office and festive wear. Available in multiple sizes — message us on WhatsApp for today's stock.",
    featured: true,
    variants: [{ name: "Size", options: ["S", "M", "L", "XL", "XXL"] }],
    tags: ["shirt", "cotton", "menswear"],
    image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&q=75",
  },
  {
    name: "Slim Fit Jeans",
    slug: "slim-fit-jeans",
    price: 1499,
    discountPrice: 1199,
    category: "Men",
    description: "Stretchable denim with a modern slim cut. Fade-resistant wash.",
    featured: true,
    variants: [{ name: "Waist", options: ["30", "32", "34", "36"] }],
    tags: ["jeans", "denim"],
    image: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=800&q=75",
  },
  {
    name: "Casual Sneakers",
    slug: "casual-sneakers",
    price: 1999,
    discountPrice: null,
    category: "Footwear",
    description: "Lightweight everyday sneakers with cushioned soles.",
    featured: true,
    variants: [{ name: "Size", options: ["7", "8", "9", "10"] }],
    tags: ["shoes", "sneakers"],
    image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&q=75",
  },
  {
    name: "Classic Polo",
    slug: "classic-polo",
    price: 699,
    discountPrice: 549,
    category: "Men",
    description: "Soft pique polo with a classic collar. Everyday comfort.",
    featured: false,
    variants: [{ name: "Size", options: ["S", "M", "L", "XL"] }],
    tags: ["polo", "tshirt"],
    image: "https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=800&q=75",
  },
  {
    name: "Leather Wallet",
    slug: "leather-wallet",
    price: 599,
    discountPrice: null,
    category: "Accessories",
    description: "Genuine leather bi-fold wallet with 6 card slots.",
    featured: false,
    variants: [],
    tags: ["wallet", "leather", "accessories"],
    image: "https://images.unsplash.com/photo-1627123424574-724758594e93?w=800&q=75",
  },
  {
    name: "Summer T-Shirt",
    slug: "summer-t-shirt",
    price: 449,
    discountPrice: 349,
    category: "Men",
    description: "Ultra-light crew neck tee in seasonal colours.",
    featured: false,
    variants: [{ name: "Size", options: ["S", "M", "L", "XL"] }, { name: "Color", options: ["White", "Navy", "Olive"] }],
    tags: ["tshirt", "summer"],
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=75",
  },
];

async function main() {
  console.log("Seeding plans…");
  for (const plan of PLANS) {
    await db.plan.upsert({ where: { code: plan.code }, create: plan, update: plan });
  }

  console.log("Seeding admin user (DEV ONLY: phone 9999999999)…");
  await db.user.upsert({
    where: { phone: "9999999999" },
    create: { phone: "9999999999", name: "Platform Admin", role: "SUPER_ADMIN" },
    update: { role: "SUPER_ADMIN" },
  });

  console.log("Seeding demo shop owner (DEV ONLY: phone 8888888888)…");
  const owner = await db.user.upsert({
    where: { phone: "8888888888" },
    create: { phone: "8888888888", name: "Demo Owner", role: "SHOP_OWNER", onboardedAt: new Date() },
    update: {},
  });

  console.log(`Seeding ${SHOWCASE_SHOPS.length} showcase shops…`);
  let demoShopId = "";

  for (const s of SHOWCASE_SHOPS) {
    const shop = await db.shop.upsert({
      where: { slug: s.slug },
      create: {
        slug: s.slug,
        name: s.name,
        category: s.category,
        description: s.description,
        city: s.city,
        whatsapp: s.whatsapp,
        status: "LIVE",
        isShowcase: true,
        logoUrl: s.logoUrl,
        coverUrl: s.coverUrl,
        address: s.address ?? null,
        state: s.state ?? null,
        pincode: s.pincode ?? null,
        email: s.email ?? null,
        openingHours: s.openingHours ?? null,
        instagram: s.instagram ?? null,
        theme: { create: { template: s.theme } },
      },
      update: {
        isShowcase: true,
        description: s.description,
        logoUrl: s.logoUrl,
        coverUrl: s.coverUrl,
        address: s.address ?? null,
        state: s.state ?? null,
        pincode: s.pincode ?? null,
        email: s.email ?? null,
        openingHours: s.openingHours ?? null,
        instagram: s.instagram ?? null,
        theme: {
          upsert: {
            create: { template: s.theme },
            update: { template: s.theme },
          },
        },
      },
    });

    // The demo owner account manages Urban Threads.
    if (s.slug === "urban-threads") {
      demoShopId = shop.id;
      await db.shopMember.upsert({
        where: { shopId_userId: { shopId: shop.id, userId: owner.id } },
        create: { shopId: shop.id, userId: owner.id, role: "SHOP_OWNER" },
        update: {},
      });
    }

    const catIds: Record<string, string> = {};
    for (const [i, name] of s.categories.entries()) {
      const catSlug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
      const cat = await db.category.upsert({
        where: { shopId_slug: { shopId: shop.id, slug: catSlug } },
        create: { shopId: shop.id, name, slug: catSlug, sortOrder: i },
        update: {},
      });
      catIds[name] = cat.id;
    }

    for (const p of s.products) {
      const pSlug = p.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
      await db.product.upsert({
        where: { shopId_slug: { shopId: shop.id, slug: pSlug } },
        create: {
          shopId: shop.id,
          slug: pSlug,
          name: p.name,
          price: p.price,
          discountPrice: p.discountPrice ?? null,
          description: p.description,
          categoryId: catIds[p.category],
          isFeatured: p.featured ?? false,
          isPublished: true,
          inStock: true,
          images: { create: [{ url: p.image, isMain: true, sortOrder: 0 }] },
          tags: { create: p.tags.map((tag) => ({ tag })) },
          variants: {
            create: (p.variants ?? []).map((v) => ({
              name: v.name,
              options: JSON.stringify(v.options),
            })),
          },
        },
        update: {},
      });
    }
    console.log(`  ✓ /${s.slug} (${s.theme})`);
  }

  const shop = { id: demoShopId };

  console.log("Seeding demo analytics…");
  const existingEvents = await db.analyticsEvent.count({ where: { shopId: shop.id } });
  if (existingEvents === 0) {
    const types = ["SHOP_VIEW", "SHOP_VIEW", "SHOP_VIEW", "PRODUCT_VIEW", "PRODUCT_VIEW", "WHATSAPP_CLICK"] as const;
    const events = Array.from({ length: 180 }, (_, i) => ({
      shopId: shop.id,
      type: types[i % types.length]!,
      visitorId: `demo-visitor-${i % 37}`,
      createdAt: new Date(Date.now() - Math.floor(Math.random() * 30) * 86400000),
    }));
    await db.analyticsEvent.createMany({ data: events });
  }

  console.log("Seeding platform settings…");
  const settings: Array<[string, string]> = [
    ["platformName", "SURA SHOP"],
    ["supportEmail", "support@sura.shop"],
    ["currency", "INR"],
  ];
  for (const [key, value] of settings) {
    await db.platformSetting.upsert({ where: { key }, create: { key, value }, update: {} });
  }

  console.log("✓ Seed complete.");
  console.log("  Admin login (dev):      9999999999 (OTP shown in console)");
  console.log("  Shop owner login (dev): 8888888888 (OTP shown in console)");
  console.log("  Demo storefront:        /urban-threads");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
