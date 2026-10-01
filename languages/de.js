// Deutsche Texte.
// Neue Sprache hinzufügen: en.js kopieren, die Werte übersetzen und in js/core/i18n.js registrieren.

const inName = (name) => (name ? ` in ${name}` : "");
const seite = (side) => (side === "left" ? "links" : "rechts");
const cap = (s) => (s ? s[0].toUpperCase() + s.slice(1) : "");

export default {
  meta: { name: "Deutsch", short: "DE", locale: "de-DE" },

  app: {
    title: "SpotHop — Cafés, Kneipen, Bars & Restaurants in deiner Nähe",
    description: "Finde Cafés, Kneipen, Bars und Restaurants in deiner Nähe auf einer Live-Karte.",
  },

  ui: {
    findingLocation: "Dein Standort wird gesucht…",
    aroundYou: "In deiner Nähe",
    locationBlocked: "Standort blockiert — erlaube ihn in den Browser-Einstellungen",
    searchPlaceholder: "Probiere „Pizza mit Terrasse“ oder „Bier“…",
    clearSearch: "Suche löschen",
    categories: "Kategorien",
    distance: "Entfernung",
    sort: "Sortieren",
    nearest: "Nächste",
    az: "A–Z",
    openNow: "Jetzt geöffnet",
    searchArea: "🔄 In diesem Bereich suchen",
    myLocation: "Zu meinem Standort",
    liveLocation: "Live-Standort",
    youAreHere: "Du bist hier",
    language: "Sprache",
    lookingFor: "Suche nach",
    saved: "Gespeichert",
    savedTitle: "Deine gespeicherten Orte anzeigen",
    mapLibraryError: "Die Karte konnte nicht geladen werden. Prüfe deine Internetverbindung und lade die Seite neu.",
  },

  cat: {
    coffee: { label: "Kaffee", one: "Café", many: "Cafés" },
    pubs: { label: "Kneipen", one: "Kneipe", many: "Kneipen" },
    bars: { label: "Bars", one: "Bar", many: "Bars" },
    restaurants: { label: "Restaurants", one: "Restaurant", many: "Restaurants" },
    all: { label: "Alle", one: "Ort", many: "Orte" },
  },

  kind: { cafe: "Café", coffeeShop: "Kaffeeladen", pub: "Kneipe", bar: "Bar", restaurant: "Restaurant" },

  feature: {
    cocktails: "Cocktails", realAle: "Craft-Bier", wine: "Wein", liveMusic: "Livemusik", sports: "Sport",
    vegan: "Vegan", vegetarian: "Vegetarisch", glutenFree: "Glutenfrei", terrace: "Terrasse", wifi: "WLAN",
    takeaway: "Zum Mitnehmen", delivery: "Lieferung", bookable: "Reservierbar", accessible: "Barrierefrei", dogFriendly: "Hunde erlaubt",
  },

  cuisine: {
    pizza: "Pizza", italian: "Italienisch", sushi: "Sushi", japanese: "Japanisch", burgers: "Burger", tapas: "Tapas",
    spanish: "Spanisch", canarian: "Kanarisch", chinese: "Chinesisch", asian: "Asiatisch", thai: "Thailändisch", korean: "Koreanisch",
    mexican: "Mexikanisch", indian: "Indisch", kebab: "Kebab", seafood: "Meeresfrüchte", grill: "Grill", chicken: "Hähnchen",
    sandwiches: "Sandwiches", venezuelan: "Venezolanisch", latin: "Lateinamerikanisch", healthy: "Gesund", desserts: "Desserts",
  },

  osmCuisine: {
    italian: "Italienisch", pizza: "Pizza", spanish: "Spanisch", tapas: "Tapas", regional: "Regional", burger: "Burger",
    american: "Amerikanisch", chinese: "Chinesisch", japanese: "Japanisch", sushi: "Sushi", mexican: "Mexikanisch",
    indian: "Indisch", kebab: "Kebab", turkish: "Türkisch", seafood: "Meeresfrüchte", fish: "Fisch", steak_house: "Steakhaus",
    grill: "Grill", chicken: "Hähnchen", sandwich: "Sandwiches", coffee_shop: "Café", cake: "Kuchen", dessert: "Desserts",
    ice_cream: "Eis", breakfast: "Frühstück", international: "International", mediterranean: "Mediterran", asian: "Asiatisch",
    thai: "Thailändisch", vietnamese: "Vietnamesisch", greek: "Griechisch", french: "Französisch", german: "Deutsch",
    vegetarian: "Vegetarisch", vegan: "Vegan", canarian: "Kanarisch", argentinian: "Argentinisch", venezuelan: "Venezolanisch",
  },

  status: {
    lookingFor: "Suche nach {what}…",
    within: "im Umkreis von {distance}",
    backupData: "Ersatzdaten",
    loadingFull: "vollständige Liste wird geladen…",
    openNow: "{n} jetzt geöffnet",
    confirmedLikely: "{confirmed} bestätigt, {likely} wahrscheinlich",
    results: ({ n }) => `${n} Ergebnis${n === 1 ? "" : "se"}`,
    resultsFor: "für „{q}“",
    widerArea: "inklusive größerem Umkreis",
    searchingWider: "Suche „{q}“ in einem größeren Umkreis…",
    saved: ({ n }) => `${n} gespeicherte${n === 1 ? "r Ort" : " Orte"}`,
  },

  empty: {
    serversBusy: "Die Kartenserver sind ausgelastet",
    serversBusyText: "Warte ein paar Sekunden und tippe auf „In diesem Bereich suchen“.",
    noMatchesFor: "Keine Treffer für „{q}“",
    nothingWithin: "Nichts im Umkreis von {distance}.",
    nothingWider: "Auch im größeren Umkreis nichts. Versuche ein anderes Wort.",
    searchWider: "🔭 In größerem Umkreis suchen (10 km)",
    noMatches: "Keine Treffer",
    allClosed: "Alle {many} in der Nähe haben gerade geschlossen.",
    tryDifferent: "Versuche einen anderen Namen oder entferne die Filter.",
    noneHere: "Keine {many} hier gefunden",
    noneHereText: "Wähle eine größere Entfernung oder verschiebe die Karte und tippe auf „In diesem Bereich suchen“.",
    noSaved: "Noch keine gespeicherten Orte",
    noSavedText: "Tippe bei einem Ort auf ♡, um ihn hier zu behalten.",
  },

  hours: {
    closes: ({ day, time }) => `Schließt ${day ? `${day} ` : ""}um ${time}`,
    opens: ({ day, time }) => `Öffnet ${day ? `${day} ` : ""}um ${time}`,
    usuallyCloses: ({ day, time }) => `Schließt meist ${day ? `${day} ` : ""}um ${time}`,
    usuallyOpens: ({ day, time }) => `Öffnet meist ${day ? `${day} ` : ""}um ${time}`,
    open247: "Rund um die Uhr geöffnet",
    today: "Heute",
    open24h: "24 Stunden geöffnet",
    closed: "Geschlossen",
    estimatedNote: "⚠️ Geschätzt nach den üblichen Öffnungszeiten dieser Art von Ort ({kind}) in der Gegend. Dieser Ort hat seine Öffnungszeiten nicht auf OpenStreetMap veröffentlicht.",
    addHours: "Echte Öffnungszeiten eintragen",
    published: "✓ Veröffentlichte Öffnungszeiten",
    estimate: "geschätzt",
    dividerAll: "Keiner dieser Orte veröffentlicht Öffnungszeiten — diese haben um diese Zeit meist geöffnet",
    dividerLikely: "Wahrscheinlich geöffnet — nach üblichen Öffnungszeiten",
  },

  badge: {
    open: "Geöffnet",
    closed: "Geschlossen",
    likelyOpen: "Wohl geöffnet",
    likelyClosed: "Wohl geschlossen",
    estimatedTip: "Geschätzt nach üblichen Öffnungszeiten — dieser Ort hat keine veröffentlicht",
  },

  walk: {
    minutes: "{n} Min. zu Fuß",
    hours: "{h} Std. {m} Min. zu Fuß",
  },

  info: {
    address: "Adresse",
    phone: "Telefon",
    website: "Website",
    email: "E-Mail",
    food: "Küche",
    contact: "Kontakt",
    noContact: "Keine Telefonnummer oder Website angegeben",
    directions: "🧭 Route",
    findPhone: "Telefonnummer online suchen",
    findWebsite: "Website online suchen",
    phoneWord: "Telefon",
    call: "Anrufen",
    save: "Speichern",
    saved: "Gespeichert",
    share: "Teilen",
    linkCopied: "Link kopiert — füge ihn irgendwo ein, um ihn zu teilen",
    shareText: "{name} — gefunden mit SpotHop",
  },

  route: {
    back: "← Zurück zur Liste",
    travelMode: "Verkehrsmittel",
    modes: { foot: "Zu Fuß", bike: "Rad", car: "Auto" },
    finding: "Beste Route wird gesucht…",
    error: "Die Route konnte gerade nicht berechnet werden. Prüfe deine Verbindung und versuche es erneut.",
    retry: "Erneut versuchen",
    arrived: "🎉 Du bist bei {name} angekommen!",
    summary: "{distance} · Ankunft gegen {time}",
    fromLive: "Von deinem Live-Standort — wird unterwegs aktualisiert",
    fromCenter: "Von der Kartenmitte (dein Standort ist nicht verfügbar)",
    duration: { minutes: "{m} Min.", hours: "{h} Std. {m} Min." },
    compass: ["Norden", "Nordosten", "Osten", "Südosten", "Süden", "Südwesten", "Westen", "Nordwesten"],
    turn: {
      left: "links", right: "rechts", "slight left": "leicht links", "slight right": "leicht rechts",
      "sharp left": "scharf links", "sharp right": "scharf rechts", straight: "geradeaus", uturn: "zurück",
    },
    step: {
      depart: ({ dir, name }) => `Starte Richtung ${dir}${name ? ` auf ${name}` : ""}`,
      arrive: ({ place, side }) => `Ankunft bei ${place}${side ? ` (${seite(side)})` : ""}`,
      roundabout: ({ exit, name }) => `Im Kreisverkehr die ${exit}. Ausfahrt nehmen${inName(name)}`,
      fork: ({ side, name }) => (side ? `Halte dich ${seite(side)}${inName(name)}` : `Weiter${inName(name)}`),
      endOfRoad: ({ turn, name }) => `Am Ende der Straße ${turn} abbiegen${inName(name)}`,
      merge: ({ turn, name }) => `${cap(turn)} einfädeln${inName(name)}`,
      continue: ({ turn, name }) => (turn ? `Weiter ${turn}${inName(name)}` : `Weiter${name ? ` auf ${name}` : " geradeaus"}`),
      straight: ({ name }) => `Geradeaus${name ? ` auf ${name}` : ""}`,
      uturn: ({ name }) => `Wenden${inName(name)}`,
      turn: ({ turn, name }) => `${cap(turn)} abbiegen${inName(name)}`,
    },
  },
};
