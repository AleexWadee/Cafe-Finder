// SpotHop — find cafés, pubs, bars and restaurants near you on a live map.
// Starts the app and connects the controls. Free data: OpenStreetMap (no API key needed).
import { CONFIG, CATEGORIES } from "./core/config.js";
import { state, els } from "./core/state.js";
import { LANGUAGES, getLang, setLang, t, translatePage } from "./core/i18n.js";
import { distanceMeters, storeGet, STORE, savePrefs } from "./core/utils.js";
import { loadHoursLibrary } from "./data/hours.js";
import { findPlaces, refreshPlaces, updatePlaceName, computePlaces, restoreLastPlace } from "./data/results.js";
import { render, renderSkeleton, setStatus, setLoading } from "./ui/list.js";
import { createMap, togglePlace, highlightPin, updateUserMarker, clearMarkers } from "./ui/map.js";
import { buildTabs, translateTabs, wireTabs, syncCategoryUI } from "./ui/tabs.js";
import { wireSearchBox, renderUnderstood, applyQuery } from "./ui/searchbox.js";
import { wireRoute, renderRouteView } from "./ui/route.js";
import { getInitialPosition, startWatchingPosition } from "./core/geo.js";
import { wireActions } from "./ui/actions.js";

// ---------- Language ----------

// A compact "🌐 EN" button that opens the phone's / browser's own language list.
function buildLangPicker() {
  els.langSelect.innerHTML = Object.entries(LANGUAGES).map(([code, lang]) =>
    `<option value="${code}" lang="${code}">${lang.meta.name}</option>`).join("");
  els.langSelect.value = getLang();
  els.langCurrent.textContent = LANGUAGES[getLang()].meta.short;
  els.langSelect.addEventListener("change", () => changeLanguage(els.langSelect.value));
}

function changeLanguage(code) {
  setLang(code);
  els.langSelect.value = code;
  els.langCurrent.textContent = LANGUAGES[code].meta.short;
  translatePage();
  translateTabs();
  renderUnderstood();
  state.map.closePopup();
  refreshPlaces();   // rebuilds every place (kinds, hours, features) in the new language
  render();
  renderRouteView();
  if (state.searchCenter) updatePlaceName(state.searchCenter, true);
}

// ---------- Controls ----------

function wireSegmented(group, onChange) {
  group.addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-value]");
    if (!btn || btn.getAttribute("aria-checked") === "true") return;
    group.querySelectorAll("button").forEach((b) => b.setAttribute("aria-checked", b === btn));
    onChange(btn.dataset.value);
  });
}

// Restores the category, distance and sort from the last visit.
function restorePrefs() {
  const prefs = storeGet(STORE.prefs) || {};
  if (CATEGORIES[prefs.category]) state.category = prefs.category;
  if ([500, 1000, 2000, 5000].includes(prefs.radius)) state.radius = prefs.radius;
  if (["distance", "name"].includes(prefs.sort)) state.sort = prefs.sort;
  els.radius.querySelectorAll("button").forEach((b) => b.setAttribute("aria-checked", Number(b.dataset.value) === state.radius));
  els.sort.querySelectorAll("button").forEach((b) => b.setAttribute("aria-checked", b.dataset.value === state.sort));
}

// "Saved" shows the ♡ places wherever they are; tapping it again goes back to the area.
function toggleSaved() {
  state.showSaved = !state.showSaved;
  els.savedBtn.setAttribute("aria-pressed", String(state.showSaved));
  els.app.classList.toggle("saved-mode", state.showSaved);
  state.radiusCircle?.setStyle(state.showSaved ? { opacity: 0, fillOpacity: 0 } : { opacity: 1, fillOpacity: 0.05 });
  clearMarkers();
  els.results.scrollTop = 0;
  computePlaces();
  render();
  if (state.showSaved && state.places.length) {
    state.map.fitBounds(L.latLngBounds(state.places.map((p) => [p.lat, p.lng])), { padding: [60, 60], maxZoom: 16 });
  } else if (!state.showSaved && state.searchCenter) {
    state.map.fitBounds(L.latLng(state.searchCenter).toBounds(state.radius * 2), { padding: [30, 30] });
  }
}

