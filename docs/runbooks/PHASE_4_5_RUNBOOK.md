# Phases 4 & 5 — Packaging/Signing + Release Review

Run from the repo root. The `[me]` engineering is done; the remaining inputs are your
signing certificate (Phase 4) and the real payment + final sign-off (Phase 5).

## Phase 4 — Tauri packaging & signing

### 1. Icons (unblocks the build)
The config (`apps/desktop/src-tauri/tauri.conf.json`) expects the standard icon set
(`32x32.png`, `128x128.png`, `128x128@2x.png`, `icon.icns`, `icon.ico`). Generate them from
the provided 1024×1024 source:

```bash
# save the presented file as apps/desktop/src-tauri/icons/source.png, then:
cd apps/desktop
npx @tauri-apps/cli icon src-tauri/icons/source.png
```
That writes the full set into `src-tauri/icons/` (incl. `.icns` for macOS and `.ico` for Windows).

### 2. Signing config (committed)
`tauri.conf.json` now has `bundle.macOS` (hardenedRuntime + `entitlements.plist`) and
`bundle.windows` (sha256 + timestamp). The cert/identity come from **your** environment —
never hardcoded:

```bash
# macOS (Developer ID + notarization)
export APPLE_SIGNING_IDENTITY="Developer ID Application: Your Name (TEAMID)"
export APPLE_ID="you@example.com"
export APPLE_PASSWORD="app-specific-password"      # or APPLE_API_KEY / APPLE_API_ISSUER
export APPLE_TEAM_ID="TEAMID"

# Windows (if shipping .nsis) — set the cert thumbprint
export WINDOWS_CERTIFICATE_THUMBPRINT="...."
```

The evidence verifier reads only proof, not secrets. For a manual signing
review, attach these non-secret values before `npm run evidence:signing`:

```bash
export EVIDENCE_SIGNING_IDENTITY="Developer ID Application: Your Name (TEAMID)"
export EVIDENCE_NOTARIZATION_TICKET="notarytool-submission-or-stapler-citation"
export EVIDENCE_SIGNING_REVIEWER="Hemant"
```

These variables do not sign the app and do not replace `codesign`, Gatekeeper,
or stapler validation. They only attach reviewer/citation context to the report.

### 3. Build + evidence
```bash
cd apps/desktop
npm run build              # tauri build → signs + notarizes when the env above is set
npm run evidence           # tauri-build + bundle reports
npm run evidence:signing   # signing-notarization report (pass only on real codesign/notarytool output)
```
**Exit:** a signed, notarized artifact under `src-tauri/target/release/bundle/` + signing report `pass`.

## Phase 5 — Release review
Hemant is the registered reviewer/rollback owner (`_radio_index/reviewers.json`).
That file and `_radio_index/release-review-approvals.json` are local,
gitignored operator evidence. Import them when present; do not claim public repo
approval until the import has been run in the current workspace.

```bash
EVIDENCE_RELEASE_REVIEW_IMPORT="$(pwd)/_radio_index/release-review-approvals.json" npm run radio:release:review
```
**Expected:** `verified: 20, blocked: 3`. The three pending items are intentional and stay
blocked until their real evidence exists:
- `payment-gift` → one real settled payment (Phase 3).
- `installer` → a signed/notarized installer (Phase 4 build above).
- `release-review` → the final go-live sign-off, after the other gates pass.

To close them, append three approval records (same shape) with those keys once each is real,
then re-run. This is the fail-closed design working — the gate won't go green on an installer
or payment that doesn't exist yet.

Each approval row must include `reviewer`, `reviewedAt`, `citation`, `reason`,
`decision=approved`, and `auditVerified=true`.
