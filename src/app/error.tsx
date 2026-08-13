"use client";

import { Button } from "@/components/ui/button";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-ink-50 px-4 text-center">
      <h1 className="text-3xl font-bold">Something went wrong</h1>
      <p className="mt-2 max-w-sm text-ink-500">
        An unexpected error occurred. Please try again — if it keeps happening, contact support.
      </p>
      <Button onClick={reset} className="mt-6">Try Again</Button>
    </div>
  );
}
