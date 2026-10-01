# ☕ Cafe Finder

**Cafe Finder** is a lightweight web app that helps you find cafés near you on a live map. With a single tap it also shows nearby **pubs, bars and restaurants**. All of its data comes straight from Google Maps as you search, so opening hours, ratings and locations are always current.

The app follows your location as you move. Walk down the high street and the map keeps up with you, refreshing the nearby places automatically. Whether you're after a flat white, a quiet pint or somewhere for dinner, Cafe Finder shows you what's close, what's open and how well it's rated.

---

## ✨ Features

- **Live location tracking**: the map centres on you and follows you as you move, refreshing results once you've travelled far enough.
- **Four categories**: switch between ☕ Cafés, 🍺 Pubs, 🍸 Bars and 🍽️ Restaurants with one click.
- **Live Google Maps data**: names, addresses, photos, star ratings, review counts, price levels and opening hours come from the Google Places API.
- **"Open now" filter**: hide anywhere that's currently closed.
- **Sort by distance or rating**: find the nearest spot or the best-rated one.
- **Adjustable search radius**: choose 500 m, 1 km, 2 km or 5 km.
- **Search this area**: pan the map anywhere in the world and look for places there.
- **Directions**: one tap opens walking or driving directions in Google Maps.
- **Responsive design**: works on desktop, tablet and mobile, with automatic dark mode.
- **No build step**: plain HTML, CSS and JavaScript, with no frameworks or dependencies.

## 🛠️ Built with

- HTML5, CSS3 and vanilla JavaScript (ES2020+)
- [Google Maps JavaScript API](https://developers.google.com/maps/documentation/javascript)
- [Places API (New)](https://developers.google.com/maps/documentation/javascript/place): Nearby Search
- Browser [Geolocation API](https://developer.mozilla.org/en-US/docs/Web/API/Geolocation_API)

## 📁 Project structure

```
Cafe-Finder/
├── index.html           # Page layout
├── styles.css           # Styling, including dark mode and mobile layout
├── app.js               # Map, location tracking, searching and rendering
├── config.example.js    # Template for your API key (copy to config.js)
├── .vscode/             # Recommended VS Code extensions
└── README.md
```

## 🚀 Getting started

### 1. Get a Google Maps API key

1. Go to the [Google Cloud Console](https://console.cloud.google.com/) and create a project (or pick an existing one).
2. Enable billing on the project. Google gives a generous free monthly allowance, but a billing account is still required.
3. Under **APIs & Services → Library**, enable:
   - **Maps JavaScript API**
   - **Places API (New)**
4. Under **APIs & Services → Credentials**, create an **API key**.
5. Restrict the key so only your sites can use it (**Application restrictions → Websites**), e.g. `http://localhost:*/*` and `http://127.0.0.1:*/*` for local development.

### 2. Configure the app

Copy the example configuration file and add your key:

```bash
cp config.example.js config.js
```

On Windows (PowerShell):

```powershell
Copy-Item config.example.js config.js
```

Then open `config.js` and replace `YOUR_API_KEY_HERE` with your key. `config.js` is listed in `.gitignore`, so your key will never be committed to GitHub.

### 3. Run it locally

Browsers only allow location access on `https://` or `localhost`, so serve the folder rather than opening `index.html` directly. Choose one of these:

- **VS Code**: install the recommended **Live Server** extension, right-click `index.html` and choose **Open with Live Server**.
- **Node.js**: `npx serve .`
- **Python**: `python -m http.server 8000`, then visit <http://localhost:8000>

When your browser asks whether the site can use your location, allow it. If you decline, the map starts in central London and you can still search by moving the map.

## 🧭 How to use it

1. Allow location access. The map centres on you and lists nearby cafés.
2. Pick a category at the top: **Cafés**, **Pubs**, **Bars** or **Restaurants**.
3. Change the **radius**, **sort order** or tick **Open now** to narrow the results.
4. Click a place in the list or a pin on the map to see its details and get **directions**.
5. Drag the map to explore elsewhere, then press **Search this area**. Dragging pauses **Live tracking**. Tick it again to follow your location once more.

## 🔒 A note on your API key

Google Maps keys used in the browser are always visible to anyone who opens the page, which is normal and expected. Protect yours by:

- adding **HTTP referrer restrictions** so it only works on your own domains;
- adding **API restrictions** so it can only call the Maps JavaScript API and Places API (New);
- setting **quotas or budget alerts** in the Google Cloud Console.

## 🗺️ Ideas for the future

- Favourites saved in the browser
- Filters for Wi-Fi, outdoor seating or dog-friendly venues
- Walking-time estimates using the Routes API
- Installable Progressive Web App (PWA) with offline support

## 📄 Licence

This project is open source and free to use for learning and personal projects.
