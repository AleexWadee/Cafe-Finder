// SpotHop — find cafes, pubs, bars and restaurants near you on a live map.
// Free data: OpenStreetMap (via the Overpass API, with Nominatim as backup) — no API key required.

const CONFIG = window.SPOTHOP_CONFIG || {};
const OVERPASS_SERVERS = CONFIG.OVERPASS_SERVERS || ["https://overpass-api.de/api/interpreter"];

const CATEGORIES = {
  coffee:      { label: "Coffee",      emoji: "☕",  one: "coffee spot", many: "coffee spots", nominatim: ["cafe"] },
  pubs:        { label: "Pubs",        emoji: "🍺", one: "pub",         many: "pubs",         nominatim: ["pub"] },
  bars:        { label: "Bars",        emoji: "🍸", one: "bar",         many: "bars",         nominatim: ["bar"] },
  restaurants: { label: "Restaurants", emoji: "🍽️", one: "restaurant",  many: "restaurants",  nominatim: ["restaurant"] },
  all:         { label: "All",         emoji: "📍", one: "place",       many: "places",       nominatim: ["cafe", "pub", "bar", "restaurant"] },
};

// Many places haven't published their hours on OpenStreetMap. For those, SpotHop estimates from
// the usual hours for that kind of place (written in OSM opening_hours format) and labels them "Likely".
const TYPICAL_HOURS = {
  es: { // Spain: early cafés, late lunch and dinner, late nights
    coffee: "Mo-Fr 07:00-21:00; Sa 08:00-21:00; Su 09:00-15:00",
    pubs: "Mo-Th,Su 17:00-02:00; Fr,Sa 17:00-03:30",
    bars: "Mo-Sa 07:30-24:00; Su 09:00-23:00",
    restaurants: "Mo-Su 13:00-16:30,20:00-23:30",
  },
  default: {
    coffee: "Mo-Fr 07:00-19:00; Sa,Su 08:00-18:00",
    pubs: "Mo-Th,Su 12:00-23:00; Fr,Sa 12:00-01:00",
    bars: "Mo-Th,Su 17:00-01:00; Fr,Sa 17:00-02:00",
    restaurants: "Mo-Su 12:00-15:00,18:00-22:30",
  },
};

// Free OSRM routing servers run by FOSSGIS (OpenStreetMap data, no key).
const ROUTE_MODES = {
  foot: { label: "Walk", emoji: "🚶" },
  bike: { label: "Bike", emoji: "🚲" },
  car:  { label: "Car",  emoji: "🚗" },
};
const ROUTE_REFRESH_DISTANCE = 30; // re-route after moving this far (meters) while directions are open

const MAX_RESULTS = 150;
const CACHE_TTL = 10 * 60 * 1000;
const OVERPASS_TIMEOUT = 12000;   // per server
const QUICK_RESULTS_DELAY = 2000; // show backup results if the main server is slower than this
const PREFETCH_RADIUS = 1000;     // always load at least this much, so smaller radiuses are instant
const PREFETCH_MARGIN = 400;      // extra margin so walking around doesn't need a new download
const AUTO_REFRESH_DISTANCE = 300;
const WALK_SPEED = 80;            // meters per minute

const state = {
  category: "coffee",
  radius: 1000,
  sort: "distance",
  openNow: false,
  query: "",
  map: null,
  markersLayer: null,
  radiusCircle: null,
  userPos: null,
  userMarker: null,
  followUser: true,
  searchCenter: null,
  namedCenter: null,
  countryCode: "",     // from reverse geocoding, used for public-holiday rules in opening hours
  region: "",
  elements: [],        // raw OSM elements for the current search (all categories)
  source: "none",      // "overpass" (complete), "quick" (temporary), "backup" (Nominatim only)
  loading: false,
  places: [],          // normalized places for the current category + radius
  markers: new Map(),  // place id -> L.Marker
  selectedId: null,
  searchToken: 0,
  areas: [],           // cached downloads: { center, radius, time, elements }
  inFlight: [],        // downloads in progress: { center, radius, promise }
  quickCache: new Map(),
  normCache: new Map(),
  overpassDownUntil: 0,
  route: null,         // { place, mode, data, origin, fromUser, time, calc }
  routeMode: "foot",
  routeLayer: null,
};

const $ = (sel) => document.querySelector(sel);
const els = {
  app: $("#app"),
  logo: $("#logo"),
  placeName: $("#placeName"),
  query: $("#query"),
  tabs: $("#tabs"),
  radius: $("#radius"),
  sort: $("#sort"),
  openNow: $("#openNow"),
  status: $("#status"),
  spinner: $("#spinner"),
  results: $("#results"),
  searchAreaBtn: $("#searchAreaBtn"),
  locateBtn: $("#locateBtn"),
  livePill: $("#livePill"),
  routeView: $("#routeView"),
};

// ---------- Helpers ----------

