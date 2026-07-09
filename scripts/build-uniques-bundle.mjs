// UNIQUES BUILD TARGET — a self-contained Radio Vaigyaaniq distribution that
// ships one recording per song (version === "original" per version group):
// ~452 tracks ≈ 2.5 GB instead of 1,186 takes ≈ 6.2 GB.
//
//   npm run radio:build:uniques            # PLAN: filtered manifests + file list
//   npm run radio:build:uniques -- --copy  # full assembly into build/uniques/
//
// Output layout (drop-in replacement for public/radio-html):
//   build/uniques/radio-html/{index.html, online-offline-radio-engine.html,
//     sw.js, assets/{js,audio,covers,lrc,icons}, data/*.json filtered}
//
// Honesty: selection is purely version==='original' from the content library;
// alternate takes are listed in data/alternate-takes.json so a hybrid build can
// fetch them on demand. All rights/commerce fields pass through unchanged —
// the engine enforces the same gates on this subset.

import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const WEB = path.join(ROOT, "apps/web/public/radio-html");
const OUT = path.join(ROOT, "build/uniques/radio-html");
const copyMode = process.argv.includes("--copy");
const generatedAt = new Date().toISOString();

const readJson = (file) => JSON.parse(fs.readFileSync(file, "utf8"));
const content = readJson(path.join(WEB, "data/radio-content.json"));
const manifest = readJson(path.join(WEB, "data/radio-engine-manifest.json"));

// ---- selection: one original per version group ----
const originals = new Set();
const alternatesByGroup = {};
const seenGroup = new Set();
for (const track of content.tracks) {
  if (track.version === "original" && !seenGroup.has(track.versionGroup)) {
    originals.add(track.id);
    seenGroup.add(track.versionGroup);
  } else {
    (alternatesByGroup[track.versionGroup] = alternatesByGroup[track.versionGroup] || []).push({
      id: track.id,
      version: track.version,
      title: track.title
    });
  }
}

// ---- filter manifest ----
const keep = (song) => originals.has(song.id);
// Re-apply the free-tier policy (first 2 per station) to the filtered set so
// this build variant honours the same commerce intent as the full catalogue.
const FREE_PER_STATION = 2;
const freeIds = new Set();
const filteredStations = manifest.stations.map((station) => {
  const programs = station.programs.filter((program) => originals.has(program.trackId));
  const remapped = programs.map((program, index) => {
    const freeTier = index < FREE_PER_STATION;
    if (freeTier) freeIds.add(program.trackId);
    return { ...program, sequenceIndex: index + 1, freeTier, accessTier: freeTier ? "free" : "paid" };
  });
  return {
    ...station,
    programs: remapped,
    totalPrograms: remapped.length,
    totalDurationSeconds: remapped.reduce((sum, program) => sum + (program.durationSeconds || 0), 0)
  };
});
const filteredSongs = manifest.offlineBundle.songs.filter(keep).map((song) => {
  const freeTier = freeIds.has(song.id);
  return { ...song, freeTier, accessTier: freeTier ? "free" : "paid", offlinePolicy: freeTier ? "full" : song.previewUrl ? "preview-clip" : "preview-clamp-45s" };
});
const uniquesManifest = {
  ...manifest,
  id: `${manifest.id}-uniques`,
  generatedAt,
  buildVariant: "uniques",
  counts: {
    ...manifest.counts,
    playableTracks: filteredSongs.length,
    programs: filteredStations.reduce((sum, station) => sum + station.programs.length, 0),
    offlineSongs: filteredSongs.length,
    freeTracks: filteredSongs.filter((song) => song.freeTier).length,
    contentEnriched: filteredSongs.filter((song) => song.stylizedTitle).length,
    alternateTakesExcluded: manifest.offlineBundle.songs.length - filteredSongs.length
  },
  stations: filteredStations,
  offlineBundle: {
    ...manifest.offlineBundle,
    generatedAt,
    songs: filteredSongs,
    programs: manifest.offlineBundle.programs.filter((program) => originals.has(program.trackId ?? program.id?.split("-").slice(-5).join("-"))),
    cachePaths: [
      ...manifest.offlineBundle.corePaths,
      ...filteredSongs.filter((song) => song.freeTier).map((song) => song.url),
      ...filteredSongs.slice(0, 120).map((song) => song.coverUrl)
    ].filter(Boolean)
  }
};

