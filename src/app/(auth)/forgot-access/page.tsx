import type { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = { title: "Recover access" };

export default function ForgotAccessPage() {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Lost access to your number?</h1>
      </div>
      <Card>
        <CardContent className="pt-5 space-y-3 text-sm text-ink-700">
          <p>
            Your SURA SHOP account is tied to your mobile number for security. If you have
            changed or lost your number, our support team can verify your identity and move
            your shop to a new number.
          </p>
          <p>
            Email us at{" "}
            <a href="mailto:support@sura.shop" className="font-semibold text-brand-700">
              support@sura.shop
            </a>{" "}
            from the email registered on your account, or contact us on WhatsApp with your
            shop link and business details.
          </p>
        </CardContent>
      </Card>
      <p className="text-center text-sm">
        <Link href="/login" className="font-semibold text-brand-700 hover:underline">
          Back to login
        </Link>
      </p>
    </div>
  );
}
