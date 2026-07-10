// Auth service — register / login / logout / forgot / reset / me.
//
// MVP store: users.json (gitignored) with scrypt password hashes (node:crypto,
// per-user random salt, timingSafeEqual verification). Sessions are opaque
// 256-bit bearer tokens with 30-day expiry. The Prisma User model remains the
// durable target; this file store is the offline-verifiable seam.
//
// Fail-closed choices:
//   • forgot() NEVER returns the reset token to the caller (that would let
//     anyone hijack accounts). Without an EMAIL_PROVIDER, tokens land in
//     reset-requests.jsonl for the operator to relay out-of-band.
//   • responses to forgot() are identical whether or not the account exists.
//   • passwords: min 8 chars; hashes never leave this module.

"use strict";

const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");

const STORE_FILE = path.join(__dirname, "users.json");
const RESET_LOG = path.join(__dirname, "reset-requests.jsonl");
const SESSION_TTL_MS = 30 * 24 * 3600 * 1000;
const RESET_TTL_MS = 30 * 60 * 1000;

function loadStore(file = STORE_FILE) {
  if (!fs.existsSync(file)) return { users: {}, sessions: {}, resets: {} };
  return JSON.parse(fs.readFileSync(file, "utf8"));
}
function saveStore(store, file = STORE_FILE) {
  fs.writeFileSync(file, `${JSON.stringify(store, null, 1)}\n`);
}

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}
function verifyPassword(password, stored) {
  const [salt, hash] = String(stored || "").split(":");
  if (!salt || !hash) return false;
  const candidate = crypto.scryptSync(password, salt, 64);
  return crypto.timingSafeEqual(candidate, Buffer.from(hash, "hex"));
}
const token = () => crypto.randomBytes(32).toString("hex");
const normEmail = (email) => String(email || "").trim().toLowerCase();
const validEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

function register({ email, password, name }, files = {}) {
  email = normEmail(email);
  if (!validEmail(email)) return { error: "valid email required" };
  if (String(password || "").length < 8) return { error: "password must be at least 8 characters" };
  const store = loadStore(files.store);
  if (store.users[email]) return { error: "account already exists" };
  const user = {
    id: `u-${Date.now().toString(36)}-${crypto.randomBytes(3).toString("hex")}`,
    email,
    name: String(name || "").slice(0, 80) || email.split("@")[0],
    passwordHash: hashPassword(password),
    createdAt: new Date().toISOString(),
    settings: { language: "hi", preferredCurrency: "INR", ttsPersona: "samaya", lowBandwidth: false }
  };
  store.users[email] = user;
  saveStore(store, files.store);
  return { user: publicUser(user), ...issueSession(store, user, files) };
}

function login({ email, password }, files = {}) {
  email = normEmail(email);
  const store = loadStore(files.store);
  const user = store.users[email];
  if (!user || !verifyPassword(password, user.passwordHash)) return { error: "invalid credentials" };
  return { user: publicUser(user), ...issueSession(store, user, files) };
}

function issueSession(store, user, files = {}) {
  const sessionToken = token();
  store.sessions[sessionToken] = { userId: user.id, email: user.email, createdAt: Date.now(), expiresAt: Date.now() + SESSION_TTL_MS };
  saveStore(store, files.store);
  return { token: sessionToken, expiresAt: new Date(Date.now() + SESSION_TTL_MS).toISOString() };
}

function logout(sessionToken, files = {}) {
  const store = loadStore(files.store);
  const existed = Boolean(store.sessions[sessionToken]);
  delete store.sessions[sessionToken];
  saveStore(store, files.store);
  return { ok: existed };
}

function me(sessionToken, files = {}) {
  const store = loadStore(files.store);
  const session = store.sessions[sessionToken];
  if (!session || session.expiresAt < Date.now()) return null;
  const user = store.users[session.email];
  return user ? publicUser(user) : null;
}

function forgot({ email }, files = {}, env = process.env) {
  email = normEmail(email);
  const store = loadStore(files.store);
  if (store.users[email]) {
    const resetToken = token();
    store.resets[resetToken] = { email, expiresAt: Date.now() + RESET_TTL_MS };
    saveStore(store, files.store);
    const record = { at: new Date().toISOString(), email, resetToken, expiresIn: "30m" };
    if (env.EMAIL_PROVIDER) {
      // provider adapter seam — wire the configured provider here
      fs.appendFileSync(files.resetLog || RESET_LOG, `${JSON.stringify({ ...record, delivery: env.EMAIL_PROVIDER })}\n`);
    } else {
      fs.appendFileSync(files.resetLog || RESET_LOG, `${JSON.stringify({ ...record, delivery: "operator-relay (EMAIL_PROVIDER null)" })}\n`);
    }
  }
  // identical response either way — no account enumeration
  return { ok: true, message: "If that account exists, a reset link has been issued (delivery via the configured email provider; none configured → operator relay)." };
}

function reset({ token: resetToken, password }, files = {}) {
  if (String(password || "").length < 8) return { error: "password must be at least 8 characters" };
  const store = loadStore(files.store);
  const request = store.resets[resetToken];
  if (!request || request.expiresAt < Date.now()) return { error: "invalid or expired reset token" };
  const user = store.users[request.email];
  if (!user) return { error: "invalid or expired reset token" };
  user.passwordHash = hashPassword(password);
  delete store.resets[resetToken];
  // revoke all existing sessions for the account
  for (const [sessionToken, session] of Object.entries(store.sessions)) {
    if (session.email === request.email) delete store.sessions[sessionToken];
  }
  saveStore(store, files.store);
  return { ok: true };
}

function updateSettings(sessionToken, patch, files = {}) {
  const store = loadStore(files.store);
  const session = store.sessions[sessionToken];
  if (!session || session.expiresAt < Date.now()) return { error: "unauthorized" };
  const user = store.users[session.email];
  const allowed = ["language", "preferredCurrency", "ttsPersona", "lowBandwidth", "name"];
  for (const key of allowed) {
    if (patch[key] === undefined) continue;
    if (key === "name") user.name = String(patch.name).slice(0, 80);
    else user.settings[key] = patch[key];
  }
  saveStore(store, files.store);
  return { user: publicUser(user) };
}

function publicUser(user) {
  return { id: user.id, email: user.email, name: user.name, createdAt: user.createdAt, settings: user.settings };
}

module.exports = { register, login, logout, me, forgot, reset, updateSettings, verifyPassword, hashPassword };
