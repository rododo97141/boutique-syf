/* ============================================================
   SYFIR — Données produits partagées (source unique)
   Utilisé par la page produit dédiée (produit.html?id=X).
   Étend window.SYFIR (créé par events-data.js).
   Lexique CLAUDE.md : « pochette » (féminin), « Collection Syf ».
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
      name: 'Syf Planteur™',
      short: 'Planteur',
      notes: 'Mangue • Passion • Ananas',
      badge: 'Best-seller',
      badgeCls: '',
      desc: "L'esprit des tropiques dans un coucher de soleil liquide. Mangue mûre, passion acidulée, ananas rôti. Le best-seller qui a donné sa couleur à SYFIR.",
      ingredients: [
        ['Mangue mûre', '🥭', 'la rondeur solaire qui ouvre la première gorgée'],
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
      name: 'Syf Coral Breeze™',
      short: 'Coral Breeze',
      notes: 'Agrumes • Hibiscus • Fruits rouges',
      badge: 'Vibrant',
      badgeCls: 'badge-coral',
      desc: 'Agrumes vifs, hibiscus, fruits rouges. La fraîcheur qui réveille la piste.',
      ingredients: [
        ['Agrumes', '🍊', "l'éclat zesté qui claque à l'entrée"],
        ['Hibiscus', '🌺', "la note florale qui colore l'instant"],
        ['Fruits rouges', '🍓', 'la douceur acidulée qui prolonge la fraîcheur']
      ],
      photos: ['images/produits/syfir-coral-fruits-rouges.jpg'],
      video: 'videos/syfir-pub-video.mp4',
      ogImage: 'images/produits/syfir-coral-fruits-rouges.jpg'
    },
    {
      id: 'golden',
      name: 'Syf Golden Escape™',
      short: 'Golden Escape',
      notes: 'Citron vert • Passion • Fruits exotiques',
      badge: 'Édition Or',
      badgeCls: 'badge-gold',
      desc: 'Citron vert, passion, fruits exotiques. La golden hour en pochette.',
      ingredients: [
        ['Citron vert', '🍋', 'la vivacité tranchante qui lance la gorgée'],
        ['Passion', '💛', 'le cœur exotique acidulé'],
        ['Fruits exotiques', '🥥', "l'évasion sucrée de la golden hour"]
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
