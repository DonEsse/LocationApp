const CACHE_NAME = "LocalizationApp-cache-v2.1";
const urlsToCache = [
  "/LocationApp/index.html",
  "/LocationApp/css/style.css",
  "/LocationApp/js/script.js",
  "/LocationApp/manifest.json",
  "/LocationApp/icons/icon-192.png",
  "/LocationApp/icons/icon-512.png"
];


self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(cacheNames =>
      Promise.all(
        cacheNames.map(name => {
          if (name !== CACHE_NAME) return caches.delete(name);
        })
      )
    )
  );
});

self.addEventListener("fetch", event => {
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});

