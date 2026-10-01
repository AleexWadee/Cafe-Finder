// Saved places (♡). Kept only on this device, with enough data to show them anywhere, any time.
import { storeGet, storeSet } from "../core/utils.js";

const KEY = "spothop.favorites";
let favorites = storeGet(KEY) || {}; // place id -> OpenStreetMap element

export const isFavorite = (id) => Boolean(favorites[id]);
export const favoriteCount = () => Object.keys(favorites).length;
export const savedElements = () => Object.values(favorites);

// Saves or removes a place; returns true when it's now saved.
export function toggleFavorite(place) {
  if (favorites[place.id]) {
    delete favorites[place.id];
  } else {
    favorites[place.id] = { type: place.osmType, id: place.osmId, lat: place.lat, lon: place.lng, tags: place.tags, savedAt: Date.now() };
  }
  storeSet(KEY, favorites);
  return isFavorite(place.id);
}
