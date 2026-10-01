// Talking to the free OpenStreetMap services: Overpass (main data), Nominatim (backup search,
// neighbourhood names) — plus caching and saving data on the device.
import { CONFIG, CATEGORIES, CACHE_TTL, OVERPASS_TIMEOUT, PREFETCH_RADIUS, PREFETCH_MARGIN } from "./config.js";
import { state } from "./state.js";
import { getLang } from "./i18n.js";
import { distanceMeters, sleep, storeSet, STORE } from "./utils.js";
import { positionOf, KEEP_TAGS } from "./places.js";

// ---------- Overpass (main source) ----------

// One query loads all four categories at once, so switching tabs needs no new download.
function buildQuery(center, radius) {
  const around = `(around:${Math.round(radius)},${center.lat.toFixed(5)},${center.lng.toFixed(5)})`;
  return `[out:json][timeout:25];(nwr["amenity"~"^(cafe|pub|bar|restaurant)$"]["name"]${around};nwr["shop"="coffee"]["name"]${around};);out center tags;`;
}

// Asks every Overpass server at the same time and uses the first good answer.
async function fetchOverpass(query) {
  const servers = CONFIG.OVERPASS_SERVERS;
  const controllers = servers.map(() => new AbortController());
  const attempts = servers.map(async (server, i) => {
    const timer = setTimeout(() => controllers[i].abort(), OVERPASS_TIMEOUT);
    try {
      const res = await fetch(server, { method: "POST", body: new URLSearchParams({ data: query }), signal: controllers[i].signal });
      if (!res.ok) throw new Error(`${server} responded ${res.status}`);
      const json = await res.json();
      if (json.remark && !json.elements?.length) throw new Error(json.remark);
      return json.elements || [];
    } catch (err) {
      console.warn("Overpass server failed:", server, err.message);
      throw err;
    } finally {
      clearTimeout(timer);
    }
  });
  try {
    return await Promise.any(attempts);
  } catch (err) {
    throw err.errors?.[0] || err;
  } finally {
    controllers.forEach((c) => c.abort()); // stop the slower servers
  }
}

export const covers = (area, center, radius) => distanceMeters(area.center, center) + radius <= area.radius;

export function findCachedArea(center, radius) {
  return state.areas.find((a) => Date.now() - a.time < CACHE_TTL && covers(a, center, radius));
}

// Starts (or reuses) a download that covers this circle.
export function downloadArea(center, radius) {
  const running = state.inFlight.find((f) => covers(f, center, radius));
  if (running) return running.promise;

  const fetchRadius = Math.max(radius, PREFETCH_RADIUS) + PREFETCH_MARGIN;
  const entry = { center, radius: fetchRadius };
  entry.promise = fetchOverpass(buildQuery(center, fetchRadius))
    .then((elements) => {
      const area = { center, radius: fetchRadius, time: Date.now(), elements };
      state.areas.unshift(area);
      state.areas.length = Math.min(state.areas.length, 8);
      saveArea(area);
      return elements;
    })
    .catch((err) => {
      state.overpassDownUntil = Date.now() + 2 * 60 * 1000; // skip straight to the backup for a while
      throw err;
    })
    .finally(() => { state.inFlight = state.inFlight.filter((f) => f !== entry); });
  state.inFlight.push(entry);
  return entry.promise;
}

// Saves the last download on this device, so the next visit can show it instantly.
export function saveArea(area) {
  const elements = [];
  for (const el of area.elements) {
    const pos = positionOf(el);
    if (!pos) continue;
    const tags = {};
    for (const k of KEEP_TAGS) if (el.tags?.[k]) tags[k] = el.tags[k];
    elements.push({ type: el.type, id: el.id, lat: pos.lat, lon: pos.lng, tags });
  }
  storeSet(STORE.area, { center: area.center, radius: area.radius, time: area.time, elements });
}

// ---------- Nominatim (backup source and neighbourhood names) ----------

// Nominatim's usage policy allows max 1 request per second, so all its requests wait in one queue.
let nominatimQueue = Promise.resolve();
let lastNominatimCall = 0;
export function nominatimFetch(path, params) {
  const run = nominatimQueue.then(async () => {
    const wait = lastNominatimCall + 1100 - Date.now();
    if (wait > 0) await sleep(wait);
    lastNominatimCall = Date.now();
    const res = await fetch(`https://nominatim.openstreetmap.org/${path}?${new URLSearchParams(params)}`);
    if (!res.ok) throw new Error(`Nominatim responded ${res.status}`);
    return res.json();
  });
  nominatimQueue = run.catch(() => {});
  return run;
}

export function nominatimToElement(r) {
  const a = r.address || {};
  return {
    type: r.osm_type, id: r.osm_id, lat: Number(r.lat), lon: Number(r.lon),
    tags: {
      ...(r.extratags || {}), name: r.name, [r.category]: r.type,
      "addr:street": a.road, "addr:housenumber": a.house_number, "addr:city": a.city || a.town || a.village,
    },
  };
}

// Backup source: max 40 results per category, but usually available when Overpass is overloaded.
export function fetchNominatim(center, radius, category) {
  if (category === "all") {
    const singles = ["coffee", "bars", "restaurants", "pubs"].map((c) => fetchNominatim(center, radius, c));
    return Promise.all(singles).then((lists) => lists.flat());
  }

  // Reuse a download for the same spot with an equal or bigger radius (the list is filtered to the circle later).
  const spot = `${category}|${center.lat.toFixed(3)}|${center.lng.toFixed(3)}`;
  for (const [k, hit] of state.quickCache) {
    const [c, la, ln, r] = k.split("|");
    if (`${c}|${la}|${ln}` === spot && Number(r) >= radius && Date.now() - hit.time < CACHE_TTL) return hit.promise;
  }
  const key = `${spot}|${radius}`;

  const dLat = radius / 111320;
  const dLng = radius / (111320 * Math.cos((center.lat * Math.PI) / 180));
  const viewbox = [center.lng - dLng, center.lat + dLat, center.lng + dLng, center.lat - dLat].join(",");
  const promise = nominatimFetch("search", {
    q: `[${CATEGORIES[category].nominatim}]`, format: "jsonv2", viewbox, bounded: "1", limit: "40", extratags: "1", addressdetails: "1",
  }).then((results) => results.map(nominatimToElement));

  state.quickCache.set(key, { time: Date.now(), promise });
  promise.catch(() => state.quickCache.delete(key));
  return promise;
}

// In backup mode, quietly load the other categories so switching tabs is instant,
// then save them all on this device for the next visit.
export function prefetchBackup(center, radius) {
  fetchNominatim(center, radius, "all")
    .then((elements) => saveArea({ center, radius, time: Date.now(), elements }))
    .catch(() => {});
}

// Wider search (about 10 km) for a name or food that isn't nearby.
export async function searchWide(center, words) {
  const d = 0.09;
  const results = await nominatimFetch("search", {
    q: words, format: "jsonv2", viewbox: [center.lng - d, center.lat + d, center.lng + d, center.lat - d].join(","),
    bounded: "1", limit: "40", extratags: "1", addressdetails: "1",
  });
  return results.map(nominatimToElement);
}

// The address around a point, in the current language (for the neighbourhood name).
export async function reverseGeocode(center) {
  const json = await nominatimFetch("reverse", {
    format: "jsonv2", zoom: "16", lat: center.lat, lon: center.lng, "accept-language": getLang(),
  });
  return json.address || {};
}
