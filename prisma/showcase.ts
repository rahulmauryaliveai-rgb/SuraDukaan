/**
 * Showcase shops — one per storefront theme.
 *
 * These are real, fully working storefronts seeded into the database. The
 * landing-page theme gallery reads them from the DB, so "Open live" always
 * opens a genuine shop rather than a screenshot.
 *
 * Images are Unsplash URLs (free to use under the Unsplash licence).
 */

export interface ShowcaseProduct {
  name: string;
  price: number;
  discountPrice?: number;
  category: string;
  description: string;
  featured?: boolean;
  variants?: { name: string; options: string[] }[];
  tags: string[];
  image: string;
}

export interface ShowcaseShop {
  slug: string;
  name: string;
  category: string;
  theme: string;
  city: string;
  whatsapp: string;
  description: string;
  logoUrl: string;
  coverUrl: string;
  categories: string[];
  products: ShowcaseProduct[];
}

const u = (id: string, w = 800) => `https://images.unsplash.com/photo-${id}?w=${w}&q=75&auto=format&fit=crop`;

export const SHOWCASE_SHOPS: ShowcaseShop[] = [
  // ---------------------------------------------------------------- ROYAL
  {
    slug: "sharma-jewellers",
    name: "Sharma Jewellers",
    category: "Jewellery",
    theme: "royal",
    city: "Jaipur",
    whatsapp: "919812345601",
    description:
      "Three generations of handcrafted silver and gold. Bridal sets, payals and everyday pieces — message us for today's rate.",
    logoUrl: u("1611591437281-460bfbe1220a", 200),
    coverUrl: u("1610375461246-83df859d849d", 1600),
    categories: ["Bridal", "Silver Payals", "Daily Wear"],
    products: [
      { name: "Kundan Bridal Necklace Set", price: 45000, discountPrice: 39999, category: "Bridal", featured: true, tags: ["kundan", "bridal"], description: "Handcrafted kundan set with matching earrings and maang tikka. Certified stones.", image: u("1601121141461-9d6647bca1ed") },
      { name: "Oxidised Silver Payal", price: 2400, discountPrice: 1999, category: "Silver Payals", featured: true, variants: [{ name: "Size", options: ["Small", "Medium", "Large"] }], tags: ["payal", "silver"], description: "Traditional oxidised finish with ghungroo detailing. Sold as a pair.", image: u("1515562141207-7a88fb7ce338") },
      { name: "Gold Plated Jhumka", price: 3200, category: "Daily Wear", featured: true, tags: ["earrings", "jhumka"], description: "Lightweight jhumkas with pearl drops — comfortable for all-day wear.", image: u("1535632066927-ab7c9ab60908") },
      { name: "Temple Design Bangles", price: 8500, discountPrice: 7650, category: "Bridal", tags: ["bangles", "temple"], description: "Set of four temple-motif bangles in antique gold finish.", image: u("1611652022419-a9419f74343d") },
      { name: "Silver Toe Rings", price: 899, category: "Silver Payals", tags: ["bichhiya", "silver"], description: "Pure silver bichhiya in a classic floral pattern.", image: u("1573408301185-9146fe634ad0") },
      { name: "Pearl Drop Pendant", price: 4100, category: "Daily Wear", tags: ["pendant", "pearl"], description: "Freshwater pearl on a fine gold-plated chain.", image: u("1599643478518-a784e5dc4c8f") },
    ],
  },

  // ----------------------------------------------------------------- WARM
  {
    slug: "gupta-sweets",
    name: "Gupta Sweets & Bakery",
    category: "Bakery",
    theme: "warm",
    city: "Lucknow",
    whatsapp: "919812345602",
    description:
      "Fresh mithai, cakes and namkeen made every morning. Custom orders for weddings and festivals — order a day ahead.",
    logoUrl: u("1509440159596-0249088772ff", 200),
    coverUrl: u("1517433670267-08bbd4be890f", 1600),
    categories: ["Mithai", "Cakes", "Namkeen"],
    products: [
      { name: "Kaju Katli (500g)", price: 650, category: "Mithai", featured: true, tags: ["mithai", "kaju"], description: "Pure cashew barfi with edible silver leaf. Made fresh daily.", image: u("1605197161470-5d2a9af0ac7e") },
      { name: "Chocolate Truffle Cake", price: 850, discountPrice: 749, category: "Cakes", featured: true, variants: [{ name: "Weight", options: ["500g", "1kg", "2kg"] }], tags: ["cake", "chocolate"], description: "Rich Belgian chocolate truffle. Eggless option available on request.", image: u("1578985545062-69928b1d9587") },
      { name: "Motichoor Laddoo (1kg)", price: 520, category: "Mithai", featured: true, tags: ["laddoo", "mithai"], description: "Soft motichoor laddoos in pure desi ghee.", image: u("1601050690597-df0568f70950") },
      { name: "Black Forest Pastry", price: 90, category: "Cakes", tags: ["pastry"], description: "Layered cream and cherry pastry, sold per piece.", image: u("1464349095431-e9a21285b5f3") },
      { name: "Mixed Namkeen (500g)", price: 240, category: "Namkeen", tags: ["namkeen", "snacks"], description: "House blend of sev, boondi and peanuts.", image: u("1599490659213-e2b9527bd087") },
      { name: "Rasgulla Tin (1kg)", price: 380, discountPrice: 340, category: "Mithai", tags: ["rasgulla", "bengali"], description: "Spongy rasgullas in light sugar syrup.", image: u("1589301760014-d929f3979dbc") },
    ],
  },

  // -------------------------------------------------------------- ATELIER
  {
    slug: "urban-threads",
    name: "Urban Threads",
    category: "Clothing",
    theme: "atelier",
    city: "Mumbai",
    whatsapp: "918888888888",
    description:
      "Modern everyday fashion for men — shirts, denim, sneakers and accessories. Order directly on WhatsApp.",
    logoUrl: u("1503341504253-dff4815485f1", 200),
    coverUrl: u("1441986300917-64674bd600d8", 1600),
    categories: ["Men", "Footwear", "Accessories"],
    products: [
      { name: "Premium Cotton Shirt", price: 899, discountPrice: 749, category: "Men", featured: true, variants: [{ name: "Size", options: ["S", "M", "L", "XL", "XXL"] }], tags: ["shirt", "cotton"], description: "Breathable 100% cotton shirt with a tailored fit. Perfect for office and festive wear.", image: u("1596755094514-f87e34085b2c") },
      { name: "Slim Fit Jeans", price: 1499, discountPrice: 1199, category: "Men", featured: true, variants: [{ name: "Waist", options: ["30", "32", "34", "36"] }], tags: ["jeans", "denim"], description: "Stretchable denim with a modern slim cut. Fade-resistant wash.", image: u("1542272604-787c3835535d") },
      { name: "Casual Sneakers", price: 1999, category: "Footwear", featured: true, variants: [{ name: "Size", options: ["7", "8", "9", "10"] }], tags: ["shoes", "sneakers"], description: "Lightweight everyday sneakers with cushioned soles.", image: u("1549298916-b41d501d3772") },
      { name: "Classic Polo", price: 699, discountPrice: 549, category: "Men", variants: [{ name: "Size", options: ["S", "M", "L", "XL"] }], tags: ["polo", "tshirt"], description: "Soft pique polo with a classic collar. Everyday comfort.", image: u("1586790170083-2f9ceadc732d") },
      { name: "Leather Wallet", price: 599, category: "Accessories", tags: ["wallet", "leather"], description: "Genuine leather bi-fold wallet with 6 card slots.", image: u("1627123424574-724758594e93") },
      { name: "Summer T-Shirt", price: 449, discountPrice: 349, category: "Men", variants: [{ name: "Size", options: ["S", "M", "L", "XL"] }, { name: "Color", options: ["White", "Navy", "Olive"] }], tags: ["tshirt", "summer"], description: "Ultra-light crew neck tee in seasonal colours.", image: u("1521572163474-6864f9cf17ab") },
    ],
  },

  // ---------------------------------------------------------------- FRESH
  {
    slug: "daily-fresh-kirana",
    name: "Daily Fresh Kirana",
    category: "Grocery",
    theme: "fresh",
    city: "Pune",
    whatsapp: "919812345603",
    description:
      "Your neighbourhood kirana, now online. Free home delivery on orders above ₹500 within 3 km.",
    logoUrl: u("1542838132-92c53300491e", 200),
    coverUrl: u("1578916171728-46686eac8d58", 1600),
    categories: ["Staples", "Fresh Produce", "Household"],
    products: [
      { name: "Basmati Rice (5kg)", price: 650, discountPrice: 599, category: "Staples", featured: true, tags: ["rice", "basmati"], description: "Aged long-grain basmati. Ideal for biryani and pulao.", image: u("1586201375761-83865001e31c") },
      { name: "Toor Dal (1kg)", price: 180, category: "Staples", featured: true, tags: ["dal", "pulses"], description: "Unpolished toor dal, cleaned and packed fresh.", image: u("1596797038530-2c107229654b") },
      { name: "Fresh Tomatoes (1kg)", price: 40, category: "Fresh Produce", featured: true, tags: ["vegetables", "tomato"], description: "Farm-fresh tomatoes, sorted and graded this morning.", image: u("1546094096-0df4bcaaa337") },
      { name: "Sunflower Oil (1L)", price: 145, discountPrice: 132, category: "Staples", tags: ["oil", "cooking"], description: "Refined sunflower oil pouch.", image: u("1474979266404-7eaacbcd87c5") },
      { name: "Detergent Powder (1kg)", price: 120, category: "Household", tags: ["detergent", "cleaning"], description: "Tough on stains, gentle on hands.", image: u("1610557892470-55d9e80c0bce") },
      { name: "Onions (2kg)", price: 70, category: "Fresh Produce", tags: ["vegetables", "onion"], description: "Nashik red onions, medium size.", image: u("1618512496248-a07fe83aa8cb") },
    ],
  },

  // ---------------------------------------------------------------- BLOOM
  {
    slug: "bloom-and-petal",
    name: "Bloom & Petal",
    category: "Home Decor",
    theme: "bloom",
    city: "Bengaluru",
    whatsapp: "919812345604",
    description:
      "Fresh flower bouquets, gift hampers and event decor. Same-day delivery for orders before 4 pm.",
    logoUrl: u("1487070183336-b863922373d4", 200),
    coverUrl: u("1563241527-3004b7be0ffd", 1600),
    categories: ["Bouquets", "Gift Hampers", "Plants"],
    products: [
      { name: "Red Rose Bouquet (12 stems)", price: 899, discountPrice: 799, category: "Bouquets", featured: true, tags: ["roses", "bouquet"], description: "A dozen premium red roses wrapped in craft paper with a ribbon.", image: u("1518895949257-7621c3c786d7") },
      { name: "Mixed Seasonal Bouquet", price: 1250, category: "Bouquets", featured: true, tags: ["bouquet", "seasonal"], description: "Florist's choice of the freshest seasonal blooms.", image: u("1519378058457-4c29a0a2efac") },
      { name: "Birthday Gift Hamper", price: 2100, discountPrice: 1899, category: "Gift Hampers", featured: true, tags: ["hamper", "birthday"], description: "Flowers, chocolates and a scented candle in a keepsake box.", image: u("1549465220-1a8b9238cd48") },
      { name: "Money Plant in Ceramic Pot", price: 549, category: "Plants", tags: ["plant", "indoor"], description: "Low-maintenance indoor plant in a hand-glazed pot.", image: u("1485955900006-10f4d324d411") },
      { name: "Anniversary Rose Box", price: 1650, category: "Gift Hampers", tags: ["anniversary", "roses"], description: "Preserved roses arranged in a velvet hat box.", image: u("1561181286-d3fee7d55364") },
      { name: "Succulent Trio", price: 699, category: "Plants", tags: ["succulent", "plants"], description: "Three assorted succulents in matching mini pots.", image: u("1509423350716-97f2360af2e4") },
    ],
  },

  // --------------------------------------------------------------- MODERN
  {
    slug: "rk-electronics",
    name: "RK Electronics",
    category: "Electronics",
    theme: "modern",
    city: "Delhi",
    whatsapp: "919812345605",
    description:
      "Mobiles, audio and home appliances at honest prices. All products come with full manufacturer warranty.",
    logoUrl: u("1550009158-9ebf69173e03", 200),
    coverUrl: u("1441986300917-64674bd600d8", 1600),
    categories: ["Audio", "Mobile Accessories", "Appliances"],
    products: [
      { name: "Wireless Earbuds", price: 2499, discountPrice: 1899, category: "Audio", featured: true, tags: ["earbuds", "bluetooth"], description: "40-hour total playback, ENC calling and fast charge. 1-year warranty.", image: u("1590658268037-6bf12165a8df") },
      { name: "Bluetooth Speaker", price: 3200, discountPrice: 2799, category: "Audio", featured: true, tags: ["speaker", "bluetooth"], description: "Punchy 20W output with IPX7 water resistance.", image: u("1608043152269-423dbba4e7e1") },
      { name: "Fast Charger 33W", price: 899, category: "Mobile Accessories", featured: true, tags: ["charger", "fast"], description: "Type-C fast charger with cable included.", image: u("1583863788434-e58a36330cf0") },
      { name: "Power Bank 20000mAh", price: 1899, discountPrice: 1599, category: "Mobile Accessories", tags: ["powerbank"], description: "Dual output with 22.5W fast charging support.", image: u("1609592806596-b43bada2f4bb") },
      { name: "Smart LED Bulb", price: 549, category: "Appliances", tags: ["smart", "led"], description: "16 million colours, app and voice control.", image: u("1550985543-49bee3167284") },
      { name: "Electric Kettle 1.5L", price: 1299, category: "Appliances", tags: ["kettle", "kitchen"], description: "Stainless steel with auto shut-off.", image: u("1594213114663-d94db9b17125") },
    ],
  },
];
