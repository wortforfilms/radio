// radio-bridge.ts — typed bridge between the web shell and the Rust (Tauri) backend.
// Falls back to NULL/blocked values when not running inside a Tauri runtime
// (fail-closed: never fabricate native results in a plain browser).

type Json = Record<string, unknown>;

let invokeFn: ((cmd: string, args?: Json) => Promise<unknown>) | null = null;
async function getInvoke() {
  if (invokeFn) return invokeFn;
  try {
    const core = await import(/* @vite-ignore */ "@tauri-apps/api/core") as { invoke?: typeof invokeFn };
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

// Radio archive entrypoints (served from public/radio-html). Existing public URLs are preserved.
export const RADIO_ENTRYPOINTS: Record<string, string> = {
  "Structure Map": "/radio-html/structure/index.html",
  "App Prototype": "/radio-html/Radio_Vaigyaaniq_App_Prototype.html",
  "Full App": "/radio-html/Radio_Vaigyaaniq_Full_App.html",
  "UX Dashboard": "/radio-html/Radio_Vaigyaaniq_UX_Dashboard.html",
};
