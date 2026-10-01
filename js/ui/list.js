// The side list: status line, place cards with their details, empty states and tab counts.
import { CATEGORIES } from "../core/config.js";
import { state, els, activeCat } from "../core/state.js";
import { t } from "../core/i18n.js";
import { escapeHtml, distanceMeters, formatDistance, walkTime, plural } from "../core/utils.js";
import { categoryOf, positionOf, normalize } from "../data/places.js";
import { weekHtml } from "../data/hours.js";
import { scorePlace } from "../data/search.js";
import { renderMarkers } from "./map.js";
import { renderSuggest } from "./searchbox.js";
import { favButton, shareButton } from "./actions.js";
import { selectPlace } from "./map.js";

// "Open now" hides closed places. Places with published hours that are open come first,
// then places that are likely open based on typical hours.
export const isConfirmedOpen = (p) => p.isOpen === true && !p.estimated;

export function visiblePlaces() {
  let list = state.places;
  if (state.openNow) list = list.filter((p) => p.isOpen !== false);
  list = state.sort === "name" ? [...list].sort((a, b) => a.name.localeCompare(b.name)) : [...list];
  if (state.openNow) list.sort((a, b) => isConfirmedOpen(b) - isConfirmedOpen(a)); // stable: keeps the chosen order
  return list;
}

export function render() {
  const list = visiblePlaces();
  renderMarkers(list);
  renderList(list);
  renderCounts();
  renderStatus(list);
  renderSuggest();
  if (state.pendingPlaceId && state.places.some((p) => p.id === state.pendingPlaceId)) {
    const id = state.pendingPlaceId;
    state.pendingPlaceId = null;
    history.replaceState(null, "", location.pathname + location.search); // tidy the address bar
    setTimeout(() => selectPlace(id, { scrollList: true }), 50);
  }
}

export function setLoading(on) {
  state.loading = on;
  els.spinner.classList.toggle("hidden", !on);
}

export function setStatus(html) {
  els.status.innerHTML = html;
}

function renderStatus(list) {
  const cat = activeCat();
  const note = (text) => ` <span class="note">· ${escapeHtml(text)}</span>`;
  if (state.showSaved) {
    setStatus(`<b>${escapeHtml(t("status.saved", { n: list.length }))}</b>`);
  } else if (state.source === "quick") {
    setStatus(`<b>${plural(list.length, cat)}</b>${note(t("status.loadingFull"))}`);
  } else if (!state.places.length) {
    setStatus("");
  } else if (state.parsed) {
    const wide = state.remote?.query === state.query && state.remote.elements.length ? note(t("status.widerArea")) : "";
    setStatus(`<b>${t("status.results", { n: list.length })}</b> ${escapeHtml(t("status.resultsFor", { q: state.parsed.raw }))}${wide}`);
  } else if (state.openNow) {
    const confirmed = list.filter(isConfirmedOpen).length;
    const detail = confirmed === list.length ? "" : note(t("status.confirmedLikely", { confirmed, likely: list.length - confirmed }));
    setStatus(`<b>${t("status.openNow", { n: list.length })}</b>${detail}`);
  } else {
    const backup = state.source === "backup" ? note(t("status.backupData")) : "";
    setStatus(`<b>${plural(list.length, cat)}</b> ${t("status.within", { distance: formatDistance(state.radius) })}${backup}`);
  }
}

// Number badges on the category tiles (matches per tab while searching).
export function renderCounts() {
  const counts = { coffee: 0, pubs: 0, bars: 0, restaurants: 0, all: 0 };
  const complete = state.source === "overpass" && state.searchCenter && !state.showSaved;
  if (complete) {
    const seen = new Set();
    for (const el of state.elements) {
      const cat = categoryOf(el.tags || {});
      const pos = positionOf(el);
      const id = `${el.type}/${el.id}`;
      if (!cat || !pos || !el.tags.name || seen.has(id) || distanceMeters(state.searchCenter, pos) > state.radius) continue;
      if (state.parsed) {
        const place = normalize(el);
        if (!place || !scorePlace(place, state.parsed, place.isOpen)) continue;
      }
      seen.add(id);
      counts[cat]++;
      counts.all++;
    }
  }
  for (const btn of els.tabs.querySelectorAll(".cat")) {
    const n = counts[btn.dataset.cat];
    btn.querySelector(".count").textContent = complete ? (n > 999 ? "999+" : n) : "";
  }
}

