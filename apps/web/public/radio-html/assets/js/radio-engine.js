(function () {
  "use strict";

  const DEFAULT_DB = "RadioVaigyaaniqEngineDB";

  // -------------------------------------------------------------------------
  // Commerce (inlined mirror of packages/shared/src/commerce.ts — keep in sync).
  // Money is in MINOR units (paise / cents). Prices here are display hints only;
  // the Next.js /api/payments/order route is the pricing authority.
  // -------------------------------------------------------------------------
  const DEFAULT_SINGLE_PRICE = { INR: 2900, USD: 99 }; // ₹29.00 / $0.99
  const ALL_ACCESS_PRICE = { INR: 29900, USD: 999 }; // ₹299.00 / $9.99
  const DEFAULT_PREVIEW_SECONDS = 45;

  function trackPriceMinor(track, currency) {
    const v = currency === "INR" ? track.priceInr : track.priceUsd;
    return v == null ? DEFAULT_SINGLE_PRICE[currency] : v;
  }

  function formatMoney(minor, currency) {
    return (currency === "INR" ? "₹" : "$") + (minor / 100).toFixed(2);
  }

  function hasTrackAccess(entitlements, track) {
    return (entitlements || []).some((e) => {
      if (e.active === false) return false;
      if (e.scope === "all_access") return true;
      if (e.scope === "album") return Boolean(track.albumId) && e.albumId === track.albumId;
      if (e.scope === "track") return e.trackId === (track.trackId || track.id);
      return false;
    });
  }

  function canPlayFull(entitlements, track) {
    return track.published === true && hasTrackAccess(entitlements, track);
  }

  function previewSecondsFor(track) {
    return track.previewSeconds == null ? DEFAULT_PREVIEW_SECONDS : track.previewSeconds;
  }

  // Strict commerce state (mirrors trackAccessState): full | preview | locked.
  function trackAccessState(entitlements, track) {
    if (canPlayFull(entitlements, track)) return "full";
    return track.published ? "preview" : "locked";
  }

  function walletBalance(wallets, currency) {
    const wallet = (wallets || []).find((w) => w.currency === currency);
    return wallet ? wallet.balance : 0;
  }

  // TTS personas for announcements (maps TtsPersonaKey from radioTypes.ts).
  // Phase 10: each persona supports language variants (persona-<lang>, e.g.
  // samaya-ta). Actual voice availability depends on the OS speech voices —
  // speak() falls back to the closest available voice and logs the substitution.
  const TTS_LANGUAGES = {
    hi: "hi-IN", en: "en-IN", ta: "ta-IN", te: "te-IN", kn: "kn-IN", bn: "bn-IN", mr: "mr-IN", gu: "gu-IN"
  };
  const TTS_PERSONAS = {
    maataa: { label: "Maataa", lang: "hi-IN", rate: 0.85, pitch: 0.8 },
    rishi: { label: "Rishi", lang: "hi-IN", rate: 0.78, pitch: 0.6 },
    samaya: { label: "Samaya", lang: "hi-IN", rate: 1.0, pitch: 1.0 },
    vigyaaniq: { label: "Vigyaaniq", lang: "en-IN", rate: 1.08, pitch: 1.15 }
  };

  // Defaults mirror UserSettingsLike DEFAULT_SETTINGS (+ ttsPersona for the engine).
  const DEFAULT_SETTINGS = {
    language: "hi",
    preferredCurrency: "INR",
    audioQuality: "standard",
    autoplay: true,
    theme: "dark",
    ttsPersona: "samaya"
  };

  class RadioEngine {
    constructor(options) {
      this.options = {
        manifestUrl: "./data/radio-engine-manifest.json",
        lyricsUrl: "./data/lyrics-prompter-data.json",
        contentUrl: "./data/radio-content.json",
        apiBase: null,
        dbName: DEFAULT_DB,
        ids: {},
        ...options
      };
      this.ids = {
        audio: "radioAudio",
        status: "engineStatus",
        stationList: "stationList",
        scheduleList: "scheduleList",
        nowCover: "nowCover",
        nowTitle: "nowTitle",
        nowMeta: "nowMeta",
        nowAccess: "nowAccess",
        playFirst: "playFirst",
        playLive: "playLive",
        nextProgram: "nextProgram",
        cacheStation: "cacheStation",
        announceWeather: "announceWeather",
        playAd: "playAd",
        buyCurrent: "buyCurrent",
        giftCurrent: "giftCurrent",
        agentDj: "agentDj",
        agentQuery: "agentQuery",
        agentAsk: "agentAsk",
        agentFeedback: "agentFeedback",
        agentUp: "agentUp",
        agentDown: "agentDown",
        catalogSearch: "catalogSearch",
        catalogGrid: "catalogGrid",
        walletBox: "walletBox",
        walletTopUp: "walletTopUp",
        personaSelect: "personaSelect",
        languageSelect: "languageSelect",
        lowBandwidth: "lowBandwidth",
        netStatus: "netStatus",
        weatherBox: "weatherBox",
        lyricsPanel: "lyricsPanel",
        storyToggle: "storyToggle",
        storyModal: "storyModal",
        storyTitle: "storyTitle",
        storyMeta: "storyMeta",
        storyBody: "storyBody",
        storyClose: "storyClose",
        versionSelect: "versionSelect",
        ...this.options.ids
      };
      this.manifest = null;
      this.stations = [];
      this.songs = [];
      this.programIndexByTrack = new Map();
      this.activeStation = null;
      this.activeProgramIndex = 0;
      this.activeProgram = null;
      this.previewLimitSeconds = null;
      this.audio = null;
      this.statusEl = null;
      this.db = null;
      this.ctx = null;
      this.gain = null;
      this.lyricsByTrack = null;
      this.contentByTrack = null; // content library: storylines, redactions, versions
      this.versionGroups = new Map(); // versionGroup -> [{trackId, version}]
      this.activeCues = [];
      this.settings = this.loadLocal("rv.settings", DEFAULT_SETTINGS);
      this.userId = this.ensureUserId();
      this.entitlements = this.loadLocal("rv.entitlements", []);
      this.wallets = this.loadLocal("rv.wallets", []);
    }

    async init() {
      this.audio = this.el("audio");
      this.statusEl = this.el("status");
      this.log("Booting Radio Vaigyaaniq engine...");
      await this.registerServiceWorker();
      this.db = await this.openDb().catch((error) => {
        this.log(`IndexedDB blocked: ${error.message}`);
        return null;
      });
      this.manifest = await this.loadManifest();
      this.stations = this.manifest.stations || [];
      this.songs = this.manifest.offlineBundle?.songs || [];
      this.commerce = this.manifest.commerce || {
        mode: "operator-demo",
        currencyDefault: "INR",
        previewSecondsDefault: DEFAULT_PREVIEW_SECONDS
      };
      this.indexPrograms();
      this.renderStations();
      this.renderCatalog();
      this.renderWallet();
      this.renderPersonas();
      this.bindControls();
      this.bindNetwork();
      this.refreshEntitlements().catch(() => undefined);
      this.renderWeather().catch(() => undefined);
      this.refreshLiveStatus().catch(() => undefined);
      this.log(
        [
          `Manifest: ${this.manifest.id}`,
          `Stations: ${this.stations.length}`,
          `Programs: ${this.manifest.counts?.programs || 0}`,
          `Catalog tracks: ${this.songs.length} (free: ${this.manifest.counts?.freeTracks ?? "NULL"})`,
          `Commerce mode: ${this.commerce.mode}`,
          `Live streams verified: ${Boolean(this.manifest.phkd?.liveStreamsVerified)}`,
          `Ads: ${this.manifest.counts?.ads || 0}`,
          `Weather providers: ${this.manifest.counts?.weatherProviders || 0}`
        ].join("\n")
      );
      if (this.stations[0]) this.selectStation(this.stations[0].slug, { autoplay: false });
      this.flushOutbox().catch(() => undefined);
    }

    async loadManifest() {
      if (this.options.apiBase) {
        try {
          const stationsResponse = await fetch(`${this.options.apiBase}/api/stations`);
          if (stationsResponse.ok) {
            const stations = await stationsResponse.json();
            const evidenceResponse = await fetch(`${this.options.apiBase}/api/evidence`);
            const evidence = evidenceResponse.ok ? await evidenceResponse.json() : {};
            const bundleResponse = await fetch(
              `${this.options.apiBase}/api/offline-bundle?userId=${encodeURIComponent(this.userId)}`
            );
            const bundle = bundleResponse.ok ? await bundleResponse.json() : null;
            return {
              id: "radio-vaigyaaniq-backend-runtime",
              generatedAt: new Date().toISOString(),
              status: "backend-connected",
              verificationState: evidence.verificationState || "backend-evidence-partial",
              phkd: evidence.phkd || {},
              commerce: evidence.commerce || null,
              counts: {
                ...(evidence.counts || {}),
                stations: stations.length,
                programs: stations.flatMap((station) => station.programs || []).length
              },
              stations,
              ads: [],
              weather: { status: "unknown" },
              offlineBundle: bundle || { songs: [] }
            };
          }
        } catch (error) {
          this.log(`Backend unavailable, using local manifest: ${error.message}`);
        }
      }
      const response = await fetch(this.options.manifestUrl, { cache: "no-cache" });
      if (!response.ok) throw new Error(`Unable to load manifest: ${response.status}`);
      return response.json();
    }

    indexPrograms() {
      this.programIndexByTrack.clear();
      this.versionGroups.clear();
      for (const station of this.stations) {
        (station.programs || []).forEach((program, index) => {
          if (program.trackId && !this.programIndexByTrack.has(program.trackId)) {
            this.programIndexByTrack.set(program.trackId, { stationSlug: station.slug, index });
          }
          if (program.versionGroup && program.versionCount > 1) {
            if (!this.versionGroups.has(program.versionGroup)) this.versionGroups.set(program.versionGroup, []);
            this.versionGroups.get(program.versionGroup).push({ trackId: program.trackId, version: program.version });
          }
        });
      }
    }

    // Display title: stylised (content library) with plain-title fallback.
    displayTitle(item) {
      return item?.stylizedTitle || item?.title || "Untitled";
    }

    async loadContentLibrary() {
      if (this.contentByTrack) return this.contentByTrack;
      try {
        const response = await fetch(this.options.contentUrl, { cache: "force-cache" });
        const data = await response.json();
        this.contentByTrack = new Map((data.tracks || []).map((record) => [record.id, record]));
      } catch {
        this.contentByTrack = new Map();
      }
      return this.contentByTrack;
    }

    // -----------------------------------------------------------------------
    // Access decisions
    // -----------------------------------------------------------------------
    // Strict lane uses trackAccessState (published + entitlement, fail-closed).
    // In "operator-demo" mode (rights not closed yet, nothing published) the local
    // catalog stays operable: free-tier/entitled tracks play full, everything else
    // is clamped to the 45s preview — but no rights claims are made anywhere.
    accessStateFor(track) {
      if (!track) return "locked";
      if (this.commerce.mode === "live") return trackAccessState(this.entitlements, track);
      if (track.freeTier || hasTrackAccess(this.entitlements, track)) return "full";
      return "preview";
    }

    accessBadge(track) {
      const state = this.accessStateFor(track);
      if (state === "locked") return { state, label: "LOCKED", cls: "badge-locked" };
      if (track.freeTier) return { state, label: "FREE", cls: "badge-free" };
      if (hasTrackAccess(this.entitlements, track)) return { state, label: "OWNED", cls: "badge-owned" };
      const currency = this.settings.preferredCurrency || "INR";
      return {
        state,
        label: `PREVIEW · ${formatMoney(trackPriceMinor(track, currency), currency)}`,
        cls: "badge-preview"
      };
    }

    // -----------------------------------------------------------------------
    // Rendering
    // -----------------------------------------------------------------------
    bindControls() {
      this.el("playFirst")?.addEventListener("click", () => this.playProgram(0));
      this.el("playLive")?.addEventListener("click", () => this.playLiveStream());
      this.el("nextProgram")?.addEventListener("click", () => this.playProgram(this.activeProgramIndex + 1));
      this.el("cacheStation")?.addEventListener("click", () => this.cacheActiveStation());
      this.el("announceWeather")?.addEventListener("click", () => this.announceWeather());
      this.el("playAd")?.addEventListener("click", () => this.playAdGate());
      this.el("buyCurrent")?.addEventListener("click", () => this.buyCurrent());
      this.el("giftCurrent")?.addEventListener("click", () => this.giftCurrent());
      this.el("agentDj")?.addEventListener("click", () => this.agentAutoDj());
      this.el("agentUp")?.addEventListener("click", () => this.rateAgent("up"));
      this.el("agentDown")?.addEventListener("click", () => this.rateAgent("down"));
      this.el("agentAsk")?.addEventListener("click", () => this.askAgent());
      this.el("agentQuery")?.addEventListener("keydown", (event) => {
        if (event.key === "Enter") this.askAgent();
      });
      this.el("walletTopUp")?.addEventListener("click", () => this.topUpWallet());
      this.el("catalogSearch")?.addEventListener("input", (event) => this.renderCatalog(event.target.value));
      this.el("personaSelect")?.addEventListener("change", (event) => {
        this.settings.ttsPersona = event.target.value;
        this.saveLocal("rv.settings", this.settings);
        this.log(`TTS persona set: ${event.target.value}`);
      });
      this.el("languageSelect")?.addEventListener("change", (event) => {
        this.settings.ttsLanguage = event.target.value;
        this.saveLocal("rv.settings", this.settings);
        this.log(`Announcement language set: ${event.target.value} (voice availability depends on your OS).`);
      });
      this.el("lowBandwidth")?.addEventListener("change", (event) => {
        this.settings.lowBandwidth = event.target.checked;
        this.saveLocal("rv.settings", this.settings);
        if (this.audio) this.audio.preload = event.target.checked ? "none" : "metadata";
        this.renderCatalog(this.el("catalogSearch")?.value);
        this.log(`Low-bandwidth mode ${event.target.checked ? "ON — covers skipped, preload off, AI asks disabled" : "off"}.`);
      });
      this.el("storyToggle")?.addEventListener("click", () => this.openStory());
      this.el("storyClose")?.addEventListener("click", () => this.closeStory());
      this.el("storyModal")?.addEventListener("click", (event) => {
        if (event.target === this.el("storyModal")) this.closeStory();
      });
      document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") this.closeStory();
      });
      this.el("versionSelect")?.addEventListener("change", (event) => {
        if (event.target.value) this.playTrackById(event.target.value);
      });
      this.audio?.addEventListener("ended", () => this.playProgram(this.activeProgramIndex + 1));
      this.audio?.addEventListener("play", () => this.ensureAudioGraph());
      this.audio?.addEventListener("timeupdate", () => this.onTimeUpdate());
    }

    // Phase 7: TTL-cached live flags from the backend (verified streams only).
    async refreshLiveStatus() {
      if (!this.options.apiBase) return;
      try {
        const response = await fetch(this.apiUrl("/api/live-status"));
        if (!response.ok) return;
        const data = await response.json();
        this.liveStatus = new Map((data.stations || []).map((entry) => [entry.slug, entry]));
        this.renderStations();
      } catch {
        // offline — badges fall back to manifest streamStatus
      }
    }

    renderStations() {
      const root = this.el("stationList");
      if (!root) return;
      root.innerHTML = this.stations
        .map((station) => {
          const live = this.liveStatus?.get(station.slug);
          const badge = live
            ? live.live
              ? '<span class="badge badge-free">LIVE</span>'
              : '<span class="badge badge-locked">OFFLINE</span>'
            : "";
          return `<button class="station" data-station="${esc(station.slug)}">
            <b>${esc(station.name)} ${badge}</b>
            <small>${esc(station.totalPrograms)} programs · stream ${esc(live?.reason || station.streamStatus || "NULL")}</small>
          </button>`;
        })
        .join("");
      root.querySelectorAll("[data-station]").forEach((button) => {
        button.addEventListener("click", () => this.selectStation(button.dataset.station, { autoplay: false }));
      });
    }

    renderCatalog(query) {
      const root = this.el("catalogGrid");
      if (!root) return;
      const q = String(query || "").trim().toLowerCase();
      const matches = (q
        ? this.songs.filter((song) =>
            [song.title, song.stylizedTitle, song.slug, song.version, ...(song.tags || []), song.stationSlug]
              .filter(Boolean)
              .join(" ")
              .toLowerCase()
              .includes(q)
          )
        : this.songs
      ).slice(0, 60);
      root.innerHTML = matches
        .map((song) => {
          const badge = this.accessBadge(song);
          const versionTag = song.version && song.version !== "original" ? ` <small>(${esc(song.version)})</small>` : "";
          const cover = this.settings.lowBandwidth
            ? '<span class="cat-title" style="opacity:.4">♪</span>'
            : `<img loading="lazy" src="${esc(toRelative(song.coverUrl || ""))}" alt="">`;
          return `<button class="cat-item" data-track="${esc(song.id)}" title="${esc(this.displayTitle(song))}">
            ${cover}
            <span class="cat-title">${esc(song.title)}${versionTag}</span>
            <span class="badge ${badge.cls}">${esc(badge.label)}</span>
          </button>`;
        })
        .join("");
      const counter = document.getElementById("catalogCount");
      if (counter) counter.textContent = `${matches.length} / ${this.songs.length}`;
      root.querySelectorAll("[data-track]").forEach((button) => {
        button.addEventListener("click", () => this.playTrackById(button.dataset.track));
      });
    }

    renderWallet() {
      const root = this.el("walletBox");
      if (!root) return;
      const inr = formatMoney(walletBalance(this.wallets, "INR"), "INR");
      const usd = formatMoney(walletBalance(this.wallets, "USD"), "USD");
      const owned = this.entitlements.filter((e) => e.active !== false).length;
      root.innerHTML = `<b>${esc(inr)}</b> · <b>${esc(usd)}</b><small>entitlements: ${owned}${
        this.entitlementSource ? ` · source: ${esc(this.entitlementSource)}` : ""
      }</small>`;
    }

    renderPersonas() {
      const select = this.el("personaSelect");
      if (!select) return;
      select.innerHTML = Object.entries(TTS_PERSONAS)
        .map(([key, persona]) => `<option value="${key}">${esc(persona.label)}</option>`)
        .join("");
      select.value = this.settings.ttsPersona || "samaya";
    }

    async renderWeather() {
      const root = this.el("weatherBox");
      if (!root) return;
      if (!this.options.apiBase) {
        root.textContent = "Weather blocked: backend not connected (provider NULL).";
        return;
      }
      try {
        const response = await fetch(`${this.options.apiBase}/api/weather`);
        const data = await response.json();
        root.textContent =
          data.status === "ok"
            ? `${data.city}: ${data.announcementText.replace(/^Current weather in [^:]+: /, "")}`
            : `Weather blocked: ${data.message || data.status}`;
        this.weatherText = data.announcementText || null;
      } catch (error) {
        root.textContent = `Weather fetch failed: ${error.message}`;
      }
    }

    selectStation(slug, options = {}) {
      const station = this.stations.find((candidate) => candidate.slug === slug);
      if (!station) return;
      this.activeStation = station;
      this.activeProgramIndex = 0;
      this.el("stationList")?.querySelectorAll("[data-station]").forEach((button) => {
        button.classList.toggle("active", button.dataset.station === slug);
      });
      this.renderSchedule();
      this.renderNow(station.programs?.[0] || null);
      this.log(`Selected station: ${station.name}\nLive stream: ${station.streamUrl || "NULL"}\nFallback: ${station.fallbackUrl || "NULL"}`);
      if (options.autoplay) this.playProgram(0);
    }

    renderSchedule() {
      const root = this.el("scheduleList");
      if (!root || !this.activeStation) return;
      root.innerHTML = (this.activeStation.programs || [])
        .slice(0, 80)
        .map((program, index) => {
          const badge = this.accessBadge(program);
          return `<button class="program" data-program="${index}">
            <b>${esc(program.sequenceIndex)}. ${esc(this.displayTitle(program))}</b>
            <small>${formatOffset(program.estimatedStartOffsetSeconds)} · ${esc(program.durationSeconds || "NULL")}s · <span class="badge ${badge.cls}">${esc(badge.label)}</span></small>
          </button>`;
        })
        .join("");
      root.querySelectorAll("[data-program]").forEach((button) => {
        button.addEventListener("click", () => this.playProgram(Number(button.dataset.program)));
      });
    }

    renderNow(program) {
      const title = this.el("nowTitle");
      const meta = this.el("nowMeta");
      const accessEl = this.el("nowAccess");
      if (title) title.textContent = program ? this.displayTitle(program) : "Select a program";
      this.renderStoryToggle(program);
      this.renderVersionSelect(program);
      if (meta) {
        meta.textContent = program
          ? `${this.activeStation?.name || "Station"} · sequence ${program.sequenceIndex} · rights ${program.rightsStatus || "NULL"}`
          : "No local fallback program available";
      }
      if (accessEl) {
        if (program) {
          const badge = this.accessBadge(program);
          accessEl.innerHTML = `<span class="badge ${badge.cls}">${esc(badge.label)}</span>`;
          const buy = this.el("buyCurrent");
          if (buy) buy.style.display = badge.state === "preview" ? "" : "none";
        } else {
          accessEl.textContent = "";
        }
      }
      const cover = this.el("nowCover");
      if (cover) cover.src = toRelative(program?.coverUrl || "");
      document.querySelectorAll("[data-program]").forEach((button) => {
        button.classList.toggle("active", Number(button.dataset.program) === this.activeProgramIndex);
      });
      this.loadLyrics(program).catch(() => undefined);
    }

    // -----------------------------------------------------------------------
    // Storyline modal + version selector (content library)
    // -----------------------------------------------------------------------
    async renderStoryToggle(program) {
      const toggle = this.el("storyToggle");
      if (!toggle) return;
      if (!program?.trackId || program.hasStoryline === false) {
        toggle.style.display = "none";
        return;
      }
      const library = await this.loadContentLibrary();
      toggle.style.display = library.get(program.trackId)?.storyline ? "" : "none";
    }

    renderVersionSelect(program) {
      const select = this.el("versionSelect");
      if (!select) return;
      const peers = program?.versionGroup ? this.versionGroups.get(program.versionGroup) : null;
      if (!peers || peers.length < 2) {
        select.style.display = "none";
        select.innerHTML = "";
        return;
      }
      select.innerHTML = peers
        .map((peer) => `<option value="${esc(peer.trackId)}">${esc(peer.version)}</option>`)
        .join("");
      select.value = program.trackId;
      select.style.display = "";
    }

    async openStory() {
      const program = this.activeProgram || this.activeStation?.programs?.[this.activeProgramIndex];
      if (!program?.trackId) return;
      const library = await this.loadContentLibrary();
      const record = library.get(program.trackId);
      if (!record?.storyline) {
        this.log("No storyline in the content library for this track.");
        return;
      }
      const modal = this.el("storyModal");
      if (!modal) return;
      const titleEl = this.el("storyTitle");
      const metaEl = this.el("storyMeta");
      const bodyEl = this.el("storyBody");
      if (titleEl) titleEl.textContent = record.stylizedTitle || record.title;
      if (metaEl) {
        metaEl.textContent = [
          record.version !== "original" ? record.version : null,
          record.language,
          record.theme && record.theme !== "Other / Misc" ? record.theme : null,
          record.lyricsStatus
        ]
          .filter(Boolean)
          .join(" · ");
      }
      if (bodyEl) bodyEl.textContent = record.storyline;
      modal.hidden = false;
    }

    closeStory() {
      const modal = this.el("storyModal");
      if (modal) modal.hidden = true;
    }

    // -----------------------------------------------------------------------
    // Playback (rights-aware, fail-closed)
    // -----------------------------------------------------------------------
    playTrackById(trackId) {
      const location = this.programIndexByTrack.get(trackId);
      if (!location) {
        this.log(`Track ${trackId} not found in any station schedule.`);
        return;
      }
      if (this.activeStation?.slug !== location.stationSlug) this.selectStation(location.stationSlug);
      this.playProgram(location.index);
    }

    async playProgram(index) {
      if (!this.activeStation) return;
      const programs = this.activeStation.programs || [];
      if (!programs.length) return;
      const nextIndex = ((index % programs.length) + programs.length) % programs.length;
      const program = programs[nextIndex];
      if (!program?.audioUrl) {
        this.log("Playback blocked: program audioUrl NULL");
        return;
      }
      const access = this.accessStateFor(program);
      if (access === "locked") {
        this.log(`Playback blocked: "${program.title}" is not published (rights not closed) and you hold no entitlement.`);
        return;
      }
      this.activeProgramIndex = nextIndex;
      this.activeProgram = program;
      this.renderNow(program);
      if (access === "preview") {
        // Track preview repetitions — feeds the agent's transparent upsell rule.
        const counts = this.loadLocal("rv.previewCounts", {});
        counts[program.trackId] = (counts[program.trackId] || 0) + 1;
        this.saveLocal("rv.previewCounts", counts);
        // Dedicated preview clip when available; otherwise clamp the full asset.
        const clip = program.previewUrl || null;
        this.previewLimitSeconds = clip ? null : previewSecondsFor(program);
        this.audio.src = toRelative(clip || program.audioUrl);
        const currency = this.settings.preferredCurrency || "INR";
        this.log(
          [
            `Preview (${previewSecondsFor(program)}s) — "${program.title}"`,
            `Unlock full track: ${formatMoney(trackPriceMinor(program, currency), currency)} · all-access ${formatMoney(
              ALL_ACCESS_PRICE[currency],
              currency
            )}`,
            clip ? "Playing dedicated preview clip." : "No preview clip yet — playback clamps at the preview limit."
          ].join("\n")
        );
      } else {
        this.previewLimitSeconds = null;
        this.audio.src = toRelative(program.audioUrl);
      }
      await this.audio.play().catch((error) => this.log(`Playback waiting for user gesture: ${error.message}`));
      this.queueAction("play", {
        trackId: program.trackId,
        stationSlug: this.activeStation.slug,
        access,
        at: new Date().toISOString()
      });
      this.putMetadata("lastProgram", {
        stationSlug: this.activeStation.slug,
        programId: program.id,
        playedAt: new Date().toISOString()
      });
    }

    onTimeUpdate() {
      if (this.previewLimitSeconds != null && this.audio.currentTime >= this.previewLimitSeconds) {
        this.audio.pause();
        const program = this.activeProgram;
        const currency = this.settings.preferredCurrency || "INR";
        this.previewLimitSeconds = null;
        if (program) {
          this.log(
            `Preview ended for "${program.title}". Buy the track (${formatMoney(
              trackPriceMinor(program, currency),
              currency
            )}) to keep listening.`
          );
        }
      }
      this.syncLyrics();
    }

    async playLiveStream() {
      if (!this.activeStation) return;
      if (!this.activeStation.streamUrl) {
        this.log(`Live stream blocked for ${this.activeStation.name}: streamUrl NULL.`);
        return;
      }
      this.renderNow({
        title: `${this.activeStation.name} live stream`,
        sequenceIndex: "LIVE",
        rightsStatus: this.activeStation.streamStatus || "candidate",
        coverUrl: this.activeStation.cover
      });
      this.previewLimitSeconds = null;
      this.audio.src = this.activeStation.streamUrl;
      await this.audio.play().catch((error) => this.log(`Live stream waiting for user gesture: ${error.message}`));
      this.log(
        [
          `Playing live stream candidate: ${this.activeStation.name}`,
          this.activeStation.streamUrl,
          `Status: ${this.activeStation.streamStatus || "candidate-unverified"}`
        ].join("\n")
      );
    }

    // -----------------------------------------------------------------------
    // Agent co-pilot: perception → /agent/decide → execute via existing actions.
    // The agent never bypasses gates — it uses the same rights-aware methods.
    // -----------------------------------------------------------------------
    async agentAutoDj() {
      if (!this.options.apiBase) {
        this.log("Agent blocked: backend not connected (append ?api=http://localhost:4000).");
        return;
      }
      const hourKey = new Date().toISOString().slice(0, 13);
      const rate = this.loadLocal("rv.agentAnnounce", { hour: hourKey, count: 0 });
      const perception = {
        hour: new Date().getHours(),
        userId: this.userId,
        currency: this.settings.preferredCurrency || "INR",
        currentTrackId: this.activeProgram?.trackId || null,
        previewCounts: this.loadLocal("rv.previewCounts", {}),
        announcementsThisHour: rate.hour === hourKey ? rate.count : 0,
        weather: this.weatherText ? { status: "ok", announcementText: this.weatherText } : null
      };
      let decision;
      try {
        const response = await fetch(this.apiUrl("/agent/decide"), {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(perception)
        });
        decision = await response.json();
        if (!response.ok) throw new Error(decision.message || decision.error || response.status);
      } catch (error) {
        this.log(`Agent unavailable: ${error.message}`);
        return;
      }
      this.log(`Agent (${decision.engine}) · ${decision.daypart} · goal: ${decision.goal} · persona: ${decision.persona}`);
      for (const action of decision.actions || []) {
        if (action.type === "select-station") {
          this.selectStation(action.stationSlug);
        } else if (action.type === "play-track") {
          this.playTrackById(action.trackId);
        } else if (action.type === "announce") {
          const previousPersona = this.settings.ttsPersona;
          this.settings.ttsPersona = action.persona || previousPersona;
          if (this.speak(action.text)) this.log(`Agent announce (${action.persona}): ${action.text}`);
          this.settings.ttsPersona = previousPersona;
          this.saveLocal("rv.agentAnnounce", { hour: hourKey, count: perception.announcementsThisHour + 1 });
        } else if (action.type === "recommend") {
          this.log(`Agent recommends: ${(action.titles || []).join(" · ")}`);
        } else if (action.type === "suggest-purchase") {
          this.log(
            `Agent suggestion (transparent): unlock "${action.title}" for ${action.priceLabel} — ${action.reason}. Use Buy Track; checkout runs through ${action.checkout}.`
          );
        }
      }
      for (const reason of decision.blocked || []) this.log(`Agent gate: ${reason}`);
      this.lastDecision = decision; // rated via the 👍/👎 feedback buttons
      const fb = this.el("agentFeedback");
      if (fb) fb.style.display = "";
      this.queueAction("agent-decision", { decisionId: decision.decisionId, daypart: decision.daypart, actions: (decision.actions || []).map((a) => a.type), at: decision.decidedAt });
    }

    // Phase-3: listener feedback on the last agent decision (stored offline-first).
    async rateAgent(rating) {
      const decision = this.lastDecision;
      if (!decision) {
        this.log("Feedback: no agent decision to rate yet.");
        return;
      }
      const payload = {
        decisionId: decision.decisionId,
        rating,
        userId: this.userId,
        evidence: decision.evidence || [],
        persona: decision.persona,
        stationSlug: (decision.actions || []).find((a) => a.type === "select-station")?.stationSlug || null
      };
      this.queueAction("agent-feedback", payload); // offline-first: outbox syncs it
      try {
        if (navigator.onLine && this.options.apiBase) {
          await fetch(this.apiUrl("/api/agent/feedback"), {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify(payload)
          });
        }
      } catch {
        // stays queued in the outbox
      }
      this.log(`Feedback recorded (${rating}) — thanks. It adjusts rule weights via the weekly learning job.`);
    }

    // Phase-2 cognition: ask the agent a question (sources-only, disclosed).
    async askAgent() {
      const input = this.el("agentQuery");
      const query = input?.value?.trim();
      if (!query) return;
      if (this.settings.lowBandwidth) {
        this.log("Ask blocked: low-bandwidth mode limits LLM usage (network-heavy). Disable it to ask.");
        return;
      }
      if (!this.options.apiBase) {
        this.log("Ask blocked: backend not connected.");
        return;
      }
      this.log(`Asking agent: ${query}`);
      let result;
      try {
        const response = await fetch(this.apiUrl("/agent/ask"), {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            query,
            userId: this.userId,
            stationName: this.activeStation?.name || null,
            currentTrackTitle: this.activeProgram ? this.displayTitle(this.activeProgram) : null,
            weather: this.weatherText ? { status: "ok", announcementText: this.weatherText } : null,
            persona: this.settings.ttsPersona
          })
        });
        result = await response.json();
        if (!response.ok) throw new Error(result.message || result.error || response.status);
      } catch (error) {
        this.log(`Agent ask failed: ${error.message}`);
        return;
      }
      for (const action of result.actions || []) {
        if (action.type === "speak") {
          if (this.speak(action.text)) this.log(`Agent (${result.provider || "?"} · ${action.persona}): ${action.text}`);
          else this.log(`Agent answer: ${action.text}`);
        } else if (action.type === "play") {
          this.playTrackById(action.trackId);
        } else if (action.type === "recommend") {
          this.log(`Agent recommends: ${action.title || action.trackId}`);
        }
      }
      if ((result.sources || []).length) {
        this.log(`Sources: ${result.sources.map((source) => source.title).join(" · ")}`);
      }
      for (const reason of result.blocked || []) this.log(`Agent gate: ${reason}`);
      if (input) input.value = "";
      this.queueAction("agent-ask", { query, actions: (result.actions || []).map((a) => a.type), at: new Date().toISOString() });
    }

    // -----------------------------------------------------------------------
    // Commerce actions (server-authoritative; fail-closed on every branch)
    // -----------------------------------------------------------------------
    apiUrl(pathName) {
      return `${this.options.apiBase || ""}${pathName}`;
    }

    buyCurrent() {
      const program = this.activeProgram || this.activeStation?.programs?.[this.activeProgramIndex];
      if (!program?.trackId) {
        this.log("Purchase blocked: no active track.");
        return;
      }
      this.buyTrack(program.trackId);
    }

    async buyTrack(trackId, productType = "track") {
      const currency = this.settings.preferredCurrency || "INR";
      this.log(`Creating ${productType} order for ${trackId} (${currency})...`);
      try {
        const response = await fetch(this.apiUrl("/api/payments/order"), {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ userId: this.userId, productType, trackId, currency })
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
          this.log(`Order blocked (${response.status}): ${(data.messages || [data.error || "unknown"]).join("; ")}`);
          return;
        }
        this.log(
          [
            `Order created: ${data.orderId} · ${formatMoney(data.amount, data.currency)}`,
            "No entitlement until the signature-verified Razorpay webhook confirms capture.",
            "Complete payment in the checkout window, then entitlements refresh automatically."
          ].join("\n")
        );
        this.pollEntitlements();
      } catch (error) {
        this.log(`Order failed: ${error.message} (payments API unreachable).`);
      }
    }

    async topUpWallet() {
      // Wallet top-ups need a server-priced product; the payments API only sells
      // track | album | all_access today, so this stays fail-closed with a clear message.
      this.log(
        "Wallet top-up blocked: /api/payments/order exposes track|album|all_access only. Top-up product not yet defined server-side (PHKD fail-closed — no client-priced orders)."
      );
    }

    giftCurrent() {
      const program = this.activeProgram || this.activeStation?.programs?.[this.activeProgramIndex];
      if (!program?.trackId) {
        this.log("Gift blocked: no active track.");
        return;
      }
      this.queueAction("gift-intent", { trackId: program.trackId, at: new Date().toISOString() });
      this.log(`Gift intent recorded for "${program.title}" (intent only — checkout evidence NULL until paid).`);
    }

    async refreshEntitlements() {
      if (!this.options.apiBase) {
        this.entitlementSource = "local-only";
        this.renderWallet();
        return;
      }
      try {
        const response = await fetch(this.apiUrl(`/api/entitlements/${encodeURIComponent(this.userId)}`));
        if (!response.ok) return;
        const data = await response.json();
        this.entitlementSource = data.status;
        if (data.status === "ok") {
          this.entitlements = data.entitlements || [];
          this.wallets = data.wallets || [];
          this.saveLocal("rv.entitlements", this.entitlements);
          this.saveLocal("rv.wallets", this.wallets);
        }
        this.renderWallet();
        this.renderCatalog(this.el("catalogSearch")?.value);
        if (this.activeStation) this.renderSchedule();
      } catch {
        this.entitlementSource = "unreachable";
      }
    }

    pollEntitlements(attempts = 24, intervalMs = 5000) {
      let remaining = attempts;
      const before = JSON.stringify(this.entitlements);
      const timer = setInterval(async () => {
        remaining -= 1;
        await this.refreshEntitlements();
        if (JSON.stringify(this.entitlements) !== before) {
          clearInterval(timer);
          this.log("Entitlements updated — purchased content unlocked.");
        } else if (remaining <= 0) {
          clearInterval(timer);
          this.log("Entitlement poll ended: no verified webhook yet (payment may still be pending).");
        }
      }, intervalMs);
    }

    // -----------------------------------------------------------------------
    // Offline: cache, outbox, background sync
    // -----------------------------------------------------------------------
    bindNetwork() {
      const update = () => {
        const el = this.el("netStatus");
        const online = navigator.onLine;
        if (el) {
          el.textContent = online ? "ONLINE" : "OFFLINE — cached audio only";
          el.classList.toggle("offline", !online);
        }
        if (online) this.flushOutbox().catch(() => undefined);
      };
      window.addEventListener("online", update);
      window.addEventListener("offline", update);
      navigator.serviceWorker?.addEventListener?.("message", (event) => {
        if (event.data?.type === "flush-outbox") this.flushOutbox().catch(() => undefined);
      });
      update();
    }

    async cacheActiveStation() {
      if (!this.activeStation) return;
      const programs = (this.activeStation.programs || []).slice(0, 24);
      let cached = 0;
      let previewOnly = 0;
      for (const program of programs) {
        const access = this.accessStateFor(program);
        // Rights-aware caching: full audio only for free/entitled tracks;
        // preview-state tracks cache their preview clip when one exists.
        const url = access === "full" ? program.audioUrl : program.previewUrl;
        if (url) {
          await this.cacheUrl(toRelative(url)).catch((error) => this.log(`Cache miss ${program.title}: ${error.message}`));
          cached += 1;
        } else if (access === "preview") {
          previewOnly += 1;
        }
        if (program.coverUrl) {
          await this.cacheUrl(toRelative(program.coverUrl)).catch(() => {});
        }
      }
      this.log(
        `Cache request complete for ${this.activeStation.name}: ${cached} assets queued.` +
          (previewOnly ? ` ${previewOnly} preview-state tracks skipped (no preview clip yet — full audio not cacheable without entitlement).` : "")
      );
    }

    queueAction(type, payload) {
      if (!this.db) return;
      try {
        const tx = this.db.transaction("outbox", "readwrite");
        tx.objectStore("outbox").add({ type, payload, queuedAt: new Date().toISOString() });
        this.registerBackgroundSync();
      } catch {
        // outbox is best-effort evidence, never blocks playback
      }
    }

    async registerBackgroundSync() {
      try {
        const registration = await navigator.serviceWorker?.ready;
        await registration?.sync?.register("radio-outbox");
      } catch {
        // background sync unsupported — the online listener covers the fallback
      }
    }

    async flushOutbox() {
      if (!this.db || !navigator.onLine || !this.options.apiBase) return;
      const events = await new Promise((resolve) => {
        const tx = this.db.transaction("outbox", "readonly");
        const request = tx.objectStore("outbox").getAll();
        request.onsuccess = () => resolve(request.result || []);
        request.onerror = () => resolve([]);
      });
      if (!events.length) return;
      try {
        const response = await fetch(this.apiUrl("/api/sync"), {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ userId: this.userId, events })
        });
        if (!response.ok) return;
        const tx = this.db.transaction("outbox", "readwrite");
        tx.objectStore("outbox").clear();
        this.log(`Outbox synced: ${events.length} offline events delivered.`);
      } catch {
        // stay queued; background sync or the next online event retries
      }
    }

    // -----------------------------------------------------------------------
    // Lyrics (draft LRC cues from lyrics-prompter-data.json — timing unverified)
    // -----------------------------------------------------------------------
    async loadLyrics(program) {
      const panel = this.el("lyricsPanel");
      if (!panel || !program?.trackId) {
        if (panel) panel.textContent = "";
        this.activeCues = [];
        return;
      }
      if (!this.lyricsByTrack) {
        try {
          const response = await fetch(this.options.lyricsUrl, { cache: "force-cache" });
          const data = await response.json();
          this.lyricsByTrack = new Map((data.tracks || []).map((track) => [track.id, track]));
        } catch {
          this.lyricsByTrack = new Map();
        }
      }
      const entry = this.lyricsByTrack.get(program.trackId);
      // Display-layer sanitisation: apply redaction overrides from the content
      // library (raw lyric files stay untouched for audit).
      const library = await this.loadContentLibrary();
      const record = library.get(program.trackId);
      const redactionByCue = new Map((record?.redactions || []).map((r) => [r.cue, r.text]));
      this.activeCues = (entry?.cues || []).map((cue, index) => ({
        t: Number(cue.startSeconds ?? cue.t ?? cue.time ?? cue.timeSeconds ?? 0),
        text: redactionByCue.has(index) ? redactionByCue.get(index) : String(cue.text ?? cue.line ?? "")
      }));
      if (this.activeCues.length) {
        panel.innerHTML = this.activeCues
          .slice(0, 400)
          .map((cue, index) => `<p class="lyric-line" data-cue="${index}">${esc(cue.text)}</p>`)
          .join("");
      } else if (record?.placeholder) {
        panel.innerHTML = record.placeholder
          .split("\n")
          .map((line) => `<p class="muted">${esc(line)}</p>`)
          .join("");
      } else {
        panel.innerHTML = `<p class="muted">No draft lyrics for this track (timing ${esc(entry?.timingBasis || "NULL")}).</p>`;
      }
    }

    syncLyrics() {
      if (!this.activeCues?.length || !this.audio) return;
      const t = this.audio.currentTime;
      let current = -1;
      for (let index = 0; index < this.activeCues.length; index += 1) {
        if (this.activeCues[index].t <= t) current = index;
        else break;
      }
      const panel = this.el("lyricsPanel");
      if (!panel || current < 0) return;
      const previous = panel.querySelector(".lyric-line.active");
      const next = panel.querySelector(`[data-cue="${current}"]`);
      if (previous === next) return;
      previous?.classList.remove("active");
      if (next) {
        next.classList.add("active");
        next.scrollIntoView({ block: "nearest", behavior: "smooth" });
      }
    }

    // -----------------------------------------------------------------------
    // TTS + gates
    // -----------------------------------------------------------------------
    speak(text) {
      if (!("speechSynthesis" in window)) {
        this.log("TTS blocked: Web Speech API unavailable.");
        return false;
      }
      const persona = TTS_PERSONAS[this.settings.ttsPersona] || TTS_PERSONAS.samaya;
      // Phase 10: persona language variant (persona-<lang>) via ttsLanguage setting.
      const lang = TTS_LANGUAGES[this.settings.ttsLanguage] || persona.lang;
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = persona.rate;
      utterance.pitch = persona.pitch;
      utterance.lang = lang;
      const voices = window.speechSynthesis.getVoices();
      const voice =
        voices.find((candidate) => candidate.lang === lang) ||
        voices.find((candidate) => candidate.lang.startsWith(lang.slice(0, 2)));
      if (voice) utterance.voice = voice;
      else if (lang !== persona.lang) this.log(`TTS: no ${lang} voice installed — using system default (persona ${this.settings.ttsPersona}-${this.settings.ttsLanguage || "hi"}).`);
      window.speechSynthesis.speak(utterance);
      return true;
    }

    async announceWeather() {
      const weather = this.manifest.weather || {};
      if (!this.options.apiBase && weather.status === "blocked-provider-null") {
        this.log("Weather TTS blocked: provider NULL, WEATHER_API_KEY not configured.");
        return;
      }
      let text = this.weatherText || weather.announcementText;
      if (this.options.apiBase) {
        try {
          const response = await fetch(`${this.options.apiBase}/api/weather`);
          const data = await response.json();
          text = data.announcementText || data.message || null;
        } catch (error) {
          this.log(`Weather fetch blocked: ${error.message}`);
        }
      }
      if (!text) {
        this.log("Weather TTS blocked: announcement text NULL.");
        return;
      }
      if (this.speak(text)) {
        this.log(`Weather TTS announced (${this.settings.ttsPersona}): ${text}`);
      }
    }

    playAdGate() {
      const ads = this.manifest.ads || [];
      if (!ads.length) {
        this.log("Ad insertion blocked: no verified ad inventory.");
        return;
      }
      this.log("Ad insertion inventory exists, but mixer requires explicit trafficking evidence before playback.");
    }

    // -----------------------------------------------------------------------
    // Infrastructure
    // -----------------------------------------------------------------------
    async registerServiceWorker() {
      if (!("serviceWorker" in navigator)) {
        this.log("Service worker unavailable.");
        return;
      }
      if (location.protocol === "file:") {
        this.log("Service worker skipped for file:// preview.");
        return;
      }
      try {
        await navigator.serviceWorker.register("./sw.js");
        this.log("Service worker registered.");
      } catch (error) {
        this.log(`Service worker registration failed: ${error.message}`);
      }
    }

    async cacheUrl(url) {
      if ("caches" in window) {
        const cache = await caches.open("radio-audio-v2");
        await cache.add(url);
      }
      if (this.db) await this.putMetadata(`cached:${url}`, { url, cachedAt: new Date().toISOString() });
    }

    openDb() {
      return new Promise((resolve, reject) => {
        const request = indexedDB.open(this.options.dbName, 2);
        request.onupgradeneeded = () => {
          const db = request.result;
          if (!db.objectStoreNames.contains("metadata")) db.createObjectStore("metadata", { keyPath: "id" });
          if (!db.objectStoreNames.contains("outbox")) db.createObjectStore("outbox", { autoIncrement: true });
        };
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error || new Error("IndexedDB open failed"));
      });
    }

    putMetadata(id, value) {
      if (!this.db) return;
      const tx = this.db.transaction("metadata", "readwrite");
      tx.objectStore("metadata").put({ id, value });
    }

    ensureAudioGraph() {
      if (this.ctx || !this.audio) return;
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      this.ctx = new AudioContext();
      this.gain = this.ctx.createGain();
      const source = this.ctx.createMediaElementSource(this.audio);
      source.connect(this.gain).connect(this.ctx.destination);
    }

    ensureUserId() {
      let id = this.loadLocal("rv.userId", null);
      if (!id) {
        id = `local-${(crypto.randomUUID ? crypto.randomUUID() : String(Math.random()).slice(2))}`;
        this.saveLocal("rv.userId", id);
      }
      return id;
    }

    loadLocal(key, fallback) {
      try {
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : fallback;
      } catch {
        return fallback;
      }
    }

    saveLocal(key, value) {
      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch {
        // storage unavailable (private mode) — in-memory state still works
      }
    }

    log(message) {
      const line = `[${new Date().toLocaleTimeString()}] ${message}`;
      if (this.statusEl) this.statusEl.textContent = `${line}\n${this.statusEl.textContent || ""}`.slice(0, 3000);
      else console.log(line);
    }

    byId(id) {
      return document.getElementById(id);
    }

    el(key) {
      return document.getElementById(this.ids[key] || key);
    }
  }

  function toRelative(url) {
    return String(url || "").replace(/^\/radio-html\//, "./");
  }

  function formatOffset(seconds) {
    const safe = Number(seconds) || 0;
    const minutes = Math.floor(safe / 60);
    return `+${minutes}m`;
  }

  function esc(value) {
    return String(value ?? "").replace(/[&<>"]/g, (char) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;"
    })[char]);
  }

  window.RadioVaigyaaniqEngine = {
    RadioEngine,
    // exposed for tests and other surfaces
    commerce: {
      DEFAULT_SINGLE_PRICE,
      ALL_ACCESS_PRICE,
      DEFAULT_PREVIEW_SECONDS,
      trackPriceMinor,
      formatMoney,
      hasTrackAccess,
      canPlayFull,
      trackAccessState,
      walletBalance
    },
    personas: TTS_PERSONAS,
    boot(options) {
      const engine = new RadioEngine(options);
      window.radioEngine = engine;
      document.addEventListener("DOMContentLoaded", () => engine.init());
      if (document.readyState !== "loading") engine.init();
      return engine;
    }
  };
})();
