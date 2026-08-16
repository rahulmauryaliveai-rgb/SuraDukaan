"use client";

import { useState } from "react";
import { Trash2, X, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Variant {
  name: string;
  options: string[];
}

/** One-tap sets for the things Indian shops sell most. */
const PRESETS: { label: string; name: string; options: string[] }[] = [
  { label: "Clothing sizes", name: "Size", options: ["S", "M", "L", "XL", "XXL"] },
  { label: "Shoe sizes", name: "Size", options: ["6", "7", "8", "9", "10", "11"] },
  { label: "Waist sizes", name: "Waist", options: ["28", "30", "32", "34", "36", "38"] },
  { label: "Colours", name: "Colour", options: ["Black", "White", "Red", "Blue", "Green", "Yellow"] },
  { label: "Weights", name: "Weight", options: ["250g", "500g", "1kg", "2kg", "5kg"] },
  { label: "Materials", name: "Material", options: ["Cotton", "Silk", "Linen", "Wool"] },
];

/** Extra choices offered inside an existing option, based on its name. */
const SUGGESTIONS: Record<string, string[]> = {
  size: ["XS", "S", "M", "L", "XL", "XXL", "3XL", "Free Size"],
  waist: ["28", "30", "32", "34", "36", "38", "40", "42"],
  colour: ["Black", "White", "Red", "Blue", "Green", "Yellow", "Pink", "Grey", "Brown", "Navy", "Maroon", "Beige", "Gold", "Silver"],
  color: ["Black", "White", "Red", "Blue", "Green", "Yellow", "Pink", "Grey", "Brown", "Navy", "Maroon", "Beige", "Gold", "Silver"],
  weight: ["100g", "250g", "500g", "1kg", "2kg", "5kg"],
  material: ["Cotton", "Silk", "Linen", "Wool", "Polyester", "Leather", "Jute"],
  flavour: ["Chocolate", "Vanilla", "Strawberry", "Butterscotch", "Mango", "Pista"],
};

const SWATCHES: Record<string, string> = {
  black: "#111827", white: "#ffffff", red: "#dc2626", blue: "#2563eb", green: "#16a34a",
  yellow: "#eab308", pink: "#ec4899", grey: "#9ca3af", gray: "#9ca3af", brown: "#92400e",
  navy: "#1e3a8a", maroon: "#7f1d1d", beige: "#e7d3b1", gold: "#d4af37", silver: "#c0c0c0",
  orange: "#ea580c", purple: "#7e22ce", cream: "#fdf6e3",
};

function suggestionsFor(name: string): string[] {
  return SUGGESTIONS[name.trim().toLowerCase()] ?? [];
}

export function VariantEditor({
  variants,
  onChange,
}: {
  variants: Variant[];
  onChange: (next: Variant[]) => void;
}) {
  const [drafts, setDrafts] = useState<Record<number, string>>({});

  function update(index: number, patch: Partial<Variant>) {
    onChange(variants.map((v, i) => (i === index ? { ...v, ...patch } : v)));
  }

  function addOption(index: number, raw: string) {
    // Accept "S, M, L" pasted in one go as well as single values.
    const incoming = raw
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (incoming.length === 0) return;
    const current = variants[index]?.options ?? [];
    const merged = [...current];
    for (const value of incoming) {
      if (!merged.some((o) => o.toLowerCase() === value.toLowerCase()) && merged.length < 30) {
        merged.push(value);
      }
    }
    update(index, { options: merged });
    setDrafts((d) => ({ ...d, [index]: "" }));
  }

  function removeOption(index: number, option: string) {
    update(index, { options: (variants[index]?.options ?? []).filter((o) => o !== option) });
  }

  function applyPreset(preset: (typeof PRESETS)[number]) {
    const existing = variants.findIndex((v) => v.name.trim().toLowerCase() === preset.name.toLowerCase());
    if (existing >= 0) {
      const merged = [...variants[existing]!.options];
      for (const o of preset.options) {
        if (!merged.some((x) => x.toLowerCase() === o.toLowerCase())) merged.push(o);
      }
      update(existing, { options: merged });
    } else if (variants.length < 5) {
      onChange([...variants, { name: preset.name, options: [...preset.options] }]);
    }
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-ink-500">
        Add choices customers pick before ordering — like size or colour. Their selection is
        included in the WhatsApp message. Skip this if your product has no options.
      </p>

      {/* One-tap presets */}
      <div>
        <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-ink-500">Quick add</p>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((p) => (
            <button
              key={p.label}
              type="button"
              onClick={() => applyPreset(p)}
              className="inline-flex items-center gap-1 rounded-full border border-ink-300 bg-white px-3 py-1.5 text-xs font-medium text-ink-700 transition hover:border-brand-600 hover:bg-brand-50 hover:text-brand-800"
            >
              <Plus className="h-3 w-3" /> {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Each option group */}
      {variants.map((variant, i) => {
        const suggestions = suggestionsFor(variant.name).filter(
          (s) => !variant.options.some((o) => o.toLowerCase() === s.toLowerCase()),
        );
        return (
          <div key={i} className="rounded-xl border border-ink-200 bg-ink-50/40 p-3">
            <div className="flex items-center gap-2">
              <input
                className="h-10 flex-1 rounded-lg border border-ink-300 bg-white px-3 text-sm font-medium focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-600/20"
                placeholder="Option name — e.g. Size, Colour"
                value={variant.name}
                onChange={(e) => update(i, { name: e.target.value })}
                list="variant-name-suggestions"
              />
              <button
                type="button"
                onClick={() => onChange(variants.filter((_, idx) => idx !== i))}
                className="rounded-lg p-2 text-red-600 transition hover:bg-red-50"
                aria-label={`Remove ${variant.name || "option"}`}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>

            {/* Chosen values as chips */}
            <div className="mt-2 flex flex-wrap items-center gap-1.5 rounded-lg border border-ink-300 bg-white p-2">
              {variant.options.map((option) => {
                const swatch = SWATCHES[option.trim().toLowerCase()];
                return (
                  <span
                    key={option}
                    className="inline-flex items-center gap-1.5 rounded-full bg-ink-100 py-1 pl-2.5 pr-1.5 text-xs font-medium"
                  >
                    {swatch && (
                      <span
                        className="h-3 w-3 rounded-full border border-black/15"
                        style={{ background: swatch }}
                      />
                    )}
                    {option}
                    <button
                      type="button"
                      onClick={() => removeOption(i, option)}
                      className="rounded-full p-0.5 hover:bg-ink-300"
                      aria-label={`Remove ${option}`}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                );
              })}
              <input
                className="h-7 min-w-32 flex-1 px-1 text-sm focus:outline-none"
                placeholder={variant.options.length ? "Add another…" : "Type a value, press Enter"}
                value={drafts[i] ?? ""}
                onChange={(e) => setDrafts((d) => ({ ...d, [i]: e.target.value }))}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === ",") {
                    e.preventDefault();
                    addOption(i, drafts[i] ?? "");
                  } else if (e.key === "Backspace" && !(drafts[i] ?? "") && variant.options.length) {
                    removeOption(i, variant.options[variant.options.length - 1]!);
                  }
                }}
                onBlur={() => addOption(i, drafts[i] ?? "")}
              />
            </div>

            {/* Tap-to-add suggestions for this option name */}
            {suggestions.length > 0 && (
              <div className="mt-2 flex flex-wrap items-center gap-1.5">
                <span className="text-xs text-ink-500">Tap to add:</span>
                {suggestions.slice(0, 12).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => addOption(i, s)}
                    className="rounded-full border border-dashed border-ink-300 px-2 py-0.5 text-xs text-ink-700 transition hover:border-brand-600 hover:bg-brand-50"
                  >
                    + {s}
                  </button>
                ))}
              </div>
            )}

            {variant.options.length === 0 && (
              <p className="mt-2 text-xs text-amber-700">
                Add at least one value, or remove this option.
              </p>
            )}
          </div>
        );
      })}

      <datalist id="variant-name-suggestions">
        {["Size", "Colour", "Material", "Weight", "Flavour", "Pack Size"].map((n) => (
          <option key={n} value={n} />
        ))}
      </datalist>

      {variants.length < 5 && (
        <button
          type="button"
          onClick={() => onChange([...variants, { name: "", options: [] }])}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-xl border border-dashed border-ink-300 px-4 py-2.5",
            "text-sm font-semibold text-ink-700 transition hover:border-brand-600 hover:text-brand-700",
          )}
        >
          <Plus className="h-4 w-4" /> Add another option
        </button>
      )}
    </div>
  );
}
