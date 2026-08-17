"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Sparkles, X, Info } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Before/after panel for the "Make it professional" action.
 *
 * The original photo is never replaced on the server — this only swaps the url
 * held in the form, so closing without choosing leaves everything as it was.
 */

interface EnhanceResponse {
  originalUrl: string;
  enhancedUrl: string;
  backgroundRemoved: boolean;
  creditsRemaining: number;
}

export function PhotoEnhancer({
  url,
  onUse,
  onClose,
}: {
  url: string;
  onUse: (enhancedUrl: string) => void;
  onClose: () => void;
}) {
  const [result, setResult] = useState<EnhanceResponse | null>(null);
  const [error, setError] = useState("");
  const [upgrade, setUpgrade] = useState(false);
  const [loading, setLoading] = useState(true);

  const run = useCallback(async () => {
    setLoading(true);
    setError("");
    setUpgrade(false);
    try {
      const res = await fetch("/api/ai/enhance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const json = await res.json();
      if (!json.ok) {
        if (res.status === 402) setUpgrade(true);
        setError(json.error ?? "Could not enhance this photo.");
        return;
      }
      setResult(json.data);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [url]);

  useEffect(() => {
    void run();
  }, [run]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Enhance photo"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-t-2xl bg-white p-5 shadow-xl sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h2 className="flex items-center gap-1.5 text-base font-bold">
              <Sparkles className="h-4 w-4 text-brand-700" /> Make it professional
            </h2>
            <p className="mt-0.5 text-xs text-ink-500">
              Your original photo is kept — nothing is replaced until you choose.
            </p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="rounded p-1 hover:bg-ink-100">
            <X className="h-4 w-4" />
          </button>
        </div>

        {loading && (
          <div className="flex aspect-[2/1] items-center justify-center rounded-xl bg-ink-100 text-sm text-ink-500">
            Cleaning up your photo…
          </div>
        )}

        {!loading && error && (
          <div className="space-y-3">
            <p className="text-sm font-medium text-red-600">{error}</p>
            {upgrade ? (
              <Link href="/pricing">
                <Button className="w-full" size="lg">
                  See plans with photo enhancement
                </Button>
              </Link>
            ) : (
              <Button variant="secondary" className="w-full" onClick={() => void run()}>
                Try again
              </Button>
            )}
          </div>
        )}

        {!loading && result && (
          <>
            <div className="grid grid-cols-2 gap-3">
              {(
                [
                  ["Before", result.originalUrl],
                  ["After", result.enhancedUrl],
                ] as const
              ).map(([label, src]) => (
                <figure key={label}>
                  <div className="relative aspect-square overflow-hidden rounded-xl bg-ink-100">
                    <Image src={src} alt={`${label} enhancement`} fill className="object-cover" sizes="240px" />
                  </div>
                  <figcaption className="mt-1.5 text-center text-xs font-semibold text-ink-600">
                    {label}
                  </figcaption>
                </figure>
              ))}
            </div>

            {!result.backgroundRemoved && (
              <p className="mt-3 flex gap-1.5 rounded-lg bg-ink-100 p-2.5 text-xs text-ink-600">
                <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                <span>
                  We brightened and straightened this photo but left the background alone — it was too
                  busy to cut out safely. Shooting against a plain wall or cloth gives the best result.
                </span>
              </p>
            )}

            <div className="mt-4 flex gap-3">
              <Button variant="secondary" className="flex-1" onClick={onClose}>
                Keep original
              </Button>
              <Button className="flex-1" onClick={() => onUse(result.enhancedUrl)}>
                Use this photo
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
