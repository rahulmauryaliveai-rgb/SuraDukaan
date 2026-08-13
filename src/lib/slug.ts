/** Slug utilities. Slugs: lowercase, hyphen-separated, alphanumeric only, unique. */

export const RESERVED_SLUGS = new Set([
  "admin", "dashboard", "login", "register", "verify-otp", "forgot-access",
  "api", "pricing", "features", "demo", "privacy", "terms", "refund-policy",
  "contact", "about", "blog", "help", "support", "settings", "onboarding",
  "s", "shop", "shops", "product", "products", "static", "assets", "public",
  "uploads", "favicon.ico", "robots.txt", "sitemap.xml", "manifest.json",
  "_next", "sura", "surashop", "sura-shop", "www",
]);

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60)
    .replace(/-+$/g, "");
}

export function isValidSlug(slug: string): boolean {
  return (
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) &&
    slug.length >= 3 &&
    slug.length <= 60 &&
    !RESERVED_SLUGS.has(slug)
  );
}

/** Generate a unique slug given a base and a checker for existing slugs. */
export async function uniqueSlug(
  base: string,
  exists: (slug: string) => Promise<boolean>,
): Promise<string> {
  let candidate = slugify(base);
  if (candidate.length < 3) candidate = `shop-${candidate}`.replace(/-$/, "");
  if (!RESERVED_SLUGS.has(candidate) && !(await exists(candidate))) return candidate;
  for (let i = 2; i < 100; i++) {
    const next = `${candidate}-${i}`;
    if (!(await exists(next))) return next;
  }
  return `${candidate}-${Date.now().toString(36)}`;
}
