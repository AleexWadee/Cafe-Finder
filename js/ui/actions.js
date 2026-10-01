// Buttons on a place (save ♡, share 🔗), the "Saved" list button, and short messages (toasts).
import { state, els } from "../core/state.js";
import { t } from "../core/i18n.js";
import { escapeHtml } from "../core/utils.js";
import { isFavorite, toggleFavorite, favoriteCount } from "../data/favorites.js";
import { computePlaces } from "../data/results.js";
import { render } from "./list.js";
import { findPlace } from "./route.js";

// ♡ / ❤️ button. `withLabel` adds "Save" / "Saved" next to the heart (used in the details).
export function favButton(p, { withLabel = false } = {}) {
  const saved = isFavorite(p.id);
  const label = escapeHtml(t(saved ? "info.saved" : "info.save"));
  const cls = withLabel ? "btn fav" : "icon-btn fav";
  return `<button type="button" class="${cls}" data-fav="${escapeHtml(p.id)}" aria-pressed="${saved}" title="${label}" aria-label="${label}">`
    + `${saved ? "❤️" : "♡"}${withLabel ? ` <span>${label}</span>` : ""}</button>`;
}

export function shareButton(p) {
  return `<button type="button" class="btn" data-share="${escapeHtml(p.id)}">🔗 ${escapeHtml(t("info.share"))}</button>`;
}

function onFavorite(id) {
  const place = findPlace(id);
  if (!place) return;
  const saved = toggleFavorite(place);
  // Update every heart for this place (card, details, popup) without re-rendering.
  for (const btn of document.querySelectorAll(`[data-fav="${CSS.escape(id)}"]`)) {
    const label = t(saved ? "info.saved" : "info.save");
    btn.setAttribute("aria-pressed", String(saved));
    btn.title = label;
    btn.setAttribute("aria-label", label);
    btn.innerHTML = `${saved ? "❤️" : "♡"}${btn.classList.contains("btn") ? ` <span>${escapeHtml(label)}</span>` : ""}`;
  }
  updateSavedCount();
  if (state.showSaved && !saved) { computePlaces(); render(); } // drop it from the Saved list
}

// A link that opens SpotHop right on this place: …/#place=node/123@28.12,-15.43
export function placeLink(p) {
  return `${location.origin}${location.pathname}#place=${p.id}@${p.lat.toFixed(6)},${p.lng.toFixed(6)}`;
}

async function onShare(id) {
  const place = findPlace(id);
  if (!place) return;
  const data = { title: place.name, text: t("info.shareText", { name: place.name }), url: placeLink(place) };
  if (navigator.share) {
    try { await navigator.share(data); return; } catch (err) { if (err.name === "AbortError") return; }
  }
  try {
    await navigator.clipboard.writeText(data.url);
    toast(t("info.linkCopied"));
  } catch {
    window.prompt(t("info.share"), data.url); // last resort: let the user copy it
  }
}

export function updateSavedCount() {
  const n = favoriteCount();
  els.savedCount.textContent = n ? n : "";
}

let toastTimer;
export function toast(message) {
  els.toast.textContent = message;
  els.toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => els.toast.classList.remove("show"), 2600);
}

export function wireActions() {
  const handle = (e) => {
    const fav = e.target.closest("[data-fav]");
    const share = e.target.closest("[data-share]");
    if (!fav && !share) return;
    if (e.spothopHandled) return; // a click must only count once (popup buttons have two listeners)
    e.spothopHandled = true;
    e.preventDefault();
    e.stopPropagation();
    if (fav) onFavorite(fav.dataset.fav);
    if (share) onShare(share.dataset.share);
  };
  document.addEventListener("click", handle);
  // Leaflet stops clicks inside popups from reaching the page, so popup buttons get their own handler.
  state.map.on("popupopen", (e) => {
    e.popup.getElement()?.querySelectorAll("[data-fav], [data-share]").forEach((btn) => btn.addEventListener("click", handle));
  });
  updateSavedCount();
}
