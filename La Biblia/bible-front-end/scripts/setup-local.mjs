/**
 * One-shot local setup: Docker (Postgres + Typesense), Prisma migrate, import, verse words, Typesense sync.
 * Run from repo root: npm run setup:local
 * Requires: Docker Desktop running, Node/npm installed.
 */
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
process.chdir(root);

function sleep(seconds) {
  if (process.platform === "win32") {
    execSync(`powershell -NoProfile -Command "Start-Sleep -Seconds ${seconds}"`, {
      stdio: "ignore",
    });
  } else {
    execSync(`sleep ${seconds}`, { stdio: "ignore" });
  }
}

function run(cmd) {
  console.log("\n>", cmd, "\n");
  execSync(cmd, { stdio: "inherit", shell: true });
}

const envPath = path.join(root, ".env");
const examplePath = path.join(root, ".env.example");
if (!fs.existsSync(envPath) && fs.existsSync(examplePath)) {
  fs.copyFileSync(examplePath, envPath);
  console.log("Created .env from .env.example");
}

run("docker compose up -d");

console.log("\nWaiting for Postgres…");
let ready = false;
for (let i = 0; i < 45; i++) {
  try {
    execSync("docker compose exec -T postgres pg_isready -U bible", {
      stdio: "pipe",
      shell: true,
    });
    ready = true;
    break;
  } catch {
    sleep(2);
  }
}
if (!ready) {
  console.error("Postgres did not become ready. Is Docker running?");
  process.exit(1);
}
console.log("Postgres is ready.");

sleep(2);

run("npx prisma migrate deploy");
run("npm run import:bible");
run("npm run verse-words");
run("npm run typesense:sync");

console.log("\nSetup finished. Start the app with: npm run dev\n");
