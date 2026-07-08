import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  assertMediaStorageSeparated,
  mediaStoragePolicy,
  resolveMediaStorageConfig,
  storageArchitecture
} from "@runtime/storage";

const repoRoot = process.cwd();

function read(file: string) {
  return fs.readFileSync(path.join(repoRoot, file), "utf8");
}

function readJson<T>(file: string): T {
  return JSON.parse(read(file)) as T;
}

describe("media storage and database separation", () => {
  it("documents database as metadata-only and media as external storage", () => {
    expect(storageArchitecture.local.stores).toContain("metadata");
    expect(storageArchitecture.media.dbRule).toContain("binary media blobs are not stored");
    expect(mediaStoragePolicy.databaseModels).toEqual(
      expect.arrayContaining(["StorageProvider", "MediaObject", "RadioTrackMediaLink"])
    );
  });

  it("fails closed when media storage is not configured", () => {
    const config = resolveMediaStorageConfig({}, repoRoot);
    expect(config.releaseAllowed).toBe(false);
    expect(config.blockers).toContain("DATABASE_URL is not configured");
    expect(config.blockers).toContain("RADIO_MEDIA_ROOT is not configured");
    expect(() => assertMediaStorageSeparated(config)).toThrow("MEDIA_STORAGE_FAIL_CLOSED");
  });

  it("fails closed when media storage points inside the repository", () => {
    const config = resolveMediaStorageConfig(
      {
        DATABASE_URL: "file:./dev.db",
        RADIO_MEDIA_ROOT: path.join(repoRoot, "media")
      },
      repoRoot
    );
    expect(config.releaseAllowed).toBe(false);
    expect(config.blockers).toContain("RADIO_MEDIA_ROOT points inside the Git workspace");
  });

  it("allows an explicit media root outside the repository", () => {
    const config = resolveMediaStorageConfig(
      {
        DATABASE_URL: "file:./dev.db",
        RADIO_MEDIA_ROOT: "/Volumes/LaCie/pprm/radio-media"
      },
      repoRoot
    );
    expect(config).toMatchObject({
      provider: "local_fs",
      releaseAllowed: true,
      verificationState: "configured"
    });
  });

  it("adds Prisma models and migration for object storage metadata", () => {
    const schema = read("prisma/schema.prisma");
    const migration = read("prisma/migrations/20260627000000_media_storage_separation/migration.sql");
    expect(schema).toContain("model StorageProvider");
    expect(schema).toContain("model MediaObject");
    expect(schema).toContain("model RadioTrackMediaLink");
    expect(migration).toContain('CREATE TABLE "StorageProvider"');
    expect(migration).toContain('CREATE TABLE "MediaObject"');
    expect(migration).toContain('CREATE TABLE "RadioTrackMediaLink"');
  });

  it("keeps local media and database paths ignored", () => {
    const gitignore = read(".gitignore");
    expect(gitignore).toContain("media/");
    expect(gitignore).toContain("storage/media/");
    expect(gitignore).toContain("storage/db/");
    expect(gitignore).toContain("*.sqlite-wal");
  });

  it("publishes a fail-closed media storage manifest for web and desktop", () => {
    const web = readJson<{
      id: string;
      releaseAllowed: boolean;
      trackedMedia: { total: number; runtimeAudioCount: number };
      scope: { database: { neverStores: string[] }; mediaStorage: { rootEnv: string } };
    }>("apps/web/public/radio-html/data/media-storage-separation.json");
    const desktop = readJson<{ id: string }>(
      "apps/desktop/public/radio-html/data/media-storage-separation.json"
    );

    expect(web.id).toBe("radio-media-storage-separation");
    expect(desktop.id).toBe(web.id);
    expect(web.releaseAllowed).toBe(false);
    expect(web.scope.database.neverStores).toContain("audio bytes");
    expect(web.scope.mediaStorage.rootEnv).toBe("RADIO_MEDIA_ROOT");
    expect(web.trackedMedia.total).toBeGreaterThanOrEqual(web.trackedMedia.runtimeAudioCount);
  });
});
