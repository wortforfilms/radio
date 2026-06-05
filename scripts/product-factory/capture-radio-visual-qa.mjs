import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";

const baseUrl = process.env.RADIO_VISUAL_QA_BASE_URL || "http://127.0.0.1:3000";
const visualQaPath = path.resolve("apps/web/public/radio-html/data/visual-qa.json");
const webScreenshotDir = path.resolve("apps/web/public/radio-html/qa/screenshots");
const desktopDataPath = path.resolve("apps/desktop/public/radio-html/data/visual-qa.json");
const desktopScreenshotDir = path.resolve("apps/desktop/public/radio-html/qa/screenshots");
const packageJson = process.env.PLAYWRIGHT_PACKAGE_JSON;
const captureAll = process.env.RADIO_VISUAL_QA_CAPTURE_ALL === "1";

async function loadPlaywright() {
  try {
    return await import("playwright");
  } catch (error) {
    if (!packageJson) {
      throw new Error(`Playwright is not installed in this workspace. Set PLAYWRIGHT_PACKAGE_JSON to a Playwright package.json path. Original error: ${error.message}`);
    }
    return createRequire(packageJson)("playwright");
  }
}

function slugify(target) {
  return target.slug || target.path.split("/").pop().replace(/\.html$/, "").replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "").toLowerCase();
}

function copyEvidenceToDesktop() {
  if (!fs.existsSync("apps/desktop/public/radio-html")) return;
  fs.mkdirSync(path.dirname(desktopDataPath), { recursive: true });
  fs.copyFileSync(visualQaPath, desktopDataPath);
  fs.mkdirSync(desktopScreenshotDir, { recursive: true });
  for (const file of fs.readdirSync(webScreenshotDir)) {
    if (file.endsWith(".png")) fs.copyFileSync(path.join(webScreenshotDir, file), path.join(desktopScreenshotDir, file));
  }
}

const visualQa = JSON.parse(fs.readFileSync(visualQaPath, "utf8"));
fs.mkdirSync(webScreenshotDir, { recursive: true });

const pendingTargets = visualQa.targets.filter((target) => captureAll || target.renderStatus !== "pass" || !target.screenshot);
const { chromium } = await loadPlaywright();
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 1 });
const mobileContext = await browser.newContext({ viewport: { width: 390, height: 1000 }, deviceScaleFactor: 1 });

const results = [];
for (const target of pendingTargets) {
  const slug = slugify(target);
  const url = new URL(target.path, baseUrl).toString();
  const page = await context.newPage();
  const response = await page.goto(url, { waitUntil: "networkidle", timeout: 30000 });
  const desktop = await page.evaluate(() => ({
    imageCount: document.images.length,
    brokenImages: Array.from(document.images).filter((img) => !img.complete || img.naturalWidth === 0).map((img) => img.getAttribute("src")),
    textLength: document.body.innerText.length
  }));
  await page.screenshot({ path: path.join(webScreenshotDir, `${slug}.png`), fullPage: true });
  await page.close();

  const mobilePage = await mobileContext.newPage();
  await mobilePage.goto(url, { waitUntil: "networkidle", timeout: 30000 });
  const mobile = await mobilePage.evaluate(() => {
    const doc = document.documentElement;
    return {
      hasHorizontalOverflow: doc.scrollWidth > doc.clientWidth + 1,
      brokenImages: Array.from(document.images).filter((img) => !img.complete || img.naturalWidth === 0).map((img) => img.getAttribute("src"))
    };
  });
  await mobilePage.close();

  const ok = Boolean(response?.ok()) && desktop.brokenImages.length === 0 && mobile.brokenImages.length === 0 && !mobile.hasHorizontalOverflow;
  Object.assign(target, {
    screenshot: `/radio-html/qa/screenshots/${slug}.png`,
    renderStatus: ok ? "pass" : "blocked",
    linkStatus: response?.ok() ? "pass" : `http-${response?.status() ?? "NULL"}`,
    imageStatus: desktop.brokenImages.length === 0 && mobile.brokenImages.length === 0 ? "pass" : "blocked",
    mobileStatus: mobile.hasHorizontalOverflow ? "blocked-overflow" : "pass",
    notes: `Captured 2026-06-05 at ${url}`,
    slug
  });
  results.push({ title: target.title, path: target.path, ok, status: response?.status() ?? null, slug });
}

await browser.close();

visualQa.counts = {
  targets: visualQa.targets.length,
  capturedScreenshots: visualQa.targets.filter((target) => target.screenshot).length,
  pass: visualQa.targets.filter((target) => target.renderStatus === "pass").length,
  blocked: visualQa.targets.filter((target) => target.renderStatus === "blocked").length
};

fs.writeFileSync(visualQaPath, `${JSON.stringify(visualQa, null, 2)}\n`);
copyEvidenceToDesktop();

console.log(JSON.stringify({
  baseUrl,
  captured: results.length,
  counts: visualQa.counts,
  results
}, null, 2));

if (visualQa.counts.blocked > 0) process.exit(1);
