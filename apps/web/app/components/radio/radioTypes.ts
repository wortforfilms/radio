export type RadioTrack = {
  t: string;
  r?: string;
  a?: string;
  c?: string;
  d?: string;
  ly?: string;
  theme?: string;
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
