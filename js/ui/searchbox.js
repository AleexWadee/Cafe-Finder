// The search box: understands what's typed (search.js), shows suggestions and the "Looking for" chips,
// and can search a wider area when nothing nearby matches.
import { CATEGORIES } from "../core/config.js";
import { state, els } from "../core/state.js";
import { t } from "../core/i18n.js";
import { escapeHtml, formatDistance } from "../core/utils.js";
import { parseQuery, chipsFor } from "../data/search.js";
import { categoryOf } from "../data/places.js";
import { searchWide } from "../data/api.js";
import { computePlaces, ensureData } from "../data/results.js";
import { render, renderSkeleton, setStatus, setLoading, visiblePlaces, badgeHtml } from "./list.js";
import { selectPlace } from "./map.js";
import { syncCategoryUI } from "./tabs.js";

export function applyQuery(value) {
  if (value === state.query) return;
  const parsed = parseQuery(value);
  state.query = value;
  state.parsed = parsed.active ? parsed : null;
  state.searchScope = null;
  if (!state.parsed) state.remote = null;
  state.selectedId = null;
  els.results.scrollTop = 0;
  syncCategoryUI();
  ensureData();
  computePlaces();
  render();
  renderUnderstood();
}

// Chips showing what the search understood ("🍕 Pizza  ☀️ Terrace").
export function renderUnderstood() {
  const chips = state.parsed ? chipsFor(state.parsed, CATEGORIES) : [];
  els.understood.classList.toggle("hidden", !chips.length);
  els.understood.innerHTML = chips.length
    ? `<span class="understood-label">${escapeHtml(t("ui.lookingFor"))}</span>${chips.map((c) => `<span>${escapeHtml(c)}</span>`).join("")}`
    : "";
}

let suggestIndex = -1;
export function renderSuggest() {
  const show = document.activeElement === els.query && state.parsed && state.query.trim().length >= 2;
  const items = show ? visiblePlaces().slice(0, 6) : [];
  suggestIndex = -1;
  els.suggest.classList.toggle("hidden", !items.length);
  els.query.setAttribute("aria-expanded", String(items.length > 0));
  els.suggest.innerHTML = items.map((p) => `
    <li role="option" class="t-${p.cat}" data-id="${escapeHtml(p.id)}">
      <span class="s-icon">${p.emoji}</span>
      <span class="s-text"><b>${escapeHtml(p.name)}</b><small>${escapeHtml([p.kind, p.cuisine, formatDistance(p.distance)].filter(Boolean).join(" · "))}</small></span>
      ${badgeHtml(p)}
    </li>`).join("");
}

export function hideSuggest() {
  els.suggest.classList.add("hidden");
  els.query.setAttribute("aria-expanded", "false");
}

function pickSuggestion(id) {
  hideSuggest();
  els.query.blur(); // closes the phone keyboard
  selectPlace(id, { pan: true, scrollList: true });
}

function onSearchKey(e) {
  const items = [...els.suggest.querySelectorAll("li")];
  if ((e.key === "ArrowDown" || e.key === "ArrowUp") && items.length) {
    e.preventDefault();
    suggestIndex = (suggestIndex + (e.key === "ArrowDown" ? 1 : -1) + items.length) % items.length;
    items.forEach((li, i) => li.setAttribute("aria-selected", String(i === suggestIndex)));
  } else if (e.key === "Enter") {
    e.preventDefault();
    if (suggestIndex >= 0 && items[suggestIndex]) pickSuggestion(items[suggestIndex].dataset.id);
    else { hideSuggest(); els.query.blur(); } // show the full list
  } else if (e.key === "Escape") {
    e.stopPropagation();
    hideSuggest();
  }
}

// Looks further away (about 10 km) for a name or food that isn't nearby.
async function wideSearch() {
  const parsed = state.parsed;
  if (!parsed || !state.searchCenter) return;
  const query = state.query;
  const words = parsed.terms.length ? parsed.terms.join(" ") : parsed.cuisines.map((c) => c.words[0]).join(" ");
  setLoading(true);
  renderSkeleton();
  setStatus(escapeHtml(t("status.searchingWider", { q: parsed.raw })));
  let elements = [];
  try {
    elements = (await searchWide(state.searchCenter, words)).filter((el) => categoryOf(el.tags));
  } catch (err) {
    console.warn("Wider search failed:", err);
  }
  setLoading(false);
  if (state.query !== query) return;
  state.remote = { query, elements };
  computePlaces();
  render();
}

export function wireSearchBox() {
  let typing;
  els.query.addEventListener("input", () => {
    els.clearQuery.classList.toggle("hidden", !els.query.value);
    clearTimeout(typing);
    typing = setTimeout(() => applyQuery(els.query.value), 120);
  });
  els.clearQuery.addEventListener("click", () => {
    els.query.value = "";
    els.clearQuery.classList.add("hidden");
    applyQuery("");
    els.query.focus();
  });
  els.query.addEventListener("keydown", onSearchKey);
  els.query.addEventListener("focus", renderSuggest);
  els.query.addEventListener("blur", () => setTimeout(hideSuggest, 150));
  els.suggest.addEventListener("pointerdown", (e) => e.preventDefault()); // keep focus so the tap registers
  els.suggest.addEventListener("click", (e) => {
    const li = e.target.closest("[data-id]");
    if (li) pickSuggestion(li.dataset.id);
  });
  els.results.addEventListener("click", (e) => {
    if (e.target.closest("[data-action=wide-search]")) wideSearch();
  });
}