function escapeHtml(str = "") {
  return String(str).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

function distanceMeters(a, b) {
  const R = 6371000;
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

function formatDistance(m) {
  return m < 1000 ? `${Math.round(m / 10) * 10} m` : `${(m / 1000).toFixed(1)} km`;
}

function walkTime(m) {
  const min = Math.max(1, Math.round(m / WALK_SPEED));
  return min < 60 ? `${min} min walk` : `${Math.floor(min / 60)} h ${min % 60} min walk`;
}

function formatTime(date) {
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function prettify(value = "", max = 3) {
  return value.split(";").map((v) => v.trim().replace(/_/g, " ")).filter(Boolean).slice(0, max)
    .map((v) => v[0].toUpperCase() + v.slice(1)).join(", ");
}

function fold(str = "") {
  return str.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

function safeUrl(url) {
  if (!url) return null;
  const withScheme = /^https?:\/\//i.test(url) ? url : `https://${url}`;
  try { return new URL(withScheme).href; } catch { return null; }
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const catColor = (cat) => getComputedStyle(document.documentElement).getPropertyValue(`--c-${cat}`).trim();
const plural = (n, cat) => `${n} ${n === 1 ? CATEGORIES[cat].one : CATEGORIES[cat].many}`;

// ---------- Turning OpenStreetMap data into places ----------

function categoryOf(tags) {
  if (tags.amenity === "cafe" || tags.shop === "coffee") return "coffee";
  if (tags.amenity === "pub") return "pubs";
  if (tags.amenity === "bar") return "bars";
  if (tags.amenity === "restaurant") return "restaurants";
  return null;
}

function positionOf(el) {
  const lat = el.lat ?? el.center?.lat;
  const lng = el.lon ?? el.center?.lon;
  return lat == null || lng == null ? null : { lat, lng };
}

function kindLabel(tags) {
  if (tags.shop === "coffee") return "Coffee shop";
  return { cafe: "Café", pub: "Pub", bar: "Bar", restaurant: "Restaurant" }[tags.amenity] || "";
}

function addressOf(tags) {
  const street = [tags["addr:street"], tags["addr:housenumber"]].filter(Boolean).join(" ");
  return [street, tags["addr:city"]].filter(Boolean).join(", ");
}

// Category-specific highlights, so a pub, a cocktail bar and a restaurant each show what matters for them.
function highlightsOf(tags) {
  const yes = (k) => tags[k] === "yes" || tags[k] === "only";
  const out = [];
  if (yes("cocktails") || yes("drink:cocktail")) out.push("🍹 Cocktails");
  if (yes("real_ale") || yes("drink:real_ale")) out.push("🍺 Real ale");
  if (tags.brewery && tags.brewery !== "various") out.push(`🍺 ${prettify(tags.brewery, 1)}`);
  if (yes("drink:wine") || tags.bar === "wine") out.push("🍷 Wine");
  if (yes("live_music")) out.push("🎵 Live music");
  if (tags.sport && tags.amenity !== "restaurant") out.push("📺 Sports");
  if (yes("diet:vegan")) out.push("🌱 Vegan");
  else if (yes("diet:vegetarian")) out.push("🥗 Vegetarian");
  if (yes("diet:gluten_free")) out.push("🌾 Gluten-free");
  if (yes("outdoor_seating")) out.push("☀️ Terrace");
  if (tags.internet_access && tags.internet_access !== "no") out.push("📶 Wi-Fi");
  if (yes("takeaway")) out.push("🥡 Takeaway");
  if (yes("delivery")) out.push("🛵 Delivery");
  if (yes("reservation") || tags.reservation === "recommended") out.push("📅 Bookable");
  if (yes("wheelchair")) out.push("♿ Accessible");
  return out.slice(0, 4);
}

function parseHours(raw, lat, lng) {
  // The country code lets rules like "PH off" (public holidays) work.
  const where = { lat, lon: lng, address: { country_code: state.countryCode, state: state.region } };
  return new window.opening_hours(raw, where, { mode: 0, warnings_severity: 0 });
}

// Works out whether a place is open right now. Uses the place's real hours when it has them;
// otherwise typical hours for that kind of place, marked as an estimate.
function openingInfo(tags, cat, lat, lng) {
  const none = { isOpen: undefined, text: "", estimated: false, oh: null };
  if (typeof window.opening_hours !== "function") return none;

  let oh = null;
  let estimated = false;
  if (tags.opening_hours) {
    try { oh = parseHours(tags.opening_hours, lat, lng); } catch { oh = null; } // unreadable → estimate
  }
  if (!oh) {
    const typical = (TYPICAL_HOURS[state.countryCode] || TYPICAL_HOURS.default)[cat];
    try { oh = parseHours(typical, lat, lng); estimated = true; } catch { return none; }
  }

  const now = new Date();
  const isOpen = oh.getState(now);
  const next = oh.getNextChange(now);
  let text = "";
  if (next) {
    const sameDay = next.toDateString() === now.toDateString();
    const when = sameDay ? formatTime(next) : `${next.toLocaleDateString("en-GB", { weekday: "short" })} ${formatTime(next)}`;
    text = `${estimated ? "Usually " : ""}${isOpen ? "closes" : "opens"} ${when}`;
    text = text[0].toUpperCase() + text.slice(1);
  } else if (isOpen) {
    text = "Open 24/7";
  }
  return { isOpen, text, estimated, oh };
}

// The opening hours for the next 7 days, starting today.
function weekHtml(p) {
  if (!p.oh) return "";
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const rows = [];
  for (let d = 0; d < 7; d++) {
    const start = new Date(today);
    start.setDate(today.getDate() + d);
    const end = new Date(start);
    end.setDate(start.getDate() + 1);
    let text = "Closed";
    try {
      // Look a bit past midnight so late-night hours (e.g. 18:00–02:00) show their real closing time.
      const intervals = p.oh.getOpenIntervals(start, new Date(end.getTime() + 12 * 3600e3));
      if (intervals.some(([s, e]) => s <= start && e >= end)) {
        text = "Open 24 hours";
      } else {
        const parts = intervals
          .filter(([s]) => s < end)
          .filter(([s]) => !(s.getTime() === start.getTime() && p.oh.getState(new Date(start.getTime() - 60000)))) // continues from the night before
          .map(([s, e]) => `${formatTime(s)} – ${formatTime(e)}`);
        if (parts.length) text = parts.join(", ");
      }
    } catch { text = "—"; }
    const day = d === 0 ? "Today" : start.toLocaleDateString("en-GB", { weekday: "long" });
    rows.push(`<tr${d === 0 ? ' class="today"' : ""}><th>${escapeHtml(day)}</th><td>${escapeHtml(text)}</td></tr>`);
  }
  const note = p.estimated
    ? `<p class="hours-note">⚠️ Estimated from typical hours for a ${escapeHtml(p.kind.toLowerCase() || "place")} here. This place hasn't published its hours on OpenStreetMap. <a href="https://www.openstreetmap.org/edit?${p.osmType}=${p.osmId}" target="_blank" rel="noopener">Add the real hours</a></p>`
    : `<p class="hours-note">✓ Published opening hours</p>`;
  return `<table class="week">${rows.join("")}</table>${note}`;
}

// Parsing opening hours is the slowest step, so each place is normalized once and reused.
function normalize(el) {
  const id = `${el.type}/${el.id}`;
  const cached = state.normCache.get(id);
  if (cached && Date.now() - cached.time < 5 * 60 * 1000) return cached.place;

  const tags = el.tags || {};
  const pos = positionOf(el);
  const cat = categoryOf(tags);
  if (!pos || !tags.name || !cat) return null;

  const { isOpen, text: hoursText, estimated, oh } = openingInfo(tags, cat, pos.lat, pos.lng);
  const place = {
    id,
    osmType: el.type,
    osmId: el.id,
    name: tags.name,
    lat: pos.lat,
    lng: pos.lng,
    tags,
    cat,
    emoji: CATEGORIES[cat].emoji,
    kind: kindLabel(tags),
    cuisine: prettify(tags.cuisine),
    address: addressOf(tags),
    website: safeUrl(tags.website || tags["contact:website"]),
    phone: tags.phone || tags["contact:phone"] || "",
    isOpen,
    hoursText,
    estimated,
    oh,
    highlights: highlightsOf(tags),
    distance: 0,
  };
  place.searchText = fold(`${place.name} ${place.kind} ${place.cuisine}`);
  state.normCache.set(id, { time: Date.now(), place });
  return place;
}

// ---------- Downloading data ----------

// One query loads all four categories at once, so switching tabs needs no new download.
function buildQuery(center, radius) {
  const around = `(around:${Math.round(radius)},${center.lat.toFixed(5)},${center.lng.toFixed(5)})`;
  return `[out:json][timeout:25];(nwr["amenity"~"^(cafe|pub|bar|restaurant)$"]["name"]${around};nwr["shop"="coffee"]["name"]${around};);out center tags;`;
}

// Asks every Overpass server at the same time and uses the first good answer.
async function fetchOverpass(query) {
  const controllers = OVERPASS_SERVERS.map(() => new AbortController());
  const attempts = OVERPASS_SERVERS.map(async (server, i) => {
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

const covers = (area, center, radius) => distanceMeters(area.center, center) + radius <= area.radius;

function findCachedArea(center, radius) {
  return state.areas.find((a) => Date.now() - a.time < CACHE_TTL && covers(a, center, radius));
}

// Starts (or reuses) a download that covers this circle.
function downloadArea(center, radius) {
  const running = state.inFlight.find((f) => covers(f, center, radius));
  if (running) return running.promise;

  const fetchRadius = Math.max(radius, PREFETCH_RADIUS) + PREFETCH_MARGIN;
  const entry = { center, radius: fetchRadius };
  entry.promise = fetchOverpass(buildQuery(center, fetchRadius))
    .then((elements) => {
      state.areas.unshift({ center, radius: fetchRadius, time: Date.now(), elements });
      state.areas.length = Math.min(state.areas.length, 8);
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

// Nominatim's usage policy allows max 1 request per second, so all its requests wait in one queue.
let nominatimQueue = Promise.resolve();
let lastNominatimCall = 0;
function nominatimFetch(path, params) {
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

// Backup source: Nominatim (OpenStreetMap's search engine). Max 40 results per type, but fast.
function fetchNominatim(center, radius, category) {
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
    q: `[${CATEGORIES[category].nominatim[0]}]`, format: "jsonv2", viewbox, bounded: "1", limit: "40", extratags: "1", addressdetails: "1",
  }).then((results) => results.map((r) => {
    const a = r.address || {};
    return {
      type: r.osm_type, id: r.osm_id, lat: Number(r.lat), lon: Number(r.lon),
      tags: {
        ...(r.extratags || {}), name: r.name, [r.category]: r.type,
        "addr:street": a.road, "addr:housenumber": a.house_number, "addr:city": a.city || a.town || a.village,
      },
    };
  }));

  state.quickCache.set(key, { time: Date.now(), promise });
  promise.catch(() => state.quickCache.delete(key));
  return promise;
}

// In backup mode, quietly load the other categories so switching tabs is instant.
function prefetchBackup(center, radius) {
  for (const cat of ["bars", "restaurants", "pubs", "coffee"]) {
    if (cat !== state.category) fetchNominatim(center, radius, cat).catch(() => {});
  }
}

// Shows the name of the neighbourhood under the search ("Arenales, Las Palmas").
async function updatePlaceName(center) {
  if (state.namedCenter && distanceMeters(center, state.namedCenter) < 400) return;
  state.namedCenter = center;
  try {
    const a = (await nominatimFetch("reverse", { format: "jsonv2", zoom: "16", lat: center.lat, lon: center.lng })).address || {};
    if (a.country_code && a.country_code !== state.countryCode) {
      state.countryCode = a.country_code;
      state.region = a.state || "";
      state.normCache.clear(); // re-check opening hours with the right public holidays
      if (!state.loading) { computePlaces(); render(); }
    }
    const area = a.neighbourhood || a.suburb || a.quarter || a.city_district || a.road;
    const city = a.city || a.town || a.village;
    els.placeName.textContent = `📍 ${[area, city].filter(Boolean).join(", ") || "Around you"}`;
  } catch {
    els.placeName.textContent = "📍 Around you";
  }
}

// ---------- Search ----------

async function search(center = state.map.getCenter()) {
  center = { lat: center.lat, lng: center.lng };
  const token = ++state.searchToken;
  state.searchCenter = center;
  state.selectedId = null;
  els.searchAreaBtn.classList.add("hidden");
  drawRadius();
  updatePlaceName(center);

  // Instant: we already downloaded this area.
  const cached = findCachedArea(center, state.radius);
  if (cached) return useElements(cached.elements, "overpass");

  // Clear old results immediately so another category's places are never shown.
  state.elements = [];
  state.places = [];
  setLoading(true);
  renderSkeleton();
  renderCounts();
  setStatus(`Looking for ${CATEGORIES[state.category].many}…`);

  if (Date.now() > state.overpassDownUntil) {
    const download = downloadArea(center, state.radius);
    const quickTimer = setTimeout(() => showBackupResults(token, center, true), QUICK_RESULTS_DELAY);
    try {
      const elements = await download;
      clearTimeout(quickTimer);
      if (token === state.searchToken) useElements(elements, "overpass");
      return;
    } catch {
      clearTimeout(quickTimer);
      if (token !== state.searchToken) return;
    }
  }
  await showBackupResults(token, center, false);
}

async function showBackupResults(token, center, temporary) {
  const category = state.category;
  try {
    const elements = await fetchNominatim(center, state.radius, category);
    if (token !== state.searchToken || category !== state.category) return;
    if (temporary && state.source === "overpass") return; // the full results already arrived
    useElements(elements, temporary ? "quick" : "backup");
    if (!temporary) prefetchBackup(center, state.radius);
  } catch (err) {
    if (token !== state.searchToken || temporary) return;
    console.error(err);
    setLoading(false);
    els.results.innerHTML = emptyState("📡", "Map data servers are busy", "Wait a few seconds and tap “Search this area” to try again.");
    setStatus("");
    els.searchAreaBtn.classList.remove("hidden");
  }
}

function useElements(elements, source) {
  state.elements = elements;
  state.source = source;
  setLoading(source === "quick");
  computePlaces();
  render();
}

function setLoading(on) {
  state.loading = on;
  els.spinner.classList.toggle("hidden", !on);
}

// Filters the downloaded data down to the current category and radius (fast, no network).
function computePlaces() {
  if (!state.searchCenter) return;
  const origin = state.userPos || state.searchCenter;
  const seen = new Set();
  const list = [];
  for (const el of state.elements) {
    const cat = categoryOf(el.tags || {});
    if (!cat || (state.category !== "all" && cat !== state.category)) continue;
    const pos = positionOf(el);
    if (!pos || distanceMeters(state.searchCenter, pos) > state.radius) continue;
    const place = normalize(el);
    if (!place || seen.has(place.id)) continue;
    seen.add(place.id);
    place.distance = distanceMeters(origin, place);
    list.push(place);
  }
  list.sort((a, b) => a.distance - b.distance);
  state.places = list.slice(0, MAX_RESULTS);
}

// Number badges on the category tiles.
function renderCounts() {
  const counts = { coffee: 0, pubs: 0, bars: 0, restaurants: 0, all: 0 };
  const complete = state.source === "overpass" && state.searchCenter;
  if (complete) {
    const seen = new Set();
    for (const el of state.elements) {
      const cat = categoryOf(el.tags || {});
      const pos = positionOf(el);
      const id = `${el.type}/${el.id}`;
      if (!cat || !pos || !el.tags.name || seen.has(id) || distanceMeters(state.searchCenter, pos) > state.radius) continue;
      seen.add(id);
      counts[cat]++;
      counts.all++;
    }
  }
  for (const btn of els.tabs.querySelectorAll(".cat")) {
    const n = counts[btn.dataset.cat];
    btn.querySelector(".count").textContent = complete ? (n > 999 ? "999+" : n) : "";
  }
}

// ---------- Rendering ----------

// "Open now" hides closed places. Places with published hours that are open come first,
// then places that are likely open based on typical hours.
const isConfirmedOpen = (p) => p.isOpen === true && !p.estimated;

function visiblePlaces() {
  let list = state.places;
  if (state.openNow) list = list.filter((p) => p.isOpen !== false);
  if (state.query) {
    const q = fold(state.query.trim());
    list = list.filter((p) => p.searchText.includes(q));
  }
  list = state.sort === "name" ? [...list].sort((a, b) => a.name.localeCompare(b.name)) : [...list];
  if (state.openNow) list.sort((a, b) => isConfirmedOpen(b) - isConfirmedOpen(a)); // stable: keeps the chosen order
  return list;
}

function render() {
  const list = visiblePlaces();
  renderMarkers(list);
  renderList(list);
  renderCounts();
  renderStatus(list);
}

function setStatus(html) {
  els.status.innerHTML = html;
}

function renderStatus(list) {
  const cat = state.category;
  const where = `within ${formatDistance(state.radius)}`;
  if (state.source === "quick") {
    setStatus(`<b>${plural(list.length, cat)}</b> · loading the full list…`);
  } else if (!state.places.length) {
    setStatus("");
  } else if (state.openNow) {
    const confirmed = list.filter(isConfirmedOpen).length;
    const detail = confirmed === list.length ? "" : ` · ${confirmed} confirmed, ${list.length - confirmed} likely`;
    setStatus(`<b>${list.length} open now</b>${detail}`);
  } else {
    const backup = state.source === "backup" ? ` <span class="note">· backup data</span>` : "";
    setStatus(`<b>${plural(list.length, cat)}</b> ${where}${backup}`);
  }
}

function emptyState(icon, title, text) {
  return `<li class="empty"><div class="empty-icon">${icon}</div><h3>${escapeHtml(title)}</h3><p>${escapeHtml(text)}</p></li>`;
}

function renderSkeleton() {
  els.results.innerHTML = Array.from({ length: 6 }, () => `
    <li class="card skeleton">
      <div class="card-icon"></div>
      <div class="card-body">
        <div class="line" style="width:60%"></div>
        <div class="line" style="width:35%"></div>
        <div class="line" style="width:80%"></div>
      </div>
    </li>`).join("");
}

function badgeHtml(p) {
  if (p.isOpen === undefined) return "";
  if (p.estimated) {
    const tip = 'title="Estimated from typical hours — this place hasn\'t published its hours"';
    return p.isOpen
      ? `<span class="badge likely-open" ${tip}>Likely open</span>`
      : `<span class="badge likely-closed" ${tip}>Likely closed</span>`;
  }
  return p.isOpen ? `<span class="badge open">Open</span>` : `<span class="badge closed">Closed</span>`;
}

function linksHtml(p) {
  return [
    `<button type="button" class="btn primary" data-route="${escapeHtml(p.id)}">🧭 Directions</button>`,
    p.website ? `<a class="btn" href="${escapeHtml(p.website)}" target="_blank" rel="noopener">🌐 Website</a>` : "",
    p.phone ? `<a class="btn" href="tel:${escapeHtml(p.phone.replace(/[^\d+]/g, ""))}">📞 Call</a>` : "",
  ].join("");
}

function renderList(list) {
  if (!list.length) {
    const c = CATEGORIES[state.category];
    els.results.innerHTML = state.places.length
      ? emptyState("🔎", "No matches", state.openNow && !state.query
          ? `All the ${c.many} nearby are closed right now.`
          : "Try a different name or clear the filters.")
      : emptyState(c.emoji, `No ${c.many} found here`, "Try a bigger distance, or drag the map and tap “Search this area”.");
    return;
  }

  const firstLikely = state.openNow ? list.findIndex((p) => !isConfirmedOpen(p)) : -1;
  els.results.innerHTML = list.map((p, i) => {
    const divider = i === firstLikely
      ? `<li class="divider">${i === 0 ? "None of these publish their hours — these are usually open at this time" : "Likely open — based on typical hours"}</li>`
      : "";
    const subtitle = [p.kind, p.cuisine].filter(Boolean).join(" · ");
    const meta = [formatDistance(p.distance), walkTime(p.distance), p.hoursText].filter(Boolean)
      .map((m) => `<span>${escapeHtml(m)}</span>`).join("");
    return `${divider}
      <li class="card t-${p.cat}${p.id === state.selectedId ? " selected" : ""}" data-id="${escapeHtml(p.id)}" tabindex="0">
        <div class="card-icon">${p.emoji}</div>
        <div class="card-body">
          <div class="card-top">
            <h3 class="name" title="${escapeHtml(p.name)}">${escapeHtml(p.name)}</h3>
            ${badgeHtml(p)}
          </div>
          ${subtitle ? `<div class="subtitle">${escapeHtml(subtitle)}</div>` : ""}
          <div class="meta">${meta}</div>
          ${p.highlights.length ? `<div class="chips">${p.highlights.map((h) => `<span>${escapeHtml(h)}</span>`).join("")}</div>` : ""}
          <div class="details">
            ${p.address ? `<p>🏠 ${escapeHtml(p.address)}</p>` : ""}
            <div class="week-wrap" data-week>${p.id === state.selectedId ? weekHtml(p) : ""}</div>
            <div class="actions">${linksHtml(p)}</div>
          </div>
        </div>
      </li>`;
  }).join("");
}

function pinIcon(p) {
  return L.divIcon({
    className: "",
    html: `<div class="pin t-${p.cat}" data-id="${escapeHtml(p.id)}"><span>${p.emoji}</span></div>`,
    iconSize: [34, 42],
    iconAnchor: [17, 40],
    popupAnchor: [0, -36],
  });
}

function renderMarkers(list) {
  const keep = new Set(list.map((p) => p.id));
  for (const [id, marker] of state.markers) {
    if (!keep.has(id)) {
      state.markersLayer.removeLayer(marker);
      state.markers.delete(id);
    }
  }
  for (const p of list) {
    if (state.markers.has(p.id)) continue;
    const marker = L.marker([p.lat, p.lng], { icon: pinIcon(p), title: p.name, riseOnHover: true })
      .bindPopup(() => popupHtml(p), { maxWidth: 270 })
      .on("click", () => selectPlace(p.id, { scrollList: true, openPopup: false }));
    state.markersLayer.addLayer(marker);
    state.markers.set(p.id, marker);
  }
}

function popupHtml(p) {
  const subtitle = [p.kind, p.cuisine].filter(Boolean).join(" · ");
  return `
    <div class="iw t-${p.cat}">
      <div class="iw-top"><h3>${p.emoji} ${escapeHtml(p.name)}</h3>${badgeHtml(p)}</div>
      ${subtitle ? `<p>${escapeHtml(subtitle)}</p>` : ""}
      <p>${[formatDistance(p.distance), walkTime(p.distance)].map(escapeHtml).join(" · ")}</p>
      ${p.hoursText ? `<p>🕒 ${escapeHtml(p.hoursText)}${p.estimated ? " (estimate)" : ""}</p>` : ""}
      ${p.address ? `<p>🏠 ${escapeHtml(p.address)}</p>` : ""}
      ${p.highlights.length ? `<div class="chips">${p.highlights.map((h) => `<span>${escapeHtml(h)}</span>`).join("")}</div>` : ""}
      <div class="actions">${linksHtml(p)}</div>
    </div>`;
}

function highlightPin(id, on) {
  state.markers.get(id)?.getElement()?.querySelector(".pin")?.classList.toggle("active", on);
}

function selectPlace(id, { scrollList = false, pan = false, openPopup = true } = {}) {
  const p = state.places.find((x) => x.id === id);
  if (!p) return;
  if (state.selectedId) highlightPin(state.selectedId, false);
  state.selectedId = id;
  highlightPin(id, true);

  els.results.querySelectorAll(".card.selected").forEach((el) => el.classList.remove("selected"));
  const card = els.results.querySelector(`[data-id="${CSS.escape(id)}"]`);
  if (card) {
    card.classList.add("selected");
    const week = card.querySelector("[data-week]");
    if (week && !week.innerHTML) week.innerHTML = weekHtml(p); // built only when opened
    if (scrollList) card.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  if (pan) {
    state.followUser = false;
    state.map.panTo([p.lat, p.lng]);
  }
  if (openPopup) state.markers.get(id)?.openPopup();
}

function drawRadius() {
  if (!state.searchCenter) return;
  const color = catColor(state.category);
  if (!state.radiusCircle) {
    state.radiusCircle = L.circle(state.searchCenter, {
      radius: state.radius, color, weight: 1.5, dashArray: "6 6", fillColor: color, fillOpacity: 0.05, interactive: false,
    }).addTo(state.map);
  } else {
    state.radiusCircle.setLatLng(state.searchCenter);
    state.radiusCircle.setRadius(state.radius);
    state.radiusCircle.setStyle({ color, fillColor: color });
  }
}

// ---------- Directions (inside SpotHop) ----------

function formatDuration(sec) {
  const min = Math.max(1, Math.round(sec / 60));
  return min < 60 ? `${min} min` : `${Math.floor(min / 60)} h ${min % 60} min`;
}

const COMPASS = ["north", "northeast", "east", "southeast", "south", "southwest", "west", "northwest"];
const TURN_WORDS = {
  left: "left", right: "right", "slight left": "slightly left", "slight right": "slightly right",
  "sharp left": "sharp left", "sharp right": "sharp right", straight: "straight", uturn: "around",
};
const TURN_ICONS = {
  left: "↰", right: "↱", "slight left": "↖", "slight right": "↗", "sharp left": "↰", "sharp right": "↱", straight: "↑", uturn: "↶",
};

// Turns an OSRM step into a readable instruction.
function stepText(step, place) {
  const m = step.maneuver;
  const dir = TURN_WORDS[m.modifier] || "";
  const onto = step.name ? ` onto ${step.name}` : "";
  switch (m.type) {
    case "depart": return `Head ${COMPASS[Math.round((m.bearing_after || 0) / 45) % 8]}${step.name ? ` on ${step.name}` : ""}`;
    case "arrive": return `Arrive at ${place.name}${m.modifier === "left" || m.modifier === "right" ? ` (on your ${m.modifier})` : ""}`;
    case "roundabout":
    case "rotary": return `At the roundabout, take the ${ordinal(m.exit || 1)} exit${onto}`;
    case "fork": return `Keep ${dir.replace("slightly ", "")}${onto}`;
    case "end of road": return `At the end of the road, turn ${dir}${onto}`;
    case "merge": return `Merge ${dir}${onto}`;
    case "new name":
    case "continue": return dir && dir !== "straight" ? `Continue ${dir}${onto}` : `Continue${step.name ? ` on ${step.name}` : " straight"}`;
    default: return dir === "straight" ? `Go straight${onto}` : `Turn ${dir}${onto}`;
  }
}

function ordinal(n) {
  return n + (["th", "st", "nd", "rd"][(n % 100 - 20) % 10] || ["th", "st", "nd", "rd"][n % 100] || "th");
}

function stepIcon(step) {
  const t = step.maneuver.type;
  if (t === "depart") return "●";
  if (t === "arrive") return "🏁";
  if (t === "roundabout" || t === "rotary") return "⟳";
  return TURN_ICONS[step.maneuver.modifier] || "↑";
}

function findPlace(id) {
  return state.places.find((p) => p.id === id) || (state.route?.place.id === id ? state.route.place : null);
}

function openRoute(place, mode = state.routeMode) {
  if (!place) return;
  state.routeMode = mode;
  state.route = { place, mode, data: null, calc: 0 };
  state.followUser = false;
  els.app.classList.add("routing");
  els.routeView.classList.remove("hidden");
  state.map.closePopup();
  highlightPin(place.id, true);
  state.radiusCircle?.setStyle({ opacity: 0, fillOpacity: 0 });
  renderRouteView();
  calcRoute({ fit: true });
}

function closeRoute() {
  if (!state.route) return;
  highlightPin(state.route.place.id, state.selectedId === state.route.place.id);
  state.route = null;
  if (state.routeLayer) state.map.removeLayer(state.routeLayer);
  state.routeLayer = null;
  els.app.classList.remove("routing");
  els.routeView.classList.add("hidden");
  els.routeView.innerHTML = "";
  state.radiusCircle?.setStyle({ opacity: 1, fillOpacity: 0.05 });
}

async function calcRoute({ fit = false } = {}) {
  const r = state.route;
  if (!r) return;
  const calc = ++r.calc;
  const origin = state.userPos || state.searchCenter;
  r.origin = origin;
  r.fromUser = Boolean(state.userPos);
  r.time = Date.now();

  try {
    const coords = `${origin.lng},${origin.lat};${r.place.lng},${r.place.lat}`;
    const url = `https://routing.openstreetmap.de/routed-${r.mode}/route/v1/driving/${coords}?overview=full&geometries=geojson&steps=true`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Routing server responded ${res.status}`);
    const json = await res.json();
    if (json.code !== "Ok" || !json.routes?.length) throw new Error(json.message || "No route found");
    if (state.route !== r || calc !== r.calc) return; // closed, or a newer route was requested
    r.data = json.routes[0];
    r.error = null;
    drawRoute(r, fit);
  } catch (err) {
    if (state.route !== r || calc !== r.calc) return;
    console.error(err);
    r.error = "Couldn't calculate a route right now. Check your connection and try again.";
  }
  renderRouteView();
}

function drawRoute(r, fit) {
  const latlngs = r.data.geometry.coordinates.map(([lng, lat]) => [lat, lng]);
  const color = catColor(r.place.cat);
  if (state.routeLayer) state.map.removeLayer(state.routeLayer);
  state.routeLayer = L.layerGroup([
    L.polyline(latlngs, { color: "#ffffff", weight: 10, opacity: 0.85, interactive: false }),
    L.polyline(latlngs, {
      color, weight: 6, opacity: 1, interactive: false, lineCap: "round",
      dashArray: r.mode === "foot" ? "0.1 11" : null, // dotted line for walking, like most map apps
    }),
  ]).addTo(state.map);
  if (fit) state.map.fitBounds(L.latLngBounds(latlngs), { padding: [70, 70] });
}

function renderRouteView() {
  const r = state.route;
  if (!r) return;
  const p = r.place;
  const modes = Object.entries(ROUTE_MODES).map(([key, m]) =>
    `<button type="button" data-mode="${key}" aria-checked="${key === r.mode}">${m.emoji} ${m.label}</button>`).join("");

  let body;
  if (r.error) {
    body = `<div class="route-msg">⚠️ ${escapeHtml(r.error)}<br><button type="button" class="btn" data-action="retry-route">Try again</button></div>`;
  } else if (!r.data) {
    body = `<div class="route-msg"><span class="spinner"></span> Finding the best route…</div>`;
  } else {
    const d = r.data;
    const arrived = r.fromUser && state.userPos && distanceMeters(state.userPos, p) < 25;
    const arrive = new Date(Date.now() + d.duration * 1000);
    const steps = d.legs[0].steps
      .filter((s, i, all) => s.distance >= 5 || i === 0 || i === all.length - 1)
      .map((s) => `
        <li>
          <span class="step-icon">${stepIcon(s)}</span>
          <div><div>${escapeHtml(stepText(s, p))}</div>${s.distance > 0 ? `<small>${formatDistance(s.distance)}</small>` : ""}</div>
        </li>`).join("");
    body = `
      ${arrived ? `<div class="route-arrived">🎉 You've arrived at ${escapeHtml(p.name)}!</div>` : ""}
      <div class="route-summary">
        <div class="route-time">${formatDuration(d.duration)}</div>
        <div class="route-sub">${formatDistance(d.distance)} · arrive around ${formatTime(arrive)}</div>
        <div class="route-from">${r.fromUser ? '<span class="live-dot"></span> From your live location — updates as you move' : "From the map center (your location isn't available)"}</div>
      </div>
      <ol class="steps">${steps}</ol>`;
  }

  els.routeView.innerHTML = `
    <div class="route-top">
      <button type="button" class="back" data-action="close-route">← Back to list</button>
    </div>
    <div class="route-dest t-${p.cat}">
      <div class="card-icon">${p.emoji}</div>
      <div class="route-dest-text">
        <h2>${escapeHtml(p.name)}</h2>
        <div class="route-dest-meta">${escapeHtml(p.kind)}${p.hoursText ? ` · ${escapeHtml(p.hoursText)}` : ""} ${badgeHtml(p)}</div>
      </div>
    </div>
    <div class="segmented route-modes" role="radiogroup" aria-label="Travel mode">${modes}</div>
    ${body}`;
}

// ---------- Geolocation (live) ----------

function getInitialPosition() {
  return new Promise((resolve) => {
    if (!navigator.geolocation) return resolve(null);
    navigator.geolocation.getCurrentPosition(
      (p) => resolve({ lat: p.coords.latitude, lng: p.coords.longitude }),
      () => resolve(null),
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 60000 },
    );
  });
}

function startWatchingPosition() {
  if (!navigator.geolocation) return;
  let lastRendered = state.userPos;
  navigator.geolocation.watchPosition(
    (p) => {
      const pos = { lat: p.coords.latitude, lng: p.coords.longitude };
      state.userPos = pos;
      els.livePill.classList.add("on");
      updateUserMarker();

      // While directions are open, keep the route up to date instead of searching.
      const r = state.route;
      if (r) {
        if (r.data && (!r.fromUser || distanceMeters(pos, r.origin) > ROUTE_REFRESH_DISTANCE) && Date.now() - r.time > 5000) calcRoute();
        lastRendered = pos;
        return;
      }

      if (state.followUser && state.searchCenter && distanceMeters(pos, state.searchCenter) > AUTO_REFRESH_DISTANCE) {
        state.map.panTo(pos);
        search(pos); // usually instant thanks to the prefetch margin
      } else if (!state.loading && (!lastRendered || distanceMeters(pos, lastRendered) > 25)) {
        computePlaces();
        render();
      }
      lastRendered = pos;
    },
    () => els.livePill.classList.remove("on"),
    { enableHighAccuracy: true, maximumAge: 15000 },
  );
}

function updateUserMarker() {
  if (!state.userPos) return;
  if (!state.userMarker) {
    state.userMarker = L.marker(state.userPos, {
      icon: L.divIcon({ className: "", html: '<div class="me-dot"></div>', iconSize: [24, 24], iconAnchor: [12, 12] }),
      title: "You are here",
      zIndexOffset: 1000,
      keyboard: false,
    }).addTo(state.map);
  } else {
    state.userMarker.setLatLng(state.userPos);
  }
}

// ---------- UI wiring ----------

function buildTabs() {
  els.tabs.innerHTML = Object.entries(CATEGORIES).map(([key, c]) => `
    <button type="button" class="cat t-${key}" role="tab" data-cat="${key}" aria-selected="${key === state.category}">
      <span class="emoji">${c.emoji}</span>
      <span class="label">${c.label}</span>
      <span class="count"></span>
    </button>`).join("");

  els.tabs.addEventListener("click", (e) => {
    const btn = e.target.closest(".cat");
    if (!btn || btn.dataset.cat === state.category) return;
    setCategory(btn.dataset.cat);
  });
}

function setCategory(cat) {
  state.category = cat;
  els.app.dataset.cat = cat;
  els.logo.textContent = CATEGORIES[cat].emoji === "📍" ? "☕" : CATEGORIES[cat].emoji;
  els.tabs.querySelectorAll(".cat").forEach((t) => t.setAttribute("aria-selected", t.dataset.cat === cat));
  clearMarkers();
  drawRadius();
  els.results.scrollTop = 0;

  // If we have the full download, switching is instant; otherwise search again.
  if (state.source === "overpass") {
    computePlaces();
    render();
  } else {
    search(state.searchCenter || state.map.getCenter());
  }
}

function clearMarkers() {
  state.markersLayer.clearLayers();
  state.markers.clear();
  state.selectedId = null;
}

function wireSegmented(group, onChange) {
  group.addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-value]");
    if (!btn || btn.getAttribute("aria-checked") === "true") return;
    group.querySelectorAll("button").forEach((b) => b.setAttribute("aria-checked", b === btn));
    onChange(btn.dataset.value);
  });
}

function wireControls() {
  wireSegmented(els.radius, (value) => {
    state.radius = Number(value);
    const center = state.searchCenter || state.map.getCenter();
    search(center);
    state.map.fitBounds(L.latLng(center).toBounds(state.radius * 2), { padding: [30, 30] });
  });
  wireSegmented(els.sort, (value) => { state.sort = value; render(); });
  els.openNow.addEventListener("change", () => { state.openNow = els.openNow.checked; render(); });

  let typing;
  els.query.addEventListener("input", () => {
    clearTimeout(typing);
    typing = setTimeout(() => { state.query = els.query.value; render(); }, 120);
  });

  // Directions buttons live in cards and in map popups.
  document.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-route]");
    if (!btn) return;
    e.preventDefault();
    openRoute(findPlace(btn.dataset.route));
  });
  els.routeView.addEventListener("click", (e) => {
    const action = e.target.closest("[data-action]")?.dataset.action;
    if (action === "close-route") closeRoute();
    if (action === "retry-route") { state.route.error = null; renderRouteView(); calcRoute({ fit: true }); }
    const mode = e.target.closest("[data-mode]")?.dataset.mode;
    if (mode && mode !== state.route.mode) {
      state.routeMode = state.route.mode = mode;
      state.route.data = null;
      renderRouteView();
      calcRoute({ fit: true });
    }
  });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeRoute(); });
  // Leaflet stops clicks inside popups from reaching the page, so popup buttons get their own handler.
  state.map.on("popupopen", (e) => {
    e.popup.getElement()?.querySelectorAll("[data-route]").forEach((btn) => {
      btn.addEventListener("click", () => openRoute(findPlace(btn.dataset.route)));
    });
  });

  els.results.addEventListener("click", (e) => {
    if (e.target.closest("a, button")) return; // let links and buttons work normally
    const card = e.target.closest(".card[data-id]");
    if (card) selectPlace(card.dataset.id, { pan: true });
  });
  els.results.addEventListener("keydown", (e) => {
    const card = e.target.closest(".card[data-id]");
    if (card && (e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      selectPlace(card.dataset.id, { pan: true });
    }
  });
  els.results.addEventListener("mouseover", (e) => {
    const card = e.target.closest(".card[data-id]");
    if (card) highlightPin(card.dataset.id, true);
  });
  els.results.addEventListener("mouseout", (e) => {
    const card = e.target.closest(".card[data-id]");
    if (card && card.dataset.id !== state.selectedId) highlightPin(card.dataset.id, false);
  });

  els.searchAreaBtn.addEventListener("click", () => {
    state.followUser = false;
    clearMarkers();
    search(state.map.getCenter());
  });

  els.locateBtn.addEventListener("click", async () => {
    const pos = state.userPos || (await getInitialPosition());
    if (!pos) {
      els.placeName.textContent = "📍 Location blocked — allow it in your browser settings";
      return;
    }
    state.userPos = pos;
    state.followUser = true;
    updateUserMarker();
    state.map.setView(pos, 16);
    clearMarkers();
    search(pos);
  });

  // When the user drags the map, stop following them and offer "Search this area".
  state.map.on("dragstart", () => { state.followUser = false; });
  state.map.on("moveend", () => {
    if (!state.searchCenter) return;
    const moved = distanceMeters(state.map.getCenter(), state.searchCenter);
    if (moved > state.radius * 0.4) els.searchAreaBtn.classList.remove("hidden");
  });
}

// Free OpenStreetMap tiles (no key). In dark mode they're darkened with a CSS filter.
function addBaseLayer() {
  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19,
  }).addTo(state.map);
}

// ---------- Boot ----------

async function init() {
  if (typeof L === "undefined") {
    setStatus("Couldn't load the map library. Check your internet connection and reload.");
    return;
  }

  const fallback = CONFIG.DEFAULT_CENTER || { lat: 40.4168, lng: -3.7038 };
  state.map = L.map("map", { zoomControl: false }).setView(fallback, 15);
  L.control.zoom({ position: "topright" }).addTo(state.map);
  addBaseLayer();
  state.markersLayer = L.layerGroup().addTo(state.map);

  buildTabs();
  wireControls();
  renderSkeleton();
  setLoading(true);
  setStatus("Finding your location…");

  const userPos = await getInitialPosition();
  state.userPos = userPos;
  const center = userPos || fallback;
  state.map.setView(center, 16);
  updateUserMarker();
  await search(center);
  startWatchingPosition();
}

init();
