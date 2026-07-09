// Radio Vaigyaaniq route-registry platform — core types.
// Strongly typed, no `any`. These types are the contract for every registry
// module (registry/*.ts), the build pipeline (scripts/build-registry-platform.mjs),
// and every subsystem that derives configuration from the registry.
//
// Type-only imports keep the section modules dependency-free at runtime, so the
// build script can load them under `node --experimental-strip-types`.

export type RouteStatus = "built" | "partial" | "planned";

export type RouteLayout =
  | "landing"
  | "dashboard"
  | "player"
  | "studio"
  | "article"
  | "reader"
  | "fullscreen"
  | "settings"
  | "admin"
  | "modal";

export type RoutePlatform =
  | "web"
  | "mobile"
  | "desktop"
  | "tv"
  | "car"
  | "watch"
  | "api"
  | "offline";

export type RouteSection =
  | "Public Website"
  | "Radio"
  | "Podcast"
  | "Research Hub"
  | "Science Categories"
  | "Academy"
  | "Community"
  | "Events"
  | "News"
  | "Media"
  | "AI"
  | "Search"
  | "User"
  | "Premium"
  | "Analytics"
  | "Studio"
  | "Content Management"
  | "Administration"
  | "API"
  | "Ecosystem Integration";

export type Permission =
  | "anonymous"
  | "listener"
  | "student"
  | "researcher"
  | "creator"
  | "moderator"
  | "editor"
  | "admin"
  | "superadmin";

export type FeatureFlag =
  | "radio2"
  | "premium"
  | "labs"
  | "beta"
  | "events"
  | "academy"
  | "enterprise"
  | "experimental";

/** Where a route appears in generated navigation. Nothing is authored by hand. */
export interface Navigation {
  sidebar: boolean;
  header: boolean;
  footer: boolean;
  breadcrumbs: boolean;
  commandPalette: boolean;
  quickAccess: boolean;
  contextMenu: boolean;
}

/** SEO metadata for public routes. canonical is resolved against SITE_ORIGIN at build. */
export interface SEO {
  title: string;
  description: string;
  keywords: string[];
  canonical: string | null;
  robots: "index,follow" | "noindex,nofollow";
  openGraph: { title: string; description: string; type: "website" | "article"; image: string | null };
  twitter: { card: "summary" | "summary_large_image"; title: string; description: string };
  jsonLd: Record<string, string | number | boolean | null> | null;
}

/** Evidence behind a status claim. built/partial routes MUST carry evidence. */
export interface Evidence {
  artifact: string;
  kind: "code" | "surface" | "data" | "api" | "doc";
  note?: string;
}

/** API endpoints a UI route consumes. status is honest (planned aliases stay planned). */
export interface APIReference {
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  path: string;
  status: RouteStatus;
  description?: string;
}

export interface AnalyticsMeta {
  screenName: string;
  event: string;
  /** null until a real analytics provider is configured — never fabricated. */
  trackingId: string | null;
  conversionGoal: string | null;
}

/**
 * Canonical route definition. `id` is the permanent identifier — subsystems
 * must reference routes by id, never by URL string. `children` is computed by
 * the build (never authored). All fields are required so modules stay uniform;
 * the codegen (scripts/generate-registry-modules.mjs) fills honest defaults.
 */
export interface RouteDefinition {
  /** Permanent dot identifier, e.g. "radio.live", "academy.course". Never reuse. */
  id: string;
  path: string;
  title: string;
  description: string;
  section: RouteSection;
  /** Free-form grouping inside a section, e.g. "playback", "commerce", "legal". */
  category: string;
  status: RouteStatus;
  layout: RouteLayout;
  /** Emoji/icon token used by navigation + the catch-all renderer. */
  icon: string;
  searchable: boolean;
  navigation: Navigation;
  platforms: RoutePlatform[];
  /** Roles that may access the route. ["anonymous"] = public. */
  permissions: Permission[];
  /** Flags that must be ON for the route to appear in generated navigation. */
  featureFlags: FeatureFlag[];
  api: APIReference[];
  seo: SEO;
  analytics: AnalyticsMeta;
  /** Legacy-compatible artifact list (superset lives in `evidence`). */
  implementedBy: string[];
  evidence: Evidence[];
  /** Route ids this route depends on. Cycles are a build failure. */
  dependsOn: string[];
  tags: string[];
  dynamic: boolean;
  /** Optional content-type id (content-types.ts) this route presents. */
  contentType?: string;
}

/** Build-time computed shape: definition + computed children ids. */
export interface CompiledRoute extends RouteDefinition {
  children: string[];
}

