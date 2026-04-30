const CACHE_NAME = "racegame-v1";

// All assets to pre-cache on install
const PRECACHE_ASSETS = ["/", "/index.html", "/manifest.json", "/src/game.js"];

// ── Install: pre-cache shell assets ──────────────────────────────────────────
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_ASSETS)),
  );
  // Activate immediately without waiting for old tabs to close
  self.skipWaiting();
});

// ── Activate: purge old caches ────────────────────────────────────────────────
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== CACHE_NAME)
            .map((key) => caches.delete(key)),
        ),
      ),
  );
  // Take control of all open clients immediately
  self.clients.claim();
});

// ── Fetch: cache-first, fall back to network ──────────────────────────────────
self.addEventListener("fetch", (event) => {
  // Only handle GET requests
  if (event.request.method !== "GET") return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;

      return fetch(event.request)
        .then((response) => {
          // Cache valid responses for future offline use
          if (
            response &&
            response.status === 200 &&
            response.type === "basic"
          ) {
            const toCache = response.clone();
            caches
              .open(CACHE_NAME)
              .then((cache) => cache.put(event.request, toCache));
          }
          return response;
        })
        .catch(() => {
          // If we're offline and have no cached fallback, return a minimal offline page
          if (event.request.destination === "document") {
            return caches.match("/index.html");
          }
        });
    }),
  );
});
