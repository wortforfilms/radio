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

describe("radio full tree detail surface", () => {
  it("registers the full tree generator", () => {
    const pkg = readJson<{ scripts: Record<string, string> }>("package.json");
    const script = read("scripts/build-radio-tree-detail.mjs");

    expect(pkg.scripts["radio:tree:detail"]).toBe("node scripts/build-radio-tree-detail.mjs");
    expect(script).toContain("full-tree-detail.json");
    expect(script).toContain("full-tree-detail.tsv");
    expect(script).toContain("omittedAppleDouble");
  });

  it("publishes detailed web and desktop tree data", () => {
    const web = readJson<{
      id: string;
      phkd: { fabricatedFiles: boolean; fabricatedRoutes: boolean };
      counts: {
        repositoryFiles: number;
        radioHtmlFiles: number;
        desktopRadioHtmlFiles: number;
        omittedAppleDouble: number;
      };
      radioHtml: {
        files: Array<{ path: string; route: string | null; category: string; sizeBytes: number }>;
        categoryCounts: Array<{ category: string; count: number }>;
      };
    }>("apps/web/public/radio-html/data/full-tree-detail.json");
    const desktop = readJson<{ id: string; counts: { radioHtmlFiles: number } }>(
      "apps/desktop/public/radio-html/data/full-tree-detail.json"
    );

    expect(web.id).toBe("radio-vaigyaaniq-full-tree-detail");
    expect(desktop.id).toBe(web.id);
    expect(desktop.counts.radioHtmlFiles).toBe(web.counts.radioHtmlFiles);
    expect(web.phkd.fabricatedFiles).toBe(false);
    expect(web.phkd.fabricatedRoutes).toBe(false);
    expect(web.counts.repositoryFiles).toBeGreaterThan(web.counts.radioHtmlFiles);
    expect(web.counts.radioHtmlFiles).toBeGreaterThan(2000);
    expect(web.counts.desktopRadioHtmlFiles).toBeGreaterThan(2000);
    expect(web.counts.omittedAppleDouble).toBeGreaterThan(0);

    expect(web.radioHtml.files).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          path: "apps/web/public/radio-html/standalone-radio.html",
          route: "/radio-html/standalone-radio.html",
          category: "app-html"
        }),
        expect.objectContaining({
          path: "apps/web/public/radio-html/data/lyrics-prompter-data.json",
          route: "/radio-html/data/lyrics-prompter-data.json",
          category: "data"
        })
      ])
    );
    expect(web.radioHtml.categoryCounts.some((row) => row.category === "audio")).toBe(true);
    expect(web.radioHtml.categoryCounts.some((row) => row.category === "cover")).toBe(true);
  });

  it("ships browsable HTML, TSV, index links, and standalone links", () => {
    const html = read("apps/web/public/radio-html/full-tree-detail.html");
    const desktopHtml = read("apps/desktop/public/radio-html/full-tree-detail.html");
    const tsv = read("apps/web/public/radio-html/data/full-tree-detail.tsv");
    const index = read("apps/web/public/radio-html/index.html");
    const standalone = read("apps/web/public/radio-html/standalone-radio.html");

    expect(html).toContain("Full Tree Detail");
    expect(html).toContain("./data/full-tree-detail.json");
    expect(html).toContain("Load local JSON");
    expect(desktopHtml).toContain("Full Tree Detail");
    expect(tsv).toContain("path\tparent\tname\textension\tcategory");
    expect(index).toContain("./full-tree-detail.html");
    expect(standalone).toContain("./full-tree-detail.html");
  });
});
