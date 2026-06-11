/* ============================================================
   SYFIR — Le Cocktail Libre™
   script.js — Vanilla JS uniquement
   ------------------------------------------------------------
   Sommaire :
   01. Helpers
   02. Préloader
   03. Navbar dynamique + menu mobile
   04. Reveal on scroll
   05. Parallaxe douce
   06. Effet tilt premium (micro-interactions)
   07. Toast
   08. Où nous trouver : filtre des partenaires
   09. Formulaire partenaire intelligent + validation
   10. Page Événements : données & rendu
   11. Page Événements : filtres / recherche / tri
   12. Page Événements : modale billets (+ accès privé)
   13. Page Événements : espace client (onglets, connexion)
   14. Page Événements : espace pro (création + facturation)
============================================================ */

(() => {
  'use strict';

  /* ===== 01. HELPERS ===== */
  const $  = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
  const euro = n => n.toFixed(2).replace('.', ',') + ' €';
  const store = {
    get(key, fallback) {
      try { return JSON.parse(localStorage.getItem(key)) ?? fallback; }
      catch { return fallback; }
    },
    set(key, val) { localStorage.setItem(key, JSON.stringify(val)); }
  };

  /* ===== 02. PRÉLOADER ===== */
  const preloader = $('#preloader');
  if (preloader) {
    window.addEventListener('load', () => {
      setTimeout(() => preloader.classList.add('done'), 600);
    });
    // Sécurité : on ne bloque jamais plus de 2,5 s
    setTimeout(() => preloader.classList.add('done'), 2500);
  }

  /* ===== 03. NAVBAR DYNAMIQUE + MENU MOBILE ===== */
  const nav = $('#nav');
  const onScrollNav = () => nav && nav.classList.toggle('scrolled', window.scrollY > 40);
  window.addEventListener('scroll', onScrollNav, { passive: true });
  onScrollNav();

  // Lien actif selon la section visible
  const sections = $$('section[id], header[id]');
  const navLinks = $$('.nav-link');
  if (sections.length && navLinks.length) {
    const spy = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        navLinks.forEach(l => l.classList.toggle('active', l.getAttribute('href') === `#${e.target.id}`));
      });
    }, { rootMargin: '-40% 0px -55% 0px' });
    sections.forEach(s => spy.observe(s));
  }

  const mobileNav = $('#mobileNav');
  $('#burgerBtn')?.addEventListener('click', () => mobileNav.classList.add('open'));
  $('#closeNav')?.addEventListener('click', () => mobileNav.classList.remove('open'));
  $$('a', mobileNav || document.createElement('div')).forEach(a =>
    a.addEventListener('click', () => mobileNav.classList.remove('open')));

  // Smooth scroll avec décalage de navbar (ancres internes)
  $$('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const target = document.getElementById(a.getAttribute('href').slice(1));
      if (!target) return;
      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - 70;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });

  /* ===== 04. REVEAL ON SCROLL ===== */
  const revealObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('in'); revealObs.unobserve(e.target); }
    });
  }, { threshold: 0.12 });
  $$('.reveal').forEach(el => revealObs.observe(el));

  /* ===== 05. PARALLAXE DOUCE ===== */
  const parallaxEls = $$('[data-parallax]');
  if (parallaxEls.length && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    let ticking = false;
    window.addEventListener('scroll', () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        parallaxEls.forEach(el => {
          const speed = parseFloat(el.dataset.parallax) || 0.2;
          const rect = el.parentElement.getBoundingClientRect();
          if (rect.bottom > 0 && rect.top < innerHeight) {
            el.style.transform = `translateY(${rect.top * -speed}px)`;
          }
        });
        ticking = false;
      });
    }, { passive: true });
  }

  /* ===== 06. EFFET TILT PREMIUM ===== */
  if (matchMedia('(hover: hover)').matches) {
    $$('[data-tilt]').forEach(card => {
      card.addEventListener('mousemove', e => {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform = `perspective(900px) rotateX(${-y * 5}deg) rotateY(${x * 5}deg) translateY(-6px)`;
      });
      card.addEventListener('mouseleave', () => { card.style.transform = ''; });
    });
  }

  /* ===== 07. TOAST ===== */
  const toast = $('#toast');
  let toastTimer;
  const showToast = msg => {
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 3200);
  };

  /* ===== 08. OÙ NOUS TROUVER : FILTRE DES PARTENAIRES ===== */
  const placeChips = $('#placeChips');
  if (placeChips) {
    placeChips.addEventListener('click', e => {
      const chip = e.target.closest('.chip');
      if (!chip) return;
      $$('.chip', placeChips).forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      const type = chip.dataset.place;
      let visible = 0;
      $$('.place-card').forEach(card => {
        const show = type === 'tous' || card.dataset.type === type;
        card.hidden = !show;
        if (show) visible++;
      });
      $('#noPlaces').hidden = visible > 0;
    });
  }

  /* ===== 09. FORMULAIRE PARTENAIRE INTELLIGENT ===== */
  const validators = {
    name: v => v.trim().length >= 2 || 'Indiquez votre nom complet.',
    email: v => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) || 'Adresse email invalide.',
    phone: v => /^(\+?\d[\d\s.-]{8,14})$/.test(v.trim()) || 'Numéro de téléphone invalide.',
    required: v => v.trim().length > 0 || 'Ce champ est requis.',
    message: v => v.trim().length >= 10 || 'Donnez-nous un peu plus de détails (10 caractères min.).'
  };

  const setFieldState = (field, error) => {
    const wrap = field.closest('.form-field, .form-consent');
    if (!wrap) return !error;
    wrap.classList.toggle('invalid', !!error);
    const errEl = $('.field-error', wrap);
    if (errEl) errEl.textContent = error || '';
    return !error;
  };
  const check = (field, rule) => {
    const result = rule(field.value || '');
    return setFieldState(field, result === true ? '' : result);
  };

  const partnerForm = $('#partnerForm');
  if (partnerForm) {
    // Le champ contextuel s'adapte au type de demande choisi
    const contextConfig = {
      partenaire:   { label: 'Nom de l\'établissement *', placeholder: 'Le nom de votre lieu' },
      evenement:    { label: 'Type d\'événement *',       placeholder: 'Mariage, soirée privée, festival…' },
      distributeur: { label: 'Zone de distribution *',    placeholder: 'Région, département, île…' },
      autre:        { label: 'Objet de votre demande *',  placeholder: 'Presse, collaboration, idée…' }
    };
    $$('input[name="requestType"]', partnerForm).forEach(radio => {
      radio.addEventListener('change', () => {
        const conf = contextConfig[radio.value];
        $('#contextField label').textContent = conf.label;
        $('#pfContext').placeholder = conf.placeholder;
        setFieldState($('#pfContext'), '');
      });
    });

    // Validation à la volée dès qu'un champ a été touché
    const liveRules = [
      ['#pfName', validators.name], ['#pfEmail', validators.email],
      ['#pfPhone', validators.phone], ['#pfContext', validators.required],
      ['#pfMessage', validators.message]
    ];
    liveRules.forEach(([sel, rule]) => {
      const field = $(sel);
      field.addEventListener('blur', () => check(field, rule));
      field.addEventListener('input', () => {
        if (field.closest('.form-field').classList.contains('invalid')) check(field, rule);
      });
    });

    partnerForm.addEventListener('submit', e => {
      e.preventDefault();
      const consent = $('#pfConsent');
      const ok = [
        ...liveRules.map(([sel, rule]) => check($(sel), rule)),
        setFieldState(consent, consent.checked ? '' : 'Merci de cocher cette case.')
      ].every(Boolean);
      if (!ok) {
        $('.invalid', partnerForm)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
      }
      partnerForm.reset();
      $$('.invalid', partnerForm).forEach(el => el.classList.remove('invalid'));
      const success = $('#formSuccess');
      success.hidden = false;
      success.scrollIntoView({ behavior: 'smooth', block: 'center' });
      showToast('✦ Demande envoyée à l\'équipe SYFIR !');
    });
  }

  /* ============================================================
     PAGE ÉVÉNEMENTS — billetterie & espace pro
  ============================================================ */
  const eventsGrid = $('#eventsGrid');
  if (!eventsGrid) return; // tout ce qui suit ne concerne que evenements.html

  /* ===== 10. DONNÉES & RENDU ===== */
  const TIERS_DEFAULT = [
    { name: 'Early Bird', desc: 'Quantité limitée', mult: 0.8 },
    { name: 'Standard', desc: 'Entrée + 1 cocktail SYFIR', mult: 1 },
    { name: 'VIP Golden Hour', desc: 'Carré VIP + open cocktails', mult: 2.2 }
  ];
  const MONTHS = ['JAN', 'FÉV', 'MAR', 'AVR', 'MAI', 'JUIN', 'JUIL', 'AOÛT', 'SEP', 'OCT', 'NOV', 'DÉC'];

  const baseEvents = [
    { id: 1, name: 'SYFIR Sunset Beach Party', type: 'beach', city: 'Sainte-Anne', date: '2026-07-04', price: 25,
      img: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=900&q=80', organizer: 'SYFIR Official', prive: false },
    { id: 2, name: 'Golden Hour Rooftop', type: 'rooftop', city: 'Paris', date: '2026-06-26', price: 35,
      img: 'https://images.unsplash.com/photo-1496337589254-7e19d01cec44?w=900&q=80', organizer: 'SYFIR Official', prive: false },
    { id: 3, name: 'Coral Night — Club Edition', type: 'club', city: 'Pointe-à-Pitre', date: '2026-07-11', price: 20,
      img: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=900&q=80', organizer: 'Club Azur × SYFIR', prive: false },
    { id: 4, name: 'SYFIR Tropical Festival', type: 'festival', city: 'Le Gosier', date: '2026-08-15', price: 45,
      img: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=900&q=80', organizer: 'SYFIR Official', prive: false },
    { id: 5, name: 'Villa Privée — Édition Or', type: 'prive', city: 'Saint-Barthélemy', date: '2026-07-18', price: 80,
      img: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=900&q=80', organizer: 'Hôte privé × SYFIR', prive: true, code: 'SYFIR2026' },
    { id: 6, name: 'Pique-nique Golden Escape', type: 'beach', city: 'Deshaies', date: '2026-06-21', price: 15,
      img: 'https://images.unsplash.com/photo-1526481280693-3bfa7568e0f3?w=900&q=80', organizer: 'SYFIR Official', prive: false }
  ];
  // Les événements créés via l'espace pro sont conservés en local
  let events = [...baseEvents, ...store.get('syfir-pro-events', [])];

  const typeLabel = { beach: 'Beach Party', rooftop: 'Rooftop', festival: 'Festival', club: 'Club', prive: 'Soirée privée' };

  const eventCardHTML = (ev, i) => {
    const d = new Date(ev.date + 'T12:00:00');
    return `
    <article class="event-card" style="animation-delay:${i * 0.07}s">
      <div class="event-card-media">
        <img src="${ev.img}" alt="${ev.name}" loading="lazy">
        <span class="event-date"><strong>${d.getDate()}</strong><small>${MONTHS[d.getMonth()]}</small></span>
        <span class="event-tag ${ev.prive ? 'tag-prive' : ''}">${ev.prive ? '🔒 Privé' : typeLabel[ev.type] || 'Événement'}</span>
      </div>
      <div class="event-card-body">
        <h3>${ev.name}</h3>
        <p class="event-card-meta">📍 ${ev.city} · ${d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
        <div class="event-card-foot">
          <span class="event-price"><small>À partir de</small><strong>${euro(ev.price * 0.8)}</strong></span>
          <button class="btn btn-solid btn-sm" data-tickets="${ev.id}">Billets</button>
        </div>
        <p class="event-organizer">Organisé par ${ev.organizer}</p>
      </div>
    </article>`;
  };

  const cityFilter = $('#cityFilter');
  const refreshCityOptions = () => {
    const current = cityFilter.value;
    const cities = [...new Set(events.map(e => e.city))].sort();
    cityFilter.innerHTML = '<option value="">Toutes les villes</option>' +
      cities.map(c => `<option value="${c}" ${c === current ? 'selected' : ''}>${c}</option>`).join('');
  };

  /* ===== 11. FILTRES / RECHERCHE / TRI ===== */
  const state = { filter: 'tous', city: '', sort: 'date', search: '' };

  const renderEvents = () => {
    let list = events.filter(ev =>
      (state.filter === 'tous' || ev.type === state.filter || (state.filter === 'prive' && ev.prive)) &&
      (!state.city || ev.city === state.city) &&
      (!state.search || (ev.name + ' ' + ev.city + ' ' + ev.organizer).toLowerCase().includes(state.search))
    );
    list.sort((a, b) => state.sort === 'prix' ? a.price - b.price : a.date.localeCompare(b.date));
    eventsGrid.innerHTML = list.map(eventCardHTML).join('');
    $('#noResults').hidden = list.length > 0;
  };

  $('#filterChips').addEventListener('click', e => {
    const chip = e.target.closest('.chip');
    if (!chip) return;
    $$('.chip').forEach(c => c.classList.remove('active'));
    chip.classList.add('active');
    state.filter = chip.dataset.filter;
    renderEvents();
  });
  cityFilter.addEventListener('change', () => { state.city = cityFilter.value; renderEvents(); });
  $('#sortFilter').addEventListener('change', e => { state.sort = e.target.value; renderEvents(); });
  $('#eventSearch')?.addEventListener('input', e => { state.search = e.target.value.trim().toLowerCase(); renderEvents(); });

  refreshCityOptions();
  renderEvents();

  /* ===== 12. MODALE BILLETS ===== */
  const ticketModal = $('#ticketModal');
  let currentEvent = null;
  let tierQty = [];

  const openModal = m => { m.classList.add('open'); document.body.style.overflow = 'hidden'; };
  const closeModal = m => { m.classList.remove('open'); document.body.style.overflow = ''; };
  $$('.modal').forEach(m => {
    m.addEventListener('click', e => { if (e.target === m || e.target.closest('[data-close]')) closeModal(m); });
  });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') $$('.modal.open').forEach(closeModal); });

  const renderTiers = () => {
    $('#ticketTiers').innerHTML = TIERS_DEFAULT.map((t, i) => `
      <div class="tier ${tierQty[i] > 0 ? 'has-qty' : ''}">
        <div class="tier-info"><strong>${t.name}</strong><small>${t.desc}</small></div>
        <div class="tier-right">
          <span class="tier-price">${euro(currentEvent.price * t.mult)}</span>
          <div class="tier-qty">
            <button class="qty-btn" data-tier="${i}" data-delta="-1" aria-label="Moins">−</button>
            <output>${tierQty[i]}</output>
            <button class="qty-btn" data-tier="${i}" data-delta="1" aria-label="Plus">+</button>
          </div>
        </div>
      </div>`).join('');
    const total = tierQty.reduce((s, q, i) => s + q * currentEvent.price * TIERS_DEFAULT[i].mult, 0);
    $('#tmTotal').textContent = euro(total);
    $('#tmBuy').disabled = total === 0;
  };

  const showTicketArea = unlocked => {
    $('#privateGate').hidden = unlocked;
    $('#ticketTiers').style.display = unlocked ? '' : 'none';
    $('#modalFoot').style.display = unlocked ? '' : 'none';
  };

  eventsGrid.addEventListener('click', e => {
    const btn = e.target.closest('[data-tickets]');
    if (!btn) return;
    currentEvent = events.find(ev => ev.id === +btn.dataset.tickets);
    tierQty = TIERS_DEFAULT.map(() => 0);
    const d = new Date(currentEvent.date + 'T12:00:00');
    $('#tmImage').src = currentEvent.img;
    $('#tmImage').alt = currentEvent.name;
    $('#tmTag').textContent = currentEvent.prive ? '🔒 Soirée privée' : typeLabel[currentEvent.type] || 'Événement';
    $('#tmTitle').textContent = currentEvent.name;
    $('#tmMeta').textContent = `📍 ${currentEvent.city} · ${d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} · Organisé par ${currentEvent.organizer}`;
    $('#tmSuccess').hidden = true;
    $('#gateError').textContent = '';
    $('#gateCode').value = '';
    showTicketArea(!currentEvent.prive);
    renderTiers();
    openModal(ticketModal);
  });

  // Code d'accès pour les événements privés
  $('#gateSubmit').addEventListener('click', () => {
    const code = $('#gateCode').value.trim().toUpperCase();
    if (code && code === (currentEvent.code || '').toUpperCase()) {
      showTicketArea(true);
      showToast('🔓 Accès débloqué — bienvenue !');
    } else {
      $('#gateError').textContent = 'Code invalide. Vérifiez votre invitation.';
    }
  });

  $('#ticketTiers').addEventListener('click', e => {
    const btn = e.target.closest('.qty-btn');
    if (!btn) return;
    const i = +btn.dataset.tier;
    tierQty[i] = Math.max(0, tierQty[i] + +btn.dataset.delta);
    renderTiers();
  });

  $('#tmBuy').addEventListener('click', () => {
    const bought = tierQty.map((q, i) => q > 0 ? `${q}× ${TIERS_DEFAULT[i].name}` : null).filter(Boolean).join(', ');
    const myTickets = store.get('syfir-tickets', []);
    myTickets.push({ event: currentEvent.name, city: currentEvent.city, date: currentEvent.date, detail: bought });
    store.set('syfir-tickets', myTickets);
    $('#ticketTiers').style.display = 'none';
    $('#modalFoot').style.display = 'none';
    const ok = $('#tmSuccess');
    ok.textContent = `✦ Réservation confirmée : ${bought}. Vos billets (QR codes) sont disponibles dans votre espace client.`;
    ok.hidden = false;
    renderMyTickets();
  });

  /* ===== 13. ESPACE CLIENT ===== */
  const clientModal = $('#clientModal');
  const openClient = e => { e?.preventDefault(); openModal(clientModal); };
  $('#clientSpaceBtn')?.addEventListener('click', openClient);
  $('#clientSpaceBtnMobile')?.addEventListener('click', e => { openClient(e); mobileNav?.classList.remove('open'); });
  $('#footClientSpace')?.addEventListener('click', openClient);

  $('#clientTabs').addEventListener('click', e => {
    const tab = e.target.closest('.tab');
    if (!tab) return;
    $$('.tab').forEach(t => t.classList.remove('active'));
    $$('.tab-panel').forEach(p => p.classList.remove('active'));
    tab.classList.add('active');
    $(`#panel-${tab.dataset.tab}`).classList.add('active');
  });

  const renderMyTickets = () => {
    const myTickets = store.get('syfir-tickets', []);
    $('#myTickets').innerHTML = myTickets.length
      ? myTickets.map(t => `
        <div class="my-ticket">
          <div><strong>${t.event}</strong><small>${t.city} · ${new Date(t.date + 'T12:00:00').toLocaleDateString('fr-FR')} · ${t.detail}</small></div>
          <span class="qr" aria-label="QR code">▣</span>
        </div>`).join('')
      : '<p class="cart-empty">Aucun billet pour l\'instant. Vos réservations apparaîtront ici.</p>';
  };
  renderMyTickets();

  $('#panel-login').addEventListener('submit', e => {
    e.preventDefault();
    const okMail = check($('#clEmail'), validators.email);
    const okPass = check($('#clPass'), v => v.length >= 8 || '8 caractères minimum.');
    if (!okMail || !okPass) return;
    closeModal(clientModal);
    showToast('✦ Bienvenue dans votre espace SYFIR !');
  });

  $('#panel-register').addEventListener('submit', e => {
    e.preventDefault();
    const ok = [
      check($('#rgName'), validators.name),
      check($('#rgEmail'), validators.email),
      check($('#rgPass'), v => v.length >= 8 || '8 caractères minimum.')
    ].every(Boolean);
    if (!ok) return;
    closeModal(clientModal);
    showToast('✦ Compte créé ! Bienvenue dans la communauté SYFIR.');
  });

  /* ===== 14. ESPACE PRO — création + facturation ===== */
  const proForm = $('#proForm');
  const BASE_FEE = 49;

  // Le champ "code privé" n'apparaît que si l'événement est privé
  $$('input[name="evVisibility"]').forEach(r => {
    r.addEventListener('change', () => {
      $('#privateCodeField').hidden = r.value !== 'prive' || !r.checked;
    });
  });

  // Facturation estimée mise à jour en direct
  const updateBilling = () => {
    const optsTotal = $$('.ev-option:checked').reduce((s, c) => s + +c.dataset.cost, 0);
    $('#billingOptions').lastElementChild.textContent = euro(optsTotal);
    $('#billingTotal').textContent = euro(BASE_FEE + optsTotal);
  };
  $$('.ev-option').forEach(c => c.addEventListener('change', updateBilling));

  proForm.addEventListener('submit', e => {
    e.preventDefault();
    const isPrivate = $('input[name="evVisibility"]:checked').value === 'prive';
    const ok = [
      check($('#evName'), validators.required),
      check($('#evType'), validators.required),
      check($('#evDate'), v => (v && new Date(v) >= new Date().setHours(0, 0, 0, 0)) || 'Choisissez une date à venir.'),
      check($('#evCity'), validators.required),
      check($('#evPrice'), v => (v !== '' && +v >= 0) || 'Indiquez un prix valide.'),
      !isPrivate || check($('#evCode'), v => v.trim().length >= 4 || 'Code de 4 caractères minimum.')
    ].every(Boolean);
    if (!ok) {
      $('.invalid', proForm)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    const imgByType = {
      beach: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=900&q=80',
      rooftop: 'https://images.unsplash.com/photo-1496337589254-7e19d01cec44?w=900&q=80',
      festival: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=900&q=80',
      club: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=900&q=80'
    };
    const newEvent = {
      id: Date.now(),
      name: $('#evName').value.trim(),
      type: isPrivate ? 'prive' : $('#evType').value,
      city: $('#evCity').value.trim(),
      date: $('#evDate').value,
      price: +$('#evPrice').value,
      img: imgByType[$('#evType').value],
      organizer: 'Votre organisation × SYFIR',
      prive: isPrivate,
      code: isPrivate ? $('#evCode').value.trim().toUpperCase() : undefined
    };

    const proEvents = store.get('syfir-pro-events', []);
    proEvents.push(newEvent);
    store.set('syfir-pro-events', proEvents);
    events = [...baseEvents, ...proEvents];
    refreshCityOptions();
    renderEvents();

    const total = $('#billingTotal').textContent;
    const success = $('#proSuccess');
    success.textContent = isPrivate
      ? `✦ Événement privé créé ! Partagez le code « ${newEvent.code} » avec vos invités. Facturation : ${total} + 2,5 % par billet vendu.`
      : `✦ Événement publié dans la billetterie SYFIR ! Facturation : ${total} + 2,5 % par billet vendu.`;
    success.hidden = false;

    proForm.reset();
    $$('.invalid', proForm).forEach(el => el.classList.remove('invalid'));
    $('#privateCodeField').hidden = true;
    updateBilling();
    showToast('✦ Événement créé avec succès !');
    document.getElementById('billetterie').scrollIntoView({ behavior: 'smooth' });
  });

})();
