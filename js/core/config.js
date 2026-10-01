// Settings you may want to change. SpotHop uses free OpenStreetMap data — no API key needed.
export const CONFIG = {
  // Used when the browser can't get your location (Madrid by default).
  DEFAULT_CENTER: { lat: 40.4168, lng: -3.7038 },

  // Free Overpass API servers, asked at the same time; the first good answer wins.
  // If all fail, SpotHop falls back to Nominatim (OpenStreetMap's search engine).
  OVERPASS_SERVERS: [
    "https://overpass-api.de/api/interpreter",
    "https://overpass.private.coffee/api/interpreter",
  ],

  // Free routing servers (OSRM, run by FOSSGIS) used for in-app directions.
  ROUTING_SERVER: "https://routing.openstreetmap.de",
};

// Categories shown as tabs. Their names come from the language files (languages/).
export const CATEGORIES = {
  coffee:      { emoji: "☕", nominatim: "cafe" },
  pubs:        { emoji: "🍺", nominatim: "pub" },
  bars:        { emoji: "🍸", nominatim: "bar" },
  restaurants: { emoji: "🍽️", nominatim: "restaurant" },
  all:         { emoji: "📍" },
};

// Travel modes for directions (names in the language files).
export const ROUTE_MODES = { foot: "🚶", bike: "🚲", car: "🚗" };

export const MAX_RESULTS = 150;
export const CACHE_TTL = 10 * 60 * 1000;
export const OVERPASS_TIMEOUT = 12000;      // per server
export const QUICK_RESULTS_DELAY = 1200;    // show backup results if the main server is slower than this
export const PREFETCH_RADIUS = 1000;        // always load at least this much, so smaller radiuses are instant
export const PREFETCH_MARGIN = 400;         // extra margin so walking around doesn't need a new download
export const AUTO_REFRESH_DISTANCE = 300;   // search again after walking this far (meters)
export const ROUTE_REFRESH_DISTANCE = 30;   // re-route after moving this far while directions are open
export const WALK_SPEED = 80;               // meters per minute
