import type { MetadataRoute } from "next";
import { db } from "@/lib/db";
import { appUrl } from "@/lib/utils";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    { url: appUrl("/"), changeFrequency: "weekly", priority: 1 },
    { url: appUrl("/privacy") },
    { url: appUrl("/terms") },
    { url: appUrl("/refund-policy") },
    { url: appUrl("/contact") },
  ];

  try {
    const shops = await db.shop.findMany({
      where: { deletedAt: null, status: "LIVE", isPublished: true },
      select: { slug: true, updatedAt: true },
      take: 5000,
      orderBy: { createdAt: "asc" },
    });
    return [
      ...staticPages,
      // Welcome page (the shareable link) and the product catalog behind it.
      ...shops.flatMap((s) => [
        {
          url: appUrl(`/${s.slug}`),
          lastModified: s.updatedAt,
          changeFrequency: "daily" as const,
          priority: 0.8,
        },
        {
          url: appUrl(`/${s.slug}/shop`),
          lastModified: s.updatedAt,
          changeFrequency: "daily" as const,
          priority: 0.7,
        },
      ]),
    ];
  } catch {
    return staticPages;
  }
}
