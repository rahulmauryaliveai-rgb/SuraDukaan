import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getTenantContext } from "@/lib/auth/session";
import { ShopWizard } from "@/components/onboarding/shop-wizard";

export const metadata: Metadata = { title: "Create your shop" };

export default async function OnboardingPage() {
  const ctx = await getTenantContext();
  if (!ctx) redirect("/login");
  if (ctx.shop) redirect("/dashboard");
  return <ShopWizard />;
}
