"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function UpgradeButton({ planCode, planName }: { planCode: string; planName: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function upgrade() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/billing/upgrade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planCode }),
      });
      const json = await res.json();
      if (!json.ok) {
        setError(json.error ?? "Upgrade failed");
        return;
      }
      if (json.data.activated) {
        router.refresh();
      } else {
        // Production: open Razorpay Checkout with json.data.providerOrderId here.
        alert("Complete the payment in Razorpay Checkout to activate your plan.");
      }
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-1.5">
      <Button onClick={upgrade} loading={loading} className="w-full">
        Upgrade to {planName}
      </Button>
      {error && <p className="text-center text-xs text-red-600">{error}</p>}
    </div>
  );
}
