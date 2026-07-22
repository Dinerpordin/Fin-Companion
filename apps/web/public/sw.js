const CACHE_NAME = "fc-offline-cache-v2";
const OFFLINE_URLS = [
  "/",
  "/rights",
  "/emergency",
  "/protect",
  "/globals.css",
  "/manifest.json",
];
const EXCLUDED_PATHS = ["/cashbook", "/account", "/profile"];

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return Promise.allSettled(
        OFFLINE_URLS.map((url) => {
          return cache.add(url).catch((err) => {
            console.warn(`[ServiceWorker] Failed to cache: ${url}`, err);
          });
        })
      );
    })
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log(`[ServiceWorker] Deleting old cache: ${cacheName}`);
            return caches.delete(cacheName);
          }
        })
      ).then(() => self.clients.claim());
    })
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  const url = new URL(event.request.url);
  if (!url.origin.startsWith(self.location.origin)) return;

  // Never intercept or cache external redirect routes
  if (EXCLUDED_PATHS.some((path) => url.pathname.startsWith(path))) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        fetch(event.request)
          .then((networkResponse) => {
            if (networkResponse.status === 200) {
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(event.request, networkResponse);
              });
            }
          })
          .catch(() => {});
        return cachedResponse;
      }

      return fetch(event.request)
        .then((networkResponse) => {
          if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== "basic") {
            return networkResponse;
          }
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
          return networkResponse;
        })
        .catch(() => {
          const acceptHeader = event.request.headers.get("accept");
          if (acceptHeader && acceptHeader.includes("text/html")) {
            return caches.match("/");
          }
        });
    })
  );
});
