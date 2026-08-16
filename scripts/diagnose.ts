/**
 * Prints what the app sees: env, database columns, and the exact queries the
 * landing page and shop pages run. Any failure is shown with its real message.
 *
 * Run: node scripts/diagnose.mjs
 */
import { existsSync, readFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
process.chdir(root);

if (existsSync(".env")) {
  for (const line of readFileSync(".env", "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*"?([^"]*)"?\s*$/);
    const key = m?.[1];
    const value = m?.[2];
    if (key && value !== undefined && process.env[key] === undefined) {
      process.env[key] = value.trim();
    }
  }
}

const line = (s: string) => console.log(`\n=== ${s} ===`);

async function main() {

  line("ENVIRONMENT");
  console.log("DATABASE_URL :", process.env.DATABASE_URL || "(not set)");
  console.log("DIRECT_URL   :", process.env.DIRECT_URL || "(not set)");
  console.log("APP_URL      :", process.env.APP_URL || "(not set)");
  console.log("AUTH_SECRET  :", process.env.AUTH_SECRET ? `set (${process.env.AUTH_SECRET.length} chars)` : "(not set)");
  console.log("generated client present:", existsSync(path.join(root, "src/generated/prisma/client.ts")));
  console.log(".next build present     :", existsSync(path.join(root, ".next/BUILD_ID")));

  line("DATABASE");
  const { Client } = await import("pg");
  const c = new Client({ connectionString: process.env.DATABASE_URL });
  try {
    await c.connect();
    const enc = await c.query("SELECT current_database() db, pg_encoding_to_char(encoding) enc FROM pg_database WHERE datname = current_database()");
    console.log("database:", enc.rows[0].db, "| encoding:", enc.rows[0].enc);

    const cols = await c.query(
      `SELECT column_name, is_nullable FROM information_schema.columns
       WHERE table_name = 'Shop' ORDER BY column_name`,
    );
    const names = cols.rows.map((r) => r.column_name);
    console.log("Shop columns:", names.join(", "));
    for (const need of ["isShowcase", "address", "state", "pincode", "email", "openingHours", "instagram"]) {
      console.log(`  ${need.padEnd(14)}: ${names.includes(need) ? "OK" : "*** MISSING ***"}`);
    }

    const theme = await c.query(
      `SELECT column_name, is_nullable FROM information_schema.columns
       WHERE table_name = 'ShopTheme' AND column_name = 'primaryColor'`,
    );
    console.log("ShopTheme.primaryColor nullable:", theme.rows[0]?.is_nullable ?? "*** COLUMN MISSING ***");

    const counts = await c.query(
      `SELECT (SELECT COUNT(*) FROM "Shop") shops,
              (SELECT COUNT(*) FROM "Shop" WHERE "isShowcase" = true) showcase,
              (SELECT COUNT(*) FROM "Product") products`,
    );
    console.log("rows:", counts.rows[0]);

    const themes = await c.query(`SELECT s.slug, t.template FROM "Shop" s LEFT JOIN "ShopTheme" t ON t."shopId" = s.id ORDER BY s.slug`);
    console.log("shop → theme:");
    for (const r of themes.rows) console.log(`  ${r.slug.padEnd(22)} ${r.template ?? "*** NO THEME ROW ***"}`);
  } catch (err) {
    console.error("DATABASE ERROR:", err.message);
  } finally {
    await c.end().catch(() => {});
  }

  line("PRISMA QUERIES (what the pages run)");
  try {
    const { PrismaPg } = await import("@prisma/adapter-pg");
    const { PrismaClient } = await import("../src/generated/prisma/client");
    const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });

    try {
      const shop = await db.shop.findFirst({
        where: { deletedAt: null },
        include: { theme: true, categories: { where: { deletedAt: null, isActive: true } } },
      });
      console.log("getPublicShop-style query: OK →", shop?.slug, "| theme:", shop?.theme?.template);
    } catch (err) {
      console.error("getPublicShop-style query FAILED:", err.message);
    }

    try {
      const rows = await db.shop.findMany({
        where: { isShowcase: true, deletedAt: null, status: "LIVE" },
        include: {
          theme: true,
          products: { where: { deletedAt: null, isPublished: true }, include: { images: true }, take: 6 },
          _count: { select: { products: { where: { deletedAt: null, isPublished: true } } } },
        },
      });
      console.log("landing carousel query: OK →", rows.length, "showcase shops");
    } catch (err) {
      console.error("landing carousel query FAILED:", err.message);
    }

    await db.$disconnect();
  } catch (err) {
    console.error("PRISMA CLIENT ERROR:", err.message);
  }

  console.log("\nDone.\n");
  }

  main().catch((e) => {
    console.error("Diagnostic failed:", e instanceof Error ? e.message : String(e));
    process.exit(1);
  });
