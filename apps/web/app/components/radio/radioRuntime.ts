import type {
  RadioAudioImportManifest,
  RadioCatalog,
  RadioMediaMap,
  RadioMediaStation,
  RadioRuntimeData,
  RadioStation,
  RadioTrack,
  SamayaState,
  TtsPersona,
  TtsPersonaKey
} from "./radioTypes";

export const ttsPersonas: Record<TtsPersonaKey, TtsPersona> = {
  maataa: {
    label: "Maataa calm guide",
    prefix: "Maataa announcement.",
    rate: 0.86,
    pitch: 1.08,
    langHints: ["hi-IN", "en-IN", "en-US"]
  },
  rishi: {
    label: "Rishi knowledge reader",
    prefix: "Rishi vaachan.",
    rate: 0.78,
    pitch: 0.88,
    langHints: ["hi-IN", "sa-IN", "en-IN", "en-US"]
  },
  samaya: {
    label: "Samaya ceremonial announcer",
    prefix: "Samaya sanket.",
    rate: 0.82,
    pitch: 0.96,
    langHints: ["hi-IN", "en-IN", "en-US"]
  },
  vigyaaniq: {
    label: "Vaigyaaniq science anchor",
    prefix: "Radio Vaigyaaniq update.",
    rate: 0.98,
    pitch: 1.02,
    langHints: ["en-IN", "hi-IN", "en-US"]
  }
};

const nullCatalog: RadioCatalog = {
  artist: "NULL",
  total_songs: 0,
  total_clips: 0,
  source: "/radio-html/Radio_Vaigyaaniq_App_Prototype.html",
  sourceStatus: "blocked",
  shows: [
    {
      name: "NULL",
      count: 0,
      hero: "/radio-html/assets/images/radio-vaigyaaniq-runtime-hero.svg",
      songs: [
        {
          t: "NULL",
          r: "NULL",
          d: "NULL",
          ly: "NULL",
          theme: "NULL"
        }
      ]
    }
  ]
};

export async function loadRadioCatalog(): Promise<RadioCatalog> {
  try {
    const runtimeData = await fetch("/radio-html/data/radio-runtime-data.json", { cache: "no-store" })
      .then((response) => {
        if (!response.ok) throw new Error(`Runtime data request failed: ${response.status}`);
        return response.json();
      }) as RadioRuntimeData;
    if (runtimeData.catalog?.shows?.length) return runtimeData.catalog;
  } catch {
    // Keep the runtime fail-closed: fall back to source extraction, then NULL metadata.
  }

  try {
    const html = await fetch("/radio-html/Radio_Vaigyaaniq_App_Prototype.html", { cache: "no-store" }).then((response) => {
      if (!response.ok) throw new Error(`Prototype request failed: ${response.status}`);
      return response.text();
    });
    const match = html.match(/const DATA\s*=\s*(\{[\s\S]*?\})\s*;\s*const AYO\s*=/);
    if (!match) return nullCatalog;
    return JSON.parse(match[1]) as RadioCatalog;
  } catch {
    return nullCatalog;
  }
}

export async function loadRadioMediaMap(): Promise<RadioMediaMap> {
  return fetch("/radio-html/data/radio-media.json").then((response) => response.json()) as Promise<RadioMediaMap>;
}

export async function loadAudioImportManifest(): Promise<RadioAudioImportManifest> {
  return fetch("/radio-html/data/audio-import-manifest.json").then((response) => response.json()) as Promise<RadioAudioImportManifest>;
}

export function stationKey(name: string): string {
  return name
    .toLowerCase()
    .replace(/the\s+/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function mediaForStation(mediaMap: RadioMediaMap | null, stationName: string, stationIndex: number): RadioMediaStation | null {
  if (!mediaMap) return null;
  const key = stationKey(stationName);
  return mediaMap.stations.find((station) => station.key === key || stationKey(station.label) === key)
    || mediaMap.stations[stationIndex % mediaMap.stations.length]
    || null;
}

export function currentFrequency(stationIndex: number): string {
  return (98.1 + stationIndex * 1.7).toFixed(1);
}

export function buildSamayaState(station: RadioStation, track: RadioTrack, stationIndex: number, trackIndex: number, now = new Date()): SamayaState {
  const dayNames = ["Ravi", "Soma", "Mangal", "Budh", "Guru", "Shukra", "Shani"];
  const day = dayNames[now.getDay()];
  const hour = now.getHours();
  const muhurt =
    hour < 4 ? "Nisha dhyana" :
    hour < 6 ? "Brahma muhurta" :
    hour < 12 ? "Pratah vaachan" :
    hour < 16 ? "Madhyahna sadhana" :
    hour < 19 ? "Sandhya samaya" :
    "Ratri manan";
  const samwatDay = Math.floor((now.getTime() - new Date(now.getFullYear(), 0, 1).getTime()) / 86400000) + 1;
  const subject = (track.theme || station.name || "Knowledge").replace("Other / Misc", "Lok Gyaan");
  const utsavCycle = ["Gyaan Divas", "Shravan Utsav", "Naad Sadhana", "Vigyan Sabha", "Guru Smaran", "Lipi Vaachan", "Pitra Kritagyata"];
  const utsav = utsavCycle[(samwatDay + stationIndex) % utsavCycle.length];
  const mantraBank = [
    "ॐ ज्ञानं ज्योतिः प्रवर्तते",
    "ॐ नादाय विज्ञानाय नमः",
    "ॐ ह्रीं मेधा दीप्यते",
    "ॐ सत्यं श्रुतं चिन्त्यते",
    "ॐ गुरवे ज्ञानप्रकाशाय नमः"
  ];
  const mantra = mantraBank[(stationIndex + trackIndex + now.getDay()) % mantraBank.length];
  return {
    day,
    samwatDay,
    muhurt,
    utsav,
    subject,
    mantra,
    announcement: `Announcement: ${station.name} stream is aligned for ${muhurt}. Evidence state: local dashboard guidance, not verified panchang.`
  };
}

export function buildAnnouncementText(station: RadioStation, track: RadioTrack, samaya: SamayaState): string {
  return [
    samaya.announcement,
    `Current station: ${station.name}.`,
    `Now playing: ${track.t || "Untitled"}.`,
    `Vishaya vaachan: ${samaya.subject}.`,
    `Mantra prompt: ${samaya.mantra}.`,
    "PHKD note: local browser text to speech only. No verified generated audio asset."
  ].join(" ");
}
