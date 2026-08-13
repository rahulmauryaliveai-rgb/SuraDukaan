/**
 * SURA SHOP — zero-config launcher.
 *
 * Modes:
 *   node scripts/dev.mjs            → FAST mode (production build + next start)
 *   node scripts/dev.mjs --dev      → development mode (hot reload, slower pages)
 *   node scripts/dev.mjs --rebuild  → force a fresh production build
 *
 * 1. Uses DATABASE_URL from .env if that database is reachable,
 *    otherwise starts an embedded PostgreSQL (no Docker) on port 5433.
 * 2. First run: applies schema + seeds demo data (skipped afterwards).
 * 3. Serves the app and opens the browser.
 */
import { existsSync, readFileSync, writeFileSync } from "fs";
import { spawn } from "child_process";
import net from "net";
import path from "path";
import { fileURLToPath } from "url";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
process.chdir(root);

const DEV_MODE = process.argv.includes("--dev");
const FORCE_REBUILD = process.argv.includes("--rebuild");
const FORCE_SETUP = process.argv.includes("--setup");
const SETUP_MARKER = path.join(root, ".setup-done");

// --- load .env (simple parser, no dependency) ---
if (existsSync(".env")) {
  for (const line of readFileSync(".env", "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*"?([^"]*)"?\s*$/);
    if (m && process.env[m[1]] === undefined) process.env[m[1]] = m[2].trim();
  }
}
if (!process.env.AUTH_SECRET || process.env.AUTH_SECRET.length < 16 || process.env.AUTH_SECRET.startsWith("change-me")) {
  process.env.AUTH_SECRET = "dev-only-secret-0123456789-abcdefghijklmnop";
}
if (!process.env.APP_URL) process.env.APP_URL = "http://localhost:3000";

function canConnect(port, host = "127.0.0.1") {
  return new Promise((resolve) => {
    const socket = net.createConnection({ port, host });
    const done = (ok) => {
      socket.destroy();
      resolve(ok);
    };
    socket.once("connect", () => done(true));
    socket.once("error", () => done(false));
    setTimeout(() => done(false), 1500);
  });
}

function run(cmd, args) {
  return new Promise((resolve, reject) => {
    const p = spawn(cmd, args, { stdio: "inherit", shell: true, env: process.env });
    p.on("close", (code) => (code === 0 ? resolve() : reject(new Error(`${cmd} exited with ${code}`))));
  });
}

let embedded = null;

async function ensureDatabase() {
  const url = process.env.DATABASE_URL;
  if (url) {
    try {
      const parsed = new URL(url);
      if (await canConnect(Number(parsed.port || 5432), parsed.hostname)) {
        console.log(`✓ Using database from .env (${parsed.hostname}:${parsed.port || 5432})`);
        return;
      }
    } catch {
      /* invalid URL — fall through */
    }
  }
  console.log("Starting embedded PostgreSQL…");
  const { default: EmbeddedPostgres } = await import("embedded-postgres");
  embedded = new EmbeddedPostgres({
    databaseDir: path.join(root, ".pgdata"),
    user: "sura",
    password: "sura",
    port: 5433,
    persistent: true,
  });
  if (!existsSync(path.join(root, ".pgdata", "PG_VERSION"))) {
    await embedded.initialise();
  }
  await embedded.start();
  try {
    await embedded.createDatabase("surashop");
  } catch {
    /* already exists */
  }
  process.env.DATABASE_URL = "postgresql://sura:sura@127.0.0.1:5433/surashop";
  console.log("✓ Embedded PostgreSQL running on port 5433");
}

async function main() {
  await ensureDatabase();

  if (FORCE_SETUP || !existsSync(SETUP_MARKER)) {
    console.log("\nApplying database schema…");
    await run("npx", ["prisma", "db", "push", "--skip-generate"]);
    console.log("\nSeeding demo data (safe to re-run)…");
    try {
      await run("npx", ["tsx", "prisma/seed.ts"]);
    } catch {
      console.log("Seed step failed or already applied — continuing.");
    }
    writeFileSync(SETUP_MARKER, new Date().toISOString());
  } else {
    console.log("✓ Database already set up (delete .setup-done to re-run schema/seed)");
  }

  let serverCmd;
  if (DEV_MODE) {
    console.log("\nStarting SURA SHOP in DEVELOPMENT mode (hot reload, slower pages)…");
    serverCmd = ["next", "dev"];
  } else {
    const hasBuild = existsSync(path.join(root, ".next", "BUILD_ID"));
    if (!hasBuild || FORCE_REBUILD) {
      console.log("\nBuilding optimized production bundle (one-time, a few minutes)…");
      await run("npx", ["next", "build"]);
    } else {
      console.log("✓ Using existing production build (run start-sura-rebuild.bat after code changes)");
    }
    console.log("\nStarting SURA SHOP in FAST (production) mode → http://localhost:3000\n");
    serverCmd = ["next", "start", "-p", "3000"];
  }

  const server = spawn("npx", serverCmd, { stdio: "inherit", shell: true, env: process.env });

  // Open the browser once the server responds.
  (async () => {
    const start = Date.now();
    while (Date.now() - start < 300000) {
      if (await canConnect(3000)) {
        spawn("cmd", ["/c", "start", "", "http://localhost:3000"], { detached: true });
        break;
      }
      await new Promise((r) => setTimeout(r, 1500));
    }
  })();

  const shutdown = async () => {
    try {
      server.kill();
    } catch {
      /* ignore */
    }
    if (embedded) {
      try {
        await embedded.stop();
      } catch {
        /* ignore */
      }
    }
    process.exit(0);
  };
  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
  server.on("close", shutdown);
}

main().catch((err) => {
  console.error("\n✗ Startup failed:", err.message);
  console.error("Try running start-sura.bat again; if it persists, delete the .next folder and retry.");
  process.exitCode = 1;
});
