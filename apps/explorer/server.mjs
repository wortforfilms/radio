// Standalone Registry Explorer server (no dependencies).
// Serves the GENERATED registry artifacts — the explorer never reads registry
// sources (compile-time philosophy). Run: node apps/explorer/server.mjs
import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const REGISTRY_DIR = path.join(ROOT, "apps/radio/public/registry");
const PORT = Number(process.env.PORT || 4800);
const MIME = { ".html": "text/html", ".json": "application/json", ".css": "text/css", ".js": "text/javascript" };

http
  .createServer((req, res) => {
    const clean = decodeURIComponent(new URL(req.url, "http://x").pathname);
    const rel = clean === "/" ? "explorer.html" : clean.replace(/^\/+/, "");
    const file = path.join(REGISTRY_DIR, rel);
    if (!file.startsWith(REGISTRY_DIR) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
      res.writeHead(404, { "content-type": "application/json" });
      res.end(JSON.stringify({ error: "not found", hint: "run `npm run radio:registry` first" }));
      return;
    }
    res.writeHead(200, { "content-type": MIME[path.extname(file)] || "application/octet-stream" });
    res.end(fs.readFileSync(file));
  })
  .listen(PORT, () => console.log(`Registry Explorer: http://localhost:${PORT}`));
