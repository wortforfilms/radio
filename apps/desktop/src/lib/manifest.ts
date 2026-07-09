// Loads the REAL engine manifest (radio-html/data) for the SPA panes.
// Everything rendered comes from these artifacts — no fabricated content.
import type { SpaTrack } from "../store/player-store";

export interface ManifestStation {
  slug: string;
  name: string;
  description?: string;
  region?: string;
  streamUrl: string | null;
  totalPrograms: number;
  programs: Array<{
    trackId: string;
    title: string;
    stylizedTitle?: string;
    audioUrl: string;
    coverUrl?: string | null;
    freeTier?: boolean;
    previewSeconds?: number;
    durationSeconds?: number | null;
    version?: string;
  }>;
  evidence?: { liveStreamVerified?: boolean };
}

export interface EngineManifest {
  generatedAt: string;
  counts: Record<string, number>;
  commerce?: { previewSecondsDefault?: number };
  stations: ManifestStation[];
  phkd?: Record<string, unknown>;
}

const rel = (url: string | null | undefined): string => String(url || "").replace(/^\/radio-html\//, "./radio-html/");

export async function loadManifest(): Promise<EngineManifest> {
  const response = await fetch("./radio-html/data/radio-engine-manifest.json", { cache: "no-cache" });
  if (!response.ok) throw new Error(`manifest ${response.status}`);
  return (await response.json()) as EngineManifest;
}

/** Rights-aware SPA tracks for one station (entitlements: local free-tier only in the SPA MVP). */
export function stationTracks(station: ManifestStation): SpaTrack[] {
  return (station.programs || [])
    .filter((program) => program.audioUrl)
    .map((program) => ({
      id: program.trackId,
      title: program.title,
      subtitle: `${station.name}${program.version && program.version !== "original" ? ` · ${program.version}` : ""}`,
      audioUrl: rel(program.audioUrl),
      coverUrl: program.coverUrl ? rel(program.coverUrl) : null,
      freeTier: program.freeTier === true,
      previewSeconds: program.previewSeconds ?? 45,
      access: program.freeTier === true ? "full" : "preview",
      live: Boolean(station.streamUrl && station.evidence?.liveStreamVerified) // none today — honest
    }));
}

/** Real offline cache status via the Cache Storage API + the offline manifest. */
export async function offlineCacheStatus(): Promise<{ caches: number; entries: number | null; manifest: { requested: number; local: number } | null }> {
  let cacheCount = 0;
  let entryCount: number | null = null;
  try {
    if ("caches" in window) {
      const keys = await caches.keys();
      cacheCount = keys.filter((key) => key.startsWith("radio-")).length;
      entryCount = 0;
      for (const key of keys) {
        if (!key.startsWith("radio-")) continue;
        entryCount += (await (await caches.open(key)).keys()).length;
      }
    }
  } catch {
    entryCount = null;
  }
  let manifest: { requested: number; local: number } | null = null;
  try {
    const response = await fetch("./radio-html/data/offline-cache-manifest.json", { cache: "force-cache" });
    if (response.ok) {
      const data = (await response.json()) as { counts: { requestedEntries: number; localExisting: number } };
      manifest = { requested: data.counts.requestedEntries, local: data.counts.localExisting };
    }
  } catch {
    manifest = null;
  }
  return { caches: cacheCount, entries: entryCount, manifest };
}
