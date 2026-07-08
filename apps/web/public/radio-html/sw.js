// Radio Vaigyaaniq service worker.
// static: cache-first · API: staleWhileRevalidate · audio: cache-first.
// Precache follows the rights-aware offline bundle (free full audio + preview
// clips only); background sync ("radio-outbox") tells clients to flush their
// offline outbox (play counts, gift intents) once connectivity returns.
const CACHE_VERSION = "v2";
const STATIC_CACHE = `radio-static-${CACHE_VERSION}`;
const AUDIO_CACHE = `radio-audio-${CACHE_VERSION}`;
const API_CACHE = `radio-api-${CACHE_VERSION}`;

const STATIC_FILES = [
  "/radio-html/",
  "/radio-html/index.html",
  "/radio-html/standalone-radio.html",
  "/radio-html/online-offline-radio-engine.html",
  "/radio-html/data/radio-engine-manifest.json",
  "/radio-html/data/radio-engine-offline-bundle.json",
  "/radio-html/data/lyrics-prompter-data.json",
  "/radio-html/assets/js/radio-engine.js"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    precache()
      .catch(() => undefined)
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key.startsWith("radio-") && ![STATIC_CACHE, AUDIO_CACHE, API_CACHE].includes(key))
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  if (url.pathname.startsWith("/api/")) {
    // Never cache payment/order state — entitlements must come from the server.
    if (url.pathname.startsWith("/api/payments/") || url.pathname.startsWith("/api/sync")) {
      event.respondWith(
        fetch(event.request).catch(() =>
          jsonResponse({ error: "offline", status: "blocked-network-unavailable" }, 503)
        )
      );
      return;
    }
    event.respondWith(staleWhileRevalidate(event.request, API_CACHE));
    return;
  }

  if (/\.(mp3|aac|ogg|wav|m4a)$/i.test(url.pathname)) {
    event.respondWith(cacheFirst(event.request, AUDIO_CACHE));
    return;
  }

  if (url.pathname.startsWith("/radio-html/")) {
    event.respondWith(cacheFirst(event.request, STATIC_CACHE));
    return;
  }

  event.respondWith(fetch(event.request).catch(() => caches.match(event.request)));
});

// Background sync: ask every client to flush its offline outbox.
self.addEventListener("sync", (event) => {
  if (event.tag === "radio-outbox") {
    event.waitUntil(
      self.clients
        .matchAll({ includeUncontrolled: true })
        .then((clients) => clients.forEach((client) => client.postMessage({ type: "flush-outbox" })))
    );
  }
});

// Clients can push additional allowed URLs (e.g. a purchased track after webhook
// verification) without waiting for a new install.
self.addEventListener("message", (event) => {
  if (event.data?.type === "cache-urls" && Array.isArray(event.data.urls)) {
    event.waitUntil?.(cacheUrls(event.data.urls));
    cacheUrls(event.data.urls);
  }
});

async function cacheUrls(urls) {
  const audioCache = await caches.open(AUDIO_CACHE);
  const staticCache = await caches.open(STATIC_CACHE);
  for (const assetPath of urls.slice(0, 300)) {
    try {
      const request = new Request(assetPath, { cache: "reload" });
      if (/\.(mp3|aac|ogg|wav|m4a)$/i.test(assetPath)) await audioCache.add(request);
      else await staticCache.add(request);
    } catch {
      // best-effort
    }
  }
}

async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  const fetched = fetch(request)
    .then((response) => {
      if (response && response.ok) cache.put(request, response.clone());
      return response;
    })
    .catch(() => cached || jsonResponse({ error: "offline", status: "blocked-network-unavailable" }, 503));
  return cached || fetched;
}

async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (response && response.ok) cache.put(request, response.clone());
  return response;
}

function jsonResponse(value, status) {
  return new Response(JSON.stringify(value), {
    status,
    headers: { "content-type": "application/json" }
  });
}

async function precache() {
  const staticCache = await caches.open(STATIC_CACHE);
  await staticCache.addAll(STATIC_FILES);
  const response = await fetch("/radio-html/data/radio-engine-offline-bundle.json", { cache: "no-cache" });
  if (!response.ok) return;
  const bundle = await response.json();
  // cachePaths is rights-aware: core surfaces + free-tier full audio + preview clips + covers.
  const paths = [...new Set(bundle.cachePaths || [])].slice(0, 320);
  await cacheUrls(paths);
}
