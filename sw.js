/* ============================================================
   SYFIR — sw.js : INTERRUPTEUR D'ARRÊT
   ------------------------------------------------------------
   Ce fichier ne met plus rien en cache. Il fait l'inverse : il
   efface tout ce que l'ancien service worker avait gardé, puis il
   se désinscrit lui-même.

   POURQUOI
   L'ancien service worker gardait une copie complète du site et la
   resservait à la place des fichiers réels. Le 4 août, Kily et moi
   avons regardé trois fois une version périmée en croyant voir la
   dernière — une fois vingt minutes durant. Pire : comme il servait
   aussi l'ancien `script.js`, le code chargé de le désinstaller ne
   pouvait jamais s'exécuter. Il se protégeait lui-même.

   La seule sortie est de le remplacer par ce fichier-ci. Le
   navigateur revérifie `sw.js` à chaque navigation : il installe
   celui-ci, qui nettoie tout et disparaît. Aucune manipulation
   demandée à l'utilisateur.

   Un cache hors ligne n'apporte rien à un site servi depuis le Mac
   qui fait la présentation. À rétablir le jour d'une vraie mise en
   ligne, et pas avant — avec, cette fois, un numéro de version
   incrémenté à chaque livraison.
============================================================ */

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil((async () => {
    for (const nom of await caches.keys()) {
      await caches.delete(nom);
    }
    await self.registration.unregister();
    const clients = await self.clients.matchAll({ type: 'window' });
    clients.forEach((c) => c.navigate(c.url));
  })());
});

/* Aucune interception : tout part au réseau, comme si ce fichier
   n'existait pas. */
