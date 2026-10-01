// English texts.
// To add a language: copy this file (e.g. fr.js), translate the values and register it in js/core/i18n.js.
// Values can be plain text with {placeholders}, or small functions when the wording depends on the values.

const onto = (name) => (name ? ` onto ${name}` : "");
const ordinal = (n) => n + (["th", "st", "nd", "rd"][(n % 100 - 20) % 10] || ["th", "st", "nd", "rd"][n % 100] || "th");

export default {
  meta: { name: "English", short: "EN", locale: "en-GB" },

  app: {
    title: "SpotHop — Cafés, Pubs, Bars & Restaurants Near You",
    description: "Find coffee places, pubs, bars and restaurants near you on a live map.",
  },

  ui: {
    findingLocation: "Finding your location…",
    aroundYou: "Around you",
    locationBlocked: "Location blocked — allow it in your browser settings",
    searchPlaceholder: "Try “pizza with terrace” or “beer”…",
    clearSearch: "Clear search",
    categories: "Categories",
    distance: "Distance",
    sort: "Sort",
    nearest: "Nearest",
    az: "A–Z",
    openNow: "Open now",
    searchArea: "🔄 Search this area",
    myLocation: "Go to my location",
    liveLocation: "Live location",
    youAreHere: "You are here",
    language: "Language",
    lookingFor: "Looking for",
    saved: "Saved",
    savedTitle: "Show your saved places",
    mapLibraryError: "Couldn't load the map library. Check your internet connection and reload.",
  },

  cat: {
    coffee: { label: "Coffee", one: "coffee spot", many: "coffee spots" },
    pubs: { label: "Pubs", one: "pub", many: "pubs" },
    bars: { label: "Bars", one: "bar", many: "bars" },
    restaurants: { label: "Restaurants", one: "restaurant", many: "restaurants" },
    all: { label: "All", one: "place", many: "places" },
  },

  kind: { cafe: "Café", coffeeShop: "Coffee shop", pub: "Pub", bar: "Bar", restaurant: "Restaurant" },

  feature: {
    cocktails: "Cocktails", realAle: "Real ale", wine: "Wine", liveMusic: "Live music", sports: "Sports",
    vegan: "Vegan", vegetarian: "Vegetarian", glutenFree: "Gluten-free", terrace: "Terrace", wifi: "Wi-Fi",
    takeaway: "Takeaway", delivery: "Delivery", bookable: "Bookable", accessible: "Accessible", dogFriendly: "Dog friendly",
  },

  // Food types the search understands
  cuisine: {
    pizza: "Pizza", italian: "Italian", sushi: "Sushi", japanese: "Japanese", burgers: "Burgers", tapas: "Tapas",
    spanish: "Spanish", canarian: "Canarian", chinese: "Chinese", asian: "Asian", thai: "Thai", korean: "Korean",
    mexican: "Mexican", indian: "Indian", kebab: "Kebab", seafood: "Seafood", grill: "Grill", chicken: "Chicken",
    sandwiches: "Sandwiches", venezuelan: "Venezuelan", latin: "Latin", healthy: "Healthy", desserts: "Desserts",
  },

  // OpenStreetMap cuisine values; anything not listed is shown as written ("steak_house" → "Steak house")
  osmCuisine: {},

  status: {
    lookingFor: "Looking for {what}…",
    within: "within {distance}",
    backupData: "backup data",
    loadingFull: "loading the full list…",
    openNow: "{n} open now",
    confirmedLikely: "{confirmed} confirmed, {likely} likely",
    results: ({ n }) => `${n} result${n === 1 ? "" : "s"}`,
    resultsFor: "for “{q}”",
    widerArea: "including a wider area",
    searchingWider: "Searching a wider area for “{q}”…",
    saved: ({ n }) => `${n} saved place${n === 1 ? "" : "s"}`,
  },

  empty: {
    serversBusy: "Map data servers are busy",
    serversBusyText: "Wait a few seconds and tap “Search this area” to try again.",
    noMatchesFor: "No matches for “{q}”",
    nothingWithin: "Nothing within {distance}.",
    nothingWider: "Nothing in the wider area either. Try another word.",
    searchWider: "🔭 Search a wider area (10 km)",
    noMatches: "No matches",
    allClosed: "All the {many} nearby are closed right now.",
    tryDifferent: "Try a different name or clear the filters.",
    noneHere: "No {many} found here",
    noneHereText: "Try a bigger distance, or drag the map and tap “Search this area”.",
    noSaved: "No saved places yet",
    noSavedText: "Tap ♡ on a place to keep it here.",
  },

  hours: {
    closes: ({ day, time }) => `Closes ${day ? `${day} ` : ""}${time}`,
    opens: ({ day, time }) => `Opens ${day ? `${day} ` : ""}${time}`,
    usuallyCloses: ({ day, time }) => `Usually closes ${day ? `${day} ` : ""}${time}`,
    usuallyOpens: ({ day, time }) => `Usually opens ${day ? `${day} ` : ""}${time}`,
    open247: "Open 24/7",
    today: "Today",
    open24h: "Open 24 hours",
    closed: "Closed",
    estimatedNote: "⚠️ Estimated from typical hours for a {kind} here. This place hasn't published its hours on OpenStreetMap.",
    addHours: "Add the real hours",
    published: "✓ Published opening hours",
    estimate: "estimate",
    dividerAll: "None of these publish their hours — these are usually open at this time",
    dividerLikely: "Likely open — based on typical hours",
  },

  badge: {
    open: "Open",
    closed: "Closed",
    likelyOpen: "Likely open",
    likelyClosed: "Likely closed",
    estimatedTip: "Estimated from typical hours — this place hasn't published its hours",
  },

  walk: {
    minutes: "{n} min walk",
    hours: "{h} h {m} min walk",
  },

  info: {
    address: "Address",
    phone: "Phone",
    website: "Website",
    email: "Email",
    food: "Food",
    contact: "Contact",
    noContact: "No phone or website listed",
    directions: "🧭 Directions",
    findPhone: "Find the phone number online",
    findWebsite: "Find the website online",
    phoneWord: "phone",
    call: "Call",
    save: "Save",
    saved: "Saved",
    share: "Share",
    linkCopied: "Link copied — paste it anywhere to share",
    shareText: "{name} — found with SpotHop",
  },

  route: {
    back: "← Back to list",
    travelMode: "Travel mode",
    modes: { foot: "Walk", bike: "Bike", car: "Car" },
    finding: "Finding the best route…",
    error: "Couldn't calculate a route right now. Check your connection and try again.",
    retry: "Try again",
    arrived: "🎉 You've arrived at {name}!",
    summary: "{distance} · arrive around {time}",
    fromLive: "From your live location — updates as you move",
    fromCenter: "From the map center (your location isn't available)",
    duration: { minutes: "{m} min", hours: "{h} h {m} min" },
    compass: ["north", "northeast", "east", "southeast", "south", "southwest", "west", "northwest"],
    turn: {
      left: "left", right: "right", "slight left": "slightly left", "slight right": "slightly right",
      "sharp left": "sharp left", "sharp right": "sharp right", straight: "straight", uturn: "around",
    },
    step: {
      depart: ({ dir, name }) => `Head ${dir}${name ? ` on ${name}` : ""}`,
      arrive: ({ place, side }) => `Arrive at ${place}${side ? ` (on your ${side})` : ""}`,
      roundabout: ({ exit, name }) => `At the roundabout, take the ${ordinal(exit)} exit${onto(name)}`,
      fork: ({ side, name }) => (side ? `Keep ${side}${onto(name)}` : `Continue${onto(name)}`),
      endOfRoad: ({ turn, name }) => `At the end of the road, turn ${turn}${onto(name)}`,
      merge: ({ turn, name }) => `Merge ${turn}${onto(name)}`,
      continue: ({ turn, name }) => (turn ? `Continue ${turn}${onto(name)}` : `Continue${name ? ` on ${name}` : " straight"}`),
      straight: ({ name }) => `Go straight${onto(name)}`,
      uturn: ({ name }) => `Make a U-turn${onto(name)}`,
      turn: ({ turn, name }) => `Turn ${turn}${onto(name)}`,
    },
  },
};
