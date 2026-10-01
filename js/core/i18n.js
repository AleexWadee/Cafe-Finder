// Languages: picks the visitor's language, translates texts with t("section.key"), remembers the choice.
import en from "../../languages/en.js";
import es from "../../languages/es.js";

export const LANGUAGES = { en, es }; // add new languages here (files live in /languages)

const STORAGE_KEY = "spothop.lang";
let current = detectLanguage();

function detectLanguage() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && LANGUAGES[saved]) return saved;
  } catch { /* storage blocked */ }
  for (const lang of navigator.languages || [navigator.language || "en"]) {
    const code = lang.slice(0, 2).toLowerCase();
    if (LANGUAGES[code]) return code;
  }
  return "en";
}

export const getLang = () => current;
export const getLocale = () => LANGUAGES[current].meta.locale;

export function setLang(code) {
  if (!LANGUAGES[code]) return;
  current = code;
  try { localStorage.setItem(STORAGE_KEY, code); } catch { /* storage blocked */ }
}

function lookup(dict, key) {
  return key.split(".").reduce((node, part) => (node == null ? undefined : node[part]), dict);
}

export function has(key) {
  return lookup(LANGUAGES[current], key) !== undefined;
}

// t("status.within", { distance: "1 km" }) → "within 1 km". Falls back to English, then to the key itself.
export function t(key, vars = {}) {
  let value = lookup(LANGUAGES[current], key);
  if (value === undefined) value = lookup(en, key);
  if (typeof value === "function") return value(vars);
  if (typeof value === "string") return value.replace(/\{(\w+)\}/g, (m, name) => (name in vars ? vars[name] : m));
  return value ?? key;
}

// Translates the fixed texts in the page: data-i18n (text), data-i18n-placeholder / -title / -aria-label (attributes).
export function translatePage(root = document) {
  document.documentElement.lang = current;
  document.title = t("app.title");
  document.querySelector('meta[name="description"]')?.setAttribute("content", t("app.description"));
  for (const el of root.querySelectorAll("[data-i18n]")) el.textContent = t(el.dataset.i18n);
  for (const attr of ["placeholder", "title", "aria-label"]) {
    for (const el of root.querySelectorAll(`[data-i18n-${attr}]`)) el.setAttribute(attr, t(el.getAttribute(`data-i18n-${attr}`)));
  }
}
