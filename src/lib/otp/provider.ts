/** OTP/SMS provider abstraction. Swap providers via SMS_PROVIDER env var. */

export interface OTPProvider {
  readonly name: string;
  sendOtp(phone: string, code: string): Promise<{ ok: boolean; error?: string }>;
}

export class MockOTPProvider implements OTPProvider {
  readonly name = "mock";
  async sendOtp(phone: string, code: string) {
    // Development only: the OTP is logged to the server console.
    console.log(`\n[MockOTP] OTP for ${phone}: ${code}\n`);
    return { ok: true };
  }
}

/** MSG91 — production-ready shape; fill in API call when key is available. */
export class MSG91Provider implements OTPProvider {
  readonly name = "msg91";
  constructor(private apiKey: string) {}
  async sendOtp(phone: string, code: string) {
    const res = await fetch("https://control.msg91.com/api/v5/otp", {
      method: "POST",
      headers: { authkey: this.apiKey, "Content-Type": "application/json" },
      body: JSON.stringify({ mobile: `91${phone}`, otp: code }),
    });
    return res.ok ? { ok: true } : { ok: false, error: `MSG91 ${res.status}` };
  }
}

export class TwilioProvider implements OTPProvider {
  readonly name = "twilio";
  constructor(private apiKey: string) {}
  async sendOtp(phone: string, code: string) {
    // Wire Twilio Verify / Messages API here with this.apiKey.
    void this.apiKey;
    void phone;
    void code;
    return { ok: false, error: "Twilio provider not configured" };
  }
}

export function getOTPProvider(): OTPProvider {
  const provider = process.env.SMS_PROVIDER ?? "mock";
  const key = process.env.SMS_API_KEY ?? "";
  switch (provider) {
    case "msg91":
      return new MSG91Provider(key);
    case "twilio":
      return new TwilioProvider(key);
    default:
      return new MockOTPProvider();
  }
}
