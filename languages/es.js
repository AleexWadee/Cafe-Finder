// Textos en español.
// Para añadir un idioma: copia en.js, traduce los valores y regístralo en js/core/i18n.js.

const hacia = (name) => (name ? ` hacia ${name}` : "");
const lado = (side) => (side === "left" ? "a la izquierda" : "a la derecha");

export default {
  meta: { name: "Español", short: "ES", locale: "es-ES" },

  app: {
    title: "SpotHop — Cafeterías, pubs, bares y restaurantes cerca de ti",
    description: "Encuentra cafeterías, pubs, bares y restaurantes cerca de ti en un mapa en directo.",
  },

  ui: {
    findingLocation: "Buscando tu ubicación…",
    aroundYou: "Cerca de ti",
    locationBlocked: "Ubicación bloqueada — permítela en los ajustes del navegador",
    searchPlaceholder: "Prueba «pizza con terraza» o «cerveza»…",
    clearSearch: "Borrar búsqueda",
    categories: "Categorías",
    distance: "Distancia",
    sort: "Ordenar",
    nearest: "Cercanía",
    az: "A–Z",
    openNow: "Abierto ahora",
    searchArea: "🔄 Buscar en esta zona",
    myLocation: "Ir a mi ubicación",
    liveLocation: "Ubicación en directo",
    youAreHere: "Estás aquí",
    language: "Idioma",
    lookingFor: "Buscando",
    mapLibraryError: "No se pudo cargar el mapa. Comprueba tu conexión a internet y recarga la página.",
  },

  cat: {
    coffee: { label: "Café", one: "cafetería", many: "cafeterías" },
    pubs: { label: "Pubs", one: "pub", many: "pubs" },
    bars: { label: "Bares", one: "bar", many: "bares" },
    restaurants: { label: "Restaurantes", one: "restaurante", many: "restaurantes" },
    all: { label: "Todo", one: "sitio", many: "sitios" },
  },

  kind: { cafe: "Cafetería", coffeeShop: "Tienda de café", pub: "Pub", bar: "Bar", restaurant: "Restaurante" },

  feature: {
    cocktails: "Cócteles", realAle: "Cerveza artesanal", wine: "Vino", liveMusic: "Música en directo", sports: "Deportes",
    vegan: "Vegano", vegetarian: "Vegetariano", glutenFree: "Sin gluten", terrace: "Terraza", wifi: "Wi-Fi",
    takeaway: "Para llevar", delivery: "A domicilio", bookable: "Con reserva", accessible: "Accesible", dogFriendly: "Admite perros",
  },

  cuisine: {
    pizza: "Pizza", italian: "Italiana", sushi: "Sushi", japanese: "Japonesa", burgers: "Hamburguesas", tapas: "Tapas",
    spanish: "Española", canarian: "Canaria", chinese: "China", asian: "Asiática", thai: "Tailandesa", korean: "Coreana",
    mexican: "Mexicana", indian: "India", kebab: "Kebab", seafood: "Marisco", grill: "Parrilla", chicken: "Pollo",
    sandwiches: "Bocadillos", venezuelan: "Venezolana", latin: "Latina", healthy: "Saludable", desserts: "Postres",
  },

  // Tipos de cocina tal como aparecen en OpenStreetMap
  osmCuisine: {
    italian: "Italiana", pizza: "Pizza", spanish: "Española", tapas: "Tapas", regional: "Regional", burger: "Hamburguesas",
    american: "Americana", chinese: "China", japanese: "Japonesa", sushi: "Sushi", mexican: "Mexicana", indian: "India",
    kebab: "Kebab", turkish: "Turca", seafood: "Marisco", fish: "Pescado", steak_house: "Asador", grill: "Parrilla",
    barbecue: "Barbacoa", chicken: "Pollo", sandwich: "Bocadillos", coffee_shop: "Cafetería", cake: "Tartas",
    dessert: "Postres", ice_cream: "Helados", breakfast: "Desayunos", international: "Internacional",
    mediterranean: "Mediterránea", asian: "Asiática", thai: "Tailandesa", vietnamese: "Vietnamita", korean: "Coreana",
    greek: "Griega", french: "Francesa", argentinian: "Argentina", peruvian: "Peruana", venezuelan: "Venezolana",
    arepa: "Arepas", colombian: "Colombiana", cuban: "Cubana", vegetarian: "Vegetariana", vegan: "Vegana",
    healthy: "Saludable", poke: "Poke", salad: "Ensaladas", canarian: "Canaria", crepe: "Crepes", tea: "Té",
    juice: "Zumos", bubble_tea: "Bubble tea", donut: "Dónuts", pancake: "Tortitas", waffle: "Gofres",
    pastry: "Pastelería", lebanese: "Libanesa", middle_eastern: "Oriente Medio", german: "Alemana", british: "Británica",
    portuguese: "Portuguesa", brazilian: "Brasileña", noodle: "Fideos", ramen: "Ramen", wings: "Alitas",
    fine_dining: "Alta cocina", diner: "Comida casera", local: "Local", galician: "Gallega", basque: "Vasca",
  },

  status: {
    lookingFor: "Buscando {what}…",
    within: "a menos de {distance}",
    backupData: "datos de respaldo",
    loadingFull: "cargando la lista completa…",
    openNow: "{n} abiertos ahora",
    confirmedLikely: "{confirmed} confirmados, {likely} probables",
    results: ({ n }) => `${n} resultado${n === 1 ? "" : "s"}`,
    resultsFor: "para «{q}»",
    widerArea: "incluye una zona más amplia",
    searchingWider: "Buscando «{q}» en una zona más amplia…",
  },

  empty: {
    serversBusy: "Los servidores del mapa están saturados",
    serversBusyText: "Espera unos segundos y pulsa «Buscar en esta zona» para volver a intentarlo.",
    noMatchesFor: "Sin resultados para «{q}»",
    nothingWithin: "Nada a menos de {distance}.",
    nothingWider: "Tampoco hay nada en la zona amplia. Prueba con otra palabra.",
    searchWider: "🔭 Buscar en una zona más amplia (10 km)",
    noMatches: "Sin resultados",
    allClosed: "Todos los {many} cercanos están cerrados ahora.",
    tryDifferent: "Prueba con otro nombre o quita los filtros.",
    noneHere: "No hay {many} aquí",
    noneHereText: "Prueba una distancia mayor, o mueve el mapa y pulsa «Buscar en esta zona».",
  },

  hours: {
    closes: ({ day, time }) => `Cierra ${day ? `el ${day} ` : ""}a las ${time}`,
    opens: ({ day, time }) => `Abre ${day ? `el ${day} ` : ""}a las ${time}`,
    usuallyCloses: ({ day, time }) => `Suele cerrar ${day ? `el ${day} ` : ""}a las ${time}`,
    usuallyOpens: ({ day, time }) => `Suele abrir ${day ? `el ${day} ` : ""}a las ${time}`,
    open247: "Abierto 24/7",
    today: "Hoy",
    open24h: "Abierto 24 horas",
    closed: "Cerrado",
    estimatedNote: "⚠️ Calculado con el horario habitual de este tipo de sitio ({kind}) en la zona. Este sitio no ha publicado su horario en OpenStreetMap.",
    addHours: "Añadir el horario real",
    published: "✓ Horario publicado",
    estimate: "estimado",
    dividerAll: "Ninguno publica su horario — estos suelen estar abiertos a esta hora",
    dividerLikely: "Probablemente abiertos — según el horario habitual",
  },

  badge: {
    open: "Abierto",
    closed: "Cerrado",
    likelyOpen: "Prob. abierto",
    likelyClosed: "Prob. cerrado",
    estimatedTip: "Calculado con el horario habitual — este sitio no ha publicado su horario",
  },

  walk: {
    minutes: "{n} min a pie",
    hours: "{h} h {m} min a pie",
  },

  info: {
    address: "Dirección",
    phone: "Teléfono",
    website: "Web",
    email: "Correo",
    food: "Comida",
    contact: "Contacto",
    noContact: "No tiene teléfono ni web publicados",
    directions: "🧭 Cómo llegar",
  },

  route: {
    back: "← Volver a la lista",
    travelMode: "Medio de transporte",
    modes: { foot: "A pie", bike: "Bici", car: "Coche" },
    finding: "Buscando la mejor ruta…",
    error: "No se pudo calcular la ruta ahora mismo. Comprueba tu conexión y vuelve a intentarlo.",
    retry: "Reintentar",
    arrived: "🎉 ¡Has llegado a {name}!",
    summary: "{distance} · llegada sobre las {time}",
    fromLive: "Desde tu ubicación en directo — se actualiza mientras te mueves",
    fromCenter: "Desde el centro del mapa (tu ubicación no está disponible)",
    duration: { minutes: "{m} min", hours: "{h} h {m} min" },
    compass: ["norte", "noreste", "este", "sureste", "sur", "suroeste", "oeste", "noroeste"],
    turn: {
      left: "a la izquierda", right: "a la derecha",
      "slight left": "ligeramente a la izquierda", "slight right": "ligeramente a la derecha",
      "sharp left": "bruscamente a la izquierda", "sharp right": "bruscamente a la derecha",
      straight: "recto", uturn: "en sentido contrario",
    },
    step: {
      depart: ({ dir, name }) => `Dirígete hacia el ${dir}${name ? ` por ${name}` : ""}`,
      arrive: ({ place, side }) => `Llegas a ${place}${side ? ` (${lado(side).replace("a la", "a tu")})` : ""}`,
      roundabout: ({ exit, name }) => `En la rotonda, toma la ${exit}.ª salida${hacia(name)}`,
      fork: ({ side, name }) => (side ? `Mantente ${lado(side)}${hacia(name)}` : `Continúa${hacia(name)}`),
      endOfRoad: ({ turn, name }) => `Al final de la calle, gira ${turn}${hacia(name)}`,
      merge: ({ turn, name }) => `Incorpórate ${turn}${hacia(name)}`,
      continue: ({ turn, name }) => (turn ? `Continúa ${turn}${hacia(name)}` : `Continúa${name ? ` por ${name}` : " recto"}`),
      straight: ({ name }) => `Sigue recto${name ? ` por ${name}` : ""}`,
      uturn: ({ name }) => `Da la vuelta${hacia(name)}`,
      turn: ({ turn, name }) => `Gira ${turn}${hacia(name)}`,
    },
  },
};
