/* ============================================================
   SYFIR — Données événements partagées (source unique)
   Utilisé par script.js (billetterie) ET evenement.html (fiche).
   Expose window.SYFIR.
============================================================ */
(function () {
  'use strict';

  const TIERS_DEFAULT = [
    { name: 'Early Bird', desc: 'Quantité limitée', mult: 0.8, scarce: true },
    { name: 'Standard', desc: 'Entrée + 1 cocktail SYFIR', mult: 1, reco: true },
    { name: 'VIP Golden Hour', desc: 'Carré VIP + open cocktails', mult: 2.2 }
  ];

  const MONTHS = ['JAN', 'FÉV', 'MAR', 'AVR', 'MAI', 'JUIN', 'JUIL', 'AOÛT', 'SEP', 'OCT', 'NOV', 'DÉC'];

  // Échappement HTML systématique : toute donnée dynamique (localStorage,
  // formulaires, data-attributes) passe par ici avant innerHTML.
  const escapeHtml = s => String(s ?? '').replace(/[&<>"']/g,
    c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  // NB : dates de démo tenues « à venir » (site vitrine sans back-office).
  // À rafraîchir périodiquement, ou à brancher sur le vrai calendrier
  // billetterie ; la grille masque de toute façon les dates passées.
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

  const typeLabel = { beach: 'Beach Party', rooftop: 'Rooftop', festival: 'Festival', club: 'Club', soiree: 'Soirée', prive: 'Soirée privée' };

  // Badge d'ACTION (modèle page événements Red Bull) : le badge dit TOUJOURS
  // l'action possible pour le visiteur. Rareté honnête d'abord (pilotée par le
  // vrai champ `stock` : « complet » | « dernieres »), puis état positif par
  // défaut selon le mode de billetterie (`ticketing`) :
  //   • « Sur invitation »        → événement privé (code d'accès)
  //   • « Inscriptions ouvertes » → ticketing: 'inscription' (entrée sur inscription)
  //   • « Billets disponibles »   → défaut (billetterie ouverte)
  // Aucune invention de stock ; à brancher sur le vrai stock côté organisateur.
  const stockLabel = ev => {
    if (!ev) return null;
    if (ev.stock === 'complet') return { text: 'Complet', cls: 'stock-complet', soldOut: true, action: false };
    if (ev.stock === 'dernieres') return { text: 'Dernières places', cls: 'stock-dernieres', soldOut: false, action: true };
    if (ev.prive) return { text: 'Sur invitation', cls: 'stock-invite', soldOut: false, action: true };
    if (ev.ticketing === 'inscription') return { text: 'Inscriptions ouvertes', cls: 'stock-open', soldOut: false, action: true };
    return { text: 'Billets disponibles', cls: 'stock-dispo', soldOut: false, action: true };
  };

  const euro = n => n.toFixed(2).replace('.', ',') + ' €';
  const fmtTime = t => t ? t.replace(':', 'h') : '';
  const priceRange = ev => {
    const m = TIERS_DEFAULT.map(t => t.mult);
    const lo = ev.price * Math.min(...m), hi = ev.price * Math.max(...m);
    return lo === hi ? euro(lo) : `${euro(lo)} – ${euro(hi)}`;
  };
  // Compte à rebours sobre : « Dans 2 j 14 h » / « Dans 3 h 12 min » / '' si passé
  // Urgence HONNÊTE basée sur la vraie date/heure : « J-3 », « J-1 »,
  // « Ce soir », « Dans 3 h », « Dans 20 min ». Jamais de faux compteur.
  const countdownText = iso => {
    const target = new Date(iso), now = new Date();
    const ms = target - now;
    if (ms <= 0) return '';                       // passé (déjà masqué ailleurs)
    const startOfDay = d => new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const dayDiff = Math.round((startOfDay(target) - startOfDay(now)) / 864e5);
    const h = Math.floor(ms / 36e5), m = Math.floor(ms % 36e5 / 6e4);
    if (dayDiff >= 2) return `J-${dayDiff}`;
    if (dayDiff === 1) return 'J-1';              // demain
    if (h < 1) return `Dans ${m} min`;            // dernière heure : minutes précises
    if (target.getHours() >= 18) return 'Ce soir';
    return `Dans ${h} h`;
  };

  const mapsUrl = ev => 'https://www.google.com/maps/search/?api=1&query=' +
    encodeURIComponent([ev.venue, ev.city, 'Guadeloupe'].filter(Boolean).join(', '));

  // Événements créés via l'espace pro (stockés en local)
  const getProEvents = () => {
    try { return JSON.parse(localStorage.getItem('syfir-pro-events')) || []; }
    catch { return []; }
  };

  /* --- Migration douce des données locales (constats du test utilisateur).
     Une seule passe par chargement, réécrit seulement si quelque chose change.
     1. noms d'événements : majuscule initiale (« unity 141 » -> « Unity 141 »)
     2. doublons de test « X (copie) » retirés quand l'original X existe
        toujours à la même date (le bouton Dupliquer reste utilisable : une
        copie modifiée — nom, date — n'est jamais touchée)
     3. cartes complètes : heure par défaut 20:00, genre dérivé du type
     4. placeholder d'organisateur -> « SYFIR Events »
     5. billets sans numéro : numéro généré rétroactivement */
  const migrateLocal = () => {
    try {
      const pro = JSON.parse(localStorage.getItem('syfir-pro-events')) || [];
      let dirty = false;
      pro.forEach(ev => {
        const fixed = String(ev.name || '').trim();
        const cap = fixed.charAt(0).toUpperCase() + fixed.slice(1);
        if (cap !== ev.name) { ev.name = cap; dirty = true; }
        if (!ev.time) { ev.time = '20:00'; dirty = true; }
        if (!ev.genres || !ev.genres.length) { ev.genres = [typeLabel[ev.type] || 'Soirée']; dirty = true; }
        if (/^(Ton|Votre) organisation × SYFIR$/.test(ev.organizer || '')) { ev.organizer = 'SYFIR Events'; dirty = true; }
      });
      // Nettoyage des doublons « (copie) » : UNE seule fois (drapeau), sinon
      // le bouton Dupliquer verrait ses copies fraîches supprimées au rechargement
      let cleaned = pro;
      if (!localStorage.getItem('syfir-migr-1')) {
        cleaned = pro.filter(ev => {
          const m = String(ev.name || '').match(/^(.*) \(copie\)$/i);
          if (!m) return true;
          const twin = pro.find(o => o !== ev && o.name === m[1] && o.date === ev.date && o.city === ev.city);
          if (twin) { dirty = true; return false; }
          return true;
        });
        localStorage.setItem('syfir-migr-1', '1');
      }
      if (dirty) localStorage.setItem('syfir-pro-events', JSON.stringify(cleaned));

      const tickets = JSON.parse(localStorage.getItem('syfir-tickets')) || [];
      let tDirty = false;
      tickets.forEach((t, i) => {
        if (!t.num) {
          t.num = 'SYF-' + Date.now().toString(36).toUpperCase() + '-' + (100 + (i * 37) % 900);
          tDirty = true;
        }
      });
      if (tDirty) localStorage.setItem('syfir-tickets', JSON.stringify(tickets));
    } catch { /* stockage indisponible : rien à migrer */ }
  };
  migrateLocal();
  const getAllEvents = () => [...baseEvents, ...getProEvents()];
  const getEvent = id => getAllEvents().find(e => String(e.id) === String(id));

  // « Ajouter au calendrier » : fichier .ics généré côté client, compatible
  // Apple/Google/Outlook. Heure locale flottante (événements locaux),
  // durée par défaut 4 h si pas d'heure de fin connue.
  const downloadICS = ev => {
    const esc = s => String(s || '').replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');
    const p = n => String(n).padStart(2, '0');
    const start = new Date(`${ev.date}T${ev.time || '20:00'}:00`);
    const end = new Date(start.getTime() + 4 * 36e5);
    const local = x => `${x.getFullYear()}${p(x.getMonth() + 1)}${p(x.getDate())}T${p(x.getHours())}${p(x.getMinutes())}00`;
    const now = new Date();
    const stampUTC = `${now.getUTCFullYear()}${p(now.getUTCMonth() + 1)}${p(now.getUTCDate())}T${p(now.getUTCHours())}${p(now.getUTCMinutes())}${p(now.getUTCSeconds())}Z`;
    const link = location.origin + location.pathname.replace(/[^/]*$/, '') + 'evenement.html?id=' + ev.id;
    const lines = [
      'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//SYFIR//Billetterie//FR', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH',
      'BEGIN:VEVENT',
      `UID:syfir-${ev.id}-${(ev.date || '').replace(/-/g, '')}@syfir`,
      `DTSTAMP:${stampUTC}`,
      `DTSTART:${local(start)}`,
      `DTEND:${local(end)}`,
      `SUMMARY:${esc(ev.name)}`,
      `LOCATION:${esc([ev.venue, ev.city].filter(Boolean).join(', '))}`,
      `DESCRIPTION:${esc(`${typeLabel[ev.type] || 'Événement'} SYFIR — organisé par ${ev.organizer || 'SYFIR'}. Billets et infos : ${link}`)}`,
      `URL:${link}`,
      'END:VEVENT', 'END:VCALENDAR'
    ];
    const blob = new Blob([lines.join('\r\n') + '\r\n'], { type: 'text/calendar;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = (ev.name || 'evenement-syfir').toLowerCase().normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') + '.ics';
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  };

  window.SYFIR = { TIERS_DEFAULT, MONTHS, baseEvents, typeLabel, euro, fmtTime, priceRange, mapsUrl, getProEvents, getAllEvents, getEvent, countdownText, downloadICS, escapeHtml, stockLabel };
})();
