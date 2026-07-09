import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
// eslint-disable-next-line @typescript-eslint/no-require-imports
import { appendLedger, checkExpiry, readLedger, verifyWithExternalRegistry } from "../apps/radio-backend/rights-ledger.js";
import { contentTypes } from "../apps/radio/registry/index.ts";

const repoRoot = process.cwd();
const read = (file: string) => fs.readFileSync(path.join(repoRoot, file), "utf8");
const tmp = () => fs.mkdtempSync(path.join(os.tmpdir(), "rights-"));

describe("phase 9 — rights closure automation", () => {
  it("keeps an immutable rights ledger with timestamps and actors", () => {
    const dir = tmp();
    const ledger = path.join(dir, "ledger.jsonl");
    const entry = appendLedger({ kind: "proof-uploaded", trackId: "t1", proofId: "p1", actor: "admin" }, ledger);
    appendLedger({ kind: "proof-verified", trackId: "t1", proofId: "p1", actor: "rights-closure" }, ledger);
    const entries = readLedger(ledger);
    expect(entries.length).toBe(2);
    expect(entry.id).toMatch(/^rl-/);
    expect(entries[0].at).toBeTruthy();
    expect(entries[1].actor).toBe("rights-closure");
  });

  it("auto-reverts published tracks whose rights expired, with ledger + notification", () => {
    const dir = tmp();
    const files = { ledger: path.join(dir, "l.jsonl"), notifications: path.join(dir, "n.jsonl") };
    const adminData = {
      tracks: {
        "t-expired": { published: true, rightsExpiryDate: "2020-01-01" },
        "t-valid": { published: true, rightsExpiryDate: "2999-01-01" },
        "t-unpublished": { published: false, rightsExpiryDate: "2020-01-01" },
        "t-no-expiry": { published: true },
      },
    };
    const reverted = checkExpiry(adminData, new Date("2026-07-09"), files);
    expect(reverted).toEqual(["t-expired"]);
    expect(adminData.tracks["t-expired"].published).toBe(false);
    expect(adminData.tracks["t-expired"].rightsStatus).toBe("rights-expired-auto-reverted");
    expect(adminData.tracks["t-valid"].published).toBe(true); // untouched
    const ledger = readLedger(files.ledger);
    expect(ledger[0].kind).toBe("expiry-reverted");
    expect(fs.readFileSync(files.notifications, "utf8")).toContain("rights-expiry");
    // idempotent: second run reverts nothing new
    expect(checkExpiry(adminData, new Date("2026-07-09"), files)).toEqual([]);
  });

  it("keeps external registry verification fail-closed without configuration", async () => {
    const result = await verifyWithExternalRegistry("t1", {});
    expect(result.blocked).toContain("blocked-rights-registry-null");
  });

  it("wires the admin lane: ledger on proof upload, expiry wizard field, endpoints", () => {
    const server = read("apps/radio-backend/server.js");
    expect(server).toContain("appendRightsLedger({ kind: \"proof-uploaded\"");
    expect(server).toContain('app.get("/admin/rights-ledger"');
    expect(server).toContain('app.post("/admin/rights-expiry-check"');
    expect(server).toContain('app.get("/admin/rights-registry/:trackId"');
    const panel = read("apps/web/public/radio-html/admin-panel.html");
    expect(panel).toContain("proofExpiry");
    expect(panel).toContain("rightsExpiryDate");
  });

  it("extends the radio-track content type with rights lifecycle fields", () => {
    const track = contentTypes.find((contentType) => contentType.id === "radio-track");
    const fieldNames = track?.fields.map((field) => field.name) || [];
    expect(fieldNames).toContain("rightsExpiryDate");
    expect(fieldNames).toContain("rightsLedgerId");
  });
});
