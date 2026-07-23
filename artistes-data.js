/* ============================================================
   SYFIR — Données artistes partagées (source unique)
   Utilisé par la page artiste dédiée (artiste.html?id=X).
   Étend window.SYFIR (events-data.js le crée).
   Unity 141 = groupe RÉEL (bio/contacts/photo officiels). Les autres sont
   des EXEMPLES de démonstration (marqueur « Exemple », comme les événements).
   Zéro invention : aucune fausse citation/date/chiffre.
============================================================ */
(function () {
  'use strict';

  const artists = [
    {
      id: 'unity', name: 'Unity 141', role: 'Kompa · Zouk · Bouyon', badge: 'Orchestre live',
      genres: ['Kompa', 'Zouk', 'Bouyon', 'Carnaval'],
      photo: 'images/artiste-unity.jpg', demo: false, dates: [4],
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
    {
      id: 'solaris', name: 'DJ Solaris', role: 'House tropicale · Afro', badge: 'DJ résident',
      genres: ['House tropicale', 'Afro', 'Sunset sets'], photo: 'images/ext/unsplash-photo-1514525253161-7a46d19cd819.jpg', demo: true, dates: [4],
      bio: "Figure des sunsets antillais, DJ Solaris fait dialoguer house tropicale et rythmes afro. Ses sets montent avec le soleil qui descend."
    },
    {
      id: 'maya', name: 'Maya Lumière', role: 'Soul · Pop solaire', badge: 'Artiste',
      genres: ['Soul', 'Pop solaire', 'Live acoustique'], photo: 'images/ext/unsplash-photo-1516280440614-37939bbacd81.jpg', demo: true, dates: [4],
      bio: "Voix de velours et présence solaire, Maya Lumière transforme un rooftop en moment suspendu. Reprises soul et compositions pop ensoleillées, en formule acoustique ou avec band."
    },
    {
      id: 'brise', name: 'DJ Brise', role: 'Deep house · Sunset', badge: 'DJ résident',
      genres: ['Deep house', 'Sunset', 'Apéro-mix'], photo: 'images/ext/unsplash-photo-1493676304819-0d7a8d026dcf.jpg', demo: true, dates: [4],
      bio: "L'apéro-mix, c'est son terrain. DJ Brise déroule une deep house caressante pour les fins de journée les pieds dans le sable. Tempo doux, basses chaudes, transitions soyeuses."
    },
    {
      id: 'neo', name: 'NÉO', role: 'Électro · Carnaval', badge: 'DJ · Producteur',
      genres: ['Électro', 'Carnaval', 'Club'], photo: 'images/ext/unsplash-photo-1574391884720-bbc3740c59d1.jpg', demo: true, dates: [4],
      bio: "Producteur et tête d'affiche, NÉO fusionne électro et énergie carnaval. Drops massifs, percussions créoles : c'est le set qui fait basculer la soirée en mode club jusqu'au bout de la nuit."
    },
    {
      id: 'kreyol', name: 'Kréyòl Sound System', role: 'Zouk · Dancehall · Konpa', badge: 'Groupe musical',
      genres: ['Zouk', 'Dancehall', 'Konpa'], photo: 'images/ext/unsplash-photo-1501386761578-eac5c94b800a.jpg', demo: true, dates: [4],
      bio: "Un sound system 6 musiciens qui enflamme les festivals avec un mur de cuivres et de basses créoles. Du zouk rétro au dancehall, leur live monte en puissance jusqu'au konpa final repris par tout le public."
    },
    {
      id: 'tropicanos', name: 'Los Tropicanos', role: 'Salsa · Latino · Cumbia', badge: 'Groupe musical',
      genres: ['Salsa', 'Latino', 'Cumbia'], photo: 'images/ext/unsplash-photo-1459749411175-04bf5292ceea.jpg', demo: true, dates: [4],
      bio: "Cuivres chauds et rythmes latinos pour faire danser la piste : l'orchestre des soirées privées qui ne s'arrêtent jamais. Salsa, cumbia et latino pop, en formation de 4 à 8 musiciens selon la scène."
    },
    {
      id: 'zenith', name: 'Zénith Brass', role: 'Brass band · Funk · Carnaval', badge: 'Groupe musical',
      genres: ['Brass band', 'Funk', 'Carnaval'], photo: 'images/ext/unsplash-photo-1429962714451-bb934ecdc4ec.jpg', demo: true, dates: [4],
      bio: "Fanfare mobile qui déambule et met le feu, du carnaval au cocktail de rue. Cuivres only, énergie maximale : la formation qui transforme n'importe quel espace en scène ouverte."
    }
  ];

  const getArtist = id => artists.find(a => a.id === id);

  window.SYFIR = window.SYFIR || {};
  window.SYFIR.artists = artists;
  window.SYFIR.getArtist = getArtist;
})();
