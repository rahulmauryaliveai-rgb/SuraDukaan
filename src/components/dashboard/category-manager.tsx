"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FolderOpen, GripVertical, Trash2, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";

interface Cat {
  id: string;
  name: string;
  isActive: boolean;
  productCount: number;
}

export function CategoryManager({ initial }: { initial: Cat[] }) {
  const router = useRouter();
  const [cats, setCats] = useState<Cat[]>(initial);
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [adding, setAdding] = useState(false);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setAdding(true);
    setError("");
    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      });
      const json = await res.json();
      if (!json.ok) {
        setError(json.error ?? "Could not add category");
        return;
      }
      setCats((prev) => [...prev, { id: json.data.category.id, name: json.data.category.name, isActive: true, productCount: 0 }]);
      setName("");
      router.refresh();
    } finally {
      setAdding(false);
    }
  }

  async function patch(id: string, body: Record<string, unknown>) {
    const res = await fetch("/api/categories", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...body }),
    });
    const json = await res.json();
    if (!json.ok) setError(json.error ?? "Update failed");
    return json.ok;
  }

  async function toggle(cat: Cat) {
    if (await patch(cat.id, { isActive: !cat.isActive })) {
      setCats((prev) => prev.map((c) => (c.id === cat.id ? { ...c, isActive: !c.isActive } : c)));
    }
  }

  async function remove(cat: Cat) {
    if (!confirm(`Delete "${cat.name}"? Products in it will become uncategorised.`)) return;
    if (await patch(cat.id, { delete: true })) {
      setCats((prev) => prev.filter((c) => c.id !== cat.id));
      router.refresh();
    }
  }

  async function move(index: number, dir: -1 | 1) {
    const next = [...cats];
    const target = index + dir;
    if (target < 0 || target >= next.length) return;
    const a = next[index]!;
    next[index] = next[target]!;
    next[target] = a;
    setCats(next);
    await Promise.all(next.map((c, i) => patch(c.id, { sortOrder: i })));
  }

  return (
    <div className="space-y-4">
      <form onSubmit={add} className="flex gap-2">
        <input
          className="h-11 flex-1 rounded-xl border border-ink-300 bg-white px-4 text-sm focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-600/20"
          placeholder="New category e.g. Men, Women, Footwear…"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={60}
        />
        <Button type="submit" loading={adding} disabled={!name.trim()}>
          Add
        </Button>
      </form>
      {error && <p className="text-sm text-red-600">{error}</p>}

      {cats.length === 0 ? (
        <EmptyState
          icon={<FolderOpen className="h-10 w-10" />}
          title="No categories yet"
          description="Categories help customers browse your shop — e.g. Men, Women, Kids."
        />
      ) : (
        <Card>
          <ul className="divide-y divide-ink-100">
            {cats.map((cat, i) => (
              <li key={cat.id} className="flex items-center gap-2 px-4 py-3">
                <div className="flex flex-col">
                  <button onClick={() => move(i, -1)} disabled={i === 0} className="text-ink-300 hover:text-ink-700 disabled:opacity-30" aria-label="Move up">
                    <GripVertical className="h-3 w-3 rotate-90" />
                  </button>
                  <button onClick={() => move(i, 1)} disabled={i === cats.length - 1} className="text-ink-300 hover:text-ink-700 disabled:opacity-30" aria-label="Move down">
                    <GripVertical className="h-3 w-3 -rotate-90" />
                  </button>
                </div>
                <div className="min-w-0 flex-1">
                  <p className={`truncate text-sm font-medium ${cat.isActive ? "" : "text-ink-500 line-through"}`}>{cat.name}</p>
                  <p className="text-xs text-ink-500">{cat.productCount} products</p>
                </div>
                <button onClick={() => toggle(cat)} className="rounded-lg p-2 text-ink-500 hover:bg-ink-100" aria-label={cat.isActive ? "Disable" : "Enable"}>
                  {cat.isActive ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                </button>
                <button onClick={() => remove(cat)} className="rounded-lg p-2 text-red-600 hover:bg-red-50" aria-label="Delete">
                  <Trash2 className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}
