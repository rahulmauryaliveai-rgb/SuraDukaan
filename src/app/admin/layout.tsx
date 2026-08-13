import { redirect } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, Users, Store, CreditCard, Settings, ShieldCheck } from "lucide-react";
import { getCurrentUser } from "@/lib/auth/session";
import { LogoutButton } from "@/components/dashboard/logout-button";

const nav = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/shops", label: "Shops", icon: Store },
  { href: "/admin/plans", label: "Plans", icon: CreditCard },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "SUPER_ADMIN") redirect("/403");

  return (
    <div className="min-h-dvh bg-ink-50">
      <header className="sticky top-0 z-30 border-b border-ink-100 bg-ink-900 text-white">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
          <div className="flex items-center gap-2 font-semibold">
            <ShieldCheck className="h-5 w-5 text-brand-400" />
            SURA SHOP Admin
          </div>
          <LogoutButton />
        </div>
      </header>
      <div className="mx-auto flex max-w-7xl">
        <aside className="sticky top-14 hidden h-[calc(100dvh-3.5rem)] w-52 shrink-0 border-r border-ink-100 bg-white px-3 py-4 md:block">
          <nav className="space-y-1">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-ink-700 hover:bg-ink-50"
              >
                <item.icon className="h-4 w-4 text-ink-500" />
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>
        <main className="min-w-0 flex-1 px-4 py-6">{children}</main>
      </div>
      {/* Mobile nav */}
      <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t border-ink-100 bg-white md:hidden">
        {nav.map((item) => (
          <Link key={item.href} href={item.href} className="flex flex-col items-center gap-0.5 py-2.5 text-[11px] font-medium text-ink-500">
            <item.icon className="h-5 w-5" />
            {item.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
