export const storageArchitecture = {
  local: {
    database: "SQLite",
    url: "DATABASE_URL=file:./dev.db",
    use: "default local runtime, tests, offline archive",
    stores: "metadata, indexes, evidence, audit rows, object URIs"
  },
  optionalProduction: {
    database: "PostgreSQL",
    url: "DATABASE_URL=postgresql://...",
    use: "multi-user deployment; switch prisma datasource provider to postgresql in a production branch",
    stores: "metadata, indexes, evidence, audit rows, object URIs"
  },
  media: {
    rootEnv: "RADIO_MEDIA_ROOT",
    publicBaseEnv: "RADIO_MEDIA_PUBLIC_BASE",
    providerEnv: "RADIO_MEDIA_PROVIDER",
    defaultProvider: "local_fs",
    stores: "audio, covers, video, generated images, waveform sidecars, 3D binaries",
    dbRule: "Database rows must reference media by storageUri/publicUri/checksum only; binary media blobs are not stored in SQLite/PostgreSQL.",
    gitRule: "Large media roots stay ignored; promoted preview mirrors are generated artifacts, not source."
  },
  importFormats: ["JSON", "CSV", "Markdown", "HKD"],
  exportFormats: ["JSON", "CSV", "GraphML", "Markdown", "HKD"],
  packages: ["apps/web", "packages/graph", "packages/search", "packages/runtime", "packages/shared"]
} as const;

export type MediaStorageProviderKind =
  | "local_fs"
  | "s3"
  | "r2"
  | "gcs"
  | "azure_blob"
  | "ipfs";

export type MediaStorageConfig = {
  databaseUrl: string | null;
  mediaRoot: string | null;
  mediaPublicBase: string | null;
  provider: MediaStorageProviderKind;
  releaseAllowed: boolean;
  verificationState: string;
  blockers: string[];
};

const providerKinds = new Set<MediaStorageProviderKind>([
  "local_fs",
  "s3",
  "r2",
  "gcs",
  "azure_blob",
  "ipfs"
]);

function normalizeProvider(value: string | undefined): MediaStorageProviderKind {
  if (value && providerKinds.has(value as MediaStorageProviderKind)) {
    return value as MediaStorageProviderKind;
  }
  return "local_fs";
}

function isInsideRepo(mediaRoot: string, repoRoot: string) {
  const root = mediaRoot.replace(/\/+$/, "");
  const repo = repoRoot.replace(/\/+$/, "");
  return root === repo || root.startsWith(`${repo}/`);
}

export function resolveMediaStorageConfig(
  env: Record<string, string | undefined> = process.env,
  repoRoot = process.cwd()
): MediaStorageConfig {
  const databaseUrl = env.DATABASE_URL || null;
  const mediaRoot = env.RADIO_MEDIA_ROOT || null;
  const mediaPublicBase = env.RADIO_MEDIA_PUBLIC_BASE || null;
  const provider = normalizeProvider(env.RADIO_MEDIA_PROVIDER);
  const blockers: string[] = [];

  if (!databaseUrl) {
    blockers.push("DATABASE_URL is not configured");
  }
  if (!mediaRoot) {
    blockers.push("RADIO_MEDIA_ROOT is not configured");
  }
  if (mediaRoot && provider === "local_fs" && isInsideRepo(mediaRoot, repoRoot)) {
    blockers.push("RADIO_MEDIA_ROOT points inside the Git workspace");
  }
  if (!mediaPublicBase && provider !== "local_fs") {
    blockers.push("RADIO_MEDIA_PUBLIC_BASE is required for object-storage providers");
  }

  return {
    databaseUrl,
    mediaRoot,
    mediaPublicBase,
    provider,
    releaseAllowed: blockers.length === 0,
    verificationState: blockers.length === 0 ? "configured" : "blocked-storage-config",
    blockers
  };
}

export function assertMediaStorageSeparated(config = resolveMediaStorageConfig()) {
  if (!config.releaseAllowed) {
    throw new Error(`MEDIA_STORAGE_FAIL_CLOSED: ${config.blockers.join("; ")}`);
  }
  return config;
}

export const mediaStoragePolicy = {
  id: "radio-media-storage-separation",
  phkdRules: [
    "No binary media blobs in SQLite/PostgreSQL.",
    "No promoted audio mirrors committed to Git.",
    "Every media object needs source, rights status, checksum or NULL, and verification state.",
    "Release fails closed when RADIO_MEDIA_ROOT is missing or points inside the Git workspace."
  ],
  databaseModels: ["StorageProvider", "MediaObject", "RadioTrackMediaLink", "MediaAsset", "AuditLog"],
  objectRoles: ["audio", "preview", "cover", "lyrics", "waveform", "stems", "video", "model"],
  requiredEnv: ["DATABASE_URL", "RADIO_MEDIA_ROOT"],
  optionalEnv: ["RADIO_MEDIA_PUBLIC_BASE", "RADIO_MEDIA_PROVIDER"]
} as const;
