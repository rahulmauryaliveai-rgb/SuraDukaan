import Link from "next/link";
import { Store, Check } from "lucide-react";
import { db } from "@/lib/db";
import { getShowcaseEntries } from "@/lib/showcase";
import { ShowcaseGallery } from "@/components/marketing/showcase-gallery";
import { PricingTable } from "@/components/marketing/pricing-table";

/**
 * The two conversion blocks that repeat across every public page, plus the
 * shared footer. Tenant storefronts under /[shopSlug] deliberately never use
 * these — those pages render entirely from the shop's own theme.
 */

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-pill bg-soft-100 px-4 py-1.5 text-sm font-semibold text-deep-800">
      {children}
    </span>
  );
}

/** The live shop carousel. Renders nothing if there are no showcase shops. */
export async function ShopsSection() {
  const entries = await getShowcaseEntries();
  return <ShowcaseGallery entries={entries} />;
}

export async function PricingSection() {
  const plans = await db.plan
    .findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } })
    .catch(() => []);
  if (plans.length === 0) return null;

  return (
    <section id="pricing" className="scroll-mt-20 bg-soft-50 py-24">
      <div className="mx-auto max-w-6xl px-5">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <Eyebrow>Pricing</Eyebrow>
          <h2 className="mt-4 text-[clamp(28px,4.4vw,56px)] font-extrabold leading-[1.08] tracking-[-0.02em] text-deep-700">
            Simple pricing, no commission
          </h2>
          <p className="mt-4 text-lg text-moss-600">
            Start free. Upgrade when your shop grows. We never take a cut of your sales.
          </p>
        </div>
        <PricingTable plans={plans} />
      </div>
    </section>
  );
}

export function SiteFooter() {
  const columns: [string, [string, string][]][] = [
    ["Product", [["Features", "/features"], ["Themes", "/#themes"], ["Pricing", "/pricing"], ["Demo shop", "/urban-threads"]]],
    ["Company", [["Contact", "/contact"], ["Log in", "/login"], ["Create a shop", "/register"]]],
    ["Legal", [["Terms", "/terms"], ["Privacy", "/privacy"], ["Refunds", "/refund-policy"]]],
  ];

  return (
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
            <p className="mt-4 max-w-[34ch] text-sm text-moss-600">
              Digital storefronts and WhatsApp commerce for Indian small businesses. By SURA CORP.
            </p>
          </div>
          {columns.map(([heading, links]) => (
            <div key={heading}>
              <h4 className="mb-4 text-sm font-semibold uppercase tracking-[0.08em] text-deep-700">
                {heading}
              </h4>
              <ul className="grid gap-2.5 text-sm text-moss-600">
                {links.map(([label, href]) => (
                  <li key={label}>
                    <Link href={href} className="transition hover:text-deep-800">{label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-line-200 pt-6 text-sm text-moss-600">
          <span>© {new Date().getFullYear()} SURA CORP · SURA SHOP</span>
          <span className="inline-flex items-center gap-1.5">
            <Check className="h-3.5 w-3.5 text-deep-800" /> Made in India
          </span>
        </div>
      </div>
    </footer>
  );
}

/** Shops carousel + pricing + footer, in the order every public page uses. */
export function MarketingSections() {
  return (
    <>
      <ShopsSection />
      <PricingSection />
      <SiteFooter />
    </>
  );
}
