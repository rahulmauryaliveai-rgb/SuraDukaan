import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  LayoutDashboard,
  Package,
  FolderOpen,
  MessageCircle,
  BarChart3,
  Paintbrush,
  QrCode,
  Settings,
  ExternalLink,
  Store,
  CreditCard,
} from "lucide-react";
import { getTenantContext } from "@/lib/auth/session";
import { Badge } from "@/components/ui/badge";
import { LogoutButton } from "@/components/dashboard/logout-button";

const nav = [
  { href: "/dashboard", label: "Home", icon: LayoutDashboard },
  { href: "/dashboard/products", label: "Products", icon: Package },
  { href: "/dashboard/categories", label: "Categories", icon: FolderOpen },
  { href: "/dashboard/enquiries", label: "Enquiries", icon: MessageCircle },
  { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/dashboard/customize", label: "Customize", icon: Paintbrush },
  { href: "/dashboard/qr-code", label: "QR Code", icon: QrCode },
  { href: "/dashboard/billing", label: "Plan & Billing", icon: CreditCard },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

const mobileNav = [
  { href: "/dashboard", label: "Home", icon: LayoutDashboard },
  { href: "/dashboard/products", label: "Products", icon: Package },
  { href: "/dashboard/enquiries", label: "Enquiries", icon: MessageCircle },
  { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/dashboard/settings", label: "More", icon: Settings },
];

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const ctx = await getTenantContext();
  if (!ctx) redirect("/login");
  if (!ctx.shop) redirect("/onboarding");
  const { shop } = ctx;

  return (
    <div className="min-h-dvh bg-ink-50">
      {/* Top header */}
      <header className="sticky top-0 z-30 border-b border-ink-100 bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-3 px-4">
          <div className="flex items-center gap-3 min-w-0">
            {shop.logoUrl ? (
              <Image
                src={shop.logoUrl}
                alt=""
                width={32}
                height={32}
                className="h-8 w-8 rounded-lg object-cover"
              />
            ) : (
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-700 text-white">
                <Store className="h-4 w-4" />
              </span>
            )}
            <span className="truncate font-semibold">{shop.name}</span>
            <Badge tone={shop.status === "LIVE" ? "success" : "warning"}>
              <span
                className={`h-1.5 w-1.5 rounded-full ${shop.status === "LIVE" ? "bg-emerald-500" : "bg-amber-500"}`}
              />
              {shop.status === "LIVE" ? "Live" : shop.status === "PAUSED" ? "Paused" : "Maintenance"}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href={`/${shop.slug}`}
              target="_blank"
              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-brand-700 hover:bg-brand-50"
            >
              <ExternalLink className="h-4 w-4" />
              <span className="hidden sm:inline">View Shop</span>
            </Link>
            <LogoutButton />
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-7xl">
        {/* Desktop sidebar */}
        <aside className="sticky top-14 hidden h-[calc(100dvh-3.5rem)] w-56 shrink-0 border-r border-ink-100 bg-white px-3 py-4 md:block">
          <nav className="space-y-1">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-ink-700 hover:bg-ink-50 hover:text-ink-900"
              >
                <item.icon className="h-4 w-4 text-ink-500" />
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>

        {/* Main */}
        <main className="min-w-0 flex-1 px-4 py-6 pb-24 md:pb-8">{children}</main>
      </div>

      {/* Mobile bottom nav */}
      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-ink-100 bg-white md:hidden">
        <div className="grid grid-cols-5">
          {mobileNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center gap-0.5 py-2.5 text-[11px] font-medium text-ink-500 hover:text-brand-700"
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}
