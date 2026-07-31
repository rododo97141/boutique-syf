/* ============================================================
   SYFIR — Données événements partagées (source unique)
   Utilisé par script.js (billetterie) ET evenement.html (fiche).
   Expose window.SYFIR.
============================================================ */
(function () {
  'use strict';

  const TIERS_DEFAULT = [
    { name: 'Early Bird', desc: 'Quantité limitée', mult: 0.8, scarce: true },
    { name: 'Entrée', desc: 'Accès à l\'événement', mult: 1, reco: true },
    { name: 'VIP Golden Hour', desc: 'Carré VIP', mult: 2.2 }
  ];

  const MONTHS = ['JAN', 'FÉV', 'MAR', 'AVR', 'MAI', 'JUIN', 'JUIL', 'AOÛT', 'SEP', 'OCT', 'NOV', 'DÉC'];

  // Échappement HTML systématique : toute donnée dynamique (localStorage,
  // formulaires, data-attributes) passe par ici avant innerHTML.
  const escapeHtml = s => String(s ?? '').replace(/[&<>"']/g,
    c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  /* R82.1c : plus AUCUN événement fictif dans la version publique. Les 9
     événements de démonstration (lieux, dates, prix, stocks inventés) sont
     archivés dans dev/demo-data-evenements.md, non chargé en production.
     Les pages affichent leurs états vides honnêtes tant qu'aucun événement
     réel n'est publié ; les vrais événements créés via l'espace pro
     (getProEvents) continuent d'apparaître normalement. */
  const baseEvents = [];

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

  /* R82.1.1 : condition d'âge PAR ÉVÉNEMENT — SYFIR n'est pas un site
     consacré à l'alcool, ses événements peuvent avoir des conditions
     d'âge différentes. `ageStatus` : 'tout-public' | '16-plus' |
     '18-plus' | 'a-confirmer' (défaut si absent — aucune supposition).
     Ne prétend jamais vérifier juridiquement l'âge : simple affichage
     de la condition, à faire respecter par l'organisateur/le lieu. */
  const ageLabel = ev => {
    const s = (ev && ev.ageStatus) || 'a-confirmer';
    if (s === 'tout-public') return { text: 'Tout public', cls: 'age-all', icon: '👪', reminder: null };
    if (s === '16-plus') return { text: '16 ans et plus', cls: 'age-16', icon: '🔞', reminder: 'Cet événement est réservé aux 16 ans et plus. L\'organisateur ou le lieu peut demander un justificatif à l\'entrée.' };
    if (s === '18-plus') return { text: '18 ans et plus', cls: 'age-18', icon: '🔞', reminder: 'Cet événement est réservé aux 18 ans et plus. L\'organisateur ou le lieu peut demander un justificatif à l\'entrée.' };
    return { text: 'Condition d\'âge à confirmer', cls: 'age-tbd', icon: '❔', reminder: 'La condition d\'âge de cet événement n\'est pas encore confirmée par l\'organisateur — renseigne-toi avant de réserver.' };
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
        if (!ev.ageStatus) { ev.ageStatus = 'a-confirmer'; dirty = true; }
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
    /* RFC 5545 §3.1 : une ligne ne devrait pas dépasser 75 OCTETS. Le
       repli se fait donc sur les octets, pas sur les caractères — sinon on
       couperait un caractère accentué en deux et le fichier deviendrait
       illisible. Les lignes de continuation commencent par une espace.
       Mesuré avant correction : la ligne DESCRIPTION faisait 108 octets. */
    const fold = line => {
      const enc = new TextEncoder(), dec = new TextDecoder();
      const bytes = enc.encode(line);
      if (bytes.length <= 75) return line;
      const out = [];
      let i = 0, limit = 75;
      while (i < bytes.length) {
        let take = Math.min(limit, bytes.length - i);
        // ne jamais couper au milieu d'un caractère UTF-8
        while (take > 1 && (bytes[i + take] & 0xC0) === 0x80) take--;
        out.push((out.length ? ' ' : '') + dec.decode(bytes.slice(i, i + take)));
        i += take;
        limit = 74;   // l'espace de continuation compte dans les 75
      }
      return out.join('\r\n');
    };
    const blob = new Blob([lines.map(fold).join('\r\n') + '\r\n'], { type: 'text/calendar;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = (ev.name || 'evenement-syfir').toLowerCase().normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') + '.ics';
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  };

  window.SYFIR = { TIERS_DEFAULT, MONTHS, baseEvents, typeLabel, euro, fmtTime, priceRange, mapsUrl, getProEvents, getAllEvents, getEvent, countdownText, downloadICS, escapeHtml, stockLabel, ageLabel };
})();
