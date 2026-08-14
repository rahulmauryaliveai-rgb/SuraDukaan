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
  midnight: {
    id: "midnight",
    name: "Midnight",
    tagline: "Dark tech look with an electric edge",
    bestFor: ["Electronics", "Sports"],
    colors: {
      bg: "#0a0e14",
      surface: "#131a24",
      ink: "#e6edf5",
      muted: "#8b9bb0",
      accent: "#22d3ee",
      accentInk: "#04212a",
      border: "#233043",
    },
    fontHeading: "Space Grotesk",
    fontBody: "Inter",
    radius: "10px",
    cardStyle: "border",
    heroStyle: "cover",
    grid: { mobileCols: 2, aspect: "1/1" },
    upperHeadings: false,
  },

  saffron: {
    id: "saffron",
    name: "Saffron",
    tagline: "Rich and traditional, for Indian kitchens",
    bestFor: ["Restaurant", "Bakery"],
    colors: {
      bg: "#1a0f0a",
      surface: "#2a1810",
      ink: "#fdf6e8",
      muted: "#c4a882",
      accent: "#f59e0b",
      accentInk: "#2a1810",
      border: "#3d2718",
    },
    fontHeading: "Marcellus",
    fontBody: "Inter",
    radius: "4px",
    cardStyle: "border",
    heroStyle: "immersive",
    grid: { mobileCols: 2, aspect: "4/5" },
    upperHeadings: true,
  },

  apothecary: {
    id: "apothecary",
    name: "Apothecary",
    tagline: "Calm and clinical, builds trust",
    bestFor: ["Pharmacy", "Services"],
    colors: {
      bg: "#f7fbfc",
      surface: "#ffffff",
      ink: "#12333d",
      muted: "#6b8a94",
      accent: "#0891b2",
      accentInk: "#ffffff",
      border: "#d9eaee",
    },
    fontHeading: "Lora",
    fontBody: "Inter",
    radius: "8px",
    cardStyle: "border",
    heroStyle: "minimal",
    grid: { mobileCols: 2, aspect: "1/1" },
    upperHeadings: false,
  },

  canvas: {
    id: "canvas",
    name: "Canvas",
    tagline: "Handmade and earthy, for craft and art",
    bestFor: ["Handicrafts", "Home Decor"],
    colors: {
      bg: "#faf6f0",
      surface: "#fffdf9",
      ink: "#3a2f24",
      muted: "#8a7660",
      accent: "#b45309",
      accentInk: "#ffffff",
      border: "#e8dcc9",
    },
    fontHeading: "Fraunces",
    fontBody: "Inter",
    radius: "3px",
    cardStyle: "flat",
    heroStyle: "cover",
    grid: { mobileCols: 2, aspect: "3/4" },
    upperHeadings: false,
  },

  court: {
    id: "court",
    name: "Court",
    tagline: "Loud and athletic, built for energy",
    bestFor: ["Sports", "Clothing"],
    colors: {
      bg: "#0d0d0d",
      surface: "#171717",
      ink: "#fafafa",
      muted: "#a3a3a3",
      accent: "#d4ff00",
      accentInk: "#0d0d0d",
      border: "#2a2a2a",
    },
    fontHeading: "Bebas Neue",
    fontBody: "Inter",
    radius: "0px",
    cardStyle: "flat",
    heroStyle: "immersive",
    grid: { mobileCols: 2, aspect: "1/1" },
    upperHeadings: true,
  },

  timber: {
    id: "timber",
    name: "Timber",
    tagline: "Warm wood tones for furniture and interiors",
    bestFor: ["Furniture", "Home Decor"],
    colors: {
      bg: "#f6f2ec",
      surface: "#fffdfa",
      ink: "#2f2820",
      muted: "#7d7266",
      accent: "#7c5c3e",
      accentInk: "#ffffff",
      border: "#e3d9cb",
    },
    fontHeading: "Cormorant Garamond",
    fontBody: "Inter",
    radius: "6px",
    cardStyle: "shadow",
    heroStyle: "cover",
    grid: { mobileCols: 2, aspect: "4/5" },
    upperHeadings: false,
  },

  glow: {
    id: "glow",
    name: "Glow",
    tagline: "Soft and luxe, made for beauty",
    bestFor: ["Beauty", "Jewellery"],
    colors: {
      bg: "#fdf7fb",
      surface: "#ffffff",
      ink: "#2e1b2c",
      muted: "#8f7189",
      accent: "#a855f7",
      accentInk: "#ffffff",
      border: "#f0dcec",
    },
    fontHeading: "Josefin Sans",
    fontBody: "Inter",
    radius: "20px",
    cardStyle: "shadow",
    heroStyle: "cover",
    grid: { mobileCols: 2, aspect: "3/4" },
    upperHeadings: false,
  },

  playground: {
    id: "playground",
    name: "Playground",
    tagline: "Bright and friendly, for kids and toys",
    bestFor: ["Other", "Sports"],
    colors: {
      bg: "#fffdf5",
      surface: "#ffffff",
      ink: "#1f2b45",
      muted: "#6b7a99",
      accent: "#f43f5e",
      accentInk: "#ffffff",
      border: "#ffe8b8",
    },
    fontHeading: "Nunito",
    fontBody: "Nunito",
    radius: "24px",
    cardStyle: "shadow",
    heroStyle: "cover",
    grid: { mobileCols: 2, aspect: "1/1" },
    upperHeadings: false,
  },

  ledger: {
    id: "ledger",
    name: "Ledger",
    tagline: "Sharp and professional, for service businesses",
    bestFor: ["Services", "Electronics"],
    colors: {
      bg: "#f7f9fc",
      surface: "#ffffff",
      ink: "#0f1f3d",
      muted: "#64748b",
      accent: "#1e40af",
      accentInk: "#ffffff",
      border: "#dbe4f0",
    },
    fontHeading: "Archivo",
    fontBody: "Inter",
    radius: "6px",
    cardStyle: "border",
    heroStyle: "minimal",
    grid: { mobileCols: 2, aspect: "1/1" },
    upperHeadings: false,
  },

  spice: {
    id: "spice",
    name: "Spice",
    tagline: "Bold masala tones for kirana and provisions",
    bestFor: ["Grocery", "Restaurant"],
    colors: {
      bg: "#fffbf2",
      surface: "#ffffff",
      ink: "#3b2410",
      muted: "#937249",
      accent: "#b91c1c",
      accentInk: "#ffffff",
      border: "#f2e2c8",
    },
    fontHeading: "Rubik",
    fontBody: "Inter",
    radius: "10px",
    cardStyle: "border",
    heroStyle: "cover",
    grid: { mobileCols: 3, aspect: "1/1" },
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

/** True when the theme's page background is dark, so overlays need light text. */
export function isDarkTheme(theme: ThemeTokens): boolean {
  const hex = theme.colors.bg.replace("#", "");
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  // Rec. 601 relative luminance, 0–255.
  return 0.299 * r + 0.587 * g + 0.114 * b < 128;
}

/** Google Fonts stylesheet URL covering every font used by the registry. */
export function themeFontHref(theme: ThemeTokens): string {
  const families = [...new Set([theme.fontHeading, theme.fontBody])];
  const params = families
    .map((f) => `family=${encodeURIComponent(f)}:wght@400;500;600;700`)
    .join("&");
  return `https://fonts.googleapis.com/css2?${params}&display=swap`;
}
