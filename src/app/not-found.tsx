import Link from "next/link";
import { Store } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-ink-50 px-4 text-center">
      <span className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-100 text-brand-700">
        <Store className="h-7 w-7" />
      </span>
      <h1 className="text-3xl font-bold">Page not found</h1>
      <p className="mt-2 max-w-sm text-ink-500">
        This page or shop doesn&apos;t exist. Check the link, or create your own shop in minutes.
      </p>
      <div className="mt-6 flex gap-3">
        <Link href="/"><Button variant="outline">Go Home</Button></Link>
        <Link href="/register"><Button>Create Your Free Shop</Button></Link>
      </div>
    </div>
  );
}
