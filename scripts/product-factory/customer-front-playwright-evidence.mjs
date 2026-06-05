import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";

const target = process.env.RADIO_CUSTOMER_FRONT_URL || "http://127.0.0.1:3000/radio";
const baseUrl = new URL(target).origin;
const webOutDir = path.resolve("apps/web/public/radio-html/qa/customer-front");
const desktopOutDir = path.resolve("apps/desktop/public/radio-html/qa/customer-front");
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

function assertCustomerFront(report) {
  return {
    routeLoaded: report.desktop.title === "Radio Vaigyaaniq",
    h1Present: report.desktop.h1 === "Broadcast Command Surface",
    heroPresent: report.desktop.heroHeading === "Discover the Science, Tune into the Future.",
    navComplete: ["Live", "Frame", "Storyboard", "Prototype", "Ayodhya", "Evidence"].every((label) => report.desktop.navLabels.includes(label)),
    modulesComplete: [
      "3D Visualizer",
      "Synced Lyrics",
      "Persona TTS",
      "Gift Loop",
      "Storyboard",
      "Full App HTML",
      "All HTML Surfaces",
      "Runtimes + Workflows",
      "ASCII Wireframes",
      "Future Structure",
      "Scaffold JSON",
      "HKD Export",
      "HTML Archive"
    ].every((label) => report.desktop.moduleTitles.includes(label)),
    workflowCount: report.desktop.workflowSteps.length === 6,
    evidenceCardCount: report.desktop.evidenceCards.length === 4,
    noBrokenDesktopImages: report.desktop.brokenImages.length === 0,
    noBrokenMobileImages: report.mobile.brokenImages.length === 0,
    noMobileHorizontalOverflow: !report.mobile.hasHorizontalOverflow,
    phkdGuardVisible: report.desktop.hasPhkd && report.desktop.hasNoFabricationGuard,
    internalLinksOk: report.linkChecks.every((item) => item.ok)
  };
}

const { chromium } = await loadPlaywright();
fs.mkdirSync(webOutDir, { recursive: true });

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 1440, height: 1200 }, deviceScaleFactor: 1 });
const page = await context.newPage();
const logs = [];
page.on("console", (message) => logs.push({ type: message.type(), text: message.text() }));
page.on("pageerror", (error) => logs.push({ type: "pageerror", text: error.message }));

await page.goto(target, { waitUntil: "networkidle", timeout: 30000 });
await page.screenshot({ path: path.join(webOutDir, "radio-customer-desktop.png"), fullPage: true });

const desktop = await page.evaluate(() => {
  const text = document.body.innerText;
  const images = Array.from(document.images).map((img) => ({
    src: img.getAttribute("src"),
    complete: img.complete,
    width: img.naturalWidth,
    height: img.naturalHeight
  }));
  return {
    title: document.title,
    h1: document.querySelector("h1")?.textContent?.trim() || null,
    heroHeading: document.querySelector(".radio-app-hero-copy h2")?.textContent?.trim() || null,
    navLabels: Array.from(document.querySelectorAll(".radio-app-rail a")).map((el) => el.textContent?.trim()),
    moduleTitles: Array.from(document.querySelectorAll(".radio-landing-module strong")).map((el) => el.textContent?.trim()),
    workflowSteps: Array.from(document.querySelectorAll(".radio-landing-workflow li b")).map((el) => el.textContent?.trim()),
    evidenceCards: Array.from(document.querySelectorAll(".radio-landing-evidence-grid article span")).map((el) => el.textContent?.trim()),
    imageCount: images.length,
    brokenImages: images.filter((img) => !img.complete || img.width === 0).map((img) => img.src),
    linkHrefs: Array.from(document.querySelectorAll("a[href]")).map((el) => el.getAttribute("href")),
    hasPhkd: /PHKD|fail-closed|Fail Closed/i.test(text),
    hasNoFabricationGuard: /No fabricated audio, citations, checkout, or verification claims/.test(text),
    textSample: text.slice(0, 1000)
  };
});

const linkChecks = [];
for (const href of [...new Set(desktop.linkHrefs)].filter(Boolean)) {
  linkChecks.push(await checkLink(context.request, href));
}

const mobilePage = await context.newPage();
await mobilePage.setViewportSize({ width: 390, height: 1200 });
await mobilePage.goto(target, { waitUntil: "networkidle", timeout: 30000 });
await mobilePage.screenshot({ path: path.join(webOutDir, "radio-customer-mobile.png"), fullPage: true });

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
    textSample: document.body.innerText.slice(0, 600)
  };
});

const report = {
  id: "radio-customer-front-playwright-evidence",
  generatedAt: new Date().toISOString(),
  target,
  verificationState: "draft-playwright-evidence",
  phkd: {
    rule: "fail_closed",
    productionReady: false,
    note: "Playwright evidence confirms local customer-front render only; it does not verify audio rights, payment, external telemetry, or release readiness. Unknown values remain NULL."
  },
  screenshots: {
    desktop: "/radio-html/qa/customer-front/radio-customer-desktop.png",
    mobile: "/radio-html/qa/customer-front/radio-customer-mobile.png"
  },
  desktop,
  mobile,
  linkChecks,
  logs
};
report.assertions = assertCustomerFront(report);
report.counts = {
  modules: desktop.moduleTitles.length,
  workflows: desktop.workflowSteps.length,
  evidenceCards: desktop.evidenceCards.length,
  imagesDesktop: desktop.imageCount,
  brokenDesktopImages: desktop.brokenImages.length,
  brokenMobileImages: mobile.brokenImages.length,
  links: linkChecks.length,
  failedLinks: linkChecks.filter((item) => !item.ok).length
};

fs.writeFileSync(path.join(webOutDir, "radio-customer-front-playwright-report.json"), `${JSON.stringify(report, null, 2)}\n`);
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
