import fs from "node:fs";
import path from "node:path";

const visualQaPath = path.resolve("apps/web/public/radio-html/data/visual-qa.json");
const desktopVisualQaPath = path.resolve("apps/desktop/public/radio-html/data/visual-qa.json");
const reportPath = path.resolve("apps/web/public/radio-html/data/visual-qa-validation-run.json");
const desktopReportPath = path.resolve("apps/desktop/public/radio-html/data/visual-qa-validation-run.json");

function checkTarget(target) {
  const screenshot = target.screenshot ? path.resolve("apps/web/public", target.screenshot.replace(/^\//, "")) : null;
  const desktopScreenshot = target.screenshot ? path.resolve("apps/desktop/public", target.screenshot.replace(/^\//, "")) : null;
  const screenshotExists = Boolean(screenshot && fs.existsSync(screenshot));
  const desktopScreenshotExists = Boolean(desktopScreenshot && fs.existsSync(desktopScreenshot));
  const imageOk = !String(target.imageStatus ?? "pass").startsWith("blocked");
  const mobileOk = !String(target.mobileStatus ?? "pass").startsWith("blocked");
  const pass = target.renderStatus === "pass" && imageOk && mobileOk && screenshotExists && desktopScreenshotExists;
  return {
    title: target.title,
    path: target.path,
    slug: target.slug ?? null,
    renderStatus: target.renderStatus ?? "NULL",
    imageStatus: target.imageStatus ?? "NULL",
    mobileStatus: target.mobileStatus ?? "NULL",
    screenshot: target.screenshot ?? null,
    screenshotExists,
    desktopScreenshotExists,
    pass
  };
}

const visualQa = JSON.parse(fs.readFileSync(visualQaPath, "utf8"));
const checks = (visualQa.targets ?? []).map(checkTarget);
const report = {
  id: "radio-vaigyaaniq-visual-qa-validation-run",
  generatedAt: new Date().toISOString(),
  verificationState: checks.every((item) => item.pass) ? "validated-existing-evidence" : "blocked",
  phkd: {
    rule: "fail_closed",
    productionReady: false,
    releaseAllowed: false,
    note: "This validates existing screenshot evidence only. It does not claim a fresh browser recapture unless capture-radio-visual-qa.mjs succeeds."
  },
  counts: {
    targets: checks.length,
    pass: checks.filter((item) => item.pass).length,
    blocked: checks.filter((item) => !item.pass).length,
    webScreenshots: checks.filter((item) => item.screenshotExists).length,
    desktopScreenshots: checks.filter((item) => item.desktopScreenshotExists).length
  },
  checks
};

fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`);
if (fs.existsSync(path.dirname(desktopReportPath))) fs.writeFileSync(desktopReportPath, `${JSON.stringify(report, null, 2)}\n`);
if (fs.existsSync(desktopVisualQaPath)) fs.copyFileSync(visualQaPath, desktopVisualQaPath);

console.log(JSON.stringify({
  report: "/radio-html/data/visual-qa-validation-run.json",
  verificationState: report.verificationState,
  counts: report.counts
}, null, 2));

if (report.counts.blocked > 0) process.exit(1);
