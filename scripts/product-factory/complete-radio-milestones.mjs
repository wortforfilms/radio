import fs from "node:fs";
import crypto from "node:crypto";
import path from "node:path";

const root = "apps/web/public/radio-html";
const desktopRoot = "apps/desktop/public/radio-html";
const today = "2026-06-05";

const readJson = (file) => JSON.parse(fs.readFileSync(file, "utf8"));
const writeJson = (file, value) => fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
const sha256 = (file) => crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");
const byteSize = (file) => fs.statSync(file).size;

fs.mkdirSync(path.join(root, "data"), { recursive: true });
fs.mkdirSync(path.join(root, "qa/screenshots"), { recursive: true });
fs.mkdirSync(path.join(desktopRoot, "data"), { recursive: true });
fs.mkdirSync(path.join(desktopRoot, "qa/screenshots"), { recursive: true });

const manifestPath = path.join(root, "Radio_Vaigyaaniq_Asset_Manifest.json");
const evidencePath = path.join(root, "assets/Radio_Vaigyaaniq_Asset_Evidence.json");
const manifest = readJson(manifestPath);
const evidence = readJson(evidencePath);
const recordsByPath = new Map(evidence.records.map((record) => [record.path, record]));

for (const group of manifest.groups) {
  for (const asset of group.assets) {
    const localPath = path.join(root, asset.path.replace("/radio-html/", ""));
    const digest = sha256(localPath);
    const size = byteSize(localPath);
    asset.checksum = { algorithm: "sha256", value: digest };
    asset.byteSize = size;
    asset.rights = {
      license: null,
      rightsStatus: asset.status === "generated-draft" ? "local-draft-no-release-claim" : "NULL",
      usage: "draft-interface-reference",
      releaseAllowed: false
    };
    asset.review = {
      sourceConfidence: "local-file-checksum-only",
      reviewer: null,
      reviewedAt: null,
      reviewState: "unreviewed"
    };
    asset.evidenceStatus = asset.status === "NULL" ? "NULL" : "draft";

    const record = recordsByPath.get(asset.path);
    if (record) {
      record.status = asset.status;
      record.verification = asset.verification;
      record.rights = asset.rights;
      record.review = asset.review;
      record.evidenceStatus = asset.evidenceStatus;
      record.evidence.sha256 = digest;
      record.evidence.byteSize = size;
      record.evidence.generatedAt = today;
      record.phkd.productionReady = false;
      record.phkd.releaseAllowed = false;
      record.phkd.unknownValues = Array.from(new Set([
        ...(record.phkd.unknownValues || []),
        "license",
        "reviewer",
        "reviewedAt"
      ]));
    }
  }
}

manifest.generatedAt = today;
manifest.phkd.notes = Array.from(new Set([
  ...manifest.phkd.notes,
  "Asset evidence P2 adds rights, license, source confidence, reviewer, reviewedAt, and review state fields.",
  "All releaseAllowed values remain false until external rights and review evidence exist."
]));

evidence.generatedAt = today;
evidence.counts = {
  records: evidence.records.length,
  productionReady: 0,
  releaseAllowed: 0,
  nullAudioAssets: 0,
  nullEvidencePlaceholders: evidence.records.filter((record) => record.status === "NULL").length,
  rightsNull: evidence.records.filter((record) => record.rights?.rightsStatus === "NULL").length,
  unreviewed: evidence.records.filter((record) => record.review?.reviewState === "unreviewed").length
};
evidence.filters = {
  evidenceStatus: ["NULL", "draft", "verified", "blocked"],
  groups: Array.from(new Set(evidence.records.map((record) => record.group))).sort(),
  reviewState: ["unreviewed", "reviewed", "blocked"],
  rightsStatus: ["NULL", "local-draft-no-release-claim", "verified", "blocked"]
};
evidence.phkd.notes = Array.from(new Set([
  ...evidence.phkd.notes,
  "P2 rights fields are present, but no release rights are asserted.",
  "Reviewer and reviewedAt remain NULL until a human review is recorded."
]));

writeJson(manifestPath, manifest);
writeJson(evidencePath, evidence);

