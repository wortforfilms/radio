// Persistent global audio footer — fixed across route/pane transitions.
// Layout per spec: [meta] [controls + glowing scrubber] [sovereign/social actions].
// Honesty: the LIVE badge appears ONLY for verified live streams (none exist →
// LOCAL/PREVIEW badges); track metadata comes from the real catalogue; the gift
// node carries the mandated tooltip and queues an INTENT only.
import React from "react";
import { useAudio } from "../hooks/use-audio";
import { queueIntent, setPlayerState, usePlayerStore } from "../store/player-store";

const fmt = (seconds: number): string => {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
};

export function AudioFooter() {
  const state = usePlayerStore();
  const { toggle, seek, next, previous } = useAudio();
  const { track } = state;
  const limit = track?.access === "preview" ? track.previewSeconds : state.duration;

  const onScrub = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!track || !limit) return;
    const rect = event.currentTarget.getBoundingClientRect();
    seek(((event.clientX - rect.left) / rect.width) * limit);
  };

  const toggleMap = (key: "favorites" | "likes" | "saved") => {
    if (!track) return;
    const map = { ...state[key], [track.id]: !state[key][track.id] };
    setPlayerState({ [key]: map } as never);
    queueIntent(key === "favorites" ? "star" : key === "likes" ? "like" : "save", { trackId: track.id, value: map[track.id] });
  };

  const favCount = Object.values(state.favorites).filter(Boolean).length;
  const progress = limit ? Math.min(100, (state.currentTime / limit) * 100) : 0;

  return (
    <footer className="audio-footer">
      <div className="af-meta">
        <div className="af-thumb">
          {track?.coverUrl && <img src={track.coverUrl} alt="" width={46} height={46} style={{ borderRadius: 7, objectFit: "cover" }} />}
          <span className={`af-badge ${track?.live ? "live" : "local"}`}>{track?.live ? "● LIVE" : track?.access === "preview" ? "PREVIEW" : "LOCAL"}</span>
        </div>
        <div className="af-title">
          <b>{track?.title ?? "Tune a lane to begin"}</b>
          <small>{track?.subtitle ?? "Radio Vaigyaaniq · fail-closed catalogue"}</small>
        </div>
      </div>

      <div className="af-center">
        <div className="af-controls">
          <button className={`af-ctl ${state.shuffle ? "on" : ""}`} title="Shuffle" onClick={() => setPlayerState({ shuffle: !state.shuffle })}>🔀</button>
          <button className="af-ctl" title="Previous" onClick={previous}>⏮</button>
          <button className="af-play" title={state.playing ? "Pause" : "Play"} onClick={toggle}>
            {state.playing ? "⏸" : "▶"}
          </button>
          <button className="af-ctl" title="Next" onClick={next}>⏭</button>
          <button className={`af-ctl ${state.repeat ? "on" : ""}`} title="Repeat" onClick={() => setPlayerState({ repeat: !state.repeat })}>🔁</button>
        </div>
        <div className="scrub">
          <time>{fmt(state.currentTime)}</time>
          <div className="scrub-bar" onClick={onScrub}>
            <span className="scrub-fill" style={{ width: `${progress}%` }} />
            <span className="scrub-thumb" style={{ left: `${progress}%` }} />
          </div>
          <time>{track?.access === "preview" ? `${fmt(limit || 0)} preview` : fmt(state.duration)}</time>
        </div>
      </div>

      <div className="af-actions">
        <button className="af-action" title="Favourite" onClick={() => toggleMap("favorites")}>
          {track && state.favorites[track.id] ? "⭐" : "☆"}<span className="count">{favCount}</span>
        </button>
        <button className="af-action" title="Like" onClick={() => toggleMap("likes")}>
          {track && state.likes[track.id] ? "❤️" : "🤍"}
        </button>
        <button className="af-action" title="Discussion (community threads planned)" onClick={() => track && queueIntent("comment-intent", { trackId: track.id })}>
          💬
        </button>
        <button className="af-action" title="Share" onClick={() => track && queueIntent("share-intent", { trackId: track.id })}>
          🔗
        </button>
        <button className="af-action" title="Bookmark" onClick={() => toggleMap("saved")}>
          {track && state.saved[track.id] ? "🔖" : "📄"}
        </button>
        <button className="af-action" onClick={() => track && queueIntent("gift-intent", { trackId: track.id })}>
          🎁
          <span className="tip">Gift intent shows payment NULL until verification</span>
        </button>
      </div>
    </footer>
  );
}
