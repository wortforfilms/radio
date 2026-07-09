// Zustand-style player store with ZERO dependencies (useSyncExternalStore).
// Holds playback + tuner + social state; persists lightweight prefs to
// localStorage (the offline caching layer for SPA state — MSAR-framework-ready
// in the sense that state survives restarts; audio bytes are cached by the
// radio-html service worker / offline bundle, never duplicated here).
import { useSyncExternalStore } from "react";

export interface SpaTrack {
  id: string;
  title: string;
  subtitle: string;
  audioUrl: string;
  coverUrl: string | null;
  freeTier: boolean;
  previewSeconds: number;
  /** "full" | "preview" — computed rights-aware; never fabricated. */
  access: "full" | "preview";
  live: boolean; // true ONLY for verified live streams (none exist today)
}

export interface PlayerState {
  track: SpaTrack | null;
  queue: SpaTrack[];
  playing: boolean;
  currentTime: number;
  duration: number;
  shuffle: boolean;
  repeat: boolean;
  frequencyMHz: number; // decorative tuner — no licensed frequency exists
  stationSlug: string | null;
  favorites: Record<string, boolean>;
  likes: Record<string, boolean>;
  saved: Record<string, boolean>;
}

const PERSIST_KEY = "rv.spa.prefs";

function loadPersisted(): Partial<PlayerState> {
  try {
    return JSON.parse(localStorage.getItem(PERSIST_KEY) || "{}") as Partial<PlayerState>;
  } catch {
    return {};
  }
}

let state: PlayerState = {
  track: null,
  queue: [],
  playing: false,
  currentTime: 0,
  duration: 0,
  shuffle: false,
  repeat: false,
  frequencyMHz: 102.5,
  stationSlug: null,
  favorites: {},
  likes: {},
  saved: {},
  ...loadPersisted()
};
// never resurrect transient playback state
state = { ...state, playing: false, currentTime: 0, duration: 0, track: null, queue: [] };

const listeners = new Set<() => void>();

export function getPlayerState(): PlayerState {
  return state;
}

export function setPlayerState(patch: Partial<PlayerState>): void {
  state = { ...state, ...patch };
  for (const listener of listeners) listener();
  try {
    const { shuffle, repeat, frequencyMHz, stationSlug, favorites, likes, saved } = state;
    localStorage.setItem(PERSIST_KEY, JSON.stringify({ shuffle, repeat, frequencyMHz, stationSlug, favorites, likes, saved }));
  } catch {
    // storage unavailable — in-memory only
  }
}

export function usePlayerStore(): PlayerState {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    getPlayerState,
    getPlayerState
  );
}

/** Evidence outbox for social intents (like/gift/comment) — synced later by the engine lane. */
export function queueIntent(type: string, payload: Record<string, unknown>): void {
  try {
    const key = "rv.spa.outbox";
    const outbox = JSON.parse(localStorage.getItem(key) || "[]") as unknown[];
    outbox.push({ type, payload, queuedAt: new Date().toISOString() });
    localStorage.setItem(key, JSON.stringify(outbox.slice(-200)));
  } catch {
    // best-effort evidence
  }
}
