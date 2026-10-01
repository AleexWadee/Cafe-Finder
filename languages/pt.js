// Textos em português.
// Para adicionar um idioma: copie en.js, traduza os valores e registe-o em js/core/i18n.js.

const para = (name) => (name ? ` para ${name}` : "");
const lado = (side) => (side === "left" ? "à esquerda" : "à direita");

export default {
  meta: { name: "Português", short: "PT", locale: "pt-PT" },

  app: {
    title: "SpotHop — Cafés, pubs, bares e restaurantes perto de si",
    description: "Encontre cafés, pubs, bares e restaurantes perto de si num mapa em tempo real.",
  },

  ui: {
    findingLocation: "A procurar a sua localização…",
    aroundYou: "Perto de si",
    locationBlocked: "Localização bloqueada — permita-a nas definições do navegador",
    searchPlaceholder: "Experimente «pizza com esplanada» ou «cerveja»…",
    clearSearch: "Limpar pesquisa",
    categories: "Categorias",
    distance: "Distância",
    sort: "Ordenar",
    nearest: "Mais perto",
    az: "A–Z",
    openNow: "Aberto agora",
    searchArea: "🔄 Pesquisar nesta zona",
    myLocation: "Ir para a minha localização",
    liveLocation: "Localização em tempo real",
    youAreHere: "Está aqui",
    language: "Idioma",
    lookingFor: "A procurar",
    saved: "Guardados",
    savedTitle: "Ver os seus locais guardados",
    mapLibraryError: "Não foi possível carregar o mapa. Verifique a ligação à internet e recarregue a página.",
  },

  cat: {
    coffee: { label: "Café", one: "café", many: "cafés" },
    pubs: { label: "Pubs", one: "pub", many: "pubs" },
    bars: { label: "Bares", one: "bar", many: "bares" },
    restaurants: { label: "Restaurantes", one: "restaurante", many: "restaurantes" },
    all: { label: "Tudo", one: "local", many: "locais" },
  },

  kind: { cafe: "Café", coffeeShop: "Loja de café", pub: "Pub", bar: "Bar", restaurant: "Restaurante" },

  feature: {
    cocktails: "Cocktails", realAle: "Cerveja artesanal", wine: "Vinho", liveMusic: "Música ao vivo", sports: "Desporto",
    vegan: "Vegano", vegetarian: "Vegetariano", glutenFree: "Sem glúten", terrace: "Esplanada", wifi: "Wi-Fi",
    takeaway: "Take-away", delivery: "Entrega", bookable: "Com reserva", accessible: "Acessível", dogFriendly: "Aceita cães",
  },

  cuisine: {
    pizza: "Pizza", italian: "Italiana", sushi: "Sushi", japanese: "Japonesa", burgers: "Hambúrgueres", tapas: "Tapas",
    spanish: "Espanhola", canarian: "Canária", chinese: "Chinesa", asian: "Asiática", thai: "Tailandesa", korean: "Coreana",
    mexican: "Mexicana", indian: "Indiana", kebab: "Kebab", seafood: "Marisco", grill: "Grelhados", chicken: "Frango",
    sandwiches: "Sandes", venezuelan: "Venezuelana", latin: "Latina", healthy: "Saudável", desserts: "Sobremesas",
  },

  osmCuisine: {
    italian: "Italiana", pizza: "Pizza", spanish: "Espanhola", tapas: "Tapas", regional: "Regional", burger: "Hambúrgueres",
    american: "Americana", chinese: "Chinesa", japanese: "Japonesa", sushi: "Sushi", mexican: "Mexicana",
    indian: "Indiana", kebab: "Kebab", turkish: "Turca", seafood: "Marisco", fish: "Peixe", steak_house: "Churrasqueira",
    grill: "Grelhados", chicken: "Frango", sandwich: "Sandes", coffee_shop: "Café", cake: "Bolos", dessert: "Sobremesas",
    ice_cream: "Gelados", breakfast: "Pequeno-almoço", international: "Internacional", mediterranean: "Mediterrânica",
    asian: "Asiática", thai: "Tailandesa", vietnamese: "Vietnamita", greek: "Grega", french: "Francesa", portuguese: "Portuguesa",
    vegetarian: "Vegetariana", vegan: "Vegana", canarian: "Canária", argentinian: "Argentina", brazilian: "Brasileira",
  },

  status: {
    lookingFor: "A procurar {what}…",
    within: "a menos de {distance}",
    backupData: "dados de reserva",
    loadingFull: "a carregar a lista completa…",
    openNow: ({ n }) => `${n} abert${n === 1 ? "o" : "os"} agora`,
    confirmedLikely: "{confirmed} confirmados, {likely} prováveis",
    results: ({ n }) => `${n} resultado${n === 1 ? "" : "s"}`,
    resultsFor: "para «{q}»",
    widerArea: "inclui uma zona mais ampla",
    searchingWider: "A procurar «{q}» numa zona mais ampla…",
    saved: ({ n }) => `${n} loca${n === 1 ? "l guardado" : "is guardados"}`,
  },

  empty: {
    serversBusy: "Os servidores do mapa estão sobrecarregados",
    serversBusyText: "Aguarde uns segundos e toque em «Pesquisar nesta zona».",
    noMatchesFor: "Sem resultados para «{q}»",
    nothingWithin: "Nada a menos de {distance}.",
    nothingWider: "Também não há nada na zona mais ampla. Experimente outra palavra.",
    searchWider: "🔭 Pesquisar numa zona mais ampla (10 km)",
    noMatches: "Sem resultados",
    allClosed: "Todos os {many} próximos estão fechados agora.",
    tryDifferent: "Experimente outro nome ou retire os filtros.",
    noneHere: "Não há {many} aqui",
    noneHereText: "Experimente uma distância maior, ou mova o mapa e toque em «Pesquisar nesta zona».",
    noSaved: "Ainda não guardou nenhum local",
    noSavedText: "Toque em ♡ num local para o guardar aqui.",
  },

  hours: {
    closes: ({ day, time }) => `Fecha ${day ? `${day} ` : ""}às ${time}`,
    opens: ({ day, time }) => `Abre ${day ? `${day} ` : ""}às ${time}`,
    usuallyCloses: ({ day, time }) => `Costuma fechar ${day ? `${day} ` : ""}às ${time}`,
    usuallyOpens: ({ day, time }) => `Costuma abrir ${day ? `${day} ` : ""}às ${time}`,
    open247: "Aberto 24/7",
    today: "Hoje",
    open24h: "Aberto 24 horas",
    closed: "Fechado",
    estimatedNote: "⚠️ Estimado com base no horário habitual deste tipo de local ({kind}) na zona. Este local não publicou o horário no OpenStreetMap.",
    addHours: "Adicionar o horário real",
    published: "✓ Horário publicado",
    estimate: "estimativa",
    dividerAll: "Nenhum publica o horário — estes costumam estar abertos a esta hora",
    dividerLikely: "Provavelmente abertos — segundo o horário habitual",
  },

  badge: {
    open: "Aberto",
    closed: "Fechado",
    likelyOpen: "Prov. aberto",
    likelyClosed: "Prov. fechado",
    estimatedTip: "Estimado com base no horário habitual — este local não publicou o horário",
  },

  walk: {
    minutes: "{n} min a pé",
    hours: "{h} h {m} min a pé",
  },

  info: {
    address: "Morada",
    phone: "Telefone",
    website: "Site",
    email: "Email",
    food: "Cozinha",
    contact: "Contacto",
    noContact: "Sem telefone nem site indicados",
    directions: "🧭 Como chegar",
    findPhone: "Procurar o telefone na internet",
    findWebsite: "Procurar o site na internet",
    phoneWord: "telefone",
    call: "Ligar",
    save: "Guardar",
    saved: "Guardado",
    share: "Partilhar",
    linkCopied: "Link copiado — cole-o onde quiser para partilhar",
    shareText: "{name} — encontrado com o SpotHop",
  },

  route: {
    back: "← Voltar à lista",
    travelMode: "Meio de transporte",
    modes: { foot: "A pé", bike: "Bicicleta", car: "Carro" },
    finding: "A procurar o melhor percurso…",
    error: "Não foi possível calcular o percurso agora. Verifique a ligação e tente novamente.",
    retry: "Tentar novamente",
    arrived: "🎉 Chegou a {name}!",
    summary: "{distance} · chegada por volta das {time}",
    fromLive: "A partir da sua localização em tempo real — atualiza enquanto se move",
    fromCenter: "A partir do centro do mapa (a sua localização não está disponível)",
    duration: { minutes: "{m} min", hours: "{h} h {m} min" },
    compass: ["norte", "nordeste", "este", "sudeste", "sul", "sudoeste", "oeste", "noroeste"],
    turn: {
      left: "à esquerda", right: "à direita", "slight left": "ligeiramente à esquerda", "slight right": "ligeiramente à direita",
      "sharp left": "acentuadamente à esquerda", "sharp right": "acentuadamente à direita", straight: "em frente", uturn: "para trás",
    },
    step: {
      depart: ({ dir, name }) => `Siga para ${dir}${name ? ` pela ${name}` : ""}`,
      arrive: ({ place, side }) => `Chegou a ${place}${side ? ` (${lado(side)})` : ""}`,
      roundabout: ({ exit, name }) => `Na rotunda, saia na ${exit}.ª saída${para(name)}`,
      fork: ({ side, name }) => (side ? `Mantenha-se ${lado(side)}${para(name)}` : `Continue${para(name)}`),
      endOfRoad: ({ turn, name }) => `No fim da rua, vire ${turn}${para(name)}`,
      merge: ({ turn, name }) => `Entre ${turn}${para(name)}`,
      continue: ({ turn, name }) => (turn ? `Continue ${turn}${para(name)}` : `Continue${name ? ` pela ${name}` : " em frente"}`),
      straight: ({ name }) => `Siga em frente${name ? ` pela ${name}` : ""}`,
      uturn: ({ name }) => `Faça inversão de marcha${para(name)}`,
      turn: ({ turn, name }) => `Vire ${turn}${para(name)}`,
    },
  },
};
