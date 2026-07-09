// HTML5 Audio hook: play/pause, scrubbing, queue advance, preview clamping.
// Rights-aware: preview-access tracks stop hard at previewSeconds (45s default)
// — the same fail-closed rule as the engine; the SPA never bypasses commerce.
import { useCallback, useEffect, useRef } from "react";
import { getPlayerState, queueIntent, setPlayerState, type SpaTrack } from "../store/player-store";

export function useAudio() {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const element = useCallback((): HTMLAudioElement => {
    if (!audioRef.current) {
      const audio = new Audio();
      audio.preload = "metadata";
      audio.addEventListener("timeupdate", () => {
        const { track } = getPlayerState();
        if (track?.access === "preview" && audio.currentTime >= track.previewSeconds) {
          audio.pause();
          setPlayerState({ playing: false, currentTime: track.previewSeconds });
          return;
        }
        setPlayerState({ currentTime: audio.currentTime, duration: audio.duration || 0 });
      });
      audio.addEventListener("ended", () => next());
      audio.addEventListener("pause", () => setPlayerState({ playing: false }));
      audio.addEventListener("play", () => setPlayerState({ playing: true }));
      audioRef.current = audio;
    }
    return audioRef.current;
  }, []);

  const load = useCallback(
    (track: SpaTrack, queue?: SpaTrack[]) => {
      const audio = element();
      audio.src = track.audioUrl;
      setPlayerState({ track, currentTime: 0, duration: 0, ...(queue ? { queue } : {}) });
      void audio.play().catch(() => setPlayerState({ playing: false })); // awaits user gesture
      queueIntent("play", { trackId: track.id, access: track.access });
    },
    [element]
  );

  const toggle = useCallback(() => {
    const audio = element();
    const { track, playing } = getPlayerState();
    if (!track) return;
    if (playing) audio.pause();
    else void audio.play().catch(() => undefined);
  }, [element]);

  const seek = useCallback(
    (seconds: number) => {
      const audio = element();
      const { track, duration } = getPlayerState();
      const limit = track?.access === "preview" ? Math.min(track.previewSeconds, duration || track.previewSeconds) : duration;
      audio.currentTime = Math.max(0, Math.min(seconds, limit || seconds));
    },
    [element]
  );

  const step = useCallback(
    (direction: 1 | -1) => {
      const { queue, track, shuffle } = getPlayerState();
      if (!queue.length) return;
      const index = queue.findIndex((candidate) => candidate.id === track?.id);
      const nextIndex = shuffle
        ? Math.floor(Math.random() * queue.length)
        : (index + direction + queue.length) % queue.length;
      load(queue[nextIndex]);
    },
    [load]
  );

  const next = useCallback(() => {
    const { repeat, track } = getPlayerState();
    if (repeat && track) load(track);
    else step(1);
  }, [load, step]);

  useEffect(() => () => audioRef.current?.pause(), []);

  return { load, toggle, seek, next, previous: () => step(-1) };
}
