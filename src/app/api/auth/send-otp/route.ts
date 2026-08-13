import { phoneSchema } from "@/lib/validation";
import { sendOtp } from "@/lib/otp/service";
import { ok, fail, handleApiError } from "@/lib/api";
import { rateLimit, clientIp } from "@/lib/rate-limit";

export async function POST(req: Request) {
  try {
    if (!rateLimit(`otp:${clientIp(req)}`, 8, 10 * 60 * 1000)) {
      return fail("Too many OTP requests. Please try again later.", 429);
    }
    const body = await req.json();
    const phone = phoneSchema.parse(body.phone);
    const result = await sendOtp(phone);
    if (!result.ok) return fail(result.error ?? "Could not send OTP.");
    return ok({ sent: true, devHint: result.devHint });
  } catch (err) {
    return handleApiError(err);
  }
}
