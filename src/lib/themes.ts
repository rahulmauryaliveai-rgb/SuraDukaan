/**
 * Storefront theme registry.
 *
 * A theme is a set of design tokens. The storefront applies them as CSS custom
 * properties on its root element, so every component reads `var(--sf-*)` and
 * automatically restyles. Adding a theme = adding an entry here; no component
 * changes required.
 */

export type HeroStyle = "cover" | "immersive" | "minimal";
export type CardStyle = "shadow" | "border" | "flat";

export interface ThemeTokens {
  id: string;
  name: string;
  tagline: string;
  /** Business categories this theme suits best (matches BUSINESS_CATEGORIES). */
  bestFor: string[];
  colors: {
    /** Page background */
    bg: string;
    /** Cards, header, sticky bars */
    surface: string;
    /** Primary text */
    ink: string;
    /** Secondary text */
    muted: string;
    /** Buttons, highlights, active chips */
    accent: string;
    /** Text on top of accent */
    accentInk: string;
    /** Borders and dividers */
    border: string;
  };
  fontHeading: string;
  fontBody: string;
  /** Corner radius for cards and buttons, e.g. "2px" | "12px" | "999px" */
  radius: string;
  cardStyle: CardStyle;
  heroStyle: HeroStyle;
  grid: {
    /** Product columns on mobile */
    mobileCols: 2 | 3;
    /** Product image aspect ratio, e.g. "1/1" | "3/4" | "4/5" */
    aspect: string;
  };
  /** Uppercase + letterspaced headings (editorial look) */
  upperHeadings: boolean;
}

export const THEMES: Record<string, ThemeTokens> = {
  modern: {
    id: "modern",
    name: "Modern",
    tagline: "Clean and versatile — works for any shop",
    bestFor: ["Electronics", "Sports", "Furniture", "Services", "Pharmacy", "Other"],
    colors: {
      bg: "#f8fafc",
      surface: "#ffffff",
      ink: "#0f172a",
      muted: "#64748b",
      accent: "#0f766e",
      accentInk: "#ffffff",
      border: "#e2e8f0",
    },
    fontHeading: "Inter",
    fontBody: "Inter",
    radius: "14px",
    cardStyle: "shadow",
    heroStyle: "cover",
    grid: { mobileCols: 2, aspect: "1/1" },
    upperHeadings: false,
  },

  royal: {
    id: "royal",
    name: "Royal",
    tagline: "Dark and jewel-like, for pieces that deserve drama",
    bestFor: ["Jewellery", "Handicrafts"],
    colors: {
      bg: "#0b0b0d",
      surface: "#16161a",
      ink: "#f5f2ea",
      muted: "#a8a29a",
      accent: "#c9a227",
      accentInk: "#1a1508",
      border: "#2a2a30",
    },
    fontHeading: "Playfair Display",
    fontBody: "Inter",
    radius: "2px",
    cardStyle: "border",
    heroStyle: "immersive",
    grid: { mobileCols: 2, aspect: "3/4" },
    upperHeadings: true,
  },

  warm: {
    id: "warm",
    name: "Warm",
    tagline: "Golden and appetising, made for food",
    bestFor: ["Bakery", "Restaurant", "Grocery"],
    colors: {
      bg: "#fffaf2",
      surface: "#ffffff",
      ink: "#3d2914",
      muted: "#8a6d4d",
      accent: "#c2410c",
      accentInk: "#ffffff",
      border: "#f0e2cf",
    },
    fontHeading: "Poppins",
    fontBody: "Inter",
    radius: "18px",
    cardStyle: "shadow",
    heroStyle: "cover",
    grid: { mobileCols: 2, aspect: "4/5" },
    upperHeadings: false,
  },

  atelier: {
    id: "atelier",
    name: "Atelier",
    tagline: "Editorial and spacious, for clothing and style",
    bestFor: ["Clothing", "Beauty"],
    colors: {
      bg: "#faf9f7",
      surface: "#ffffff",
      ink: "#1c1c1c",
      muted: "#7a7a7a",
      accent: "#1c1c1c",
      accentInk: "#ffffff",
      border: "#e6e3de",
    },
    fontHeading: "Playfair Display",
    fontBody: "Inter",
    radius: "0px",
    cardStyle: "flat",
    heroStyle: "minimal",
    grid: { mobileCols: 2, aspect: "3/4" },
    upperHeadings: true,
  },

  fresh: {
    id: "fresh",
    name: "Fresh",
    tagline: "Bright and price-forward, built for daily shopping",
    bestFor: ["Grocery", "Pharmacy", "Sports"],
    colors: {
      bg: "#f4faf5",
      surface: "#ffffff",
      ink: "#14251a",
      muted: "#5f7266",
      accent: "#15803d",
      accentInk: "#ffffff",
      border: "#d9ebdd",
    },
    fontHeading: "Poppins",
    fontBody: "Inter",
    radius: "12px",
    cardStyle: "border",
    heroStyle: "cover",
    grid: { mobileCols: 3, aspect: "1/1" },
    upperHeadings: false,
  },

  bloom: {
    id: "bloom",
    name: "Bloom",
    tagline: "Soft and gift-worthy, for flowers and occasions",
    bestFor: ["Home Decor", "Beauty", "Handicrafts"],
    colors: {
      bg: "#fff7f9",
      surface: "#ffffff",
      ink: "#3b1f2b",
      muted: "#94707f",
      accent: "#be185d",
      accentInk: "#ffffff",
      border: "#f6dce5",
    },
    fontHeading: "Playfair Display",
    fontBody: "Inter",
    radius: "999px",
    cardStyle: "shadow",
    heroStyle: "cover",
    grid: { mobileCols: 2, aspect: "1/1" },
    upperHeadings: false,
  },
};

