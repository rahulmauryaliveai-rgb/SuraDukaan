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
  ArrowRight,
  Check,
} from "lucide-react";
import { db } from "@/lib/db";
import { formatINR } from "@/lib/utils";
import { getTheme } from "@/lib/themes";
import { ShowcaseGallery, type ShowcaseEntry } from "@/components/marketing/showcase-gallery";
import { PricingTable } from "@/components/marketing/pricing-table";

export const metadata: Metadata = {
  title: "SURA SHOP — Turn Your Shop Into a Digital Storefront",
  description:
    "Create your online shop in minutes, add your products, and share one simple link on WhatsApp. Free to start.",
};
export const dynamic = "force-dynamic";

const FEATURES = [
  { icon: LinkIcon, title: "One link for everything", text: "Share sura.shop/your-shop on WhatsApp, Instagram or a printed QR code. Nothing to install." },
  { icon: MessageCircle, title: "Enquiries on WhatsApp", text: "Every product has a button that opens a WhatsApp chat with the item details already filled in." },
  { icon: Sparkles, title: "AI photo clean-up", text: "Turn a phone snap into a clean studio photo. Your original is always kept, so you can undo." },
  { icon: LayoutGrid, title: "16 distinct themes", text: "Pick a look that suits your trade. No two shops on SURA have to look the same." },
  { icon: Smartphone, title: "Built mobile-first", text: "You run the shop from your phone. Your buyers arrive on a phone. Designed for exactly that." },
  { icon: BarChart3, title: "Know what sells", text: "Views, visitors and enquiries — in plain language, without needing to read a chart." },
  { icon: QrCode, title: "QR for your counter", text: "Print your shop QR for the counter, your packaging and your visiting cards." },
  { icon: FolderOpen, title: "Your categories", text: "Organise products the way your shop is actually organised." },
  { icon: Search, title: "Fast product search", text: "Customers find what they need in seconds, even with hundreds of products." },
];

const STEPS = [
  ["Create your shop", "Sign in with your mobile number and name your shop. No password to remember."],
  ["Add products", "Photos, prices, sizes and colours — straight from your phone."],
  ["Share your link", "One link on WhatsApp, Instagram or Facebook, or a QR code on your counter."],
  ["Get customers", "Enquiries arrive in your WhatsApp, with the product details attached."],
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
    q: "What does the AI do to my product photos?",
    a: "It corrects the lighting, colour and framing, and lifts the product onto a clean backdrop. It never redraws the product itself, and your original photo is always kept so you can revert.",
  },
  {
    q: "Is it really free?",
    a: "Yes — the Free plan includes your shop link, QR code and WhatsApp enquiries. Upgrade any time as you grow.",
  },
  {
    q: "Can I use my own domain?",
    a: "Custom domain support is available on the Pro plan.",
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

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-pill bg-soft-100 px-4 py-1.5 text-sm font-semibold text-deep-800">
      {children}
    </span>
  );
}

