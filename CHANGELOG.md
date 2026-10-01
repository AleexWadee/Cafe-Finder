# Changelog

## 1.0.0 — 2026-10-01

### Started with Google Maps, switched to free OpenStreetMap
- The first version used the Google Maps and Places APIs. These need an API key and a billing account, so SpotHop moved to free services that need no key and no card.
- **Map**: Leaflet + OpenStreetMap map images. CARTO was tried first, but it now puts an "API KEY REQUIRED" watermark on the map.
- **Place search**: Overpass API, with Nominatim as an automatic backup when Overpass is overloaded.
- **Directions**: OSRM routing servers run by FOSSGIS.

### Fixed categories, design and speed
- **Categories looked the same**: fixed a bug where a new category kept showing the previous category's places while loading. Each category now has its own color, pins, details and place count.
- **Side menu redesign**: category tiles, buttons for distance and sort, an "Open now" switch, a search box for names and cuisines, and your neighbourhood name at the top.
- **Speed**: all categories load in one request and are kept, so switching tabs or making the distance smaller is instant. Quick results appear after about 2 seconds while the full list loads. Overpass servers are asked in parallel.
- **Places only showing after clicking "Open now"**: fixed by the same category bug fix.

### Opening hours
- Places with published hours show **Open** or **Closed** and the next opening or closing time.
- Places without published hours get an estimate from typical hours for that kind of place in Spain, clearly labelled **"Likely open"** or **"Likely closed"**.
- Clicking a place shows its hours for the whole week, with a link to add the real hours on OpenStreetMap.
- "Open now" hides closed places. Places with published hours come first, then places that are likely open.
- Public-holiday rules (for example "PH off") work, using the country detected from your location.

### Directions inside the app
- The Directions button opens the route in SpotHop instead of Google Maps.
- The route is drawn on the map, with walk, bike and car options.
- Shows travel time, distance, arrival time and turn-by-turn steps.
- The route updates as you move, and SpotHop tells you when you've arrived.

### Published online
- Hosted on GitHub Pages: https://aleexwadee.github.io/Cafe-Finder/
