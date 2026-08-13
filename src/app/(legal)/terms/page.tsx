import type { Metadata } from "next";

export const metadata: Metadata = { title: "Terms of Service" };

export default function TermsPage() {
  return (
    <article>
      <h1>Terms of Service</h1>
      <p className="rounded-xl bg-amber-50 p-3 text-amber-800">
        Placeholder copy — have this reviewed by a lawyer before launch.
      </p>
      <h2>The service</h2>
      <p>
        SURA SHOP (a SURA CORP product) lets businesses create a digital storefront and receive
        enquiries via WhatsApp. We provide the catalogue and link; the sale itself is a direct
        transaction between shop owner and customer.
      </p>
      <h2>Your responsibilities</h2>
      <p>
        You confirm that products you list are legal to sell in India, that your content does not
        infringe others&apos; rights, and that prices and availability are accurate. Prohibited
        content may be removed and repeat offenders suspended.
      </p>
      <h2>Subscriptions</h2>
      <p>
        Paid plans are billed yearly via Razorpay. Plan limits and features are shown on the
        pricing page and may evolve over time.
      </p>
      <h2>Liability</h2>
      <p>
        SURA SHOP is a catalogue and communication tool. We are not a party to transactions between
        shops and customers and are not liable for product quality, delivery or payment disputes.
      </p>
    </article>
  );
}
