// SpotHop service worker: makes repeat visits fast and lets the app open without internet.
// (It must live in the top folder so it can look after every page and file of the site.)
//
//   SpotHop's own files  → network first (so updates show straight away), saved copy when offline
//   Libraries + fonts    → saved copy first (their versions never change), updated in the background
//   Map tiles            → saved copy first; the last 400 viewed are kept
//   Live data (places, routes, addresses) → always from the network; the app keeps its own copy

const VERSION = "spothop-v1";
const APP_CACHE = `${VERSION}-app`;
const LIB_CACHE = `${VERSION}-libs`;
const TILE_CACHE = `${VERSION}-tiles`;
const MAX_TILES = 400;

const LIBRARY_HOSTS = ["cdnjs.cloudflare.com", "cdn.jsdelivr.net", "fonts.googleapis.com", "fonts.gstatic.com"];
const TILE_HOST = "tile.openstreetmap.org";

self.addEventListener("install", (event) => {
  // Save the start page right away, so the app can open offline after the very first visit.
  event.waitUntil(caches.open(APP_CACHE).then((cache) => cache.add("./")).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (event) => {
  // Remove caches from older versions of this file.
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => !k.startsWith(VERSION)).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

// The page sends the files it has already loaded, so they're saved even on the very first visit.
self.addEventListener("message", (event) => {
  if (event.data?.type !== "save-files") return;
  event.waitUntil((async () => {
    const app = await caches.open(APP_CACHE);
    const libs = await caches.open(LIB_CACHE);
    for (const href of event.data.urls) {
      const url = new URL(href);
      const cache = url.origin === self.location.origin ? app : LIBRARY_HOSTS.includes(url.hostname) ? libs : null;
      if (!cache || (await cache.match(href))) continue;
      try {
        const response = await fetch(href, { mode: url.origin === self.location.origin ? "same-origin" : "cors" });
        if (response.ok) await cache.put(href, response);
      } catch { /* skip files that can't be fetched now */ }
    }
  })());
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  const url = new URL(request.url);

  if (url.origin === self.location.origin) {
    event.respondWith(networkFirst(request, APP_CACHE));
  } else if (url.hostname.endsWith(TILE_HOST)) {
    event.respondWith(cacheFirst(request, TILE_CACHE, MAX_TILES));
  } else if (LIBRARY_HOSTS.includes(url.hostname)) {
    event.respondWith(staleWhileRevalidate(request, LIB_CACHE));
  }
  // Everything else (Overpass, Nominatim, routing) goes straight to the network.
});

async function networkFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  try {
    const response = await fetch(request);
    if (response.ok) cache.put(request, response.clone());
    return response;
  } catch (err) {
    const saved = await cache.match(request, { ignoreSearch: true });
    if (saved) return saved;
    // Offline and never saved: for page visits, fall back to the saved start page.
    if (request.mode === "navigate") {
      const start = await cache.match("./");
      if (start) return start;
    }
    throw err;
  }
}

async function cacheFirst(request, cacheName, maxEntries) {
  const cache = await caches.open(cacheName);
  const saved = await cache.match(request);
  if (saved) return saved;
  const response = await fetch(request);
  if (response.ok) {
    await cache.put(request, response.clone());
    trimCache(cache, maxEntries);
  }
  return response;
}

async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const saved = await cache.match(request);
  const fresh = fetch(request).then((response) => {
    if (response.ok || response.type === "opaque") cache.put(request, response.clone());
    return response;
  }).catch(() => saved);
  return saved || fresh;
}

// Keeps a cache to its newest `maxEntries` items (oldest are removed first).
async function trimCache(cache, maxEntries) {
  const keys = await cache.keys();
  for (const key of keys.slice(0, Math.max(0, keys.length - maxEntries))) await cache.delete(key);
}
