# Radio Vaigyaaniq — Desktop (Tauri)

Fail-closed Tauri desktop shell for Radio Vaigyaaniq. Opens the Radio HTML archive
entrypoints and exposes least-privilege native commands (bundle metadata, evidence,
storage). **This is a draft scaffold — not a verified release.**

## Layout

```
apps/desktop/
  package.json  vite.config.ts  tsconfig.json  index.html
  src/            main.tsx  app-shell.tsx  radio-bridge.ts
  src-tauri/      Cargo.toml  build.rs  tauri.conf.json
                  capabilities/default.json   icons/   src/{main,commands,evidence,storage}.rs
  public/radio-html/   (copy of apps/web/public/radio-html — provenance in evidence/bundle-report.json)
  scripts/        generate-evidence.mjs  tauri-build.mjs
  evidence/       tauri-build-report.json  bundle-report.json  qa-report.json
```

The web build/tests in `apps/web` are untouched. The Radio HTML in
`apps/web/public/radio-html` is **not** moved; it is copied here, and existing public
URLs are preserved.

## Local dev

```bash
cd apps/desktop
npm run fe:dev         # vite frontend on http://localhost:1420 (browser preview)
npm run dev            # cargo tauri dev; full desktop window (needs Rust + Tauri CLI)
```

## Build

```bash
npm run build          # platform-aware cargo tauri build
```

`scripts/tauri-build.mjs` chooses local bundle targets by platform:
- macOS: `app` (`TAURI_BUNDLES=app,dmg` for DMG release-host runs)
- Windows: `msi,nsis`
- Linux: `deb,appimage`

To avoid macOS AppleDouble `._*` sidecars on external volumes, the wrapper sets
`CARGO_TARGET_DIR` to the OS temp directory by default
(`radio-vaigyaaniq-desktop-target`). The exact artifact directory is written to
`evidence/bundle-report.json`. Override with `CARGO_TARGET_DIR=<path>` and
`TAURI_BUNDLES=<comma-list>` when running on a release host.

## QA / evidence

```bash
npm run cargo:check    # cargo check inside src-tauri
npm run evidence       # builds + hashes the bundle, then writes evidence/*.json
```

When the Tauri CLI is present, `npm run evidence` first runs repo-level `npm test`
and `npm run build`, then **actually invokes Tauri build**
(via `npm run build`), then walks `src-tauri/target/release/bundle/`, sha256-hashes
every produced artifact (`.dmg` / `.app` / `.exe` / `.msi` / `.AppImage` / `.deb` …),
and records the primary installer hash as `bundle_hash`. The full build log tail is
saved to `evidence/tauri-build.log`. If the CLI is absent, the bundle gate stays
**blocked** — never faked.

Env flags:
- `EVIDENCE_SKIP_ROOT_BUILD=1` — don't invoke repo-level `npm run build`.
- `EVIDENCE_ROOT_BUILD_TIMEOUT_MS=<ms>` — root build timeout (default 180000 = 3 min).
- `EVIDENCE_SKIP_BUILD=1` — don't invoke the build; only scan any pre-existing artifacts (fast re-runs).
- `EVIDENCE_BUILD_TIMEOUT_MS=<ms>` — build timeout (default 1800000 = 30 min); a timeout records **not-run**.
- `TAURI_BUNDLES=<comma-list>` — override platform bundle targets.
- `CARGO_TARGET_DIR=<path>` — override the temp Cargo target directory.

`scripts/generate-evidence.mjs` records **pass / fail / blocked / not-run** for every
gate and writes:
- `evidence/tauri-build-report.json` — toolchain, frontend/cargo/tauri gate results.
- `evidence/bundle-report.json` — per-artifact sha256 + sizes, `bundle_hash`, `bundle_platform`, build status/log tail, + copied-asset provenance.
- `evidence/qa-report.json` — all shipping gates with a verdict, release blockers, and `ship_decision`.

The bundle build (gate 5) reaches **pass** only when `tauri build` exits 0 **and** at
least one installer artifact is found; bundle hash (gate 6) passes when artifacts are
hashed; installer-opens (gate 9) is recorded **not-run** with the built artifact path,
since launching the installer is a manual/GUI step this script does not fake.

The QA report also records release blockers for signing/notarization, audio rights,
gift/payment proof, and human release review. These remain **blocked** until real
evidence exists, even when local build gates pass.

## Release-blocking rules (PHKD, fail-closed)

A build is **draft** until, and **must not** be called production-ready unless, ALL of
these have recorded evidence:

1. `npm test` — pass
2. `npm run build` — pass
3. `cargo check` (src-tauri) — pass
4. Tauri dev smoke test — pass
5. Tauri bundle build — pass
6. Bundle hash recorded
7. Platform metadata recorded (of the real build host, not the evidence host)
8. Source commit recorded
9. Installer opens successfully — verified
10. QA report records pass/fail/blocked/not-run for every gate

Do not fabricate completed builds, installer quality, audio behaviour, telemetry,
payment, or release readiness. Unknown values are NULL. Missing tools produce a
**blocked** evidence entry — never a faked pass.

## Known NULL / not-bundled

- **Media library** (audio + cover assets, multi-GB) is **not** bundled. Playback in the
  desktop shell requires a configured local library path — until then it is NULL.
- Auth, payments, telemetry, and entitlement enforcement are **not** implemented.
