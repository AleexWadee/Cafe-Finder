"use strict";

/**
 * Cafe Finder
 * Finds cafés, pubs, bars and restaurants near you using the Google Maps
 * JavaScript API and the Places API (New).
 */

const CATEGORIES = {
  cafe: { label: "cafés", icon: "☕", colour: "#8b5a2b", types: ["cafe", "coffee_shop"] },
  pub: { label: "pubs", icon: "🍺", colour: "#c77d1a", types: ["pub"] },
  bar: { label: "bars", icon: "🍸", colour: "#7b3fa0", types: ["bar", "wine_bar"] },
  restaurant: { label: "restaurants", icon: "🍽️", colour: "#c0392b", types: ["restaurant"] },
};

const PLACE_FIELDS = [
  "id",
  "displayName",
  "location",
  "formattedAddress",
  "rating",
  "userRatingCount",
  "priceLevel",
  "regularOpeningHours",
  "utcOffsetMinutes",
  "businessStatus",
  "googleMapsURI",
  "photos",
];

const PRICE_LABELS = {
  FREE: "Free",
  INEXPENSIVE: "£",
  MODERATE: "££",
  EXPENSIVE: "£££",
  VERY_EXPENSIVE: "££££",
};

// Re-run the search automatically once you have moved this fraction of the radius.
const LIVE_REFRESH_FRACTION = 0.3;

const config = window.CAFE_FINDER_CONFIG || {};

const state = {
  map: null,
  infoWindow: null,
  userMarker: null,
  userPosition: null,
  lastSearchCentre: null,
  category: "cafe",
  results: [],
  markers: new Map(),
  selectedId: null,
  searchToken: 0,
  watchId: null,
  libs: {},
};

const els = {
  status: document.getElementById("status"),
  results: document.getElementById("results"),
  radius: document.getElementById("radius"),
  sort: document.getElementById("sort"),
  openNow: document.getElementById("open-now"),
  locate: document.getElementById("locate"),
  searchArea: document.getElementById("search-area"),
  live: document.getElementById("live"),
  chips: document.querySelectorAll(".chip"),
};

/* ---------- Helpers ---------- */

function setStatus(message, isError = false) {
  els.status.textContent = message;
  els.status.classList.toggle("is-error", isError);
}

function toLatLngLiteral(latLng) {
  return typeof latLng.lat === "function" ? { lat: latLng.lat(), lng: latLng.lng() } : latLng;
}

/** Great-circle distance in metres (haversine formula). */
function distanceInMetres(a, b) {
  const R = 6371e3;
  const rad = (deg) => (deg * Math.PI) / 180;
  const dLat = rad(b.lat - a.lat);
  const dLng = rad(b.lng - a.lng);
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

function formatDistance(metres) {
  return metres < 1000 ? `${Math.round(metres)} m` : `${(metres / 1000).toFixed(1)} km`;
}

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function directionsUrl(place) {
  const { lat, lng } = toLatLngLiteral(place.location);
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&destination_place_id=${encodeURIComponent(place.id)}`;
}

/* ---------- Google Maps loading ---------- */

function loadGoogleMaps() {
  return new Promise((resolve, reject) => {
    if (!config.googleMapsApiKey || config.googleMapsApiKey === "YOUR_API_KEY_HERE") {
      reject(new Error("No Google Maps API key found. Copy config.example.js to config.js and add your key."));
      return;
    }

    window.__cafeFinderMapsReady = resolve;
    window.gm_authFailure = () =>
      setStatus("Google Maps rejected the API key. Check it is valid and that the required APIs are enabled.", true);

    const params = new URLSearchParams({
      key: config.googleMapsApiKey,
      v: "weekly",
      loading: "async",
      language: "en-GB",
      region: "GB",
      callback: "__cafeFinderMapsReady",
    });
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?${params}`;
    script.async = true;
    script.onerror = () => reject(new Error("The Google Maps script could not be loaded. Check your connection."));
    document.head.appendChild(script);
  });
}

/* ---------- Map & markers ---------- */

async function initMap() {
  const [{ Map, InfoWindow }, { AdvancedMarkerElement, PinElement }, { Place, SearchNearbyRankPreference }] =
    await Promise.all([
      google.maps.importLibrary("maps"),
      google.maps.importLibrary("marker"),
      google.maps.importLibrary("places"),
    ]);
  state.libs = { AdvancedMarkerElement, PinElement, Place, SearchNearbyRankPreference };

  state.map = new Map(document.getElementById("map"), {
    center: config.defaultCentre || { lat: 51.5074, lng: -0.1278 },
    zoom: 15,
    mapId: config.mapId || "DEMO_MAP_ID",
    clickableIcons: false,
    streetViewControl: false,
    mapTypeControl: false,
  });
  state.infoWindow = new InfoWindow();
}

