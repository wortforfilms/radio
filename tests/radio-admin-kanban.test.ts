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

describe("radio admin kanban", () => {
  it("registers the admin kanban generator", () => {
    const pkg = readJson<{ scripts: Record<string, string> }>("package.json");
    const script = read("scripts/build-radio-admin-kanban.mjs");

    expect(pkg.scripts["radio:admin:kanban"]).toBe("node scripts/build-radio-admin-kanban.mjs");
    expect(script).toContain("radio-admin-kanban.json");
    expect(script).toContain("Drag/drop assignments are local admin draft");
    expect(script).toContain("localStorage");
  });

  it("publishes album, station, and label boards for web and desktop", () => {
    const web = readJson<{
      phkd: { writesDatabase: boolean; localStorageOnly: boolean; fabricatedTracks: boolean };
      counts: { tracks: number; albumLanes: number; stationLanes: number; labelLanes: number };
      boards: {
        albums: { lanes: Array<{ id: string; trackIds: string[] }> };
        stations: { lanes: Array<{ id: string; trackIds: string[] }> };
        labels: { lanes: Array<{ id: string; trackIds: string[] }> };
      };
    }>("apps/web/public/radio-html/data/radio-admin-kanban.json");
    const desktop = readJson<{ counts: { tracks: number } }>(
      "apps/desktop/public/radio-html/data/radio-admin-kanban.json"
    );

    expect(web.phkd.writesDatabase).toBe(false);
    expect(web.phkd.localStorageOnly).toBe(true);
    expect(web.phkd.fabricatedTracks).toBe(false);
    expect(web.counts.tracks).toBeGreaterThan(1000);
    expect(desktop.counts.tracks).toBe(web.counts.tracks);
    expect(web.counts.albumLanes).toBeGreaterThanOrEqual(20);
    expect(web.counts.stationLanes).toBeGreaterThanOrEqual(4);
    expect(web.counts.labelLanes).toBeGreaterThanOrEqual(6);
    expect(web.boards.albums.lanes.some((lane) => lane.trackIds.length > 0)).toBe(true);
    expect(web.boards.stations.lanes.some((lane) => lane.id === "gurukul")).toBe(true);
    expect(web.boards.labels.lanes.some((lane) => lane.id === "lyrics-null")).toBe(true);
  });

  it("ships a drag/drop HTML admin surface and export TSV", () => {
    const html = read("apps/web/public/radio-html/admin-kanban.html");
    const desktopHtml = read("apps/desktop/public/radio-html/admin-kanban.html");
    const tsv = read("apps/web/public/radio-html/data/radio-admin-kanban.tsv");
    const index = read("apps/web/public/radio-html/index.html");
    const standalone = read("apps/web/public/radio-html/standalone-radio.html");

    expect(html).toContain("Radio Admin Kanban");
    expect(html).toContain("draggable=\"true\"");
    expect(html).toContain("Export JSON");
    expect(html).toContain("radio-admin-kanban-v1");
    expect(desktopHtml).toContain("Radio Admin Kanban");
    expect(tsv).toContain("board\tlaneId\tlaneTitle\ttrackId");
    expect(index).toContain("./admin-kanban.html");
    expect(standalone).toContain("./admin-kanban.html");
  });
});
