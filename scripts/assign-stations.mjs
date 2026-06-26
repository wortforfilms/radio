#!/usr/bin/env node
/**
 * assign-stations.mjs — auto-map the catalogue into stations (by theme) + infer language,
 * and write data/station-tracks.json consumed by the Stations surface.
 *
 * Sources (read at runtime):
 *   - apps/web/public/radio-html/data/stations.json        (themeToStation + stations)
 *   - apps/web/public/radio-html/data/suno-library-catalog.json (tracks)
 *   - _radio_index/Credits_List.csv  (suno_id → theme, if present)  [optional]
 * Falls back to keyword theming on the title when a credit theme is missing.
 *
 * Usage: npm run radio:stations
 */
import fs from "node:fs";
import path from "node:path";

const REPO = path.resolve(".");
const webRoot = path.join(REPO, "apps/web/public/radio-html");
const desktopRoot = path.join(REPO, "apps/desktop/public/radio-html");
const stationsPath = path.join(webRoot, "data", "stations.json");
const catalogPath = path.join(webRoot, "data", "suno-library-catalog.json");
const creditsPath = path.join(REPO, "_radio_index", "Credits_List.csv");

const readJson = (p, d = null) => (fs.existsSync(p) ? JSON.parse(fs.readFileSync(p, "utf8")) : d);

const stationsDoc = readJson(stationsPath);
if (!stationsDoc) { console.error("stations.json not found:", stationsPath); process.exit(1); }
const catalog = readJson(catalogPath, { tracks: [] });
const themeToStation = stationsDoc.themeToStation || {};
const DEFAULT_STATION = "gurukul";

// suno_id → theme from Credits_List.csv (optional, authoritative where present)
const creditTheme = new Map();
if (fs.existsSync(creditsPath)) {
  const lines = fs.readFileSync(creditsPath, "utf8").split(/\r?\n/).filter(Boolean);
  const head = lines.shift().split(",");
  const iId = head.indexOf("suno_id"), iTheme = head.indexOf("theme");
  if (iId >= 0 && iTheme >= 0) {
    for (const line of lines) {
      const c = line.split(",");
      if (c[iId]) creditTheme.set(c[iId].trim(), (c[iTheme] || "").trim());
    }
  }
}

const KW = [
  [/सनातन|वैदिक|ॐ|शंख|ब्रह्म|अग्नि|वेद|cosmic|sanatan|vedic|chant|hiranya|naad/i, "Sanatan & Vedic"],
  [/राग|शास्त्रीय|सरोद|यमन|raag|classical|shastriya/i, "Classical & Raag"],
  [/भक्त|कबीर|राम|कृष्ण|भजन|कथा|माता|हनुमान|bhakti|kabir|katha/i, "Bhakti & Katha"],
  [/रैप|rap|fusion|trance|club|beat|बावल|verse/i, "Rap & Fusion"],
  [/नागिन|रहस्य|naagin|mystic/i, "Naagin & Mystic"],
  [/हरियाण|छोरी|लुगाई|जाट|देसी|बंजारा|haryan|chhori|lugai/i, "Haryanvi Folk"],
  [/देश|तिरंगा|फौजी|भारत|वीर|desh|tiranga|fauji|bharat/i, "Desh / Patriotic"],
  [/प्यार|इश्क़|विरह|याद|पिया|सजन|ghazal|virah|pyaar|yaad/i, "Love & Virah"],
];
const themeLang = {
  "Sanatan & Vedic": "Sanskrit", "Classical & Raag": "Hindi", "Bhakti & Katha": "Hindi",
  "Rap & Fusion": "Hindi", "Naagin & Mystic": "Hindi", "Haryanvi Folk": "Haryanvi",
  "Desh / Patriotic": "Hindi", "Love & Virah": "Hindi", "Other / Misc": "Hindi",
};
const isLatin = (s) => /^[\x00-\x7F\s]+$/.test((s || "").replace(/[^A-Za-z\s]/g, "") || "x") && /[A-Za-z]/.test(s || "");

function themeOf(t) {
  const c = creditTheme.get(t.sunoId);
  if (c) return c;
  const hay = `${t.title || ""} ${t.styles || ""}`;
  for (const [re, theme] of KW) if (re.test(hay)) return theme;
  return "Other / Misc";
}
function langOf(t, theme) {
  // Word-level Sanskrit markers only (avoid matching bare न/म in common Hindi words).
  if (/ॐ|नमः|स्वाहा|शान्ति|ब्रह्माय|पुरोहितं|namah|swaha|agnim|hiranya|purohitam/i.test(t.title || "")) return "Sanskrit";
  if (isLatin(t.title) && theme !== "Haryanvi Folk") return "English";
  return themeLang[theme] || "Hindi";
}

const bySlug = {};
for (const s of stationsDoc.stations) bySlug[s.slug] = [];
const counts = {};
const langCounts = {};

for (const t of catalog.tracks || []) {
  const theme = themeOf(t);
  const slug = themeToStation[theme] || DEFAULT_STATION;
  const language = langOf(t, theme);
  (bySlug[slug] = bySlug[slug] || []).push({
    sunoId: t.sunoId, title: t.title || "(untitled)", theme, language,
    cover: t.coverPublicPath || (t.sunoId ? `/radio-html/assets/covers/${t.sunoId}.jpeg` : null),
    publicPath: t.publicPath || null, canPlay: t.canPlay === true,
  });
  counts[slug] = (counts[slug] || 0) + 1;
  langCounts[language] = (langCounts[language] || 0) + 1;
}

const out = {
  id: "radio-vaigyaaniq-station-tracks",
  generatedAt: new Date().toISOString(),
  source: { catalog: catalog.tracks?.length || 0, creditThemes: creditTheme.size },
  counts, langCounts, bySlug,
};

for (const root of [webRoot, desktopRoot]) {
  if (!fs.existsSync(path.join(root, "data"))) continue;
  fs.writeFileSync(path.join(root, "data", "station-tracks.json"), JSON.stringify(out, null, 2) + "\n");
}

console.log("=== Station assignment ===");
console.log("tracks:", catalog.tracks?.length || 0, "| credit themes used:", creditTheme.size);
for (const s of stationsDoc.stations) console.log(`  ${s.name.padEnd(22)} ${counts[s.slug] || 0}`);
console.log("languages:", langCounts);
console.log("→ wrote data/station-tracks.json");
