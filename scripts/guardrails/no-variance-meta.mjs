#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "../..");

const cmd = spawnSync("rg", ["-n", "varianceMeta|variance_meta", "app/"], {
  cwd: ROOT,
  encoding: "utf-8",
});

if (cmd.status === 0) {
  console.error("❌ varianceMeta guard failed. Matches found in app/:");
  console.error(cmd.stdout.trim());
  process.exit(1);
}

if (cmd.status === 1) {
  console.log("✅ varianceMeta guard passed (no matches in app/).");
  process.exit(0);
}

console.error("❌ varianceMeta guard could not run ripgrep.");
if (cmd.stderr) console.error(cmd.stderr.trim());
process.exit(2);
