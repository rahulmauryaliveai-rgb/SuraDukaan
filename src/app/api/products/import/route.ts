import { db } from "@/lib/db";
import { requireShop } from "@/lib/auth/session";
import { productSchema } from "@/lib/validation";
import { getActivePlan } from "@/lib/plans";
import { checkProductLimit } from "@/lib/plans-core";
import { createProduct } from "@/lib/products";
import { slugify, uniqueSlug } from "@/lib/slug";
import { parseCsv } from "@/lib/csv";
import { ok, fail, handleApiError } from "@/lib/api";

const EXPECTED = ["name", "description", "price", "discountprice", "category", "sku", "stock"];

export async function POST(req: Request) {
  try {
    const { shop } = await requireShop();
    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File)) return fail("Upload a CSV file.");
    if (file.size > 1024 * 1024) return fail("CSV must be under 1 MB.");

    const rows = parseCsv(await file.text());
    if (rows.length < 2) return fail("CSV has no data rows.");

    const header = (rows[0] ?? []).map((h) => h.trim().toLowerCase());
    const idx = (name: string) => header.indexOf(name);
    if (idx("name") === -1 || idx("price") === -1) {
      return fail(`CSV must include at least "name" and "price" columns. Expected columns: ${EXPECTED.join(", ")}`);
    }

    // Validate everything BEFORE importing anything.
    const errors: string[] = [];
    const valid: { name: string; description: string; price: string; discountPrice: string | null; category: string; sku: string; stock: string | null }[] = [];
    for (const [i, row] of rows.slice(1).entries()) {
      const get = (name: string) => (idx(name) >= 0 ? (row[idx(name)] ?? "").trim() : "");
      const candidate = {
        name: get("name"),
        description: get("description"),
        price: get("price"),
        discountPrice: get("discountprice") || null,
        category: get("category"),
        sku: get("sku"),
        stock: get("stock") || null,
      };
      const parsed = productSchema.safeParse({
        name: candidate.name,
        description: candidate.description,
        price: candidate.price,
        discountPrice: candidate.discountPrice,
        sku: candidate.sku,
        stock: candidate.stock,
      });
      if (!parsed.success) {
        errors.push(`Row ${i + 2}: ${parsed.error.issues[0]?.message ?? "invalid"}`);
      } else {
        valid.push(candidate);
      }
    }
    if (errors.length) return fail(`Fix these rows and re-upload:\n${errors.slice(0, 10).join("\n")}`, 422);

    const plan = await getActivePlan(shop.id);
    const existing = await db.product.count({ where: { shopId: shop.id, deletedAt: null } });
    if (!checkProductLimit(existing + valid.length - 1, plan.productLimit)) {
      return fail(
        `Import needs ${valid.length} slots but your ${plan.name} plan allows ${plan.productLimit} products (${existing} used). Upgrade to import.`,
        402,
      );
    }

    // Resolve/create categories.
    let imported = 0;
    for (const item of valid) {
      let categoryId: string | null = null;
      if (item.category) {
        const catSlug = slugify(item.category);
        const cat = await db.category.upsert({
          where: { shopId_slug: { shopId: shop.id, slug: catSlug } },
          create: { shopId: shop.id, name: item.category, slug: await uniqueSlug(catSlug, async () => false) },
          update: {},
        });
        categoryId = cat.id;
      }
      await createProduct(shop.id, {
        name: item.name,
        price: Number(item.price),
        discountPrice: item.discountPrice ? Number(item.discountPrice) : null,
        description: item.description,
        sku: item.sku,
        stock: item.stock ? Number(item.stock) : null,
        categoryId,
      });
      imported++;
    }

    return ok({ imported });
  } catch (err) {
    return handleApiError(err);
  }
}
