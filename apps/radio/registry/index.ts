// Registry platform — combined, validated, precomputed.
//
// The 20 section modules are the single source of truth. This index:
//   1. combines them in stable section order,
//   2. computes children (never authored by hand),
//   3. precomputes O(1) lookup maps (byId, byPath, dynamic matchers),
//   4. validates the whole registry (unique ids/paths, enum integrity,
//      evidence rules, dependency references + cycle detection, API refs).
//
// Consumed by scripts/build-registry-platform.mjs (node --experimental-strip-types)
// and by tests. The Next app itself keeps reading the generated JSON artifacts —
// runtime behaviour is derived, never duplicated.
// NOTE: relative imports use explicit .ts extensions so Node's type-stripping
// loader can execute this file directly (tsconfig: allowImportingTsExtensions).

import type {
  CompiledRoute,
  FeatureFlag,
  Permission,
  RouteDefinition,
  RouteLayout,
  RoutePlatform,
  RouteStatus,
  SectionMeta
} from "./types.ts";
import { routes as publicRoutes } from "./public.ts";
import { routes as radio } from "./radio.ts";
import { routes as podcasts } from "./podcasts.ts";
import { routes as research } from "./research.ts";
import { routes as discover } from "./discover.ts";
import { routes as academy } from "./academy.ts";
import { routes as community } from "./community.ts";
import { routes as events } from "./events.ts";
import { routes as news } from "./news.ts";
import { routes as media } from "./media.ts";
import { routes as ai } from "./ai.ts";
import { routes as search } from "./search.ts";
import { routes as user } from "./user.ts";
import { routes as premium } from "./premium.ts";
import { routes as analytics } from "./analytics.ts";
import { routes as studio } from "./studio.ts";
import { routes as cms } from "./cms.ts";
import { routes as admin } from "./admin.ts";
import { routes as api } from "./api.ts";
import { routes as ecosystem } from "./ecosystem.ts";

export type {
  CompiledRoute,
  RouteDefinition,
  RouteStatus,
  RouteLayout,
  RoutePlatform,
  Permission,
  FeatureFlag
} from "./types.ts";

const MODULES: RouteDefinition[][] = [
  publicRoutes, radio, podcasts, research, discover, academy, community, events,
  news, media, ai, search, user, premium, analytics, studio, cms, admin, api, ecosystem
];

export const SECTIONS: SectionMeta[] = [
  { name: "Public Website", emoji: "🌐" },
  { name: "Radio", emoji: "📻" },
  { name: "Podcast", emoji: "🎙" },
  { name: "Research Hub", emoji: "🔬" },
  { name: "Science Categories", emoji: "🛰" },
  { name: "Academy", emoji: "🎓" },
  { name: "Community", emoji: "👥" },
  { name: "Events", emoji: "📅" },
  { name: "News", emoji: "📰" },
  { name: "Media", emoji: "🎥" },
  { name: "AI", emoji: "🤖" },
  { name: "Search", emoji: "🔍" },
  { name: "User", emoji: "👤" },
  { name: "Premium", emoji: "💎" },
  { name: "Analytics", emoji: "📊" },
  { name: "Studio", emoji: "🎛" },
  { name: "Content Management", emoji: "🗂" },
  { name: "Administration", emoji: "⚙" },
  { name: "API", emoji: "🔌" },
  { name: "Ecosystem Integration", emoji: "🌐" }
];

const VALID_STATUS: readonly RouteStatus[] = ["built", "partial", "planned"];
const VALID_LAYOUT: readonly RouteLayout[] = [
  "landing", "dashboard", "player", "studio", "article", "reader", "fullscreen", "settings", "admin", "modal"
];
const VALID_PLATFORM: readonly RoutePlatform[] = ["web", "mobile", "desktop", "tv", "car", "watch", "api", "offline"];
const VALID_PERMISSION: readonly Permission[] = [
  "anonymous", "listener", "student", "researcher", "creator", "moderator", "editor", "admin", "superadmin"
];
const VALID_FLAG: readonly FeatureFlag[] = [
  "radio2", "premium", "labs", "beta", "events", "academy", "enterprise", "experimental"
];

// ---------------------------------------------------------------------------
// Combine + compute children
// ---------------------------------------------------------------------------
const flat: RouteDefinition[] = MODULES.flat();

function computeChildren(all: RouteDefinition[]): CompiledRoute[] {
  return all.map((route) => {
    const base = route.path === "/" ? "" : route.path;
    const depth = base.split("/").filter(Boolean).length + 1;
    const children = all
      .filter(
        (candidate) =>
          candidate.path !== route.path &&
          candidate.path.startsWith(`${base}/`) &&
          candidate.path.split("/").filter(Boolean).length === depth
      )
      .map((candidate) => candidate.id);
    return { ...route, children };
  });
}

export const allRoutes: CompiledRoute[] = computeChildren(flat);

