#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const platformBundles = {
  darwin: "app",
  win32: "msi,nsis",
  linux: "deb,appimage"
};

const bundles = process.env.TAURI_BUNDLES ?? platformBundles[process.platform] ?? "all";
const args = ["tauri", "build", "--bundles", bundles];
const cargoTargetDir = process.env.CARGO_TARGET_DIR || path.join(os.tmpdir(), "radio-vaigyaaniq-desktop-target");
const result = spawnSync("cargo", args, {
  cwd: fileURLToPath(new URL("..", import.meta.url)),
  env: { ...process.env, COPYFILE_DISABLE: "1", CARGO_TARGET_DIR: cargoTargetDir },
  stdio: "inherit"
});

if (result.error) {
  console.error(result.error.message);
  process.exit(1);
}

process.exit(result.status ?? 1);
