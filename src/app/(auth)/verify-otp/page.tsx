import type { Metadata } from "next";
import { Suspense } from "react";
import { OtpForm } from "@/components/auth/otp-form";

export const metadata: Metadata = { title: "Verify OTP" };

export default function VerifyOtpPage() {
  return (
    <Suspense>
      <OtpForm />
    </Suspense>
  );
}