export function emptyState(icon, title, text) {
  return `<li class="empty"><div class="empty-icon">${icon}</div><h3>${escapeHtml(title)}</h3><p>${escapeHtml(text)}</p></li>`;
}

export function renderSkeleton() {
  els.results.innerHTML = Array.from({ length: 6 }, () => `
    <li class="card skeleton">
      <div class="card-icon"></div>
      <div class="card-body">
        <div class="line" style="width:60%"></div>
        <div class="line" style="width:35%"></div>
        <div class="line" style="width:80%"></div>
      </div>
    </li>`).join("");
}

export function badgeHtml(p) {
  if (p.isOpen === undefined) return "";
  if (p.estimated) {
    const tip = `title="${escapeHtml(t("badge.estimatedTip"))}"`;
    return p.isOpen
      ? `<span class="badge likely-open" ${tip}>${escapeHtml(t("badge.likelyOpen"))}</span>`
      : `<span class="badge likely-closed" ${tip}>${escapeHtml(t("badge.likelyClosed"))}</span>`;
  }
  return p.isOpen
    ? `<span class="badge open">${escapeHtml(t("badge.open"))}</span>`
    : `<span class="badge closed">${escapeHtml(t("badge.closed"))}</span>`;
}

function directionsButton(p) {
  return `<button type="button" class="btn primary" data-route="${escapeHtml(p.id)}">${escapeHtml(t("info.directions"))}</button>`;
}

const chipsHtml = (items, extraClass = "") =>
  items.length ? `<div class="chips ${extraClass}">${items.map((h) => `<span>${escapeHtml(h)}</span>`).join("")}</div>` : "";

// Address, phone, website, email, socials, food and features of an opened place.
export function infoHtml(p) {
  const rows = [];
  const row = (icon, html, labelKey) => {
    const label = escapeHtml(t(labelKey));
    rows.push(`<div class="info-row"><span class="info-icon" title="${label}" aria-label="${label}">${icon}</span><span class="info-value">${html}</span></div>`);
  };
  const link = (href, text, external = true) =>
    `<a href="${escapeHtml(href)}"${external ? ' target="_blank" rel="noopener"' : ""}>${escapeHtml(text)}</a>`;

  if (p.address) row("🏠", escapeHtml(p.address), "info.address");
  for (const phone of p.phones) row("📞", link(`tel:${phone.replace(/[^\d+]/g, "")}`, phone, false), "info.phone");
  if (p.website) row("🌐", link(p.website, new URL(p.website).hostname.replace(/^www\./, "")), "info.website");
  if (p.email) row("✉️", link(`mailto:${p.email}`, p.email, false), "info.email");
  if (p.instagram) row("📷", link(p.instagram, "Instagram"), "info.contact");
  if (p.facebook) row("👍", link(p.facebook, "Facebook"), "info.contact");
  if (p.fullCuisine) row("🍽️", escapeHtml(p.fullCuisine), "info.food");
  if (p.whatsapp) row("💬", link(`https://wa.me/${p.whatsapp}`, "WhatsApp"), "info.contact");
  // No phone on OpenStreetMap: one tap searches the web for it.
  if (!p.phones.length) row("📞", link(phoneSearchUrl(p), t("info.findPhone")), "info.phone");
  if (!p.website) row("🌐", link(webSearchUrl(p), t("info.findWebsite")), "info.website");
  return `<div class="info">${rows.join("")}</div>${chipsHtml(p.highlights)}`;
}

// A web search for the place's phone number ("Margariita Calle Joaquín Blume Las Palmas phone").
function phoneSearchUrl(p) {
  const words = [p.name, p.tags["addr:street"], p.tags["addr:city"] || state.cityName, t("info.phoneWord")];
  return `https://www.google.com/search?q=${encodeURIComponent(words.filter(Boolean).join(" "))}`;
}

// A web search for the place itself, to find its website.
function webSearchUrl(p) {
  const words = [p.name, p.tags["addr:city"] || state.cityName];
  return `https://www.google.com/search?q=${encodeURIComponent(words.filter(Boolean).join(" "))}`;
}

const telHref = (phone) => `tel:${phone.replace(/[^\d+]/g, "")}`;

function actionsHtml(p) {
  const call = p.phones.length ? `<a class="btn" href="${escapeHtml(telHref(p.phones[0]))}">📞 ${escapeHtml(t("info.call"))}</a>` : "";
  return `<div class="actions">${directionsButton(p)}${call}${favButton(p, { withLabel: true })}${shareButton(p)}</div>`;
}

