"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ArrowUpRight, Sparkles, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

/** How long the carousel waits before advancing on its own. */
const AUTOPLAY_MS = 3500;

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

  const trackRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const [paused, setPaused] = useState(false);
  /**
   * This section now sits on every public page, including short ones like
   * Privacy that most visitors never scroll. Autoplay stays off until the
   * carousel is actually near the viewport, so those pages don't run a timer
   * and re-layout work for a component nobody is looking at.
   */
  const [inView, setInView] = useState(false);

  /** Width of one card plus the gap between cards. */
  const cardStep = useCallback(() => {
    const el = trackRef.current;
    if (!el) return 0;
    const first = el.firstElementChild as HTMLElement | null;
    if (!first) return el.clientWidth;
    const styles = getComputedStyle(el);
    const gap = parseFloat(styles.columnGap || styles.gap || "16") || 16;
    return first.offsetWidth + gap;
  }, []);

  /** Advance one card, wrapping around at either end. */
  const scrollByCards = useCallback(
    (direction: 1 | -1) => {
      const el = trackRef.current;
      if (!el) return;
      const max = el.scrollWidth - el.clientWidth;
      if (max <= 0) return;

      let target = el.scrollLeft + direction * cardStep();
      if (direction === 1 && el.scrollLeft >= max - 4) target = 0;
      if (direction === -1 && el.scrollLeft <= 4) target = max;

      el.scrollTo({ left: Math.max(0, Math.min(target, max)), behavior: "smooth" });
    },
    [cardStep],
  );

  // Start paying attention only once the carousel is close to the viewport.
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setInView(true);
          io.disconnect();
        }
      },
      { rootMargin: "200px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Autoplay — stops while the visitor is hovering, touching or tabbing through.
  useEffect(() => {
    if (!inView || paused || visible.length < 2) return;
    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }
    const id = window.setInterval(() => scrollByCards(1), AUTOPLAY_MS);
    return () => window.clearInterval(id);
  }, [inView, paused, visible.length, scrollByCards]);

  // Jump back to the first card whenever the category filter changes.
  useEffect(() => {
    trackRef.current?.scrollTo({ left: 0, behavior: "smooth" });
  }, [active]);

  if (entries.length === 0) return null;

  const arrowClass =
    "absolute top-1/2 z-10 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-pill " +
    "border border-line-200 bg-white/95 text-deep-800 shadow-lift backdrop-blur transition duration-300 " +
    "hover:-translate-y-[calc(50%+2px)] hover:bg-white active:scale-95 sm:flex";

  return (
    <section ref={sectionRef} id="themes" className="scroll-mt-20 border-t border-line-200 bg-white py-24">
      <div className="mx-auto max-w-6xl px-5">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <span className="inline-flex items-center gap-1.5 rounded-pill bg-soft-100 px-4 py-1.5 text-sm font-semibold text-deep-800">
            <Sparkles className="h-4 w-4" /> A theme for every kind of shop
          </span>
          <h2 className="mt-4 text-[clamp(28px,4.4vw,56px)] font-extrabold leading-[1.08] tracking-[-0.02em] text-deep-700">
            Your shop shouldn&apos;t look like everyone else&apos;s
          </h2>
          <p className="mt-4 text-lg text-moss-600">
            Real shops, running live on SURA right now. Tap any one to open it.
          </p>
        </div>

        {/* Category filter */}
        <div className="no-scrollbar -mx-5 mb-2 flex justify-start gap-2 overflow-x-auto px-5 pb-1 sm:justify-center">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setActive(c)}
              className={cn(
                "shrink-0 rounded-pill border px-5 py-2 text-sm font-semibold transition duration-300",
                active === c
                  ? "border-transparent bg-deep-800 text-white"
                  : "border-line-200 bg-white text-deep-700 hover:bg-soft-50",
              )}
            >
              {c}
            </button>
          ))}
        </div>

        {/* Cards */}
        <div
          className="relative"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onFocusCapture={() => setPaused(true)}
          onBlurCapture={() => setPaused(false)}
          onTouchStart={() => setPaused(true)}
        >
          <button
            type="button"
            onClick={() => scrollByCards(-1)}
            aria-label="Previous shops"
            className={cn(arrowClass, "-left-3 lg:-left-5")}
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => scrollByCards(1)}
            aria-label="Next shops"
            className={cn(arrowClass, "-right-3 lg:-right-5")}
          >
            <ChevronRight className="h-5 w-5" />
          </button>

          <div
            ref={trackRef}
            className="no-scrollbar -mx-4 mt-6 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4"
          >
            {visible.map((entry) => (
            <article
              key={entry.slug}
              className="w-[19rem] shrink-0 snap-start rounded-card border border-line-200 bg-white p-4 transition duration-300 hover:-translate-y-1.5 hover:shadow-lift"
            >
              <div className="mb-3 flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h3 className="truncate font-bold text-deep-700">{entry.name}</h3>
                  <p className="truncate text-xs text-moss-600">
                    {entry.category}
                    {entry.city && ` · ${entry.city}`}
                  </p>
                </div>
                <span className="inline-flex shrink-0 items-center gap-1 rounded-pill bg-soft-100 px-2.5 py-1 text-[10px] font-bold text-deep-800">
                  <span className="h-1.5 w-1.5 rounded-full bg-deep-800" /> LIVE
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <PhoneFrame entry={entry} screen="storefront" />
                  <p className="mt-1.5 text-center text-[10px] font-semibold uppercase tracking-widest text-moss-600">
                    Storefront
                  </p>
                </div>
                <div>
                  <PhoneFrame entry={entry} screen="products" />
                  <p className="mt-1.5 text-center text-[10px] font-semibold uppercase tracking-widest text-moss-600">
                    Products
                  </p>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between border-t border-line-200 pt-3">
                <span className="text-xs text-moss-600">
                  <span className="font-semibold text-deep-700">{entry.themeName}</span> theme ·{" "}
                  {entry.productCount} products
                </span>
                <a
                  href={`/${entry.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-0.5 text-sm font-semibold text-deep-800 hover:underline"
                >
                  Open live <ArrowUpRight className="h-3.5 w-3.5" />
                </a>
              </div>
            </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
