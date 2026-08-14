/**
 * Checks every demo image URL in prisma/showcase.ts and reports broken ones.
 * Run:  node scripts/check-demo-images.mjs
 *
 * Needs internet. Prints a list of URLs that do not return an image so they
 * can be replaced before the shops are shown to anyone.
 */
import { readFileSync, writeFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const file = path.join(root, "prisma", "showcase.ts");
const src = readFileSync(file, "utf8");

// Collect photo ids used by the u("…") helper, keeping the line for context.
const ids = [...new Set([...src.matchAll(/u\("([^"]+)"/g)].map((m) => m[1]))];
console.log(`Checking ${ids.length} demo images…\n`);

const bad = [];
let done = 0;

async function check(id) {
  const url = `https://images.unsplash.com/photo-${id}?w=200&q=60&auto=format&fit=crop`;
  try {
    const res = await fetch(url, { method: "GET", redirect: "follow" });
    const type = res.headers.get("content-type") ?? "";
    const ok = res.ok && type.startsWith("image/");
    if (!ok) bad.push({ id, status: res.status, type });
    process.stdout.write(ok ? "." : "X");
  } catch (err) {
    bad.push({ id, status: "network", type: String(err) });
    process.stdout.write("X");
  }
  if (++done % 50 === 0) process.stdout.write(` ${done}\n`);
}

// Small concurrency so we do not hammer the CDN.
const queue = [...ids];
await Promise.all(
  Array.from({ length: 6 }, async () => {
    while (queue.length) await check(queue.shift());
  }),
);

console.log("\n");
if (bad.length === 0) {
  console.log("✓ All demo images load correctly.");
} else {
  console.log(`✗ ${bad.length} broken image(s):\n`);
  for (const b of bad) {
    // Show which products use it, to make replacement easy.
    const lines = src
      .split("\n")
      .filter((l) => l.includes(b.id))
      .map((l) => (l.match(/name: "([^"]+)"/) || [])[1] ?? l.trim().slice(0, 60));
    console.log(`  ${b.id}  [${b.status}]  ${lines.join(", ")}`);
  }
  writeFileSync(path.join(root, "broken-images.txt"), bad.map((b) => b.id).join("\n"));
  console.log("\nList also written to broken-images.txt");
}
