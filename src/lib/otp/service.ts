import "server-only";
import { createHash, randomInt, timingSafeEqual } from "crypto";
import { db } from "@/lib/db";
import { getOTPProvider } from "./provider";

const OTP_TTL_MS = 5 * 60 * 1000;
const MAX_ATTEMPTS = 5;
const RESEND_COOLDOWN_MS = 30 * 1000;

function hashCode(code: string): string {
  return createHash("sha256").update(`${code}:${process.env.AUTH_SECRET}`).digest("hex");
}

export async function sendOtp(phone: string): Promise<{ ok: boolean; error?: string; devHint?: string }> {
  const recent = await db.otpCode.findFirst({
    where: { phone, createdAt: { gt: new Date(Date.now() - RESEND_COOLDOWN_MS) } },
  });
  if (recent) return { ok: false, error: "Please wait 30 seconds before requesting another OTP." };

  const code = randomInt(100000, 1000000).toString();
  await db.otpCode.create({
    data: { phone, codeHash: hashCode(code), expiresAt: new Date(Date.now() + OTP_TTL_MS) },
  });
  const provider = getOTPProvider();
  const result = await provider.sendOtp(phone, code);
  if (!result.ok) return { ok: false, error: "Could not send OTP. Please try again." };
  return {
    ok: true,
    // In mock mode surface the code so development login works end-to-end.
    ...(provider.name === "mock" && process.env.NODE_ENV !== "production"
      ? { devHint: code }
      : {}),
  };
}

export async function verifyOtp(phone: string, code: string): Promise<{ ok: boolean; error?: string }> {
  const record = await db.otpCode.findFirst({
    where: { phone, usedAt: null, expiresAt: { gt: new Date() } },
    orderBy: { createdAt: "desc" },
  });
  if (!record) return { ok: false, error: "OTP expired or not found. Request a new one." };
  if (record.attempts >= MAX_ATTEMPTS) return { ok: false, error: "Too many attempts. Request a new OTP." };

  await db.otpCode.update({ where: { id: record.id }, data: { attempts: { increment: 1 } } });

  const expected = Buffer.from(record.codeHash, "hex");
  const actual = Buffer.from(hashCode(code), "hex");
  const match = expected.length === actual.length && timingSafeEqual(expected, actual);
  if (!match) return { ok: false, error: "Incorrect OTP. Please check and try again." };

  await db.otpCode.update({ where: { id: record.id }, data: { usedAt: new Date() } });
  return { ok: true };
}
