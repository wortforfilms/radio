// Pure content-production helpers for Radio Vaigyaaniq.
// Used by scripts/build-radio-content.mjs and tests/radio-content.test.ts.
// No I/O here — everything is deterministic (seeded by track id) so the
// content build is reproducible and idempotent.

// ---------------------------------------------------------------------------
// Lyrics sanitisation
// ---------------------------------------------------------------------------
// Display-layer redaction list (English, Hinglish, Devanagari). The raw text is
// never modified on disk — callers keep a rawLyricsRef for audit/provenance.
export const OFFENSIVE_PATTERNS = [
  // english
  "fuck", "fucking", "motherfucker", "shit", "bitch", "asshole", "bastard",
  "cunt", "dick", "pussy", "whore", "slut", "porn", "nude", "naked",
  // hinglish transliterations
  "bhenchod", "behenchod", "madarchod", "chutiya", "chutiye", "gandu", "gaandu",
  "randi", "harami", "haraami", "kamina", "kamine", "saala kutta",
  // devanagari
  "भेनचोद", "बहनचोद", "मादरचोद", "चूतिया", "चुतिया", "गांडू", "गंडू",
  "रंडी", "हरामी", "कमीना", "कमीने"
];

const REDACTION = "▮▮▮";

const offensiveRegex = new RegExp(
  `(${OFFENSIVE_PATTERNS.map((p) => p.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})`,
  "giu"
);

/** Sanitise one line of text. Returns { text, flagged: string[] }. */
export function sanitizeText(input) {
  const text = String(input ?? "");
  const flagged = [];
  const sanitized = text.replace(offensiveRegex, (match) => {
    flagged.push(match.toLowerCase());
    return REDACTION;
  });
  return { text: sanitized, flagged };
}

/** Sanitise a cue list; returns { cues, flaggedTerms, redactedCueIndexes }. */
export function sanitizeCues(cues) {
  const flaggedTerms = new Set();
  const redactedCueIndexes = [];
  const out = (cues || []).map((cue, index) => {
    const { text, flagged } = sanitizeText(cue.text ?? cue.line ?? "");
    if (flagged.length) {
      redactedCueIndexes.push(index);
      flagged.forEach((term) => flaggedTerms.add(term));
    }
    return { ...cue, text };
  });
  return { cues: out, flaggedTerms: [...flaggedTerms], redactedCueIndexes };
}

// ---------------------------------------------------------------------------
// Slugs & IDs
// ---------------------------------------------------------------------------
/** URL-friendly slug. Keeps Devanagari (URLs are UTF-8-safe); falls back to id. */
export function slugify(value, fallback = "track") {
  const slug = String(value ?? "")
    .normalize("NFC")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 72);
  return slug || fallback;
}

/** Stateful unique-slug factory: repeated titles get -2, -3… suffixes. */
export function createSlugger() {
  const seen = new Map();
  return (value, fallback) => {
    const base = slugify(value, fallback);
    const count = (seen.get(base) || 0) + 1;
    seen.set(base, count);
    return count === 1 ? base : `${base}-${count}`;
  };
}

// ---------------------------------------------------------------------------
// Versions
// ---------------------------------------------------------------------------
/**
 * Group tracks by normalised title, order by sourceCreatedAt, and label:
 * earliest = "original", later takes = "take-2", "take-3", …
 * (The catalog holds multiple Suno generations of the same song — honest
 * labels, no fabricated "radio-edit"/"acoustic" claims.)
 * Returns Map(id -> { version, versionGroup, versionIndex, versionCount, peers }).
 */
const UNTITLED = new Set(["", "untitled", "(untitled)", "unknown", "null"]);

export function assignVersions(tracks) {
  const groups = new Map();
  for (const track of tracks) {
    const normalized = String(track.title || "").trim().toLowerCase();
    // Untitled tracks are distinct songs, not takes of one another — singleton groups.
    const key = UNTITLED.has(normalized) ? `untitled:${track.id}` : normalized;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(track);
  }
  const result = new Map();
  for (const [key, group] of groups) {
    group.sort((a, b) => String(a.createdAt || "").localeCompare(String(b.createdAt || "")));
    const groupSlug = key.startsWith("untitled:")
      ? `untitled-${group[0].id.slice(0, 8)}`
      : slugify(key, group[0].id.slice(0, 8));
    group.forEach((track, index) => {
      result.set(track.id, {
        version: index === 0 ? "original" : `take-${index + 1}`,
        versionGroup: groupSlug,
        versionIndex: index + 1,
        versionCount: group.length
      });
    });
  }
  return result;
}

// ---------------------------------------------------------------------------
// Title stylisation
// ---------------------------------------------------------------------------
export const DEFAULT_ARTIST = "VESAHE · hkfaduio"; // label credit per RADIO_TRACK_ONBOARDING_SOP

export function stylizeTitle(track, stationName, versionInfo, artist = DEFAULT_ARTIST) {
  const base = String(track.title || "Untitled").trim();
  const version = versionInfo && versionInfo.version !== "original" ? ` (${versionInfo.version})` : "";
  const station = stationName ? ` · ${stationName}` : "";
  return `${base}${version} — ${artist}${station}`;
}

