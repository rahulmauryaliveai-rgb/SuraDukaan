export const BUSINESS_CATEGORIES = [
  "Clothing",
  "Electronics",
  "Grocery",
  "Bakery",
  "Restaurant",
  "Beauty",
  "Jewellery",
  "Pharmacy",
  "Sports",
  "Furniture",
  "Home Decor",
  "Handicrafts",
  "Services",
  "Other",
] as const;

/**
 * Storefront templates shown in the onboarding wizard.
 * Source of truth for the actual design tokens is `src/lib/themes.ts`.
 */
export { THEMES, THEME_IDS, themesForCategory } from "@/lib/themes";
