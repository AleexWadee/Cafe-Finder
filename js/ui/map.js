// The map: background tiles, place pins and popups, the search circle and the "you are here" dot.
// Opening a place (card or pin) keeps the list and the map in sync; opening it again closes both.
import { state, els, activeCat } from "../core/state.js";
import { t } from "../core/i18n.js";
import { escapeHtml, catColor } from "../core/utils.js";
import { detailsHtml, popupHtml } from "./list.js";

// Free OpenStreetMap tiles (no key). In dark mode they're darkened with a CSS filter.
export function createMap(center, zoom) {
  state.map = L.map("map", { zoomControl: false }).setView(center, zoom);
  L.control.zoom({ position: "topright" }).addTo(state.map);
  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19,
    updateWhenIdle: false, // load tiles while the map is still moving (Leaflet waits on phones by default)
    keepBuffer: 4,         // keep more tiles around the view, so panning back is instant
  }).addTo(state.map);
  state.markersLayer = L.layerGroup().addTo(state.map);

  // Zoom buttons flash white when tapped, then fade back to normal.
  state.map.getContainer().querySelectorAll(".leaflet-control-zoom a").forEach((a) => {
    a.addEventListener("pointerdown", () => {
      a.classList.add("pressed");
      setTimeout(() => a.classList.remove("pressed"), 180);
    });
  });
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

export function renderMarkers(list) {
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
      .bindPopup(() => popupHtml(p), { maxWidth: 310, minWidth: 260, maxHeight: 380, autoPanPadding: [24, 24] })
      // Leaflet opens the popup on the first click and closes it on the second; the card follows.
      .on("popupopen", () => selectPlace(p.id, { scrollList: true, openPopup: false }))
      .on("popupclose", () => { if (state.selectedId === p.id) deselectPlace({ closePopup: false }); });
    state.markersLayer.addLayer(marker);
    state.markers.set(p.id, marker);
  }
}

export function clearMarkers() {
  state.markersLayer.clearLayers();
  state.markers.clear();
  state.selectedId = null;
}

export function highlightPin(id, on) {
  state.markers.get(id)?.getElement()?.querySelector(".pin")?.classList.toggle("active", on);
}

export function selectPlace(id, { scrollList = false, pan = false, openPopup = true } = {}) {
  const p = state.places.find((x) => x.id === id);
  if (!p) return;
  if (state.selectedId) highlightPin(state.selectedId, false);
  state.selectedId = id;
  highlightPin(id, true);

  els.results.querySelectorAll(".card.selected").forEach((el) => el.classList.remove("selected"));
  const card = els.results.querySelector(`[data-id="${CSS.escape(id)}"]`);
  if (card) {
    card.classList.add("selected");
    const details = card.querySelector("[data-details]");
    if (details && !details.innerHTML) details.innerHTML = detailsHtml(p); // built only when opened
    if (scrollList) card.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  if (pan) {
    state.followUser = false;
    state.map.panTo([p.lat, p.lng]);
  }
  if (openPopup && !state.markers.get(id)?.isPopupOpen()) state.markers.get(id)?.openPopup();
}

// Closes the opened place in the list and on the map.
export function deselectPlace({ closePopup = true } = {}) {
  const id = state.selectedId;
  if (!id) return;
  state.selectedId = null;
  highlightPin(id, false);
  els.results.querySelectorAll(".card.selected").forEach((el) => el.classList.remove("selected"));
  const marker = state.markers.get(id);
  // (When the popup itself is closing, closing it again would confuse Leaflet.)
  if (closePopup && marker?.isPopupOpen()) marker.closePopup();
}

// Clicking a place opens it; clicking it again closes it.
export function togglePlace(id) {
  if (state.selectedId === id) deselectPlace();
  else selectPlace(id, { pan: true });
}

// The dashed circle showing the search distance, in the current category's color.
export function drawRadius() {
  if (!state.searchCenter) return;
  const color = catColor(activeCat());
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

export function updateUserMarker() {
  if (!state.userPos) return;
  if (!state.userMarker) {
    state.userMarker = L.marker(state.userPos, {
      icon: L.divIcon({ className: "", html: '<div class="me-dot"></div>', iconSize: [24, 24], iconAnchor: [12, 12] }),
      title: t("ui.youAreHere"),
      zIndexOffset: 1000,
      keyboard: false,
    }).addTo(state.map);
  } else {
    state.userMarker.setLatLng(state.userPos);
  }
}
