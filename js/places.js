// Turns raw OpenStreetMap data into the "place" objects shown in the list and on the map.
import { CATEGORIES } from "./config.js";
import { state } from "./state.js";
import { t, has } from "./i18n.js";
import { prettify, safeUrl, splitList, socialUrl } from "./utils.js";
import { openingInfo } from "./hours.js";
import { indexPlace } from "./search.js";

export function categoryOf(tags) {
  if (tags.amenity === "cafe" || tags.shop === "coffee") return "coffee";
  if (tags.amenity === "pub") return "pubs";
  if (tags.amenity === "bar") return "bars";
  if (tags.amenity === "restaurant") return "restaurants";
  return null;
}

export function positionOf(el) {
  const lat = el.lat ?? el.center?.lat;
  const lng = el.lon ?? el.center?.lon;
  return lat == null || lng == null ? null : { lat, lng };
}

function kindLabel(tags) {
  if (tags.shop === "coffee") return t("kind.coffeeShop");
  return { cafe: t("kind.cafe"), pub: t("kind.pub"), bar: t("kind.bar"), restaurant: t("kind.restaurant") }[tags.amenity] || "";
}

function addressOf(tags) {
  const street = [tags["addr:street"], tags["addr:housenumber"]].filter(Boolean).join(" ");
  return [street, tags["addr:city"]].filter(Boolean).join(", ");
}

// "italian;pizza" → "Italian, Pizza" (or "Italiana, Pizza" in Spanish)
function cuisineText(value = "", max = 3) {
  return value.split(";").map((v) => v.trim()).filter(Boolean).slice(0, max)
    .map((v) => (has(`osmCuisine.${v}`) ? t(`osmCuisine.${v}`) : prettify(v))).join(", ");
}

// Category-specific highlights, so a pub, a cocktail bar and a restaurant each show what matters for them.
function highlightsOf(tags) {
  const yes = (k) => tags[k] === "yes" || tags[k] === "only";
  const out = [];
  const add = (emoji, id) => out.push(`${emoji} ${t(`feature.${id}`)}`);
  if (yes("cocktails") || yes("drink:cocktail")) add("🍹", "cocktails");
  if (yes("real_ale") || yes("drink:real_ale")) add("🍺", "realAle");
  if (tags.brewery && tags.brewery !== "various") out.push(`🍺 ${prettify(tags.brewery, 1)}`);
  if (yes("drink:wine") || tags.bar === "wine") add("🍷", "wine");
  if (yes("live_music")) add("🎵", "liveMusic");
  if (tags.sport && tags.amenity !== "restaurant") add("📺", "sports");
  if (yes("diet:vegan")) add("🌱", "vegan");
  else if (yes("diet:vegetarian")) add("🥗", "vegetarian");
  if (yes("diet:gluten_free")) add("🌾", "glutenFree");
  if (yes("outdoor_seating")) add("☀️", "terrace");
  if (tags.internet_access && tags.internet_access !== "no") add("📶", "wifi");
  if (yes("takeaway")) add("🥡", "takeaway");
  if (yes("delivery")) add("🛵", "delivery");
  if (yes("reservation") || tags.reservation === "recommended") add("📅", "bookable");
  if (yes("wheelchair")) add("♿", "accessible");
  if (yes("dog")) add("🐶", "dogFriendly");
  return out;
}

// Only the tags SpotHop uses are saved on the device, which keeps the saved copy small.
export const KEEP_TAGS = ["name", "amenity", "shop", "cuisine", "opening_hours", "addr:street", "addr:housenumber", "addr:city",
  "email", "contact:email", "contact:mobile", "contact:instagram", "contact:facebook", "instagram", "facebook",
  "website", "contact:website", "phone", "contact:phone", "outdoor_seating", "internet_access", "takeaway", "delivery",
  "wheelchair", "diet:vegan", "diet:vegetarian", "diet:gluten_free", "cocktails", "drink:cocktail", "real_ale",
  "drink:real_ale", "brewery", "drink:wine", "bar", "live_music", "sport", "reservation", "dog", "brand"];

// Parsing opening hours is the slowest step, so each place is built once and reused
// (the cache is cleared when the language or the opening-hours data changes).
export function normalize(el) {
  const id = `${el.type}/${el.id}`;
  const cached = state.normCache.get(id);
  if (cached && Date.now() - cached.time < 5 * 60 * 1000) return cached.place;

  const tags = el.tags || {};
  const pos = positionOf(el);
  const cat = categoryOf(tags);
  if (!pos || !tags.name || !cat) return null;

  const kind = kindLabel(tags);
  const { isOpen, text: hoursText, estimated, oh } = openingInfo(tags, cat, pos.lat, pos.lng);
  const place = {
    id,
    osmType: el.type,
    osmId: el.id,
    name: tags.name,
    lat: pos.lat,
    lng: pos.lng,
    tags,
    cat,
    emoji: CATEGORIES[cat].emoji,
    kind,
    cuisine: cuisineText(tags.cuisine),
    fullCuisine: cuisineText(tags.cuisine, 8),
    address: addressOf(tags),
    website: safeUrl(tags.website || tags["contact:website"]),
    phones: splitList(tags.phone || tags["contact:phone"] || tags["contact:mobile"]),
    email: tags.email || tags["contact:email"] || "",
    instagram: socialUrl(tags["contact:instagram"] || tags.instagram, "https://www.instagram.com/"),
    facebook: socialUrl(tags["contact:facebook"] || tags.facebook, "https://www.facebook.com/"),
    isOpen,
    hoursText,
    estimated,
    oh,
    highlights: highlightsOf(tags),
    distance: 0,
  };
  indexPlace(place);
  state.normCache.set(id, { time: Date.now(), place });
  return place;
}
