-- Radio media storage separation.
-- Database stores metadata, checksums, evidence, and object URIs only.
-- Binary media bytes stay in RADIO_MEDIA_ROOT or object storage.

CREATE TABLE "StorageProvider" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "rootUri" TEXT NOT NULL,
    "publicBaseUri" TEXT,
    "region" TEXT,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "failClosed" BOOLEAN NOT NULL DEFAULT true,
    "provenanceNote" TEXT,
    "sourceCitation" TEXT,
    "verificationStatus" TEXT NOT NULL DEFAULT 'UNVERIFIED',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

CREATE TABLE "MediaObject" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "providerId" TEXT NOT NULL,
    "mediaAssetId" TEXT,
    "objectKey" TEXT NOT NULL,
    "storageUri" TEXT NOT NULL,
    "publicUri" TEXT,
    "mediaKind" TEXT NOT NULL,
    "mimeType" TEXT,
    "byteSize" INTEGER,
    "checksumSha256" TEXT,
    "durationSeconds" INTEGER,
    "rightsStatus" TEXT NOT NULL DEFAULT 'UNKNOWN',
    "evidenceUri" TEXT,
    "provenanceNote" TEXT,
    "sourceCitation" TEXT,
    "verificationStatus" TEXT NOT NULL DEFAULT 'UNVERIFIED',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "MediaObject_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "StorageProvider" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "MediaObject_mediaAssetId_fkey" FOREIGN KEY ("mediaAssetId") REFERENCES "MediaAsset" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE TABLE "RadioTrackMediaLink" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "radioTrackId" TEXT NOT NULL,
    "mediaObjectId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "RadioTrackMediaLink_radioTrackId_fkey" FOREIGN KEY ("radioTrackId") REFERENCES "RadioTrack" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "RadioTrackMediaLink_mediaObjectId_fkey" FOREIGN KEY ("mediaObjectId") REFERENCES "MediaObject" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "StorageProvider_slug_key" ON "StorageProvider"("slug");
CREATE INDEX "StorageProvider_kind_idx" ON "StorageProvider"("kind");
CREATE INDEX "StorageProvider_isPrimary_idx" ON "StorageProvider"("isPrimary");
CREATE INDEX "StorageProvider_verificationStatus_idx" ON "StorageProvider"("verificationStatus");

CREATE UNIQUE INDEX "MediaObject_providerId_objectKey_key" ON "MediaObject"("providerId", "objectKey");
CREATE INDEX "MediaObject_mediaAssetId_idx" ON "MediaObject"("mediaAssetId");
CREATE INDEX "MediaObject_mediaKind_idx" ON "MediaObject"("mediaKind");
CREATE INDEX "MediaObject_checksumSha256_idx" ON "MediaObject"("checksumSha256");
CREATE INDEX "MediaObject_rightsStatus_idx" ON "MediaObject"("rightsStatus");
CREATE INDEX "MediaObject_verificationStatus_idx" ON "MediaObject"("verificationStatus");

CREATE UNIQUE INDEX "RadioTrackMediaLink_radioTrackId_mediaObjectId_role_key" ON "RadioTrackMediaLink"("radioTrackId", "mediaObjectId", "role");
CREATE INDEX "RadioTrackMediaLink_radioTrackId_idx" ON "RadioTrackMediaLink"("radioTrackId");
CREATE INDEX "RadioTrackMediaLink_mediaObjectId_idx" ON "RadioTrackMediaLink"("mediaObjectId");
CREATE INDEX "RadioTrackMediaLink_role_idx" ON "RadioTrackMediaLink"("role");
CREATE INDEX "RadioTrackMediaLink_isPrimary_idx" ON "RadioTrackMediaLink"("isPrimary");
