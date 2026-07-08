import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const repoRoot = process.cwd();

function read(file: string) {
  return fs.readFileSync(path.join(repoRoot, file), "utf8");
}

function readJson<T>(file: string): T {
  return JSON.parse(read(file)) as T;
}

describe("install channels", () => {
  it("registers a fail-closed install channel generator and source installer", () => {
    const pkg = readJson<{ scripts: Record<string, string> }>("package.json");
    const generator = read("scripts/build-install-channels.mjs");
    const installer = read("scripts/install-radio-vaigyaaniq.sh");

    expect(pkg.scripts["radio:install:channels"]).toBe("node scripts/build-install-channels.mjs");
    expect(generator).toContain("fabricatedDownloads: false");
    expect(generator).toContain("fabricatedStoreListings: false");
    expect(generator).toContain("fabricatedCloudLaunch: false");
    expect(installer).toContain("source-preview installer");
    expect(installer).toContain("not a signed desktop installer");
    expect(installer).toContain("npm run radio:install:channels");
  });

  it("publishes install channel data for web and desktop without fake downloads", () => {
    const web = readJson<{
      id: string;
      phkd: {
        fabricatedDownloads: boolean;
        fabricatedStoreListings: boolean;
        fabricatedCloudLaunch: boolean;
        releaseAllowed: boolean;
        productionReady: boolean;
      };
      counts: {
        channels: number;
        blocked: number;
        sourcePreview: number;
        available: number;
        discoveredInstallerArtifacts: number;
      };
      channels: Array<{ id: string; status: string; url: string | null; command: string | null }>;
    }>("apps/web/public/radio-html/data/install-channels.json");
    const desktop = readJson<{ id: string; counts: { channels: number } }>(
      "apps/desktop/public/radio-html/data/install-channels.json"
    );

    expect(web.id).toBe("radio-vaigyaaniq-install-channels");
    expect(desktop.id).toBe(web.id);
    expect(desktop.counts.channels).toBe(web.counts.channels);
    expect(web.phkd.fabricatedDownloads).toBe(false);
    expect(web.phkd.fabricatedStoreListings).toBe(false);
    expect(web.phkd.fabricatedCloudLaunch).toBe(false);
    expect(web.phkd.releaseAllowed).toBe(false);
    expect(web.phkd.productionReady).toBe(false);
    expect(web.counts.channels).toBe(6);
    expect(web.counts.blocked).toBe(4);
    expect(web.counts.sourcePreview).toBe(2);
    expect(web.counts.available).toBe(0);
    expect(web.counts.discoveredInstallerArtifacts).toBe(0);

    const channelById = new Map(web.channels.map((channel) => [channel.id, channel]));
    expect(channelById.get("download-desktop")?.status).toBe("blocked");
    expect(channelById.get("download-desktop")?.url).toBeNull();
    expect(channelById.get("launch-cloud")?.status).toBe("blocked");
    expect(channelById.get("launch-cloud")?.url).toBeNull();
    expect(channelById.get("apple-store")?.status).toBe("blocked");
    expect(channelById.get("apple-store")?.url).toBeNull();
    expect(channelById.get("play-store")?.status).toBe("blocked");
    expect(channelById.get("play-store")?.url).toBeNull();
    expect(channelById.get("install-github")?.status).toBe("source-preview");
    expect(channelById.get("install-github")?.command).toContain("git clone");
    expect(channelById.get("curl-install")?.status).toBe("source-preview");
    expect(channelById.get("curl-install")?.command).toContain("curl -fsSL");
  });

  it("ships HTML, TSV, public curl script, and route links", () => {
    const html = read("apps/web/public/radio-html/install.html");
    const tsv = read("apps/web/public/radio-html/data/install-channels.tsv");
    const publicInstaller = read("apps/web/public/radio-html/install-radio-vaigyaaniq.sh");
    const index = read("apps/web/public/radio-html/index.html");
    const standalone = read("apps/web/public/radio-html/standalone-radio.html");
    const lyricsBook = read("apps/web/public/radio-html/lyrics-book.html");
    const tauriSurface = read("apps/web/public/radio-html/surfaces/tauri-readiness.html");

    expect(html).toContain("Radio Vaigyaaniq Install");
    expect(html).toContain("install-data");
    expect(html).toContain("Download Desktop");
    expect(html).toContain("Apple Store");
    expect(html).toContain("Play Store");
    expect(tsv).toContain("id\tlabel\tstatus\tavailability");
    expect(publicInstaller).toContain("Radio Vaigyaaniq source-preview installer");
    expect(index).toContain("./install.html");
    expect(standalone).toContain("./install.html");
    expect(lyricsBook).toContain("./install.html");
    expect(tauriSurface).toContain("../install.html");
  });
});
