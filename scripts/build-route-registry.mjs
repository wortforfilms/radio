// Route registry for the production Radio Vaigyaaniq ecosystem.
//
// Single source of truth for the full information architecture (~200 routes,
// 18 sections). Every route carries an HONEST status:
//   built   — a real implementation exists today (implementedBy points at it)
//   partial — a real foundation exists but the route's full promise doesn't
//   planned — nothing exists; the app renders a fail-closed placeholder
// Nothing is marked built/partial without a concrete repo artifact behind it.
//
// Output:
//   apps/radio/lib/route-registry.json            (consumed by the catch-all renderer)
//   apps/{web,desktop}/public/radio-html/data/route-registry.json (mirrors)
//
// Usage: node scripts/build-route-registry.mjs

import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const generatedAt = new Date().toISOString();

// [section, emoji, routes[]] — route: path string, or [path, overrides]
const SECTIONS = [
  ["Public Website", "🌐", [
    ["/", { status: "built", implementedBy: ["apps/radio/app/page.tsx"], description: "Standalone landing — surfaces, tools, payment API." }],
    "/about", "/mission", "/vision", "/science-for-bharat", "/contact", "/partners",
    "/sponsors", "/careers", "/press", "/privacy", "/terms", "/accessibility", "/donate"
  ]],
  ["Radio", "📻", [
    ["/radio", { status: "built", implementedBy: ["apps/web/app/radio/page.tsx", "radio-html/online-offline-radio-engine.html"], description: "Broadcast command surface + online/offline engine over the 1,186-track catalogue." }],
    ["/radio/live", { status: "partial", implementedBy: ["radio-html/online-offline-radio-engine.html"], description: "Local-fallback playback works; live stream URLs stay NULL until rights-verified." }],
    ["/radio/now-playing", { status: "built", implementedBy: ["radio-html/assets/js/radio-engine.js"], description: "Now-playing panel: stylised titles, access badges, synced lyrics, story modal." }],
    ["/radio/schedule", { status: "partial", implementedBy: ["radio-html/data/radio-engine-manifest.json"], description: "Sequence-only program schedule; wall-clock startTime stays NULL (unverified)." }],
    ["/radio/frequencies", { status: "planned", description: "No licensed frequency exists; fabricating one would break PHKD." }],
    ["/radio/shows", { status: "partial", implementedBy: ["radio-html/Radio_Stations.html"], description: "7 station lanes act as shows; dedicated show format not built." }],
    ["/radio/shows/:slug", { status: "partial", implementedBy: ["radio-html/Radio_Stations.html"] }],
    ["/radio/rj/:slug", { status: "partial", implementedBy: ["radio-html/assets/js/radio-engine.js#TTS_PERSONAS"], description: "Four TTS personas (maataa, rishi, samaya, vigyaaniq); human RJ profiles not built." }],
    ["/radio/archive", { status: "built", implementedBy: ["radio-html/Radio_Catalogue.html", "radio-html/data/radio-content.json"], description: "Full indexed catalogue with covers, versions, storylines." }],
    ["/radio/request", { status: "planned", description: "Request intake not built; gift-intent outbox is the nearest primitive." }],
    "/radio/dedicate",
    ["/radio/download", { status: "partial", implementedBy: ["radio-html/data/offline-cache-manifest.json", "apps/radio-backend/server.js#offline-bundle"], description: "Rights-aware offline bundles exist; user-facing download manager not built." }]
  ]],
  ["Podcast", "🎙", [
    "/podcasts", "/podcasts/trending", "/podcasts/latest", "/podcasts/categories",
    "/podcasts/:slug",
    ["/podcasts/:slug/transcript", { status: "partial", implementedBy: ["docs/reports/RADIO_JOCKEY_TRANSCRIPTS.md", "radio-html/data/lyrics-prompter-data.json"], description: "Transcript tooling exists for tracks; podcast catalogue itself is NULL." }],
    "/podcasts/:slug/chapters", "/podcasts/:slug/discussion", "/podcasts/bookmark"
  ]],
  ["Research Hub", "🔬", [
    "/research", "/research/publications", "/research/papers",
    ["/research/datasets", { status: "partial", implementedBy: ["apps/web/app/api/export"], description: "HKD/CSV/GraphML exports of the knowledge graph exist; dataset portal not built." }],
    "/research/experiments", "/research/projects", "/research/labs", "/research/authors",
    "/research/citations", "/research/downloads"
  ]],
  ["Science Categories", "🛰", [
    "/discover", "/discover/space", "/discover/astronomy", "/discover/physics", "/discover/chemistry",
    "/discover/biology", "/discover/mathematics", "/discover/medicine", "/discover/agriculture",
    "/discover/environment", "/discover/climate", "/discover/robotics", "/discover/ai",
    "/discover/history-of-science",
    ["/discover/sanskrit-science", { status: "partial", implementedBy: ["apps/web/app/api/sanskrit-dictionary", "apps/web/app/dictionary"], description: "Sanskrit dictionary + reference corpus exist in the umbrella app." }],
    "/discover/innovation", "/discover/startups", "/discover/student"
  ]],
  ["Academy", "🎓", [
    "/academy", "/academy/courses", "/academy/course/:slug", "/academy/lessons",
    "/academy/quizzes", "/academy/tests", "/academy/certificates", "/academy/my-learning",
    "/academy/leaderboard"
  ]],
  ["Community", "👥", [
    "/community", "/community/discussions", "/community/questions", "/community/polls",
    "/community/events", "/community/clubs", "/community/challenges", "/community/leaderboard",
    "/community/profile/:username"
  ]],
  ["Events", "📅", [
    "/events", "/events/live", "/events/upcoming", "/events/calendar", "/events/workshops",
    "/events/webinars", "/events/hackathons", "/events/science-fairs"
  ]],
  ["News", "📰", [
    "/news", "/news/science", "/news/space", "/news/technology", "/news/agriculture",
    "/news/india", "/news/world", "/news/videos"
  ]],
  ["Media", "🎥", [
    ["/videos", { status: "partial", implementedBy: ["radio-html surfaces (visualizer WebM capture)"], description: "Visualizer capture exists; video library not built." }],
    "/shorts",
    ["/gallery", { status: "partial", implementedBy: ["radio-html/Radio_Catalogue.html"], description: "Cover-art gallery exists for the catalogue." }],
    "/infographics", "/animations", "/livestreams"
  ]],
  ["AI", "🤖", [
    "/ai",
    ["/ai/rj", { status: "partial", implementedBy: ["radio-html/assets/js/radio-engine.js#TTS_PERSONAS"], description: "Persona TTS announcements (Web Speech API); generative RJ not built." }],
    ["/ai/chat", { status: "partial", implementedBy: ["apps/web/app/api/assistant"], description: "Assistant API route exists in the umbrella app." }],
    "/ai/translator", "/ai/summarizer",
    ["/ai/transcript", { status: "partial", implementedBy: ["radio-html/data/lyrics-prompter-data.json"], description: "Draft lyric/transcript cue data exists (timing unverified)." }],
    "/ai/recommendations",
    ["/ai/search", { status: "partial", implementedBy: ["apps/web/app/api/search"], description: "Knowledge search API exists; AI ranking not built." }]
  ]],
  ["Search", "🔍", [
    ["/search", { status: "partial", implementedBy: ["apps/web/app/api/search", "radio-engine catalog search"], description: "Catalogue + knowledge search exist; unified search page not built." }],
    ["/search/radio", { status: "partial", implementedBy: ["radio-engine catalog search"] }],
    "/search/podcasts", "/search/research", "/search/news", "/search/people"
  ]],
  ["User", "👤", [
    "/login", "/signup", "/forgot-password", "/verify",
    ["/profile", { status: "partial", implementedBy: ["prisma/schema.prisma#User"], description: "User/UserSettings models exist; profile UI not built." }],
    "/profile/edit",
    "/bookmarks",
    ["/history", { status: "partial", implementedBy: ["radio-engine outbox (play events)"], description: "Play events queue offline and sync as evidence; history UI not built." }],
    ["/downloads", { status: "partial", implementedBy: ["radio-html/data/offline-cache-manifest.json"] }],
    "/notifications",
    ["/settings", { status: "partial", implementedBy: ["packages/shared/src/commerce.ts#UserSettingsLike", "radio-html/Radio_Account.html"], description: "Settings model + account surface mock exist." }]
  ]],
  ["Premium", "💎", [
    ["/premium", { status: "partial", implementedBy: ["radio-html/Radio_Pricing_Checkout.html", "packages/shared/src/commerce.ts"], description: "₹29 track / ₹299 all-access model + checkout surface; live payments await Razorpay keys." }],
    ["/premium/plans", { status: "partial", implementedBy: ["packages/shared/src/commerce.ts"] }],
    ["/premium/payment", { status: "partial", implementedBy: ["apps/radio/app/api/payments/order", "apps/radio/app/api/payments/webhook"], description: "Server-priced Razorpay orders + HMAC-verified webhooks built; needs keys + one real txn." }],
    ["/premium/history", { status: "partial", implementedBy: ["prisma/schema.prisma#Purchase"] }],
    ["/premium/library", { status: "partial", implementedBy: ["prisma/schema.prisma#Entitlement"] }]
  ]],
  ["Analytics", "📊", [
    ["/analytics", { status: "partial", implementedBy: ["apps/web/app/api/analytics"], description: "Observatory metrics API exists; analytics UI not built." }],
    "/analytics/listeners", "/analytics/live", "/analytics/streams",
    "/analytics/content", "/analytics/geography", "/analytics/revenue"
  ]],
  ["Studio", "🎛", [
    "/studio", "/studio/live", "/studio/record",
    ["/studio/upload", { status: "partial", implementedBy: ["docs/runbooks/RADIO_TRACK_ONBOARDING_SOP.md", "radio-html/Track_Onboarding.html"], description: "Track onboarding SOP + surface exist (fail-closed canPlay)." }],
    "/studio/editor",
    ["/studio/script", { status: "partial", implementedBy: ["radio-html/lyrics-prompter.html"], description: "Lyrics prompter surface exists." }],
    "/studio/caller", "/studio/queue", "/studio/automation",
    ["/studio/assets", { status: "partial", implementedBy: ["radio-html/assets/Radio_Vaigyaaniq_Asset_Evidence.json"] }]
  ]],
  ["Content Management", "🗂", [
    ["/cms", { status: "partial", implementedBy: ["radio-html/admin-panel.html", "radio-html/admin-kanban.html"], description: "Admin panel (CRUD overlays, rights proofs) + kanban board exist." }],
    ["/cms/dashboard", { status: "partial", implementedBy: ["radio-html/admin-panel.html"] }],
    "/cms/articles",
    ["/cms/shows", { status: "partial", implementedBy: ["apps/radio-backend/server.js#/admin/stations"] }],
    "/cms/podcasts", "/cms/research",
    ["/cms/media", { status: "partial", implementedBy: ["scripts/media-storage-audit.mjs", "docs/runbooks/RADIO_MEDIA_STORAGE.md"] }],
    "/cms/users", "/cms/comments",
    ["/cms/moderation", { status: "partial", implementedBy: ["scripts/lib/radio-content-lib.mjs#sanitize"], description: "Lyric sanitisation pipeline exists; general moderation not built." }],
    ["/cms/workflows", { status: "partial", implementedBy: ["docs/runbooks/RIGHTS_CLOSURE_RUNBOOK.md", "docs/runbooks/PHASE_4_5_RUNBOOK.md"] }],
    ["/cms/scheduler", { status: "partial", implementedBy: ["apps/radio-backend/server.js#/admin/programs"], description: "Program overlays (draft startTime) exist; scheduler UI not built." }]
  ]],
  ["Administration", "⚙", [
    ["/admin", { status: "built", implementedBy: ["radio-html/admin-panel.html", "apps/radio-backend/server.js#/admin"], description: "Fail-closed admin lane: ADMIN_PASSWORD auth, CRUD overlays, rights proofs, cache status." }],
    "/admin/users", "/admin/roles", "/admin/permissions", "/admin/api", "/admin/settings",
    "/admin/logs",
    ["/admin/audit", { status: "partial", implementedBy: ["packages/runtime/src/audit.ts", "apps/web/app/api/audit"], description: "AuditLog model + API exist." }],
    "/admin/security",
    ["/admin/storage", { status: "partial", implementedBy: ["packages/runtime/src/storage.ts", "docs/runbooks/RADIO_MEDIA_STORAGE.md"] }],
    "/admin/backups",
    ["/admin/integrations", { status: "partial", implementedBy: ["integrations/hdfc-upi-parser"] }]
  ]],
  ["API", "🔌", [
    "/api/v1/auth",
    ["/api/v1/radio", { status: "partial", implementedBy: ["apps/web/app/api/radio-release", "apps/radio-backend/server.js#/api/stations"], description: "Stations/schedule/evidence endpoints exist (unversioned); /api/v1 alias planned." }],
    "/api/v1/podcasts", "/api/v1/research", "/api/v1/news", "/api/v1/events", "/api/v1/community",
    ["/api/v1/search", { status: "partial", implementedBy: ["apps/web/app/api/search"] }],
    ["/api/v1/analytics", { status: "partial", implementedBy: ["apps/web/app/api/analytics"] }],
    "/api/v1/upload", "/api/v1/notifications",
    ["/api/v1/payments", { status: "partial", implementedBy: ["apps/radio/app/api/payments/order", "apps/radio/app/api/payments/webhook"], description: "Order + webhook live (unversioned); /api/v1 alias planned." }]
  ]],
  ["Ecosystem Integration", "🌐", [
    "/ecosystem", "/ecosystem/nlm", "/ecosystem/cic", "/ecosystem/shree-kautilya",
    ["/ecosystem/lipi", { status: "partial", implementedBy: ["apps/web/app/lipi", "lipi/civilizations"], description: "Lipi civilizations module exists in the umbrella app." }],
    ["/ecosystem/maataa", { status: "partial", implementedBy: ["apps/web/app/api/guru-maataa"] }],
    ["/ecosystem/corpus", { status: "partial", implementedBy: ["packages/shared/src/reference-corpus.ts"] }],
    "/ecosystem/apis", "/ecosystem/developers"
  ]]
];

