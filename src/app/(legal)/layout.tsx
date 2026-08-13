import Link from "next/link";
import { Store } from "lucide-react";

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-white">
      <header className="border-b border-ink-100">
        <div className="mx-auto flex h-16 max-w-3xl items-center px-4">
          <Link href="/" className="flex items-center gap-2 font-bold">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-700 text-white">
              <Store className="h-4 w-4" />
            </span>
            SURA <span className="text-brand-700">SHOP</span>
          </Link>
        </div>
      </header>
      <main className="prose-sm mx-auto max-w-3xl px-4 py-10 leading-relaxed text-ink-700 [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:text-ink-900 [&_h2]:mt-6 [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-ink-900 [&_p]:mt-3">
        {children}
      </main>
    </div>
  );
}