const evidenceIdFor = (assetPath) => recordsByPath.get(assetPath)?.id || null;
const stationMedia = [
  {
    key: "mahamatya",
    label: "Mahamatya",
    cover: "/radio-html/assets/covers/mahamatya.svg",
    evidencePath: "/radio-html/assets/evidence.html",
    evidenceId: evidenceIdFor("/radio-html/assets/covers/mahamatya.svg"),
    palette: { primary: "#ff6b35", secondary: "#dfb15b", accent: "#00f5d4" },
    shader: "/radio-html/assets/shaders/radio-spectrum.frag",
    fallback: false,
    status: "draft",
    verification: "draft"
  },
  {
    key: "gokul",
    label: "Gokul",
    cover: "/radio-html/assets/covers/gokul.svg",
    evidencePath: "/radio-html/assets/evidence.html",
    evidenceId: evidenceIdFor("/radio-html/assets/covers/gokul.svg"),
    palette: { primary: "#00f5d4", secondary: "#ff6b35", accent: "#e2e8f0" },
    shader: "/radio-html/assets/shaders/radio-yantra.vert",
    fallback: false,
    status: "draft",
    verification: "draft"
  },
  {
    key: "kaal-chakra",
    label: "Kaal Chakra",
    cover: "/radio-html/assets/covers/kaal-chakra.svg",
    evidencePath: "/radio-html/assets/evidence.html",
    evidenceId: evidenceIdFor("/radio-html/assets/covers/kaal-chakra.svg"),
    palette: { primary: "#dfb15b", secondary: "#00f5d4", accent: "#ff6b35" },
    shader: "/radio-html/assets/shaders/radio-spectrum.frag",
    fallback: false,
    status: "draft",
    verification: "draft"
  },
  {
    key: "swarnim-sale",
    label: "The Swarnim Sale",
    cover: "/radio-html/assets/covers/swarnim-sale.svg",
    evidencePath: "/radio-html/assets/evidence.html",
    evidenceId: evidenceIdFor("/radio-html/assets/covers/swarnim-sale.svg"),
    palette: { primary: "#e2e8f0", secondary: "#dfb15b", accent: "#00f5d4" },
    shader: "/radio-html/assets/shaders/radio-yantra.vert",
    fallback: false,
    status: "draft",
    verification: "draft"
  }
];

const dataPhkd = {
  rule: "fail_closed",
  unknownValues: "NULL",
  notes: [
    "Data frames describe local runtime behavior only.",
    "No audio, rights, payment, production readiness, or external telemetry claim is introduced.",
    "Evidence upgrades require source, creator, artifact checksum, rights, reviewer, and reviewedAt."
  ]
};

const normalizePublicAsset = (value) => {
  if (!value || value === "NULL") return null;
  if (value.startsWith("/")) return value;
  return `/radio-html/${value}`;
};

