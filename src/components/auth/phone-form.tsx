"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function PhoneForm({ mode }: { mode: "login" | "register" }) {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      const json = await res.json();
      if (!json.ok) {
        setError(json.error ?? "Could not send OTP");
        return;
      }
      const params = new URLSearchParams({ phone, mode });
      if (name) params.set("name", name);
      if (json.data?.devHint) params.set("dev", json.data.devHint);
      router.push(`/verify-otp?${params.toString()}`);
    } catch {
      setError("Network error. Please check your connection.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      {mode === "register" && (
        <Input
          label="Your name (optional)"
          placeholder="e.g. Ramesh Sharma"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoComplete="name"
        />
      )}
      <Input
        label="WhatsApp / mobile number"
        placeholder="10-digit mobile number"
        inputMode="numeric"
        autoComplete="tel"
        value={phone}
        onChange={(e) => setPhone(e.target.value.replace(/[^\d+ ]/g, ""))}
        required
        error={error}
      />
      <Button type="submit" className="w-full" size="lg" loading={loading}>
        Send OTP
      </Button>
      <p className="text-center text-xs text-ink-500">
        We&apos;ll send a one-time password to verify your number. No password needed.
      </p>
    </form>
  );
}
