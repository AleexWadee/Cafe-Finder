// SpotHop — find cafés, pubs, bars and restaurants near you on a live map.
// Starts the app and connects the controls. Free data: OpenStreetMap (no API key needed).
import { CONFIG } from "./config.js";
import { state, els } from "./state.js";
import { LANGUAGES, getLang, setLang, t, translatePage } from "./i18n.js";
import { distanceMeters, storeGet, STORE } from "./utils.js";
import { loadHoursLibrary } from "./hours.js";
import { findPlaces, refreshPlaces, updatePlaceName } from "./results.js";
import { render, renderSkeleton, setStatus, setLoading } from "./list.js";
import { createMap, togglePlace, highlightPin, updateUserMarker, clearMarkers } from "./map.js";
import { buildTabs, translateTabs, wireTabs } from "./tabs.js";
import { wireSearchBox, renderUnderstood } from "./searchbox.js";
import { wireRoute, renderRouteView } from "./route.js";
import { getInitialPosition, startWatchingPosition } from "./geo.js";

// ---------- Language ----------

function buildLangSwitch() {
  els.langSwitch.innerHTML = Object.entries(LANGUAGES).map(([code, lang]) =>
    `<button type="button" data-lang="${code}" aria-checked="${code === getLang()}" title="${lang.meta.name}" lang="${code}">${lang.meta.short}</button>`).join("");
  els.langSwitch.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-lang]");
    if (btn && btn.dataset.lang !== getLang()) changeLanguage(btn.dataset.lang);
  });
}

function changeLanguage(code) {
  setLang(code);
  els.langSwitch.querySelectorAll("button").forEach((b) => b.setAttribute("aria-checked", b.dataset.lang === code));
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

function wireControls() {
  wireSegmented(els.radius, (value) => {
    state.radius = Number(value);
    const center = state.searchCenter || state.map.getCenter();
    findPlaces(center);
    state.map.fitBounds(L.latLng(center).toBounds(state.radius * 2), { padding: [30, 30] });
  });
  wireSegmented(els.sort, (value) => { state.sort = value; render(); });
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

async function init() {
  translatePage();
  buildLangSwitch();
  if (typeof L === "undefined") {
    setStatus(t("ui.mapLibraryError"));
    return;
  }

  // Remembered from the last visit on this device, so returning visitors start instantly.
  const last = storeGet(STORE.pos);
  const saved = storeGet(STORE.area);
  if (saved?.elements && Date.now() - saved.time < 24 * 3600 * 1000) state.staleArea = saved;

  createMap(last || CONFIG.DEFAULT_CENTER, last ? 16 : 15);
  buildTabs();
  wireTabs();
  wireSearchBox();
  wireRoute();
  wireControls();

  // The big opening-hours library loads in parallel; the map doesn't wait for it.
  setTimeout(() => loadHoursLibrary().then(refreshPlaces).catch((err) => console.warn("Opening hours unavailable:", err)), 300);

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
