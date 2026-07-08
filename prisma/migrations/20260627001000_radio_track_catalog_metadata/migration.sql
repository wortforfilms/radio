-- Radio catalog metadata import fields.
-- Lyrics are textual metadata; binary audio/cover bytes remain in MediaObject storage.

ALTER TABLE "RadioTrack" ADD COLUMN "styles" TEXT;
ALTER TABLE "RadioTrack" ADD COLUMN "lyricsText" TEXT;
ALTER TABLE "RadioTrack" ADD COLUMN "lyricsBody" TEXT;
ALTER TABLE "RadioTrack" ADD COLUMN "lyricsPath" TEXT;
ALTER TABLE "RadioTrack" ADD COLUMN "metadataJson" TEXT;
ALTER TABLE "RadioTrack" ADD COLUMN "catalogSource" TEXT;
ALTER TABLE "RadioTrack" ADD COLUMN "sourceCreatedAt" DATETIME;
ALTER TABLE "RadioTrack" ADD COLUMN "durationSeconds" INTEGER;
ALTER TABLE "RadioTrack" ADD COLUMN "durationLabel" TEXT;
ALTER TABLE "RadioTrack" ADD COLUMN "sourceModel" TEXT;
ALTER TABLE "RadioTrack" ADD COLUMN "playCount" INTEGER;
ALTER TABLE "RadioTrack" ADD COLUMN "instrumental" BOOLEAN;
ALTER TABLE "RadioTrack" ADD COLUMN "sourceAudioPath" TEXT;
ALTER TABLE "RadioTrack" ADD COLUMN "sourceCoverPath" TEXT;
ALTER TABLE "RadioTrack" ADD COLUMN "sourceChecksum" TEXT;
ALTER TABLE "RadioTrack" ADD COLUMN "sourceBytes" INTEGER;
ALTER TABLE "RadioTrack" ADD COLUMN "publicPath" TEXT;
ALTER TABLE "RadioTrack" ADD COLUMN "coverPublicPath" TEXT;
ALTER TABLE "RadioTrack" ADD COLUMN "canPlay" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "RadioTrack" ADD COLUMN "rightsStatus" TEXT NOT NULL DEFAULT 'UNKNOWN';
ALTER TABLE "RadioTrack" ADD COLUMN "verificationState" TEXT NOT NULL DEFAULT 'SOURCE_CATALOG';

CREATE INDEX "RadioTrack_styles_idx" ON "RadioTrack"("styles");
CREATE INDEX "RadioTrack_sourceCreatedAt_idx" ON "RadioTrack"("sourceCreatedAt");
CREATE INDEX "RadioTrack_canPlay_idx" ON "RadioTrack"("canPlay");
CREATE INDEX "RadioTrack_rightsStatus_idx" ON "RadioTrack"("rightsStatus");
CREATE INDEX "RadioTrack_verificationState_idx" ON "RadioTrack"("verificationState");
