# Radio Vaigyaaniq — Track Onboarding SOP

How a single track moves from any source — Suno, a human studio/live recording, or another platform — to release-ready in the radio catalogue.
**Fail-closed principle:** `canPlay` stays `false` until *every* gate below is verified on real evidence — never fabricated.

Tool: open **Track Onboarding** in the app (`/radio-html/Track_Onboarding.html`, also linked from the Radio landing). It applies the rules in this SOP automatically and emits a manifest-ready record.

Owner tags: **[ops]** = anyone running intake/metadata · **[reviewer]** = named release reviewer · **[legal]** = rights sign-off.

---

## Stage 1 — Asset intake  [ops]
Goal: the audio (and cover/lyrics) exist locally with a checksum. **Suno is just one source** — a track can equally be a human studio/live recording or come from another platform.

- **Suno (AI):** add the clip ID to `_radio_index/suno-catalog.json` (or a fresh export from suno.com/me) and run `node scripts/suno-sync.mjs` from the repo root (idempotent). Writes to `_radio_index/suno_backup/{audio,covers,lyrics}/<id>.{mp3,jpeg,txt}` and records a SHA-256.
- **Human recording / other platform / local file:** place the audio at `_radio_index/imports/audio/<track-id>.mp3` (cover/lyrics alongside) and record its hash with `shasum -a 256 <file>`.

In the tool, pick the **Source platform**, give the track a **Track ID / slug** (used for filenames) and a **Source reference** (URL, platform ID, session, or original filename), then enter title, duration, release date, checksum, and the present toggles.

**Gate:** audio file present **and** checksum recorded.

## Stage 2 — Metadata & credits  [ops]
Goal: every track carries consistent, correct credits.

| Field | Value / rule |
|---|---|
| Lyricist | Advocate Dev Lohan, **P.H.K.D.** (default), or Amir24 |
| **Label** | **Magic Mushrooms** if lyricist = Advocate Dev Lohan; otherwise **P.H.K.D.** |
| Music by | **hkfaduio** (all tracks) |
| Performer / Artist | **P.H.K.D.** |
| Producer | **VESAHE Film Solutions Private Limited** |
| Show / Theme | one of the nine themes (Sanatan & Vedic, Bhakti & Katha, Haryanvi Folk, …) |
| Genre / Styles | free text |

The tool derives Label automatically from Lyricist; the rest are pre-filled. This matches `_radio_index/Credits_Labels_Master.csv`.

**Gate:** lyricist set, label derived, show/theme chosen.

## Stage 3 — Rights closure  [legal] [reviewer]
Goal: documented ownership + a named human sign-off. This is the unblocker for playback.

Every shipping track needs: `source, license, citation, reviewer, reviewedAt, auditVerified, releaseAllowed`.

1. **Self-declaration signed** — declarant attests original authorship/ownership (see `_radio_index/Rights_Declarations_and_Agreements.docx`).
2. **Live agreement executed** — the relevant lyrics / music / performer / label agreement is on file; the track is listed in its **Schedule A** (`_radio_index/Schedule_A_Track_Lists.xlsx`).
3. **Audit verified** — source + checksum + provenance reconciled.
4. Record **license** terms and **citation/source**.
5. **Reviewer** (named) records sign-off with a **reviewedAt** date → **release allowed**.
6. Run `npm run radio:rights:closure` → verify 0 blocked.

**Gate:** `rightsStatus = verified` and `releaseAllowed = true`.

## Stage 4 — Station & playlist assignment  [ops]
Goal: the track lands in the right show.

1. Pick the playlist/station (`01_Sanatan_Cosmos` … `10_Intros_Loops_&_Sketches`) and track number.
2. Add the audio path to the matching `_radio_index/playlists/*.m3u8`.

**Gate:** assigned to at least one playlist.

---

## The canPlay gate
`canPlay = audio present · checksum · rights verified · reviewer sign-off · release allowed`.
If any is missing, the tool reports the blocker and `verificationState` stays `draft` or `blocked`. Only when all are true does `status` become `release-ready`.

## Output & wiring
The tool emits a JSON import record matching `apps/*/public/radio-html/data/audio-import-manifest.json` → `imports[]`. Append it there (web + desktop copies stay in sync via the sync/gate scripts), then re-run `npm run radio:playback:gate` and `npm run radio:release:check` to roll the evidence forward.

## Quick reference
- Tool: `/radio-html/Track_Onboarding.html`
- Catalogue/credits: `_radio_index/Credits_Labels_Master.csv`
- Rights docs: `_radio_index/Rights_Declarations_and_Agreements.docx`, `Schedule_A_Track_Lists.xlsx`
- Checklist: `_radio_index/Track_Onboarding_Checklist.pdf`
- Scripts: `suno-sync.mjs`, `radio:rights:closure`, `radio:playback:gate`, `radio:release:check`
