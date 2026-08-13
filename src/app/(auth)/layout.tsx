import Link from "next/link";
import { Store } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col bg-ink-50">
      <header className="flex items-center justify-center py-8">
        <Link href="/" className="flex items-center gap-2 text-xl font-bold text-ink-900">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-700 text-white">
            <Store className="h-5 w-5" />
          </span>
          SURA <span className="text-brand-700">SHOP</span>
        </Link>
      </header>
      <main className="mx-auto w-full max-w-md flex-1 px-4 pb-16">{children}</main>
    </div>
  );
}
