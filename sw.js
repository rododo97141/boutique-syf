/* ============================================================
   Service worker SYFIR — stratégie 2026, simple et honnête :
   - HTML (navigations)      : network-first, repli cache hors ligne
   - CSS / JS / images / polices : cache-first, complété au fil de l'eau
   - vidéos : jamais mises en cache (poids)
   Nom de cache VERSIONNÉ : incrémenter SYFIR_CACHE à chaque release
   pour invalider proprement l'ancien cache.
============================================================ */
const SYFIR_CACHE = 'syfir-v2';

self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== SYFIR_CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;

  // Navigations : le réseau d'abord (contenu frais), le cache en secours
  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(SYFIR_CACHE).then((c) => c.put(req, copy));
          return res;
        })
        .catch(() => caches.match(req))
    );
    return;
  }

  // Assets : le cache d'abord, le réseau complète
  if (['style', 'script', 'image', 'font'].includes(req.destination)) {
    e.respondWith(
      caches.match(req).then((hit) => hit || fetch(req).then((res) => {
        if (res.ok || res.type === 'opaque') {
          const copy = res.clone();
          caches.open(SYFIR_CACHE).then((c) => c.put(req, copy));
        }
        return res;
      }))
    );
  }
});
