import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { AuthError } from "@/lib/auth/session";
import { zodErrorMessage } from "@/lib/validation";

export function ok<T>(data: T, init?: ResponseInit) {
  return NextResponse.json({ ok: true, data }, init);
}

export function fail(message: string, status = 400) {
  return NextResponse.json({ ok: false, error: message }, { status });
}

/** Wrap route handlers with consistent error handling. Never leaks internals. */
export function handleApiError(err: unknown): NextResponse {
  if (err instanceof AuthError) {
    if (err.code === "UNAUTHENTICATED") return fail("Please log in to continue.", 401);
    if (err.code === "NO_SHOP") return fail("Create your shop first.", 409);
    return fail("You don't have permission to do this.", 403);
  }
  if (err instanceof ZodError) return fail(zodErrorMessage(err), 422);
  console.error("[api]", err);
  return fail("Something went wrong. Please try again.", 500);
}
