// SpotHop uses free OpenStreetMap data — no API key needed.
window.SPOTHOP_CONFIG = {
  // Used when the browser can't get your location (Madrid by default).
  DEFAULT_CENTER: { lat: 40.4168, lng: -3.7038 },
  // Free Overpass API servers, tried in order if one is busy.
  // If all fail, SpotHop falls back to Nominatim (OpenStreetMap's search engine).
  OVERPASS_SERVERS: [
    "https://overpass-api.de/api/interpreter",
    "https://overpass.private.coffee/api/interpreter",
  ],
};
