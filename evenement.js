/* ============================================================
   SYFIR — Fiche événement partageable (evenement.html?id=X)
   Réutilise les données partagées de window.SYFIR (events-data.js).
============================================================ */
(function () {
  'use strict';
  const S = window.SYFIR;
  const $ = (s, c = document) => c.querySelector(s);

  const id = new URLSearchParams(location.search).get('id');
  const ev = (id != null && S) ? S.getEvent(id) : null;

  const detail = $('#eventDetail');
  const notFound = $('#eventNotFound');

  // Toast local (le showToast de script.js est dans sa closure)
  const toastEl = $('#toast');
  let toastTimer;
  const toast = msg => {
    if (!toastEl) return;
    toastEl.textContent = msg; toastEl.classList.add('show');
    clearTimeout(toastTimer); toastTimer = setTimeout(() => toastEl.classList.remove('show'), 3200);
  };

  // --- Id inconnu : message propre + retour billetterie ---
  if (!ev) {
    if (notFound) notFound.hidden = false;
    const t = document.getElementById('pageTitle');
    if (t) t.textContent = 'Événement introuvable — SYFIR';
    return;
  }

  const d = new Date(ev.date + 'T12:00:00');
  const dateLong = d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const esc = S.escapeHtml;   // échappement HTML systématique
  const loc = [ev.city, ev.venue].filter(Boolean).join(' · ');
  const tag = ev.prive ? '🔒 Soirée privée' : (S.typeLabel[ev.type] || 'Événement');
  const genresHtml = (ev.genres || []).slice(0, 3).map(g => `<span class="event-genre">${esc(g)}</span>`).join('');
  const shareText = `${ev.name} · ${dateLong}${ev.time ? ' · ' + S.fmtTime(ev.time) : ''} · ${loc}`;

  // --- SEO & aperçus sociaux ---
  const setAttr = (sel, attr, val) => { const el = document.querySelector(sel); if (el) el.setAttribute(attr, val); };
  document.getElementById('pageTitle').textContent = `${ev.name} — SYFIR Événements`;
  setAttr('#metaDesc', 'content', shareText);
  setAttr('#ogTitle', 'content', `${ev.name} — SYFIR`);
  setAttr('#ogDesc', 'content', shareText);
  setAttr('#ogImage', 'content', ev.img);
  setAttr('#twImage', 'content', ev.img);
  setAttr('#ogUrl', 'content', location.href);

  // --- Données structurées JSON-LD MusicEvent (schema.org) ---
  const mults = S.TIERS_DEFAULT.map(t => t.mult);
  const lowP = +(ev.price * Math.min(...mults)).toFixed(2);
  const highP = +(ev.price * Math.max(...mults)).toFixed(2);
  const ld = {
    '@context': 'https://schema.org',
    '@type': 'MusicEvent',
    name: ev.name,
    startDate: `${ev.date}T${ev.time || '20:00'}:00`,
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    image: [ev.img],
    description: `${tag} SYFIR à ${ev.city}${ev.venue ? ' — ' + ev.venue : ''}. ${(ev.genres || []).join(', ')}`,
    location: { '@type': 'Place', name: ev.venue || ev.city, address: { '@type': 'PostalAddress', addressLocality: ev.city, addressCountry: 'GP' } },
    offers: { '@type': 'AggregateOffer', priceCurrency: 'EUR', lowPrice: lowP, highPrice: highP, availability: 'https://schema.org/InStock', url: location.href },
    performer: { '@type': 'MusicGroup', name: 'SYFIR' },
    organizer: { '@type': 'Organization', name: ev.organizer, url: location.origin }
  };
  const ldScript = document.createElement('script');
  ldScript.type = 'application/ld+json';
  ldScript.textContent = JSON.stringify(ld).replace(/</g, '\\u003C'); // pas de </script> injectable
  document.head.appendChild(ldScript);

  // --- Rendu de la fiche ---
  detail.hidden = false;
  detail.innerHTML = `
    <div class="ed-hero">
      <img class="ed-hero-img" src="${esc(ev.img)}" alt="${esc(ev.name)}" fetchpriority="high">
      <span class="ed-hero-tag ${ev.prive ? 'tag-prive' : ''}">${tag}</span>
    </div>
    <div class="ed-body container">
      <div class="ed-main">
        <p class="eyebrow">Billetterie SYFIR</p>
        <h1 class="ed-title">${esc(ev.name)}</h1>
        <ul class="ed-meta">
          <li>📅 <span class="ed-date">${dateLong}</span></li>
          ${ev.time ? `<li>🕘 ${S.fmtTime(ev.time)}</li>` : ''}
          <li><a href="${esc(S.mapsUrl(ev))}" target="_blank" rel="noopener">📍 ${esc(loc)} ↗</a></li>
          <li class="ed-countdown" data-countdown="${ev.date}T${ev.time || '20:00'}:00" hidden></li>
        </ul>
        ${genresHtml ? `<div class="event-genres ed-genres">${genresHtml}</div>` : ''}
        <p class="ed-organizer">Organisé par <strong>${esc(ev.organizer)}</strong></p>
        <div class="ed-share">
          <button class="btn btn-solid btn-sm" id="edShare">🔗 Partager</button>
          <a class="btn btn-ghost btn-sm" id="edWhatsapp" target="_blank" rel="noopener">Partager sur WhatsApp</a>
          <button class="btn btn-ghost btn-sm" id="edCalendar" type="button">📅 Ajouter au calendrier</button>
        </div>
        <p class="ed-share-note">Fais tourner — les meilleurs plans se partagent.</p>
      </div>
      <aside class="ed-tickets">
        <h2 class="ed-tickets-title">Billets</h2>
        <div class="private-gate" id="edGate" hidden>
          <p>🔒 Événement privé. Entre ton code d'accès :</p>
          <div class="gate-row">
            <input type="text" id="edGateCode" placeholder="CODE D'ACCÈS">
            <button class="btn btn-solid btn-sm" id="edGateBtn">Valider</button>
          </div>
          <span class="field-error" id="edGateError"></span>
        </div>
        <div id="edTiers"></div>
        <div class="ed-foot" id="edFoot">
          <div class="ed-total"><span>Total</span><strong id="edTotal">${S.euro(0)}</strong></div>
          <button class="btn btn-solid btn-full" id="edBuy" disabled>Réserver mes billets</button>
        </div>
        <p class="form-success" id="edSuccess" hidden></p>
        <button class="btn btn-ghost btn-full" id="edCalAfter" type="button" hidden>📅 Ajouter au calendrier</button>
      </aside>
    </div>`;

  $('#edWhatsapp').href = 'https://wa.me/?text=' + encodeURIComponent(shareText + ' — ' + location.href);

  // --- Tunnel billets (même logique que la modale de la billetterie) ---
  const tiersBox = $('#edTiers'), foot = $('#edFoot'), gate = $('#edGate');
  let tierQty = S.TIERS_DEFAULT.map(() => 0);

  const renderTiers = () => {
    tiersBox.innerHTML = S.TIERS_DEFAULT.map((t, i) => `
      <div class="tier ${tierQty[i] > 0 ? 'has-qty' : ''} ${t.reco ? 'tier-reco' : ''}">
        <div class="tier-info"><strong>${t.name}${t.reco ? ' <span class="tier-badge">Recommandé</span>' : ''}</strong><small${t.scarce ? ' class="tier-scarce"' : ''}>${t.desc}</small></div>
        <div class="tier-right">
          <span class="tier-price">${S.euro(ev.price * t.mult)}</span>
          <div class="tier-qty">
            <button class="qty-btn" data-tier="${i}" data-delta="-1" aria-label="Moins">−</button>
            <output>${tierQty[i]}</output>
            <button class="qty-btn" data-tier="${i}" data-delta="1" aria-label="Plus">+</button>
          </div>
        </div>
      </div>`).join('');
    const total = tierQty.reduce((s, q, i) => s + q * ev.price * S.TIERS_DEFAULT[i].mult, 0);
    $('#edTotal').textContent = S.euro(total);
    $('#edBuy').disabled = total === 0;
  };

  const showTickets = unlocked => {
    gate.hidden = unlocked;
    tiersBox.style.display = unlocked ? '' : 'none';
    foot.style.display = unlocked ? '' : 'none';
  };

  tiersBox.addEventListener('click', e => {
    const b = e.target.closest('.qty-btn'); if (!b) return;
    const i = +b.dataset.tier;
    tierQty[i] = Math.max(0, tierQty[i] + +b.dataset.delta);
    renderTiers();
  });

  $('#edBuy').addEventListener('click', () => {
    const bought = tierQty.map((q, i) => q > 0 ? `${q}× ${S.TIERS_DEFAULT[i].name}` : null).filter(Boolean).join(', ');
    const num = 'SYF-' + Date.now().toString(36).toUpperCase() + '-' + Math.floor(Math.random() * 900 + 100);
    let mine = [];
    try { mine = JSON.parse(localStorage.getItem('syfir-tickets')) || []; } catch (e) { mine = []; }
    mine.push({ event: ev.name, city: ev.city, date: ev.date, detail: bought, num });
    localStorage.setItem('syfir-tickets', JSON.stringify(mine));
    tiersBox.style.display = 'none'; foot.style.display = 'none';
    const ok = $('#edSuccess');
    let user = null; try { user = JSON.parse(localStorage.getItem('syfir-user')); } catch (err) { user = null; }
    const prenom = ((user && user.name) || '').trim().split(/\s+/)[0] || '';
    const count = tierQty.reduce((s2, q) => s2 + q, 0);
    ok.textContent = `🎉 C'est dans la poche${prenom ? ', ' + prenom : ''} ! Tu as ${count} billet${count > 1 ? 's' : ''} (${bought}) — N° ${num}. Retrouve-les dans Mon espace, sur la billetterie.`;
    ok.hidden = false;
    $('#edCalAfter').hidden = false;
    toast('🎉 C\'est dans la poche !');
  });

  $('#edCalendar').addEventListener('click', () => S.downloadICS(ev));
  $('#edCalAfter').addEventListener('click', () => S.downloadICS(ev));

  $('#edGateBtn').addEventListener('click', () => {
    const code = $('#edGateCode').value.trim().toUpperCase();
    if (code && code === (ev.code || '').toUpperCase()) { showTickets(true); toast('🔓 Accès débloqué !'); }
    else $('#edGateError').textContent = 'Code invalide. Vérifie ton invitation.';
  });

  // --- Partage (navigator.share, sinon copie du lien) ---
  $('#edShare').addEventListener('click', async () => {
    const data = { title: `SYFIR — ${ev.name}`, text: shareText, url: location.href };
    if (navigator.share) {
      try { await navigator.share(data); } catch (e) { /* partage annulé */ }
    } else if (navigator.clipboard) {
      try { await navigator.clipboard.writeText(location.href); toast('🔗 Lien copié dans le presse-papier !'); }
      catch (e) { toast('Copie le lien depuis la barre d\'adresse.'); }
    } else {
      toast('Copie le lien depuis la barre d\'adresse.');
    }
  });

  // Compte à rebours réel, sobre — masqué si l'événement est passé
  const cdEl = detail.querySelector('.ed-countdown');
  if (cdEl && S.countdownText) {
    const tickCd = () => {
      const t = S.countdownText(cdEl.dataset.countdown);
      cdEl.hidden = !t;
      if (t) cdEl.textContent = '⏳ ' + t;
    };
    tickCd();
    setInterval(tickCd, 60000);
  }

  showTickets(!ev.prive);
  renderTiers();

  /* --- « Tu aimeras aussi » : 3 événements à venir du même genre ou de
     la même ville — exploration à coût zéro, sans autoplay ni compteur --- */
  const startOfToday = new Date(); startOfToday.setHours(0, 0, 0, 0);
  const sameVibe = o =>
    (o.genres || []).some(g => (ev.genres || []).some(mine => mine.toLowerCase() === g.toLowerCase())) ||
    o.city === ev.city;
  const related = S.getAllEvents()
    .filter(o => String(o.id) !== String(ev.id) && !o.prive &&
                 new Date(o.date + 'T00:00:00') >= startOfToday && sameVibe(o))
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 3);

  if (related.length) {
    const sec = document.createElement('section');
    sec.className = 'ed-related container';
    sec.innerHTML = `
      <h2 class="ed-related-title">Tu aimeras <em>aussi</em></h2>
      <div class="ed-related-grid">
        ${related.map(o => `
        <a class="ed-related-card" href="evenement.html?id=${o.id}">
          <span class="ed-related-media"><img src="${esc(o.img)}" alt="" loading="lazy"></span>
          <strong>${esc(o.name)}</strong>
          <small>${new Date(o.date + 'T12:00:00').toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })} · ${esc(o.city)}</small>
        </a>`).join('')}
      </div>`;
    detail.appendChild(sec);
  }
})();
