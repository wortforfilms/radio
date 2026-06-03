"use client";

import { useEffect, useMemo, useState } from "react";
import { AudioVisualizerPro } from "./AudioVisualizerPro";
import { SyncedLyricsScribe } from "./SyncedLyricsScribe";
import type { RadioCatalog, RadioTrack, TtsPersonaKey } from "./radioTypes";
import { buildAnnouncementText, buildSamayaState, currentFrequency, loadRadioCatalog, ttsPersonas } from "./radioRuntime";

export function RadioVaigyaaniqDashboard() {
  const [catalog, setCatalog] = useState<RadioCatalog | null>(null);
  const [stationIndex, setStationIndex] = useState(0);
  const [trackIndex, setTrackIndex] = useState(0);
  const [clock, setClock] = useState("00:00:00 DRAFT");
  const [persona, setPersona] = useState<TtsPersonaKey>("maataa");
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [voiceIndex, setVoiceIndex] = useState("");
  const [ttsStatus, setTtsStatus] = useState("LOCAL BROWSER TTS · VOICE EVIDENCE NULL UNTIL DEVICE VOICE EXISTS");
  const [social, setSocial] = useState<Record<string, { liked: boolean; saved: boolean }>>({});
  const [modal, setModal] = useState<string | null>(null);

  useEffect(() => {
    loadRadioCatalog().then(setCatalog).catch((error) => {
      setModal(`Catalog load failed: ${error.message}`);
    });
    try {
      setSocial(JSON.parse(localStorage.getItem("radioVaigyaaniq.react.social.v1") || "{}"));
    } catch {
      setSocial({});
    }
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => setClock(`${new Date().toTimeString().split(" ")[0]} DRAFT`), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const loadVoices = () => {
      if (!("speechSynthesis" in window)) {
        setTtsStatus("TTS BLOCKED · BROWSER SPEECHSYNTHESIS UNAVAILABLE");
        return;
      }
      const nextVoices = speechSynthesis.getVoices();
      setVoices(nextVoices);
      setTtsStatus(nextVoices.length
        ? `LOCAL BROWSER TTS · ${nextVoices.length} DEVICE VOICES DISCOVERED · SERVER AUDIO EVIDENCE NULL`
        : "TTS READY · NO DEVICE VOICES REPORTED YET");
    };
    loadVoices();
    if ("speechSynthesis" in window) speechSynthesis.onvoiceschanged = loadVoices;
  }, []);

  const station = catalog?.shows[stationIndex];
  const track = station?.songs[trackIndex] as RadioTrack | undefined;
  const samaya = useMemo(() => {
    if (!station || !track) return null;
    return buildSamayaState(station, track, stationIndex, trackIndex);
  }, [station, stationIndex, track, trackIndex]);
  const socialKey = encodeURIComponent(track?.t || "unknown");
  const lyricsKey = encodeURIComponent(`${station?.name || "station"}::${trackIndex}::${track?.t || "unknown"}`);
  const socialState = social[socialKey] || { liked: false, saved: false };

  const updateSocial = (patch: Partial<{ liked: boolean; saved: boolean }>) => {
    const next = { ...social, [socialKey]: { ...socialState, ...patch } };
    setSocial(next);
    localStorage.setItem("radioVaigyaaniq.react.social.v1", JSON.stringify(next));
  };

  const speakAnnouncement = () => {
    if (!station || !track || !samaya) return;
    if (!("speechSynthesis" in window) || typeof SpeechSynthesisUtterance === "undefined") {
      setTtsStatus("TTS BLOCKED · BROWSER SPEECHSYNTHESIS UNAVAILABLE");
      return;
    }
    const selectedPersona = ttsPersonas[persona];
    const utterance = new SpeechSynthesisUtterance(`${selectedPersona.prefix} ${buildAnnouncementText(station, track, samaya)}`);
    const selectedVoice = voiceIndex ? voices[Number(voiceIndex)] : voices.find((voice) => selectedPersona.langHints.includes(voice.lang));
    if (selectedVoice) utterance.voice = selectedVoice;
    utterance.rate = selectedPersona.rate;
    utterance.pitch = selectedPersona.pitch;
    utterance.lang = selectedVoice?.lang || selectedPersona.langHints[0] || "hi-IN";
    utterance.onstart = () => setTtsStatus(`SPEAKING · ${selectedPersona.label.toUpperCase()} · ${utterance.lang} · LOCAL BROWSER TTS`);
    utterance.onend = () => setTtsStatus(`READY · ${selectedPersona.label.toUpperCase()} · SERVER AUDIO EVIDENCE NULL`);
    utterance.onerror = () => setTtsStatus("TTS ERROR · DEVICE VOICE FAILED CLOSED");
    speechSynthesis.cancel();
    speechSynthesis.speak(utterance);
  };

  const stopTts = () => {
    if ("speechSynthesis" in window) speechSynthesis.cancel();
    setTtsStatus("STOPPED · LOCAL BROWSER TTS");
  };

  if (!catalog || !station || !track || !samaya) {
    return (
      <main className="radio-react-shell">
        <section className="radio-react-loading">Loading Radio Vaigyaaniq catalog...</section>
      </main>
    );
  }

  return (
    <main className="radio-react-shell">
      <aside className="radio-react-sidebar">
        <div>
          <p>RSSI: <span>{catalog.total_songs} songs</span><br />DATA RATE: <span>{catalog.total_clips} clips</span></p>
          <nav>
            <a href="/dashboard">HOME</a>
            <a href="/radio" className="active">RADIO</a>
            <button onClick={() => document.getElementById("radioSamaya")?.scrollIntoView({ behavior: "smooth" })}>Hemant Samwat</button>
            <button onClick={() => document.getElementById("radioSamaya")?.scrollIntoView({ behavior: "smooth" })}>Muhurta</button>
            <button onClick={() => document.getElementById("radioVisualizer")?.scrollIntoView({ behavior: "smooth" })}>3D Visualizer</button>
            <button onClick={() => document.getElementById("radioLyricsScribe")?.scrollIntoView({ behavior: "smooth" })}>Lyrics Scribe</button>
            <a href="/radio-html/Radio_Vaigyaaniq_UX_Dashboard.html">HTML Prototype</a>
          </nav>
        </div>
        <div className="radio-react-pcu">PCU Grid System<br /><span>React absorbed runtime</span></div>
      </aside>

      <section className="radio-react-main">
        <header className="radio-react-topbar">
          <div>
            <h1>RADIO <span>VAIGYAANIQ</span></h1>
            <p>React component runtime · preserved HTML prototype still available</p>
          </div>
          <div className="radio-react-clock">CURRENT SAMAYA STATE<br /><b>{clock}</b></div>
        </header>

        <section className="radio-react-hero">
          <img src="/radio-html/assets/radio-vaigyaaniq-divine-hero.png" alt="" />
          <div>
            <p>Quantum Resonance Tuner</p>
            <h2>{currentFrequency(stationIndex)} <span>MHz</span></h2>
            <strong>{station.name}</strong>
          </div>
          <div className="radio-react-hud">
            <b>{track.t}</b>
            <span>PHKD FAIL-CLOSED · LOCAL DRAFT</span>
          </div>
        </section>

        <section className="radio-react-grid">
          {catalog.shows.slice(0, 9).map((item, index) => (
            <button className={index === stationIndex ? "active" : ""} key={item.name} onClick={() => { setStationIndex(index); setTrackIndex(0); }}>
              <img src={item.hero || item.songs[0]?.c || ""} alt="" />
              <b>{item.name}</b>
              <span>{item.count} tracks</span>
            </button>
          ))}
        </section>

        <section className="radio-react-panel" id="radioSamaya">
          <div>
            <p className="radio-react-kicker">Hemant Samwat Samaya</p>
            <h2>{samaya.day} · Hemant Samwat Day {samaya.samwatDay}</h2>
            <p>{samaya.announcement}</p>
            <div className="radio-react-tts">
              <select value={persona} onChange={(event) => setPersona(event.target.value as TtsPersonaKey)}>
                {Object.entries(ttsPersonas).map(([key, value]) => <option key={key} value={key}>{value.label}</option>)}
              </select>
              <select value={voiceIndex} onChange={(event) => setVoiceIndex(event.target.value)}>
                <option value="">Browser default voice</option>
                {voices.map((voice, index) => <option key={`${voice.name}-${voice.lang}`} value={index}>{voice.name} · {voice.lang}</option>)}
              </select>
              <button onClick={speakAnnouncement}>Speak</button>
              <button onClick={stopTts}>Stop</button>
            </div>
            <small>{ttsStatus}</small>
          </div>
          <div>
            <p className="radio-react-kicker">Vishaya Vaachan</p>
            <h2>{samaya.subject}</h2>
            <p>{samaya.mantra}</p>
            <p>{samaya.utsav} · {samaya.muhurt}</p>
          </div>
        </section>

        <section id="radioVisualizer">
          <AudioVisualizerPro />
        </section>

        <SyncedLyricsScribe audioSrc={track.a} trackKey={lyricsKey} trackTitle={track.t} transcript={track.ly} />

        <section className="radio-react-panel">
          <div>
            <p className="radio-react-kicker">Station Tracks</p>
            <h2>{station.name}</h2>
            <div className="radio-react-track-list">
              {station.songs.slice(0, 12).map((item, index) => (
                <button className={index === trackIndex ? "active" : ""} key={`${item.t}-${index}`} onClick={() => setTrackIndex(index)}>
                  <img src={item.c || station.hero || ""} alt="" />
                  <span>{item.t}</span>
                  <small>{item.d || "--"}</small>
                </button>
              ))}
            </div>
          </div>
        </section>
      </section>

      <footer className="radio-react-footer">
        <span>LIVE</span>
        <b>{track.t}</b>
        <small>{track.r || catalog.artist} · {station.name}</small>
        <button onClick={() => updateSocial({ liked: !socialState.liked })}>{socialState.liked ? "Liked" : "Like"}</button>
        <button onClick={() => updateSocial({ saved: !socialState.saved })}>{socialState.saved ? "Saved" : "Save"}</button>
        <button onClick={speakAnnouncement}>Speak</button>
        <button onClick={() => setModal("Gift action staged locally. Checkout, payment, wallet, receipt, and delivery evidence are NULL until explicitly verified.")}>Gift</button>
      </footer>

      {modal ? (
        <div className="radio-react-modal" onClick={() => setModal(null)}>
          <div onClick={(event) => event.stopPropagation()}>
            <h2>Radio Vaigyaaniq</h2>
            <p>{modal}</p>
            <button onClick={() => setModal(null)}>Close</button>
          </div>
        </div>
      ) : null}
    </main>
  );
}
