import { db } from "@/lib/db";
import { requireShop } from "@/lib/auth/session";
import { categorySchema } from "@/lib/validation";
import { slugify, uniqueSlug } from "@/lib/slug";
import { ok, fail, handleApiError } from "@/lib/api";

export async function GET() {
  try {
    const { shop } = await requireShop();
    const categories = await db.category.findMany({
      where: { shopId: shop.id, deletedAt: null },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      include: { _count: { select: { products: { where: { deletedAt: null } } } } },
    });
    return ok({ categories });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(req: Request) {
  try {
    const { shop } = await requireShop();
    const input = categorySchema.parse(await req.json());
    const slug = await uniqueSlug(slugify(input.name), async (s) =>
      !!(await db.category.findUnique({
        where: { shopId_slug: { shopId: shop.id, slug: s } },
        select: { id: true },
      })),
    );
    const count = await db.category.count({ where: { shopId: shop.id, deletedAt: null } });
    const category = await db.category.create({
      data: { shopId: shop.id, name: input.name, slug, sortOrder: input.sortOrder ?? count },
    });
    return ok({ category }, { status: 201 });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function PATCH(req: Request) {
  try {
    const { shop } = await requireShop();
    const body = await req.json();
    const id = String(body.id ?? "");
    const existing = await db.category.findFirst({ where: { id, shopId: shop.id, deletedAt: null } });
    if (!existing) return fail("Category not found.", 404);

    if (body.delete === true) {
      await db.category.update({ where: { id }, data: { deletedAt: new Date() } });
      return ok({ deleted: true });
    }
    const input = categorySchema.partial().parse(body);
    const category = await db.category.update({
      where: { id },
      data: {
        ...(input.name ? { name: input.name } : {}),
        ...(input.isActive !== undefined ? { isActive: input.isActive } : {}),
        ...(input.sortOrder !== undefined ? { sortOrder: input.sortOrder } : {}),
      },
    });
    return ok({ category });
  } catch (err) {
    return handleApiError(err);
  }
}
