import { t } from "./i18n.js";

// SpotHop smart search — understands what people type (English or Spanish):
//   kinds of place ("cerveza" → pubs), food ("pizza", "sushi"), features ("terraza", "wifi"),
//   "open now", and place names with typos ("starbuks" → Starbucks).

export function fold(str = "") {
  return str.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

// Words that pick a category.
const CATEGORY_WORDS = {
  coffee: ["cafe", "cafes", "cafeteria", "cafeterias", "coffee", "coffees", "coffee shop", "espresso", "cappuccino",
    "capuchino", "latte", "brunch", "breakfast", "desayuno", "desayunar", "desayunos", "merienda", "cafecito", "te", "tea"],
  pubs: ["pub", "pubs", "cerveza", "cervezas", "beer", "beers", "pinta", "pintas", "pint", "pints", "cerveceria",
    "cervecerias", "irish pub", "birra", "birras", "craft beer", "cerveza artesanal"],
  bars: ["bar", "bars", "bares", "copas", "copa", "tomar algo", "cocktail", "cocktails", "coctel", "cocteles", "coctail",
    "drink", "drinks", "tragos", "trago", "mojito", "gin", "gin tonic", "wine", "vino", "vinos", "wine bar", "nightlife",
    "noche", "salir"],
  restaurants: ["restaurant", "restaurants", "restaurante", "restaurantes", "food", "comida", "comer", "eat", "lunch",
    "almuerzo", "almorzar", "dinner", "cena", "cenar", "menu", "menu del dia"],
};

// Food: words → OSM cuisine values, plus name fragments (a "Pizzería Napoli" has no cuisine tag but is clearly pizza).
const CUISINES = [
  { id: "pizza", emoji: "🍕", words: ["pizza", "pizzas", "pizzeria", "pizzerias"], values: ["pizza", "italian"], hints: ["pizz"] },
  { id: "italian", emoji: "🍝", words: ["italian", "italiano", "italiana", "pasta"], values: ["italian", "pizza", "pasta"], hints: ["trattoria", "pasta"] },
  { id: "sushi", emoji: "🍣", words: ["sushi"], values: ["sushi", "japanese"], hints: ["sushi"] },
  { id: "japanese", emoji: "🍜", words: ["japanese", "japones", "japonesa", "ramen"], values: ["japanese", "sushi", "ramen"], hints: ["ramen", "sushi"] },
  { id: "burgers", emoji: "🍔", words: ["burger", "burgers", "hamburguesa", "hamburguesas", "hamburgueseria"], values: ["burger", "american"], hints: ["burger", "hamburg"] },
  { id: "tapas", emoji: "🫒", words: ["tapas", "tapa", "tapeo", "pinchos", "pintxos"], values: ["tapas", "spanish", "regional"], hints: ["tapa", "taberna", "tasca"] },
  { id: "spanish", emoji: "🥘", words: ["spanish", "espanol", "espanola", "paella"], values: ["spanish", "regional", "tapas", "paella"], hints: ["paella"] },
  { id: "canarian", emoji: "🌋", words: ["canarian", "canario", "canaria", "guachinche", "papas arrugadas"], values: ["canarian", "regional", "spanish"], hints: ["guachinche"] },
  { id: "chinese", emoji: "🥡", words: ["chinese", "chino", "china"], values: ["chinese"], hints: ["chino", "china", "wok"] },
  { id: "asian", emoji: "🥢", words: ["asian", "asiatico", "asiatica", "wok"], values: ["asian", "chinese", "japanese", "thai", "vietnamese", "korean"], hints: ["wok", "asia"] },
  { id: "thai", emoji: "🍲", words: ["thai", "tailandes", "tailandesa"], values: ["thai"], hints: ["thai"] },
  { id: "korean", emoji: "🍱", words: ["korean", "coreano", "coreana"], values: ["korean"], hints: ["korea"] },
  { id: "mexican", emoji: "🌮", words: ["mexican", "mexicano", "mexicana", "tacos", "taco", "burrito", "burritos"], values: ["mexican", "tex-mex", "tacos"], hints: ["taco", "mexic"] },
  { id: "indian", emoji: "🍛", words: ["indian", "indio", "india", "hindu", "curry", "tandoori"], values: ["indian", "curry", "pakistani", "nepalese"], hints: ["india", "curry", "tandoori", "masala"] },
  { id: "kebab", emoji: "🥙", words: ["kebab", "kebabs", "kebap", "doner", "shawarma", "falafel"], values: ["kebab", "turkish", "doner", "shawarma", "middle_eastern", "lebanese", "falafel"], hints: ["kebab", "doner", "shawarma"] },
  { id: "seafood", emoji: "🦐", words: ["seafood", "marisco", "mariscos", "pescado", "fish", "marisqueria"], values: ["seafood", "fish"], hints: ["marisq", "pescad"] },
  { id: "grill", emoji: "🥩", words: ["steak", "carne", "carnes", "grill", "parrilla", "asador", "asado", "bbq", "barbacoa"], values: ["steak_house", "grill", "barbecue", "argentinian", "brazilian"], hints: ["asador", "parrilla", "grill", "steak"] },
  { id: "chicken", emoji: "🍗", words: ["chicken", "pollo", "pollos"], values: ["chicken"], hints: ["pollo", "chicken"] },
  { id: "sandwiches", emoji: "🥪", words: ["sandwich", "sandwiches", "bocadillo", "bocadillos", "bocata", "bocatas"], values: ["sandwich"], hints: ["bocad", "bocata", "sandwich"] },
  { id: "venezuelan", emoji: "🫓", words: ["venezuelan", "venezolano", "venezolana", "arepa", "arepas", "arepera"], values: ["venezuelan", "arepa"], hints: ["arep"] },
  { id: "latin", emoji: "🌶️", words: ["peruvian", "peruano", "peruana", "argentinian", "argentino", "argentina", "colombian", "colombiano", "cuban", "cubano"], values: ["peruvian", "argentinian", "colombian", "cuban", "latin_american"], hints: [] },
  { id: "healthy", emoji: "🥗", words: ["healthy", "saludable", "poke", "bowl", "ensalada", "salad", "salads"], values: ["healthy", "poke", "salad", "vegetarian", "vegan"], hints: ["poke", "salad"] },
  { id: "desserts", emoji: "🍰", words: ["dessert", "desserts", "postre", "postres", "cake", "cakes", "tarta", "tartas", "pasteleria", "dulces", "crepe", "crepes", "gofres", "waffles"], values: ["dessert", "cake", "pastry", "crepe", "waffle"], hints: ["pastel", "crep", "dulce"] },
];

// Features: words → a check on the place's OpenStreetMap tags.
const yes = (tags, k) => tags[k] === "yes" || tags[k] === "only";
const FEATURES = [
  { id: "terrace", emoji: "☀️", words: ["terrace", "terraza", "terrazas", "outdoor", "outside", "fuera", "exterior", "patio", "al aire libre"], test: (t) => yes(t, "outdoor_seating") },
  { id: "wifi", emoji: "📶", words: ["wifi", "wi fi", "internet", "wlan"], test: (t) => t.internet_access && t.internet_access !== "no" },
  { id: "takeaway", emoji: "🥡", words: ["takeaway", "take away", "to go", "para llevar", "llevar"], test: (t) => yes(t, "takeaway") },
  { id: "delivery", emoji: "🛵", words: ["delivery", "domicilio", "a domicilio", "reparto"], test: (t) => yes(t, "delivery") },
  { id: "vegan", emoji: "🌱", words: ["vegan", "vegano", "vegana", "veganos", "veganas"], test: (t) => yes(t, "diet:vegan") || /vegan/.test(t.cuisine || "") },
  { id: "vegetarian", emoji: "🥗", words: ["vegetarian", "vegetariano", "vegetariana", "vegetarianos", "veggie"], test: (t) => yes(t, "diet:vegetarian") || yes(t, "diet:vegan") || /vegetarian|vegan/.test(t.cuisine || "") },
  { id: "glutenFree", emoji: "🌾", words: ["gluten free", "glutenfree", "sin gluten", "celiaco", "celiacos", "celiac"], test: (t) => yes(t, "diet:gluten_free") },
  { id: "accessible", emoji: "♿", words: ["accessible", "accesible", "wheelchair", "silla de ruedas"], test: (t) => yes(t, "wheelchair") },
  { id: "liveMusic", emoji: "🎵", words: ["live music", "musica en vivo", "musica en directo", "musica", "music", "concierto", "conciertos"], test: (t) => yes(t, "live_music") },
  { id: "sports", emoji: "📺", words: ["sports", "sport", "deportes", "futbol", "football", "partido", "partidos"], test: (t) => Boolean(t.sport) },
  { id: "dogFriendly", emoji: "🐶", words: ["dog", "dogs", "perro", "perros", "pet", "pets", "mascota", "mascotas", "dog friendly"], test: (t) => yes(t, "dog") },
];

const OPEN_WORDS = ["open", "open now", "abierto", "abiertos", "abierta", "abiertas", "abierto ahora", "ahora", "now"];

// Words that carry no meaning for the search ("a good pizza place near me" → "pizza").
const STOP_WORDS = new Set(("a an the near nearby me around close closest best good great nice some any place places spot spots " +
  "i want to find looking look for with in on at and or of my please show " +
  "de del la las el los lo un una unos unas con en cerca mi me quiero busco buscar buscando donde hay lugar lugares sitio sitios " +
  "mejor mejores buen buena bueno buenos buenas para y o que algo por aqui aca zona cheap barato barata baratos economico").split(" "));

// One lookup table for every phrase (1–3 words).
const PHRASES = new Map();
for (const [cat, words] of Object.entries(CATEGORY_WORDS)) for (const w of words) PHRASES.set(w, { type: "cat", cat });
for (const c of CUISINES) for (const w of c.words) PHRASES.set(w, { type: "cuisine", item: c });
for (const f of FEATURES) for (const w of f.words) PHRASES.set(w, { type: "feature", item: f });
for (const w of OPEN_WORDS) PHRASES.set(w, { type: "open" });

export function parseQuery(raw = "") {
  const words = fold(raw).replace(/[^a-z0-9ñ\s-]/g, " ").replace(/-/g, " ").split(/\s+/).filter(Boolean);
  const parsed = { raw: raw.trim(), cats: new Set(), cuisines: [], features: [], openNow: false, terms: [] };

  for (let i = 0; i < words.length; ) {
    let hit = null;
    let len = 0;
    for (let n = Math.min(3, words.length - i); n >= 1 && !hit; n--) { // longest phrase first ("para llevar")
      hit = PHRASES.get(words.slice(i, i + n).join(" "));
      if (hit) len = n;
    }
    if (hit) {
      if (hit.type === "cat") parsed.cats.add(hit.cat);
      else if (hit.type === "cuisine" && !parsed.cuisines.includes(hit.item)) parsed.cuisines.push(hit.item);
      else if (hit.type === "feature" && !parsed.features.includes(hit.item)) parsed.features.push(hit.item);
      else if (hit.type === "open") parsed.openNow = true;
      i += len;
    } else {
      if (!STOP_WORDS.has(words[i])) parsed.terms.push(words[i]);
      i += 1;
    }
  }
  // A single category word ("bares") picks that tab; several ("cafe y bar") search them all.
  parsed.cat = parsed.cats.size === 1 ? [...parsed.cats][0] : null;
  parsed.active = Boolean(parsed.cats.size || parsed.cuisines.length || parsed.features.length || parsed.openNow || parsed.terms.length);
  return parsed;
}

// Precomputed words for fast matching (called once per place).
export function indexPlace(place) {
  const t = place.tags;
  place.nameWords = fold(place.name).split(/[^a-z0-9ñ]+/).filter(Boolean);
  place.nameFolded = fold(place.name);
  place.otherWords = fold(`${place.kind} ${t.cuisine || ""} ${t["addr:street"] || ""} ${t.brand || ""}`).split(/[^a-z0-9ñ]+/).filter(Boolean);
  place.cuisineValues = fold(t.cuisine || "").split(";").map((v) => v.trim()).filter(Boolean);
}

// Small typo tolerance: compares the typed word with the start of a word in the place's name.
function editDistance(a, b) {
  const dp = Array.from({ length: a.length + 1 }, (_, i) => [i]);
  for (let j = 1; j <= b.length; j++) dp[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    }
  }
  return dp[a.length][b.length];
}

