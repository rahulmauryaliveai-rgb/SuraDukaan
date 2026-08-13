"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function AdminEntityActions({
  kind,
  id,
  isActive,
}: {
  kind: "user" | "shop";
  id: string;
  isActive: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  async function act(action: "suspend" | "activate" | "delete") {
    if (action === "delete" && !confirm(`Really delete this ${kind}? This is a soft delete.`)) return;
    setLoading(action);
    try {
      const res = await fetch(`/api/admin/${kind}s`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [`${kind}Id`]: id, action }),
      });
      const json = await res.json();
      if (!json.ok) alert(json.error ?? "Action failed");
      router.refresh();
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="flex gap-1.5">
      {isActive ? (
        <Button size="sm" variant="outline" loading={loading === "suspend"} onClick={() => act("suspend")}>
          Suspend
        </Button>
      ) : (
        <Button size="sm" variant="outline" loading={loading === "activate"} onClick={() => act("activate")}>
          Activate
        </Button>
      )}
      <Button size="sm" variant="danger" loading={loading === "delete"} onClick={() => act("delete")}>
        Delete
      </Button>
    </div>
  );
}
