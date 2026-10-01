// Everything the app needs to remember while it runs, plus shortcuts to the page elements.

export const state = {
  // What the user picked
  category: "coffee",
  radius: 1000,
  sort: "distance",
  openNow: false,
  showSaved: false,    // showing the saved (♡) places instead of the area

  // Smart search
  query: "",
  parsed: null,        // what the search box understood (see search.js), or null when empty
  searchScope: null,   // a tab tapped while searching
  remote: null,        // { query, elements } from "search a wider area"

  // Map
  map: null,
  markersLayer: null,
  radiusCircle: null,
  markers: new Map(),  // place id -> L.Marker
  selectedId: null,

  // Location
  userPos: null,
  userMarker: null,
  followUser: true,
  searchCenter: null,
  namedCenter: null,
  countryCode: "",     // from reverse geocoding, used for public-holiday rules in opening hours
  region: "",
  cityName: "",        // used when searching a phone number online
  pendingPlaceId: null, // a shared place to open once it's loaded

  // Data
  elements: [],        // raw OSM elements for the current search
  elementsCat: "all",  // which category `elements` covers ("all" for Overpass, one category for the backup)
  source: "none",      // "overpass" (complete), "quick" (temporary), "backup" (Nominatim only)
  loading: false,
  places: [],          // places for the current category, radius and search
  searchToken: 0,
  areas: [],           // cached downloads: { center, radius, time, elements }
  inFlight: [],        // downloads in progress: { center, radius, promise }
  staleArea: null,     // last download saved on this device, shown instantly on the next visit
  quickCache: new Map(),
  normCache: new Map(),
  overpassDownUntil: 0,

  // Directions
  route: null,         // { place, mode, data, origin, fromUser, time, calc }
  routeMode: "foot",
  routeLayer: null,
};

const $ = (sel) => document.querySelector(sel);
export const els = {
  app: $("#app"),
  logo: $("#logo"),
  placeName: $("#placeName"),
  langSelect: $("#langSelect"),
  langCurrent: $("#langCurrent"),
  savedBtn: $("#savedBtn"),
  savedCount: $("#savedCount"),
  toast: $("#toast"),
  query: $("#query"),
  clearQuery: $("#clearQuery"),
  suggest: $("#suggest"),
  understood: $("#understood"),
  tabs: $("#tabs"),
  radius: $("#radius"),
  sort: $("#sort"),
  openNow: $("#openNow"),
  status: $("#status"),
  spinner: $("#spinner"),
  results: $("#results"),
  routeView: $("#routeView"),
  searchAreaBtn: $("#searchAreaBtn"),
  locateBtn: $("#locateBtn"),
  livePill: $("#livePill"),
};

// While searching, the category comes from the words typed ("cerveza" → pubs) or a tab tapped during the search.
export function activeCat() {
  if (!state.parsed) return state.category;
  return state.searchScope || state.parsed.cat || "all";
}
