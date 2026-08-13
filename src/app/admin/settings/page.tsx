import type { Metadata } from "next";
import { db } from "@/lib/db";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = { title: "Settings — Admin" };
export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const settings = await db.platformSetting.findMany({ orderBy: { key: "asc" } });

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">Platform settings</h1>
      <Card>
        <CardContent className="pt-5">
          {settings.length === 0 ? (
            <p className="text-sm text-ink-500">No settings yet — run the seed script.</p>
          ) : (
            <dl className="divide-y divide-ink-100">
              {settings.map((s) => (
                <div key={s.key} className="flex justify-between py-2.5 text-sm">
                  <dt className="font-medium text-ink-700">{s.key}</dt>
                  <dd className="text-ink-900">{s.value}</dd>
                </div>
              ))}
            </dl>
          )}
          <p className="mt-4 text-xs text-ink-500">
            Settings are key-value pairs in the <code className="rounded bg-ink-100 px-1">PlatformSetting</code> table.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
