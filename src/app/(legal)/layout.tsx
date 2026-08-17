import { SiteHeader } from "@/components/marketing/site-header";
import { MarketingSections } from "@/components/marketing/marketing-sections";

/**
 * Legal and contact pages. They carry the same shop carousel and pricing block
 * as the rest of the public site — someone who lands on Terms from a search
 * result should still be one scroll away from seeing what we sell.
 */
export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-white text-moss-600">
      <SiteHeader />
      <main
        className="mx-auto max-w-3xl px-5 py-16 leading-relaxed
          [&_h1]:text-[clamp(28px,4.4vw,48px)] [&_h1]:font-extrabold [&_h1]:tracking-[-0.02em] [&_h1]:text-deep-700
          [&_h2]:mt-8 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-deep-700
          [&_a]:font-medium [&_a]:text-deep-800 [&_a]:underline
          [&_li]:mt-1.5 [&_p]:mt-3 [&_ul]:mt-3 [&_ul]:list-disc [&_ul]:pl-5"
      >
        {children}
      </main>
      <MarketingSections />
    </div>
  );
}