function buildCompactCatalog() {
  const prototypePath = path.join(root, "Radio_Vaigyaaniq_App_Prototype.html");
  const html = fs.readFileSync(prototypePath, "utf8");
  const match = html.match(/const DATA\s*=\s*(\{[\s\S]*?\})\s*;\s*const AYO\s*=/);

  if (!match) {
    return {
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
  }

  const sourceCatalog = JSON.parse(match[1]);
  return {
    artist: sourceCatalog.artist || "NULL",
    total_songs: sourceCatalog.total_songs || 0,
    total_clips: sourceCatalog.total_clips || 0,
    source: "/radio-html/Radio_Vaigyaaniq_App_Prototype.html",
    sourceStatus: "extracted-draft",
    shows: (sourceCatalog.shows || []).slice(0, 9).map((show) => ({
      name: show.name || "NULL",
      count: show.count || show.songs?.length || 0,
      hero: normalizePublicAsset(show.hero) || "/radio-html/assets/images/radio-vaigyaaniq-runtime-hero.svg",
      songs: (show.songs || []).slice(0, 12).map((song) => ({
        t: song.t || "NULL",
        r: song.r || "NULL",
        a: normalizePublicAsset(song.a),
        c: normalizePublicAsset(song.c),
        d: song.d || "NULL",
        ly: song.ly || "NULL",
        theme: song.theme || show.name || "NULL"
      }))
    })).filter((show) => show.songs.length > 0)
  };
}

const radioMedia = {
  id: "radio-vaigyaaniq-media-map",
  title: "Radio Vaigyaaniq Media Map",
  generatedAt: today,
  verificationState: "draft",
  phkd: dataPhkd,
  fallbackCover: {
    path: "/radio-html/assets/images/radio-vaigyaaniq-runtime-hero.svg",
    evidenceId: evidenceIdFor("/radio-html/assets/images/radio-vaigyaaniq-runtime-hero.svg"),
    status: "generated-draft"
  },
  stations: stationMedia
};

const audioImport = {
  id: "radio-vaigyaaniq-audio-import-manifest",
  title: "Radio Vaigyaaniq Audio Import Manifest",
  generatedAt: today,
  verificationState: "draft",
  phkd: dataPhkd,
  counts: { imports: 0, playable: 0, blocked: 0, nullEvidence: 1 },
  schema: {
    required: ["id", "title", "source", "checksum", "rightsStatus", "verificationState"],
    fields: {
      id: "Stable local import id",
      title: "Track or clip title",
      artist: "Creator/artist, NULL if unknown",
      language: "Language, NULL if unknown",
      source: "Local path or external source reference",
      checksum: "sha256 for imported local file",
      rightsStatus: "NULL | draft | verified | blocked",
      verificationState: "NULL | draft | verified | blocked",
      playable: "false until source, rights, and checksum are verified"
    }
  },
  imports: [],
  placeholder: "/radio-html/assets/audio/PHKD_AUDIO_PLACEHOLDER.json"
};

const radioRuntimeData = {
  id: "radio-vaigyaaniq-runtime-data",
  title: "Radio Vaigyaaniq Runtime Data Layer",
  generatedAt: today,
  verificationState: "draft",
  phkd: dataPhkd,
  frames: [
    { key: "media", path: "/radio-html/data/radio-media.json", status: "implemented-draft" },
    { key: "audio-import", path: "/radio-html/data/audio-import-manifest.json", status: "implemented-draft" },
    { key: "asset-evidence", path: "/radio-html/assets/Radio_Vaigyaaniq_Asset_Evidence.json", status: "implemented-draft" },
    { key: "visual-qa", path: "/radio-html/data/visual-qa.json", status: "implemented-draft" },
    { key: "tauri-readiness", path: "/radio-html/data/tauri-readiness.json", status: "implemented-draft" },
    { key: "production-freeze", path: "/radio-html/data/production-freeze.json", status: "implemented-draft" }
  ],
  events: [
    "station:selected",
    "cover:fallbackApplied",
    "evidence:opened",
    "audio:importRequested",
    "qa:screenshotCaptured",
    "tauri:readinessChecked",
    "freeze:statusReviewed"
  ],
  storage: [
    { key: "social", mechanism: "localStorage", status: "draft" },
    { key: "lyrics", mechanism: "localStorage", status: "draft" },
    { key: "visualizer-recording", mechanism: "Blob URL", status: "draft" },
    { key: "audio-import", mechanism: "manifest-only", status: "NULL until imported" }
  ],
  media: stationMedia,
  catalog: buildCompactCatalog()
};

const qaTargets = [
  ["/radio-html/surfaces/image-landing.html", "Image Landing"],
  ["/radio-html/assets/evidence.html", "Asset Evidence"],
  ["/radio-html/assets/index.html", "Asset Catalog"],
  ["/radio-html/surfaces/runtime.html", "Runtime Surface"],
  ["/radio-html/surfaces/visualizer.html", "Visualizer"],
  ["/radio-html/surfaces/lyrics.html", "Lyrics Scribe"],
  ["/radio-html/surfaces/tts.html", "TTS"],
  ["/radio-html/surfaces/social-gift.html", "Social Gift"],
  ["/radio-html/surfaces/storyboard.html", "Storyboard"],
  ["/radio-html/surfaces/audio-import.html", "Audio Import"],
  ["/radio-html/surfaces/visual-qa.html", "Visual QA"],
  ["/radio-html/surfaces/tauri-readiness.html", "Tauri Readiness"],
  ["/radio-html/surfaces/production-freeze.html", "Production Freeze"],
  ["/radio-html/surfaces/runtime-data.html", "Runtime Data"]
];

const visualQa = {
  id: "radio-vaigyaaniq-visual-qa",
  title: "Radio Vaigyaaniq Visual QA Board",
  generatedAt: today,
  verificationState: "draft",
  phkd: dataPhkd,
  counts: { targets: qaTargets.length, capturedScreenshots: 0, pass: 0, blocked: qaTargets.length },
  targets: qaTargets.map(([pathValue, title]) => ({
    title,
    path: pathValue,
    screenshot: null,
    renderStatus: "pending",
    linkStatus: "pending",
    imageStatus: "pending",
    mobileStatus: "pending",
    notes: "Pending browser screenshot capture."
  }))
};

const visualQaPath = path.join(root, "data/visual-qa.json");
if (fs.existsSync(visualQaPath)) {
  const previousVisualQa = readJson(visualQaPath);
  const previousTargetsByPath = new Map((previousVisualQa.targets || []).map((target) => [target.path, target]));
  visualQa.targets = visualQa.targets.map((target) => {
    const previous = previousTargetsByPath.get(target.path);
    return previous?.screenshot ? { ...target, ...previous } : target;
  });
  visualQa.counts = {
    targets: visualQa.targets.length,
    capturedScreenshots: visualQa.targets.filter((target) => target.screenshot).length,
    pass: visualQa.targets.filter((target) => target.renderStatus === "pass").length,
    blocked: visualQa.targets.filter((target) => target.renderStatus === "blocked").length
  };
}

const tauriReadiness = {
  id: "radio-vaigyaaniq-tauri-readiness",
  title: "Radio Vaigyaaniq Tauri Shipping Readiness",
  generatedAt: today,
  verificationState: "draft",
  phkd: dataPhkd,
  shipDecision: "NO_SHIP",
  reason: "Installer, signing, audio rights, payment, and release review evidence remain NULL.",
  checklist: [
    { key: "html-bundle", label: "HTML bundle path inventory", status: "draft-ready", evidence: "/radio-html/Radio_Vaigyaaniq_All_Html_Links.json" },
    { key: "desktop-mirror", label: "Desktop mirror copy", status: "draft-ready", evidence: "/apps/desktop/public/radio-html" },
    { key: "asset-evidence", label: "Asset checksum evidence", status: "draft-ready", evidence: "/radio-html/assets/Radio_Vaigyaaniq_Asset_Evidence.json" },
    { key: "audio-rights", label: "Playable audio rights", status: "blocked", evidence: null },
    { key: "payment-gift", label: "Gift/payment mechanism", status: "blocked", evidence: null },
    { key: "installer", label: "Signed Tauri installer", status: "blocked", evidence: null },
    { key: "release-review", label: "Human release review", status: "blocked", evidence: null }
  ]
};
tauriReadiness.counts = {
  draftReady: tauriReadiness.checklist.filter((item) => item.status === "draft-ready").length,
  blocked: tauriReadiness.checklist.filter((item) => item.status === "blocked").length
};

const productionFreeze = {
  id: "radio-vaigyaaniq-production-freeze",
  title: "Radio Vaigyaaniq Production Freeze",
  generatedAt: today,
  verificationState: "draft",
  phkd: dataPhkd,
  freezeState: "draft-freeze",
  productionReady: false,
  frozenDrafts: [
    { key: "route-matrix", path: "/radio-html/Radio_Vaigyaaniq_Html_Route_Matrix.json", state: "frozen-draft" },
    { key: "asset-manifest", path: "/radio-html/Radio_Vaigyaaniq_Asset_Manifest.json", state: "frozen-draft" },
    { key: "asset-evidence", path: "/radio-html/assets/Radio_Vaigyaaniq_Asset_Evidence.json", state: "frozen-draft" },
    { key: "audio-import-schema", path: "/radio-html/data/audio-import-manifest.json", state: "frozen-draft" },
    { key: "runtime-data", path: "/radio-html/data/radio-runtime-data.json", state: "frozen-draft" },
    { key: "tauri-readiness", path: "/radio-html/data/tauri-readiness.json", state: "frozen-draft" }
  ],
  blockedProductionClaims: [
    "productionReady",
    "playableAudio",
    "verifiedRights",
    "signedInstaller",
    "paymentReceipt",
    "externalTelemetry"
  ]
};

writeJson(path.join(root, "data/radio-media.json"), radioMedia);
writeJson(path.join(root, "data/audio-import-manifest.json"), audioImport);
writeJson(path.join(root, "data/radio-runtime-data.json"), radioRuntimeData);
writeJson(path.join(root, "data/visual-qa.json"), visualQa);
writeJson(path.join(root, "data/tauri-readiness.json"), tauriReadiness);
writeJson(path.join(root, "data/production-freeze.json"), productionFreeze);

for (const file of [
  "Radio_Vaigyaaniq_Asset_Manifest.json",
  "assets/Radio_Vaigyaaniq_Asset_Evidence.json",
  "data/radio-media.json",
  "data/audio-import-manifest.json",
  "data/radio-runtime-data.json",
  "data/visual-qa.json",
  "data/tauri-readiness.json",
  "data/production-freeze.json"
]) {
  fs.mkdirSync(path.dirname(path.join(desktopRoot, file)), { recursive: true });
  fs.copyFileSync(path.join(root, file), path.join(desktopRoot, file));
}
