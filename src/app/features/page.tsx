import type { Metadata } from "next";
import {
  MessageCircle,
  QrCode,
  Smartphone,
  Search,
  FolderOpen,
  BarChart3,
  Sparkles,
  LinkIcon,
  LayoutGrid,
  ShieldCheck,
  Users,
  Globe,
} from "lucide-react";
import { SiteHeader } from "@/components/marketing/site-header";
import { MarketingSections } from "@/components/marketing/marketing-sections";

export const metadata: Metadata = {
  title: "Features",
  description:
    "Everything SURA SHOP gives your business: a digital storefront, WhatsApp ordering, AI photo clean-up, 16 themes, QR codes and analytics.",
};
export const dynamic = "force-dynamic";

const GROUPS: { heading: string; items: { icon: typeof LinkIcon; title: string; text: string }[] }[] = [
  {
    heading: "Your storefront",
    items: [
      { icon: LinkIcon, title: "One link for everything", text: "sura.shop/your-shop — easy to say on the phone, easy to print, easy to share." },
      { icon: LayoutGrid, title: "16 distinct themes", text: "A look for every trade, so no two shops on SURA feel like the same template." },
      { icon: FolderOpen, title: "Your own categories", text: "Organise products the way your shop is actually organised, not the way software wants." },
      { icon: Search, title: "Fast product search", text: "Customers find what they need in seconds, even across hundreds of products." },
    ],
  },
  {
    heading: "Getting customers",
    items: [
      { icon: MessageCircle, title: "Enquiries on WhatsApp", text: "One tap opens a chat with the product name, price and photo already filled in." },
      { icon: QrCode, title: "QR for your counter", text: "Print it for the counter, your packaging, your visiting card or your shop shutter." },
      { icon: Smartphone, title: "Built mobile-first", text: "You manage the shop from your phone; your buyers arrive from WhatsApp on theirs." },
      { icon: Globe, title: "Found on Google", text: "Every shop and product page is search-engine ready with proper structured data." },
    ],
  },
  {
    heading: "Growing",
    items: [
      { icon: Sparkles, title: "AI photo clean-up", text: "Turn a phone snap into a clean studio photo. The product is never redrawn and the original is always kept." },
      { icon: BarChart3, title: "Plain-language analytics", text: "Views, visitors and enquiries — told to you in sentences, not charts you have to decode." },
      { icon: Users, title: "Staff accounts", text: "Let someone else add products without handing over your login. On the Pro plan." },
      { icon: ShieldCheck, title: "Your data stays yours", text: "No commission, no marketplace, no reselling your customer list. Ever." },
    ],
  },
];

export default function FeaturesPage() {
  return (
    <div className="bg-white text-moss-600">
      <SiteHeader />

      <section className="bg-[radial-gradient(900px_400px_at_70%_0%,#f4fbf3,transparent_65%)] py-20 text-center">
        <div className="mx-auto max-w-3xl px-5">
          <span className="inline-flex items-center gap-1.5 rounded-pill bg-soft-100 px-4 py-1.5 text-sm font-semibold text-deep-800">
            Features
          </span>
          <h1 className="mt-6 text-[clamp(34px,6vw,64px)] font-extrabold leading-[1.06] tracking-[-0.02em] text-deep-700">
            Everything your shop needs online
          </h1>
          <p className="mx-auto mt-4 max-w-[52ch] text-lg">
            No hosting, no domain, no developer. Set it up from your phone in an afternoon.
          </p>
        </div>
      </section>

      <section id="features" className="scroll-mt-20 pb-24">
        <div className="mx-auto max-w-6xl space-y-20 px-5">
          {GROUPS.map((group) => (
            <div key={group.heading}>
              <h2 className="mb-8 text-[clamp(24px,3.2vw,40px)] font-extrabold tracking-[-0.02em] text-deep-700">
                {group.heading}
              </h2>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {group.items.map((f) => (
                  <div
                    key={f.title}
                    className="rounded-card border border-line-200 bg-white p-8 transition duration-300 hover:-translate-y-1.5 hover:shadow-lift"
                  >
                    <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-soft-100 text-deep-800">
                      <f.icon className="h-6 w-6" />
                    </span>
                    <h3 className="text-lg font-bold leading-snug text-deep-700">{f.title}</h3>
                    <p className="mt-3 text-sm">{f.text}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <MarketingSections />
    </div>
  );
}