const uniquesContent = {
  ...content,
  id: `${content.id}-uniques`,
  generatedAt,
  buildVariant: "uniques",
  counts: { ...content.counts, tracks: originals.size },
  tracks: content.tracks.filter((track) => originals.has(track.id))
};

// ---- file plan ----
const files = [];
const addAsset = (rel) => {
  const src = path.join(WEB, rel);
  if (fs.existsSync(src)) files.push({ rel, bytes: fs.statSync(src).size });
};
for (const id of originals) {
  addAsset(`assets/audio/${id}.mp3`);
  addAsset(`assets/covers/${id}.jpeg`);
  addAsset(`assets/lrc/${id}.lrc`);
}
for (const rel of ["online-offline-radio-engine.html", "index.html", "sw.js", "assets/js/radio-engine.js", "data/lyrics-prompter-data.json"]) addAsset(rel);
const totalBytes = files.reduce((sum, file) => sum + file.bytes, 0);

const plan = {
  id: "radio-uniques-build-plan",
  generatedAt,
  mode: copyMode ? "copy" : "plan",
  counts: {
    uniqueSongs: originals.size,
    alternateTakesExcluded: content.tracks.length - originals.size,
    files: files.length,
    bytes: totalBytes,
    approxGB: Number((totalBytes / 1024 ** 3).toFixed(2))
  },
  output: "build/uniques/radio-html"
};

// ---- write ----
fs.mkdirSync(path.join(OUT, "data"), { recursive: true });
fs.writeFileSync(path.join(OUT, "data/radio-engine-manifest.json"), `${JSON.stringify(uniquesManifest)}\n`);
fs.writeFileSync(path.join(OUT, "data/radio-engine-offline-bundle.json"), `${JSON.stringify(uniquesManifest.offlineBundle)}\n`);
fs.writeFileSync(path.join(OUT, "data/radio-content.json"), `${JSON.stringify(uniquesContent)}\n`);
fs.writeFileSync(path.join(OUT, "data/alternate-takes.json"), `${JSON.stringify({ generatedAt, note: "Alternate takes excluded from this build — fetchable on demand by version group.", groups: alternatesByGroup }, null, 1)}\n`);
fs.writeFileSync(path.join(ROOT, "build/uniques-plan.json"), `${JSON.stringify({ ...plan, files: files.slice(0, 50) }, null, 1)}\n`);

if (copyMode) {
  let copied = 0;
  for (const file of files) {
    const dest = path.join(OUT, file.rel);
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(path.join(WEB, file.rel), dest);
    copied += 1;
    if (copied % 200 === 0) console.log(`  copied ${copied}/${files.length}…`);
  }
  // lyrics-prompter data filtered to uniques (large file — trim it)
  const lyrics = readJson(path.join(WEB, "data/lyrics-prompter-data.json"));
  lyrics.tracks = lyrics.tracks.filter((track) => originals.has(track.id));
  fs.writeFileSync(path.join(OUT, "data/lyrics-prompter-data.json"), `${JSON.stringify(lyrics)}\n`);
  console.log(`copy complete: ${copied} files`);
}

console.log(`uniques-build mode=${plan.mode} songs=${plan.counts.uniqueSongs} excludedTakes=${plan.counts.alternateTakesExcluded}`);
console.log(`uniques-build files=${plan.counts.files} size=${plan.counts.approxGB} GB → ${plan.output}`);
if (!copyMode) console.log("plan only — run with --copy to assemble the distributable bundle");
