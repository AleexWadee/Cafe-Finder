// Textes en français.
// Pour ajouter une langue : copiez en.js, traduisez les valeurs et enregistrez-la dans js/core/i18n.js.

const sur = (name) => (name ? ` sur ${name}` : "");
const cote = (side) => (side === "left" ? "à gauche" : "à droite");
const vers = (dir) => (/^[aeiou]/.test(dir) ? `l'${dir}` : `le ${dir}`);

export default {
  meta: { name: "Français", short: "FR", locale: "fr-FR" },

  app: {
    title: "SpotHop — Cafés, pubs, bars et restaurants près de vous",
    description: "Trouvez des cafés, pubs, bars et restaurants près de vous sur une carte en direct.",
  },

  ui: {
    findingLocation: "Recherche de votre position…",
    aroundYou: "Près de vous",
    locationBlocked: "Position bloquée — autorisez-la dans les réglages du navigateur",
    searchPlaceholder: "Essayez « pizza en terrasse » ou « bière »…",
    clearSearch: "Effacer la recherche",
    categories: "Catégories",
    distance: "Distance",
    sort: "Trier",
    nearest: "Plus proches",
    az: "A–Z",
    openNow: "Ouvert maintenant",
    searchArea: "🔄 Chercher dans cette zone",
    myLocation: "Aller à ma position",
    liveLocation: "Position en direct",
    youAreHere: "Vous êtes ici",
    language: "Langue",
    lookingFor: "Recherche",
    saved: "Favoris",
    savedTitle: "Afficher vos lieux enregistrés",
    mapLibraryError: "Impossible de charger la carte. Vérifiez votre connexion internet et rechargez la page.",
  },

  cat: {
    coffee: { label: "Café", one: "café", many: "cafés" },
    pubs: { label: "Pubs", one: "pub", many: "pubs" },
    bars: { label: "Bars", one: "bar", many: "bars" },
    restaurants: { label: "Restaurants", one: "restaurant", many: "restaurants" },
    all: { label: "Tout", one: "lieu", many: "lieux" },
  },

  kind: { cafe: "Café", coffeeShop: "Torréfacteur", pub: "Pub", bar: "Bar", restaurant: "Restaurant" },

  feature: {
    cocktails: "Cocktails", realAle: "Bière artisanale", wine: "Vin", liveMusic: "Musique live", sports: "Sport",
    vegan: "Végan", vegetarian: "Végétarien", glutenFree: "Sans gluten", terrace: "Terrasse", wifi: "Wi-Fi",
    takeaway: "À emporter", delivery: "Livraison", bookable: "Réservable", accessible: "Accessible", dogFriendly: "Chiens acceptés",
  },

  cuisine: {
    pizza: "Pizza", italian: "Italienne", sushi: "Sushi", japanese: "Japonaise", burgers: "Burgers", tapas: "Tapas",
    spanish: "Espagnole", canarian: "Canarienne", chinese: "Chinoise", asian: "Asiatique", thai: "Thaïe", korean: "Coréenne",
    mexican: "Mexicaine", indian: "Indienne", kebab: "Kebab", seafood: "Fruits de mer", grill: "Grill", chicken: "Poulet",
    sandwiches: "Sandwichs", venezuelan: "Vénézuélienne", latin: "Latino", healthy: "Healthy", desserts: "Desserts",
  },

  osmCuisine: {
    italian: "Italienne", pizza: "Pizza", spanish: "Espagnole", tapas: "Tapas", regional: "Régionale", burger: "Burgers",
    american: "Américaine", chinese: "Chinoise", japanese: "Japonaise", sushi: "Sushi", mexican: "Mexicaine",
    indian: "Indienne", kebab: "Kebab", turkish: "Turque", seafood: "Fruits de mer", fish: "Poisson", steak_house: "Grill",
    grill: "Grill", chicken: "Poulet", sandwich: "Sandwichs", coffee_shop: "Café", cake: "Gâteaux", dessert: "Desserts",
    ice_cream: "Glaces", breakfast: "Petit-déjeuner", international: "Internationale", mediterranean: "Méditerranéenne",
    asian: "Asiatique", thai: "Thaïe", vietnamese: "Vietnamienne", greek: "Grecque", french: "Française", crepe: "Crêpes",
    vegetarian: "Végétarienne", vegan: "Végane", canarian: "Canarienne", argentinian: "Argentine", venezuelan: "Vénézuélienne",
  },

  status: {
    lookingFor: "Recherche de {what}…",
    within: "à moins de {distance}",
    backupData: "données de secours",
    loadingFull: "chargement de la liste complète…",
    openNow: ({ n }) => `${n} ouvert${n === 1 ? "" : "s"} maintenant`,
    confirmedLikely: "{confirmed} confirmés, {likely} probables",
    results: ({ n }) => `${n} résultat${n === 1 ? "" : "s"}`,
    resultsFor: "pour « {q} »",
    widerArea: "zone élargie incluse",
    searchingWider: "Recherche de « {q} » dans une zone plus large…",
    saved: ({ n }) => `${n} lieu${n === 1 ? "" : "x"} enregistré${n === 1 ? "" : "s"}`,
  },

  empty: {
    serversBusy: "Les serveurs de la carte sont saturés",
    serversBusyText: "Attendez quelques secondes et touchez « Chercher dans cette zone ».",
    noMatchesFor: "Aucun résultat pour « {q} »",
    nothingWithin: "Rien à moins de {distance}.",
    nothingWider: "Rien non plus dans la zone élargie. Essayez un autre mot.",
    searchWider: "🔭 Chercher dans une zone plus large (10 km)",
    noMatches: "Aucun résultat",
    allClosed: "Tous les {many} à proximité sont fermés pour le moment.",
    tryDifferent: "Essayez un autre nom ou retirez les filtres.",
    noneHere: "Aucun {one} trouvé ici",
    noneHereText: "Augmentez la distance, ou déplacez la carte et touchez « Chercher dans cette zone ».",
    noSaved: "Aucun lieu enregistré pour l'instant",
    noSavedText: "Touchez ♡ sur un lieu pour le garder ici.",
  },

  hours: {
    closes: ({ day, time }) => `Ferme ${day ? `${day} ` : ""}à ${time}`,
    opens: ({ day, time }) => `Ouvre ${day ? `${day} ` : ""}à ${time}`,
    usuallyCloses: ({ day, time }) => `Ferme en général ${day ? `${day} ` : ""}à ${time}`,
    usuallyOpens: ({ day, time }) => `Ouvre en général ${day ? `${day} ` : ""}à ${time}`,
    open247: "Ouvert 24h/24, 7j/7",
    today: "Aujourd'hui",
    open24h: "Ouvert 24 h/24",
    closed: "Fermé",
    estimatedNote: "⚠️ Estimé d'après les horaires habituels de ce type de lieu ({kind}) dans le quartier. Ce lieu n'a pas publié ses horaires sur OpenStreetMap.",
    addHours: "Ajouter les vrais horaires",
    published: "✓ Horaires publiés",
    estimate: "estimé",
    dividerAll: "Aucun ne publie ses horaires — ceux-ci sont en général ouverts à cette heure",
    dividerLikely: "Probablement ouverts — d'après les horaires habituels",
  },

  badge: {
    open: "Ouvert",
    closed: "Fermé",
    likelyOpen: "Prob. ouvert",
    likelyClosed: "Prob. fermé",
    estimatedTip: "Estimé d'après les horaires habituels — ce lieu n'a pas publié ses horaires",
  },

  walk: {
    minutes: "{n} min à pied",
    hours: "{h} h {m} min à pied",
  },

  info: {
    address: "Adresse",
    phone: "Téléphone",
    website: "Site web",
    email: "E-mail",
    food: "Cuisine",
    contact: "Contact",
    noContact: "Aucun téléphone ni site web indiqué",
    directions: "🧭 Itinéraire",
    findPhone: "Chercher le numéro en ligne",
    phoneWord: "téléphone",
    call: "Appeler",
    save: "Enregistrer",
    saved: "Enregistré",
    share: "Partager",
    linkCopied: "Lien copié — collez-le où vous voulez pour le partager",
    shareText: "{name} — trouvé avec SpotHop",
  },

  route: {
    back: "← Retour à la liste",
    travelMode: "Mode de déplacement",
    modes: { foot: "À pied", bike: "Vélo", car: "Voiture" },
    finding: "Recherche du meilleur itinéraire…",
    error: "Impossible de calculer l'itinéraire pour le moment. Vérifiez votre connexion et réessayez.",
    retry: "Réessayer",
    arrived: "🎉 Vous êtes arrivé à {name} !",
    summary: "{distance} · arrivée vers {time}",
    fromLive: "Depuis votre position en direct — mis à jour pendant le trajet",
    fromCenter: "Depuis le centre de la carte (votre position n'est pas disponible)",
    duration: { minutes: "{m} min", hours: "{h} h {m} min" },
    compass: ["nord", "nord-est", "est", "sud-est", "sud", "sud-ouest", "ouest", "nord-ouest"],
    turn: {
      left: "à gauche", right: "à droite", "slight left": "légèrement à gauche", "slight right": "légèrement à droite",
      "sharp left": "franchement à gauche", "sharp right": "franchement à droite", straight: "tout droit", uturn: "en arrière",
    },
    step: {
      depart: ({ dir, name }) => `Partez vers ${vers(dir)}${sur(name)}`,
      arrive: ({ place, side }) => `Vous êtes arrivé à ${place}${side ? ` (${cote(side)})` : ""}`,
      roundabout: ({ exit, name }) => `Au rond-point, prenez la ${exit === 1 ? "1re" : `${exit}e`} sortie${sur(name)}`,
      fork: ({ side, name }) => (side ? `Restez ${cote(side)}${sur(name)}` : `Continuez${sur(name)}`),
      endOfRoad: ({ turn, name }) => `Au bout de la rue, tournez ${turn}${sur(name)}`,
      merge: ({ turn, name }) => `Insérez-vous ${turn}${sur(name)}`,
      continue: ({ turn, name }) => (turn ? `Continuez ${turn}${sur(name)}` : `Continuez${name ? ` sur ${name}` : " tout droit"}`),
      straight: ({ name }) => `Allez tout droit${sur(name)}`,
      uturn: ({ name }) => `Faites demi-tour${sur(name)}`,
      turn: ({ turn, name }) => `Tournez ${turn}${sur(name)}`,
    },
  },
};
