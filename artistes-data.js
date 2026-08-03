/* ============================================================
   SYFIR — Données artistes partagées (source unique)
   Utilisé par la page artiste dédiée (artiste.html?id=X).
   Étend window.SYFIR (events-data.js le crée).
   Unity 141 = groupe RÉEL (bio/contacts/photo officiels), seul artiste
   publié. R82.1c : les 7 artistes de démonstration sont archivés dans
   dev/demo-data-artistes.md, non chargé en production — plus aucune
   donnée fictive d'artiste dans la version publique.
============================================================ */
(function () {
  'use strict';

  const artists = [
    {
      id: 'unity', name: 'Unity 141', role: 'Kompa · Zouk · Bouyon', badge: 'Orchestre live',
      genres: ['Kompa', 'Zouk', 'Bouyon', 'Carnaval'],
      photo: 'images/artiste-unity.jpg', demo: false, dates: [],
      bio: "Unity 141, c'est l'orchestre qui fait danser la Guadeloupe. Kompa, zouk, bouyon, carnaval et ambiance live — des fêtes patronales de Terre-de-Haut aux scènes de Marie-Galante, le collectif et ses voix enflamment chaque bal. Un mot d'ordre : l'unité par la musique.",
      // Lives YouTube RÉELS — miniatures locales (images/ext/yt-<id>.jpg) + façade au clic
      embedsYt: [
        { id: 'UVYTuLruNK8', title: 'Live fête de la pêche — Terre-de-Haut 2023 (feat Danday Danday)' },
        { id: '94N9rC4bIGg', title: 'Live du 10 juin avec Danday Danday — Terre-de-Haut' },
        { id: 'sP6-aWgghGY', title: 'Live Unity 141' }
      ],
      soundcloudEmbed: 'https://w.soundcloud.com/player/?url=https%3A//soundcloud.com/user-393789233/mix-zouk-live-unity-141',
      booking: { phone: '+590690945474', phoneDisplay: '0690 94 54 74', email: 'unity141vf@gmail.com', note: 'Réponse sous 24h — management Unity 141' },
      socials: {
        youtube: 'https://www.youtube.com/@unity1416', soundcloud: 'https://soundcloud.com/user-393789233',
        instagram: 'https://www.instagram.com/unity_141', facebook: 'https://www.facebook.com/Unity141', tiktok: 'https://www.tiktok.com/@unity_141'
      }
    },
  ];

  const getArtist = id => artists.find(a => a.id === id);

  window.SYFIR = window.SYFIR || {};
  window.SYFIR.artists = artists;
  window.SYFIR.getArtist = getArtist;
})();
