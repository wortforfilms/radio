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
  shows: RadioStation[];
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
