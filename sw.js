/* ============================================================
   Service worker SYFIR — stratégie 2026, simple et honnête :
   - HTML (navigations)      : network-first, repli cache hors ligne
   - CSS / JS / images / polices : cache-first, complété au fil de l'eau
   - vidéos : jamais mises en cache (poids)
   Nom de cache VERSIONNÉ : incrémenter SYFIR_CACHE à chaque release
   pour invalider proprement l'ancien cache.
============================================================ */
const SYFIR_CACHE = 'syfir-v3';

/* R95 — LE BILLET HORS LIGNE.
   Mesure qui a motivé ce bloc : sans préchargement, le cache du service
   worker est VIDE après une première visite (il ne contrôle pas encore la
   page) et ne se remplit qu'à partir de la SECONDE. Quelqu'un qui prend
   son billet puis perd le réseau n'avait donc rien — la page ne tenait
   que par le cache HTTP du navigateur, qui n'est ni garanti ni durable.

   On précharge la COQUILLE, et elle seule : les pages où un billet se
   consulte, plus les feuilles et scripts qui les font fonctionner. Aucune
   image, aucune vidéo — un billet se lit, il ne se contemple pas, et le
   forfait de qui est hors ligne n'a pas à payer le décor.

   Les billets eux-mêmes vivent dans localStorage : ils sont donc déjà
   hors ligne par nature. Ce qui manquait, c'était de quoi les AFFICHER. */
const SYFIR_SHELL = [
  'evenements.html', 'compte.html', 'index.html',
  'style.css', 'syfir-ui/tokens.css', 'syfir-ui/components.css',
  'events-data.js', 'script.js', 'auth.js'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(SYFIR_CACHE).then((c) =>
      // Un par un, et non addAll : addAll rejette EN BLOC si une seule
      // ressource manque, et l'installation entière échouerait pour un
      // fichier renommé. Ici, ce qui répond est gardé, le reste est ignoré.
      Promise.all(SYFIR_SHELL.map((u) =>
        fetch(u, { cache: 'reload' })
          .then((r) => (r.ok ? c.put(u, r) : null))
          .catch(() => null)
      ))
    ).then(() => self.skipWaiting())
  );
});

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