export const THEME_IDS = Object.keys(THEMES) as Array<keyof typeof THEMES>;

export const DEFAULT_THEME_ID = "modern";

export function getTheme(id: string | null | undefined): ThemeTokens {
  return THEMES[id ?? ""] ?? THEMES[DEFAULT_THEME_ID]!;
}

/** Themes suggested for a business category, best matches first. */
export function themesForCategory(category: string): ThemeTokens[] {
  const all = Object.values(THEMES);
  const matches = all.filter((t) => t.bestFor.includes(category));
  const rest = all.filter((t) => !t.bestFor.includes(category));
  return [...matches, ...rest];
}

/**
 * Theme tokens as inline CSS custom properties for the storefront root.
 * `overrideAccent` lets an owner keep a theme but use their own brand colour.
 */
export function themeCssVars(
  theme: ThemeTokens,
  overrideAccent?: string | null,
): React.CSSProperties {
  const accent = overrideAccent || theme.colors.accent;
  return {
    "--sf-bg": theme.colors.bg,
    "--sf-surface": theme.colors.surface,
    "--sf-ink": theme.colors.ink,
    "--sf-muted": theme.colors.muted,
    "--sf-accent": accent,
    "--sf-accent-ink": theme.colors.accentInk,
    "--sf-border": theme.colors.border,
    "--sf-radius": theme.radius,
    "--sf-font-heading": `"${theme.fontHeading}", ui-sans-serif, system-ui, sans-serif`,
    "--sf-font-body": `"${theme.fontBody}", ui-sans-serif, system-ui, sans-serif`,
  } as React.CSSProperties;
}

/** Google Fonts stylesheet URL covering every font used by the registry. */
export function themeFontHref(theme: ThemeTokens): string {
  const families = [...new Set([theme.fontHeading, theme.fontBody])];
  const params = families
    .map((f) => `family=${encodeURIComponent(f)}:wght@400;500;600;700`)
    .join("&");
  return `https://fonts.googleapis.com/css2?${params}&display=swap`;
}