// ---------------------------------------------------------------------------
// Storylines (editorial drafts derived from real metadata — deterministic).
// These are NOT artist statements; provenance is recorded by the caller.
// ---------------------------------------------------------------------------
export function hashSeed(value) {
  let hash = 2166136261;
  const str = String(value);
  for (let i = 0; i < str.length; i += 1) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function pick(list, seed, salt) {
  return list[(hashSeed(`${seed}:${salt}`) % list.length + list.length) % list.length];
}

const OPENERS = [
  "This piece opens quietly and earns its intensity",
  "The recording begins as a slow invocation",
  "From the first phrase, the track states its intent",
  "A patient introduction sets the frame",
  "The song arrives without ceremony and builds outward"
];
const MOODS = [
  "devotional and unhurried", "restless and rhythmic", "meditative with sudden bright turns",
  "celebratory at its core", "wistful but grounded", "austere, almost architectural",
  "playful under a serious surface"
];
const ARCS = [
  "The arrangement circles its refrain, each return slightly heavier than the last.",
  "Verses hand over to the refrain like a call answered across a courtyard.",
  "The middle section loosens the pulse before the theme reasserts itself.",
  "Percussion enters late, reframing everything heard before it.",
  "The closing minute strips the texture back to a single sustained line."
];
const SIGNIFICANCE = [
  "In the Vaigyaaniq frame, it reads as a small act of shruti — heard knowledge carried forward in a new medium.",
  "It sits inside the catalogue's larger argument: that devotional form and modern production are not rivals.",
  "The piece treats repetition the way ritual does — not as redundancy but as deepening.",
  "It belongs to the catalogue's quieter lane, where language itself is the instrument.",
  "Within the station's sequence it works as a threshold track, resetting the listener's attention."
];

/**
 * ~150–220 word editorial storyline from real metadata (station, theme,
 * language, styles, duration, first sanitised lyric line). Deterministic per id.
 */
export function buildStoryline(track, extras = {}) {
  const seed = track.id;
  const language = extras.language || track.language || null;
  const theme = extras.theme || track.theme || null;
  const styles = (extras.styles || track.styles || []).filter(Boolean);
  const station = extras.stationName || null;
  const minutes = track.durationSeconds ? Math.round(track.durationSeconds / 60) : null;
  const firstLine = extras.firstLyricLine || null;
  const isInstrumental = extras.isInstrumental === true;

  const parts = [];
  parts.push(`${pick(OPENERS, seed, "open")}. “${String(track.title || "Untitled").trim()}” is a ${
    language ? `${language}-language ` : ""
  }${isInstrumental ? "instrumental " : ""}recording${station ? ` programmed on the ${station} lane` : ""}${
    theme && theme !== "Other / Misc" ? `, drawn from the catalogue's ${theme} thread` : ""
  }.`);
  if (styles.length) {
    parts.push(`Its style notes — ${styles.join("; ").slice(0, 160)} — do most of the scene-setting: the mood is ${pick(MOODS, seed, "mood")}.`);
  } else {
    parts.push(`No style sheet survives for this take, but the mood it carries is ${pick(MOODS, seed, "mood")}.`);
  }
  if (firstLine && !isInstrumental) {
    parts.push(`The opening line — “${firstLine}” — announces the piece's centre of gravity, and the rest of the lyric keeps returning to it.`);
  } else if (isInstrumental) {
    parts.push("There is no lyric to lean on; melody and rhythm carry the whole narrative weight, which gives the piece an open, interpretable quality.");
  }
  parts.push(pick(ARCS, seed, "arc"));
  if (minutes) {
    parts.push(`At roughly ${minutes} minute${minutes === 1 ? "" : "s"}, it neither overstays nor rushes; the duration feels chosen rather than defaulted.`);
  }
  parts.push(pick(SIGNIFICANCE, seed, "sig"));
  return parts.join(" ");
}

// ---------------------------------------------------------------------------
// LRC
// ---------------------------------------------------------------------------
function lrcTime(seconds) {
  const safe = Math.max(0, Number(seconds) || 0);
  const mm = String(Math.floor(safe / 60)).padStart(2, "0");
  const ss = (safe % 60).toFixed(2).padStart(5, "0");
  return `[${mm}:${ss}]`;
}

/** Build an LRC document from sanitised cues. Timing is draft (unverified). */
export function toLrc(cues, meta = {}) {
  const head = [
    meta.title ? `[ti:${meta.title}]` : null,
    meta.artist ? `[ar:${meta.artist}]` : null,
    meta.album ? `[al:${meta.album}]` : null,
    "[by:Radio Vaigyaaniq — draft timing, unverified]"
  ].filter(Boolean);
  const lines = (cues || [])
    .filter((cue) => (cue.kind ?? "lyric") === "lyric" && String(cue.text || "").trim())
    .map((cue) => `${lrcTime(cue.startSeconds ?? cue.t ?? cue.time ?? 0)}${String(cue.text).trim()}`);
  return `${[...head, ...lines].join("\n")}\n`;
}

/** Poetic placeholder for tracks without lyrics (kept clearly generic). */
export function instrumentalPlaceholder(track, extras = {}) {
  const language = extras.language || track.language;
  return [
    "— instrumental —",
    `No lyric sheet exists for this recording${language ? ` (${language} catalogue)` : ""}.`,
    "Let the melody speak; words are optional here."
  ].join("\n");
}
