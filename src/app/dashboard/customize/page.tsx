import type { Metadata } from "next";
import { requireShop } from "@/lib/auth/session";
import { CustomizeForm } from "@/components/dashboard/customize-form";

export const metadata: Metadata = { title: "Customize storefront" };
export const dynamic = "force-dynamic";

export default async function CustomizePage() {
  const { shop } = await requireShop();
  return (
    <div className="mx-auto max-w-xl space-y-4">
      <h1 className="text-xl font-bold">Customize your storefront</h1>
      <CustomizeForm
        slug={shop.slug}
        initial={{
          template: shop.theme?.template ?? "modern",
          primaryColor: shop.theme?.primaryColor ?? "#0f766e",
          buttonStyle: shop.theme?.buttonStyle ?? "rounded",
          font: shop.theme?.font ?? "inter",
          cardStyle: shop.theme?.cardStyle ?? "shadow",
          description: shop.description ?? "",
          logoUrl: shop.logoUrl ?? "",
          coverUrl: shop.coverUrl ?? "",
        }}
      />
    </div>
  );
}
