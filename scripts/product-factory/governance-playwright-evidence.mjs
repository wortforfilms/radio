import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";

const target = process.env.GOVERNANCE_EVIDENCE_URL || "http://127.0.0.1:3000/governance";
const baseUrl = new URL(target).origin;
const webOutDir = path.resolve("apps/web/public/radio-html/qa/governance");
const desktopOutDir = path.resolve("apps/desktop/public/radio-html/qa/governance");
const packageJson = process.env.PLAYWRIGHT_PACKAGE_JSON;

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

async function checkLink(request, href) {
  const url = new URL(href, target);
  if (url.origin !== baseUrl) return { href, status: "external", ok: true };
  try {
    const response = await request.get(url.toString(), { timeout: 10000 });
    return {
      href: `${url.pathname}${url.search}${url.hash}`,
      status: response.status(),
      ok: response.status() < 400
    };
  } catch (error) {
    return {
      href: `${url.pathname}${url.search}${url.hash}`,
      status: "error",
      ok: false,
      error: error.message
    };
  }
}

function copyEvidenceToDesktop() {
  if (!fs.existsSync("apps/desktop/public/radio-html")) return;
  fs.mkdirSync(desktopOutDir, { recursive: true });
  for (const file of fs.readdirSync(webOutDir)) {
    fs.copyFileSync(path.join(webOutDir, file), path.join(desktopOutDir, file));
  }
}

function assertGovernance(report) {
  return {
    routeLoaded: report.desktop.h1 === "Evidence Center",
    releaseGatesPresent: report.desktop.sections.includes("release-gates"),
    evidenceLanesPresent: report.desktop.sections.includes("evidence-lanes"),
    noShipDashboardPresent: report.desktop.sections.includes("no-ship-dashboard"),
    milestoneCompletionPresent: report.desktop.sections.includes("milestone-completion"),
    laneCoverage: ["Rights Evidence Lane", "Gift Payment Evidence Lane", "Installer Evidence Lane", "Release Review Workflow"].every((label) => report.desktop.text.includes(label)),
    milestoneCoverage: ["Rights Evidence Closure", "Playable Audio Import Gate", "Gift Payment Proof Lane", "Tauri Installer Pipeline", "Release Review Board", "One-Command Evidence Orchestration", "Desktop Alpha Bundle"].every((label) => report.desktop.text.includes(label)),
    releaseApiVisible: report.desktop.text.includes("Release API"),
    noShipVisible: report.desktop.text.includes("NO_SHIP"),
    blockedPostureVisible: report.desktop.text.includes("blocked") || report.desktop.text.includes("Blocked"),
    noBrokenDesktopImages: report.desktop.brokenImages.length === 0,
    noBrokenMobileImages: report.mobile.brokenImages.length === 0,
    noMobileHorizontalOverflow: !report.mobile.hasHorizontalOverflow,
    criticalLinksOk: report.linkChecks.every((item) => item.ok)
  };
}

const { chromium } = await loadPlaywright();
fs.mkdirSync(webOutDir, { recursive: true });

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 1440, height: 1400 }, deviceScaleFactor: 1 });
const page = await context.newPage();
const logs = [];
page.on("console", (message) => logs.push({ type: message.type(), text: message.text() }));
page.on("pageerror", (error) => logs.push({ type: "pageerror", text: error.message }));

await page.goto(target, { waitUntil: "networkidle", timeout: 30000 });
await page.screenshot({ path: path.join(webOutDir, "governance-desktop.png"), fullPage: true });

const desktop = await page.evaluate(() => {
  const images = Array.from(document.images).map((img) => ({
    src: img.getAttribute("src"),
    complete: img.complete,
    width: img.naturalWidth,
    height: img.naturalHeight
  }));
  return {
    title: document.title,
    h1: document.querySelector("h1")?.textContent?.trim() || null,
    sections: Array.from(document.querySelectorAll("section[id]")).map((el) => el.id),
    releaseGateLabels: Array.from(document.querySelectorAll("#release-gates strong")).map((el) => el.textContent?.trim()),
    laneTitles: Array.from(document.querySelectorAll("#evidence-lanes h3")).map((el) => el.textContent?.trim()),
    milestoneTitles: Array.from(document.querySelectorAll("#milestone-completion h3")).map((el) => el.textContent?.trim()),
    noShipLabels: Array.from(document.querySelectorAll("#no-ship-dashboard article span")).map((el) => el.textContent?.trim()),
    imageCount: images.length,
    brokenImages: images.filter((img) => !img.complete || img.width === 0).map((img) => img.src),
    linkHrefs: Array.from(document.querySelectorAll("a[href]")).map((el) => el.getAttribute("href")),
    text: document.body.innerText
  };
});

