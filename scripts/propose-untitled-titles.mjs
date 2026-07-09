// Title proposals for "(untitled)" tracks — derived from THEIR OWN lyrics.
//
// Method (deterministic, evidence-carrying, nothing invented):
//   1. refrain: the most-repeated lyric line of the track (min 2 occurrences)
//   2. else first substantive lyric line
//   3. else (instrumental): real style/theme words → "<style> (Instrumental)"
// Tracks sharing one lyric family receive the SAME title (takes stay
// distinguished by the existing version labels); colliding titles across
// different lyric families get a Roman-numeral suffix.
//
// Output: data/title-proposals.json (web + desktop). The content builder
// (build-radio-content.mjs) applies proposals to untitled tracks only; the
// original "(untitled)" stays recorded as sourceTitle for provenance.
//
// Usage: node scripts/propose-untitled-titles.mjs

import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const WEB = path.join(ROOT, "apps/web/public/radio-html");
const DESKTOP = path.join(ROOT, "apps/desktop/public/radio-html");
const generatedAt = new Date().toISOString();

const latest = JSON.parse(fs.readFileSync(path.join(WEB, "data/suno-latest-list.json"), "utf8"));
const lyricsData = JSON.parse(fs.readFileSync(path.join(WEB, "data/lyrics-prompter-data.json"), "utf8"));
const lyricsById = new Map(lyricsData.tracks.map((track) => [track.id, track]));

const UNTITLED = new Set(["", "untitled", "(untitled)", "unknown", "null"]);
const untitled = latest.tracks.filter((track) => UNTITLED.has(String(track.title || "").trim().toLowerCase()));

const normLine = (line) => String(line || "").replace(/\s+/g, " ").trim();

function lyricLines(trackId) {
  const entry = lyricsById.get(trackId);
  return (entry?.cues || [])
    .filter((cue) => (cue.kind ?? "lyric") === "lyric")
    .map((cue) => normLine(cue.text))
    .filter((line) => line.length >= 4);
}

/** Trim a lyric line into a title: ≤ 6 words, no trailing fillers/punctuation. */
function toTitle(line) {
  const words = line
    .replace(/[|।!?,.…"'‘’“”()\[\]]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .filter(Boolean)
    .slice(0, 6);
  // drop weak trailing tokens
  const weak = new Set(["है", "हैं", "था", "थी", "और", "the", "a", "of", "में", "से", "को", "की", "का", "के", "पे", "पर"]);
  while (words.length > 2 && weak.has(words[words.length - 1].toLowerCase())) words.pop();
  return words.join(" ");
}

function styleTitle(track) {
  const entry = lyricsById.get(track.id);
  const styles = (entry?.styles || []).join(" ") || track.rawTags || "";
  const words = styles
    .replace(/[,;].*$/, "")
    .split(/\s+/)
    .filter((word) => /^[A-Za-zऀ-ॿ]+$/.test(word))
    .slice(0, 3)
    .join(" ");
  const theme = entry?.theme && entry.theme !== "Other / Misc" ? entry.theme : null;
  return `${words || theme || "Vaigyaaniq"} (Instrumental)`.trim();
}

// ---- lyric families: identical normalized full text shares one title ----
const familyOf = new Map();
for (const track of untitled) {
  const text = lyricLines(track.id).join("\n").toLowerCase();
  familyOf.set(track.id, text || `solo:${track.id}`);
}

const familyTitle = new Map();
const proposals = [];
const usedTitles = new Map(); // title -> family key (for cross-family collisions)
const ROMAN = ["II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];

for (const track of untitled) {
  const family = familyOf.get(track.id);
  let title = familyTitle.get(family);
  let source = "family";
  let evidence = null;

  if (!title) {
    const lines = lyricLines(track.id);
    if (lines.length) {
      // refrain = most repeated line (ties → earliest)
      const counts = new Map();
      for (const line of lines) counts.set(line.toLowerCase(), (counts.get(line.toLowerCase()) || 0) + 1);
      const refrain = [...counts.entries()].filter(([, count]) => count >= 2).sort((a, b) => b[1] - a[1])[0];
      const base = refrain ? lines.find((line) => line.toLowerCase() === refrain[0]) : lines[0];
      source = refrain ? "refrain" : "first-line";
      evidence = refrain ? `line repeats ${refrain[1]}×` : "opening lyric line";
      title = toTitle(base);
    } else {
      source = "styles";
      evidence = "instrumental — no lyric cues";
      title = styleTitle(track);
    }
    if (!title || title.length < 3) {
      title = styleTitle(track);
      source = "styles";
    }
    // cross-family collision → Roman suffix
    if (usedTitles.has(title) && usedTitles.get(title) !== family) {
      let suffixed = title;
      for (const numeral of ROMAN) {
        suffixed = `${title} ${numeral}`;
        if (!usedTitles.has(suffixed)) break;
      }
      title = suffixed;
    }
    usedTitles.set(title, family);
    familyTitle.set(family, title);
  } else {
    evidence = "shared lyric family";
  }

  proposals.push({
    id: track.id,
    sourceTitle: track.title || "(untitled)",
    proposedTitle: title,
    source,
    evidence,
    lyricFamily: family.startsWith("solo:") ? null : family.slice(0, 40)
  });
}

const out = {
  id: "radio-untitled-title-proposals",
  generatedAt,
  method: "refrain (most-repeated lyric line) → first lyric line → style words for instrumentals; one title per lyric family; deterministic",
  phkd: {
    note: "Titles are DERIVED from each track's own lyrics/styles — no invented themes. Original '(untitled)' preserved as sourceTitle. Applied by the content builder to untitled tracks only."
  },
  counts: {
    untitledTracks: untitled.length,
    families: new Set(familyOf.values()).size,
    distinctTitles: new Set(proposals.map((proposal) => proposal.proposedTitle)).size,
    bySource: proposals.reduce((acc, proposal) => (((acc[proposal.source] = (acc[proposal.source] || 0) + 1)), acc), {})
  },
  proposals
};

for (const root of [WEB, DESKTOP]) {
  fs.writeFileSync(path.join(root, "data/title-proposals.json"), `${JSON.stringify(out, null, 1)}\n`);
}
console.log(`title-proposals untitled=${out.counts.untitledTracks} families=${out.counts.families} distinctTitles=${out.counts.distinctTitles}`);
console.log(`title-proposals bySource=${JSON.stringify(out.counts.bySource)}`);
for (const proposal of proposals.slice(0, 8)) console.log(`  ${proposal.id.slice(0, 8)} → "${proposal.proposedTitle}" (${proposal.source})`);
