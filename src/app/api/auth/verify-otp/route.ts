import { z } from "zod";
import { db } from "@/lib/db";
import { phoneSchema, otpSchema } from "@/lib/validation";
import { verifyOtp } from "@/lib/otp/service";
import { createSession } from "@/lib/auth/session";
import { ok, fail, handleApiError } from "@/lib/api";
import { rateLimit, clientIp } from "@/lib/rate-limit";

const schema = z.object({
  phone: phoneSchema,
  code: otpSchema,
  name: z.string().trim().max(80).optional(),
  email: z.string().trim().email().optional().or(z.literal("")),
});

export async function POST(req: Request) {
  try {
    if (!rateLimit(`verify:${clientIp(req)}`, 15, 10 * 60 * 1000)) {
      return fail("Too many attempts. Please try again later.", 429);
    }
    const { phone, code, name, email } = schema.parse(await req.json());
    const result = await verifyOtp(phone, code);
    if (!result.ok) return fail(result.error ?? "Invalid OTP.");

    let user = await db.user.findUnique({ where: { phone } });
    if (user && (!user.isActive || user.deletedAt)) {
      return fail("This account is suspended. Contact support.", 403);
    }
    if (!user) {
      user = await db.user.create({
        data: {
          phone,
          name: name || null,
          email: email || null,
          role: "SHOP_OWNER",
        },
      });
      await db.auditLog.create({
        data: { userId: user.id, action: "user.register", entity: "User", entityId: user.id },
      });
    }

    await createSession({ userId: user.id, role: user.role });

    const membership = await db.shopMember.findFirst({ where: { userId: user.id } });
    return ok({
      isNew: !membership,
      redirect: user.role === "SUPER_ADMIN" ? "/admin" : membership ? "/dashboard" : "/onboarding",
    });
  } catch (err) {
    return handleApiError(err);
  }
}
