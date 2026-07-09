# Radio Media Storage and Database Separation

Status: blocked until `RADIO_MEDIA_ROOT` is configured outside this Git workspace and tracked runtime audio is migrated.

## Local workspace layout (sanitised 2026-07-09)

Loose media is consolidated under the gitignored `storage/media/` root:

- `storage/media/root-exports/` — 133 named mp3 exports formerly loose at the
  repo root (~730 MB). `INDEX.json` lists each file with probable catalogue
  matches by title (24 identified) for future dedupe/promotion decisions.
- `storage/media/external/` — the former `_non_suno/` folder (20 files, ~123 MB).
  ⚠ Contains third-party/commercial audio — must NEVER enter the served
  catalogue, any offline bundle, or a release. `INDEX.json` carries the warning.
- `_radio_index/` — untouched: Suno source archive + evidence lanes (gitignored).
- macOS `._*` sidecars and stale office locks are purged; they regenerate on
  external drives — re-run `find . -name '._*' ! -path './.git/*' -delete`
  when git or builders complain.

## Boundary

Database storage:

- SQLite local: `DATABASE_URL=file:./dev.db`
- Optional production: PostgreSQL in a production branch
- Stores metadata, rights evidence, audit logs, checksums, object keys, storage URIs, and public URIs
- Never stores audio bytes, cover bytes, video bytes, model binaries, or generated waveform blobs

Media storage:

- Local filesystem: `RADIO_MEDIA_PROVIDER=local_fs`
- Object storage options: `s3`, `r2`, `gcs`, `azure_blob`, `ipfs`
- Required root: `RADIO_MEDIA_ROOT`
- Optional public base: `RADIO_MEDIA_PUBLIC_BASE`
- Stores audio, covers, generated images, video, waveform sidecars, 3D assets, and other binary artifacts

Git storage:

- Stores source code, schemas, migrations, manifest JSON, evidence JSON, tests, and small UI assets
- Does not store catalogue imports, promoted audio mirrors, or generated media libraries

## Prisma Models

- `StorageProvider`: storage backend identity and root URI
- `MediaObject`: object key, URI, checksum, byte size, rights status, verification state
- `RadioTrackMediaLink`: role-based link from radio tracks to media objects
- `MediaAsset`: generic knowledge/media asset metadata
- `AuditLog`: verification and mutation audit trail

## Local Setup

```bash
cp .env.example .env
mkdir -p /Volumes/LaCie/pprm/radio-media/{audio,covers,waveforms,video,models}
npm run radio:storage:audit
```

The audit writes:

- `apps/web/public/radio-html/data/media-storage-separation.json`
- `apps/desktop/public/radio-html/data/media-storage-separation.json`

## PHKD Rules

- Unknown source, checksum, rights, or verification values stay `NULL` or `UNKNOWN`.
- No release is allowed when `RADIO_MEDIA_ROOT` is missing or points inside the Git workspace.
- No media is marked verified without rights evidence and checksum evidence.
- Tracked runtime audio is a release blocker until it is migrated to `MediaObject`.
