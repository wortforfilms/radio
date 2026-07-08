# Radio Media Storage and Database Separation

Status: blocked until `RADIO_MEDIA_ROOT` is configured outside this Git workspace and tracked runtime audio is migrated.

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