// ---------------------------------------------------------------------------
// O(1) lookups (precomputed once at module load; reused by build + tests)
// ---------------------------------------------------------------------------
export const byId: ReadonlyMap<string, CompiledRoute> = new Map(allRoutes.map((route) => [route.id, route]));
export const byPath: ReadonlyMap<string, CompiledRoute> = new Map(allRoutes.map((route) => [route.path, route]));
export const dynamicRoutes: readonly CompiledRoute[] = allRoutes.filter((route) => route.dynamic);

export function getRoute(id: string): CompiledRoute | undefined {
  return byId.get(id);
}

/** O(1) for exact paths; dynamic patterns fall back to a short scan of dynamicRoutes only. */
export function resolvePath(pathname: string): { route: CompiledRoute; params: Record<string, string> } | null {
  const clean = `/${pathname.split("/").filter(Boolean).join("/")}`;
  const exact = byPath.get(clean);
  if (exact) return { route: exact, params: {} };
  const parts = clean.split("/").filter(Boolean);
  for (const route of dynamicRoutes) {
    const patternParts = route.path.split("/").filter(Boolean);
    if (patternParts.length !== parts.length) continue;
    const params: Record<string, string> = {};
    let ok = true;
    for (let index = 0; index < patternParts.length; index += 1) {
      const pattern = patternParts[index];
      if (pattern.startsWith(":")) params[pattern.slice(1)] = decodeURIComponent(parts[index]);
      else if (pattern !== parts[index]) {
        ok = false;
        break;
      }
    }
    if (ok) return { route, params };
  }
  return null;
}

// ---------------------------------------------------------------------------
// Validation — throws with every problem listed (build fails loudly)
// ---------------------------------------------------------------------------
export function validateRegistry(routes: readonly CompiledRoute[] = allRoutes): string[] {
  const problems: string[] = [];
  const ids = new Set<string>();
  const paths = new Set<string>();
  const sectionNames = new Set<string>(SECTIONS.map((section) => section.name));

  for (const route of routes) {
    if (ids.has(route.id)) problems.push(`duplicate id: ${route.id}`);
    ids.add(route.id);
    if (paths.has(route.path)) problems.push(`duplicate path: ${route.path}`);
    paths.add(route.path);
    if (!/^[a-z0-9]+(?:[.\-][a-z0-9]+)*$/.test(route.id)) problems.push(`malformed id: ${route.id}`);
    if (!route.path.startsWith("/")) problems.push(`malformed path: ${route.path}`);
    if (!sectionNames.has(route.section)) problems.push(`unknown section: ${route.id} → ${route.section}`);
    if (!VALID_STATUS.includes(route.status)) problems.push(`invalid status: ${route.id}`);
    if (!VALID_LAYOUT.includes(route.layout)) problems.push(`invalid layout: ${route.id} → ${route.layout}`);
    if (route.platforms.length === 0) problems.push(`no platforms: ${route.id}`);
    for (const platform of route.platforms) {
      if (!VALID_PLATFORM.includes(platform)) problems.push(`invalid platform: ${route.id} → ${platform}`);
    }
    if (route.permissions.length === 0) problems.push(`no permissions: ${route.id}`);
    for (const permission of route.permissions) {
      if (!VALID_PERMISSION.includes(permission)) problems.push(`invalid permission: ${route.id} → ${permission}`);
    }
    for (const flag of route.featureFlags) {
      if (!VALID_FLAG.includes(flag)) problems.push(`invalid feature flag: ${route.id} → ${flag}`);
    }
    // PHKD evidence rules: built/partial require evidence; planned must not claim any.
    if (route.status !== "planned" && route.evidence.length === 0) {
      problems.push(`missing evidence for ${route.status} route: ${route.id}`);
    }
    if (route.status === "planned" && route.implementedBy.length > 0) {
      problems.push(`planned route claims implementation: ${route.id}`);
    }
    if (route.implementedBy.length !== route.evidence.length) {
      problems.push(`implementedBy/evidence mismatch: ${route.id}`);
    }
    // SEO completeness for indexable public routes.
    if (route.seo.robots === "index,follow") {
      if (!route.seo.title || !route.seo.description || route.seo.keywords.length === 0) {
        problems.push(`incomplete SEO on indexable route: ${route.id}`);
      }
    }
    if (route.dynamic !== route.path.includes(":")) problems.push(`dynamic flag mismatch: ${route.id}`);
    if (!route.analytics.screenName || !route.analytics.event) problems.push(`missing analytics meta: ${route.id}`);
  }

  // dependsOn references + cycle detection (DFS).
  for (const route of routes) {
    for (const dep of route.dependsOn) {
      if (!ids.has(dep)) problems.push(`unknown dependency: ${route.id} → ${dep}`);
    }
  }
  const visiting = new Set<string>();
  const done = new Set<string>();
  const lookup = new Map(routes.map((route) => [route.id, route]));
  const visit = (id: string, trail: string[]): void => {
    if (done.has(id)) return;
    if (visiting.has(id)) {
      problems.push(`dependency cycle: ${[...trail, id].join(" → ")}`);
      return;
    }
    visiting.add(id);
    for (const dep of lookup.get(id)?.dependsOn ?? []) visit(dep, [...trail, id]);
    visiting.delete(id);
    done.add(id);
  };
  for (const route of routes) visit(route.id, []);

  return problems;
}
