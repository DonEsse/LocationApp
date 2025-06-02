const CACHE_NAME = "LocationApp-cache-v2.3";
const urlsToCache = [
  "/index.html",
  "/login.html",
  "/registro.html",
  "/admin.html",
  "/tecnico.html",
  "/css/style.css",
  "/js/login.js",
  "/js/registro.js",
  "/js/admin.js",
  "/js/tecnico.js",
  "/js/tema.js",
  "/manifest.json",
  "/icons/icon-192.png",
  "/icons/icon-512.png"
];

// Instalação e cache dos arquivos
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
});

// Ativação e limpeza de caches antigos
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

// Intercepta fetchs e usa cache se offline
self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request).catch(() => {
        // fallback opcional para offline
        if (event.request.destination === 'document') {
          return caches.match('/login.html');
        }
      });
    })
  );
});
