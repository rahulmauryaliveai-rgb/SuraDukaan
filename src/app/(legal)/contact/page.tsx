import type { Metadata } from "next";

// Rendered per request: the shared marketing sections below this page read
// plans and showcase shops from the database, which is not available when
// the site is prerendered at build time.
export const dynamic = "force-dynamic";


export const metadata: Metadata = { title: "Contact" };

export default function ContactPage() {
  return (
    <article>
      <h1>Contact us</h1>
      <p>
        We&apos;re happy to help you get your shop online.
      </p>
      <h2>Support</h2>
      <p>
        Email: <a href="mailto:support@sura.shop" className="font-semibold text-brand-700">support@sura.shop</a>
      </p>
      <h2>Company</h2>
      <p>SURA CORP — SURA SHOP is a product of SURA CORP.</p>
    </article>
  );
}
