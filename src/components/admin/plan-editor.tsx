"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export interface EditablePlan {
  id?: string;
  code: string;
  name: string;
  priceInr: number;
  productLimit: number; // -1 = unlimited
  hasAnalytics: boolean;
  hasAdvancedThemes: boolean;
  hasAi: boolean;
  hasCustomDomain: boolean;
  hasStaffAccounts: boolean;
  removeBranding: boolean;
  isActive: boolean;
  sortOrder: number;
  activeSubscriptions?: number;
}

const FEATURES: Array<[keyof EditablePlan, string]> = [
  ["hasAnalytics", "Analytics"],
  ["hasAdvancedThemes", "Advanced themes"],
  ["hasAi", "AI tools"],
  ["hasCustomDomain", "Custom domain"],
  ["hasStaffAccounts", "Staff accounts"],
  ["removeBranding", "Remove branding"],
];

function PlanCard({ initial, isNew, onSaved }: { initial: EditablePlan; isNew?: boolean; onSaved?: () => void }) {
  const router = useRouter();
  const [p, setP] = useState<EditablePlan>(initial);
  const [unlimited, setUnlimited] = useState(initial.productLimit < 0);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  function set<K extends keyof EditablePlan>(key: K, value: EditablePlan[K]) {
    setP((prev) => ({ ...prev, [key]: value }));
    setMessage(null);
  }

  async function save() {
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...(p.id ? { id: p.id } : {}),
          code: p.code.trim().toLowerCase(),
          name: p.name.trim(),
          priceInr: p.priceInr,
          productLimit: unlimited ? -1 : Math.max(0, p.productLimit),
          hasAnalytics: p.hasAnalytics,
          hasAdvancedThemes: p.hasAdvancedThemes,
          hasAi: p.hasAi,
          hasCustomDomain: p.hasCustomDomain,
          hasStaffAccounts: p.hasStaffAccounts,
          removeBranding: p.removeBranding,
          isActive: p.isActive,
          sortOrder: p.sortOrder,
        }),
      });
      const json = await res.json();
      if (!json.ok) {
        setMessage({ ok: false, text: json.error ?? "Could not save plan" });
        return;
      }
      setMessage({ ok: true, text: "Saved. Pricing page and limits update immediately." });
      onSaved?.();
      router.refresh();
    } catch {
      setMessage({ ok: false, text: "Network error" });
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card className={p.isActive ? "" : "opacity-70"}>
      <CardContent className="space-y-4 p-5">
        <div className="flex items-center justify-between gap-2">
          <input
            className="w-full rounded-lg border border-transparent px-1 py-0.5 text-lg font-bold hover:border-ink-300 focus:border-brand-600 focus:outline-none"
            value={p.name}
            onChange={(e) => set("name", e.target.value)}
            aria-label="Plan name"
          />
          <Badge tone={p.isActive ? "success" : "default"}>{p.isActive ? "Active" : "Disabled"}</Badge>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Price (₹/year)"
            inputMode="numeric"
            value={String(p.priceInr)}
            onChange={(e) => set("priceInr", Number(e.target.value.replace(/\D/g, "") || 0))}
          />
          <div>
            <Input
              label="Product limit"
              inputMode="numeric"
              value={unlimited ? "" : String(p.productLimit)}
              placeholder={unlimited ? "Unlimited" : "e.g. 20"}
              disabled={unlimited}
              onChange={(e) => set("productLimit", Number(e.target.value.replace(/\D/g, "") || 0))}
            />
            <label className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-ink-700">
              <input
                type="checkbox"
                checked={unlimited}
                onChange={(e) => setUnlimited(e.target.checked)}
                className="h-3.5 w-3.5 accent-[#0f766e]"
              />
              Unlimited
            </label>
          </div>
        </div>

        {isNew && (
          <Input
            label="Plan code (unique, lowercase)"
            value={p.code}
            onChange={(e) => set("code", e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
            placeholder="e.g. enterprise"
          />
        )}

        <fieldset>
          <legend className="mb-1.5 text-sm font-medium text-ink-700">Features</legend>
          <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
            {FEATURES.map(([key, label]) => (
              <label key={key} className="flex items-center gap-1.5 text-sm">
                <input
                  type="checkbox"
                  checked={Boolean(p[key])}
                  onChange={(e) => set(key, e.target.checked as EditablePlan[typeof key])}
                  className="h-4 w-4 accent-[#0f766e]"
                />
                {label}
              </label>
            ))}
          </div>
        </fieldset>

        <div className="flex items-center justify-between border-t border-ink-100 pt-3">
          <label className="flex items-center gap-1.5 text-sm font-medium">
            <input
              type="checkbox"
              checked={p.isActive}
              onChange={(e) => set("isActive", e.target.checked)}
              className="h-4 w-4 accent-[#0f766e]"
            />
            Plan is active
          </label>
          {p.activeSubscriptions !== undefined && (
            <span className="text-xs text-ink-500">{p.activeSubscriptions} active subs</span>
          )}
        </div>

        {message && (
          <p className={`text-sm ${message.ok ? "text-emerald-700" : "text-red-600"}`}>{message.text}</p>
        )}

        <Button onClick={save} loading={saving} className="w-full" disabled={!p.name.trim() || !p.code.trim()}>
          {isNew ? "Create Plan" : "Save Changes"}
        </Button>
      </CardContent>
    </Card>
  );
}

export function PlanEditorGrid({ plans }: { plans: EditablePlan[] }) {
  const [showNew, setShowNew] = useState(false);

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {plans.map((plan) => (
        <PlanCard key={plan.id} initial={plan} />
      ))}
      {showNew ? (
        <PlanCard
          isNew
          initial={{
            code: "",
            name: "New Plan",
            priceInr: 999,
            productLimit: 50,
            hasAnalytics: true,
            hasAdvancedThemes: false,
            hasAi: false,
            hasCustomDomain: false,
            hasStaffAccounts: false,
            removeBranding: false,
            isActive: true,
            sortOrder: plans.length,
          }}
          onSaved={() => setShowNew(false)}
        />
      ) : (
        <button
          onClick={() => setShowNew(true)}
          className="flex min-h-48 flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-ink-300 text-ink-500 transition hover:border-brand-600 hover:text-brand-700"
        >
          <Plus className="h-6 w-6" />
          <span className="text-sm font-semibold">Add New Plan</span>
        </button>
      )}
    </div>
  );
}
