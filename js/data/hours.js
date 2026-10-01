// Opening hours: open/closed right now, the next change, the weekly timetable, and estimates
// for places that haven't published their hours.
import { state } from "../core/state.js";
import { t } from "../core/i18n.js";
import { escapeHtml, formatTime, weekday, loadScript } from "../core/utils.js";

// Many places haven't published their hours on OpenStreetMap. For those, SpotHop estimates from
// the usual hours for that kind of place (written in OSM opening_hours format) and labels them "Likely".
const TYPICAL_HOURS = {
  es: { // Spain: early cafés, late lunch and dinner, late nights
    coffee: "Mo-Fr 07:00-21:00; Sa 08:00-21:00; Su 09:00-15:00",
    pubs: "Mo-Th,Su 17:00-02:00; Fr,Sa 17:00-03:30",
    bars: "Mo-Sa 07:30-24:00; Su 09:00-23:00",
    restaurants: "Mo-Su 13:00-16:30,20:00-23:30",
  },
  default: {
    coffee: "Mo-Fr 07:00-19:00; Sa,Su 08:00-18:00",
    pubs: "Mo-Th,Su 12:00-23:00; Fr,Sa 12:00-01:00",
    bars: "Mo-Th,Su 17:00-01:00; Fr,Sa 17:00-02:00",
    restaurants: "Mo-Su 12:00-15:00,18:00-22:30",
  },
};

// The opening-hours library is big (~700 KB), so it loads after the map is already on screen.
export async function loadHoursLibrary() {
  await loadScript("https://cdnjs.cloudflare.com/ajax/libs/suncalc/1.9.0/suncalc.min.js"); // needed by opening_hours
  await loadScript("https://cdn.jsdelivr.net/npm/opening_hours@3.15.0/build/opening_hours.min.js");
}

function parseHours(raw, lat, lng) {
  // The country code lets rules like "PH off" (public holidays) work.
  const where = { lat, lon: lng, address: { country_code: state.countryCode, state: state.region } };
  return new window.opening_hours(raw, where, { mode: 0, warnings_severity: 0 });
}

// Works out whether a place is open right now. Uses the place's real hours when it has them;
// otherwise typical hours for that kind of place, marked as an estimate.
export function openingInfo(tags, cat, lat, lng) {
  const none = { isOpen: undefined, text: "", estimated: false, oh: null };
  if (typeof window.opening_hours !== "function") return none;

  let oh = null;
  let estimated = false;
  if (tags.opening_hours) {
    try { oh = parseHours(tags.opening_hours, lat, lng); } catch { oh = null; } // unreadable → estimate
  }
  if (!oh) {
    const typical = (TYPICAL_HOURS[state.countryCode] || TYPICAL_HOURS.default)[cat];
    try { oh = parseHours(typical, lat, lng); estimated = true; } catch { return none; }
  }

  const now = new Date();
  const isOpen = oh.getState(now);
  const next = oh.getNextChange(now);
  let text = "";
  if (next) {
    // Late-night times (e.g. closing at 00:00 or 02:00) show just the time, not tomorrow's day name.
    const sameDay = next.toDateString() === now.toDateString() || (next - now < 12 * 3600e3 && next.getHours() < 6);
    const vars = { time: formatTime(next), day: sameDay ? "" : weekday(next, "short") };
    const key = `${estimated ? "usually" : ""}${isOpen ? "Closes" : "Opens"}`;
    text = t(`hours.${key[0].toLowerCase()}${key.slice(1)}`, vars);
  } else if (isOpen) {
    text = t("hours.open247");
  }
  return { isOpen, text, estimated, oh };
}

// The opening hours for the next 7 days, starting today.
export function weekHtml(p) {
  if (!p.oh) return "";
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const rows = [];
  for (let d = 0; d < 7; d++) {
    const start = new Date(today);
    start.setDate(today.getDate() + d);
    const end = new Date(start);
    end.setDate(start.getDate() + 1);
    let text = t("hours.closed");
    try {
      // Look a bit past midnight so late-night hours (e.g. 18:00–02:00) show their real closing time.
      const intervals = p.oh.getOpenIntervals(start, new Date(end.getTime() + 12 * 3600e3));
      if (intervals.some(([s, e]) => s <= start && e >= end)) {
        text = t("hours.open24h");
      } else {
        const parts = intervals
          .filter(([s]) => s < end)
          .filter(([s]) => !(s.getTime() === start.getTime() && p.oh.getState(new Date(start.getTime() - 60000)))) // continues from the night before
          .map(([s, e]) => `${formatTime(s)} – ${formatTime(e)}`);
        if (parts.length) text = parts.join(", ");
      }
    } catch { text = "—"; }
    const day = d === 0 ? t("hours.today") : weekday(start);
    rows.push(`<tr${d === 0 ? ' class="today"' : ""}><th>${escapeHtml(day[0].toUpperCase() + day.slice(1))}</th><td>${escapeHtml(text)}</td></tr>`);
  }
  const note = p.estimated
    ? `<p class="hours-note">${escapeHtml(t("hours.estimatedNote", { kind: p.kind.toLowerCase() }))} <a href="https://www.openstreetmap.org/edit?${p.osmType}=${p.osmId}" target="_blank" rel="noopener">${escapeHtml(t("hours.addHours"))}</a></p>`
    : `<p class="hours-note">${escapeHtml(t("hours.published"))}</p>`;
  return `<table class="week">${rows.join("")}</table>${note}`;
}
