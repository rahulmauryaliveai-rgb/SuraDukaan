"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input, Select, Textarea } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BUSINESS_CATEGORIES } from "@/lib/constants";

interface SettingsValues {
  name: string;
  category: string;
  status: "LIVE" | "PAUSED" | "MAINTENANCE";
  whatsapp: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  mapsLink: string;
  openingHours: string;
  website: string;
  instagram: string;
  facebook: string;
}

export function SettingsForm({ initial, slug }: { initial: SettingsValues; slug: string }) {
  const router = useRouter();
  const [v, setV] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  function set<K extends keyof SettingsValues>(key: K, value: SettingsValues[K]) {
    setV((p) => ({ ...p, [key]: value }));
    setSaved(false);
  }

  async function save() {
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/shops", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(v),
      });
      const json = await res.json();
      if (!json.ok) {
        setError(json.error ?? "Could not save settings");
        return;
      }
      setSaved(true);
      router.refresh();
    } catch {
      setError("Network error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-5 pb-10">
      <Card>
        <CardHeader><CardTitle>Shop status</CardTitle></CardHeader>
        <CardContent>
          <Select value={v.status} onChange={(e) => set("status", e.target.value as SettingsValues["status"])}>
            <option value="LIVE">Live — customers can browse and order</option>
            <option value="PAUSED">Paused — “temporarily unavailable” shown</option>
            <option value="MAINTENANCE">Maintenance — hidden while you make changes</option>
          </Select>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Basic information</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <Input label="Shop name" value={v.name} onChange={(e) => set("name", e.target.value)} maxLength={80} />
          <Select label="Business category" value={v.category} onChange={(e) => set("category", e.target.value)}>
            {BUSINESS_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </Select>
          <p className="text-xs text-ink-500">
            Shop link: <span className="font-mono text-brand-700">sura.shop/{slug}</span> (contact support to change)
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Contact</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input label="WhatsApp number" inputMode="numeric" value={v.whatsapp} onChange={(e) => set("whatsapp", e.target.value.replace(/\D/g, "").slice(0, 10))} hint="Orders arrive here" />
          <Input label="Phone (optional)" value={v.phone} onChange={(e) => set("phone", e.target.value)} />
          <Input label="Email" type="email" value={v.email} onChange={(e) => set("email", e.target.value)} />
          <Input label="Website" value={v.website} onChange={(e) => set("website", e.target.value)} placeholder="https://…" />
          <Input label="Instagram" value={v.instagram} onChange={(e) => set("instagram", e.target.value)} placeholder="@yourshop" />
          <Input label="Facebook" value={v.facebook} onChange={(e) => set("facebook", e.target.value)} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Location & hours</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <Textarea label="Address" value={v.address} onChange={(e) => set("address", e.target.value)} maxLength={300} />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <Input label="City" value={v.city} onChange={(e) => set("city", e.target.value)} />
            <Input label="State" value={v.state} onChange={(e) => set("state", e.target.value)} />
            <Input label="Pincode" inputMode="numeric" value={v.pincode} onChange={(e) => set("pincode", e.target.value.replace(/\D/g, "").slice(0, 6))} />
          </div>
          <Input label="Google Maps link" value={v.mapsLink} onChange={(e) => set("mapsLink", e.target.value)} placeholder="https://maps.app.goo.gl/…" />
          <Input label="Opening hours" value={v.openingHours} onChange={(e) => set("openingHours", e.target.value)} placeholder="e.g. Mon–Sat 10am–9pm" />
        </CardContent>
      </Card>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {saved && <p className="text-sm font-medium text-emerald-700">Settings saved.</p>}

      <Button onClick={save} loading={saving} className="w-full" size="lg">Save Settings</Button>
    </div>
  );
}
