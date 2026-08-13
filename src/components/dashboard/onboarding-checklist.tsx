import Link from "next/link";
import { CheckCircle2, Circle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function OnboardingChecklist({
  hasLogo,
  productCount,
  categoryCount,
  hasDescription,
}: {
  hasLogo: boolean;
  productCount: number;
  categoryCount: number;
  hasDescription: boolean;
}) {
  const items = [
    { label: "Create shop", done: true, href: "/dashboard" },
    { label: "Add logo", done: hasLogo, href: "/dashboard/settings" },
    { label: "Add first product", done: productCount >= 1, href: "/dashboard/products/new" },
    { label: "Add 3 products", done: productCount >= 3, href: "/dashboard/products/new" },
    { label: "Add a category", done: categoryCount >= 1, href: "/dashboard/categories" },
    { label: "Describe your shop", done: hasDescription, href: "/dashboard/settings" },
  ];
  const doneCount = items.filter((i) => i.done).length;
  const percent = Math.round((doneCount / items.length) * 100);
  if (percent === 100) return null;

  return (
    <Card className="border-brand-200 bg-brand-50/50">
      <CardContent className="p-4">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-sm font-semibold">Set up your shop</h2>
          <span className="text-sm font-bold text-brand-700">{percent}% Complete</span>
        </div>
        <div className="mb-3 h-1.5 rounded-full bg-white">
          <div className="h-1.5 rounded-full bg-brand-600 transition-all" style={{ width: `${percent}%` }} />
        </div>
        <ul className="grid gap-1.5 sm:grid-cols-2">
          {items.map((item) => (
            <li key={item.label}>
              <Link
                href={item.href}
                className="flex items-center gap-2 rounded-lg px-2 py-1 text-sm hover:bg-white/70"
              >
                {item.done ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                ) : (
                  <Circle className="h-4 w-4 text-ink-300" />
                )}
                <span className={item.done ? "text-ink-500 line-through" : "text-ink-700"}>{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
