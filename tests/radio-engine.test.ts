import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  ALL_ACCESS_PRICE,
  DEFAULT_PREVIEW_SECONDS,
  DEFAULT_SINGLE_PRICE,
  canPlayFull,
  checkoutSummary,
  formatMoney,
  trackAccessState,
  trackPriceMinor,
  walletBalance,
  type EntitlementLike,
  type TrackLike,
} from "@shared/commerce";

const repoRoot = process.cwd();

function read(file: string) {
  return fs.readFileSync(path.join(repoRoot, file), "utf8");
}

function readJson<T>(file: string): T {
  return JSON.parse(read(file)) as T;
}

describe("radio online offline engine", () => {
  it("registers generator, offline sync, and backend scripts", () => {
    const pkg = readJson<{ scripts: Record<string, string> }>("package.json");
    const generator = read("scripts/build-radio-engine-manifest.mjs");
    const offline = read("scripts/download-offline-assets.mjs");

    expect(pkg.scripts["radio:engine:manifest"]).toBe(
      "node scripts/build-radio-engine-manifest.mjs"
    );
    expect(pkg.scripts["radio:offline:sync"]).toBe("node scripts/download-offline-assets.mjs");
    expect(pkg.scripts["radio:backend:start"]).toBe("node apps/radio-backend/server.js");
    expect(pkg.scripts["radio:backend:test-streams"]).toBe(
      "ENABLE_TEST_STREAMS=1 node apps/radio-backend/server.js"
    );
    expect(generator).toContain("liveStreamsVerified: false");
    expect(generator).toContain("adInsertionMode: \"blocked-no-verified-ad-inventory\"");
    expect(generator).toContain("standalone-engine-dock");
    expect(offline).toContain("--allow-remote");
    expect(offline).toContain("commercialRightsVerified: false");
  });

  it("publishes a fail-closed engine manifest for web and desktop", () => {
    const web = readJson<{
      id: string;
      phkd: {
        fabricatedStations: boolean;
        liveStreamsVerified: boolean;
        commercialRightsVerified: boolean;
        adRightsVerified: boolean;
        weatherProviderVerified: boolean;
      };
      counts: {
        playableTracks: number;
        stations: number;
        programs: number;
        ads: number;
        weatherProviders: number;
      };
      stations: Array<{
        streamUrl: string | null;
        programs: Array<{ startTime: string | null; releaseAllowed: boolean; audioUrl: string }>;
      }>;
    }>("apps/web/public/radio-html/data/radio-engine-manifest.json");
    const desktop = readJson<{ id: string; counts: { programs: number } }>(
      "apps/desktop/public/radio-html/data/radio-engine-manifest.json"
    );

    expect(web.id).toBe("radio-vaigyaaniq-online-offline-engine");
    expect(desktop.id).toBe(web.id);
    expect(desktop.counts.programs).toBe(web.counts.programs);
    expect(web.phkd.fabricatedStations).toBe(false);
    expect(web.phkd.liveStreamsVerified).toBe(false);
    expect(web.phkd.commercialRightsVerified).toBe(false);
    expect(web.phkd.adRightsVerified).toBe(false);
    expect(web.phkd.weatherProviderVerified).toBe(false);
    expect(web.counts.playableTracks).toBeGreaterThan(1000);
    expect(web.counts.stations).toBeGreaterThanOrEqual(6);
    expect(web.counts.programs).toBe(web.counts.playableTracks);
    expect(web.counts.ads).toBe(0);
    expect(web.counts.weatherProviders).toBe(0);
    expect(web.stations.every((station) => station.streamUrl === null)).toBe(true);
    expect(web.stations.some((station) => station.programs.length > 0)).toBe(true);
    expect(web.stations[0].programs[0].startTime).toBe(null);
    expect(web.stations[0].programs[0].releaseAllowed).toBe(false);
    expect(web.stations[0].programs[0].audioUrl).toContain("/radio-html/assets/audio/");
  });

  it("ships engine UI, runtime JS, service worker, and offline cache manifests", () => {
    const html = read("apps/web/public/radio-html/online-offline-radio-engine.html");
    const desktopHtml = read("apps/desktop/public/radio-html/online-offline-radio-engine.html");
    const runtime = read("apps/web/public/radio-html/assets/js/radio-engine.js");
    const desktopRuntime = read("apps/desktop/public/radio-html/assets/js/radio-engine.js");
    const serviceWorker = read("apps/web/public/radio-html/sw.js");
    const index = read("apps/web/public/radio-html/index.html");
    const standalone = read("apps/web/public/radio-html/standalone-radio.html");
    const offline = readJson<{
      counts: { requestedEntries: number; localExisting: number; missing: number };
      phkd: { remoteDownloadsAllowed: boolean; commercialRightsVerified: boolean };
    }>("apps/web/public/radio-html/data/offline-cache-manifest.json");

    expect(html).toContain("Online / Offline Radio Engine");
    expect(html).toContain("./assets/js/radio-engine.js");
    expect(desktopHtml).toContain("Online / Offline Radio Engine");
    expect(runtime).toContain("class RadioEngine");
    expect(runtime).toContain("Ad insertion blocked");
    expect(runtime).toContain("playLiveStream");
    expect(runtime).toBe(desktopRuntime);
    expect(serviceWorker).toContain("radio-audio");
    expect(serviceWorker).toContain("staleWhileRevalidate");
    expect(serviceWorker).toContain("radio-engine-offline-bundle.json");
    expect(index).toContain("./online-offline-radio-engine.html");
    expect(standalone).toContain("./online-offline-radio-engine.html");
    expect(standalone).toContain("standalone-engine-dock");
    expect(standalone).toContain("enginePlayLive");
    expect(offline.phkd.remoteDownloadsAllowed).toBe(false);
    expect(offline.phkd.commercialRightsVerified).toBe(false);
    expect(offline.counts.requestedEntries).toBeGreaterThan(1000);
    expect(offline.counts.localExisting).toBe(offline.counts.requestedEntries);
    expect(offline.counts.missing).toBe(0);
  });

  it("adds the backend API scaffold without forcing fake data", () => {
    const server = read("apps/radio-backend/server.js");
    const schema = read("apps/radio-backend/prisma/schema.prisma");
    const env = read("apps/radio-backend/.env.example");
    const streams = readJson<{
      enabledByDefault: boolean;
      phkd: { commercialRightsVerified: boolean; rebroadcastRightsVerified: boolean };
      candidates: Array<{ stationSlug: string; streamUrl: string; status: string }>;
    }>("apps/web/public/radio-html/data/radio-stream-candidates.json");

    expect(server).toContain("app.get(\"/api/stations\"");
    expect(server).toContain("app.get(\"/api/schedule/:stationSlug\"");
    expect(server).toContain("app.get(\"/api/ads\"");
    expect(server).toContain("app.get(\"/api/weather\"");
    expect(server).toContain("app.get(\"/api/stream-candidates\"");
    expect(server).toContain("ENABLE_TEST_STREAMS");
    expect(server).toContain("blocked-provider-null");
    expect(schema).toContain("streamUrl         String?");
    expect(schema).toContain("startTime                  DateTime?");
    expect(schema).toContain("rightsStatus               String?");
    expect(env).toContain("WEATHER_API_KEY=");
    expect(env).toContain("WEATHER_CITY=Delhi");
    expect(env).toContain("ENABLE_TEST_STREAMS=0");
    expect(streams.enabledByDefault).toBe(false);
    expect(streams.phkd.commercialRightsVerified).toBe(false);
    expect(streams.phkd.rebroadcastRightsVerified).toBe(false);
    expect(streams.candidates.length).toBeGreaterThanOrEqual(4);
    expect(streams.candidates.some((candidate) => candidate.streamUrl.includes("somafm.com"))).toBe(
      true
    );
    expect(streams.candidates.every((candidate) => candidate.status.includes("candidate"))).toBe(
      true
    );
  });
});

