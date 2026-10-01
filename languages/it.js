// Testi in italiano.
// Per aggiungere una lingua: copia en.js, traduci i valori e registrala in js/core/i18n.js.

const su = (name) => (name ? ` in ${name}` : "");
const lato = (side) => (side === "left" ? "a sinistra" : "a destra");

export default {
  meta: { name: "Italiano", short: "IT", locale: "it-IT" },

  app: {
    title: "SpotHop — Caffè, pub, bar e ristoranti vicino a te",
    description: "Trova caffè, pub, bar e ristoranti vicino a te su una mappa in tempo reale.",
  },

  ui: {
    findingLocation: "Ricerca della tua posizione…",
    aroundYou: "Vicino a te",
    locationBlocked: "Posizione bloccata — consentila nelle impostazioni del browser",
    searchPlaceholder: "Prova «pizza con terrazza» o «birra»…",
    clearSearch: "Cancella ricerca",
    categories: "Categorie",
    distance: "Distanza",
    sort: "Ordina",
    nearest: "Più vicini",
    az: "A–Z",
    openNow: "Aperto ora",
    searchArea: "🔄 Cerca in questa zona",
    myLocation: "Vai alla mia posizione",
    liveLocation: "Posizione in tempo reale",
    youAreHere: "Sei qui",
    language: "Lingua",
    lookingFor: "Cerco",
    saved: "Salvati",
    savedTitle: "Mostra i luoghi salvati",
    mapLibraryError: "Impossibile caricare la mappa. Controlla la connessione e ricarica la pagina.",
  },

  cat: {
    coffee: { label: "Caffè", one: "caffè", many: "caffè" },
    pubs: { label: "Pub", one: "pub", many: "pub" },
    bars: { label: "Bar", one: "bar", many: "bar" },
    restaurants: { label: "Ristoranti", one: "ristorante", many: "ristoranti" },
    all: { label: "Tutto", one: "posto", many: "posti" },
  },

  kind: { cafe: "Caffè", coffeeShop: "Torrefazione", pub: "Pub", bar: "Bar", restaurant: "Ristorante" },

  feature: {
    cocktails: "Cocktail", realAle: "Birra artigianale", wine: "Vino", liveMusic: "Musica dal vivo", sports: "Sport",
    vegan: "Vegano", vegetarian: "Vegetariano", glutenFree: "Senza glutine", terrace: "Terrazza", wifi: "Wi-Fi",
    takeaway: "Da asporto", delivery: "Consegna", bookable: "Prenotabile", accessible: "Accessibile", dogFriendly: "Cani ammessi",
  },

  cuisine: {
    pizza: "Pizza", italian: "Italiana", sushi: "Sushi", japanese: "Giapponese", burgers: "Hamburger", tapas: "Tapas",
    spanish: "Spagnola", canarian: "Canaria", chinese: "Cinese", asian: "Asiatica", thai: "Thailandese", korean: "Coreana",
    mexican: "Messicana", indian: "Indiana", kebab: "Kebab", seafood: "Pesce", grill: "Griglia", chicken: "Pollo",
    sandwiches: "Panini", venezuelan: "Venezuelana", latin: "Latina", healthy: "Salutare", desserts: "Dolci",
  },

  osmCuisine: {
    italian: "Italiana", pizza: "Pizza", spanish: "Spagnola", tapas: "Tapas", regional: "Regionale", burger: "Hamburger",
    american: "Americana", chinese: "Cinese", japanese: "Giapponese", sushi: "Sushi", mexican: "Messicana",
    indian: "Indiana", kebab: "Kebab", turkish: "Turca", seafood: "Frutti di mare", fish: "Pesce", steak_house: "Steakhouse",
    grill: "Griglia", chicken: "Pollo", sandwich: "Panini", coffee_shop: "Caffè", cake: "Torte", dessert: "Dolci",
    ice_cream: "Gelato", breakfast: "Colazione", international: "Internazionale", mediterranean: "Mediterranea",
    asian: "Asiatica", thai: "Thailandese", vietnamese: "Vietnamita", greek: "Greca", french: "Francese",
    vegetarian: "Vegetariana", vegan: "Vegana", canarian: "Canaria", argentinian: "Argentina", venezuelan: "Venezuelana",
  },

  status: {
    lookingFor: "Cerco {what}…",
    within: "entro {distance}",
    backupData: "dati di riserva",
    loadingFull: "caricamento dell'elenco completo…",
    openNow: ({ n }) => `${n} apert${n === 1 ? "o" : "i"} ora`,
    confirmedLikely: "{confirmed} confermati, {likely} probabili",
    results: ({ n }) => `${n} risultat${n === 1 ? "o" : "i"}`,
    resultsFor: "per «{q}»",
    widerArea: "inclusa una zona più ampia",
    searchingWider: "Cerco «{q}» in una zona più ampia…",
    saved: ({ n }) => `${n} post${n === 1 ? "o salvato" : "i salvati"}`,
  },

  empty: {
    serversBusy: "I server della mappa sono sovraccarichi",
    serversBusyText: "Attendi qualche secondo e tocca «Cerca in questa zona».",
    noMatchesFor: "Nessun risultato per «{q}»",
    nothingWithin: "Niente entro {distance}.",
    nothingWider: "Niente nemmeno nella zona più ampia. Prova con un'altra parola.",
    searchWider: "🔭 Cerca in una zona più ampia (10 km)",
    noMatches: "Nessun risultato",
    allClosed: "Tutti i {many} vicini sono chiusi in questo momento.",
    tryDifferent: "Prova con un altro nome o togli i filtri.",
    noneHere: "Nessun {one} trovato qui",
    noneHereText: "Prova una distanza maggiore, oppure sposta la mappa e tocca «Cerca in questa zona».",
    noSaved: "Nessun posto salvato",
    noSavedText: "Tocca ♡ su un posto per tenerlo qui.",
  },

  hours: {
    closes: ({ day, time }) => `Chiude ${day ? `${day} ` : ""}alle ${time}`,
    opens: ({ day, time }) => `Apre ${day ? `${day} ` : ""}alle ${time}`,
    usuallyCloses: ({ day, time }) => `Di solito chiude ${day ? `${day} ` : ""}alle ${time}`,
    usuallyOpens: ({ day, time }) => `Di solito apre ${day ? `${day} ` : ""}alle ${time}`,
    open247: "Aperto 24/7",
    today: "Oggi",
    open24h: "Aperto 24 ore",
    closed: "Chiuso",
    estimatedNote: "⚠️ Stimato in base agli orari abituali di questo tipo di locale ({kind}) in zona. Questo posto non ha pubblicato i suoi orari su OpenStreetMap.",
    addHours: "Aggiungi gli orari reali",
    published: "✓ Orari pubblicati",
    estimate: "stima",
    dividerAll: "Nessuno pubblica gli orari — questi di solito sono aperti a quest'ora",
    dividerLikely: "Probabilmente aperti — in base agli orari abituali",
  },

  badge: {
    open: "Aperto",
    closed: "Chiuso",
    likelyOpen: "Prob. aperto",
    likelyClosed: "Prob. chiuso",
    estimatedTip: "Stimato in base agli orari abituali — questo posto non ha pubblicato i suoi orari",
  },

  walk: {
    minutes: "{n} min a piedi",
    hours: "{h} h {m} min a piedi",
  },

  info: {
    address: "Indirizzo",
    phone: "Telefono",
    website: "Sito web",
    email: "Email",
    food: "Cucina",
    contact: "Contatti",
    noContact: "Nessun telefono o sito web indicato",
    directions: "🧭 Indicazioni",
    findPhone: "Cerca il numero di telefono online",
    findWebsite: "Cerca il sito web online",
    phoneWord: "telefono",
    call: "Chiama",
    save: "Salva",
    saved: "Salvato",
    share: "Condividi",
    linkCopied: "Link copiato — incollalo dove vuoi per condividerlo",
    shareText: "{name} — trovato con SpotHop",
  },

  route: {
    back: "← Torna all'elenco",
    travelMode: "Mezzo di trasporto",
    modes: { foot: "A piedi", bike: "Bici", car: "Auto" },
    finding: "Ricerca del percorso migliore…",
    error: "Impossibile calcolare il percorso ora. Controlla la connessione e riprova.",
    retry: "Riprova",
    arrived: "🎉 Sei arrivato a {name}!",
    summary: "{distance} · arrivo verso le {time}",
    fromLive: "Dalla tua posizione in tempo reale — si aggiorna mentre ti sposti",
    fromCenter: "Dal centro della mappa (la tua posizione non è disponibile)",
    duration: { minutes: "{m} min", hours: "{h} h {m} min" },
    compass: ["nord", "nord-est", "est", "sud-est", "sud", "sud-ovest", "ovest", "nord-ovest"],
    turn: {
      left: "a sinistra", right: "a destra", "slight left": "leggermente a sinistra", "slight right": "leggermente a destra",
      "sharp left": "bruscamente a sinistra", "sharp right": "bruscamente a destra", straight: "dritto", uturn: "indietro",
    },
    step: {
      depart: ({ dir, name }) => `Dirigiti verso ${dir}${name ? ` su ${name}` : ""}`,
      arrive: ({ place, side }) => `Sei arrivato a ${place}${side ? ` (${lato(side)})` : ""}`,
      roundabout: ({ exit, name }) => `Alla rotonda, prendi la ${exit}ª uscita${su(name)}`,
      fork: ({ side, name }) => (side ? `Tieni la ${side === "left" ? "sinistra" : "destra"}${su(name)}` : `Continua${su(name)}`),
      endOfRoad: ({ turn, name }) => `Alla fine della strada, gira ${turn}${su(name)}`,
      merge: ({ turn, name }) => `Immettiti ${turn}${su(name)}`,
      continue: ({ turn, name }) => (turn ? `Continua ${turn}${su(name)}` : `Continua${name ? ` su ${name}` : " dritto"}`),
      straight: ({ name }) => `Prosegui dritto${name ? ` su ${name}` : ""}`,
      uturn: ({ name }) => `Fai inversione a U${su(name)}`,
      turn: ({ turn, name }) => `Gira ${turn}${su(name)}`,
    },
  },
};
