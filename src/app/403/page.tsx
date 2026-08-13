import Link from "next/link";
import { ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ForbiddenPage() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-ink-50 px-4 text-center">
      <ShieldAlert className="mb-4 h-12 w-12 text-ink-300" />
      <h1 className="text-3xl font-bold">Access denied</h1>
      <p className="mt-2 max-w-sm text-ink-500">You don&apos;t have permission to view this page.</p>
      <Link href="/dashboard" className="mt-6"><Button>Go to Dashboard</Button></Link>
    </div>
  );
}