function updateUserMarker(position) {
  const { AdvancedMarkerElement } = state.libs;
  if (!state.userMarker) {
    const dot = el("div");
    dot.style.cssText =
      "width:16px;height:16px;border-radius:50%;background:#1a73e8;border:3px solid #fff;box-shadow:0 0 0 6px rgba(26,115,232,.25)";
    state.userMarker = new AdvancedMarkerElement({ map: state.map, position, content: dot, title: "You are here", zIndex: 1000 });
  } else {
    state.userMarker.position = position;
  }
}

function clearMarkers() {
  for (const marker of state.markers.values()) marker.map = null;
  state.markers.clear();
}

function addMarker(place) {
  const { AdvancedMarkerElement, PinElement } = state.libs;
  const category = CATEGORIES[state.category];
  const pin = new PinElement({
    background: category.colour,
    borderColor: "#ffffff",
    glyph: category.icon,
    scale: 1.1,
  });
  const marker = new AdvancedMarkerElement({
    map: state.map,
    position: place.location,
    title: place.displayName,
    content: pin.element,
  });
  marker.addListener("click", () => selectPlace(place.id, { scrollList: true }));
  state.markers.set(place.id, marker);
}

function buildInfoContent(place) {
  const box = el("div", "info");
  box.appendChild(el("h3", null, place.displayName));
  box.appendChild(el("p", null, describe(place)));
  if (place.formattedAddress) box.appendChild(el("p", null, place.formattedAddress));

  const links = el("p");
  const directions = el("a", null, "Directions");
  directions.href = directionsUrl(place);
  directions.target = "_blank";
  directions.rel = "noopener";
  links.appendChild(directions);
  if (place.googleMapsURI) {
    links.appendChild(document.createTextNode(" · "));
    const view = el("a", null, "View on Google Maps");
    view.href = place.googleMapsURI;
    view.target = "_blank";
    view.rel = "noopener";
    links.appendChild(view);
  }
  box.appendChild(links);
  return box;
}

/* ---------- Searching ---------- */

async function search(centre) {
  const { Place, SearchNearbyRankPreference } = state.libs;
  const token = ++state.searchToken;
  const radius = Number(els.radius.value);
  const category = CATEGORIES[state.category];
  centre = toLatLngLiteral(centre);
  state.lastSearchCentre = centre;

  setStatus(`Searching for ${category.label} nearby…`);

  try {
    const { places } = await Place.searchNearby({
      fields: PLACE_FIELDS,
      locationRestriction: { center: centre, radius },
      includedPrimaryTypes: category.types,
      maxResultCount: 20,
      rankPreference: SearchNearbyRankPreference.DISTANCE,
      language: "en-GB",
      region: "GB",
    });

    // Ignore stale responses if another search started in the meantime.
    if (token !== state.searchToken) return;

    const origin = state.userPosition || centre;
    const enriched = await Promise.all(
      places
        .filter((p) => p.businessStatus !== "CLOSED_PERMANENTLY")
        .map(async (place) => ({
          place,
          distance: distanceInMetres(origin, toLatLngLiteral(place.location)),
          isOpen: await safeIsOpen(place),
        })),
    );
    if (token !== state.searchToken) return;

    state.results = enriched;
    render();
  } catch (error) {
    if (token !== state.searchToken) return;
    console.error(error);
    setStatus("Sorry, the search failed. Make sure the Places API (New) is enabled for your key.", true);
  }
}

async function safeIsOpen(place) {
  try {
    return await place.isOpen();
  } catch {
    return undefined;
  }
}

function describe(placeOrResult) {
  const place = placeOrResult.place || placeOrResult;
  const parts = [];
  if (place.rating) parts.push(`⭐ ${place.rating.toFixed(1)} (${place.userRatingCount ?? 0})`);
  if (place.priceLevel && PRICE_LABELS[place.priceLevel]) parts.push(PRICE_LABELS[place.priceLevel]);
  return parts.join(" · ") || "No ratings yet";
}

/* ---------- Rendering ---------- */

function visibleResults() {
  let list = state.results;
  if (els.openNow.checked) list = list.filter((r) => r.isOpen === true);

  const sorted = [...list];
  if (els.sort.value === "rating") {
    sorted.sort((a, b) => (b.place.rating ?? 0) - (a.place.rating ?? 0) || a.distance - b.distance);
  } else {
    sorted.sort((a, b) => a.distance - b.distance);
  }
  return sorted;
}

function render() {
  const list = visibleResults();
  const category = CATEGORIES[state.category];

  clearMarkers();
  state.infoWindow.close();
  els.results.replaceChildren();

  if (list.length === 0) {
    setStatus(
      els.openNow.checked && state.results.length
        ? `No ${category.label} open right now. Try turning off "Open now".`
        : `No ${category.label} found. Try a larger radius or move the map.`,
    );
    return;
  }

  setStatus(`${list.length} ${category.label} found · updated ${new Date().toLocaleTimeString("en-GB")}`);

  for (const result of list) {
    addMarker(result.place);
    els.results.appendChild(buildListItem(result));
  }
}

