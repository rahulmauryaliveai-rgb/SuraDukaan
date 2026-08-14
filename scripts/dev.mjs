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
import { existsSync, readFileSync, writeFileSync, statSync } from "fs";
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
/** Bump when the schema or seed changes so existing installs re-run setup. */
const SETUP_VERSION = "2-themes";

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
/** Prisma's `directUrl` must always resolve; locally it's the same connection. */
function syncDirectUrl() {
  if (process.env.DATABASE_URL) process.env.DIRECT_URL = process.env.DIRECT_URL || process.env.DATABASE_URL;
}
syncDirectUrl();

/**
 * Child processes (prisma, next) read `.env` themselves, so the file has to
 * agree with the database we actually started. Rewrites one key, preserving
 * the previous value as a comment.
 */
function setEnvFileValue(key, value) {
  const file = path.join(root, ".env");
  let lines = existsSync(file) ? readFileSync(file, "utf8").split(/\r?\n/) : [];
  const re = new RegExp(`^\\s*${key}\\s*=`);
  const idx = lines.findIndex((l) => re.test(l));
  const next = `${key}="${value}"`;
  if (idx === -1) {
    lines.push(next);
  } else if (lines[idx] !== next) {
    const old = lines[idx];
    lines[idx] = next;
    // Keep the old value once, for reference.
    if (!lines.some((l) => l === `# previous: ${old}`)) {
      lines.splice(idx + 1, 0, `# previous: ${old}`);
    }
  }
  writeFileSync(file, lines.join("\n"));
}

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

/** Stops whatever is already listening on a port (an older SURA SHOP run). */
async function freePort(port) {
  if (!(await canConnect(port))) return;
  console.log(`Port ${port} is in use — stopping the previous server…`);
  const { execSync } = await import("child_process");
  try {
    const out = execSync(`netstat -ano -p tcp | findstr :${port}`, { encoding: "utf8" });
    const pids = new Set(
      out
        .split(/\r?\n/)
        .filter((l) => l.includes("LISTENING"))
        .map((l) => l.trim().split(/\s+/).pop())
        .filter((p) => p && p !== "0" && Number(p) !== process.pid),
    );
    for (const pid of pids) {
      try {
        execSync(`taskkill /F /PID ${pid}`, { stdio: "ignore" });
      } catch {
        /* already gone */
      }
    }
    await new Promise((r) => setTimeout(r, 1500));
  } catch {
    /* nothing listening, or netstat unavailable */
  }
}

function run(cmd, args) {
  return new Promise((resolve, reject) => {
    const p = spawn(cmd, args, { stdio: "inherit", shell: true, env: process.env });
    p.on("close", (code) => (code === 0 ? resolve() : reject(new Error(`${cmd} exited with ${code}`))));
  });
}

let embedded = null;

/**
 * Creates the `surashop` database with UTF-8 encoding.
 *
 * On Indian/European Windows, initdb picks WIN1252 for the cluster, which
 * cannot store the ₹ sign — seeding then fails with error 22P05. Creating the
 * database from template0 with an explicit encoding avoids that entirely.
 */
async function ensureUtf8Database() {
  const { Client } = await import("pg");
  const admin = new Client({ connectionString: "postgresql://sura:sura@127.0.0.1:5433/postgres" });
  await admin.connect();
  try {
    const { rows } = await admin.query(
      "SELECT pg_encoding_to_char(encoding) AS enc FROM pg_database WHERE datname = 'surashop'",
    );

    if (rows.length === 0) {
      await admin.query(
        "CREATE DATABASE surashop WITH ENCODING 'UTF8' TEMPLATE template0 LC_COLLATE 'C' LC_CTYPE 'C'",
      );
      console.log("✓ Created database (UTF-8)");
      return;
    }

    if (rows[0].enc === "UTF8") return;

    // Wrong encoding: safe to rebuild only if the schema was never created.
    const probe = new Client({ connectionString: EMBEDDED_URL_STATIC });
    await probe.connect();
    const { rows: tables } = await probe.query(
      "SELECT COUNT(*)::int AS n FROM information_schema.tables WHERE table_schema = 'public'",
    );
    await probe.end();

    if (tables[0].n > 0) {
      console.warn(
        `\n[warning] Database encoding is ${rows[0].enc}, not UTF-8. The ₹ sign cannot be stored.` +
          "\n          Run reset-local-db.bat to rebuild it cleanly.\n",
      );
      return;
    }

    console.log(`Database encoding is ${rows[0].enc}; recreating it as UTF-8…`);
    await admin.query("DROP DATABASE surashop");
    await admin.query(
      "CREATE DATABASE surashop WITH ENCODING 'UTF8' TEMPLATE template0 LC_COLLATE 'C' LC_CTYPE 'C'",
    );
    console.log("✓ Database recreated with UTF-8 encoding");
  } finally {
    await admin.end();
  }
}

