// radio-bridge.ts — typed bridge between the web shell and the Rust (Tauri) backend.
// Falls back to NULL/blocked values when not running inside a Tauri runtime
// (fail-closed: never fabricate native results in a plain browser).

type Json = Record<string, unknown>;

export type CatalogEntry = {
  label: string;
  url: string;
  group: string;
};

export type CatalogGroup = {
  label: string;
  entries: CatalogEntry[];
};

let invokeFn: ((cmd: string, args?: Json) => Promise<unknown>) | null = null;
async function getInvoke() {
  if (invokeFn) return invokeFn;
  try {
    const core = await import(/* @vite-ignore */ "@tauri-apps/api/core") as unknown as { invoke?: (cmd: string, args?: Json) => Promise<unknown> };
    invokeFn = core.invoke ?? null;
    return invokeFn;
  } catch {
    return null; // not in Tauri runtime
  }
}

export function inTauri(): boolean {
  return typeof (window as any).__TAURI_INTERNALS__ !== "undefined";
}

export async function bundleMetadata(): Promise<Json> {
  const invoke = await getInvoke();
  if (!invoke || !inTauri()) {
    return { runtime: "browser", productName: null, version: null, identifier: null, platform: null, build_hash: null, installer: null };
  }
  return (await invoke("bundle_metadata")) as Json;
}

export async function writeEvidence(kind: string, payload: Json): Promise<string | null> {
  const invoke = await getInvoke();
  if (!invoke || !inTauri()) return null; // blocked outside Tauri
  return (await invoke("write_evidence", { kind, payload })) as string;
}

export async function storageSet(key: string, value: string): Promise<boolean> {
  const invoke = await getInvoke();
  if (!invoke || !inTauri()) return false;
  return (await invoke("storage_set", { key, value })) as boolean;
}

export async function storageGet(key: string): Promise<string | null> {
  const invoke = await getInvoke();
  if (!invoke || !inTauri()) return null;
  return (await invoke("storage_get", { key })) as string | null;
}

export async function archiveEntrypoints(): Promise<string[]> {
  const invoke = await getInvoke();
  if (!invoke || !inTauri()) return Object.values(RADIO_ENTRYPOINTS);
  return (await invoke("archive_entrypoints")) as string[];
}

function isRouteCandidate(value: unknown): value is string {
  return typeof value === "string" && value.startsWith("/radio-html/");
}

function labelForPath(path: string): string {
  const leaf = path.split("/").filter(Boolean).pop() ?? path;
  return leaf
    .replace(/\.[^.]+$/, "")
    .replace(/^Radio_Vaigyaaniq_/, "")
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (value) => value.toUpperCase());
}

function dedupeGroups(groups: CatalogGroup[]): CatalogGroup[] {
  const seen = new Set<string>();
  return groups
    .map((group) => ({
      ...group,
      entries: group.entries.filter((entry) => {
        if (seen.has(entry.url)) return false;
        seen.add(entry.url);
        return true;
      })
    }))
    .filter((group) => group.entries.length > 0);
}

function fallbackCatalogGroups(): CatalogGroup[] {
  return [{
    label: "Primary Archive",
    entries: Object.entries(RADIO_ENTRYPOINTS).map(([label, url]) => ({
      label,
      url,
      group: "Primary Archive"
    }))
  }];
}

export async function catalogEntrypoints(): Promise<CatalogGroup[]> {
  try {
    const response = await fetch("/radio-html/Radio_Vaigyaaniq_All_Html_Links.json", { cache: "no-store" });
    if (response.ok) {
      const catalog = await response.json() as {
        groups?: Array<{ title?: unknown; links?: Array<{ title?: unknown; path?: unknown }> }>;
      };
      const groups = (catalog.groups ?? []).map((group) => {
        const label = typeof group.title === "string" ? group.title : "Catalog";
        return {
          label,
          entries: (group.links ?? [])
            .flatMap((link) => {
              if (!isRouteCandidate(link.path)) return [];
              const routePath = link.path;
              return [{
                label: typeof link.title === "string" ? link.title : labelForPath(routePath),
                url: routePath,
                group: label
              }];
            })
        };
      });
      const deduped = dedupeGroups(groups);
      if (deduped.length) return deduped;
    }
  } catch {
    // Fall through to scaffold/fallback. Missing catalog must not invent readiness.
  }

  try {
    const response = await fetch("/radio-html/Radio_Vaigyaaniq_Full_App_Scaffold.json", { cache: "no-store" });
    if (response.ok) {
      const scaffold = await response.json() as {
        routes?: Array<{ path?: unknown; surface?: unknown; status?: unknown }>;
      };
      const entries = (scaffold.routes ?? [])
        .flatMap((route) => {
          if (!isRouteCandidate(route.path)) return [];
          const routePath = route.path;
          return [{
            label: typeof route.surface === "string" ? route.surface : labelForPath(routePath),
            url: routePath,
            group: typeof route.status === "string" ? `Scaffold: ${route.status}` : "Scaffold"
          }];
        });
      const deduped = dedupeGroups([{ label: "Scaffold Routes", entries }]);
      if (deduped.length) return deduped;
    }
  } catch {
    // Fall through to static fallback.
  }

  return fallbackCatalogGroups();
}

// Radio archive entrypoints (served from public/radio-html). Existing public URLs are preserved.
export const RADIO_ENTRYPOINTS: Record<string, string> = {
  "Structure Map": "/radio-html/structure/index.html",
  "App Prototype": "/radio-html/Radio_Vaigyaaniq_App_Prototype.html",
  "Full App": "/radio-html/Radio_Vaigyaaniq_Full_App.html",
  "UX Dashboard": "/radio-html/Radio_Vaigyaaniq_UX_Dashboard.html",
};
