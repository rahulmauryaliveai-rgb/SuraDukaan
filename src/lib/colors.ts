/**
 * Colour handling for product options.
 *
 * A colour option is stored as a plain string so the rest of the product code
 * stays unchanged. Two forms are supported:
 *
 *   "Navy"                 → a known colour name, resolved from the table below
 *   "Peacock Teal #0f8a8a" → a custom colour: label plus its exact hex
 *
 * The hex is only for display; the customer's WhatsApp message always shows the
 * human label ("Colour: Peacock Teal").
 */

export const NAMED_COLORS: Record<string, string> = {
  black: "#111827",
  charcoal: "#374151",
  grey: "#9ca3af",
  gray: "#9ca3af",
  white: "#ffffff",
  "off white": "#f6f2ea",
  cream: "#fdf3d8",
  beige: "#e7d3b1",
  ivory: "#fffff0",
  silver: "#c0c0c0",
  gold: "#d4af37",
  brown: "#92400e",
  tan: "#d2a679",
  maroon: "#7f1d1d",
  red: "#dc2626",
  rust: "#b7410e",
  orange: "#ea580c",
  peach: "#ffcba4",
  yellow: "#eab308",
  mustard: "#d4a017",
  lime: "#84cc16",
  green: "#16a34a",
  olive: "#6b8e23",
  teal: "#0d9488",
  turquoise: "#40e0d0",
  "sky blue": "#38bdf8",
  blue: "#2563eb",
  "royal blue": "#1d4ed8",
  navy: "#1e3a8a",
  purple: "#7e22ce",
  violet: "#8b5cf6",
  lavender: "#c4b5fd",
  pink: "#ec4899",
  rose: "#f43f5e",
  magenta: "#d946ef",
};

/** Colours offered as one-tap swatches when an option is named "Colour". */
export const SWATCH_PALETTE: string[] = [
  "Black", "Charcoal", "Grey", "White", "Off White", "Cream", "Beige",
  "Silver", "Gold", "Brown", "Tan", "Maroon", "Red", "Rust", "Orange",
  "Peach", "Yellow", "Mustard", "Green", "Olive", "Teal", "Turquoise",
  "Sky Blue", "Blue", "Royal Blue", "Navy", "Purple", "Violet", "Lavender",
  "Pink", "Rose", "Magenta",
];

const HEX_SUFFIX = /\s+(#[0-9a-fA-F]{6})$/;

export interface ParsedColor {
  /** Human-readable name shown to the shopper. */
  label: string;
  /** Exact colour to paint the circle, or null when it isn't a colour. */
  hex: string | null;
  /** True for the special "Multicolour" option. */
  multi: boolean;
}

export function parseColorOption(raw: string): ParsedColor {
  const value = raw.trim();

  if (/^multi ?colou?r$/i.test(value)) return { label: value, hex: null, multi: true };

  const withHex = value.match(HEX_SUFFIX);
  if (withHex) {
    return { label: value.replace(HEX_SUFFIX, "").trim() || withHex[1]!, hex: withHex[1]!.toLowerCase(), multi: false };
  }

  if (/^#[0-9a-fA-F]{6}$/.test(value)) return { label: value.toUpperCase(), hex: value.toLowerCase(), multi: false };

  const named = NAMED_COLORS[value.toLowerCase()];
  return { label: value, hex: named ?? null, multi: false };
}

/** Builds the stored string for a custom colour picked from the palette. */
export function formatColorOption(label: string, hex: string): string {
  const clean = label.trim();
  // Unnamed: the hex alone is both the label and the colour.
  if (!clean) return hex.toLowerCase();
  const known = NAMED_COLORS[clean.toLowerCase()];
  // A known name that already matches this hex needs no suffix.
  if (known && known.toLowerCase() === hex.toLowerCase()) return clean;
  return `${clean} ${hex.toLowerCase()}`;
}

/** Label without the hex suffix — used in the WhatsApp message. */
export function colorOptionLabel(raw: string): string {
  return parseColorOption(raw).label;
}

/** True when a variant group should be shown as colour circles. */
export function isColorVariant(name: string): boolean {
  return /colou?r|shade/i.test(name.trim());
}

/** CSS background for a swatch, including the multicolour case. */
export function swatchBackground(parsed: ParsedColor): string {
  if (parsed.multi) {
    return "conic-gradient(#dc2626, #eab308, #16a34a, #2563eb, #7e22ce, #dc2626)";
  }
  return parsed.hex ?? "#e5e7eb";
}

/** Dark colours need a light checkmark and vice versa. */
export function isLightColor(hex: string | null): boolean {
  if (!hex) return true;
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return 0.299 * r + 0.587 * g + 0.114 * b > 160;
}
