/* ============================================================
   SYFIR — Données produits partagées (source unique)
   Utilisé par la page produit dédiée (produit.html?id=X).
   Étend window.SYFIR (créé par events-data.js).
   Lexique CLAUDE.md : « pochette » (féminin), « Sirium cocktail ».
============================================================ */
(function () {
  'use strict';

  // Chaque signature = une vraie page partageable et référençable.
  // ingredients : [nom, emoji, rôle gustatif] — transparence sensorielle,
  // AUCUNE allégation (loi Évin). photos : visuels OFFICIELS locaux (images/produits/).
  // video : source locale uniquement — zéro dépendance externe.
  const products = [
    {
      id: 'planteur',
      name: 'Sirium Planteur™',
      short: 'Planteur',
      notes: 'Mangue • Passion • Ananas',
      badge: 'Signature',
      badgeCls: '',
      desc: "Mangue mûre, passion acidulée, ananas rôti — notre recette Planteur signature.",
      ingredients: [
        ['Mangue mûre', '🥭', 'la rondeur mûre qui ouvre la première gorgée'],
        ['Passion acidulée', '💛', 'le twist vif qui réveille le palais'],
        ['Ananas rôti', '🍍', 'la profondeur dorée en fin de bouche']
      ],
      photos: [
        'images/produits/syfir-planteur-marbre.jpg',
        'images/produits/syfir-studio-fruits.jpg',
        'images/produits/syfir-bar-bois.jpg',
        'images/produits/syfir-sachet-fruits-blanc.jpg',
        'images/produits/syfir-laniere-blanc.jpg'
      ],
      video: 'videos/syf-planteur.mp4',
      ogImage: 'images/produits/syfir-planteur-marbre.jpg'
    },
    {
      id: 'coral',
      name: 'Sirium Coral Breeze™',
      short: 'Coral Breeze',
      notes: 'Agrumes • Hibiscus • Fruits rouges',
      badge: 'Vibrant',
      badgeCls: 'badge-coral',
      desc: 'Agrumes vifs, hibiscus, fruits rouges. Robe corail, attaque acidulée, finale fraîche.',
      ingredients: [
        ['Agrumes', '🍊', "l'éclat zesté qui claque à l'entrée"],
        ['Hibiscus', '🌺', "la note florale au nez"],
        ['Fruits rouges', '🍓', 'la douceur acidulée qui prolonge la fraîcheur']
      ],
      photos: ['images/produits/syfir-coral-fruits-rouges.jpg'],
      video: 'videos/syfir-pub-video.mp4',
      ogImage: 'images/produits/syfir-coral-fruits-rouges.jpg'
    },
    {
      id: 'golden',
      name: 'Sirium Golden Escape™',
      short: 'Golden Escape',
      notes: 'Citron vert • Passion • Fruits exotiques',
      badge: 'Édition Or',
      badgeCls: 'badge-gold',
      desc: 'Citron vert, passion, fruits exotiques. Robe dorée, nez exotique, finale acidulée sur le citron vert.',
      ingredients: [
        ['Citron vert', '🍋', 'la vivacité tranchante qui lance la gorgée'],
        ['Passion', '💛', 'le cœur exotique acidulé'],
        ['Fruits exotiques', '🥥', "finale douce sur les fruits exotiques"]
      ],
      photos: ['images/produits/syfir-tropical-ananas.jpg'],
      video: 'videos/syfir-pub-video.mp4',
      ogImage: 'images/produits/syfir-tropical-ananas.jpg'
    }
  ];

  const getProduct = id => products.find(p => p.id === id);

  // Étend l'espace de noms partagé (events-data.js l'a déjà créé).
  window.SYFIR = window.SYFIR || {};
  window.SYFIR.products = products;
  window.SYFIR.getProduct = getProduct;
})();
