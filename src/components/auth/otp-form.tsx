"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function OtpForm() {
  const router = useRouter();
  const params = useSearchParams();
  const phone = params.get("phone") ?? "";
  const name = params.get("name") ?? "";
  const dev = params.get("dev") ?? "";
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resent, setResent] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, code, name }),
      });
      const json = await res.json();
      if (!json.ok) {
        setError(json.error ?? "Invalid OTP");
        return;
      }
      router.replace(json.data.redirect);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function resend() {
    setResent(false);
    const res = await fetch("/api/auth/send-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone }),
    });
    const json = await res.json();
    if (json.ok) setResent(true);
    else setError(json.error ?? "Could not resend OTP");
  }

  if (!phone) {
    return (
      <p className="text-center text-sm text-ink-500">
        Missing phone number.{" "}
        <Link href="/login" className="font-semibold text-brand-700">
          Start again
        </Link>
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Enter the OTP</h1>
        <p className="mt-1 text-sm text-ink-500">
          Sent to <span className="font-semibold text-ink-900">+91 {phone}</span>
        </p>
      </div>
      {dev && (
        <p className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-2 text-center text-sm text-amber-800">
          Development mode — your OTP is <span className="font-bold">{dev}</span>
        </p>
      )}
      <Card>
        <CardContent className="pt-5">
          <form onSubmit={submit} className="space-y-4">
            <Input
              label="6-digit OTP"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              className="text-center text-2xl tracking-[0.5em] font-semibold"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
              required
              error={error}
            />
            <Button type="submit" className="w-full" size="lg" loading={loading}>
              Verify &amp; Continue
            </Button>
          </form>
          <div className="mt-4 text-center text-sm text-ink-500">
            {resent ? (
              <span className="text-emerald-700">OTP re-sent.</span>
            ) : (
              <button onClick={resend} className="font-semibold text-brand-700 hover:underline">
                Resend OTP
              </button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
