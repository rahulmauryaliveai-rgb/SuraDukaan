import { describe, it, expect } from "vitest";
import { MockOTPProvider, MSG91Provider, getOTPProvider } from "@/lib/otp/provider";

describe("OTP provider abstraction", () => {
  it("mock provider always succeeds", async () => {
    const provider = new MockOTPProvider();
    const result = await provider.sendOtp("9876543210", "123456");
    expect(result.ok).toBe(true);
  });

  it("provider factory defaults to mock", () => {
    delete process.env.SMS_PROVIDER;
    expect(getOTPProvider().name).toBe("mock");
  });

  it("provider factory respects SMS_PROVIDER", () => {
    process.env.SMS_PROVIDER = "msg91";
    process.env.SMS_API_KEY = "test";
    expect(getOTPProvider()).toBeInstanceOf(MSG91Provider);
    process.env.SMS_PROVIDER = "mock";
  });
});
