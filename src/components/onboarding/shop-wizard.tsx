"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Store, Check, X, Loader2, MessageCircle, PartyPopper } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { BUSINESS_CATEGORIES, STOREFRONT_TEMPLATES } from "@/lib/constants";
import { cn } from "@/lib/utils";

type SlugState = "idle" | "checking" | "available" | "taken" | "invalid";

const STEPS = ["Shop name", "Category", "City", "WhatsApp", "Shop URL", "Theme"] as const;

function slugifyClient(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

export function ShopWizard() {
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [category, setCategory] = useState<string>("Clothing");
  const [city, setCity] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [slugState, setSlugState] = useState<SlugState>("idle");
  const [template, setTemplate] = useState("modern");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [doneSlug, setDoneSlug] = useState<string | null>(null);
  const checkTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Auto-generate slug from shop name until the user edits it manually.
  useEffect(() => {
    if (!slugTouched) setSlug(slugifyClient(name));
  }, [name, slugTouched]);

  // Debounced live availability check.
  useEffect(() => {
    if (!slug || slug.length < 3) {
      setSlugState(slug ? "invalid" : "idle");
      return;
    }
    setSlugState("checking");
    if (checkTimer.current) clearTimeout(checkTimer.current);
    checkTimer.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/shops/check-slug?slug=${encodeURIComponent(slug)}`);
        const json = await res.json();
        if (!json.ok) return setSlugState("invalid");
        setSlugState(
          json.data.available ? "available" : json.data.reason === "invalid" ? "invalid" : "taken",
        );
      } catch {
        setSlugState("idle");
      }
    }, 350);
    return () => {
      if (checkTimer.current) clearTimeout(checkTimer.current);
    };
  }, [slug]);

  function canNext(): boolean {
    switch (step) {
      case 0: return name.trim().length >= 2;
      case 1: return !!category;
      case 2: return true; // city optional
      case 3: return /^[6-9]\d{9}$/.test(whatsapp.replace(/\D/g, "").replace(/^91/, "").slice(-10));
      case 4: return slugState === "available";
      case 5: return !!template;
      default: return false;
    }
  }

  async function finish() {
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/shops", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), category, city: city.trim(), whatsapp, slug, template }),
      });
      const json = await res.json();
      if (!json.ok) {
        setError(json.error ?? "Could not create shop");
        return;
      }
      setDoneSlug(json.data.slug);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (doneSlug) {
    const shopUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/${doneSlug}`;
    const waShare = `https://wa.me/?text=${encodeURIComponent(`🛍️ Welcome to ${name}!\n\nExplore our products online:\n\n${shopUrl}`)}`;
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-brand-100 text-brand-700">
          <PartyPopper className="h-8 w-8" />
        </div>
        <h1 className="text-2xl font-bold">Your Shop Is Ready 🎉</h1>
        <p className="mt-3 rounded-xl bg-white border border-ink-100 px-4 py-3 font-mono text-sm text-brand-700 break-all">
          {shopUrl}
        </p>
        <div className="mt-8 grid grid-cols-1 gap-3">
          <Link href={`/${doneSlug}`} target="_blank">
            <Button className="w-full" size="lg">View Shop</Button>
          </Link>
          <a href={waShare} target="_blank" rel="noopener noreferrer">
            <Button variant="whatsapp" className="w-full" size="lg">
              <MessageCircle className="h-5 w-5" /> Share on WhatsApp
            </Button>
          </a>
          <Link href="/dashboard/products/new">
            <Button variant="outline" className="w-full" size="lg">+ Add Products</Button>
          </Link>
          <Link href="/dashboard/qr-code">
            <Button variant="ghost" className="w-full" size="lg">Download QR Code</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-ink-50">
      <header className="flex items-center justify-center py-8">
        <div className="flex items-center gap-2 text-lg font-bold">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-700 text-white">
            <Store className="h-4 w-4" />
          </span>
          Create your shop
        </div>
      </header>

      <div className="mx-auto max-w-md px-4 pb-20">
        {/* Progress */}
        <div className="mb-6">
          <div className="flex justify-between text-xs font-medium text-ink-500">
            <span>Step {step + 1} of {STEPS.length}</span>
            <span>{STEPS[step]}</span>
          </div>
          <div className="mt-2 h-1.5 rounded-full bg-ink-100">
            <div
              className="h-1.5 rounded-full bg-brand-600 transition-all"
              style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
            />
          </div>
        </div>

        <Card>
          <CardContent className="pt-6 space-y-5">
            {step === 0 && (
              <>
                <h2 className="text-lg font-semibold">What is your shop called?</h2>
                <Input
                  placeholder="e.g. Sharma Fashion"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoFocus
                  maxLength={80}
                />
              </>
            )}
            {step === 1 && (
              <>
                <h2 className="text-lg font-semibold">What do you sell?</h2>
                <div className="grid grid-cols-2 gap-2">
                  {BUSINESS_CATEGORIES.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setCategory(c)}
                      className={cn(
                        "rounded-xl border px-3 py-2.5 text-sm font-medium transition-colors text-left",
                        category === c
                          ? "border-brand-600 bg-brand-50 text-brand-800"
                          : "border-ink-300 bg-white text-ink-700 hover:bg-ink-50",
                      )}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </>
            )}
            {step === 2 && (
              <>
                <h2 className="text-lg font-semibold">Which city are you in?</h2>
                <Input
                  placeholder="e.g. Lucknow (optional)"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  autoFocus
                  maxLength={60}
                />
              </>
            )}
            {step === 3 && (
              <>
                <h2 className="text-lg font-semibold">Your WhatsApp number</h2>
                <p className="text-sm text-ink-500 -mt-3">Customers will send orders here.</p>
                <Input
                  placeholder="10-digit WhatsApp number"
                  inputMode="numeric"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value.replace(/[^\d]/g, "").slice(0, 10))}
                  autoFocus
                />
              </>
            )}
            {step === 4 && (
              <>
                <h2 className="text-lg font-semibold">Choose your shop link</h2>
                <div>
                  <div className="flex items-center rounded-xl border border-ink-300 bg-white focus-within:border-brand-600 focus-within:ring-2 focus-within:ring-brand-600/20">
                    <span className="pl-4 text-sm text-ink-500 select-none">sura.shop/</span>
                    <input
                      className="h-11 w-full bg-transparent px-1 text-sm font-medium focus:outline-none"
                      value={slug}
                      onChange={(e) => {
                        setSlugTouched(true);
                        setSlug(slugifyClient(e.target.value));
                      }}
                      aria-label="Shop URL"
                    />
                    <span className="pr-3">
                      {slugState === "checking" && <Loader2 className="h-4 w-4 animate-spin text-ink-500" />}
                      {slugState === "available" && <Check className="h-4 w-4 text-emerald-600" />}
                      {(slugState === "taken" || slugState === "invalid") && <X className="h-4 w-4 text-red-500" />}
                    </span>
                  </div>
                  <p className="mt-1.5 text-sm">
                    {slugState === "available" && <span className="text-emerald-700">This link is available!</span>}
                    {slugState === "taken" && <span className="text-red-600">Already taken — try another.</span>}
                    {slugState === "invalid" && <span className="text-red-600">Use at least 3 letters/numbers.</span>}
                    {(slugState === "idle" || slugState === "checking") && (
                      <span className="text-ink-500">This will be your shop&apos;s permanent link.</span>
                    )}
                  </p>
                </div>
              </>
            )}
            {step === 5 && (
              <>
                <h2 className="text-lg font-semibold">Pick a look for your shop</h2>
                <div className="space-y-2">
                  {STOREFRONT_TEMPLATES.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setTemplate(t.id)}
                      className={cn(
                        "w-full rounded-xl border px-4 py-3 text-left transition-colors",
                        template === t.id
                          ? "border-brand-600 bg-brand-50"
                          : "border-ink-300 bg-white hover:bg-ink-50",
                      )}
                    >
                      <span className="block text-sm font-semibold">{t.name}</span>
                      <span className="block text-xs text-ink-500">{t.description}</span>
                    </button>
                  ))}
                </div>
                <p className="text-xs text-ink-500">You can change this anytime.</p>
              </>
            )}

            {error && <p className="text-sm text-red-600">{error}</p>}

            <div className="flex gap-3 pt-2">
              {step > 0 && (
                <Button variant="outline" onClick={() => setStep((s) => s - 1)} className="flex-1">
                  Back
                </Button>
              )}
              {step < STEPS.length - 1 ? (
                <Button onClick={() => setStep((s) => s + 1)} disabled={!canNext()} className="flex-1">
                  Continue
                </Button>
              ) : (
                <Button onClick={finish} disabled={!canNext()} loading={submitting} className="flex-1">
                  Create My Shop
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
