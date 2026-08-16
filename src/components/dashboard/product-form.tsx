"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ImagePlus, Sparkles, Trash2, X, ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Textarea, Select } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { VariantEditor } from "@/components/dashboard/variant-editor";

export interface ProductFormValues {
  id?: string;
  name: string;
  price: string;
  discountPrice: string;
  categoryId: string;
  description: string;
  sku: string;
  stock: string;
  brand: string;
  weight: string;
  productCode: string;
  isPublished: boolean;
  inStock: boolean;
  isFeatured: boolean;
  tags: string[];
  variants: { name: string; options: string[] }[];
  images: string[];
}

export const emptyProduct: ProductFormValues = {
  name: "",
  price: "",
  discountPrice: "",
  categoryId: "",
  description: "",
  sku: "",
  stock: "",
  brand: "",
  weight: "",
  productCode: "",
  isPublished: true,
  inStock: true,
  isFeatured: false,
  tags: [],
  variants: [],
  images: [],
};

export function ProductForm({
  initial,
  categories,
}: {
  initial: ProductFormValues;
  categories: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [v, setV] = useState<ProductFormValues>(initial);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [tagInput, setTagInput] = useState("");
  const [deleting, setDeleting] = useState(false);

  function set<K extends keyof ProductFormValues>(key: K, value: ProductFormValues[K]) {
    setV((prev) => ({ ...prev, [key]: value }));
  }

  async function uploadFiles(files: FileList | null) {
    if (!files?.length) return;
    setUploading(true);
    setError("");
    try {
      for (const file of Array.from(files).slice(0, 8 - v.images.length)) {
        const fd = new FormData();
        fd.append("file", file);
        const res = await fetch("/api/uploads", { method: "POST", body: fd });
        const json = await res.json();
        if (!json.ok) {
          setError(json.error ?? "Upload failed");
          break;
        }
        setV((prev) => ({ ...prev, images: [...prev.images, json.data.url] }));
      }
    } catch {
      setError("Upload failed. Check your connection.");
    } finally {
      setUploading(false);
    }
  }

  async function generateCopy() {
    setAiLoading(true);
    try {
      const res = await fetch("/api/ai/product-copy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: v.name }),
      });
      const json = await res.json();
      if (json.ok) {
        setV((prev) => ({
          ...prev,
          description: prev.description || json.data.copy.description,
          tags: prev.tags.length ? prev.tags : json.data.copy.tags,
        }));
      }
    } finally {
      setAiLoading(false);
    }
  }

  async function save() {
    setSaving(true);
    setError("");
    try {
      const payload = {
        name: v.name,
        price: v.price,
        discountPrice: v.discountPrice || null,
        categoryId: v.categoryId || null,
        description: v.description,
        sku: v.sku,
        stock: v.stock === "" ? null : v.stock,
        brand: v.brand,
        weight: v.weight,
        productCode: v.productCode,
        isPublished: v.isPublished,
        inStock: v.inStock,
        isFeatured: v.isFeatured,
        tags: v.tags,
        variants: v.variants.filter((x) => x.name && x.options.length),
        images: v.images,
      };
      const res = await fetch(v.id ? `/api/products/${v.id}` : "/api/products", {
        method: v.id ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!json.ok) {
        setError(json.error ?? "Could not save product");
        return;
      }
      router.push("/dashboard/products");
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (!v.id || !confirm("Delete this product? You can contact support to recover it.")) return;
    setDeleting(true);
    const res = await fetch(`/api/products/${v.id}`, { method: "DELETE" });
    const json = await res.json();
    setDeleting(false);
    if (json.ok) {
      router.push("/dashboard/products");
      router.refresh();
    } else {
      setError(json.error ?? "Could not delete");
    }
  }

  function addTag() {
    const t = tagInput.trim().toLowerCase();
    if (t && !v.tags.includes(t) && v.tags.length < 20) set("tags", [...v.tags, t]);
    setTagInput("");
  }

  return (
    <div className="mx-auto max-w-2xl space-y-5 pb-10">
      {/* Images */}
      <Card>
        <CardHeader>
          <CardTitle>Photos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-2 sm:grid-cols-5">
            {v.images.map((url, i) => (
              <div key={url} className="group relative aspect-square overflow-hidden rounded-xl bg-ink-100">
                <Image src={url} alt="" fill className="object-cover" sizes="120px" />
                {i === 0 && (
                  <span className="absolute left-1 top-1 rounded bg-brand-700 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                    Main
                  </span>
                )}
                <div className="absolute right-1 top-1 flex gap-1">
                  {i > 0 && (
                    <button
                      type="button"
                      onClick={() =>
                        set("images", [v.images[i]!, ...v.images.filter((_, idx) => idx !== i)])
                      }
                      className="rounded bg-white/90 p-1 shadow hover:bg-white"
                      aria-label="Make main image"
                    >
                      <ArrowUp className="h-3.5 w-3.5" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => set("images", v.images.filter((_, idx) => idx !== i))}
                    className="rounded bg-white/90 p-1 shadow hover:bg-white"
                    aria-label="Remove image"
                  >
                    <X className="h-3.5 w-3.5 text-red-600" />
                  </button>
                </div>
              </div>
            ))}
            {v.images.length < 8 && (
              <label className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-ink-300 text-ink-500 hover:border-brand-600 hover:text-brand-700">
                <ImagePlus className="h-6 w-6" />
                <span className="text-[11px] font-medium">{uploading ? "Uploading…" : "Add"}</span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  className="sr-only"
                  onChange={(e) => uploadFiles(e.target.files)}
                  disabled={uploading}
                />
              </label>
            )}
          </div>
          <p className="mt-2 text-xs text-ink-500">JPG, PNG or WebP up to 5 MB. First photo is the main photo.</p>
        </CardContent>
      </Card>

      {/* Basics */}
      <Card>
        <CardHeader>
          <CardTitle>Basic details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input label="Product name *" value={v.name} onChange={(e) => set("name", e.target.value)} maxLength={120} placeholder="e.g. Premium Cotton Shirt" />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Price (₹) *" inputMode="decimal" value={v.price} onChange={(e) => set("price", e.target.value.replace(/[^\d.]/g, ""))} placeholder="899" />
            <Input label="Discount price (₹)" inputMode="decimal" value={v.discountPrice} onChange={(e) => set("discountPrice", e.target.value.replace(/[^\d.]/g, ""))} placeholder="Optional" />
          </div>
          <Select label="Category" value={v.categoryId} onChange={(e) => set("categoryId", e.target.value)}>
            <option value="">No category</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </Select>
          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label className="text-sm font-medium text-ink-700">Description</label>
              <button
                type="button"
                onClick={generateCopy}
                disabled={aiLoading || !v.name}
                className="inline-flex items-center gap-1 text-xs font-semibold text-brand-700 hover:underline disabled:opacity-50"
              >
                <Sparkles className="h-3.5 w-3.5" /> {aiLoading ? "Writing…" : "Write with AI"}
              </button>
            </div>
            <Textarea value={v.description} onChange={(e) => set("description", e.target.value)} maxLength={5000} placeholder="Tell customers about this product…" />
          </div>
        </CardContent>
      </Card>

      {/* Variants */}
      <Card>
        <CardHeader>
          <CardTitle>Options (size, colour…)</CardTitle>
        </CardHeader>
        <CardContent>
          <VariantEditor variants={v.variants} onChange={(next) => set("variants", next)} />
        </CardContent>
      </Card>

      {/* Extra details */}
      <Card>
        <CardHeader>
          <CardTitle>More details (optional)</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-3">
          <Input label="SKU" value={v.sku} onChange={(e) => set("sku", e.target.value)} />
          <Input label="Stock" inputMode="numeric" value={v.stock} onChange={(e) => set("stock", e.target.value.replace(/\D/g, ""))} />
          <Input label="Brand" value={v.brand} onChange={(e) => set("brand", e.target.value)} />
          <Input label="Weight" value={v.weight} onChange={(e) => set("weight", e.target.value)} placeholder="e.g. 500g" />
          <Input label="Product code" value={v.productCode} onChange={(e) => set("productCode", e.target.value)} />
          <div className="col-span-2">
            <label className="mb-1.5 block text-sm font-medium text-ink-700">Tags</label>
            <div className="flex flex-wrap items-center gap-1.5 rounded-xl border border-ink-300 bg-white p-2">
              {v.tags.map((t) => (
                <span key={t} className="inline-flex items-center gap-1 rounded-full bg-ink-100 px-2.5 py-1 text-xs font-medium">
                  {t}
                  <button type="button" onClick={() => set("tags", v.tags.filter((x) => x !== t))} aria-label={`Remove tag ${t}`}>
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
              <input
                className="h-7 min-w-24 flex-1 px-1 text-sm focus:outline-none"
                placeholder="Type and press Enter"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === ",") {
                    e.preventDefault();
                    addTag();
                  }
                }}
                onBlur={addTag}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Status */}
      <Card>
        <CardContent className="flex flex-wrap gap-5 pt-5">
          {(
            [
              ["isPublished", "Published (visible in shop)"],
              ["inStock", "In stock"],
              ["isFeatured", "Featured on homepage"],
            ] as const
          ).map(([key, label]) => (
            <label key={key} className="flex items-center gap-2 text-sm font-medium">
              <input
                type="checkbox"
                checked={v[key]}
                onChange={(e) => set(key, e.target.checked)}
                className="h-4 w-4 rounded border-ink-300 accent-[#0f766e]"
              />
              {label}
            </label>
          ))}
        </CardContent>
      </Card>

      {error && <p className="text-sm font-medium text-red-600">{error}</p>}

      <div className="flex gap-3">
        <Button onClick={save} loading={saving} disabled={!v.name || !v.price} className="flex-1" size="lg">
          {v.id ? "Save Changes" : "Add Product"}
        </Button>
        {v.id && (
          <Button variant="danger" onClick={remove} loading={deleting} size="lg">
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
