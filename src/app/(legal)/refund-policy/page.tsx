import type { Metadata } from "next";

// Rendered per request: the shared marketing sections below this page read
// plans and showcase shops from the database, which is not available when
// the site is prerendered at build time.
export const dynamic = "force-dynamic";


export const metadata: Metadata = { title: "Refund Policy" };

export default function RefundPolicyPage() {
  return (
    <article>
      <h1>Refund Policy</h1>
      <p className="rounded-xl bg-amber-50 p-3 text-amber-800">
        Placeholder copy — have this reviewed by a lawyer before launch.
      </p>
      <h2>Subscription refunds</h2>
      <p>
        If SURA SHOP does not work as described, contact us within 7 days of payment for a full
        refund. After 7 days, refunds are prorated at our discretion.
      </p>
      <h2>Product purchases</h2>
      <p>
        Purchases from individual shops are transactions between you and the shop owner. Refunds
        and returns for products are governed by each shop&apos;s own policy — contact the shop
        directly on WhatsApp.
      </p>
      <h2>Contact</h2>
      <p>support@sura.shop</p>
    </article>
  );
}
