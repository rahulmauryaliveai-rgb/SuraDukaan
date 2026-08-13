"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Download, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CsvTools() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [importing, setImporting] = useState(false);
  const [message, setMessage] = useState("");

  async function onImport(files: FileList | null) {
    const file = files?.[0];
    if (!file) return;
    setImporting(true);
    setMessage("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/products/import", { method: "POST", body: fd });
      const json = await res.json();
      if (!json.ok) {
        setMessage(json.error ?? "Import failed");
        return;
      }
      setMessage(`Imported ${json.data.imported} products.`);
      router.refresh();
    } catch {
      setMessage("Network error during import.");
    } finally {
      setImporting(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return (
    <div className="space-y-1.5">
      <div className="flex gap-2">
        <a href="/api/products/export" download>
          <Button variant="ghost" size="sm">
            <Download className="h-4 w-4" /> Export CSV
          </Button>
        </a>
        <Button variant="ghost" size="sm" loading={importing} onClick={() => fileRef.current?.click()}>
          <Upload className="h-4 w-4" /> Import CSV
        </Button>
        <input
          ref={fileRef}
          type="file"
          accept=".csv,text/csv"
          className="sr-only"
          onChange={(e) => onImport(e.target.files)}
        />
      </div>
      {message && <p className="whitespace-pre-line text-xs text-ink-500">{message}</p>}
    </div>
  );
}
