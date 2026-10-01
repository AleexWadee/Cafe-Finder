// The category tiles (Coffee, Pubs, Bars, Restaurants, All).
import { CATEGORIES } from "../core/config.js";
import { state, els, activeCat } from "../core/state.js";
import { t } from "../core/i18n.js";
import { savePrefs } from "../core/utils.js";
import { computePlaces, ensureData, findPlaces } from "../data/results.js";
import { render } from "./list.js";
import { clearMarkers, drawRadius } from "./map.js";

export function buildTabs() {
  els.tabs.innerHTML = Object.entries(CATEGORIES).map(([key, c]) => `
    <button type="button" class="cat t-${key}" role="tab" data-cat="${key}" aria-selected="${key === activeCat()}">
      <span class="emoji">${c.emoji}</span>
      <span class="label">${t(`cat.${key}.label`)}</span>
      <span class="count"></span>
    </button>`).join("");
  translateTabs();
}

// Updates the tile names (after a language change) without rebuilding them.
// Long names ("Restaurantes") get a slightly smaller font so they fit the tile.
export function translateTabs() {
  for (const btn of els.tabs.querySelectorAll(".cat")) {
    const label = btn.querySelector(".label");
    label.textContent = t(`cat.${btn.dataset.cat}.label`);
    label.classList.toggle("long", label.textContent.length > 10);
  }
}

export function wireTabs() {
  els.tabs.addEventListener("click", (e) => {
    const btn = e.target.closest(".cat");
    if (!btn || btn.dataset.cat === activeCat()) return;
    setCategory(btn.dataset.cat);
  });
}

function setCategory(cat) {
  state.category = cat;
  savePrefs(state);
  if (state.parsed) state.searchScope = cat; // a tab tapped while searching narrows the search
  syncCategoryUI();
  clearMarkers();
  els.results.scrollTop = 0;

  // If we have the data already, switching is instant; otherwise load what's missing.
  if (state.source === "overpass" || state.parsed) {
    ensureData();
    computePlaces();
    render();
  } else {
    findPlaces(state.searchCenter || state.map.getCenter());
  }
}

// Tabs, colors and the radius circle follow the category being shown (which a search can change).
export function syncCategoryUI() {
  const cat = activeCat();
  els.app.dataset.cat = cat;
  els.logo.textContent = cat === "all" ? "☕" : CATEGORIES[cat].emoji;
  els.tabs.querySelectorAll(".cat").forEach((btn) => btn.setAttribute("aria-selected", btn.dataset.cat === cat));
  drawRadius();
}
