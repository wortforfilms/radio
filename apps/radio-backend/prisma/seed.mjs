import fs from "node:fs";
import path from "node:path";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const manifestPath = path.resolve(
  process.cwd(),
  process.env.RADIO_ENGINE_MANIFEST || "../../apps/web/public/radio-html/data/radio-engine-manifest.json"
);
const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));

for (const station of manifest.stations) {
  await prisma.station.upsert({
    where: { slug: station.slug },
    update: {
      name: station.name,
      description: station.description,
      streamUrl: station.streamUrl,
      streamStatus: station.streamStatus,
      fallbackUrl: station.fallbackUrl,
      cover: station.cover,
      liveStreamVerified: Boolean(station.evidence?.liveStreamVerified),
      rightsVerified: Boolean(station.evidence?.rightsVerified)
    },
    create: {
      id: station.id,
      slug: station.slug,
      name: station.name,
      description: station.description,
      streamUrl: station.streamUrl,
      streamStatus: station.streamStatus,
      fallbackUrl: station.fallbackUrl,
      cover: station.cover,
      liveStreamVerified: Boolean(station.evidence?.liveStreamVerified),
      rightsVerified: Boolean(station.evidence?.rightsVerified)
    }
  });

  for (const program of station.programs || []) {
    await prisma.program.upsert({
      where: { id: program.id },
      update: {
        stationId: station.id,
        trackId: program.trackId,
        title: program.title,
        description: program.description,
        startTime: program.startTime,
        endTime: program.endTime,
        estimatedStartOffsetSeconds: program.estimatedStartOffsetSeconds,
        durationSeconds: program.durationSeconds,
        audioUrl: program.audioUrl,
        coverUrl: program.coverUrl,
        isLive: program.isLive,
        sequenceIndex: program.sequenceIndex,
        scheduleVerificationState: program.scheduleVerificationState,
        rightsStatus: program.rightsStatus,
        releaseAllowed: program.releaseAllowed
      },
      create: {
        id: program.id,
        stationId: station.id,
        trackId: program.trackId,
        title: program.title,
        description: program.description,
        startTime: program.startTime,
        endTime: program.endTime,
        estimatedStartOffsetSeconds: program.estimatedStartOffsetSeconds,
        durationSeconds: program.durationSeconds,
        audioUrl: program.audioUrl,
        coverUrl: program.coverUrl,
        isLive: program.isLive,
        sequenceIndex: program.sequenceIndex,
        scheduleVerificationState: program.scheduleVerificationState,
        rightsStatus: program.rightsStatus,
        releaseAllowed: program.releaseAllowed
      }
    });
  }
}

console.log(`Seeded ${manifest.stations.length} stations and ${manifest.counts.programs} programs`);
await prisma.$disconnect();
