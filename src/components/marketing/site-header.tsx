import Link from "next/link";
import { Store } from "lucide-react";

/**
 * Header shared by every public page. Anchors point at the landing page so
 * they still work from /pricing, /terms and friends.
 */
export function SiteHeader({ onLanding = false }: { onLanding?: boolean }) {
  const to = (hash: string) => (onLanding ? hash : `/${hash}`);

  return (
    <header className="sticky top-0 z-40 border-b border-line-200 bg-white/85 backdrop-blur-md">
      <div className="mx-auto flex h-[76px] max-w-6xl items-center gap-8 px-5">
        <Link href="/" className="flex items-center gap-2.5 text-xl font-extrabold text-deep-700">
          <span className="flex h-9 w-9 items-center justify-center rounded-[5px] bg-deep-800 text-mint-400">
            <Store className="h-4 w-4" />
          </span>
          SURA <span className="text-brand-700">SHOP</span>
        </Link>
        <nav className="hidden items-center gap-6 text-base font-medium text-moss-600 md:flex">
          <Link href={to("#features")} className="transition hover:text-deep-800">Features</Link>
          <Link href={to("#themes")} className="transition hover:text-deep-800">Themes</Link>
          <Link href={to("#pricing")} className="transition hover:text-deep-800">Pricing</Link>
          <Link href={to("#faq")} className="transition hover:text-deep-800">FAQ</Link>
        </nav>
        <div className="ml-auto flex items-center gap-3">
          <Link
            href="/login"
            className="hidden rounded-pill border-[1.5px] border-line-200 px-6 py-3 text-sm font-semibold text-deep-700 transition duration-300 hover:bg-soft-50 sm:inline-block"
          >
            Log in
          </Link>
          <Link
            href="/register"
            className="rounded-pill bg-mint-400 px-6 py-3 text-sm font-semibold text-deep-800 shadow-raise transition duration-300 hover:-translate-y-0.5 hover:bg-mint-500"
          >
            Create free shop
          </Link>
        </div>
      </div>
    </header>
  );
}
