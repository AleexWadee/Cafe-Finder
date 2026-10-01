# ☕ SpotHop

Find coffee places, pubs, bars and restaurants near you on a live map.

**🌍 Live site: https://aleexwadee.github.io/Cafe-Finder/**. It works on any phone, tablet or computer.

SpotHop is **100% free**. It uses [OpenStreetMap](https://www.openstreetmap.org) data, so there's **no API key, no account and no credit card**.

## Features

- 📍 **Live location**: follows you as you move and refreshes results automatically after you've walked about 300 m
- ☕ 🍺 🍸 🍽️ **Categories**: Coffee, Pubs, Bars, Restaurants, or All. Each has its own color, pins and place count
- ⚡ **Fast**: all categories load in one request, so switching tabs or making the radius smaller is instant. Quick results appear while the full list loads
- 🕒 **Opening hours**: Open / Closed right now, the next opening or closing time, and a full weekly schedule. Places that haven't published their hours get an estimate from typical hours for that kind of place, clearly labelled "Likely open" / "Likely closed"
- 🧭 **Directions inside the app**: walking, cycling or driving routes drawn on the map, with turn-by-turn steps, travel time and arrival time. The route updates as you move
- Highlights for each place type, such as cocktails, real ale, live music, vegan, terrace and Wi-Fi, plus walking time, address, website and phone
- 🔍 Search by name or cuisine
- 🔄 **Search this area**: drag the map anywhere and search there
- 🎚️ Filter by distance (500 m to 5 km), sort by nearest or A–Z, and show only places that are open now
- 🌗 Light and dark mode, plus a mobile layout

## Run it

```bash
npm start
```

Then open http://localhost:5173 and allow location access.

> Geolocation only works on `localhost` or HTTPS, so open the page through the server and not by double-clicking `index.html`.

## How it works

| Piece | Service | Key needed? |
|-------|---------|-------------|
| Map | [Leaflet](https://leafletjs.com) + OpenStreetMap map tiles | No |
| Place search | [Overpass API](https://overpass-api.de), with [Nominatim](https://nominatim.org) as a backup | No |
| Open now | [opening_hours.js](https://github.com/opening-hours/opening_hours.js) | No |
| Directions | [OSRM](https://project-osrm.org) routing servers run by [FOSSGIS](https://routing.openstreetmap.de) | No |

The public Overpass servers are free and shared, so they're sometimes busy. SpotHop tries several servers in turn. If they're all busy, it switches to Nominatim, which returns fewer results (up to 40 per type) but is usually available. It also keeps results for 5 minutes to avoid repeating the same request. You can change the server list in `config.js`.

## Files

| File | Purpose |
|------|---------|
| `index.html` | Page layout |
| `style.css` | Styles, dark mode and the responsive layout |
| `app.js` | Map, live location, place search, list and markers |
| `config.js` | Default map center and the Overpass servers |
