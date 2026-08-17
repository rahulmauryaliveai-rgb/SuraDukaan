import type { Metadata } from "next";
import { SiteHeader } from "@/components/marketing/site-header";
import { MarketingSections } from "@/components/marketing/marketing-sections";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Simple pricing with no commission. Start free, upgrade when your shop grows. Plans from ₹549/month.",
};
export const dynamic = "force-dynamic";

export default function PricingPage() {
  return (
    <div className="bg-white text-moss-600">
      <SiteHeader />
      <section className="bg-[radial-gradient(900px_400px_at_70%_0%,#f4fbf3,transparent_65%)] py-20 text-center">
        <div className="mx-auto max-w-3xl px-5">
          <span className="inline-flex items-center gap-1.5 rounded-pill bg-soft-100 px-4 py-1.5 text-sm font-semibold text-deep-800">
            Pricing
          </span>
          <h1 className="mt-6 text-[clamp(34px,6vw,64px)] font-extrabold leading-[1.06] tracking-[-0.02em] text-deep-700">
            Pay for the shop, never for the sale
          </h1>
          <p className="mx-auto mt-4 max-w-[52ch] text-lg">
            Every plan includes your shop link, QR code and WhatsApp enquiries. We take 0%
            commission — what your customer pays, you keep.
          </p>
        </div>
      </section>
      <MarketingSections />
    </div>
  );
}
