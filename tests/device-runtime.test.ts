import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  deviceRuntimeDashboardCard,
  deviceRuntimeEvidenceArtifacts,
  deviceRuntimeRoutes,
  deviceRuntimeTopology,
  productSurfaceMatrixEntries
} from "@shared/device-runtime";

const repoRoot = process.cwd();
const webAppRoot = path.join(repoRoot, "apps/web/app");
const dataRoot = path.join(repoRoot, "apps/web/public/radio-html/data");

function readJson<T>(file: string): T {
  return JSON.parse(fs.readFileSync(path.join(dataRoot, file), "utf8")) as T;
}

describe("DeviceRuntime module", () => {
  it("registers route files under /device/*", () => {
    expect(deviceRuntimeRoutes.map((route) => route.path)).toEqual([
      "/device",
      "/device/runtime",
      "/device/topology",
      "/device/evidence"
    ]);
    expect(fs.existsSync(path.join(webAppRoot, "device/page.tsx"))).toBe(true);
    expect(fs.existsSync(path.join(webAppRoot, "device/runtime/page.tsx"))).toBe(true);
    expect(fs.existsSync(path.join(webAppRoot, "device/topology/page.tsx"))).toBe(true);
    expect(fs.existsSync(path.join(webAppRoot, "device/evidence/page.tsx"))).toBe(true);
  });

  it("renders a Device Runtime card from the sovereign dashboard source", () => {
    const dashboardSource = fs.readFileSync(path.join(webAppRoot, "dashboard/page.tsx"), "utf8");
    expect(deviceRuntimeDashboardCard.title).toBe("Device Runtime");
    expect(dashboardSource).toContain("deviceRuntimeDashboardCard");
    expect(dashboardSource).toContain("Open Device Runtime");
  });

  it("adds the Device Runtime node to the topology graph", () => {
    expect(deviceRuntimeTopology.nodes.map((node) => node.id)).toContain("device-runtime");
    expect(deviceRuntimeTopology.edges.some((edge) => edge.from === "sovereign-dashboard" && edge.to === "device-runtime")).toBe(true);
  });

  it("registers the Device Runtime evidence artifact", () => {
    const artifact = deviceRuntimeEvidenceArtifacts.find((item) => item.key === "device-runtime-evidence");
    expect(artifact).toMatchObject({
      path: "/radio-html/data/device-runtime-evidence.json",
      status: "blocked",
      verificationState: "blocked-device-proof-null"
    });
    expect(artifact?.requiredEvidence).toContain("AuditLog.verified");
  });

  it("writes Device Runtime into the product-surface matrix", () => {
    expect(productSurfaceMatrixEntries.some((entry) => entry.runtime === "DeviceRuntime" && entry.route === "/device")).toBe(true);
    const matrix = readJson<{ entries: { runtime: string; route: string; evidence: string; releaseAllowed: boolean }[] }>("product-surface-matrix.json");
    expect(matrix.entries).toEqual(expect.arrayContaining([
      expect.objectContaining({
        runtime: "DeviceRuntime",
        route: "/device",
        evidence: "/radio-html/data/device-runtime-evidence.json",
        releaseAllowed: false
      })
    ]));
  });
});
