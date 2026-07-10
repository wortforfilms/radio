import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
// eslint-disable-next-line @typescript-eslint/no-require-imports
import { forgot, login, logout, me, register, reset, updateSettings } from "../apps/radio-backend/auth.js";
import { byId, validateRegistry } from "../apps/radio/registry/index.ts";

const repoRoot = process.cwd();
const read = (file: string) => fs.readFileSync(path.join(repoRoot, file), "utf8");
const tmpFiles = () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "auth-"));
  return { store: path.join(dir, "users.json"), resetLog: path.join(dir, "resets.jsonl") };
};

describe("auth service", () => {
  it("registers with scrypt hashes and validates inputs", () => {
    const files = tmpFiles();
    expect(register({ email: "bad", password: "password123" }, files).error).toContain("email");
    expect(register({ email: "a@b.co", password: "short" }, files).error).toContain("8 characters");
    const result = register({ email: "hemant@test.in", password: "password123", name: "Hemant" }, files);
    expect(result.token).toMatch(/^[a-f0-9]{64}$/);
    expect(result.user.name).toBe("Hemant");
    const stored = JSON.parse(fs.readFileSync(files.store, "utf8"));
    expect(stored.users["hemant@test.in"].passwordHash).toMatch(/^[a-f0-9]{32}:[a-f0-9]{128}$/);
    expect(stored.users["hemant@test.in"].passwordHash).not.toContain("password123");
    expect(register({ email: "hemant@test.in", password: "password123" }, files).error).toContain("exists");
  });

  it("login/logout/me lifecycle with opaque bearer sessions", () => {
    const files = tmpFiles();
    register({ email: "u@t.in", password: "password123" }, files);
    expect(login({ email: "u@t.in", password: "wrong-pass" }, files).error).toBe("invalid credentials");
    const session = login({ email: "u@t.in", password: "password123" }, files);
    expect(me(session.token, files)?.email).toBe("u@t.in");
    expect(logout(session.token, files).ok).toBe(true);
    expect(me(session.token, files)).toBeNull();
  });

  it("forgot/reset: no enumeration, operator relay, session revocation", () => {
    const files = tmpFiles();
    register({ email: "u@t.in", password: "password123" }, files);
    const unknown = forgot({ email: "nobody@t.in" }, files, {});
    const known = forgot({ email: "u@t.in" }, files, {});
    expect(unknown.message).toBe(known.message); // identical responses
    const relayed = fs.readFileSync(files.resetLog, "utf8").trim().split("\n").map((line) => JSON.parse(line));
    expect(relayed.length).toBe(1); // unknown account issued nothing
    expect(relayed[0].delivery).toContain("operator-relay");
    const session = login({ email: "u@t.in", password: "password123" }, files);
    expect(reset({ token: "bogus", password: "newpassword1" }, files).error).toContain("invalid");
    expect(reset({ token: relayed[0].resetToken, password: "newpassword1" }, files).ok).toBe(true);
    expect(me(session.token, files)).toBeNull(); // all sessions revoked
    expect(login({ email: "u@t.in", password: "newpassword1" }, files).token).toBeTruthy();
    // reset token is single-use
    expect(reset({ token: relayed[0].resetToken, password: "another-pass1" }, files).error).toBeTruthy();
  });

  it("persists per-account settings through the allowed whitelist only", () => {
    const files = tmpFiles();
    const { token } = register({ email: "u@t.in", password: "password123" }, files);
    const updated = updateSettings(token, { ttsPersona: "rishi", lowBandwidth: true, passwordHash: "hack" }, files);
    expect(updated.user.settings.ttsPersona).toBe("rishi");
    expect(updated.user.settings.lowBandwidth).toBe(true);
    const stored = JSON.parse(fs.readFileSync(files.store, "utf8"));
    expect(stored.users["u@t.in"].passwordHash).not.toBe("hack");
  });
});

describe("user area + previews integration", () => {
  it("wires auth + user endpoints and the engine account widget", () => {
    const server = read("apps/radio-backend/server.js");
    for (const route of ["/auth/register", "/auth/login", "/auth/logout", "/auth/forgot", "/auth/reset", "/auth/me",
      "/user/profile", "/user/settings", "/user/account", "/user/payments", "/user/history", "/user/submissions", "/user/creations"]) {
      expect(server).toContain(`"${route}"`);
    }
    const engine = read("apps/web/public/radio-html/assets/js/radio-engine.js");
    expect(engine).toContain("initAuth");
    expect(engine).toContain("renderAccount");
    expect(engine).toContain("rv.authToken");
    expect(engine).toContain("this.userId = result.user.id"); // entitlements follow the account
    expect(read("apps/web/public/radio-html/online-offline-radio-engine.html")).toContain('id="accountBox"');
    expect(read(".gitignore")).toContain("users.json");
  });

  it("registers user routes as partial and preview clips as generated", () => {
    expect(validateRegistry()).toEqual([]);
    for (const id of ["user.login", "user.signup", "user.forgot-password", "user.profile", "user.settings", "user.history"]) {
      expect(byId.get(id)?.status).toBe("partial");
      expect(byId.get(id)?.implementedBy.length).toBeGreaterThan(0);
    }
    expect(byId.get("user.verify")?.status).toBe("planned"); // no email verification yet — honest
    const manifest = JSON.parse(read("apps/web/public/radio-html/data/radio-engine-manifest.json")) as {
      counts: { previewClips: number };
      offlineBundle: { songs: Array<{ freeTier: boolean; previewUrl: string | null; offlinePolicy: string }> };
    };
    expect(manifest.counts.previewClips).toBeGreaterThanOrEqual(450);
    // every original now carries a dedicated preview clip → preview-clip policy
    expect(
      manifest.offlineBundle.songs.filter((song) => !song.freeTier && song.previewUrl).every((song) => song.offlinePolicy === "preview-clip")
    ).toBe(true);
  });
});
