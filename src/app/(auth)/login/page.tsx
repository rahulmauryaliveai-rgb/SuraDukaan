import type { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { PhoneForm } from "@/components/auth/phone-form";

export const metadata: Metadata = { title: "Log in" };

export default function LoginPage() {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Welcome back</h1>
        <p className="mt-1 text-sm text-ink-500">Log in with your mobile number.</p>
      </div>
      <Card>
        <CardContent className="pt-5">
          <PhoneForm mode="login" />
        </CardContent>
      </Card>
      <p className="text-center text-sm text-ink-500">
        New here?{" "}
        <Link href="/register" className="font-semibold text-brand-700 hover:underline">
          Create your free shop
        </Link>
      </p>
      <p className="text-center text-sm text-ink-500">
        <Link href="/forgot-access" className="hover:underline">
          Lost access to your number?
        </Link>
      </p>
    </div>
  );
}