function buildListItem({ place, distance, isOpen }) {
  const item = el("li", "place");
  item.dataset.id = place.id;
  item.tabIndex = 0;

  const photo = place.photos?.[0];
  if (photo) {
    const img = el("img", "place__photo");
    img.src = photo.getURI({ maxWidth: 160, maxHeight: 160 });
    img.alt = "";
    img.loading = "lazy";
    item.appendChild(img);
  } else {
    item.appendChild(el("div", "place__photo", CATEGORIES[state.category].icon));
  }

  const body = el("div", "place__body");
  body.appendChild(el("h2", "place__name", place.displayName));

  const meta = el("p", "place__meta");
  meta.textContent = `${formatDistance(distance)} · ${describe(place)}`;
  if (isOpen !== undefined) {
    meta.appendChild(document.createTextNode(" · "));
    meta.appendChild(el("span", `badge ${isOpen ? "badge--open" : "badge--closed"}`, isOpen ? "Open" : "Closed"));
  }
  body.appendChild(meta);

  if (place.formattedAddress) body.appendChild(el("p", "place__address", place.formattedAddress));
  item.appendChild(body);

  item.addEventListener("click", () => selectPlace(place.id));
  item.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      selectPlace(place.id);
    }
  });
  return item;
}

function selectPlace(id, { scrollList = false } = {}) {
  const result = state.results.find((r) => r.place.id === id);
  const marker = state.markers.get(id);
  if (!result || !marker) return;

  state.selectedId = id;
  for (const item of els.results.children) {
    item.classList.toggle("is-selected", item.dataset.id === id);
    if (scrollList && item.dataset.id === id) item.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  state.map.panTo(result.place.location);
  state.infoWindow.setContent(buildInfoContent(result.place));
  state.infoWindow.open({ map: state.map, anchor: marker });
}

/* ---------- Location ---------- */

function onPosition(position) {
  const coords = { lat: position.coords.latitude, lng: position.coords.longitude };
  const isFirstFix = !state.userPosition;
  state.userPosition = coords;
  updateUserMarker(coords);

  if (isFirstFix) {
    state.map.setCenter(coords);
    search(coords);
    return;
  }

  // Live mode: follow the user and refresh results once they have moved far enough.
  if (els.live.checked) {
    const radius = Number(els.radius.value);
    if (!state.lastSearchCentre || distanceInMetres(coords, state.lastSearchCentre) > radius * LIVE_REFRESH_FRACTION) {
      state.map.panTo(coords);
      search(coords);
    }
  }
}

function onPositionError(error) {
  // A brief signal loss after we already have a fix is not worth reporting.
  if (state.userPosition) return;
  const reason =
    error.code === error.PERMISSION_DENIED
      ? "Location access was denied, so we're showing the default area."
      : "We couldn't get your location, so we're showing the default area.";
  setStatus(reason, true);
  if (!state.lastSearchCentre) search(state.map.getCenter());
}

function startWatchingLocation() {
  if (!("geolocation" in navigator)) {
    setStatus("Your browser doesn't support location services.", true);
    search(state.map.getCenter());
    return;
  }
  if (state.watchId !== null) navigator.geolocation.clearWatch(state.watchId);
  state.watchId = navigator.geolocation.watchPosition(onPosition, onPositionError, {
    enableHighAccuracy: true,
    maximumAge: 15000,
    timeout: 20000,
  });
}

/* ---------- Event wiring ---------- */

function bindEvents() {
  els.chips.forEach((chip) => {
    chip.addEventListener("click", () => {
      state.category = chip.dataset.category;
      els.chips.forEach((c) => {
        const active = c === chip;
        c.classList.toggle("is-active", active);
        c.setAttribute("aria-pressed", String(active));
      });
      search(state.map.getCenter());
    });
  });

  els.radius.addEventListener("change", () => search(state.map.getCenter()));
  els.sort.addEventListener("change", render);
  els.openNow.addEventListener("change", render);
  els.searchArea.addEventListener("click", () => search(state.map.getCenter()));

  els.locate.addEventListener("click", () => {
    if (state.userPosition) {
      state.map.panTo(state.userPosition);
      search(state.userPosition);
    }
    startWatchingLocation();
  });

  els.live.addEventListener("change", () => {
    if (els.live.checked && state.userPosition) {
      state.map.panTo(state.userPosition);
      search(state.userPosition);
    }
  });

  // Dragging the map means the user wants to explore, so pause live following.
  state.map.addListener("dragstart", () => {
    els.live.checked = false;
  });
}

/* ---------- Start-up ---------- */

(async function start() {
  try {
    await loadGoogleMaps();
    await initMap();
    bindEvents();
    setStatus("Finding your location…");
    startWatchingLocation();
  } catch (error) {
    console.error(error);
    setStatus(error.message, true);
  }
})();
