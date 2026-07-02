/* ============================================================
   SYFIR — Données événements partagées (source unique)
   Utilisé par script.js (billetterie) ET evenement.html (fiche).
   Expose window.SYFIR.
============================================================ */
(function () {
  'use strict';

  const TIERS_DEFAULT = [
    { name: 'Early Bird', desc: 'Quantité limitée', mult: 0.8 },
    { name: 'Standard', desc: 'Entrée + 1 cocktail SYFIR', mult: 1, reco: true },
    { name: 'VIP Golden Hour', desc: 'Carré VIP + open cocktails', mult: 2.2 }
  ];

  const MONTHS = ['JAN', 'FÉV', 'MAR', 'AVR', 'MAI', 'JUIN', 'JUIL', 'AOÛT', 'SEP', 'OCT', 'NOV', 'DÉC'];

  const baseEvents = [
    { id: 1, name: 'SYFIR Sunset Beach Party', type: 'beach', city: 'Sainte-Anne', venue: 'Plage de la Caravelle', date: '2026-07-04', time: '18:00', price: 25, genres: ['Afro house', 'Zouk'],
      img: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=900&q=80', organizer: 'SYFIR Official', prive: false },
    { id: 2, name: 'Golden Hour Rooftop', type: 'rooftop', city: 'Paris', venue: 'Le Perchoir', date: '2026-06-26', time: '19:00', price: 35, genres: ['Deep house', 'Soul'],
      img: 'https://images.unsplash.com/photo-1496337589254-7e19d01cec44?w=900&q=80', organizer: 'SYFIR Official', prive: false },
    { id: 3, name: 'Coral Night — Club Edition', type: 'club', city: 'Pointe-à-Pitre', venue: 'Club Azur', date: '2026-07-11', time: '23:00', price: 20, genres: ['Shatta', 'Dancehall'],
      img: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=900&q=80', organizer: 'Club Azur × SYFIR', prive: false },
    { id: 4, name: 'SYFIR Tropical Festival', type: 'festival', city: 'Le Gosier', venue: 'Plage du Gosier', date: '2026-08-15', time: '16:00', price: 45, genres: ['Soca', 'Zouk', 'Afro house'],
      img: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=900&q=80', organizer: 'SYFIR Official', prive: false },
    { id: 5, name: 'Villa Privée — Édition Or', type: 'prive', city: 'Saint-Barthélemy', venue: 'Villa Gustavia', date: '2026-07-18', time: '21:00', price: 80, genres: ['House', 'Konpa'],
      img: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=900&q=80', organizer: 'Hôte privé × SYFIR', prive: true, code: 'SYFIR2026' },
    { id: 6, name: 'Pique-nique Golden Escape', type: 'beach', city: 'Deshaies', venue: 'Plage de Grande Anse', date: '2026-06-21', time: '12:00', price: 15, genres: ['Chill', 'Zouk'],
      img: 'https://images.unsplash.com/photo-1526481280693-3bfa7568e0f3?w=900&q=80', organizer: 'SYFIR Official', prive: false }
  ];

  const typeLabel = { beach: 'Beach Party', rooftop: 'Rooftop', festival: 'Festival', club: 'Club', soiree: 'Soirée', prive: 'Soirée privée' };

  const euro = n => n.toFixed(2).replace('.', ',') + ' €';
  const fmtTime = t => t ? t.replace(':', 'h') : '';
  const priceRange = ev => {
    const m = TIERS_DEFAULT.map(t => t.mult);
    const lo = ev.price * Math.min(...m), hi = ev.price * Math.max(...m);
    return lo === hi ? euro(lo) : `${euro(lo)} – ${euro(hi)}`;
  };
  const mapsUrl = ev => 'https://www.google.com/maps/search/?api=1&query=' +
    encodeURIComponent([ev.venue, ev.city, 'Guadeloupe'].filter(Boolean).join(', '));

  // Événements créés via l'espace pro (stockés en local)
  const getProEvents = () => {
    try { return JSON.parse(localStorage.getItem('syfir-pro-events')) || []; }
    catch { return []; }
  };
  const getAllEvents = () => [...baseEvents, ...getProEvents()];
  const getEvent = id => getAllEvents().find(e => String(e.id) === String(id));

  window.SYFIR = { TIERS_DEFAULT, MONTHS, baseEvents, typeLabel, euro, fmtTime, priceRange, mapsUrl, getProEvents, getAllEvents, getEvent };
})();
