import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const dataRoot = path.resolve("apps/web/public/radio-html/data");
const surfaceRoot = path.resolve("apps/web/public/radio-html/surfaces");

function readJson<T>(file: string): T {
  return JSON.parse(fs.readFileSync(path.join(dataRoot, file), "utf8")) as T;
}

describe("radio rights closure packet", () => {
  it("prepares fillable proof rows while reflecting imported closure counts", () => {
    const packet = readJson<{
      verificationState: string;
      shipDecision: string;
      importEnv: string;
      counts: { records: number; rowsPrepared: number; releaseAllowed: number; closed: number; blocked: number };
      records: {
        id: string;
        path: string;
        checksum: string | null;
        source: null;
        creator: null;
        license: null;
        auditVerified: false;
        releaseAllowed: false;
      }[];
    }>("rights-closure-packet.json");
    const csv = fs.readFileSync(path.join(dataRoot, "rights-closure-import-template.csv"), "utf8");

    expect(packet.verificationState).toBe("draft-rights-closure-packet-no-proof");
    expect(packet.shipDecision).toBe("NO_SHIP");
    expect(packet.importEnv).toBe("EVIDENCE_RIGHTS_IMPORT");
    expect(packet.counts).toMatchObject({
      records: 19,
      rowsPrepared: 19,
      releaseAllowed: 0,
      closed: 19,
      blocked: 0
    });
    expect(packet.records).toHaveLength(19);
    expect(packet.records.every((record) => record.path.startsWith("/radio-html/"))).toBe(true);
    expect(packet.records.every((record) => record.source === null && record.creator === null)).toBe(true);
    expect(packet.records.every((record) => record.auditVerified === false && record.releaseAllowed === false)).toBe(true);
    expect(packet.records.every((record) => Boolean(record.checksum))).toBe(true);
    expect(csv.split("\n")[0]).toBe("id,path,checksum,source,creator,license,rightsStatus,citation,reviewer,reviewedAt,auditVerified,releaseAllowed,reason,contractRef");
    expect(csv).toContain(packet.records[0].id);
    expect(fs.existsSync(path.join(surfaceRoot, "rights-closure-packet.html"))).toBe(true);
  });
});
