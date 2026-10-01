// Small helpers used across the app.
import { WALK_SPEED } from "./config.js";
import { t, getLocale } from "./i18n.js";

export function escapeHtml(str = "") {
  return String(str).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

export function distanceMeters(a, b) {
  const R = 6371000;
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

export function formatDistance(m) {
  return m < 1000 ? `${Math.round(m / 10) * 10} m` : `${(m / 1000).toFixed(1)} km`;
}

export function walkTime(m) {
  const min = Math.max(1, Math.round(m / WALK_SPEED));
  return min < 60 ? t("walk.minutes", { n: min }) : t("walk.hours", { h: Math.floor(min / 60), m: min % 60 });
}

export function formatDuration(sec) {
  const min = Math.max(1, Math.round(sec / 60));
  return min < 60 ? t("route.duration.minutes", { m: min }) : t("route.duration.hours", { h: Math.floor(min / 60), m: min % 60 });
}

export function formatTime(date) {
  return date.toLocaleTimeString(getLocale(), { hour: "2-digit", minute: "2-digit" });
}

export function weekday(date, style = "long") {
  return date.toLocaleDateString(getLocale(), { weekday: style });
}

// "3 coffee spots", "1 bar"
export function plural(n, cat) {
  return `${n} ${t(`cat.${cat}.${n === 1 ? "one" : "many"}`)}`;
}

export function prettify(value = "", max = 3) {
  return value.split(";").map((v) => v.trim().replace(/_/g, " ")).filter(Boolean).slice(0, max)
    .map((v) => v[0].toUpperCase() + v.slice(1)).join(", ");
}

// "+34 928 1; +34 600 2" → ["+34 928 1", "+34 600 2"]
export function splitList(value = "") {
  return value.split(";").map((v) => v.trim()).filter(Boolean);
}

export function safeUrl(url) {
  if (!url) return null;
  const withScheme = /^https?:\/\//i.test(url) ? url : `https://${url}`;
  try { return new URL(withScheme).href; } catch { return null; }
}

// Social links can be written as a full URL or just a username.
export function socialUrl(value, base) {
  if (!value) return null;
  return /^https?:\/\//i.test(value) ? safeUrl(value) : safeUrl(base + value.replace(/^@/, ""));
}

export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export const catColor = (cat) => getComputedStyle(document.documentElement).getPropertyValue(`--c-${cat}`).trim();

export function loadScript(src) {
  return new Promise((resolve, reject) => {
    const el = document.createElement("script");
    el.src = src;
    el.onload = resolve;
    el.onerror = reject;
    document.head.append(el);
  });
}

// Small things remembered on this device (last position and last download) so the next visit starts instantly.
export const STORE = { pos: "spothop.lastPos", area: "spothop.lastArea", prefs: "spothop.prefs", place: "spothop.lastPlace" };

export function storeGet(key) {
  try { return JSON.parse(localStorage.getItem(key)); } catch { return null; }
}

// The category, distance and sort the visitor picked, kept for the next visit.
export function savePrefs(state) {
  storeSet(STORE.prefs, { category: state.category, radius: state.radius, sort: state.sort });
}

export function storeSet(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* storage full or blocked */ }
}
