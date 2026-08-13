import "server-only";
import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import { cache } from "react";
import { db } from "@/lib/db";
import type { UserRole } from "@/generated/prisma/enums";

const COOKIE_NAME = "sura_session";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // 30 days

function secret(): Uint8Array {
  const s = process.env.AUTH_SECRET;
  if (!s || s.length < 16) throw new Error("AUTH_SECRET is not configured");
  return new TextEncoder().encode(s);
}

export interface SessionPayload {
  userId: string;
  role: UserRole;
}

export async function createSession(payload: SessionPayload): Promise<void> {
  const token = await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE_SECONDS}s`)
    .sign(secret());
  const store = await cookies();
  store.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: MAX_AGE_SECONDS,
    path: "/",
  });
}

export async function destroySession(): Promise<void> {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}

export const getSession = cache(async (): Promise<SessionPayload | null> => {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    if (typeof payload.userId !== "string") return null;
    return { userId: payload.userId, role: payload.role as UserRole };
  } catch {
    return null;
  }
});

/** Current authenticated user, or null. */
export const getCurrentUser = cache(async () => {
  const session = await getSession();
  if (!session) return null;
  const user = await db.user.findFirst({
    where: { id: session.userId, isActive: true, deletedAt: null },
  });
  return user;
});

/**
 * Tenant context. The shop is ALWAYS resolved through the authenticated
 * user's membership — never from a client-supplied shopId.
 */
export const getTenantContext = cache(async () => {
  const user = await getCurrentUser();
  if (!user) return null;
  const membership = await db.shopMember.findFirst({
    where: { userId: user.id, shop: { deletedAt: null } },
    include: { shop: { include: { theme: true } } },
    orderBy: { createdAt: "asc" },
  });
  if (!membership) return { user, shop: null, memberRole: null } as const;
  return { user, shop: membership.shop, memberRole: membership.role } as const;
});

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) throw new AuthError("UNAUTHENTICATED");
  return user;
}

export async function requireShop() {
  const ctx = await getTenantContext();
  if (!ctx) throw new AuthError("UNAUTHENTICATED");
  if (!ctx.shop) throw new AuthError("NO_SHOP");
  return { user: ctx.user, shop: ctx.shop, memberRole: ctx.memberRole };
}

export async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user) throw new AuthError("UNAUTHENTICATED");
  if (user.role !== "SUPER_ADMIN") throw new AuthError("FORBIDDEN");
  return user;
}

export class AuthError extends Error {
  constructor(public code: "UNAUTHENTICATED" | "FORBIDDEN" | "NO_SHOP") {
    super(code);
  }
}
