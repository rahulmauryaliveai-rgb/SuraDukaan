import type { Metadata } from "next";

// Rendered per request: the shared marketing sections below this page read
// plans and showcase shops from the database, which is not available when
// the site is prerendered at build time.
export const dynamic = "force-dynamic";


export const metadata: Metadata = { title: "Privacy Policy" };

export default function PrivacyPage() {
  return (
    <article>
      <h1>Privacy Policy</h1>
      <p className="rounded-xl bg-amber-50 p-3 text-amber-800">
        Placeholder copy — have this reviewed by a lawyer before launch.
      </p>
      <h2>What we collect</h2>
      <p>
        Shop owners: mobile number, optional name and email, shop and product information you add.
        Customers browsing storefronts: we do not require accounts and do not collect personal
        information. Anonymous, aggregated usage statistics (page views, WhatsApp clicks) are
        recorded to show shop owners how their shop performs.
      </p>
      <h2>How we use data</h2>
      <p>
        To operate your digital shop, show you analytics, send service notifications, and improve
        the product. We do not sell personal data.
      </p>
      <h2>WhatsApp</h2>
      <p>
        Ordering happens on WhatsApp. Conversations occur directly between customer and shop owner
        on WhatsApp and are not visible to SURA SHOP.
      </p>
      <h2>Data retention & deletion</h2>
      <p>
        You may request deletion of your account and shop data by contacting support@sura.shop.
      </p>
      <h2>Contact</h2>
      <p>SURA CORP · support@sura.shop</p>
    </article>
  );
}
