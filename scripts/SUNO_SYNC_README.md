# Suno Library Sync

Pulls your full personal Suno library into the local radio index — **audio, cover art, lyrics, and styles** — and updates the catalog + manifest. No Suno login or token is needed by the script: the audio CDN (`cdn1.suno.ai/<id>.mp3`) serves by clip id.

## 1. Get the catalog export

A catalog of all your tracks (1,453 as of this run) was exported to:

```
~/Downloads/suno-catalog.json
```

It contains every track's id, title, lyrics, styles/tags, duration, created date, model, and media URLs.

> To re-export later: open https://suno.com/me while logged in and run the export snippet (ask Claude for it), or just re-run with the existing file.

## 2. Run the sync

From the repo root (`for_radio`):

```bash
node scripts/suno-sync.mjs ~/Downloads/suno-catalog.json
```

If you move `suno-catalog.json` into the repo root or `_radio_index/`, you can run it with no argument — it auto-discovers the file (checks repo root, `_radio_index/`, then `~/Downloads`).

### Options

| Flag | Effect |
|------|--------|
| `--no-audio` | metadata + covers + lyrics only (no mp3s) |
| `--no-covers` | skip cover art |
| `--no-lyrics` | skip lyrics .txt files |
| `--no-manifest` | write the standalone catalog but don't touch `audio-import-manifest.json` |
| `--concurrency 8` | parallel downloads (default 6) |

The script is **idempotent** — existing files are skipped, so re-running only fetches what's still missing ("download all remaining"). Safe to interrupt and resume.

## 3. What it writes

```
_radio_index/suno_backup/
  audio/<id>.mp3          # full library audio
  covers/<id>.jpeg        # cover art
  lyrics/<id>.txt         # title + styles + lyrics
  suno-catalog.json       # copy of the source export

apps/web/public/radio-html/data/
  suno-library-catalog.json   # standalone indexed catalog
  suno-library-catalog.csv    # same, spreadsheet-friendly
  audio-import-manifest.json  # merged: +suno imports (fail-closed)
apps/desktop/public/radio-html/data/   # same three files
```

## PHKD / fail-closed note

Merged Suno tracks are added with `rightsStatus: "NULL"`, `canPlay: false`,
`releaseAllowed: false`, `status: "blocked"` — consistent with the existing
manifest. The sync **indexes** your library; it does **not** assert rights,
payment, review, or release readiness. Those gates stay closed until real
evidence is supplied.

> Heads-up: the milestone generator scripts (`complete-radio-*.mjs`) regenerate
> `audio-import-manifest.json` from their own sources. If you re-run them, the
> Suno imports may be overwritten. Ask Claude to wire the Suno source into the
> generator if you want the merge to survive regeneration.
