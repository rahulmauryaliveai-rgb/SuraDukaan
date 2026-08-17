import "server-only";
import { unstable_cache } from "next/cache";
import { db } from "@/lib/db";
import { formatINR } from "@/lib/utils";
import { getTheme } from "@/lib/themes";
import type { ShowcaseEntry } from "@/components/marketing/showcase-gallery";

/**
 * The showcase shops rendered by the marketing carousel.
 *
 * This now appears on every public page, so the query is cached rather than
 * re-run per request — it pulls 16 shops with their products and images, which
 * is far too much work to repeat on a page like Privacy. Demo shops change
 * only when the database is re-seeded, so a few minutes of staleness is fine.
 */
/**
 * Kept deliberately short. This cache is written to disk under .next/cache and
 * survives restarts, so after re-seeding the database the carousel would keep
 * serving the old set for the whole window. A minute still removes ~60x the
 * query load while keeping a re-seed visible almost immediately.
 */
const CACHE_SECONDS = 60;

async function query(): Promise<ShowcaseEntry[]> {
  try {
    const shops = await db.shop.findMany({
      where: { isShowcase: true, deletedAt: null, status: "LIVE" },
      include: {
        theme: true,
        products: {
          where: { deletedAt: null, isPublished: true },
          include: { images: { where: { isMain: true }, take: 1 } },
          orderBy: [{ isFeatured: "desc" }, { createdAt: "asc" }],
          take: 6,
        },
        _count: { select: { products: { where: { deletedAt: null, isPublished: true } } } },
      },
      orderBy: { createdAt: "asc" },
    });

    return shops.map((s) => {
      const theme = getTheme(s.theme?.template);
      return {
        slug: s.slug,
        name: s.name,
        category: s.category,
        themeName: theme.name,
        themeTagline: theme.tagline,
        city: s.city,
        logoUrl: s.logoUrl,
        coverUrl: s.coverUrl,
        productCount: s._count.products,
        colors: theme.colors,
        radius: theme.radius,
        fontHeading: theme.fontHeading,
        upperHeadings: theme.upperHeadings,
        gridAspect: theme.grid.aspect,
        products: s.products.map((p) => ({
          name: p.name,
          price: formatINR(Number(p.discountPrice ?? p.price)),
          imageUrl: p.images[0]?.url ?? null,
        })),
      };
    });
  } catch {
    // A marketing section must never take the page down with it.
    return [];
  }
}

export const getShowcaseEntries = unstable_cache(query, ["marketing-showcase"], {
  revalidate: CACHE_SECONDS,
  tags: ["showcase"],
});
