// Directions inside SpotHop: walking, cycling and driving routes on the map, with turn-by-turn steps.
import { CONFIG, ROUTE_MODES } from "../core/config.js";
import { state, els } from "../core/state.js";
import { t } from "../core/i18n.js";
import { escapeHtml, distanceMeters, formatDistance, formatDuration, formatTime, catColor } from "../core/utils.js";
import { badgeHtml } from "./list.js";
import { highlightPin } from "./map.js";

const TURN_ICONS = {
  left: "↰", right: "↱", "slight left": "↖", "slight right": "↗", "sharp left": "↰", "sharp right": "↱", straight: "↑", uturn: "↶",
};

// Turns an OSRM step into a readable instruction in the current language.
function stepText(step, place) {
  const m = step.maneuver;
  const name = step.name || "";
  const turn = m.modifier ? t(`route.turn.${m.modifier}`) : "";
  const side = m.modifier?.includes("left") ? "left" : m.modifier?.includes("right") ? "right" : "";
  switch (m.type) {
    case "depart": return t("route.step.depart", { dir: t("route.compass")[Math.round((m.bearing_after || 0) / 45) % 8], name });
    case "arrive": return t("route.step.arrive", { place: place.name, side: m.modifier === "left" || m.modifier === "right" ? side : "" });
    case "roundabout":
    case "rotary": return t("route.step.roundabout", { exit: m.exit || 1, name });
    case "fork": return t("route.step.fork", { side, name });
    case "end of road": return t("route.step.endOfRoad", { turn, name });
    case "merge": return t("route.step.merge", { turn, name });
    case "new name":
    case "continue": return t("route.step.continue", { turn: m.modifier && m.modifier !== "straight" ? turn : "", name });
    default:
      if (m.modifier === "uturn") return t("route.step.uturn", { name });
      return m.modifier === "straight" ? t("route.step.straight", { name }) : t("route.step.turn", { turn, name });
  }
}

function stepIcon(step) {
  const type = step.maneuver.type;
  if (type === "depart") return "●";
  if (type === "arrive") return "🏁";
  if (type === "roundabout" || type === "rotary") return "⟳";
  return TURN_ICONS[step.maneuver.modifier] || "↑";
}

export function findPlace(id) {
  return state.places.find((p) => p.id === id) || (state.route?.place.id === id ? state.route.place : null);
}

export function openRoute(place, mode = state.routeMode) {
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

export function closeRoute() {
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

export async function calcRoute({ fit = false } = {}) {
  const r = state.route;
  if (!r) return;
  const calc = ++r.calc;
  const origin = state.userPos || state.searchCenter;
  r.origin = origin;
  r.fromUser = Boolean(state.userPos);
  r.time = Date.now();

  try {
    const coords = `${origin.lng},${origin.lat};${r.place.lng},${r.place.lat}`;
    const url = `${CONFIG.ROUTING_SERVER}/routed-${r.mode}/route/v1/driving/${coords}?overview=full&geometries=geojson&steps=true`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Routing server responded ${res.status}`);
    const json = await res.json();
    if (json.code !== "Ok" || !json.routes?.length) throw new Error(json.message || "No route found");
    if (state.route !== r || calc !== r.calc) return; // closed, or a newer route was requested
    r.data = json.routes[0];
    r.error = false;
    drawRoute(r, fit);
  } catch (err) {
    if (state.route !== r || calc !== r.calc) return;
    console.error(err);
    r.error = true;
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

export function renderRouteView() {
  const r = state.route;
  if (!r) return;
  const p = r.place;
  const modes = Object.entries(ROUTE_MODES).map(([key, emoji]) =>
    `<button type="button" data-mode="${key}" aria-checked="${key === r.mode}">${emoji} ${escapeHtml(t(`route.modes.${key}`))}</button>`).join("");

  let body;
  if (r.error) {
    body = `<div class="route-msg">⚠️ ${escapeHtml(t("route.error"))}<br><button type="button" class="btn" data-action="retry-route">${escapeHtml(t("route.retry"))}</button></div>`;
  } else if (!r.data) {
    body = `<div class="route-msg"><span class="spinner"></span> ${escapeHtml(t("route.finding"))}</div>`;
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
    const from = r.fromUser ? `<span class="live-dot"></span> ${escapeHtml(t("route.fromLive"))}` : escapeHtml(t("route.fromCenter"));
    body = `
      ${arrived ? `<div class="route-arrived">${escapeHtml(t("route.arrived", { name: p.name }))}</div>` : ""}
      <div class="route-summary">
        <div class="route-time">${escapeHtml(formatDuration(d.duration))}</div>
        <div class="route-sub">${escapeHtml(t("route.summary", { distance: formatDistance(d.distance), time: formatTime(arrive) }))}</div>
        <div class="route-from">${from}</div>
      </div>
      <ol class="steps">${steps}</ol>`;
  }

  els.routeView.innerHTML = `
    <div class="route-top">
      <button type="button" class="back" data-action="close-route">${escapeHtml(t("route.back"))}</button>
    </div>
    <div class="route-dest t-${p.cat}">
      <div class="card-icon">${p.emoji}</div>
      <div class="route-dest-text">
        <h2>${escapeHtml(p.name)}</h2>
        <div class="route-dest-meta">${escapeHtml(p.kind)}${p.hoursText ? ` · ${escapeHtml(p.hoursText)}` : ""} ${badgeHtml(p)}</div>
      </div>
    </div>
    <div class="segmented route-modes" role="radiogroup" aria-label="${escapeHtml(t("route.travelMode"))}">${modes}</div>
    ${body}`;
}

export function wireRoute() {
  // Directions buttons live in cards and in map popups.
  document.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-route]");
    if (!btn) return;
    e.preventDefault();
    openRoute(findPlace(btn.dataset.route));
  });
  // Leaflet stops clicks inside popups from reaching the page, so popup buttons get their own handler.
  state.map.on("popupopen", (e) => {
    e.popup.getElement()?.querySelectorAll("[data-route]").forEach((btn) => {
      btn.addEventListener("click", () => openRoute(findPlace(btn.dataset.route)));
    });
  });
  els.routeView.addEventListener("click", (e) => {
    const action = e.target.closest("[data-action]")?.dataset.action;
    if (action === "close-route") closeRoute();
    if (action === "retry-route") { state.route.error = false; renderRouteView(); calcRoute({ fit: true }); }
    const mode = e.target.closest("[data-mode]")?.dataset.mode;
    if (mode && mode !== state.route.mode) {
      state.routeMode = state.route.mode = mode;
      state.route.data = null;
      renderRouteView();
      calcRoute({ fit: true });
    }
  });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeRoute(); });
}
