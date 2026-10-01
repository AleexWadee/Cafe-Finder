// The visitor's live location: first fix, then following them as they move.
import { AUTO_REFRESH_DISTANCE, ROUTE_REFRESH_DISTANCE } from "./config.js";
import { state, els } from "./state.js";
import { distanceMeters, storeSet, STORE } from "./utils.js";
import { findPlaces, computePlaces } from "../data/results.js";
import { render } from "../ui/list.js";
import { updateUserMarker } from "../ui/map.js";
import { calcRoute } from "../ui/route.js";

export function getInitialPosition() {
  return new Promise((resolve) => {
    if (!navigator.geolocation) return resolve(null);
    navigator.geolocation.getCurrentPosition(
      (p) => {
        const pos = { lat: p.coords.latitude, lng: p.coords.longitude };
        storeSet(STORE.pos, pos);
        resolve(pos);
      },
      () => resolve(null),
      { enableHighAccuracy: true, timeout: 6000, maximumAge: 10 * 60 * 1000 },
    );
  });
}

export function startWatchingPosition() {
  if (!navigator.geolocation) return;
  let lastRendered = state.userPos;
  let lastSaved = null;
  navigator.geolocation.watchPosition(
    (p) => {
      const pos = { lat: p.coords.latitude, lng: p.coords.longitude };
      state.userPos = pos;
      if (!lastSaved || distanceMeters(pos, lastSaved) > 100) {
        storeSet(STORE.pos, pos);
        lastSaved = pos;
      }
      els.livePill.classList.add("on");
      updateUserMarker();

      // While directions are open, keep the route up to date instead of searching.
      const r = state.route;
      if (r) {
        if (r.data && (!r.fromUser || distanceMeters(pos, r.origin) > ROUTE_REFRESH_DISTANCE) && Date.now() - r.time > 5000) calcRoute();
        lastRendered = pos;
        return;
      }

      if (state.followUser && state.searchCenter && distanceMeters(pos, state.searchCenter) > AUTO_REFRESH_DISTANCE) {
        state.map.panTo(pos);
        findPlaces(pos); // usually instant thanks to the prefetch margin
      } else if (!state.loading && (!lastRendered || distanceMeters(pos, lastRendered) > 25)) {
        computePlaces();
        render();
      }
      lastRendered = pos;
    },
    () => els.livePill.classList.remove("on"),
    { enableHighAccuracy: true, maximumAge: 15000 },
  );
}
