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

export const STOREFRONT_TEMPLATES = [
  { id: "modern", name: "Modern", description: "Clean cards, teal accents — works for everything" },
  { id: "minimal", name: "Minimal", description: "Airy, typography-first, understated" },
  { id: "retail", name: "Retail", description: "Dense grid, price-forward, high energy" },
  { id: "fashion", name: "Fashion", description: "Large imagery, elegant serif touches" },
  { id: "food", name: "Food", description: "Warm tones, appetizing layout" },
] as const;
