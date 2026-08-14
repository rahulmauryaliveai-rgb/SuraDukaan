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
  address?: string;
  state?: string;
  pincode?: string;
  email?: string;
  openingHours?: string;
  instagram?: string;
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
    address: "12 Johari Bazaar, Near Hawa Mahal",
    state: "Rajasthan",
    pincode: "302003",
    email: "contact@sharmajewellers.in",
    openingHours: "Mon–Sat 11am–8pm · Sun closed",
    instagram: "@sharmajewellers",
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
    address: "78 Hazratganj Main Road",
    state: "Uttar Pradesh",
    pincode: "226001",
    email: "orders@guptasweets.in",
    openingHours: "Open all days 8am–10pm",
    instagram: "@guptasweetslko",
    categories: ["Mithai", "Cakes", "Namkeen"],
    products: [
      { name: "Kaju Katli (500g)", price: 650, category: "Mithai", featured: true, tags: ["mithai", "kaju"], description: "Pure cashew barfi with edible silver leaf. Made fresh daily.", image: u("1666190092159-3171cf0fbb12") },
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
    address: "Shop 14, Linking Road, Bandra West",
    state: "Maharashtra",
    pincode: "400050",
    email: "hello@urbanthreads.in",
    openingHours: "Mon–Sun 11am–9pm",
    instagram: "@urbanthreads",
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
    address: "Plot 5, Baner Road",
    state: "Maharashtra",
    pincode: "411045",
    email: "care@dailyfresh.in",
    openingHours: "Daily 7am–10pm",
    instagram: "@dailyfreshpune",
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
    address: "22 Indiranagar 100 Feet Road",
    state: "Karnataka",
    pincode: "560038",
    email: "orders@bloomandpetal.in",
    openingHours: "Daily 9am–8pm",
    instagram: "@bloomandpetal",
    categories: ["Bouquets", "Gift Hampers", "Plants"],
    products: [
      { name: "Red Rose Bouquet (12 stems)", price: 899, discountPrice: 799, category: "Bouquets", featured: true, tags: ["roses", "bouquet"], description: "A dozen premium red roses wrapped in craft paper with a ribbon.", image: u("1518895949257-7621c3c786d7") },
      { name: "Mixed Seasonal Bouquet", price: 1250, category: "Bouquets", featured: true, tags: ["bouquet", "seasonal"], description: "Florist's choice of the freshest seasonal blooms.", image: u("1519378058457-4c29a0a2efac") },
      { name: "Birthday Gift Hamper", price: 2100, discountPrice: 1899, category: "Gift Hampers", featured: true, tags: ["hamper", "birthday"], description: "Flowers, chocolates and a scented candle in a keepsake box.", image: u("1549465220-1a8b9238cd48") },
      { name: "Money Plant in Ceramic Pot", price: 549, category: "Plants", tags: ["plant", "indoor"], description: "Low-maintenance indoor plant in a hand-glazed pot.", image: u("1485955900006-10f4d324d411") },
      { name: "Anniversary Rose Box", price: 1650, category: "Gift Hampers", tags: ["anniversary", "roses"], description: "Preserved roses arranged in a velvet hat box.", image: u("1561181286-d3fee7d55364") },
      { name: "Succulent Trio", price: 699, category: "Plants", tags: ["succulent", "plants"], description: "Three assorted succulents in matching mini pots.", image: u("1520302630591-fd1c66edc19d") },
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
    address: "Gaffar Market, Karol Bagh",
    state: "Delhi",
    pincode: "110005",
    email: "sales@rkelectronics.in",
    openingHours: "Mon–Sat 10am–8pm",
    instagram: "@rkelectronics",
    categories: ["Audio", "Mobile Accessories", "Appliances"],
    products: [
      { name: "Wireless Earbuds", price: 2499, discountPrice: 1899, category: "Audio", featured: true, tags: ["earbuds", "bluetooth"], description: "40-hour total playback, ENC calling and fast charge. 1-year warranty.", image: u("1590658268037-6bf12165a8df") },
      { name: "Bluetooth Speaker", price: 3200, discountPrice: 2799, category: "Audio", featured: true, tags: ["speaker", "bluetooth"], description: "Punchy 20W output with IPX7 water resistance.", image: u("1608043152269-423dbba4e7e1") },
      { name: "Fast Charger 33W", price: 899, category: "Mobile Accessories", featured: true, tags: ["charger", "fast"], description: "Type-C fast charger with cable included.", image: u("1583863788434-e58a36330cf0") },
      { name: "Power Bank 20000mAh", price: 1899, discountPrice: 1599, category: "Mobile Accessories", tags: ["powerbank"], description: "Dual output with 22.5W fast charging support.", image: u("1585338107529-13afc5f02586") },
      { name: "Smart LED Bulb", price: 549, category: "Appliances", tags: ["smart", "led"], description: "16 million colours, app and voice control.", image: u("1550985543-49bee3167284") },
      { name: "Electric Kettle 1.5L", price: 1299, category: "Appliances", tags: ["kettle", "kitchen"], description: "Stainless steel with auto shut-off.", image: u("1594213114663-d94db9b17125") },
    ],
  },

  // ------------------------------------------------------------- MIDNIGHT
  {
    slug: "techno-hub",
    name: "Techno Hub",
    category: "Electronics",
    theme: "midnight",
    city: "Hyderabad",
    whatsapp: "919812345606",
    description:
      "Gaming gear, keyboards and PC components. Genuine stock, box-packed, with bill and warranty.",
    logoUrl: u("1591488320449-011701bb6704", 200),
    coverUrl: u("1587202372775-e229f172b9d7", 1600),
    address: "3rd Floor, Chenoy Trade Centre, Secunderabad",
    state: "Telangana",
    pincode: "500003",
    email: "support@technohub.in",
    openingHours: "Mon–Sat 11am–8:30pm",
    instagram: "@technohub",
    categories: ["Gaming", "Keyboards", "Components"],
    products: [
      { name: "Mechanical Keyboard RGB", price: 4499, discountPrice: 3799, category: "Keyboards", featured: true, variants: [{ name: "Switch", options: ["Red", "Blue", "Brown"] }], tags: ["keyboard", "gaming"], description: "Hot-swappable switches, per-key RGB and a detachable Type-C cable.", image: u("1618384887929-16ec33fab9ef") },
      { name: "Gaming Mouse 16000 DPI", price: 2299, category: "Gaming", featured: true, tags: ["mouse", "gaming"], description: "Lightweight honeycomb shell with a precision optical sensor.", image: u("1527814050087-3793815479db") },
      { name: "Over-Ear Gaming Headset", price: 3499, discountPrice: 2999, category: "Gaming", featured: true, tags: ["headset", "audio"], description: "50mm drivers with a noise-cancelling boom mic.", image: u("1599669454699-248893623440") },
      { name: "27\" 144Hz Monitor", price: 18999, category: "Components", tags: ["monitor", "display"], description: "IPS panel, 1ms response, height-adjustable stand.", image: u("1527443224154-c4a3942d3acf") },
      { name: "RGB Mousepad XL", price: 999, category: "Gaming", tags: ["mousepad"], description: "Extended desk mat with stitched edges and RGB border.", image: u("1615663245857-ac93bb7c39e7") },
    ],
  },

  // -------------------------------------------------------------- SAFFRON
  {
    slug: "royal-tandoor",
    name: "Royal Tandoor",
    category: "Restaurant",
    theme: "saffron",
    city: "Amritsar",
    whatsapp: "919812345607",
    description:
      "Authentic Punjabi tandoor since 1978. Dine in, take away or order on WhatsApp for home delivery.",
    logoUrl: u("1517248135467-4c7edcad34c4", 200),
    coverUrl: u("1414235077428-338989a2e8c0", 1600),
    address: "Lawrence Road, Near Company Bagh",
    state: "Punjab",
    pincode: "143001",
    email: "table@royaltandoor.in",
    openingHours: "Daily 12pm–11pm",
    instagram: "@royaltandoor",
    categories: ["Tandoor", "Curries", "Breads"],
    products: [
      { name: "Butter Chicken (Full)", price: 420, category: "Curries", featured: true, tags: ["chicken", "curry"], description: "Slow-cooked in tomato and cream gravy, finished with white butter.", image: u("1603894584373-5ac82b2ae398") },
      { name: "Tandoori Chicken (Half)", price: 320, category: "Tandoor", featured: true, tags: ["tandoori", "chicken"], description: "Overnight yoghurt marinade, charred in a clay oven.", image: u("1610057099443-fde8c4d50f91") },
      { name: "Paneer Tikka", price: 280, discountPrice: 249, category: "Tandoor", featured: true, tags: ["paneer", "veg"], description: "Malai paneer cubes with capsicum and onion.", image: u("1567188040759-fb8a883dc6d8") },
      { name: "Dal Makhani", price: 240, category: "Curries", tags: ["dal", "veg"], description: "Black lentils simmered overnight with butter and cream.", image: u("1585937421612-70a008356fbe") },
      { name: "Butter Naan (2 pcs)", price: 80, category: "Breads", tags: ["naan", "bread"], description: "Fresh from the tandoor, brushed with butter.", image: u("1585937421612-70a008356fbe") },
    ],
  },

  // ----------------------------------------------------------- APOTHECARY
  {
    slug: "wellness-chemist",
    name: "Wellness Chemist",
    category: "Pharmacy",
    theme: "apothecary",
    city: "Chennai",
    whatsapp: "919812345608",
    description:
      "Licensed pharmacy with home delivery. Send your prescription on WhatsApp and we will confirm availability.",
    logoUrl: u("1631549916768-4119b2e5f926", 200),
    coverUrl: u("1587854692152-cbe660dbde88", 1600),
    address: "45 Anna Salai, Nandanam",
    state: "Tamil Nadu",
    pincode: "600035",
    email: "care@wellnesschemist.in",
    openingHours: "Open 24 hours",
    instagram: "@wellnesschemist",
    categories: ["Wellness", "Personal Care", "Devices"],
    products: [
      { name: "Vitamin D3 Tablets (60)", price: 420, discountPrice: 379, category: "Wellness", featured: true, tags: ["vitamin", "supplement"], description: "Once-weekly 60000 IU tablets. Please consult your doctor.", image: u("1584308666744-24d5c474f2ae") },
      { name: "Digital BP Monitor", price: 1899, discountPrice: 1649, category: "Devices", featured: true, tags: ["bp", "monitor"], description: "Automatic upper-arm monitor with memory for two users.", image: u("1576091160550-2173dba999ef") },
      { name: "Immunity Multivitamin", price: 549, category: "Wellness", featured: true, tags: ["multivitamin"], description: "Daily multivitamin with zinc and vitamin C.", image: u("1607619056574-7b8d3ee536b2") },
      { name: "Digital Thermometer", price: 249, category: "Devices", tags: ["thermometer"], description: "Fast-read tip with fever alarm.", image: u("1584362917165-526a968579e8") },
      { name: "Sunscreen SPF 50", price: 499, category: "Personal Care", tags: ["sunscreen", "skincare"], description: "Broad-spectrum, non-greasy gel formula.", image: u("1556228720-195a672e8a03") },
    ],
  },

  // --------------------------------------------------------------- CANVAS
  {
    slug: "mitti-crafts",
    name: "Mitti Crafts",
    category: "Handicrafts",
    theme: "canvas",
    city: "Jodhpur",
    whatsapp: "919812345609",
    description:
      "Handmade terracotta, block prints and home accents made by artisan families in Rajasthan.",
    logoUrl: u("1513519245088-0e12902e5a38", 200),
    coverUrl: u("1528283648649-33347faa5d9e", 1600),
    address: "Near Clock Tower, Sardar Market",
    state: "Rajasthan",
    pincode: "342001",
    email: "hello@mitticrafts.in",
    openingHours: "Mon–Sat 10am–7pm",
    instagram: "@mitticrafts",
    categories: ["Pottery", "Textiles", "Wall Art"],
    products: [
      { name: "Terracotta Water Jug", price: 899, category: "Pottery", featured: true, tags: ["terracotta", "pottery"], description: "Hand-thrown clay jug that keeps water naturally cool.", image: u("1578749556568-bc2c40e68b61") },
      { name: "Block Print Cushion Cover", price: 449, discountPrice: 379, category: "Textiles", featured: true, variants: [{ name: "Size", options: ["16x16", "18x18"] }], tags: ["cushion", "blockprint"], description: "Hand block printed on cotton with natural dyes.", image: u("1584100936595-c0654b55a2e2") },
      { name: "Madhubani Wall Panel", price: 2400, category: "Wall Art", featured: true, tags: ["madhubani", "art"], description: "Hand-painted on handmade paper, mounted on wood.", image: u("1582053433976-25c00369fc93") },
      { name: "Handwoven Table Runner", price: 749, category: "Textiles", tags: ["runner", "handwoven"], description: "Cotton runner woven on a pit loom.", image: u("1600166898405-da9535204843") },
    ],
  },

  // ---------------------------------------------------------------- COURT
  {
    slug: "peak-sports",
    name: "Peak Sports",
    category: "Sports",
    theme: "court",
    city: "Bengaluru",
    whatsapp: "919812345610",
    description:
      "Training gear, footwear and gym equipment. Bulk orders for teams and academies welcome.",
    logoUrl: u("1517836357463-d25dfeac3438", 200),
    coverUrl: u("1534438327276-14e5300c3a48", 1600),
    address: "88 Jayanagar 4th Block",
    state: "Karnataka",
    pincode: "560011",
    email: "team@peaksports.in",
    openingHours: "Mon–Sun 10am–9pm",
    instagram: "@peaksports",
    categories: ["Footwear", "Training", "Apparel"],
    products: [
      { name: "Running Shoes Pro", price: 4999, discountPrice: 3999, category: "Footwear", featured: true, variants: [{ name: "Size", options: ["7", "8", "9", "10", "11"] }], tags: ["shoes", "running"], description: "Responsive foam midsole with a breathable knit upper.", image: u("1542291026-7eec264c27ff") },
      { name: "Adjustable Dumbbell 20kg", price: 3499, category: "Training", featured: true, tags: ["dumbbell", "gym"], description: "Cast iron plates with a knurled locking bar. Sold as a pair.", image: u("1584735935682-2f2b69dff9d2") },
      { name: "Yoga Mat 6mm", price: 899, discountPrice: 749, category: "Training", featured: true, variants: [{ name: "Colour", options: ["Black", "Blue", "Purple"] }], tags: ["yoga", "mat"], description: "Non-slip TPE mat with alignment lines and carry strap.", image: u("1601925260368-ae2f83cf8b7f") },
      { name: "Dry-Fit Training Tee", price: 799, category: "Apparel", variants: [{ name: "Size", options: ["S", "M", "L", "XL"] }], tags: ["tshirt", "drifit"], description: "Moisture-wicking fabric with mesh side panels.", image: u("1521572163474-6864f9cf17ab") },
      { name: "Resistance Band Set", price: 649, category: "Training", tags: ["bands", "home-gym"], description: "Five bands from light to extra heavy, with door anchor.", image: u("1598289431512-b97b0917affc") },
    ],
  },

  // --------------------------------------------------------------- TIMBER
  {
    slug: "teak-and-co",
    name: "Teak & Co",
    category: "Furniture",
    theme: "timber",
    city: "Kochi",
    whatsapp: "919812345611",
    description:
      "Solid wood furniture made to order. Visit our workshop or send us your room measurements on WhatsApp.",
    logoUrl: u("1538688525198-9b88f6f53126", 200),
    coverUrl: u("1555041469-a586c61ea9bc", 1600),
    address: "Workshop 7, Kaloor Junction",
    state: "Kerala",
    pincode: "682017",
    email: "studio@teakandco.in",
    openingHours: "Mon–Sat 10am–7pm",
    instagram: "@teakandco",
    categories: ["Seating", "Tables", "Storage"],
    products: [
      { name: "Sheesham Dining Table (6 Seater)", price: 42000, discountPrice: 37500, category: "Tables", featured: true, tags: ["dining", "sheesham"], description: "Solid sheesham top with a hand-rubbed natural finish.", image: u("1615874959474-d609969a20ed") },
      { name: "Teak Lounge Chair", price: 15500, category: "Seating", featured: true, tags: ["chair", "teak"], description: "Curved back with woven cane and a cushioned seat.", image: u("1567538096630-e0c55bd6374c") },
      { name: "Bookshelf (5 Tier)", price: 12800, discountPrice: 11200, category: "Storage", featured: true, tags: ["bookshelf", "storage"], description: "Open-back shelving in mango wood with a matte finish.", image: u("1594620302200-9a762244a156") },
      { name: "Nesting Coffee Tables", price: 8900, category: "Tables", tags: ["coffee-table"], description: "Set of two, stackable, with tapered legs.", image: u("1533090161767-e6ffed986c88") },
      { name: "Solid Wood Bed Frame", price: 34000, category: "Seating", variants: [{ name: "Size", options: ["Queen", "King"] }], tags: ["bed", "bedroom"], description: "Low-profile platform bed with a slatted base.", image: u("1505693416388-ac5ce068fe85") },
    ],
  },

  // ----------------------------------------------------------------- GLOW
  {
    slug: "glow-beauty-bar",
    name: "Glow Beauty Bar",
    category: "Beauty",
    theme: "glow",
    city: "Mumbai",
    whatsapp: "919812345612",
    description:
      "Skincare, makeup and salon-quality tools. Genuine brands only — message us for shade matching help.",
    logoUrl: u("1596462502278-27bfdc403348", 200),
    coverUrl: u("1487412947147-5cebf100ffc2", 1600),
    address: "Shop 3, Hill Road, Bandra West",
    state: "Maharashtra",
    pincode: "400050",
    email: "hello@glowbeautybar.in",
    openingHours: "Daily 11am–9pm",
    instagram: "@glowbeautybar",
    categories: ["Skincare", "Makeup", "Tools"],
    products: [
      { name: "Vitamin C Face Serum", price: 1299, discountPrice: 999, category: "Skincare", featured: true, tags: ["serum", "vitaminc"], description: "10% vitamin C with hyaluronic acid for daily brightening.", image: u("1620916566398-39f1143ab7be") },
      { name: "Matte Liquid Lipstick", price: 649, category: "Makeup", featured: true, variants: [{ name: "Shade", options: ["Rose", "Berry", "Nude", "Red"] }], tags: ["lipstick", "makeup"], description: "Transfer-resistant matte finish that lasts all day.", image: u("1586495777744-4413f21062fa") },
      { name: "Hydrating Sheet Mask (5)", price: 499, discountPrice: 425, category: "Skincare", featured: true, tags: ["mask", "skincare"], description: "Pack of five masks with hyaluronic acid and aloe.", image: u("1596755094514-f87e34085b2c") },
      { name: "Makeup Brush Set (12)", price: 1499, category: "Tools", tags: ["brush", "tools"], description: "Soft synthetic bristles with a vegan leather pouch.", image: u("1522335789203-aabd1fc54bc9") },
      { name: "Niacinamide Serum 10%", price: 749, category: "Skincare", tags: ["niacinamide"], description: "Targets blemishes and visible pores.", image: u("1608248543803-ba4f8c70ae0b") },
    ],
  },

  // ----------------------------------------------------------- PLAYGROUND
  {
    slug: "little-stars-toys",
    name: "Little Stars Toys",
    category: "Other",
    theme: "playground",
    city: "Indore",
    whatsapp: "919812345613",
    description:
      "Safe, age-appropriate toys and learning kits for ages 1–12. Gift wrapping available on request.",
    logoUrl: u("1566576912321-d58ddd7a6088", 200),
    coverUrl: u("1566576912321-d58ddd7a6088", 1600),
    address: "56 Palasia Main Road",
    state: "Madhya Pradesh",
    pincode: "452001",
    email: "hello@littlestars.in",
    openingHours: "Mon–Sun 10am–8pm",
    instagram: "@littlestarstoys",
    categories: ["Learning", "Soft Toys", "Outdoor"],
    products: [
      { name: "Wooden Building Blocks (100)", price: 1299, discountPrice: 1099, category: "Learning", featured: true, tags: ["blocks", "wooden"], description: "Smooth-sanded blocks in non-toxic colours. Ages 3+.", image: u("1587654780291-39c9404d746b") },
      { name: "Plush Teddy Bear (Large)", price: 899, category: "Soft Toys", featured: true, tags: ["teddy", "plush"], description: "Super-soft, machine washable, 60cm tall.", image: u("1559454403-b8fb88521f11") },
      { name: "STEM Robot Kit", price: 2499, discountPrice: 2199, category: "Learning", featured: true, tags: ["stem", "robot"], description: "Build-and-code robot with 5 project guides. Ages 8+.", image: u("1561144257-e32e8efc6c4f") },
      { name: "Kids Scooter (3 Wheel)", price: 2899, category: "Outdoor", variants: [{ name: "Colour", options: ["Pink", "Blue", "Green"] }], tags: ["scooter", "outdoor"], description: "Lean-to-steer with adjustable handlebar height.", image: u("1597645587822-e99fa5d45d25") },
      { name: "Art & Craft Kit", price: 749, category: "Learning", tags: ["craft", "art"], description: "Everything for 20 craft projects in one box.", image: u("1513364776144-60967b0f800f") },
    ],
  },

  // --------------------------------------------------------------- LEDGER
  {
    slug: "sharma-associates",
    name: "Sharma & Associates",
    category: "Services",
    theme: "ledger",
    city: "Delhi",
    whatsapp: "919812345614",
    description:
      "Chartered accountants offering GST, ITR and company registration services. Fixed, transparent fees.",
    logoUrl: u("1454165804606-c3d57bc86b40", 200),
    coverUrl: u("1497366754035-f200968a6e72", 1600),
    address: "Office 402, Connaught Place",
    state: "Delhi",
    pincode: "110001",
    email: "info@sharmaassociates.in",
    openingHours: "Mon–Fri 10am–6pm · Sat 10am–2pm",
    instagram: "@sharmacaassociates",
    categories: ["Tax Filing", "Registration", "Compliance"],
    products: [
      { name: "Income Tax Return (Salaried)", price: 1499, discountPrice: 999, category: "Tax Filing", featured: true, tags: ["itr", "tax"], description: "ITR-1 filing with Form 16 review and e-verification support.", image: u("1554224155-6726b3ff858f") },
      { name: "GST Registration", price: 2499, category: "Registration", featured: true, tags: ["gst", "registration"], description: "End-to-end GSTIN application including document preparation.", image: u("1450101499163-c8848c66ca85") },
      { name: "Private Limited Company Setup", price: 12999, discountPrice: 10999, category: "Registration", featured: true, tags: ["company", "incorporation"], description: "Name approval, DSC, DIN, MOA/AOA and incorporation certificate.", image: u("1507003211169-0a1dd7228f2d") },
      { name: "Monthly GST Filing", price: 999, category: "Compliance", tags: ["gst", "monthly"], description: "GSTR-1 and GSTR-3B filing per month for small businesses.", image: u("1460925895917-afdab827c52f") },
      { name: "Business Accounting (Monthly)", price: 4999, category: "Compliance", tags: ["accounting", "bookkeeping"], description: "Bookkeeping, ledger maintenance and monthly P&L statement.", image: u("1543286386-713bdd548da4") },
    ],
  },

  // ---------------------------------------------------------------- SPICE
  {
    slug: "masala-bazaar",
    name: "Masala Bazaar",
    category: "Grocery",
    theme: "spice",
    city: "Kochi",
    whatsapp: "919812345615",
    description:
      "Whole and ground spices sourced direct from Kerala and Rajasthan farms. Packed on order for freshness.",
    logoUrl: u("1596040033229-a9821ebd058d", 200),
    coverUrl: u("1509358271058-acd22cc93898", 1600),
    address: "Spice Market, Mattancherry",
    state: "Kerala",
    pincode: "682002",
    email: "orders@masalabazaar.in",
    openingHours: "Mon–Sat 9am–7pm",
    instagram: "@masalabazaar",
    categories: ["Whole Spices", "Ground Masala", "Dry Fruits"],
    products: [
      { name: "Kashmiri Red Chilli Powder (500g)", price: 320, discountPrice: 285, category: "Ground Masala", featured: true, tags: ["chilli", "masala"], description: "Deep colour, mild heat. Stone-ground in small batches.", image: u("1583744946564-b52ac1c389c8") },
      { name: "Green Cardamom (100g)", price: 480, category: "Whole Spices", featured: true, tags: ["cardamom", "elaichi"], description: "8mm bold pods from Idukki, hand-sorted.", image: u("1615485290382-441e4d049cb5") },
      { name: "Garam Masala (200g)", price: 210, category: "Ground Masala", featured: true, tags: ["garam-masala"], description: "House blend of 13 spices, roasted then ground.", image: u("1596040033229-a9821ebd058d") },
      { name: "Turmeric Powder (500g)", price: 180, category: "Ground Masala", tags: ["turmeric", "haldi"], description: "High-curcumin Salem turmeric, sun-dried.", image: u("1615485500704-8e990f9900f7") },
    ],
  },
];
