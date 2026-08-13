import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

type Tone = "default" | "success" | "warning" | "danger" | "brand" | "outline";

const tones: Record<Tone, string> = {
  default: "bg-ink-100 text-ink-700",
  success: "bg-emerald-100 text-emerald-800",
  warning: "bg-amber-100 text-amber-800",
  danger: "bg-red-100 text-red-700",
  brand: "bg-brand-100 text-brand-800",
  outline: "border border-ink-300 text-ink-700",
};

export function Badge({
  tone = "default",
  className,
  ...props
}: HTMLAttributes<HTMLSpanElement> & { tone?: Tone }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium",
        tones[tone],
        className,
      )}
      {...props}
    />
  );
}
