# Changelog

## 1.2.0 — 2026-10-01

### More languages
- German, French, Italian and Portuguese, alongside English and Spanish, in a compact 🌐 menu.
- The search understands words in all six languages ("Bier mit Terrasse", "bière", "birra all'aperto", "cerveja com esplanada").

### Phone numbers
- A 📞 button on each card with a phone number calls the place in one tap.
- Places without a number on OpenStreetMap get a "Find the phone number online" link that searches the web for it.
- WhatsApp links when a place lists one.

### New
- ❤️ Saved places: ♡ on any place keeps it on the device; **Saved** lists them wherever they are.
- 🔗 Share: a link that opens SpotHop right on that place (phone share menu, or copied link).
- Category, distance and sort are remembered between visits.
- New app icon, with PNG versions for phone home screens.

### Fixed
- An opened place no longer closes when the opening-hours data finishes loading.

## 1.1.0 — 2026-10-01

### Languages
- English and Spanish, switched with **EN | ES** in the header. The device's language is used on the first visit and the choice is remembered.
- Everything is translated: menus, place details, opening hours and day names, search chips, turn-by-turn directions, and the neighbourhood name.
- New languages can be added with one file in `languages/`.

### Tidier project
- The single `app.js` (about 1,400 lines) is split into 16 modules in `js/`, one per job.
- `style.css` is split into 5 files in `css/`.
- Added an app icon (`assets/icons/icon.svg`), a web manifest so phones can add SpotHop to the home screen, and `.editorconfig`.

### Earlier in 1.1.0
- Smart search in English and Spanish, with suggestions, typo tolerance and a wider-area search.
- Faster start: the map appears first, and the last location and results are remembered on the device.
- Place details (phone, website, email, socials, timetable) in the list and the map popup. Clicking a place again closes it.
- Buttons no longer stay white after tapping on phones.

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