describe("radio engine commerce integration", () => {
  const paidTrack: TrackLike = { id: "t1", albumId: "a1", published: true };
  const unpublished: TrackLike = { id: "t2", published: false };
  const trackEnt: EntitlementLike[] = [{ scope: "track", trackId: "t1" }];
  const allAccess: EntitlementLike[] = [{ scope: "all_access" }];

  it("enforces fail-closed access states from @shared/commerce", () => {
    expect(trackAccessState([], paidTrack)).toBe("preview");
    expect(trackAccessState(trackEnt, paidTrack)).toBe("full");
    expect(trackAccessState(allAccess, paidTrack)).toBe("full");
    // unpublished tracks are locked even with an entitlement — rights gate wins
    expect(canPlayFull(trackEnt, { ...unpublished, id: "t1" } as TrackLike)).toBe(false);
    expect(trackAccessState([], unpublished)).toBe("locked");
    expect(trackAccessState([{ scope: "track", trackId: "t1", active: false }], paidTrack)).toBe("preview");
  });

  it("prices and wallet math match the shared defaults", () => {
    expect(trackPriceMinor({ id: "x" }, "INR")).toBe(2900);
    expect(trackPriceMinor({ id: "x" }, "USD")).toBe(99);
    expect(formatMoney(DEFAULT_SINGLE_PRICE.INR, "INR")).toBe("₹29.00");
    expect(formatMoney(ALL_ACCESS_PRICE.USD, "USD")).toBe("$9.99");
    expect(DEFAULT_PREVIEW_SECONDS).toBe(45);
    expect(walletBalance([{ currency: "INR", balance: 5000 }], "INR")).toBe(5000);
    expect(walletBalance([], "USD")).toBe(0);
    const summary = checkoutSummary(
      [{ productType: "track", amountMinor: 2900, currency: "INR" }],
      "INR",
      1000
    );
    expect(summary).toEqual({ subtotalMinor: 2900, walletAppliedMinor: 1000, dueMinor: 1900, currency: "INR" });
  });

  it("inlines the same commerce rules and personas in the browser engine", () => {
    const runtime = read("apps/web/public/radio-html/assets/js/radio-engine.js");
    // constants mirrored from packages/shared/src/commerce.ts
    expect(runtime).toContain("DEFAULT_SINGLE_PRICE = { INR: 2900, USD: 99 }");
    expect(runtime).toContain("ALL_ACCESS_PRICE = { INR: 29900, USD: 999 }");
    expect(runtime).toContain("DEFAULT_PREVIEW_SECONDS = 45");
    expect(runtime).toContain("trackAccessState");
    expect(runtime).toContain("canPlayFull");
    expect(runtime).toContain("walletBalance");
    // rights-aware playback + purchase lane
    expect(runtime).toContain("previewLimitSeconds");
    expect(runtime).toContain("/api/payments/order");
    expect(runtime).toContain("No entitlement until the signature-verified Razorpay webhook");
    expect(runtime).toContain("/api/entitlements/");
    // TTS personas
    expect(runtime).toContain("maataa");
    expect(runtime).toContain("rishi");
    expect(runtime).toContain("samaya");
    expect(runtime).toContain("vigyaaniq");
    // offline outbox + background sync
    expect(runtime).toContain("flushOutbox");
    expect(runtime).toContain("radio-outbox");
    expect(runtime).toContain("gift-intent");
  });

  it("publishes commerce and free-tier fields in the manifest", () => {
    const manifest = readJson<{
      commerce: { mode: string; previewSecondsDefault: number; singlePriceMinor: { INR: number; USD: number } };
      counts: { freeTracks: number; playableTracks: number };
      offlineBundle: {
        songs: Array<{ freeTier: boolean; offlinePolicy: string; previewSeconds: number; published: boolean }>;
      };
    }>("apps/web/public/radio-html/data/radio-engine-manifest.json");

    expect(manifest.commerce.mode).toBe("operator-demo");
    expect(manifest.commerce.previewSecondsDefault).toBe(45);
    expect(manifest.commerce.singlePriceMinor).toEqual({ INR: 2900, USD: 99 });
    expect(manifest.counts.freeTracks).toBeGreaterThanOrEqual(7 * 2 - 2); // ~2 per station
    expect(manifest.counts.freeTracks).toBeLessThan(30);
    const songs = manifest.offlineBundle.songs;
    expect(songs.length).toBe(manifest.counts.playableTracks);
    expect(songs.every((song) => song.previewSeconds === 45)).toBe(true);
    // rights lane stays fail-closed until rights closure publishes tracks
    expect(songs.every((song) => song.published === false)).toBe(true);
    expect(songs.filter((song) => song.freeTier).every((song) => song.offlinePolicy === "full")).toBe(true);
    expect(
      songs.filter((song) => !song.freeTier).every((song) => song.offlinePolicy.startsWith("preview"))
    ).toBe(true);
  });

  it("keeps the backend a thin rights-aware proxy over the Next.js API", () => {
    const server = read("apps/radio-backend/server.js");
    expect(server).toContain("NEXT_API_BASE");
    expect(server).toContain("/api/payments/");
    expect(server).toContain("proxyToNext");
    expect(server).toContain("app.get(\"/api/entitlements/:userId\"");
    expect(server).toContain("app.post(\"/api/sync\"");
    expect(server).toContain("blocked-entitlement-source-null");
    expect(server).toContain("full-entitled");
    expect(server).toContain("preview-clamp-45s");
    expect(server).toContain("x-razorpay-signature");
    // never duplicate pricing/order logic locally
    expect(server).not.toContain("createRazorpayOrder");
  });

  it("ships an offline-capable, sync-aware service worker and UI", () => {
    const serviceWorker = read("apps/web/public/radio-html/sw.js");
    const html = read("apps/web/public/radio-html/online-offline-radio-engine.html");

    expect(serviceWorker).toContain("radio-outbox");
    expect(serviceWorker).toContain("flush-outbox");
    expect(serviceWorker).toContain("cache-urls");
    // payment/order state must never be served from cache
    expect(serviceWorker).toContain("/api/payments/");

    expect(html).toContain("id=\"walletBox\"");
    expect(html).toContain("id=\"walletTopUp\"");
    expect(html).toContain("id=\"catalogGrid\"");
    expect(html).toContain("id=\"catalogSearch\"");
    expect(html).toContain("id=\"personaSelect\"");
    expect(html).toContain("id=\"netStatus\"");
    expect(html).toContain("id=\"lyricsPanel\"");
    expect(html).toContain("id=\"weatherBox\"");
    expect(html).toContain("id=\"buyCurrent\"");
  });

  it("keeps the offline cache plan rights-aware with zero missing refs", () => {
    const offline = readJson<{
      counts: {
        requestedEntries: number;
        localExisting: number;
        missing: number;
        byPolicy: Record<string, number>;
      };
      phkd: { remoteDownloadsAllowed: boolean; publicBuild: boolean };
    }>("apps/web/public/radio-html/data/offline-cache-manifest.json");

    expect(offline.counts.missing).toBe(0);
    expect(offline.counts.localExisting).toBe(offline.counts.requestedEntries);
    expect(offline.phkd.publicBuild).toBe(false);
    expect(offline.counts.byPolicy.full).toBeGreaterThan(0);
    expect(
      Object.keys(offline.counts.byPolicy).every((key) =>
        ["full", "full-entitled", "preview-clip", "preview-clamp-45s", "ad"].includes(key)
      )
    ).toBe(true);
  });
});
