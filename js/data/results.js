// Finding places: downloads (or reuses) data for an area, falls back to the backup source,
// and filters it down to the current category, distance and search.
import { MAX_RESULTS, QUICK_RESULTS_DELAY } from "../core/config.js";
import { state, els, activeCat } from "../core/state.js";
import { t } from "../core/i18n.js";
import { distanceMeters } from "../core/utils.js";
import { categoryOf, positionOf, normalize } from "./places.js";
import { scorePlace } from "./search.js";
import { covers, findCachedArea, downloadArea, fetchNominatim, prefetchBackup, reverseGeocode } from "./api.js";
import { render, renderSkeleton, renderCounts, setStatus, emptyState, setLoading } from "../ui/list.js";
import { drawRadius } from "../ui/map.js";

export async function findPlaces(center = state.map.getCenter()) {
  center = { lat: center.lat, lng: center.lng };
  const token = ++state.searchToken;
  state.searchCenter = center;
  state.selectedId = null;
  els.searchAreaBtn.classList.add("hidden");
  drawRadius();
  setTimeout(() => updatePlaceName(center), 2500); // after the backup search, which shares Nominatim's queue

  // Instant: we already downloaded this area.
  const cached = findCachedArea(center, state.radius);
  if (cached) return useElements(cached.elements, "overpass");

  // Instant on the next visit: show the copy saved on this device while a fresh one downloads.
  const stale = state.staleArea && covers(state.staleArea, center, state.radius) ? state.staleArea : null;
  if (stale) {
    useElements(stale.elements, "overpass");
    setLoading(true);
  } else {
    // Clear old results immediately so another category's places are never shown.
    state.elements = [];
    state.places = [];
    setLoading(true);
    renderSkeleton();
    renderCounts();
    setStatus(t("status.lookingFor", { what: t(`cat.${activeCat()}.many`) }));
  }

  if (Date.now() > state.overpassDownUntil) {
    const download = downloadArea(center, state.radius);
    const quickTimer = stale ? null : setTimeout(() => showBackupResults(token, center, true), QUICK_RESULTS_DELAY);
    try {
      const elements = await download;
      clearTimeout(quickTimer);
      if (token === state.searchToken) {
        state.staleArea = null;
        useElements(elements, "overpass");
      }
      return;
    } catch {
      clearTimeout(quickTimer);
      if (token !== state.searchToken) return;
    }
  }
  if (stale) { setLoading(false); return; } // keep the saved copy rather than the smaller backup
  await showBackupResults(token, center, false);
}

async function showBackupResults(token, center, temporary) {
  const category = activeCat();
  try {
    const elements = await fetchNominatim(center, state.radius, category);
    if (token !== state.searchToken || category !== activeCat()) return;
    if (temporary && state.source === "overpass") return; // the full results already arrived
    useElements(elements, temporary ? "quick" : "backup", category);
    if (!temporary) prefetchBackup(center, state.radius);
  } catch (err) {
    if (token !== state.searchToken || temporary) return;
    console.error(err);
    setLoading(false);
    els.results.innerHTML = emptyState("📡", t("empty.serversBusy"), t("empty.serversBusyText"));
    setStatus("");
    els.searchAreaBtn.classList.remove("hidden");
  }
}

export function useElements(elements, source, cat = "all") {
  state.elements = elements;
  state.elementsCat = source === "overpass" ? "all" : cat;
  state.source = source;
  setLoading(source === "quick");
  computePlaces();
  render();
}

// Filters the downloaded data down to the category, radius and search (fast, no network).
export function computePlaces() {
  if (!state.searchCenter) return;
  const origin = state.userPos || state.searchCenter;
  const scope = activeCat();
  const parsed = state.parsed;
  const remote = state.remote?.query === state.query ? state.remote.elements : [];
  const seen = new Set();
  const list = [];
  for (const [el, nearby] of [...state.elements.map((e) => [e, true]), ...remote.map((e) => [e, false])]) {
    const cat = categoryOf(el.tags || {});
    if (!cat || (scope !== "all" && cat !== scope)) continue;
    const pos = positionOf(el);
    if (!pos || (nearby && distanceMeters(state.searchCenter, pos) > state.radius)) continue;
    const place = normalize(el);
    if (!place || seen.has(place.id)) continue;
    place.score = parsed ? scorePlace(place, parsed, place.isOpen) : 1;
    if (!place.score) continue;
    seen.add(place.id);
    place.distance = distanceMeters(origin, place);
    list.push(place);
  }
  // Best matches first when searching (ties broken by distance), otherwise nearest first.
  list.sort((a, b) => (parsed ? b.score - a.score : 0) || a.distance - b.distance);
  state.places = list.slice(0, MAX_RESULTS);
}

// In backup mode only one category is downloaded; load what the current tab or search needs.
export function ensureData() {
  const cat = activeCat();
  if (state.source !== "backup" || state.elementsCat === "all" || state.elementsCat === cat) return;
  const token = state.searchToken;
  setLoading(true);
  fetchNominatim(state.searchCenter, state.radius, cat).then((elements) => {
    if (token !== state.searchToken || activeCat() !== cat) return;
    useElements(elements, "backup", cat);
  }).catch(() => setLoading(false));
}

// Rebuilds every place (after the language or opening-hours data changes), replacing the map pins too.
export function refreshPlaces() {
  state.normCache.clear();
  if (!state.searchCenter || (!state.places.length && state.loading)) return;
  state.markersLayer.clearLayers();
  state.markers.clear();
  computePlaces();
  render();
}

// Shows the name of the neighbourhood under the title ("Arenales, Las Palmas").
export async function updatePlaceName(center, force = false) {
  if (!force && state.namedCenter && distanceMeters(center, state.namedCenter) < 400) return;
  state.namedCenter = center;
  try {
    const a = await reverseGeocode(center);
    if (a.country_code && a.country_code !== state.countryCode) {
      state.countryCode = a.country_code;
      state.region = a.state || "";
      refreshPlaces(); // re-check opening hours with the right public holidays
    }
    const area = a.neighbourhood || a.suburb || a.quarter || a.city_district || a.road;
    const city = a.city || a.town || a.village;
    els.placeName.textContent = `📍 ${[area, city].filter(Boolean).join(", ") || t("ui.aroundYou")}`;
  } catch {
    els.placeName.textContent = `📍 ${t("ui.aroundYou")}`;
  }
}