export interface SectionMeta {
  name: RouteSection;
  emoji: string;
}

// ---------------------------------------------------------------------------
// Application-manifest extensions (schemaVersion 3): components, layouts,
// design tokens, content types, workflows, workspace apps. All additive.
// ---------------------------------------------------------------------------

export type ComponentCategory =
  | "playback"
  | "content"
  | "commerce"
  | "navigation"
  | "data"
  | "feedback"
  | "input"
  | "media";

/** UI component definition. Statuses follow the same PHKD evidence rules as routes. */
export interface ComponentDefinition {
  /** Permanent id, e.g. "player", "waveform", "podcast-card". */
  id: string;
  name: string;
  description: string;
  category: ComponentCategory;
  status: RouteStatus;
  implementedBy: string[];
  platforms: RoutePlatform[];
  /** Prop contract (documentation-grade, generator-consumable). */
  props: Array<{ name: string; type: string; required: boolean; description?: string }>;
  /** Content types this component can render (ids from content-types.ts). */
  renders: string[];
}

/** Named region of a layout with an ordered component tree. */
export interface LayoutRegion {
  region: "header" | "sidebar" | "main" | "aside" | "footer" | "overlay";
  components: string[];
}

export interface LayoutDefinition {
  id: RouteLayout;
  description: string;
  regions: LayoutRegion[];
}

/** Design tokens — one source for web/mobile/desktop/tv/watch themes. */
export interface DesignTokens {
  colors: Record<string, string>;
  spacing: Record<string, string>;
  typography: {
    fonts: Record<string, string>;
    sizes: Record<string, string>;
    weights: Record<string, number>;
    lineHeights: Record<string, number>;
  };
  icons: Record<string, string>;
  motion: { durations: Record<string, string>; easings: Record<string, string> };
}

export type ContentFieldType =
  | "string"
  | "text"
  | "richtext"
  | "number"
  | "boolean"
  | "date"
  | "duration"
  | "url"
  | "asset"
  | "reference"
  | "cue-list"
  | "money";

export interface ContentField {
  name: string;
  type: ContentFieldType;
  required: boolean;
  description?: string;
  /** For type "reference": the referenced content-type id. */
  references?: string;
}

/** Content type schema. Routes reference these instead of embedding assumptions. */
export interface ContentTypeDefinition {
  id: string;
  name: string;
  description: string;
  status: RouteStatus;
  implementedBy: string[];
  workflow: string;
  fields: ContentField[];
}

export interface WorkflowTransition {
  from: string;
  to: string;
  /** Human-checked requirements (PHKD gates) that must hold before transition. */
  requires: string[];
  roles: Permission[];
}

export interface WorkflowDefinition {
  id: string;
  name: string;
  description: string;
  states: string[];
  initial: string;
  transitions: WorkflowTransition[];
}

// ---------------------------------------------------------------------------
// Agent layer: the radio as an autonomous, fail-closed co-pilot.
// ---------------------------------------------------------------------------

export type AgentActionType =
  | "select-station"
  | "play-track"
  | "announce"
  | "recommend"
  | "suggest-purchase"
  | "weather-brief"
  | "insert-ad"
  | "answer-question"
  | "run-quiz"
  | "compose-content";

/** One thing the agent can do. Same PHKD rules: planned capabilities claim nothing. */
export interface AgentCapability {
  id: AgentActionType;
  name: string;
  description: string;
  status: RouteStatus;
  implementedBy: string[];
  /** Gates that must hold before the action may execute (validated server-side). */
  gates: string[];
  /** TTS personas allowed to voice this action (empty = silent action). */
  personas: string[];
}

/** Global behaviour policy — the agent's constitution. Enforced, not hoped for. */
export interface AgentPolicy {
  disclosure: string;
  /** Template for LLM outputs; {provider} substituted server-side. */
  llmDisclosure: string;
  daypartPersona: Record<"morning" | "day" | "evening" | "night", string>;
  daypartStations: Record<"morning" | "day" | "evening" | "night", string[]>;
  upsellAfterPreviews: number;
  maxAnnouncementsPerHour: number;
  /** Phase-3 continuous learning: bounded feedback-driven weight adjustment. */
  learning: { enabled: boolean; adjustmentRate: number; minWeight: number };
  rules: string[];
}

/** A product in the multi-app workspace. Statuses stay evidence-backed. */
export interface WorkspaceApp {
  id: string;
  name: string;
  description: string;
  status: RouteStatus;
  implementedBy: string[];
  /** Route-id prefix(es) this app owns in the shared registry. */
  routePrefixes: string[];
}
