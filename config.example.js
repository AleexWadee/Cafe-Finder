// Copy this file to `config.js` and fill in your own values.
// `config.js` is listed in .gitignore so your API key is never committed.
window.CAFE_FINDER_CONFIG = {
  // Google Maps Platform API key with the "Maps JavaScript API" and
  // "Places API (New)" enabled. Restrict it to your own domains/localhost.
  googleMapsApiKey: "YOUR_API_KEY_HERE",

  // A Map ID is required for Advanced Markers. "DEMO_MAP_ID" works for
  // development; create your own in the Google Cloud console for production.
  mapId: "DEMO_MAP_ID",

  // Where the map starts if location access is denied (London).
  defaultCentre: { lat: 51.5074, lng: -0.1278 },
};
