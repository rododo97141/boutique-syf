/* ============================================================
   AVYR — site autonome
   script.js — Vanilla JS uniquement, zéro dépendance sur le site SYFIR.
   ------------------------------------------------------------
   Sommaire :
   01. HELPERS (esc, picHTML, formulaires démo)
   02. NAVBAR + MENU MOBILE
   03. REVEAL ON SCROLL
   04. TOAST
   05. MENU DE THÈME
   06. ÂGE 18+ (auto-déclaration, sans vérification d'identité)
   07. LOCALISATEUR DE POINTS DE VENTE
   08. CARROUSEL MÉDIA (galerie produit)
   09. FICHE PRODUIT DÉDIÉE (produit.html?id=X)
   10. FORMULAIRES (newsletter + contact professionnel)
============================================================ */
(() => {
  'use strict';

  /* ===== 01. HELPERS ===== */
  const $  = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
  const esc = s => String(s ?? '').replace(/[&<>"']/g,
    c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  window.AVYR = window.AVYR || {};
  window.AVYR.escapeHtml = esc;

  // <picture> webp+jpg pour les images locales (webp garanti à côté du jpg).
  const picHTML = (src, attrs = '') => {
    const w = /\/produits\/[^"']+\.jpe?g$/i.test(src) ? src.replace(/\.jpe?g$/i, '.webp') : null;
    return w
      ? `<picture><source type="image/webp" srcset="${esc(w)}"><img src="${esc(src)}" ${attrs}></picture>`
      : `<img src="${esc(src)}" ${attrs}>`;
  };
  window.AVYR.picHTML = picHTML;

  /* Formulaires : même mécanisme honnête que le site SYFIR — vide = mode
     démo, aucun envoi réseau, aucun stockage local automatique. */
  const FORM_ENDPOINT = '';
  const DEMO_FORM_MSG = 'L\'envoi en ligne n\'est pas encore actif. Tes informations restent dans ce formulaire, sur cet écran — rien n\'est enregistré ni transmis.';
  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  const submitForm = async data => {
    if (data._gotcha) return { ok: true, bot: true };
    if (!FORM_ENDPOINT) return { ok: false, demo: true };
    try {
      const r = await fetch(FORM_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(data)
      });
      return { ok: r.ok };
    } catch { return { ok: false }; }
  };
  const addDemoNote = btn => {
    if (FORM_ENDPOINT || !btn || btn.parentNode?.querySelector('.form-demo-note')) return;
    const note = document.createElement('span');
    note.className = 'form-demo-note';
    note.textContent = 'démo — transmission bientôt active';
    btn.insertAdjacentElement('afterend', note);
  };

  /* ===== 02. NAVBAR + MENU MOBILE ===== */
  const nav = $('#nav');
  const onScrollNav = () => nav?.classList.toggle('scrolled', window.scrollY > 40);
  window.addEventListener('scroll', onScrollNav, { passive: true });
  onScrollNav();

  (function initMobileNav() {
    const menu = document.getElementById('mobileNav');
    const burger = document.getElementById('burgerBtn');
    if (!menu || !burger) return;
    const close = () => { menu.classList.remove('open'); document.body.style.overflow = ''; burger.setAttribute('aria-expanded', 'false'); };
    const open = () => { menu.classList.add('open'); document.body.style.overflow = 'hidden'; burger.setAttribute('aria-expanded', 'true'); menu.querySelector('a, button:not(.mobile-close)')?.focus(); };
    burger.setAttribute('aria-expanded', 'false');
    burger.setAttribute('aria-haspopup', 'true');
    burger.addEventListener('click', () => menu.classList.contains('open') ? close() : open());
    menu.querySelector('#closeNav')?.addEventListener('click', close);
    $$('a', menu).forEach(a => a.addEventListener('click', close));
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && menu.classList.contains('open')) { close(); burger.focus(); } });
  })();

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
  $$('.skip-link').forEach(a => {
    a.addEventListener('click', () => {
      const t = document.getElementById(a.getAttribute('href').slice(1));
      if (t) { t.setAttribute('tabindex', '-1'); t.focus(); }
    });
  });
  document.querySelector('.nav-link.active')?.setAttribute('aria-current', 'page');

  /* ===== 03. REVEAL ON SCROLL ===== */
  const reveals = $$('.reveal');
  const inViewport = el => {
    const r = el.getBoundingClientRect();
    return r.top < window.innerHeight * 0.95 && r.bottom > 0;
  };
  reveals.forEach(el => { if (inViewport(el)) el.classList.add('in'); });
  reveals.forEach(el => el.addEventListener('animationend', () => el.classList.add('in-done'), { once: true }));
  const revealObs = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); revealObs.unobserve(e.target); } });
  }, { threshold: 0, rootMargin: '0px 0px -8% 0px' });
  reveals.forEach(el => { if (!el.classList.contains('in')) revealObs.observe(el); });

  /* ===== 04. TOAST ===== */
  const toastEl = $('#toast');
  let toastTimer;
  const showToast = msg => {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('show'), 3200);
  };

  /* ===== 05. MENU DE THÈME : AUTOMATIQUE / CLAIR / SOMBRE =====
     Même mécanisme que le site SYFIR (clé localStorage commune
     'syfir-theme') : simple convention de nommage partagée, aucune
     dépendance fonctionnelle entre les deux sites. */
  const themeSwitch = $('#themeSwitch');
  const themeBtn    = $('#themeBtn');
  const themeMenu   = $('#themeMenu');
  const themeOpts   = $$('.theme-opt', themeSwitch || document.createElement('div'));
  const themeByHour = () => { const h = new Date().getHours(); return h >= 7 && h < 19 ? 'light' : 'dark'; };
  const themeIcon = { auto: '🌗', light: '☀️', dark: '🌙' };
  const applyTheme = pref => {
    const mode = pref === 'auto' ? themeByHour() : pref;
    document.documentElement.setAttribute('data-theme', mode);
    document.documentElement.setAttribute('data-theme-pref', pref);
    if (themeBtn) {
      themeBtn.textContent = themeIcon[pref] || themeIcon.auto;
      themeBtn.title = 'Thème : ' + (pref === 'auto' ? `automatique (${themeByHour() === 'light' ? 'jour' : 'nuit'})` : pref === 'light' ? 'clair' : 'sombre');
    }
    themeOpts.forEach(o => o.setAttribute('aria-checked', String(o.dataset.theme === pref)));
  };
  let themePref = localStorage.getItem('syfir-theme') || 'auto';
  applyTheme(themePref);
  const closeThemeMenu = () => {
    if (!themeMenu || themeMenu.hidden) return;
    themeMenu.hidden = true;
    themeBtn?.setAttribute('aria-expanded', 'false');
    document.removeEventListener('click', onThemeOutside);
    document.removeEventListener('keydown', onThemeKey);
  };
  const onThemeOutside = e => { if (!themeSwitch.contains(e.target)) closeThemeMenu(); };
  const onThemeKey = e => { if (e.key === 'Escape') { closeThemeMenu(); themeBtn?.focus(); } };
  const openThemeMenu = () => {
    if (!themeMenu) return;
    themeMenu.hidden = false;
    themeBtn?.setAttribute('aria-expanded', 'true');
    setTimeout(() => { document.addEventListener('click', onThemeOutside); document.addEventListener('keydown', onThemeKey); });
  };
  themeBtn?.addEventListener('click', e => { e.stopPropagation(); themeMenu.hidden ? openThemeMenu() : closeThemeMenu(); });
  themeOpts.forEach(opt => {
    opt.addEventListener('click', () => {
      themePref = opt.dataset.theme;
      localStorage.setItem('syfir-theme', themePref);
      applyTheme(themePref);
      closeThemeMenu();
      showToast(themePref === 'auto' ? '🌗 Thème automatique — clair le jour, sombre la nuit' : themePref === 'light' ? '☀️ Mode clair activé' : '🌙 Mode sombre activé');
    });
  });
  setInterval(() => { if (themePref === 'auto') applyTheme('auto'); }, 60000);

  /* ===== 06. ÂGE 18+ =====
     AVYR est une marque de cocktails alcoolisés : auto-déclaration d'âge
     à l'entrée, affichée une fois par appareil (localStorage). Comme sur
     le site SYFIR, ceci n'est PAS une vérification d'identité — un simple
     clic suffit ; formulé honnêtement, sans sur-promettre un contrôle
     qui n'existe pas (R82 section 8). */
  if (!localStorage.getItem('syfir-age-ok')) {
    const gate = document.createElement('div');
    gate.className = 'age-gate';
    gate.setAttribute('role', 'dialog');
    gate.setAttribute('aria-modal', 'true');
    gate.setAttribute('aria-labelledby', 'ageTitle');
    gate.innerHTML = `
      <div class="age-box">
        <p class="age-logo">AVYR</p>
        <h2 id="ageTitle">Avez-vous 18 ans ?</h2>
        <p class="age-sub">AVYR est une marque indépendante de cocktails alcoolisés.<br>Pour continuer, confirme que tu as l'âge légal.</p>
        <div class="age-actions">
          <button class="btn btn-solid" id="ageYes" type="button">Oui, j'ai 18 ans ou plus</button>
          <button class="btn btn-ghost" id="ageNo" type="button">Non, pas encore</button>
        </div>
        <p class="age-note">L'abus d'alcool est dangereux pour la santé, à consommer avec modération.</p>
      </div>`;
    document.body.appendChild(gate);
    document.body.style.overflow = 'hidden';
    const ageYes = gate.querySelector('#ageYes');
    requestAnimationFrame(() => ageYes.focus());
    gate.addEventListener('keydown', e => {
      if (e.key !== 'Tab') return;
      const f = [...gate.querySelectorAll('button, a')];
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });
    ageYes.addEventListener('click', () => {
      localStorage.setItem('syfir-age-ok', '1');
      gate.classList.add('age-out');
      document.body.style.overflow = '';
      setTimeout(() => gate.remove(), 450);
    });
    gate.querySelector('#ageNo').addEventListener('click', () => {
      gate.querySelector('.age-box').innerHTML = `
        <p class="age-logo">AVYR</p>
        <h2 id="ageTitle">À très vite ✦</h2>
        <p class="age-sub">Ce site est réservé aux personnes majeures.<br>Pour s'informer sur l'alcool et être accompagné :</p>
        <div class="age-actions">
          <a class="btn btn-solid" href="https://www.alcool-info-service.fr" rel="noopener">alcool-info-service.fr</a>
        </div>
        <p class="age-note">L'abus d'alcool est dangereux pour la santé.</p>`;
      gate.querySelector('a').focus();
    });
  }

  /* ===== 07. LOCALISATEUR DE POINTS DE VENTE =====
     Clic/clavier sur un pin -> surligne + scrolle la carte du point de vente. */
  const locatorMap = $('#locatorMap');
  const mapPins = $$('.map-pin');
  if (locatorMap && mapPins.length) {
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const activatePin = pin => {
      const card = document.getElementById(pin.dataset.target);
      if (!card) return;
      $$('.place-card').forEach(c => c.classList.remove('place-card--pinned'));
      mapPins.forEach(p => p.classList.remove('pin-selected'));
      pin.classList.add('pin-selected');
      card.classList.add('place-card--pinned');
      card.setAttribute('tabindex', '-1');
      card.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' });
      card.focus({ preventScroll: true });
      setTimeout(() => card.classList.remove('place-card--pinned'), 2600);
    };
    locatorMap.addEventListener('click', e => { const pin = e.target.closest('.map-pin'); if (pin) activatePin(pin); });
    locatorMap.addEventListener('keydown', e => {
      const pin = e.target.closest('.map-pin');
      if (pin && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); activatePin(pin); }
    });
  }

  /* ===== 08. CARROUSEL MÉDIA (galerie produit) ===== */
  const buildMediaCarousel = (box, { photos = '', video = '', name = '', badge = '', note = '' }) => {
    const list = photos.split('|').map(s => s.trim()).filter(Boolean).slice(0, 5);
    if (!list.length) return;
    const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const videoSources = video.split('|').map(s => s.trim()).filter(Boolean)
      .map(u => `<source src="${u}" type="video/mp4">`).join('');
    const videoSlide = video
      ? `<div class="car-slide car-slide-video car-video-live" role="group" aria-roledescription="diapositive">
           <video muted loop autoplay playsinline preload="metadata" aria-label="Vidéo de ${esc(name)}">${videoSources}</video>
           <button class="car-sound" type="button" aria-label="Activer le son" aria-pressed="false">🔇</button>
         </div>`
      : `<div class="car-slide car-slide-video car-video-soon" role="group" aria-roledescription="diapositive">
           <span class="car-soon-ic" aria-hidden="true">🎬</span><p>Vidéo bientôt disponible</p>
         </div>`;
    box.classList.add('media-car');
    box.setAttribute('role', 'group');
    box.setAttribute('aria-roledescription', 'carrousel');
    box.setAttribute('aria-label', `Galerie de ${name}`);
    box.tabIndex = 0;
    const photoSlides = list.map((src, i) => `
        <div class="car-slide" role="group" aria-roledescription="diapositive">
          ${picHTML(src, `alt="${esc(name)} — photo ${i + 1}" loading="${i === 0 ? 'eager' : 'lazy'}" decoding="async"`)}
        </div>`).join('');
    box.innerHTML = `
      <div class="car-track">${videoSlide + photoSlides}</div>
      <button class="car-btn car-prev" type="button" aria-label="Média précédent">‹</button>
      <button class="car-btn car-next" type="button" aria-label="Média suivant">›</button>
      <div class="car-dots"></div>
      ${note ? `<span class="car-note">${esc(note)}</span>` : ''}
      ${badge ? `<span class="artist-badge">${esc(badge)}</span>` : ''}`;
    const track = box.querySelector('.car-track');
    const dotsBox = box.querySelector('.car-dots');
    const prev = box.querySelector('.car-prev');
    const next = box.querySelector('.car-next');
    let index = 0;
    const slides = () => [...track.children];
    const refresh = () => {
      const s = slides();
      s.forEach((sl, i) => sl.setAttribute('aria-label', `${i + 1} sur ${s.length}`));
      dotsBox.innerHTML = s.map((_, i) => `<button class="car-dot ${i === index ? 'on' : ''}" type="button" data-i="${i}" aria-label="Aller au média ${i + 1}" aria-current="${i === index}"></button>`).join('');
      prev.disabled = index <= 0;
      next.disabled = index >= s.length - 1;
      const single = s.length < 2;
      prev.hidden = next.hidden = dotsBox.hidden = single;
    };
    const go = i => {
      index = Math.max(0, Math.min(i, slides().length - 1));
      track.scrollTo({ left: index * track.clientWidth, behavior: reducedMotion ? 'auto' : 'smooth' });
      refresh();
    };
    box.querySelectorAll('.car-slide:not(.car-slide-video) img').forEach(img => {
      img.addEventListener('error', () => { img.closest('.car-slide')?.remove(); index = Math.min(index, slides().length - 1); refresh(); });
    });
    let tick = false;
    track.addEventListener('scroll', () => {
      if (tick) return;
      tick = true;
      requestAnimationFrame(() => { const i = Math.round(track.scrollLeft / Math.max(1, track.clientWidth)); if (i !== index) { index = i; refresh(); } tick = false; });
    }, { passive: true });
    prev.addEventListener('click', e => { e.stopPropagation(); go(index - 1); });
    next.addEventListener('click', e => { e.stopPropagation(); go(index + 1); });
    dotsBox.addEventListener('click', e => { e.stopPropagation(); const d = e.target.closest('.car-dot'); if (d) go(+d.dataset.i); });
    box.addEventListener('keydown', e => { if (e.key === 'ArrowLeft') { e.preventDefault(); go(index - 1); } if (e.key === 'ArrowRight') { e.preventDefault(); go(index + 1); } });
    const soundBtn = box.querySelector('.car-sound');
    soundBtn?.addEventListener('click', e => {
      e.stopPropagation();
      const v = soundBtn.parentElement.querySelector('video');
      v.muted = !v.muted;
      soundBtn.textContent = v.muted ? '🔇' : '🔊';
      soundBtn.setAttribute('aria-label', v.muted ? 'Activer le son' : 'Couper le son');
      soundBtn.setAttribute('aria-pressed', String(!v.muted));
      if (v.paused) v.play().catch(() => {});
    });
    refresh();
  };
  window.AVYR.buildMediaCarousel = buildMediaCarousel;

  /* ===== 10. FORMULAIRES (newsletter + contact professionnel) =====
     Même mécanisme honnête que SYFIR : mode démo tant que FORM_ENDPOINT
     est vide, honeypot anti-spam, aucun stockage local automatique. */
  $$('.footer-news').forEach(form => {
    addDemoNote(form.querySelector('button[type="submit"]'));
    form.addEventListener('submit', async e => {
      e.preventDefault();
      const input = form.querySelector('input[type="email"]');
      const msg = form.querySelector('.footer-news-msg');
      const btn = form.querySelector('button[type="submit"]');
      const email = input.value.trim();
      const hp = form.querySelector('input[name="_gotcha"]')?.value || '';
      msg.hidden = false; msg.classList.remove('is-error');
      if (!emailRe.test(email)) { msg.textContent = 'Entre une adresse email valide.'; msg.classList.add('is-error'); input.focus(); return; }
      const label = btn ? btn.textContent : '';
      if (btn) { btn.disabled = true; btn.textContent = '…'; }
      const res = await submitForm({ email, _gotcha: hp, source: 'avyr-newsletter' });
      if (btn) { btn.disabled = false; btn.textContent = label; }
      if (res.demo) msg.textContent = '✦ ' + DEMO_FORM_MSG;
      else if (res.ok) { msg.textContent = '✦ Inscription confirmée !'; form.reset(); }
      else { msg.textContent = 'Oups, l\'envoi a échoué. Réessaie dans un instant.'; msg.classList.add('is-error'); }
    });
  });

  $$('.avyr-contact-form').forEach(form => {
    const btn = form.querySelector('button[type="submit"]');
    addDemoNote(btn);
    form.addEventListener('submit', async e => {
      e.preventDefault();
      const msg = form.querySelector('.avyr-contact-msg');
      const hp = form.querySelector('input[name="_gotcha"]')?.value || '';
      const data = Object.fromEntries(new FormData(form).entries());
      msg.hidden = false; msg.classList.remove('is-error');
      const email = (data.email || '').trim();
      if (!emailRe.test(email)) { msg.textContent = 'Entre une adresse email valide.'; msg.classList.add('is-error'); form.querySelector('input[type="email"]')?.focus(); return; }
      const label = btn ? btn.textContent : '';
      if (btn) { btn.disabled = true; btn.textContent = '…'; }
      const res = await submitForm({ ...data, _gotcha: hp });
      if (btn) { btn.disabled = false; btn.textContent = label; }
      if (res.demo) msg.textContent = '✦ ' + DEMO_FORM_MSG;
      else if (res.ok) { msg.textContent = '✦ Message envoyé, merci !'; form.reset(); }
      else { msg.textContent = 'Oups, l\'envoi a échoué. Réessaie dans un instant.'; msg.classList.add('is-error'); }
    });
  });

  /* ===== 09. FICHE PRODUIT DÉDIÉE (produit.html?id=X) =====
     Rendu déclenché depuis la page elle-même via window.AVYR.renderProduct(). */
  window.AVYR.renderProduct = function renderProduct() {
    const A = window.AVYR;
    const id = new URLSearchParams(location.search).get('id');
    const p = (id != null && A.getProduct) ? A.getProduct(id) : null;
    const detail = $('#productDetail');
    const notFound = $('#productNotFound');
    if (!p) { if (notFound) notFound.hidden = false; const t = document.getElementById('pageTitle'); if (t) t.textContent = 'Signature introuvable — AVYR'; return; }

    const CANON_BASE = 'https://rododo97141.github.io/boutique-syf/avyr-site';
    const cleanName = p.name.replace(/™/g, '').trim();
    const shareText = `${cleanName} — ${p.notes}. AVYR cocktail.`;
    const absImg = `${CANON_BASE}/${p.ogImage}`;
    const setAttr = (sel, attr, val) => { const el = document.querySelector(sel); if (el) el.setAttribute(attr, val); };
    document.getElementById('pageTitle').textContent = `${cleanName} — AVYR cocktail`;
    setAttr('#metaDesc', 'content', `${p.desc}`);
    setAttr('#ogTitle', 'content', `${cleanName} — AVYR`);
    setAttr('#ogDesc', 'content', shareText);
    setAttr('#ogImage', 'content', p.ogImage);
    setAttr('#twImage', 'content', p.ogImage);
    setAttr('#ogUrl', 'content', location.href);
    setAttr('#canonical', 'href', `${CANON_BASE}/produit.html?id=${encodeURIComponent(p.id)}`);

    const ld = { '@context': 'https://schema.org', '@type': 'Product', name: cleanName, image: [absImg], description: p.desc, brand: { '@type': 'Brand', name: 'AVYR' }, category: 'Cocktail' };
    const ldScript = document.createElement('script');
    ldScript.type = 'application/ld+json';
    ldScript.textContent = JSON.stringify(ld).replace(/</g, '\\u003C');
    document.head.appendChild(ldScript);

    const ingHtml = (p.ingredients && p.ingredients.length) ? `
      <section class="pd-section container">
        <h2 class="pd-h2">Ce qu'il y a <em>dedans</em></h2>
        <p class="ck-sub-note">Les fruits sont visibles dans la pochette — voilà notre transparence.</p>
        <ul class="ing-grid">
          ${p.ingredients.map(([name, emoji, role]) => `
            <li class="ing-card">
              <span class="ing-emoji" aria-hidden="true">${esc(emoji || '•')}</span>
              <strong class="ing-name">${esc(name || '')}</strong>
              <span class="ing-role">${esc(role || '')}</span>
            </li>`).join('')}
        </ul>
      </section>` : '';

    const verre = 'images/produits/syf-planteur-verre.jpg';
    const formatsHtml = `
      <section class="pd-section container">
        <h2 class="pd-h2">Les deux <em>façons</em></h2>
        <div class="ck-formats pd-formats">
          <div class="ck-format">${picHTML(verre, 'alt="Servi sur glace au verre" loading="lazy" decoding="async" width="1086" height="1448"')}<div><strong>🥂 Sur place</strong><small>Servi au verre</small></div></div>
          <div class="ck-format">${picHTML(p.photos[0], `alt="La pochette ${esc(cleanName)} scellée" loading="lazy" decoding="async"`)}<div><strong>🛍️ À emporter</strong><small>Scellée — elle te suit partout</small></div></div>
        </div>
        <a class="btn btn-solid btn-full pd-where" href="points-de-vente.html">Où le trouver</a>
      </section>`;

    const selItems = (A.products || []).map(o => {
      const on = o.id === p.id;
      const thumb = (o.photos && o.photos[0]) || '';
      return `<a class="ck-sel-item${on ? ' active' : ''}" href="produit.html?id=${esc(o.id)}"${on ? ' aria-current="page"' : ''}>
        <span class="ck-sel-thumb">${picHTML(thumb, 'alt="" loading="lazy" decoding="async"')}</span>
        <span class="ck-sel-name">${esc(o.short || o.name)}</span>
      </a>`;
    }).join('');
    const selectorHtml = `
      <section class="pd-section container">
        <h2 class="pd-h2">Toute la <em>gamme</em></h2>
        <div class="ck-selector pd-selector" role="group" aria-label="Naviguer dans la collection AVYR">${selItems}</div>
      </section>`;

    detail.hidden = false;
    detail.innerHTML = `
      <div class="pd-top container">
        <div class="pd-hero"><div class="ck-hero pd-gallery"></div></div>
        <div class="pd-intro">
          <nav class="fiche-crumb" aria-label="Fil d'Ariane"><a href="collection.html">← Collection AVYR</a></nav>
          <p class="eyebrow">La collection</p>
          <h1 class="pd-title">${esc(cleanName)}</h1>
          <p class="pd-notes">${esc(p.notes)}</p>
          <p class="pd-desc">${esc(p.desc)}</p>
          <div class="serve-tags pd-serve">
            <span class="serve-tag">🥂 Sur place — verre</span>
            <span class="serve-tag">🛍️ À emporter — pochette</span>
          </div>
          <div class="pd-share">
            <button class="btn btn-solid btn-sm" id="pdShare" type="button">🔗 Partager</button>
            <a class="btn btn-ghost btn-sm" id="pdWhatsapp" target="_blank" rel="noopener">Partager sur WhatsApp</a>
          </div>
          <p class="pd-legal legal-note">L'abus d'alcool est dangereux pour la santé. À consommer avec modération. Vente interdite aux mineurs.</p>
        </div>
      </div>
      ${ingHtml}
      ${formatsHtml}
      ${selectorHtml}`;

    const gallery = detail.querySelector('.pd-gallery');
    if (gallery) buildMediaCarousel(gallery, { photos: p.photos.join('|'), video: p.video || '', name: cleanName, badge: p.badge || '' });

    const wa = $('#pdWhatsapp');
    if (wa) wa.href = 'https://wa.me/?text=' + encodeURIComponent(shareText + ' — ' + location.href);
    $('#pdShare')?.addEventListener('click', async () => {
      const data = { title: `${cleanName} — AVYR`, text: shareText, url: location.href };
      if (navigator.share) { try { await navigator.share(data); } catch (e) {} }
      else if (navigator.clipboard) { try { await navigator.clipboard.writeText(location.href); showToast('🔗 Lien copié dans le presse-papier !'); } catch (e) { showToast('Copie le lien depuis la barre d\'adresse.'); } }
      else showToast('Copie le lien depuis la barre d\'adresse.');
    });
  };
})();