const EMBEDDED_URL_STATIC = "postgresql://sura:sura@127.0.0.1:5433/surashop";

async function ensureDatabase() {
  const url = process.env.DATABASE_URL;
  if (url) {
    try {
      const parsed = new URL(url);
      if (await canConnect(Number(parsed.port || 5432), parsed.hostname)) {
        syncDirectUrl();
        console.log(`✓ Using database from .env (${parsed.hostname}:${parsed.port || 5432})`);
        return;
      }
    } catch {
      /* invalid URL — fall through */
    }
  }
  const EMBEDDED_URL = "postgresql://sura:sura@127.0.0.1:5433/surashop";

  // A previous run may have left PostgreSQL running — reuse it rather than
  // fighting over the same data directory.
  if (await canConnect(5433)) {
    process.env.DATABASE_URL = EMBEDDED_URL;
    syncDirectUrl();
    setEnvFileValue("DATABASE_URL", EMBEDDED_URL);
    setEnvFileValue("DIRECT_URL", EMBEDDED_URL);
    console.log("✓ Reusing embedded PostgreSQL already running on port 5433");
    return;
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

  try {
    await embedded.start();
  } catch (err) {
    // Could be a stale lock from a hard shutdown; if it came up anyway, carry on.
    if (!(await canConnect(5433))) {
      embedded = null;
      throw new Error(
        "Could not start the local database. Close any other SURA SHOP window and try again. " +
          `(${err instanceof Error ? err.message : String(err)})`,
      );
    }
  }

  await ensureUtf8Database();
  process.env.DATABASE_URL = EMBEDDED_URL;
  syncDirectUrl();
  setEnvFileValue("DATABASE_URL", EMBEDDED_URL);
  setEnvFileValue("DIRECT_URL", EMBEDDED_URL);
  console.log("✓ Embedded PostgreSQL running on port 5433");
}

/** Install packages when package.json is newer than the installed tree. */
async function ensureDependencies() {
  const stamp = path.join(root, "node_modules", ".package-lock.json");
  const pkg = path.join(root, "package.json");
  const needsInstall =
    !existsSync(path.join(root, "node_modules")) ||
    !existsSync(stamp) ||
    statSync(pkg).mtimeMs > statSync(stamp).mtimeMs;

  if (needsInstall) {
    console.log("Dependencies changed — installing (this can take a few minutes)…");
    await run("npm", ["install", "--no-audit", "--no-fund"]);
  }
}

async function main() {
  await ensureDependencies();
  await ensureDatabase();

  const setupCurrent =
    existsSync(SETUP_MARKER) && readFileSync(SETUP_MARKER, "utf8").includes(SETUP_VERSION);

  if (FORCE_SETUP || !setupCurrent) {
    console.log("\nApplying database schema…");
    await run("npx", ["prisma", "db", "push", "--skip-generate"]);

    // The seed uses the generated client, so it must match the new schema.
    console.log("\nGenerating database client…");
    await run("npx", ["prisma", "generate"]);

    console.log("\nSeeding demo data (safe to re-run)…");
    try {
      await run("npx", ["tsx", "prisma/seed.ts"]);
    } catch {
      console.log("Seed step failed or already applied — continuing.");
    }
    writeFileSync(SETUP_MARKER, `${SETUP_VERSION} ${new Date().toISOString()}`);
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

  await freePort(3000);
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
  console.error("\n✗ Startup failed:", err instanceof Error ? err.message : String(err));
  console.error("Try running start-sura.bat again; if it persists, delete the .next folder and retry.");
  process.exitCode = 1;
});
