# Phase 2 — Rights Closure Runbook

Two rights lanes gate the release. Both are **fail-closed**: nothing is asserted verified
without a **named human reviewer**. The scripts pre-fill everything derivable; you supply
the sign-off via `--reviewer "<your name>"`. Run all commands from the repo root
(`/Volumes/LaCie/pprm/for_radio`).

---

## Lane A — Asset-evidence rights (the wired `radio:rights:closure` gate)
Covers the 19 interface assets in `Radio_Vaigyaaniq_Asset_Evidence.json` (hero PNGs,
cover SVGs, icons, shaders, the audio placeholder, and the two Three.js vendor files).
Owner assets → VESAHE proprietary; the two `three.js` files → MIT attribution (accurate,
not owner-claimed).

**Reviewer onboarded:** Hemant (Producer, VESAHE) — see `_radio_index/reviewers.json`. The
signed proof `_radio_index/rights-proof-assets.json` is already committed (all 19 records,
`rightsStatus=verified`, reviewer Hemant). A verifier simulation passes 0 blocked.

1. **Close the gate** (the proof is pre-signed — just import + verify):
   ```bash
   EVIDENCE_RIGHTS_IMPORT="$(pwd)/_radio_index/rights-proof-assets.json" npm run radio:rights:closure
   ```
   Expect `gate.status: "pass"` and `summary.blocked: 0`. The verifier writes
   `rights-closure-report.json` and flips `rights-evidence.json` to `rights-closed-verified`.

   To regenerate the proof under a different reviewer:
   `npm run radio:rights:proof -- --reviewer "Name"` (omit `--reviewer` for a blocked draft).

---

## Lane B — Audio track rights (promotion → playable)
Covers the 1,186 catalogue tracks. Approving a track here lets the promotion script publish
its audio + cover and flip `canPlay`.

1. **Build the reviewer-approved list** (`--reviewer` required — emitting the list is the
   sign-off):
   ```bash
   npm run radio:verified:list -- --reviewer "Your Name"            # all 1,186
   # or a curated first wave:
   npm run radio:verified:list -- --reviewer "Your Name" --label "Magic Mushrooms"
   npm run radio:verified:list -- --reviewer "Your Name" --limit 105
   ```
   Writes `_radio_index/verified_v1.csv` (suno_id, reviewer, reviewedAt, license, citation).

2. **Promote (dry-run first, then live):**
   ```bash
   node scripts/promote-verified-tracks.mjs --dry-run --verified-list _radio_index/verified_v1.csv
   npm run radio:promote -- --verified-list _radio_index/verified_v1.csv
   ```
   Copies audio + covers into the served layer, sets `publicPath`, and flips `canPlay=true`
   only for the approved, checksummed tracks.

3. **Roll evidence forward:**
   ```bash
   npm run radio:playback:gate
   npm run radio:release:check
   ```

---

## Order of operations (critical path Phase 0 → 2)
```
npm run dev:clean          # Phase 0 — clean boot (done)
npm run radio:rights:proof -- --reviewer "Your Name"          # Lane A sign-off
EVIDENCE_RIGHTS_IMPORT="$(pwd)/_radio_index/rights-proof-assets.json" npm run radio:rights:closure
npm run radio:verified:list -- --reviewer "Your Name"         # Lane B sign-off
npm run radio:promote -- --verified-list _radio_index/verified_v1.csv
npm run radio:playback:gate && npm run radio:release:check
```

## What's automated vs yours
- **Automated (done):** proof generation, accurate per-asset licence/creator/source/citation,
  checksum matching, CSV/JSON in the verifier's schema, promotion + gate wiring.
- **Yours (the only human input):** the reviewer name on each lane. That single act is what
  the fail-closed design requires — it is deliberately not fabricated.