const criticalHrefs = [
  "/api/governance",
  "/api/radio-release",
  "/api/radio-release?view=rights-workbench",
  "/api/radio-release?view=playback-gate",
  "/api/radio-release?view=payment-proof",
  "/api/radio-release?view=installer-pipeline",
  "/api/radio-release?view=release-orchestration",
  "/api/radio-release?view=desktop-alpha",
  "/api/governance?view=milestones",
  "/api/governance?view=rights-workbench",
  "/api/governance?view=playback-gate",
  "/api/governance?view=payment-proof",
  "/api/governance?view=installer-pipeline",
  "/api/governance?view=release-orchestration",
  "/api/governance?view=desktop-alpha",
  "/api/governance?view=rights-evidence",
  "/api/governance?view=gift-payment",
  "/api/governance?view=installer-evidence",
  "/api/governance?view=release-review",
  "/api/governance?view=no-ship",
  "/radio-html/data/rights-evidence.json",
  "/radio-html/data/gift-payment-evidence.json",
  "/radio-html/data/installer-evidence.json",
  "/radio-html/data/release-review.json",
  "/radio-html/data/milestone-completion.json",
  "/radio-html/data/rights-review-workbench.json",
  "/radio-html/data/playback-gate.json",
  "/radio-html/data/payment-proof-lane.json",
  "/radio-html/data/installer-pipeline.json",
  "/radio-html/data/release-orchestration.json",
  "/radio-html/data/desktop-alpha-bundle.json",
  "/radio-html/data/tauri-readiness.json"
];
const linkChecks = [];
for (const href of criticalHrefs) linkChecks.push(await checkLink(context.request, href));

const mobilePage = await context.newPage();
await mobilePage.setViewportSize({ width: 390, height: 1400 });
await mobilePage.goto(target, { waitUntil: "networkidle", timeout: 30000 });
await mobilePage.screenshot({ path: path.join(webOutDir, "governance-mobile.png"), fullPage: true });

const mobile = await mobilePage.evaluate(() => {
  const doc = document.documentElement;
  return {
    title: document.title,
    width: window.innerWidth,
    scrollWidth: doc.scrollWidth,
    clientWidth: doc.clientWidth,
    hasHorizontalOverflow: doc.scrollWidth > doc.clientWidth + 1,
    imageCount: document.images.length,
    brokenImages: Array.from(document.images).filter((img) => !img.complete || img.naturalWidth === 0).map((img) => img.getAttribute("src")),
    textSample: document.body.innerText.slice(0, 800)
  };
});

const report = {
  id: "governance-playwright-evidence",
  generatedAt: new Date().toISOString(),
  target,
  verificationState: "draft-playwright-evidence",
  phkd: {
    rule: "fail_closed",
    productionReady: false,
    releaseAllowed: false,
    note: "Playwright evidence confirms local governance render only; it does not verify rights, payments, installer signing, release approval, external telemetry, or production readiness. Unknown values remain NULL."
  },
  screenshots: {
    desktop: "/radio-html/qa/governance/governance-desktop.png",
    mobile: "/radio-html/qa/governance/governance-mobile.png"
  },
  desktop,
  mobile,
  linkChecks,
  logs
};
report.assertions = assertGovernance(report);
report.counts = {
  sections: desktop.sections.length,
  releaseGates: desktop.releaseGateLabels.length,
  evidenceLanes: desktop.laneTitles.length,
  milestoneCards: desktop.milestoneTitles.length,
  noShipItems: desktop.noShipLabels.length,
  imagesDesktop: desktop.imageCount,
  brokenDesktopImages: desktop.brokenImages.length,
  brokenMobileImages: mobile.brokenImages.length,
  links: linkChecks.length,
  failedLinks: linkChecks.filter((item) => !item.ok).length
};

fs.writeFileSync(path.join(webOutDir, "governance-playwright-report.json"), `${JSON.stringify(report, null, 2)}\n`);
copyEvidenceToDesktop();
await browser.close();

console.log(JSON.stringify({
  target,
  outDir: webOutDir,
  desktopMirror: fs.existsSync(desktopOutDir) ? desktopOutDir : null,
  assertions: report.assertions,
  counts: report.counts
}, null, 2));

if (!Object.values(report.assertions).every(Boolean)) process.exit(1);
