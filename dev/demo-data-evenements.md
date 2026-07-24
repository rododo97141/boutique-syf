# Données de démonstration — ÉVÉNEMENTS (archive de développement)

Fichier de développement, **non chargé en production** : aucune page ne le
référence. Archive des 9 événements fictifs retirés de `events-data.js`
au lot R82.1c (correctif « données fictives hors de la version publique »).
Lieux, dates, prix, stocks et line-ups sont **inventés** — ne jamais les
réintégrer tels quels dans le HTML/JS public.

```js
  const baseEvents = [
    { id: 1, name: 'SYFIR Sunset Beach Party', blurb: "Le coucher de soleil, la basse dans le sable, un verre à la main. Tu ne regardes plus l'heure.", type: 'beach', city: 'Sainte-Anne', venue: 'Plage de la Caravelle', date: '2026-07-25', time: '18:00', price: 25, genres: ['Afro house', 'Zouk'],
      img: 'images/ext/unsplash-photo-1533174072545-7a4b6ad7a6c3.jpg', organizer: 'SYFIR Official', prive: false },
    { id: 2, name: 'Golden Hour Rooftop', blurb: 'La ville en bas, la golden hour en haut. On trinque au bord du vide.', type: 'rooftop', city: 'Paris', venue: 'Le Perchoir', date: '2026-08-08', time: '19:00', price: 35, genres: ['Deep house', 'Soul'],
      img: 'images/ext/unsplash-photo-1496337589254-7e19d01cec44.jpg', organizer: 'SYFIR Official', prive: false },
    { id: 3, name: 'Coral Night — Club Edition', blurb: "La nuit où le shatta décide et où personne ne s'assoit.", type: 'club', city: 'Pointe-à-Pitre', venue: 'Club Azur', date: '2026-07-22', time: '23:00', price: 20, genres: ['Shatta', 'Dancehall'],
      img: 'images/ext/unsplash-photo-1514525253161-7a46d19cd819.jpg', organizer: 'Club Azur × SYFIR', prive: false, stock: 'dernieres' },
    { id: 4, name: 'SYFIR Tropical Festival', blurb: "Deux jours, deux plages, une règle : tu danses jusqu'au bout.", type: 'festival', city: 'Le Gosier', venue: 'Plage du Gosier', date: '2026-08-15', time: '16:00', price: 45, genres: ['Soca', 'Zouk', 'Afro house'],
      img: 'images/ext/unsplash-photo-1470225620780-dba8ba36b745.jpg', organizer: 'SYFIR Official', prive: false, stock: 'complet',
      // Line-up multi-jours (modèle We Love Green) — artistes liés aux fiches (#artiste-<slug>)
      lineup: [
        { day: 'Vendredi 15 août', acts: [
          { name: 'DJ Solaris', slug: 'solaris', img: 'images/ext/unsplash-photo-1514525253161-7a46d19cd819.jpg' },
          { name: 'Kréyòl Sound System', slug: 'kreyol', img: 'images/ext/unsplash-photo-1501386761578-eac5c94b800a.jpg' },
          { name: 'NÉO', slug: 'neo', img: 'images/ext/unsplash-photo-1574391884720-bbc3740c59d1.jpg' },
          { name: 'Maya Lumière', slug: 'maya', img: 'images/ext/unsplash-photo-1516280440614-37939bbacd81.jpg' }
        ] },
        { day: 'Samedi 16 août', acts: [
          { name: 'DJ Brise', slug: 'brise', img: 'images/ext/unsplash-photo-1493676304819-0d7a8d026dcf.jpg' },
          { name: 'Los Tropicanos', slug: 'tropicanos', img: 'images/ext/unsplash-photo-1459749411175-04bf5292ceea.jpg' },
          { name: 'Zénith Brass', slug: 'zenith', img: 'images/ext/unsplash-photo-1429962714451-bb934ecdc4ec.jpg' },
          { name: 'Unity 141', slug: 'unity', img: 'images/artiste-unity.jpg' }
        ] }
      ] },
    { id: 5, name: 'Villa Privée — Édition Or', blurb: "Peu d'élus, une villa, la mer pour seule voisine.", type: 'prive', city: 'Saint-Barthélemy', venue: 'Villa Gustavia', date: '2026-08-01', time: '21:00', price: 80, genres: ['House', 'Konpa'],
      img: 'images/ext/unsplash-photo-1414235077428-338989a2e8c0.jpg', organizer: 'Hôte privé × SYFIR', prive: true, code: 'SYFIR2026' },
    { id: 6, name: 'Pique-nique Golden Escape', blurb: 'Nappe sur le sable, cocktails au frais — le dimanche version SYFIR.', type: 'beach', city: 'Deshaies', venue: 'Plage de Grande Anse', date: '2026-07-19', time: '12:00', price: 15, genres: ['Chill', 'Zouk'],
      img: 'images/ext/unsplash-photo-1526481280693-3bfa7568e0f3.jpg', organizer: 'SYFIR Official', prive: false, ticketing: 'inscription' },
    /* --- Éditions passées (démo preuve sociale) : dates révolues -> section
       « Les éditions passées ». Photos locales pour un rendu fiable hors-ligne. --- */
    { id: 7, name: 'SYFIR Beach Opening', blurb: "Celle qui a lancé l'été. On était là.", type: 'beach', city: 'Sainte-Anne', venue: 'Plage de Bois Jolan', date: '2026-06-14', time: '17:00', price: 20, genres: ['Afro house', 'Zouk'],
      img: 'images/produits/syfir-pub-plage-1.jpg', organizer: 'SYFIR Official', prive: false,
      recap: ['images/produits/syfir-pub-plage-1.jpg', 'images/produits/syfir-pub-plage-2.jpg', 'images/ext/unsplash-photo-1533174072545-7a4b6ad7a6c3.jpg', 'images/ext/unsplash-photo-1507525428034-b723cf961d3e.jpg', 'images/ext/unsplash-photo-1526481280693-3bfa7568e0f3.jpg'] },
    { id: 8, name: 'Golden Hour — Rooftop #1', blurb: 'Le tout premier rooftop. La barre était déjà haute.', type: 'rooftop', city: 'Le Gosier', venue: 'Rooftop La Verdure', date: '2026-06-28', time: '19:00', price: 30, genres: ['Deep house', 'Soul'],
      img: 'images/produits/syfir-pub-duo.jpg', organizer: 'SYFIR Official', prive: false,
      recap: ['images/produits/syfir-pub-duo.jpg', 'images/ext/unsplash-photo-1496337589254-7e19d01cec44.jpg', 'images/ext/unsplash-photo-1414235077428-338989a2e8c0.jpg', 'images/ext/unsplash-photo-1566417713940-fe7c737a9ef2.jpg'] },
    { id: 9, name: 'Coral Night — Édition #1', blurb: "La toute première Coral Night. Le club s'en souvient encore.", type: 'club', city: 'Pointe-à-Pitre', venue: 'Club Azur', date: '2026-05-31', time: '23:00', price: 20, genres: ['Shatta', 'Dancehall'],
      img: 'images/produits/syfir-pub-plage-2.jpg', organizer: 'Club Azur × SYFIR', prive: false,
      recap: ['images/produits/syfir-pub-plage-2.jpg', 'images/ext/unsplash-photo-1514525253161-7a46d19cd819.jpg', 'images/ext/unsplash-photo-1493676304819-0d7a8d026dcf.jpg', 'images/ext/unsplash-photo-1574391884720-bbc3740c59d1.jpg'] }
  ];
```
