"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ImagePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { STOREFRONT_TEMPLATES } from "@/lib/constants";
import { cn } from "@/lib/utils";

const COLORS = ["#0f766e", "#b91c1c", "#1d4ed8", "#7e22ce", "#c2410c", "#0f172a", "#be185d", "#15803d"];

interface CustomizeValues {
  template: string;
  primaryColor: string;
  buttonStyle: string;
  font: string;
  cardStyle: string;
  description: string;
  logoUrl: string;
  coverUrl: string;
}

export function CustomizeForm({ initial, slug }: { initial: CustomizeValues; slug: string }) {
  const router = useRouter();
  const [v, setV] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [uploading, setUploading] = useState<"logo" | "cover" | null>(null);

  function set<K extends keyof CustomizeValues>(key: K, value: CustomizeValues[K]) {
    setV((p) => ({ ...p, [key]: value }));
    setSaved(false);
  }

  async function upload(kind: "logo" | "cover", files: FileList | null) {
    const file = files?.[0];
    if (!file) return;
    setUploading(kind);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/uploads", { method: "POST", body: fd });
      const json = await res.json();
      if (json.ok) set(kind === "logo" ? "logoUrl" : "coverUrl", json.data.url);
      else setError(json.error ?? "Upload failed");
    } finally {
      setUploading(null);
    }
  }

  async function save() {
    setSaving(true);
    setError("");
    try {
      const [themeRes, shopRes] = await Promise.all([
        fetch("/api/shops/theme", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            template: v.template,
            primaryColor: v.primaryColor,
            buttonStyle: v.buttonStyle,
            font: v.font,
            cardStyle: v.cardStyle,
          }),
        }),
        fetch("/api/shops", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ description: v.description, logoUrl: v.logoUrl, coverUrl: v.coverUrl }),
        }),
      ]);
      const [themeJson, shopJson] = await Promise.all([themeRes.json(), shopRes.json()]);
      if (!themeJson.ok || !shopJson.ok) {
        setError(themeJson.error ?? shopJson.error ?? "Could not save");
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
        <CardHeader><CardTitle>Branding</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="relative h-16 w-16 overflow-hidden rounded-xl bg-ink-100">
              {v.logoUrl && <Image src={v.logoUrl} alt="Logo" fill className="object-cover" sizes="64px" />}
            </div>
            <label className="cursor-pointer text-sm font-semibold text-brand-700 hover:underline">
              {uploading === "logo" ? "Uploading…" : v.logoUrl ? "Change logo" : "Upload logo"}
              <input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={(e) => upload("logo", e.target.files)} />
            </label>
          </div>
          <div>
            <div className="relative flex h-28 w-full items-center justify-center overflow-hidden rounded-xl bg-ink-100">
              {v.coverUrl ? (
                <Image src={v.coverUrl} alt="Cover" fill className="object-cover" sizes="600px" />
              ) : (
                <ImagePlus className="h-6 w-6 text-ink-300" />
              )}
            </div>
            <label className="mt-2 inline-block cursor-pointer text-sm font-semibold text-brand-700 hover:underline">
              {uploading === "cover" ? "Uploading…" : v.coverUrl ? "Change cover image" : "Upload cover image"}
              <input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={(e) => upload("cover", e.target.files)} />
            </label>
          </div>
          <Textarea
            label="Shop description"
            value={v.description}
            onChange={(e) => set("description", e.target.value)}
            maxLength={1000}
            placeholder="Tell customers what makes your shop special…"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Template</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {STOREFRONT_TEMPLATES.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => set("template", t.id)}
              className={cn(
                "rounded-xl border px-3 py-3 text-left text-sm transition",
                v.template === t.id ? "border-brand-600 bg-brand-50" : "border-ink-300 bg-white hover:bg-ink-50",
              )}
            >
              <span className="block font-semibold">{t.name}</span>
              <span className="mt-0.5 block text-xs text-ink-500">{t.description}</span>
            </button>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Brand colour</CardTitle></CardHeader>
        <CardContent className="flex flex-wrap items-center gap-2">
          {COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => set("primaryColor", c)}
              className={cn("h-9 w-9 rounded-full border-2", v.primaryColor === c ? "border-ink-900 ring-2 ring-ink-900/20" : "border-white")}
              style={{ backgroundColor: c }}
              aria-label={`Colour ${c}`}
            />
          ))}
          <input
            type="color"
            value={v.primaryColor}
            onChange={(e) => set("primaryColor", e.target.value)}
            className="h-9 w-9 cursor-pointer rounded-full border border-ink-300"
            aria-label="Custom colour"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Style</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {(
            [
              ["buttonStyle", "Buttons", ["rounded", "pill", "square"]],
              ["font", "Font", ["inter", "poppins", "dm-sans"]],
              ["cardStyle", "Product cards", ["shadow", "border", "flat"]],
            ] as const
          ).map(([key, label, options]) => (
            <div key={key}>
              <p className="mb-1.5 text-sm font-medium text-ink-700">{label}</p>
              <div className="flex gap-2">
                {options.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => set(key, opt)}
                    className={cn(
                      "rounded-xl border px-4 py-2 text-sm font-medium capitalize transition",
                      v[key] === opt ? "border-brand-700 bg-brand-700 text-white" : "border-ink-300 bg-white text-ink-700",
                    )}
                  >
                    {opt.replace("-", " ")}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {saved && <p className="text-sm font-medium text-emerald-700">Saved! Your storefront is updated.</p>}

      <div className="flex gap-3">
        <Button onClick={save} loading={saving} className="flex-1" size="lg">Save Changes</Button>
        <a href={`/${slug}`} target="_blank" rel="noopener noreferrer">
          <Button variant="outline" size="lg">Preview</Button>
        </a>
      </div>
    </div>
  );
}