function titleFor(routePath) {
  const last = routePath.split("/").filter(Boolean).pop() || "Home";
  return last
    .replace(/^:/, "")
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

const routes = [];
for (const [section, emoji, sectionRoutes] of SECTIONS) {
  for (const entry of sectionRoutes) {
    const [routePath, overrides] = Array.isArray(entry) ? entry : [entry, {}];
    routes.push({
      path: routePath,
      section,
      emoji,
      title: overrides.title || titleFor(routePath),
      status: overrides.status || "planned",
      implementedBy: overrides.implementedBy || [],
      description:
        overrides.description ||
        (overrides.status && overrides.status !== "planned"
          ? "Foundation exists — see implementedBy."
          : "Not built yet. Renders a fail-closed placeholder; no fabricated content."),
      dynamic: routePath.includes(":")
    });
  }
}

// integrity: unique paths, statuses valid, built/partial must cite an artifact
const seen = new Set();
for (const route of routes) {
  if (seen.has(route.path)) throw new Error(`duplicate route: ${route.path}`);
  seen.add(route.path);
  if (!["built", "partial", "planned"].includes(route.status)) throw new Error(`bad status: ${route.path}`);
  if (route.status !== "planned" && route.implementedBy.length === 0) {
    throw new Error(`route ${route.path} claims ${route.status} without implementedBy evidence`);
  }
}

const registry = {
  id: "radio-vaigyaaniq-route-registry",
  generatedAt,
  phkd: {
    failClosed: true,
    note: "Statuses are evidence-backed: built/partial cite concrete repo artifacts; planned routes render placeholders and never fabricate content, schedules, or claims."
  },
  counts: {
    sections: SECTIONS.length,
    routes: routes.length,
    built: routes.filter((r) => r.status === "built").length,
    partial: routes.filter((r) => r.status === "partial").length,
    planned: routes.filter((r) => r.status === "planned").length,
    dynamic: routes.filter((r) => r.dynamic).length
  },
  sections: SECTIONS.map(([name, emoji]) => ({ name, emoji })),
  routes
};

const targets = [
  "apps/radio/lib/route-registry.json",
  "apps/web/public/radio-html/data/route-registry.json",
  "apps/desktop/public/radio-html/data/route-registry.json"
];
for (const target of targets) {
  const file = path.join(ROOT, target);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify(registry, null, 2)}\n`);
}

console.log(`route-registry sections=${registry.counts.sections} routes=${registry.counts.routes}`);
console.log(`route-registry built=${registry.counts.built} partial=${registry.counts.partial} planned=${registry.counts.planned}`);
