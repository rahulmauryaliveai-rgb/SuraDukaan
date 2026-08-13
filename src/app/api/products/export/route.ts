import { db } from "@/lib/db";
import { requireShop } from "@/lib/auth/session";
import { handleApiError } from "@/lib/api";
import { csvEscape } from "@/lib/csv";

/** Export the shop's products as CSV. */
export async function GET() {
  try {
    const { shop } = await requireShop();
    const products = await db.product.findMany({
      where: { shopId: shop.id, deletedAt: null },
      include: { category: true },
      orderBy: { createdAt: "asc" },
    });

    const header = "name,description,price,discountPrice,category,sku,stock";
    const rows = products.map((p) =>
      [
        csvEscape(p.name),
        csvEscape(p.description ?? ""),
        String(p.price),
        p.discountPrice ? String(p.discountPrice) : "",
        csvEscape(p.category?.name ?? ""),
        csvEscape(p.sku ?? ""),
        p.stock != null ? String(p.stock) : "",
      ].join(","),
    );
    const csv = [header, ...rows].join("\n");

    return new Response(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${shop.slug}-products.csv"`,
      },
    });
  } catch (err) {
    return handleApiError(err);
  }
}
