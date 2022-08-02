// 8-1-22

let cache_name = "my_cache_v1.0";
let my_assets = [
    "/",
    "sw.js",
    "map.html",
    "map.css",
    "leaflet_css.css",
    "manifest.json",
    "icons/32.png",
    "icons/512.png",
    "icons/apple.png",
    // Scripts
    "my_scripts/draw_cdi.js",
    "my_scripts/jq.min.js",
    "my_scripts/kml_process.js",
    "my_scripts/leaflet.min.js",
    "my_scripts/map.js",
    "my_scripts/nav_functions.js",
    "my_scripts/omnivore.min.js",
    "my_scripts/playback.js",
    "my_scripts/prediction.js",
    "my_scripts/scalebar.js",
    // KMLs
    "kmls/airport_road.kml",
    "kmls/barrow.kml",
    "kmls/brooks1.kml",
    "kmls/brooks2.kml"
];


self.addEventListener('install', (e) => {
    console.log('[Service Worker] Install');
    e.waitUntil((async () => {
        const cache = await caches.open(cache_name);
        console.log('[Service Worker] Caching all: app shell and content');
        await cache.addAll(my_assets);
    })());
});


//  Fetch request
self.addEventListener('fetch', (e) => { // Fires when resourse is grabbed from local. If not in local adds needed file to local after download
    e.respondWith((async () => {
        const r = await caches.match(e.request);
        console.log(`[Service Worker] Fetching resource: ${e.request.url}`);
        if (r) { return r; }
        const response = await fetch(e.request);
        const cache = await caches.open(cache_name);
        console.log(`[Service Worker] Caching new resource: ${e.request.url}`);
        cache.put(e.request, response.clone());
        return response;
    })());
});

// Clear cache
// caches.delete(cache_name);
// self.addEventListener('activate', (e) => {
//     e.waitUntil(caches.keys().then((keyList) => {
//         return Promise.all(keyList.map((key) => {
//             if (key === cache_name) { return; }
//             return caches.delete(key);
//         }))
//     }));
// });