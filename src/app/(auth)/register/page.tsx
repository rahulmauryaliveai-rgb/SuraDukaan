import type { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { PhoneForm } from "@/components/auth/phone-form";

export const metadata: Metadata = { title: "Create Your Free Shop" };

export default function RegisterPage() {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Create your free shop</h1>
        <p className="mt-1 text-sm text-ink-500">
          Your shop can be online in the next 5 minutes.
        </p>
      </div>
      <Card>
        <CardContent className="pt-5">
          <PhoneForm mode="register" />
        </CardContent>
      </Card>
      <p className="text-center text-sm text-ink-500">
        Already have a shop?{" "}
        <Link href="/login" className="font-semibold text-brand-700 hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
}
