import type { Metadata } from "next";
import { requireShop } from "@/lib/auth/session";
import { SettingsForm } from "@/components/dashboard/settings-form";

export const metadata: Metadata = { title: "Shop settings" };
export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const { shop } = await requireShop();
  return (
    <div className="mx-auto max-w-xl space-y-4">
      <h1 className="text-xl font-bold">Shop settings</h1>
      <SettingsForm
        initial={{
          name: shop.name,
          category: shop.category,
          status: shop.status === "SUSPENDED" ? "PAUSED" : shop.status,
          whatsapp: shop.whatsapp.replace(/^91/, ""),
          phone: shop.phone ?? "",
          email: shop.email ?? "",
          address: shop.address ?? "",
          city: shop.city ?? "",
          state: shop.state ?? "",
          pincode: shop.pincode ?? "",
          mapsLink: shop.mapsLink ?? "",
          openingHours: shop.openingHours ?? "",
          website: shop.website ?? "",
          instagram: shop.instagram ?? "",
          facebook: shop.facebook ?? "",
        }}
        slug={shop.slug}
      />
    </div>
  );
}
