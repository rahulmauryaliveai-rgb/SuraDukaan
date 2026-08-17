import type { Metadata } from "next";
import Link from "next/link";
import {
  Store,
  MessageCircle,
  QrCode,
  Smartphone,
  Search,
  FolderOpen,
  BarChart3,
  Sparkles,
  LinkIcon,
  LayoutGrid,
  ChevronRight,
} from "lucide-react";
import { db } from "@/lib/db";
import { formatINR } from "@/lib/utils";
import { getTheme } from "@/lib/themes";
import { Button } from "@/components/ui/button";
import { ShowcaseGallery, type ShowcaseEntry } from "@/components/marketing/showcase-gallery";
import { PricingTable } from "@/components/marketing/pricing-table";

export const metadata: Metadata = {
  title: "SURA SHOP — Turn Your Shop Into a Digital Storefront",
  description:
    "Create your online shop in minutes, add your products, and share one simple link on WhatsApp. Free to start.",
};
export const dynamic = "force-dynamic";

const FEATURES = [
  { icon: Store, title: "Digital Storefront", text: "A professional mini-website for your shop with your own link." },
  { icon: MessageCircle, title: "WhatsApp Orders", text: "Customers order directly on WhatsApp — no app, no signup." },
  { icon: LayoutGrid, title: "Product Catalog", text: "Photos, prices, variants, stock — managed from your phone." },
  { icon: QrCode, title: "QR Code", text: "Print your shop QR for the counter, packaging and visiting cards." },
  { icon: Smartphone, title: "Mobile Friendly", text: "Built mobile-first for you and your customers." },
  { icon: Search, title: "Product Search", text: "Customers find what they need in seconds." },
  { icon: FolderOpen, title: "Categories", text: "Organise products the way your shop is organised." },
  { icon: BarChart3, title: "Analytics", text: "Views, visitors, enquiries — know what's working." },
  { icon: Sparkles, title: "AI Product Assistance", text: "Descriptions and tags written for you." },
  { icon: LinkIcon, title: "Custom Shop URL", text: "sura.shop/your-shop-name — easy to say, easy to share." },
];

const FAQS = [
  {
    q: "Do my customers need to install an app?",
    a: "No. Your shop opens in any browser from a simple link. Customers browse and tap one button to reach you on WhatsApp.",
  },
  {
    q: "Do I need a website or technical knowledge?",
    a: "No. If you can use WhatsApp, you can use SURA SHOP. Create your shop, add products with photos and prices, and share your link.",
  },
  {
    q: "How do I receive orders?",
    a: "When a customer taps “Order on WhatsApp”, a pre-filled message with the product details opens in your WhatsApp chat. You confirm availability and delivery directly.",
  },
  {
    q: "Is it really free?",
    a: "Yes — the Free plan includes 20 products, your shop link, QR code and WhatsApp orders. Upgrade anytime as you grow.",
  },
  {
    q: "Can I use my own domain?",
    a: "Custom domain support is available on the Business plan and above.",
  },
];

async function getShowcaseEntries(): Promise<ShowcaseEntry[]> {
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
    return [];
  }
}

