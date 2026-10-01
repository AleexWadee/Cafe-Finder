# ☕ SpotHop

Find coffee places, pubs, bars and restaurants near you on a live map.

**🌍 Live site: https://aleexwadee.github.io/Cafe-Finder/**. It works on any phone, tablet or computer.

SpotHop is **100% free**. It uses [OpenStreetMap](https://www.openstreetmap.org) data, so there's **no API key, no account and no credit card**.

## Features

- 📍 **Live location**: follows you as you move and refreshes results automatically after you've walked about 300 m
- ☕ 🍺 🍸 🍽️ **Categories**: Coffee, Pubs, Bars, Restaurants, or All. Each has its own color, pins and place count
- 🌐 **English and Spanish**: switch with **EN | ES** at the top. SpotHop picks your device's language on the first visit and remembers your choice
- 🔍 **Smart search** in English or Spanish. It understands the kind of place ("cerveza" → pubs), food ("pizza", "sushi", "tapas"), features ("terraza", "wifi", "para llevar"), "abierto" and names with typos ("starbuks"). It shows suggestions as you type, and can search a wider area (10 km) when nothing nearby matches
- ℹ️ **Place details**: address, phone, website, email, Instagram, Facebook, food, features and the weekly timetable, in the list and on the map. Click a place again to close it
- 🕒 **Opening hours**: Open or Closed right now, plus the next change. Places that haven't published their hours get an estimate from typical hours, labelled "Likely open" or "Likely closed"
- 🧭 **Directions inside the app**: walking, cycling or driving routes drawn on the map, with turn-by-turn steps that update as you move
- 🚀 **Fast**: the map appears first, all categories load in one request, and your last location and results are remembered on your device
- 📱 **Add to home screen** on phones, light and dark mode, and a mobile layout

## Run it on your computer

```bash
npm start
```

Then open http://localhost:5173 and allow location access.

> Geolocation only works on `localhost` or HTTPS, so open the page through the server and not by double-clicking `index.html`.

## Project structure

```
SpotHop/
├── index.html                Page layout (stays here: GitHub Pages opens it from the top folder)
├── manifest.webmanifest      Lets phones add SpotHop to the home screen
├── README.md                 This file
├── package.json              "npm start" runs a local server
│
├── assets/
│   └── icons/icon.svg        App icon
│
├── css/                      Styles
│   ├── base.css              Colors, layout, buttons, chips, phone layout
│   ├── panel.css             Header, language switch, search box, category tiles, filters
│   ├── places.css            Place cards, details, timetable, empty states
│   ├── map.css               Map buttons, pins, popups
│   └── route.css             Directions panel
│
├── languages/                All the texts, one file per language
│   ├── en.js                 English
│   └── es.js                 Spanish
│
├── js/                       The app
│   ├── main.js               Starts the app and connects the buttons
│   ├── core/                 The basics
│   │   ├── config.js         Settings: default location, servers, categories, timings
│   │   ├── state.js          What the app remembers while running, and page elements
│   │   ├── i18n.js           Languages: detection, t("key") translations, page texts
│   │   ├── utils.js          Small helpers (distances, times, saving on the device)
│   │   └── geo.js            Live location
│   ├── data/                 Getting and understanding the data
│   │   ├── api.js            Overpass and Nominatim servers, caching
│   │   ├── places.js         Turns OpenStreetMap data into places
│   │   ├── hours.js          Opening hours, estimates and weekly timetable
│   │   ├── search.js         Smart search: understanding words, typos, ranking
│   │   └── results.js        Finding places for an area, category and search
│   └── ui/                   What you see and click
│       ├── list.js           The list: status line, cards, details, popups
│       ├── map.js            Map, pins, opening and closing places
│       ├── tabs.js           Category tiles
│       ├── searchbox.js      Search box: suggestions, chips, wider search
│       └── route.js          Directions
│
└── docs/
    └── CHANGELOG.md          What changed in each version
```

## Adding a language

1. Copy `languages/en.js` to a new file, for example `languages/fr.js`, and translate the texts.
2. In `js/core/i18n.js`, import it and add it to `LANGUAGES`:
   ```js
   import fr from "../../languages/fr.js";
   export const LANGUAGES = { en, es, fr };
   ```
The new language appears in the switch automatically.

## How it works

| Piece | Service | Key needed? |
|-------|---------|-------------|
| Map | [Leaflet](https://leafletjs.com) + OpenStreetMap map tiles | No |
| Place search | [Overpass API](https://overpass-api.de), with [Nominatim](https://nominatim.org) as a backup | No |
| Opening hours | [opening_hours.js](https://github.com/opening-hours/opening_hours.js) | No |
| Directions | [OSRM](https://project-osrm.org) routing servers run by [FOSSGIS](https://routing.openstreetmap.de) | No |

The public servers are free and shared, so they're sometimes busy. SpotHop asks several Overpass servers at once. If they're all busy, it switches to Nominatim, which returns fewer results (up to 40 per category) but is usually available. You can change the servers in `js/core/config.js`.