function termScore(term, words, weight) {
  const allowed = term.length >= 7 ? 2 : term.length >= 4 ? 1 : 0;
  let best = 0;
  for (const w of words) {
    if (w === term) best = Math.max(best, 10);
    else if (w.startsWith(term)) best = Math.max(best, 8);
    else if (term.length >= 3 && w.includes(term)) best = Math.max(best, 5);
    else if (allowed && Math.abs(w.length - term.length) <= allowed + 3 &&
      editDistance(term, w.slice(0, term.length + 1)) <= allowed) best = Math.max(best, 4);
    else if (allowed && editDistance(term, w) <= allowed) best = Math.max(best, 4);
  }
  return best * weight;
}

// Returns a score (higher = better match), or 0 if the place doesn't match the search.
export function scorePlace(place, parsed, isOpenNow) {
  if (parsed.cats.size && !parsed.cats.has(place.cat)) return 0;
  if (parsed.openNow && isOpenNow === false) return 0;
  for (const f of parsed.features) if (!f.test(place.tags)) return 0;

  let score = 1;
  if (parsed.cuisines.length) {
    let ok = false;
    for (const c of parsed.cuisines) {
      if (place.cuisineValues.some((v) => c.values.includes(v))) { ok = true; score += 6; }
      else if (c.hints.some((h) => place.nameFolded.includes(h))) { ok = true; score += 5; }
    }
    if (!ok) return 0;
  }
  for (const term of parsed.terms) {
    const s = Math.max(termScore(term, place.nameWords, 1.5), termScore(term, place.otherWords, 0.6));
    if (!s) return 0; // every word typed must match something
    score += s;
  }
  return score;
}

// The "understood" chips shown under the search box, in the current language.
export function chipsFor(parsed, categories) {
  const chips = [];
  for (const cat of parsed.cats) chips.push(`${categories[cat].emoji} ${t(`cat.${cat}.label`)}`);
  for (const c of parsed.cuisines) chips.push(`${c.emoji} ${t(`cuisine.${c.id}`)}`);
  for (const f of parsed.features) chips.push(`${f.emoji} ${t(`feature.${f.id}`)}`);
  if (parsed.openNow) chips.push(`🟢 ${t("ui.openNow")}`);
  if (parsed.terms.length) chips.push(`🔤 “${parsed.terms.join(" ")}”`);
  return chips;
}