export default async function LandingPage() {
  const [plans, showcase] = await Promise.all([
    db.plan.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } }).catch(() => []),
    getShowcaseEntries(),
  ]);

  return (
    <div className="bg-white text-moss-600">
      {/* ---------------- Nav ---------------- */}
      <header className="sticky top-0 z-40 border-b border-line-200 bg-white/85 backdrop-blur-md">
        <div className="mx-auto flex h-[76px] max-w-6xl items-center gap-8 px-5">
          <Link href="/" className="flex items-center gap-2.5 text-xl font-extrabold text-deep-700">
            <span className="flex h-9 w-9 items-center justify-center rounded-[5px] bg-deep-800 text-mint-400">
              <Store className="h-4 w-4" />
            </span>
            SURA <span className="text-brand-700">SHOP</span>
          </Link>
          <nav className="hidden items-center gap-6 text-base font-medium md:flex">
            <a href="#features" className="transition hover:text-deep-800">Features</a>
            <a href="#themes" className="transition hover:text-deep-800">Themes</a>
            <a href="#pricing" className="transition hover:text-deep-800">Pricing</a>
            <a href="#faq" className="transition hover:text-deep-800">FAQ</a>
          </nav>
          <div className="ml-auto flex items-center gap-3">
            <Link
              href="/login"
              className="hidden rounded-pill border-[1.5px] border-line-200 px-6 py-3 text-sm font-semibold text-deep-700 transition duration-300 hover:bg-soft-50 sm:inline-block"
            >
              Log in
            </Link>
            <Link
              href="/register"
              className="rounded-pill bg-mint-400 px-6 py-3 text-sm font-semibold text-deep-800 shadow-raise transition duration-300 hover:-translate-y-0.5 hover:bg-mint-500"
            >
              Create free shop
            </Link>
          </div>
        </div>
      </header>

      {/* ---------------- Hero ---------------- */}
      <section className="relative overflow-hidden bg-[radial-gradient(900px_460px_at_78%_8%,#f4fbf3,transparent_65%),radial-gradient(700px_380px_at_8%_0%,#f0f9ef,transparent_60%)]">
        <div className="mx-auto grid max-w-6xl items-center gap-16 px-5 pb-24 pt-16 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <Eyebrow>Your Shop. One Link.</Eyebrow>
            <h1 className="mt-6 text-[clamp(38px,7vw,80px)] font-extrabold leading-[1.06] tracking-[-0.02em] text-deep-700">
              Turn your shop into a digital storefront
            </h1>
            <p className="mt-4 max-w-[46ch] text-lg leading-relaxed">
              Add your products, share one link on WhatsApp, and take enquiries from customers who
              never have to install anything.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                href="/register"
                className="inline-flex items-center gap-2 rounded-pill bg-mint-400 px-7 py-3.5 font-semibold text-deep-800 shadow-raise transition duration-300 hover:-translate-y-0.5 hover:bg-mint-500"
              >
                Create your free shop <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/urban-threads"
                className="inline-flex items-center gap-2 rounded-pill border-[1.5px] border-line-200 px-7 py-3.5 font-semibold text-deep-700 transition duration-300 hover:bg-soft-50"
              >
                View demo shop
              </Link>
            </div>
            <p className="mt-4 text-sm">Free plan · No credit card · Ready in 5 minutes</p>
          </div>

          {/* Phone mock with floating stat cards */}
          <div className="relative mx-auto grid min-h-[520px] w-full max-w-md place-items-center">
            <div className="animate-bob absolute left-0 top-8 hidden rounded-card border border-line-200 bg-white px-6 py-4 shadow-lift sm:block">
              <b className="block text-[32px] font-extrabold leading-none text-deep-800">5 min</b>
              <small className="text-[13px]">to go live</small>
            </div>
            <div
              className="animate-bob absolute -right-2 top-52 hidden rounded-card border border-line-200 bg-white px-4 py-3 shadow-lift sm:block"
              style={{ animationDelay: "-1.2s" }}
            >
              <b className="block text-xl font-extrabold leading-none text-deep-800">16</b>
              <small className="text-[13px]">shop themes</small>
            </div>
            <div
              className="animate-bob absolute bottom-14 right-0 hidden rounded-card border border-line-200 bg-white px-6 py-4 shadow-lift sm:block"
              style={{ animationDelay: "-2.5s" }}
            >
              <b className="block text-[32px] font-extrabold leading-none text-deep-800">0%</b>
              <small className="text-[13px]">commission on sales</small>
            </div>

            <div className="w-[290px] rounded-[38px] bg-deep-900 p-2.5 shadow-[0_30px_70px_rgb(4_60_58/0.28)]">
              <div className="overflow-hidden rounded-[30px] bg-white">
                <div className="bg-deep-800 px-4 py-6 text-white">
                  <small className="text-xs opacity-75">sura.shop/sharma-fashion</small>
                  <h4 className="mt-0.5 text-xl font-bold text-white">Sharma Fashion</h4>
                  <small className="text-xs opacity-75">Clothing · Lucknow</small>
                </div>
                <div className="grid grid-cols-2 gap-2.5 p-3">
                  {[
                    ["Cotton Shirt", "₹899"],
                    ["Kurta Set", "₹1,499"],
                    ["Sneakers", "₹1,999"],
                    ["Denim Jacket", "₹2,299"],
                  ].map(([name, price]) => (
                    <div key={name} className="overflow-hidden rounded-xl border border-line-200">
                      <div className="h-[74px] bg-gradient-to-br from-soft-100 to-[#dff0dd]" />
                      <p className="truncate px-2 pb-0.5 pt-1.5 text-xs font-semibold text-deep-700">{name}</p>
                      <small className="block px-2 pb-2 text-xs">{price}</small>
                    </div>
                  ))}
                </div>
                <div className="px-3 pb-3.5">
                  <div className="flex items-center justify-center gap-1.5 rounded-pill bg-wa py-2.5 text-[13px] font-semibold text-white">
                    <MessageCircle className="h-3.5 w-3.5" /> Order on WhatsApp
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- Trust bar ---------------- */}
      <div className="border-y border-line-200 bg-soft-50 py-8">
        <div className="mx-auto max-w-6xl px-5">
          <p className="text-center text-sm font-semibold uppercase tracking-[0.08em]">
            Built for Indian shop owners
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-x-12 gap-y-3 opacity-70">
            {["Kirana", "Fashion", "Jewellery", "Sweets", "Electronics", "Pharmacy"].map((t) => (
              <span key={t} className="text-lg font-bold text-deep-700">{t}</span>
            ))}
          </div>
        </div>
      </div>

      {/* ---------------- Features ---------------- */}
      <section id="features" className="py-24">
        <div className="mx-auto max-w-6xl px-5">
          <div className="mx-auto mb-16 max-w-2xl text-center">
            <Eyebrow>Everything included</Eyebrow>
            <h2 className="mt-4 text-[clamp(28px,4.4vw,56px)] font-extrabold leading-[1.08] tracking-[-0.02em] text-deep-700">
              Sell without a website, an app, or a developer
            </h2>
            <p className="mt-4 text-lg">
              Set your shop up from your phone. Your customers open one link and message you on WhatsApp.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="rounded-card border border-line-200 bg-white p-8 transition duration-300 hover:-translate-y-1.5 hover:shadow-lift"
              >
                <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-soft-100 text-deep-800">
                  <f.icon className="h-6 w-6" />
                </span>
                <h3 className="text-xl font-bold leading-snug text-deep-700">{f.title}</h3>
                <p className="mt-3">{f.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- How it works ---------------- */}
      <section className="bg-soft-50 py-24">
        <div className="mx-auto max-w-6xl px-5">
          <div className="mx-auto mb-16 max-w-2xl text-center">
            <Eyebrow>Set-up</Eyebrow>
            <h2 className="mt-4 text-[clamp(28px,4.4vw,56px)] font-extrabold leading-[1.08] tracking-[-0.02em] text-deep-700">
              Live in five minutes
            </h2>
            <p className="mt-4 text-lg">Four short steps, all on your phone.</p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map(([title, text], i) => (
              <div key={title} className="relative rounded-card border border-line-200 bg-white p-8">
                <span className="absolute -top-4 left-8 flex h-8 w-8 items-center justify-center rounded-pill bg-deep-800 text-sm font-bold text-mint-400">
                  {i + 1}
                </span>
                <h3 className="mt-2 text-lg font-bold text-deep-700">{title}</h3>
                <p className="mt-2 text-sm">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ------- Theme gallery — real seeded shops, one per theme ------- */}
      <ShowcaseGallery entries={showcase} />

      {/* ---------------- Stats band ---------------- */}
      <section className="py-24">
        <div className="mx-auto max-w-6xl px-5">
          <div className="rounded-card bg-deep-800 px-8 py-16 text-white">
            <h2 className="text-center text-[clamp(28px,4.4vw,56px)] font-extrabold leading-[1.08] tracking-[-0.02em] text-white">
              Made for how India actually shops
            </h2>
            <div className="mt-12 grid gap-10 sm:grid-cols-3">
              {[
                ["0%", "Commission — you keep every rupee"],
                ["5 min", "From sign-up to a live shop link"],
                ["16", "Themes so your shop looks like yours"],
              ].map(([n, label]) => (
                <div key={label} className="text-center">
                  <b className="block text-[clamp(36px,4vw,56px)] font-extrabold leading-none text-mint-400">{n}</b>
                  <small className="mt-2 block text-base text-white/80">{label}</small>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- Pricing ---------------- */}
      <section id="pricing" className="bg-soft-50 py-24">
        <div className="mx-auto max-w-6xl px-5">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <Eyebrow>Pricing</Eyebrow>
            <h2 className="mt-4 text-[clamp(28px,4.4vw,56px)] font-extrabold leading-[1.08] tracking-[-0.02em] text-deep-700">
              Simple pricing, no commission
            </h2>
            <p className="mt-4 text-lg">
              Start free. Upgrade when your shop grows. We never take a cut of your sales.
            </p>
          </div>
          <PricingTable plans={plans} />
        </div>
      </section>

      {/* ---------------- FAQ ---------------- */}
      <section id="faq" className="py-24">
        <div className="mx-auto max-w-3xl px-5">
          <div className="mb-12 text-center">
            <Eyebrow>FAQ</Eyebrow>
            <h2 className="mt-4 text-[clamp(28px,4.4vw,56px)] font-extrabold leading-[1.08] tracking-[-0.02em] text-deep-700">
              Questions shop owners ask
            </h2>
          </div>
          <div className="space-y-3">
            {FAQS.map((f) => (
              <details
                key={f.q}
                className="group rounded-card border border-line-200 bg-white p-6 open:bg-soft-50"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold text-deep-700 marker:hidden">
                  {f.q}
                  <span className="shrink-0 text-2xl leading-none text-deep-800 group-open:hidden">+</span>
                  <span className="hidden shrink-0 text-2xl leading-none text-deep-800 group-open:inline">–</span>
                </summary>
                <p className="mt-3 leading-relaxed">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- Final CTA ---------------- */}
      <section className="pb-24">
        <div className="mx-auto max-w-6xl px-5">
          <div className="relative overflow-hidden rounded-card bg-deep-900 px-8 py-24 text-center">
            <span className="pointer-events-none absolute -left-32 -top-40 h-[420px] w-[420px] rounded-full bg-[radial-gradient(circle,rgb(205_250_206/0.22),transparent_70%)]" />
            <span className="pointer-events-none absolute -bottom-52 -right-28 h-[420px] w-[420px] rounded-full bg-[radial-gradient(circle,rgb(205_250_206/0.22),transparent_70%)]" />
            <h2 className="relative text-[clamp(28px,4.4vw,56px)] font-extrabold leading-[1.08] tracking-[-0.02em] text-white">
              Your shop, online tonight
            </h2>
            <p className="relative mx-auto mt-4 max-w-[52ch] text-white/80">
              Create your free shop, add a few products, and send the link to your customers before
              you close today.
            </p>
            <div className="relative mt-8 flex flex-wrap justify-center gap-3">
              <Link
                href="/register"
                className="inline-flex items-center gap-2 rounded-pill bg-mint-400 px-7 py-3.5 font-semibold text-deep-800 shadow-raise transition duration-300 hover:-translate-y-0.5 hover:bg-mint-500"
              >
                Create your free shop <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href="#features"
                className="inline-flex items-center gap-2 rounded-pill border-[1.5px] border-white/25 px-7 py-3.5 font-semibold text-white transition duration-300 hover:bg-white/10"
              >
                See how it works
              </a>
            </div>
            <p className="relative mt-4 text-sm text-white/70">Free plan · No credit card</p>
          </div>
        </div>
      </section>

      {/* ---------------- Footer ---------------- */}
      <footer className="border-t border-line-200 bg-soft-50 py-16">
        <div className="mx-auto max-w-6xl px-5">
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
            <div>
              <Link href="/" className="flex items-center gap-2.5 text-xl font-extrabold text-deep-700">
                <span className="flex h-9 w-9 items-center justify-center rounded-[5px] bg-deep-800 text-mint-400">
                  <Store className="h-4 w-4" />
                </span>
                SURA <span className="text-brand-700">SHOP</span>
              </Link>
              <p className="mt-4 max-w-[34ch] text-sm">
                Digital storefronts and WhatsApp commerce for Indian small businesses. By SURA CORP.
              </p>
            </div>
            {[
              ["Product", [["Features", "#features"], ["Themes", "#themes"], ["Pricing", "#pricing"], ["Demo shop", "/urban-threads"]]],
              ["Company", [["About", "/features"], ["Contact", "/contact"], ["Log in", "/login"]]],
              ["Legal", [["Terms", "/terms"], ["Privacy", "/privacy"], ["Refunds", "/refund-policy"]]],
            ].map(([heading, links]) => (
              <div key={heading as string}>
                <h4 className="mb-4 text-sm font-semibold uppercase tracking-[0.08em] text-deep-700">
                  {heading as string}
                </h4>
                <ul className="grid gap-2.5 text-sm">
                  {(links as string[][]).map(([label, href]) => (
                    <li key={label}>
                      <Link href={href!} className="transition hover:text-deep-800">{label}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-line-200 pt-6 text-sm">
            <span>© {new Date().getFullYear()} SURA CORP · SURA SHOP</span>
            <span className="inline-flex items-center gap-1.5">
              <Check className="h-3.5 w-3.5 text-deep-800" /> Made in India
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
