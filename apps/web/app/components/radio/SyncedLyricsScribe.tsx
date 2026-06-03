"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type LyricLine = {
  id: string;
  time: number | null;
  text: string;
  source: "catalog" | "imported" | "draft";
  verified: false;
};

type SyncedLyricsScribeProps = {
  audioSrc?: string;
  trackKey: string;
  trackTitle: string;
  transcript?: string;
};

const storagePrefix = "radioVaigyaaniq.react.lyrics.v1.";

function createId(): string {
  return globalThis.crypto?.randomUUID?.() || Math.random().toString(36).slice(2);
}

function formatTime(value: number | null): string {
  if (value === null || Number.isNaN(value)) return "--:--";
  const minutes = Math.floor(value / 60);
  const seconds = Math.floor(value % 60);
  const fraction = Math.floor((value % 1) * 100);
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}.${String(fraction).padStart(2, "0")}`;
}

function parseTimestamp(raw: string): number | null {
  const lrc = raw.match(/\[(\d{1,2}):(\d{2})(?:\.(\d{1,3}))?\]/);
  if (lrc) {
    const [, minutes, seconds, fraction = "0"] = lrc;
    return Number(minutes) * 60 + Number(seconds) + Number(`0.${fraction}`);
  }
  const secondsRange = raw.match(/\[(\d{1,3})(?:\s*-\s*\d{1,3})?\s*(?:sec|second|seconds)/i);
  if (secondsRange) return Number(secondsRange[1]);
  return null;
}

function parseLines(input: string, source: LyricLine["source"]): LyricLine[] {
  return input
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const time = parseTimestamp(line);
      const text = line.replace(/\[\d{1,2}:\d{2}(?:\.\d{1,3})?\]\s*/g, "").trim();
      return { id: createId(), time, text: text || line, source, verified: false };
    });
}

function normalizeAudioSrc(src?: string): string | undefined {
  if (!src) return undefined;
  if (/^(https?:|blob:|data:|\/)/.test(src)) return src;
  return `/radio-html/${src}`;
}

function exportLrc(lines: LyricLine[]): string {
  return lines
    .filter((line) => line.time !== null && line.text.trim())
    .sort((a, b) => (a.time ?? 0) - (b.time ?? 0))
    .map((line) => `[${formatTime(line.time)}] ${line.text}`)
    .join("\n");
}

function exportHkd(trackTitle: string, trackKey: string, lines: LyricLine[]): string {
  return JSON.stringify({
    hkdType: "radio.lyrics.scribe",
    trackTitle,
    trackKey,
    status: "draft",
    verification: "NULL",
    provenance: "local browser scribe; source transcript preserved when available",
    generatedAt: new Date().toISOString(),
    lines
  }, null, 2);
}

export function SyncedLyricsScribe({ audioSrc, trackKey, trackTitle, transcript }: SyncedLyricsScribeProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [draftText, setDraftText] = useState("");
  const [importText, setImportText] = useState("");
  const [lines, setLines] = useState<LyricLine[]>([]);
  const [status, setStatus] = useState("LOCAL DRAFT · NO VERIFIED SYNC CLAIM");
  const resolvedAudioSrc = normalizeAudioSrc(audioSrc);

  useEffect(() => {
    const storageKey = `${storagePrefix}${trackKey}`;
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        setLines(JSON.parse(stored) as LyricLine[]);
        setStatus("LOADED LOCAL SCRIBE STATE · VERIFICATION NULL");
        return;
      }
    } catch {
      setStatus("LOCAL STORAGE READ FAILED · FAIL-CLOSED TO EMPTY DRAFT");
    }
    const catalogLines = transcript ? parseLines(transcript, "catalog") : [];
    setLines(catalogLines);
    setStatus(catalogLines.length ? "CATALOG TRANSCRIPT LOADED · TIMING UNVERIFIED" : "NO CATALOG TRANSCRIPT · START EMPTY DRAFT");
  }, [trackKey, transcript]);

  useEffect(() => {
    try {
      localStorage.setItem(`${storagePrefix}${trackKey}`, JSON.stringify(lines));
    } catch {
      setStatus("LOCAL STORAGE WRITE FAILED · EXPORT MANUALLY");
    }
  }, [lines, trackKey]);

  const activeLineId = useMemo(() => {
    return lines
      .filter((line) => line.time !== null && line.time <= currentTime)
      .sort((a, b) => (b.time ?? 0) - (a.time ?? 0))[0]?.id;
  }, [currentTime, lines]);

  const timedCount = lines.filter((line) => line.time !== null).length;
  const lrcHref = `data:text/plain;charset=utf-8,${encodeURIComponent(exportLrc(lines))}`;
  const hkdHref = `data:application/json;charset=utf-8,${encodeURIComponent(exportHkd(trackTitle, trackKey, lines))}`;

  const markLine = () => {
    const text = draftText.trim();
    if (!text) {
      setStatus("WRITE A LINE BEFORE MARKING TIME");
      return;
    }
    const nextLine: LyricLine = { id: createId(), time: currentTime, text, source: "draft", verified: false };
    setLines((current) => [...current, nextLine].sort((a, b) => (a.time ?? Infinity) - (b.time ?? Infinity)));
    setDraftText("");
    setStatus(`LINE MARKED AT ${formatTime(currentTime)} · DRAFT`);
  };

  const importLines = () => {
    const parsed = parseLines(importText, "imported");
    if (!parsed.length) {
      setStatus("IMPORT EMPTY · NO LINES ADDED");
      return;
    }
    setLines((current) => [...current, ...parsed].sort((a, b) => (a.time ?? Infinity) - (b.time ?? Infinity)));
    setImportText("");
    setStatus(`IMPORTED ${parsed.length} LINES · VERIFICATION NULL`);
  };

  const setLineTime = (id: string) => {
    setLines((current) => current.map((line) => line.id === id ? { ...line, time: currentTime } : line).sort((a, b) => (a.time ?? Infinity) - (b.time ?? Infinity)));
    setStatus(`LINE TIME SET TO ${formatTime(currentTime)} · DRAFT`);
  };

  const removeLine = (id: string) => {
    setLines((current) => current.filter((line) => line.id !== id));
    setStatus("LINE REMOVED FROM LOCAL DRAFT");
  };

  const seekToLine = (line: LyricLine) => {
    if (line.time === null || !audioRef.current) return;
    audioRef.current.currentTime = line.time;
    setCurrentTime(line.time);
  };

  return (
    <section className="radio-lyrics-scribe" id="radioLyricsScribe">
      <div className="radio-lyrics-head">
        <div>
          <p className="radio-react-kicker">Synced Lyrics Scribe</p>
          <h2>{trackTitle}</h2>
          <small>{status}</small>
        </div>
        <div className="radio-lyrics-metrics">
          <b>{lines.length}</b><span>lines</span>
          <b>{timedCount}</b><span>synced</span>
        </div>
      </div>

      <audio
        ref={audioRef}
        className="radio-lyrics-audio"
        controls
        preload="metadata"
        src={resolvedAudioSrc}
        onLoadedMetadata={(event) => setDuration(event.currentTarget.duration || 0)}
        onTimeUpdate={(event) => setCurrentTime(event.currentTarget.currentTime)}
        onPlay={() => setStatus("PLAYHEAD ACTIVE · LOCAL AUDIO")}
        onPause={() => setStatus("PLAYHEAD PAUSED · LOCAL AUDIO")}
      />

      <div className="radio-lyrics-clock">
        <span>{formatTime(currentTime)}</span>
        <div>
          <i style={{ width: `${duration ? Math.min(100, (currentTime / duration) * 100) : 0}%` }} />
        </div>
        <span>{formatTime(duration || null)}</span>
      </div>

      <div className="radio-lyrics-tools">
        <label>
          <span>Draft line</span>
          <textarea value={draftText} onChange={(event) => setDraftText(event.target.value)} placeholder="Write or paste one lyric line, then mark it at the current playhead." />
        </label>
        <div className="radio-lyrics-actions">
          <button onClick={markLine}>Mark Line @ Playhead</button>
          <a href={lrcHref} download={`${trackTitle || "lyrics"}.lrc`}>Export LRC</a>
          <a href={hkdHref} download={`${trackTitle || "lyrics"}.hkd.json`}>Export HKD</a>
        </div>
      </div>

      <details className="radio-lyrics-import">
        <summary>Import timed lines</summary>
        <textarea value={importText} onChange={(event) => setImportText(event.target.value)} placeholder="[00:12.40] lyric line&#10;[00:16.10] next lyric line" />
        <button onClick={importLines}>Import LRC / Transcript</button>
      </details>

      <div className="radio-lyrics-list">
        {lines.length ? lines.map((line) => (
          <div className={line.id === activeLineId ? "active" : ""} key={line.id}>
            <button className="radio-lyrics-time" onClick={() => seekToLine(line)}>{formatTime(line.time)}</button>
            <p>{line.text}</p>
            <small>{line.source.toUpperCase()} · VERIFIED NULL</small>
            <button onClick={() => setLineTime(line.id)}>Set Time</button>
            <button onClick={() => removeLine(line.id)}>Delete</button>
          </div>
        )) : (
          <p className="radio-lyrics-empty">No lyrics loaded. Add draft lines or import LRC text to begin syncing.</p>
        )}
      </div>
    </section>
  );
}