export default async function LandingPage() {
  const [plans, showcase] = await Promise.all([
    db.plan.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } }).catch(() => []),
    getShowcaseEntries(),
  ]);

  return (
    <div className="bg-white text-ink-900">
      {/* Nav */}
      <header className="sticky top-0 z-40 border-b border-ink-100 bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2 font-bold">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-700 text-white">
              <Store className="h-4 w-4" />
            </span>
            SURA <span className="text-brand-700">SHOP</span>
          </Link>
          <nav className="hidden items-center gap-6 text-sm font-medium text-ink-700 sm:flex">
            <a href="#features" className="hover:text-ink-900">Features</a>
            <a href="#pricing" className="hover:text-ink-900">Pricing</a>
            <a href="#faq" className="hover:text-ink-900">FAQ</a>
          </nav>
          <div className="flex items-center gap-2">
            <Link href="/login">
              <Button variant="ghost" size="sm">Log in</Button>
            </Link>
            <Link href="/register">
              <Button size="sm">Create Your Free Shop</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 sm:py-24 lg:grid-cols-2">
          <div>
            <p className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-800">
              Your Shop. One Link.
            </p>
            <h1 className="text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">
              Turn Your Shop Into a <span className="text-brand-700">Digital Storefront</span>
            </h1>
            <p className="mt-4 max-w-lg text-lg text-ink-500">
              Create your online shop in minutes, add your products, and share one simple link on
              WhatsApp.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/register">
                <Button size="lg">Create Your Free Shop</Button>
              </Link>
              <Link href="/urban-threads">
                <Button variant="outline" size="lg">View Demo Shop</Button>
              </Link>
            </div>
            <p className="mt-4 text-sm text-ink-500">Free plan · No credit card · Ready in 5 minutes</p>
          </div>

          {/* Phone mock */}
          <div className="mx-auto w-full max-w-xs">
            <div className="rounded-[2rem] border-8 border-ink-900 bg-white shadow-2xl">
              <div className="rounded-t-3xl bg-brand-700 p-4 text-white">
                <p className="text-xs opacity-80">sura.shop/sharma-fashion</p>
                <p className="mt-1 font-bold">Sharma Fashion</p>
                <p className="text-xs opacity-80">Clothing · Lucknow</p>
              </div>
              <div className="grid grid-cols-2 gap-2 p-3">
                {["Cotton Shirt|₹899", "Slim Jeans|₹1,199", "Sneakers|₹1,999", "Polo|₹549"].map((item) => {
                  const [name, price] = item.split("|");
                  return (
                    <div key={item} className="rounded-xl border border-ink-100 p-2">
                      <div className="mb-2 aspect-square rounded-lg bg-ink-100" />
                      <p className="truncate text-[11px] font-medium">{name}</p>
                      <p className="text-[11px] font-bold">{price}</p>
                    </div>
                  );
                })}
              </div>
              <div className="p-3 pt-0">
                <div className="flex items-center justify-center gap-1.5 rounded-xl bg-wa-dark py-2.5 text-xs font-semibold text-white">
                  <MessageCircle className="h-3.5 w-3.5" /> Order on WhatsApp
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="border-y border-ink-100 bg-ink-50 py-16">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-center text-3xl font-bold">How it works</h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ["Create Your Shop", "Register with your mobile number and name your shop."],
              ["Add Products", "Photos, prices, sizes — straight from your phone."],
              ["Share Your Link", "One link on WhatsApp, Instagram, Facebook or a QR code."],
              ["Get Customers", "Orders and enquiries arrive in your WhatsApp."],
            ].map(([title, text], i) => (
              <div key={title} className="relative rounded-2xl bg-white p-6 shadow-card">
                <span className="absolute -top-3 left-6 flex h-7 w-7 items-center justify-center rounded-full bg-brand-700 text-sm font-bold text-white">
                  {i + 1}
                </span>
                <h3 className="mt-2 font-semibold">{title}</h3>
                <p className="mt-1.5 text-sm text-ink-500">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Theme gallery — real seeded shops, one per theme */}
      <ShowcaseGallery entries={showcase} />

      {/* Features */}
      <section id="features" className="py-16">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-center text-3xl font-bold">Everything your shop needs online</h2>
          <p className="mx-auto mt-2 max-w-xl text-center text-ink-500">
            No hosting, no domains, no developers. Just your shop, beautifully online.
          </p>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <div key={f.title} className="rounded-2xl border border-ink-100 p-5 transition hover:shadow-card">
                <span className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
                  <f.icon className="h-5 w-5" />
                </span>
                <h3 className="font-semibold">{f.title}</h3>
                <p className="mt-1 text-sm text-ink-500">{f.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Demo shop banner */}
      <section className="mx-auto max-w-6xl px-4 pb-16">
        <div className="flex flex-col items-center justify-between gap-4 rounded-3xl bg-ink-900 px-8 py-10 text-white sm:flex-row">
          <div>
            <h2 className="text-2xl font-bold">See a live shop in action</h2>
            <p className="mt-1 text-ink-300">Urban Threads — a demo storefront built with SURA SHOP.</p>
          </div>
          <Link href="/urban-threads">
            <Button variant="whatsapp" size="lg" className="bg-white !text-ink-900 hover:brightness-95">
              Open Demo Shop <ChevronRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Pricing */}
      {/* Pricing */}
      <section id="pricing" className="border-t border-ink-100 bg-ink-50 py-16">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-center text-3xl font-bold">Simple, honest pricing</h2>
          <p className="mt-2 text-center text-ink-500">
            Start free. Pay only when your shop grows.
          </p>
          <PricingTable plans={plans} />
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-16">
        <div className="mx-auto max-w-3xl px-4">
          <h2 className="text-center text-3xl font-bold">Frequently asked questions</h2>
          <div className="mt-8 space-y-3">
            {FAQS.map((f) => (
              <details key={f.q} className="group rounded-2xl border border-ink-100 bg-white p-5">
                <summary className="cursor-pointer list-none font-semibold marker:hidden">
                  {f.q}
                </summary>
                <p className="mt-2 text-sm leading-relaxed text-ink-500">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="border-t border-ink-100 bg-brand-700 py-16 text-center text-white">
        <div className="mx-auto max-w-2xl px-4">
          <h2 className="text-3xl font-bold">Your shop deserves to be online.</h2>
          <p className="mt-2 text-brand-100">
            Create a professional digital shop, showcase your products, and turn WhatsApp
            conversations into customers.
          </p>
          <div className="mt-8 flex justify-center gap-3">
            <Link href="/register">
              <Button size="lg" className="bg-white !text-brand-800 hover:brightness-95">
                Create Your Free Shop
              </Button>
            </Link>
            <a href="#features">
              <Button size="lg" variant="ghost" className="!text-white hover:bg-white/10">
                See How It Works
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-ink-100 py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 text-sm text-ink-500 sm:flex-row">
          <p>© {new Date().getFullYear()} SURA CORP · SURA SHOP</p>
          <nav className="flex gap-5">
            <Link href="/privacy" className="hover:text-ink-900">Privacy</Link>
            <Link href="/terms" className="hover:text-ink-900">Terms</Link>
            <Link href="/refund-policy" className="hover:text-ink-900">Refunds</Link>
            <Link href="/contact" className="hover:text-ink-900">Contact</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
