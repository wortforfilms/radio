# Claude Prompt: Ship Radio Vaigyaaniq Full Tauri

You are a senior desktop platform architect and Tauri release engineer.

Objective:
Create a production-oriented, fail-closed Tauri desktop shipping scaffold for Radio Vaigyaaniq in this repository.

Repository context:
- Active web app: `apps/web`
- Radio HTML archive: `apps/web/public/radio-html`
- Structure map: `apps/web/public/radio-html/structure/index.html`
- Future structure manifest: `apps/web/public/radio-html/Radio_Vaigyaaniq_Future_Structure.json`
- Legacy/reference Tauri scaffold: `_radio_index/tauri_app/src-tauri`
- Target desktop app: `apps/desktop`

PHKD rules:
- Do not fabricate completed builds, installer quality, audio behavior, telemetry, payment, or release readiness.
- Mark unknown values as `NULL`.
- Preserve provenance for copied assets and generated reports.
- Fail closed when evidence is missing.
- Do not claim production ready unless installer evidence, build logs, hashes, platform metadata, and smoke-test evidence exist.
- Do not move current public HTML URLs unless compatibility shim pages preserve existing paths.

Required output:
1. Scaffold `apps/desktop`.
2. Add a Tauri app shell that can open the Radio archive and app entrypoints.
3. Bundle or copy `apps/web/public/radio-html` into the desktop public assets.
4. Add least-privilege Tauri capabilities.
5. Add Rust commands for evidence, storage, and bundle metadata.
6. Add desktop-safe local storage paths.
7. Add evidence report writers:
   - `apps/desktop/evidence/tauri-build-report.json`
   - `apps/desktop/evidence/bundle-report.json`
   - `apps/desktop/evidence/qa-report.json`
8. Add scripts for:
   - desktop dev
   - desktop build
   - cargo check
   - evidence generation
9. Add README instructions for local dev, build, QA, and release blocking rules.
10. Preserve the existing `apps/web` build and tests.

Target file structure:

```text
apps/desktop/
  package.json
  index.html
  src/
    main.tsx
    app-shell.tsx
    radio-bridge.ts
  src-tauri/
    Cargo.toml
    build.rs
    tauri.conf.json
    capabilities/
      default.json
    icons/
    src/
      main.rs
      commands.rs
      evidence.rs
      storage.rs
  public/
    radio-html/
  evidence/
    tauri-build-report.json
    bundle-report.json
    qa-report.json
  README.md
```

Shipping gates:
1. `npm test`
2. `npm run build`
3. `cargo check` inside `apps/desktop/src-tauri`
4. Tauri dev smoke test
5. Tauri bundle build
6. Bundle hash recorded
7. Platform metadata recorded
8. Source commit recorded
9. Installer opens successfully
10. QA report records pass, fail, blocked, or not-run for every gate

Implementation constraints:
- Use existing project patterns where possible.
- Do not delete or relocate current Radio HTML files.
- Do not commit AppleDouble `._*` files.
- Keep capabilities minimal.
- Prefer explicit JSON evidence over prose-only claims.
- If any dependency or system tool is unavailable, create a blocked evidence entry rather than pretending success.

Expected final response:
- List created/updated files.
- List commands run and their actual results.
- List blocked gates with exact reason.
- State whether the desktop app is `draft`, `blocked`, or `verified`.
- Include commit hash only after the commit exists.
