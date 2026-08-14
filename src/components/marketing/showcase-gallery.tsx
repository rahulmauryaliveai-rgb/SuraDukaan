"use client";

import { useState } from "react";
import Image from "next/image";
import { ArrowUpRight, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ShowcaseEntry {
  slug: string;
  name: string;
  category: string;
  themeName: string;
  themeTagline: string;
  city: string | null;
  logoUrl: string | null;
  coverUrl: string | null;
  productCount: number;
  colors: { bg: string; surface: string; ink: string; muted: string; accent: string; accentInk: string; border: string };
  radius: string;
  fontHeading: string;
  upperHeadings: boolean;
  gridAspect: string;
  products: { name: string; price: string; imageUrl: string | null }[];
}

/** A miniature, non-interactive rendering of a storefront in its own theme. */
function PhoneFrame({
  entry,
  screen,
}: {
  entry: ShowcaseEntry;
  screen: "storefront" | "products";
}) {
  const c = entry.colors;
  return (
    <div
      className="relative aspect-[9/17] w-full overflow-hidden rounded-[1.25rem] border-4 border-ink-900 shadow-lg"
      style={{ background: c.bg }}
      aria-hidden
    >
      {screen === "storefront" ? (
        <div className="flex h-full flex-col">
          <div className="relative h-[58%] w-full overflow-hidden">
            {entry.coverUrl && (
              <Image
                src={entry.coverUrl}
                alt=""
                fill
                className="object-cover"
                sizes="180px"
                loading="lazy"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/80" />
            <div className="absolute inset-x-0 bottom-0 px-2 pb-2 text-center">
              <p
                className={cn(
                  "truncate text-[9px] font-bold text-white",
                  entry.upperHeadings && "uppercase tracking-[0.15em]",
                )}
                style={{ fontFamily: `"${entry.fontHeading}", serif` }}
              >
                {entry.name}
              </p>
              <span
                className="mt-1 inline-block px-2 py-[3px] text-[6px] font-bold uppercase tracking-widest"
                style={{ background: c.accent, color: c.accentInk, borderRadius: entry.radius }}
              >
                Step Inside
              </span>
            </div>
          </div>
          <div className="grid flex-1 grid-cols-2 gap-1 p-1.5">
            {entry.products.slice(0, 4).map((p, i) => (
              <div
                key={i}
                className="relative overflow-hidden"
                style={{ background: c.surface, border: `1px solid ${c.border}`, borderRadius: entry.radius }}
              >
                {p.imageUrl && (
                  <Image src={p.imageUrl} alt="" fill className="object-cover" sizes="80px" loading="lazy" />
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex h-full flex-col p-1.5">
          <div
            className="mb-1.5 h-4 w-full"
            style={{ background: c.surface, border: `1px solid ${c.border}`, borderRadius: entry.radius }}
          />
          <div className="mb-1.5 flex gap-1">
            {["All", entry.category].map((t, i) => (
              <span
                key={t}
                className="px-1.5 py-[2px] text-[5px] font-semibold"
                style={{
                  borderRadius: 999,
                  background: i === 0 ? c.accent : c.surface,
                  color: i === 0 ? c.accentInk : c.ink,
                  border: `1px solid ${i === 0 ? c.accent : c.border}`,
                }}
              >
                {t}
              </span>
            ))}
          </div>
          <div className="grid flex-1 grid-cols-2 content-start gap-1">
            {entry.products.slice(0, 6).map((p, i) => (
              <div
                key={i}
                className="overflow-hidden"
                style={{ background: c.surface, border: `1px solid ${c.border}`, borderRadius: entry.radius }}
              >
                <div className="relative w-full" style={{ aspectRatio: entry.gridAspect }}>
                  {p.imageUrl && (
                    <Image src={p.imageUrl} alt="" fill className="object-cover" sizes="80px" loading="lazy" />
                  )}
                </div>
                <div className="px-1 py-[3px]">
                  <div className="mb-[2px] h-[3px] w-4/5 rounded-full opacity-40" style={{ background: c.ink }} />
                  <p className="text-[6px] font-bold" style={{ color: c.ink }}>
                    {p.price}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function ShowcaseGallery({ entries }: { entries: ShowcaseEntry[] }) {
  const categories = ["All", ...new Set(entries.map((e) => e.category))];
  const [active, setActive] = useState("All");
  const visible = active === "All" ? entries : entries.filter((e) => e.category === active);

  if (entries.length === 0) return null;

  return (
    <section className="border-t border-ink-100 bg-white py-16">
      <div className="mx-auto max-w-6xl px-4">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-xs font-bold uppercase tracking-widest text-brand-800">
          <Sparkles className="h-3.5 w-3.5" /> A theme for every kind of shop
        </span>
        <div className="mt-4 flex flex-wrap items-end justify-between gap-3">
          <h2 className="max-w-xl text-3xl font-bold leading-tight">
            Real shops, built in minutes.
          </h2>
          <p className="text-sm text-ink-500">Tap any shop to open it live →</p>
        </div>

        {/* Category filter */}
        <div className="no-scrollbar -mx-4 mt-6 flex gap-2 overflow-x-auto px-4 pb-1">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setActive(c)}
              className={cn(
                "shrink-0 rounded-full border px-4 py-1.5 text-sm font-medium transition",
                active === c
                  ? "border-transparent bg-ink-900 text-white"
                  : "border-ink-300 bg-white text-ink-700 hover:bg-ink-50",
              )}
            >
              {c}
            </button>
          ))}
        </div>

        {/* Cards */}
        <div className="no-scrollbar -mx-4 mt-6 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4">
          {visible.map((entry) => (
            <article
              key={entry.slug}
              className="w-[19rem] shrink-0 snap-start rounded-2xl border border-ink-100 bg-white p-4 shadow-card transition hover:shadow-card-hover"
            >
              <div className="mb-3 flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h3 className="truncate font-semibold">{entry.name}</h3>
                  <p className="truncate text-xs text-ink-500">
                    {entry.category}
                    {entry.city && ` · ${entry.city}`}
                  </p>
                </div>
                <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> LIVE
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <PhoneFrame entry={entry} screen="storefront" />
                  <p className="mt-1.5 text-center text-[10px] font-semibold uppercase tracking-widest text-ink-500">
                    Storefront
                  </p>
                </div>
                <div>
                  <PhoneFrame entry={entry} screen="products" />
                  <p className="mt-1.5 text-center text-[10px] font-semibold uppercase tracking-widest text-ink-500">
                    Products
                  </p>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between border-t border-ink-100 pt-3">
                <span className="text-xs text-ink-500">
                  <span className="font-semibold text-ink-700">{entry.themeName}</span> theme ·{" "}
                  {entry.productCount} products
                </span>
                <a
                  href={`/${entry.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-0.5 text-sm font-semibold text-brand-700 hover:underline"
                >
                  Open live <ArrowUpRight className="h-3.5 w-3.5" />
                </a>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
