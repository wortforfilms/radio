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
  scripts/generate-evidence.mjs
  evidence/       tauri-build-report.json  bundle-report.json  qa-report.json
```

The web build/tests in `apps/web` are untouched. The Radio HTML in
`apps/web/public/radio-html` is **not** moved; it is copied here, and existing public
URLs are preserved.

## Local dev

```bash
cd apps/desktop
npm install            # needs network (npm registry)
npm run fe:dev         # vite frontend on http://localhost:1420 (browser preview)
npm run dev            # tauri dev — full desktop window (needs Rust + tauri CLI)
```

## Build

```bash
npm run build          # tauri build → native installer in src-tauri/target/release/bundle
```

## QA / evidence

```bash
npm run cargo:check    # cargo check inside src-tauri
npm run evidence       # writes evidence/*.json with real gate statuses
```

`scripts/generate-evidence.mjs` records **pass / fail / blocked / not-run** for every
gate and writes:
- `evidence/tauri-build-report.json` — toolchain, frontend/cargo/tauri gate results.
- `evidence/bundle-report.json` — bundle/installer hashes (NULL until built) + copied-asset provenance (sha256).
- `evidence/qa-report.json` — all shipping gates with a verdict.

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