function wireControls() {
  wireSegmented(els.radius, (value) => {
    state.radius = Number(value);
    savePrefs(state);
    const center = state.searchCenter || state.map.getCenter();
    findPlaces(center);
    state.map.fitBounds(L.latLng(center).toBounds(state.radius * 2), { padding: [30, 30] });
  });
  wireSegmented(els.sort, (value) => { state.sort = value; savePrefs(state); render(); });
  els.savedBtn.addEventListener("click", toggleSaved);
  els.openNow.addEventListener("change", () => { state.openNow = els.openNow.checked; render(); });

  // Cards: click or Enter opens a place; doing it again closes it. Hovering highlights its pin.
  els.results.addEventListener("click", (e) => {
    if (e.target.closest("a, button")) return; // let links and buttons work normally
    const card = e.target.closest(".card[data-id]");
    if (card) togglePlace(card.dataset.id);
  });
  els.results.addEventListener("keydown", (e) => {
    const card = e.target.closest(".card[data-id]");
    if (card && (e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      togglePlace(card.dataset.id);
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
    findPlaces(state.map.getCenter());
  });

  els.locateBtn.addEventListener("click", async () => {
    const pos = state.userPos || (await getInitialPosition());
    if (!pos) {
      els.placeName.textContent = `📍 ${t("ui.locationBlocked")}`;
      return;
    }
    state.userPos = pos;
    state.followUser = true;
    updateUserMarker();
    state.map.setView(pos, 16);
    clearMarkers();
    findPlaces(pos);
  });

  // When the user drags the map, stop following them and offer "Search this area".
  state.map.on("dragstart", () => { state.followUser = false; });
  state.map.on("moveend", () => {
    if (!state.searchCenter) return;
    const moved = distanceMeters(state.map.getCenter(), state.searchCenter);
    if (moved > state.radius * 0.4) els.searchAreaBtn.classList.remove("hidden");
  });

  // iPhone Safari only shows :active (pressed) styles when the page listens for touches.
  document.addEventListener("touchstart", () => {}, { passive: true });
}

// ---------- Start ----------

// A shared link: …/#place=node/123@28.12,-15.43
function sharedPlaceFromLink() {
  const m = location.hash.match(/^#place=((?:node|way|relation)\/\d+)@(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)$/);
  return m ? { id: m[1], lat: Number(m[2]), lng: Number(m[3]) } : null;
}

function openSharedPlace(link) {
  state.pendingPlaceId = link.id; // opened by render() once the place is loaded
  state.followUser = false;
  state.category = "all";         // so it shows whatever kind of place it is
  if (state.parsed) {
    els.query.value = "";
    applyQuery("");
  }
  syncCategoryUI();
  state.map.setView([link.lat, link.lng], 17);
  findPlaces(link);
}

async function init() {
  translatePage();
  buildLangPicker();
  if (typeof L === "undefined") {
    setStatus(t("ui.mapLibraryError"));
    return;
  }
  restorePrefs();

  // Remembered from the last visit on this device, so returning visitors start instantly.
  const last = storeGet(STORE.pos);
  const saved = storeGet(STORE.area);
  if (saved?.elements && Date.now() - saved.time < 24 * 3600 * 1000) state.staleArea = saved;
  const shared = sharedPlaceFromLink();

  createMap(shared || last || CONFIG.DEFAULT_CENTER, shared ? 17 : last ? 16 : 15);
  restoreLastPlace(shared || last || CONFIG.DEFAULT_CENTER);
  buildTabs();
  syncCategoryUI();
  wireTabs();
  wireSearchBox();
  wireRoute();
  wireActions();
  wireControls();

  // The big opening-hours library loads in parallel; the map doesn't wait for it.
  setTimeout(() => loadHoursLibrary().then(refreshPlaces).catch((err) => console.warn("Opening hours unavailable:", err)), 300);

  // A shared link pasted into a tab where SpotHop is already open.
  window.addEventListener("hashchange", () => {
    const link = sharedPlaceFromLink();
    if (link) openSharedPlace(link);
  });

  // Opened from a shared link: show that place (and don't jump away to the visitor's location).
  if (shared) {
    openSharedPlace(shared);
    startWatchingPosition();
    return;
  }

  if (last) {
    findPlaces(last); // live GPS takes over when it arrives
    startWatchingPosition();
    return;
  }

  renderSkeleton();
  setLoading(true);
  setStatus(t("ui.findingLocation"));
  const userPos = await getInitialPosition();
  state.userPos = userPos;
  const center = userPos || CONFIG.DEFAULT_CENTER;
  state.map.setView(center, 16);
  updateUserMarker();
  await findPlaces(center);
  startWatchingPosition();
}

init();

// Faster repeat visits and opening without internet (see sw.js). Browsers only allow this on HTTPS or localhost.
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("sw.js")
      .then(() => navigator.serviceWorker.ready)
      .then((reg) => {
        // Hand over the files this visit already loaded, so the app also works offline after the first visit.
        const urls = performance.getEntriesByType("resource").map((e) => e.name).filter((u) => !u.includes("tile.openstreetmap.org"));
        reg.active?.postMessage({ type: "save-files", urls: [location.href.split("#")[0], ...urls] });
      })
      .catch((err) => console.warn("Offline support unavailable:", err));
  });
}