// Everything shown when a card is opened: contact details, timetable and buttons.
export function detailsHtml(p) {
  return `${infoHtml(p)}<div class="week-wrap">${weekHtml(p)}</div>${actionsHtml(p)}`;
}

// The map popup: same details in a compact form.
export function popupHtml(p) {
  const subtitle = [p.kind, p.cuisine].filter(Boolean).join(" · ");
  const hours = p.hoursText ? `<p>🕒 ${escapeHtml(p.hoursText)}${p.estimated ? ` (${escapeHtml(t("hours.estimate"))})` : ""}</p>` : "";
  return `
    <div class="iw t-${p.cat}">
      <div class="iw-top"><h3>${p.emoji} ${escapeHtml(p.name)}</h3>${badgeHtml(p)}</div>
      ${subtitle ? `<p>${escapeHtml(subtitle)}</p>` : ""}
      <p>${escapeHtml(`${formatDistance(p.distance)} · ${walkTime(p.distance)}`)}</p>
      ${hours}
      ${infoHtml(p)}
      <div class="week-wrap">${weekHtml(p)}</div>
      ${actionsHtml(p)}
    </div>`;
}

function renderEmpty() {
  if (state.showSaved) {
    els.results.innerHTML = emptyState("♡", t("empty.noSaved"), t("empty.noSavedText"));
    return;
  }
  if (state.parsed) {
    const wideDone = state.remote?.query === state.query;
    const canWiden = !wideDone && (state.parsed.terms.length || state.parsed.cuisines.length);
    els.results.innerHTML = `
      <li class="empty">
        <div class="empty-icon">🔎</div>
        <h3>${escapeHtml(t("empty.noMatchesFor", { q: state.parsed.raw }))}</h3>
        <p>${escapeHtml(wideDone ? t("empty.nothingWider") : t("empty.nothingWithin", { distance: formatDistance(state.radius) }))}</p>
        ${canWiden ? `<button type="button" class="btn primary wide-btn" data-action="wide-search">${escapeHtml(t("empty.searchWider"))}</button>` : ""}
      </li>`;
    return;
  }
  const cat = activeCat();
  const many = t(`cat.${cat}.many`);
  els.results.innerHTML = state.places.length
    ? emptyState("🔎", t("empty.noMatches"), state.openNow ? t("empty.allClosed", { many }) : t("empty.tryDifferent"))
    : emptyState(CATEGORIES[cat].emoji, t("empty.noneHere", { many, one: t(`cat.${cat}.one`) }), t("empty.noneHereText"));
}

function renderList(list) {
  if (!list.length) {
    if (state.loading) renderSkeleton();
    else renderEmpty();
    return;
  }

  const firstLikely = state.openNow ? list.findIndex((p) => !isConfirmedOpen(p)) : -1;
  els.results.innerHTML = list.map((p, i) => {
    const divider = i === firstLikely
      ? `<li class="divider">${escapeHtml(t(i === 0 ? "hours.dividerAll" : "hours.dividerLikely"))}</li>`
      : "";
    const subtitle = [p.kind, p.cuisine].filter(Boolean).join(" · ");
    const meta = [formatDistance(p.distance), walkTime(p.distance), p.hoursText].filter(Boolean)
      .map((m) => `<span>${escapeHtml(m)}</span>`).join("");
    return `${divider}
      <li class="card t-${p.cat}${p.id === state.selectedId ? " selected" : ""}" data-id="${escapeHtml(p.id)}" tabindex="0">
        <div class="card-icon">${p.emoji}</div>
        <div class="card-body">
          <div class="card-top">
            <h3 class="name" title="${escapeHtml(p.name)}">${escapeHtml(p.name)}</h3>
            ${badgeHtml(p)}
            ${p.phones.length ? `<a class="icon-btn" href="${escapeHtml(telHref(p.phones[0]))}" title="${escapeHtml(t("info.call"))}" aria-label="${escapeHtml(t("info.call"))}">📞</a>` : ""}
            ${favButton(p)}
          </div>
          ${subtitle ? `<div class="subtitle">${escapeHtml(subtitle)}</div>` : ""}
          <div class="meta">${meta}</div>
          ${chipsHtml(p.highlights.slice(0, 4), "card-chips")}
          <div class="details" data-details>${p.id === state.selectedId ? detailsHtml(p) : ""}</div>
        </div>
      </li>`;
  }).join("");
}
