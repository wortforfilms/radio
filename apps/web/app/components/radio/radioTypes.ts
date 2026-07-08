export type RadioTrack = {
  t: string;
  r?: string;
  a?: string;
  c?: string;
  d?: string;
  ly?: string;
  theme?: string;
};

// --- Content library (scripts/build-radio-content.mjs → data/radio-content.json) ---

export type LyricsStatus = "sanitized" | "sanitized-redacted" | "placeholder-instrumental";

/** Version label: earliest generation of a title is "original", later takes are "take-N". */
export type TrackVersion = "original" | `take-${number}`;

export type RadioContentTrack = {
  id: string; // stable catalogue UUID (globally unique)
  slug: string; // unique URL-friendly slug from the stylised title
  title: string;
  stylizedTitle: string; // "<title> (take-N) — <artist> · <station>"
  artist: string;
  version: TrackVersion;
  versionGroup: string;
  versionIndex: number;
  versionCount: number;
  stationSlug: string | null;
  language: string | null;
  theme: string | null;
  styles: string[];
  lyricsStatus: LyricsStatus;
  flaggedTermCount: number;
  /** Display-layer redactions (cue index → sanitised text). Raw lyrics untouched. */
  redactions?: Array<{ cue: number; text: string }>;
  rawLyricsRef: string | null; // audit trail to the untouched source lyric file
  lrcPath: string | null; // draft time-synced LRC (timing unverified)
  placeholder: string | null; // poetic placeholder for instrumental tracks
  /** Editorial draft derived from metadata — never an artist statement. */
  storyline: string;
  storylineProvenance: "derived-from-metadata-template";
  timingVerified: false;
};

export type RadioContentLibrary = {
  id: string;
  generatedAt: string;
  status: string;
  verificationState: string;
  counts: {
    tracks: number;
    withLyrics: number;
    flaggedTracks: number;
    redactedCues: number;
    placeholders: number;
    lrcFiles: number;
    versionGroups: number;
    multiVersionTracks: number;
    storylines: number;
  };
  artistDefault: string;
  tracks: RadioContentTrack[];
};

export type RadioStation = {
  name: string;
  count: number;
  hero?: string;
  songs: RadioTrack[];
};

export type RadioCatalog = {
  artist?: string;
  total_songs: number;
  total_clips: number;
  source?: string;
  sourceStatus?: string;
  shows: RadioStation[];
};

export type RadioMediaStation = {
  key: string;
  label: string;
  cover: string;
  evidencePath: string;
  evidenceId: string | null;
  palette: {
    primary: string;
    secondary: string;
    accent: string;
  };
  shader: string;
  fallback: boolean;
  status: string;
  verification: string;
};

export type RadioMediaMap = {
  id: string;
  generatedAt: string;
  verificationState: string;
  fallbackCover: {
    path: string;
    evidenceId: string | null;
    status: string;
  };
  stations: RadioMediaStation[];
};

export type RadioAudioImportManifest = {
  id: string;
  generatedAt: string;
  verificationState: string;
  counts: {
    imports: number;
    playable: number;
    blocked: number;
    nullEvidence: number;
  };
  placeholder: string;
};

export type RadioRuntimeData = {
  id: string;
  generatedAt: string;
  verificationState: string;
  catalog?: RadioCatalog;
};

export type SamayaState = {
  day: string;
  samwatDay: number;
  muhurt: string;
  utsav: string;
  subject: string;
  mantra: string;
  announcement: string;
};

export type TtsPersonaKey = "maataa" | "rishi" | "samaya" | "vigyaaniq";

export type TtsPersona = {
  label: string;
  prefix: string;
  rate: number;
  pitch: number;
  langHints: string[];
};
