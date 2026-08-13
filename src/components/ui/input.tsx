import { cn } from "@/lib/utils";
import { useId, type InputHTMLAttributes, type TextareaHTMLAttributes, type SelectHTMLAttributes } from "react";

const base =
  "w-full rounded-xl border border-ink-300 bg-white px-4 text-ink-900 placeholder:text-ink-500/60 " +
  "focus:border-brand-600 focus:ring-2 focus:ring-brand-600/20 focus:outline-none transition-colors " +
  "disabled:bg-ink-100 disabled:cursor-not-allowed";

export interface FieldProps {
  label?: string;
  error?: string;
  hint?: string;
}

export function Input({
  label,
  error,
  hint,
  className,
  id,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & FieldProps) {
  const autoId = useId();
  const inputId = id ?? autoId;
  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-ink-700">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={cn(base, "h-11 text-sm", error && "border-red-500 focus:border-red-500 focus:ring-red-500/20", className)}
        aria-invalid={!!error}
        {...props}
      />
      {error ? (
        <p className="text-sm text-red-600">{error}</p>
      ) : hint ? (
        <p className="text-sm text-ink-500">{hint}</p>
      ) : null}
    </div>
  );
}

export function Textarea({
  label,
  error,
  hint,
  className,
  id,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement> & FieldProps) {
  const autoId = useId();
  const inputId = id ?? autoId;
  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-ink-700">
          {label}
        </label>
      )}
      <textarea
        id={inputId}
        className={cn(base, "py-3 text-sm min-h-24", error && "border-red-500", className)}
        aria-invalid={!!error}
        {...props}
      />
      {error ? (
        <p className="text-sm text-red-600">{error}</p>
      ) : hint ? (
        <p className="text-sm text-ink-500">{hint}</p>
      ) : null}
    </div>
  );
}

export function Select({
  label,
  error,
  hint,
  className,
  id,
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement> & FieldProps) {
  const autoId = useId();
  const inputId = id ?? autoId;
  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-ink-700">
          {label}
        </label>
      )}
      <select id={inputId} className={cn(base, "h-11 text-sm", error && "border-red-500", className)} {...props}>
        {children}
      </select>
      {error ? (
        <p className="text-sm text-red-600">{error}</p>
      ) : hint ? (
        <p className="text-sm text-ink-500">{hint}</p>
      ) : null}
    </div>
  );
}
