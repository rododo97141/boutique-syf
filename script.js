/* ============================================================
   SYFIR — Le Cocktail Libre™
   script.js — Vanilla JS uniquement
   ------------------------------------------------------------
   Sommaire :
   01. HELPERS
   02. NAVBAR DYNAMIQUE + MENU MOBILE
   03. REVEAL ON SCROLL
   04. PARALLAXE DOUCE
   05. TOAST
   06. MENU DE THÈME : AUTOMATIQUE / CLAIR / SOMBRE
   07. AGE GATE 18+
   08. OÙ NOUS TROUVER : FILTRE DES PARTENAIRES
   09. LINE-UP (artistes, DJs & groupes) : filtre + booking
   10. CARROUSEL MÉDIA (cartes artistes + modale)
   11. ÉCOUTE + FICHE ARTISTE
   12. FOND VIDÉO DU HERO (billetterie)
   13. FICHE PRODUIT COCKTAIL (modale)
   14. CARROUSEL DE LOGOS PARTENAIRES
   15. FICHE PARTENAIRE (modale)
   16. FORMULAIRE PARTENAIRE INTELLIGENT
   17. RETOUR EN HAUT + BARRE DE PROGRESSION (toutes pages)
   18. FAB BILLETS : un seul CTA principal par écran
   19. VIDÉO D'AMBIANCE (accueil, communauté)
   20. TILT 3D LÉGER (data-tilt : vitrines de la pochette)
   21. PWA : enregistrement du service worker
   22. QR CODE — encodeur inline, zéro dépendance
   23. NEWSLETTER (footer, toutes pages)
   24. PROCHAINS ÉVÉNEMENTS (accueil, conversion)
   25. COMPTE À REBOURS RÉEL (prochain événement, accueil)
   26. AGENDA DES CONCERTS : masquer les dates passées (accueil)
   27. FAVORIS + MODALES GÉNÉRIQUES (toutes pages)
   28. POUR TOI (accueil) — personnalisation locale
   29. MON PROFIL / MON ESPACE (toutes pages)
   30. DONNÉES & RENDU (source unique : events-data.js -> window.SYFIR)
   31. FILTRES / RECHERCHE / TRI / GROUPEMENT PAR JOUR
   32. MODALE BILLETS
   33. ESPACE PRO — création + facturation
============================================================ */

(() => {
  'use strict';

  /* ===== 01. HELPERS ===== */
  const $  = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
  const euro = n => n.toFixed(2).replace('.', ',') + ' €';
  const esc = window.SYFIR.escapeHtml;   // échappement HTML systématique
  const store = {
    get(key, fallback) {
      try { return JSON.parse(localStorage.getItem(key)) ?? fallback; }
      catch { return fallback; }
    },
    set(key, val) { localStorage.setItem(key, JSON.stringify(val)); }
  };

  /* ===== 01b. ENDPOINT DES FORMULAIRES (newsletter + partenaire) =====
     Vide = mode démo : confirmation locale, AUCUN envoi réseau.
     Pour brancher un vrai envoi, renseigner FORM_ENDPOINT :
       • Formspree (le plus simple, zéro backend) :
           'https://formspree.io/f/xxxxxxxx'  (crée le form sur formspree.io)
       • Brevo / Mailchimp / autre : une URL qui accepte un POST JSON.
     Anti-spam : chaque formulaire porte un honeypot (champ caché `_gotcha`),
     invisible pour l'humain ; s'il est rempli, c'est un bot → on ignore. */
  const FORM_ENDPOINT = '';
  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  const submitForm = async data => {
    if (data._gotcha) return { ok: true, bot: true };        // honeypot → abandon silencieux
    if (!FORM_ENDPOINT) return { ok: true, demo: true };      // mode démo
    try {
      const r = await fetch(FORM_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(data)
      });
      return { ok: r.ok };
    } catch { return { ok: false }; }
  };

  /* ===== 02. NAVBAR DYNAMIQUE + MENU MOBILE ===== */
  // Anciennes ancres de l'accueil -> pages dédiées (transposition maquette).
  // On ne redirige que si la cible n'existe pas sur la page courante.
  const movedAnchors = { '#cocktails': 'saveurs.html', '#communaute': 'syf-tv.html' };
  const movedTo = movedAnchors[location.hash];
  if (movedTo && !document.getElementById(location.hash.slice(1))) location.replace(movedTo);

  const nav = $('#nav');
  const onScrollNav = () => nav && nav.classList.toggle('scrolled', window.scrollY > 40);
  window.addEventListener('scroll', onScrollNav, { passive: true });
  onScrollNav();

  // Lien actif selon la section visible — uniquement pour les liens-ancres :
  // sur les pages dédiées (liens inter-pages), l'état actif est posé en dur dans le HTML
  const sections = $$('section[id], header[id]');
  const hashNavLinks = $$('.nav-link').filter(l => (l.getAttribute('href') || '').startsWith('#'));
  if (sections.length && hashNavLinks.length) {
    const spy = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        hashNavLinks.forEach(l => l.classList.toggle('active', l.getAttribute('href') === `#${e.target.id}`));
      });
    }, { rootMargin: '-40% 0px -55% 0px' });
    sections.forEach(s => spy.observe(s));
  }

  /* ===== 44. MÉGA-MENU PLEIN ÉCRAN (R8-B) — sidebar + pochettes + envies +
     recherche client-side. Ouvert par le burger et l'icône recherche. ===== */
  (function initMega() {
    const S = window.SYFIR;
    const pic = (base, alt) => `<picture><source type="image/webp" srcset="${base}.webp"><img src="${base}.jpg" loading="lazy" alt="${esc(alt)}"></picture>`;
    const prods = [
      ['saveurs.html#planteur', 'Syf Planteur', 'images/produits/syfir-planteur-marbre', 'Pochette Syf Planteur sur marbre'],
      ['saveurs.html#coral', 'Coral Breeze', 'images/produits/syfir-sachet-fruits-blanc', 'Pochette SYFIR entourée de fruits'],
      ['saveurs.html#golden', 'Golden Escape', 'images/produits/syfir-tropical-ananas', 'Pochette tropicale ananas'],
      ['saveurs.html', 'La lanière', 'images/produits/syfir-laniere-blanc', 'Lanière SYFIR'],
    ];
    const envies = [
      ['evenements.html', 'Fête', 'images/produits/syfir-pub-duo.jpg'],
      ['evenements.html', 'Plage', 'images/produits/syfir-pub-plage-1.jpg'],
      ['index.html#artistes', 'Concert', 'images/artiste-unity.jpg'],
      ['evenements.html', 'Privé', 'images/produits/syf-planteur-verre.jpg'],
    ];
    const idx = [
      ['Accueil', 'index.html#accueil', 'marque hero'],
      ['Notre Collection', 'saveurs.html', 'saveurs collection cocktails pochettes toutes'],
      ['Syf Planteur', 'saveurs.html#planteur', 'mangue passion ananas best-seller'],
      ['Syf Coral Breeze', 'saveurs.html#coral', 'agrumes hibiscus fruits rouges'],
      ['Syf Golden Escape', 'saveurs.html#golden', 'citron vert passion exotiques or'],
      ['Événements & Fêtes', 'evenements.html', 'billetterie soirées beach party festival'],
      ['Artistes', 'index.html#artistes', 'djs line-up groupes'],
      ['SYF TV', 'syf-tv.html', 'moments chaîne aftermovie ambiance'],
      ['Espace pro', 'espace-pro.html', 'organisateur smartboard billetterie'],
      ['Devenir partenaire', 'partenaires.html', 'partenaire investisseur lieu ambassadeur bars clubs hôtels distributeur'],
    ];
    if (S) S.getAllEvents().forEach(ev => idx.push([ev.name, 'evenement.html?id=' + ev.id, ev.city + ' ' + (S.typeLabel[ev.type] || '') + ' événement soirée']));

    const mega = document.createElement('div');
    mega.className = 'mega'; mega.id = 'megaMenu'; mega.hidden = true;
    mega.setAttribute('role', 'dialog'); mega.setAttribute('aria-modal', 'true'); mega.setAttribute('aria-label', 'Menu SYFIR');
    mega.innerHTML =
      `<div class="mega-top">
        <a class="mega-logo" href="index.html#accueil">SYFIR<span>™</span></a>
        <div class="mega-search">
          <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.6-3.6"/></svg>
          <input type="search" id="megaSearch" placeholder="Explore l'univers SYFIR" aria-label="Rechercher dans l'univers SYFIR" autocomplete="off">
        </div>
        <button class="mega-close" id="megaClose" type="button" aria-label="Fermer le menu">✕</button>
      </div>
      <div class="mega-body">
        <div class="mega-side" role="navigation" aria-label="Rubriques">
          <a href="index.html#accueil">Accueil</a>
          <div class="mega-side-group">
            <a class="mega-side-head" href="saveurs.html">Notre Collection</a>
            <a href="saveurs.html">Toutes les pochettes</a>
            <a href="saveurs.html#planteur">Syf Planteur</a>
            <a href="saveurs.html#coral">Syf Coral Breeze</a>
            <a href="saveurs.html#golden">Syf Golden Escape</a>
          </div>
          <a href="evenements.html">Événements</a>
          <a href="index.html#artistes">Artistes</a>
          <a href="syf-tv.html">SYF TV</a>
          <a href="espace-pro.html">Espace pro</a>
        </div>
        <div class="mega-content">
          <div class="mega-results" id="megaResults" hidden></div>
          <div class="mega-panels" id="megaPanels">
            <section class="mega-row">
              <div class="mega-row-head"><h3>Les pochettes SYFIR</h3><a href="saveurs.html">Afficher tout →</a></div>
              <div class="mega-prod-grid">
                ${prods.map(([u, n, base, alt]) => `<a class="mega-prod" href="${u}"><span class="mega-prod-img">${pic(base, alt)}</span><span class="mega-prod-name">${esc(n)}</span></a>`).join('')}
              </div>
            </section>
            <section class="mega-row">
              <div class="mega-row-head"><h3>Parcourir par envies</h3><a href="evenements.html">Afficher tout →</a></div>
              <div class="mega-envies">
                ${envies.map(([u, n, img]) => `<a class="mega-envie" href="${u}"><img src="${img}" loading="lazy" alt=""><span>${esc(n)}</span></a>`).join('')}
              </div>
            </section>
          </div>
        </div>
      </div>`;
    document.body.appendChild(mega);

    // R11 : le menu est display:none au chargement, donc ses images lazy ne
    // partent qu'à l'ouverture → cartes vides ~1 s. À l'« idle » (LCP passé),
    // on bascule en eager : le fetch part menu fermé, tout est décodé avant
    // la première ouverture. Micro-fade si l'utilisateur ouvre plus vite.
    // (R12 : même traitement pour les cartes du dropdown SAVEURS de la nav.)
    const megaImgs = [...$$('.mega-prod-img img, .mega-envie img', mega), ...$$('.nav-drop-cards img')];
    megaImgs.forEach(im => {
      if (im.complete && im.naturalWidth) return;
      im.classList.add('img-fade');
      const inFn = () => im.classList.add('img-in');
      im.addEventListener('load', inFn, { once: true });
      im.addEventListener('error', inFn, { once: true });
    });
    const warmMega = () => megaImgs.forEach(im => { im.loading = 'eager'; im.decoding = 'async'; });
    if ('requestIdleCallback' in window) requestIdleCallback(warmMega, { timeout: 4000 });
    else setTimeout(warmMega, 2500);

    const search = $('#megaSearch', mega), results = $('#megaResults', mega), panels = $('#megaPanels', mega);
    let lastFocus = null;
    const doSearch = () => {
      const q = search.value.trim().toLowerCase();
      if (!q) { results.hidden = true; panels.hidden = false; results.innerHTML = ''; return; }
      const hits = idx.filter(([t, , k]) => (t + ' ' + k).toLowerCase().includes(q)).slice(0, 8);
      panels.hidden = true; results.hidden = false;
      results.innerHTML = hits.length
        ? hits.map(([t, u]) => `<a class="mega-result" href="${u}"><strong>${esc(t)}</strong></a>`).join('')
        : `<p class="mega-result-empty">Rien pour « ${esc(search.value.trim())} » — essaie « planteur », « festival », « SYF TV »…</p>`;
    };
    search.addEventListener('input', doSearch);

    const open = (focusSearch) => {
      lastFocus = document.activeElement;
      mega.hidden = false; document.body.style.overflow = 'hidden';
      (focusSearch ? search : $('.mega-close', mega)).focus();
    };
    const close = () => {
      mega.hidden = true; document.body.style.overflow = '';
      search.value = ''; doSearch();
      if (lastFocus && lastFocus.focus) lastFocus.focus();
    };
    $('#burgerBtn')?.addEventListener('click', () => open(false));
    $('#searchBtn')?.addEventListener('click', () => open(true));
    $('#megaClose', mega).addEventListener('click', close);
    $$('a', mega).forEach(a => a.addEventListener('click', close));
    mega.addEventListener('keydown', e => {
      if (e.key === 'Escape') { close(); return; }
      if (e.key !== 'Tab') return;
      const f = $$('a, button, input', mega).filter(el => !el.disabled && el.offsetParent !== null);
      if (!f.length) return;
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });
  })();

  // R12 : Échap referme les dropdowns de la nav (ils s'ouvrent au
  // hover/focus-within — rendre le focus au lien parent les replie).
  $$('.has-drop').forEach(item => {
    item.addEventListener('keydown', e => {
      if (e.key !== 'Escape') return;
      const link = $('.nav-link', item);
      if (link) { e.stopPropagation(); link.focus(); link.blur(); }
    });
  });

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

  /* ===== 03. REVEAL ON SCROLL ===== */
  const reveals = $$('.reveal');
  const inViewport = el => {
    const r = el.getBoundingClientRect();
    return r.top < window.innerHeight * 0.95 && r.bottom > 0;
  };
  // Au chargement : révèle immédiatement tout ce qui est déjà dans le viewport
  // (le reste est visible par défaut et s'anime en entrant à l'écran).
  reveals.forEach(el => { if (inViewport(el)) el.classList.add('in'); });
  // L'état final ne doit JAMAIS dépendre de l'animation : après un saut
  // programmatique (ancre partagée, scrollIntoView), Chrome peut laisser
  // l'animation calée sur sa frame « from » (fill both = opacity 0) jusqu'au
  // premier vrai scroll. animationend pose .in-done (opacity 1 garanti)…
  reveals.forEach(el => el.addEventListener('animationend', () => el.classList.add('in-done'), { once: true }));
  const revealObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('in'); revealObs.unobserve(e.target); }
    });
  }, { threshold: 0, rootMargin: '0px 0px -8% 0px' });
  reveals.forEach(el => { if (!el.classList.contains('in')) revealObs.observe(el); });

  // …l'arrivée par ancre (chargement avec #hash ou hashchange) révèle
  // directement ce qui est à l'écran — pas d'animation d'entrée sur un
  // contenu que l'utilisateur vient chercher. Le défilement d'ancre étant
  // LISSE (scroll-behavior: smooth), on attend sa fin réelle : scrollend,
  // avec un repli minuté pour les navigateurs sans l'événement.
  const revealSettle = () => reveals.forEach(el => {
    if (inViewport(el)) { el.classList.add('in', 'in-done'); revealObs.unobserve(el); }
  });
  let anchorJump = !!location.hash;
  const settleAfterJump = () => {
    if (!anchorJump) return;
    anchorJump = false;
    requestAnimationFrame(revealSettle);
  };
  addEventListener('hashchange', () => { anchorJump = true; setTimeout(settleAfterJump, 900); });
  if ('onscrollend' in window) addEventListener('scrollend', settleAfterJump, { passive: true });
  if (anchorJump) addEventListener('load', () => setTimeout(settleAfterJump, 900), { once: true });

  // …et un garde-fou rattrape tout élément marqué .in resté invisible
  // malgré tout (animation calée) : réévalué au chargement.
  addEventListener('load', () => setTimeout(() => {
    $$('.reveal.in:not(.in-done)').forEach(el => {
      if (inViewport(el) && parseFloat(getComputedStyle(el).opacity) < 1) el.classList.add('in-done');
    });
  }, 1600), { once: true });

  /* ===== 04. PARALLAXE DOUCE =====
     Allégé (lot 8) : désactivé sous 768px — sur mobile, le défilement
     reste natif, sans travail par frame. */
  const parallaxEls = $$('[data-parallax]');
  if (parallaxEls.length && !matchMedia('(prefers-reduced-motion: reduce)').matches
      && matchMedia('(min-width: 768px)').matches) {
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

  /* (06. Effet tilt 3D retiré au lot 8 — gadget, le design doit disparaître) */

  /* ===== 05. TOAST ===== */
  const toast = $('#toast');
  let toastTimer;
  const showToast = msg => {
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 3200);
  };

  /* ===== 06. MENU DE THÈME : AUTOMATIQUE / CLAIR / SOMBRE =====
     Auto : clair le jour (7h-19h), sombre la nuit.
     Le choix est mémorisé et appliqué dès le <head> (script inline). */
  const themeSwitch = $('#themeSwitch');
  const themeBtn    = $('#themeBtn');
  const themeMenu   = $('#themeMenu');
  const themeOpts   = $$('.theme-opt', themeSwitch || document.createElement('div'));
  const themeByHour = () => {
    const h = new Date().getHours();
    return h >= 7 && h < 19 ? 'light' : 'dark';
  };
  const themeIcon = { auto: '🌗', light: '☀️', dark: '🌙' };
  const applyTheme = pref => {
    const mode = pref === 'auto' ? themeByHour() : pref;
    document.documentElement.setAttribute('data-theme', mode);
    document.documentElement.setAttribute('data-theme-pref', pref);
    if (themeBtn) {
      themeBtn.textContent = themeIcon[pref] || themeIcon.auto;
      themeBtn.title = 'Thème : ' + (pref === 'auto'
        ? `automatique (${themeByHour() === 'light' ? 'jour' : 'nuit'})`
        : pref === 'light' ? 'clair' : 'sombre');
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
    // écouteurs ajoutés au prochain tick pour ne pas capter le clic d'ouverture
    setTimeout(() => {
      document.addEventListener('click', onThemeOutside);
      document.addEventListener('keydown', onThemeKey);
    });
  };
  themeBtn?.addEventListener('click', e => {
    e.stopPropagation();
    themeMenu.hidden ? openThemeMenu() : closeThemeMenu();
  });
  themeOpts.forEach(opt => {
    opt.addEventListener('click', () => {
      themePref = opt.dataset.theme;
      localStorage.setItem('syfir-theme', themePref);
      applyTheme(themePref);
      closeThemeMenu();
      showToast(themePref === 'auto'
        ? '🌗 Thème automatique — clair le jour, sombre la nuit'
        : themePref === 'light' ? '☀️ Mode clair activé' : '🌙 Mode sombre activé');
    });
  });
  // En mode auto, on suit l'heure qui tourne
  setInterval(() => { if (themePref === 'auto') applyTheme('auto'); }, 60000);

  /* ===== 07. AGE GATE 18+ =====
     Marque d'alcool : vérification d'âge à l'entrée, affichée une seule
     fois (localStorage), sur toutes les pages. Accessible : role=dialog,
     focus initial, piège de focus, non fermable par Échap. */
  if (!localStorage.getItem('syfir-age-ok')) {
    const gate = document.createElement('div');
    gate.className = 'age-gate';
    gate.setAttribute('role', 'dialog');
    gate.setAttribute('aria-modal', 'true');
    gate.setAttribute('aria-labelledby', 'ageTitle');
    gate.innerHTML = `
      <div class="age-box">
        <p class="age-logo">SYFIR<span>™</span></p>
        <h2 id="ageTitle">Avez-vous 18 ans ?</h2>
        <p class="age-sub">SYFIR est une marque de cocktails alcoolisés.<br>Pour continuer, confirmez que vous avez l'âge légal.</p>
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
    // Piège de focus : Tab reste dans le dialogue
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
        <p class="age-logo">SYFIR<span>™</span></p>
        <h2 id="ageTitle">À très vite ✦</h2>
        <p class="age-sub">Ce site est réservé aux personnes majeures.<br>Pour s'informer sur l'alcool et être accompagné :</p>
        <div class="age-actions">
          <a class="btn btn-solid" href="https://www.alcool-info-service.fr" rel="noopener">alcool-info-service.fr</a>
        </div>
        <p class="age-note">L'abus d'alcool est dangereux pour la santé.</p>`;
      gate.querySelector('a').focus();
    });
  }

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

  /* ===== 09. LINE-UP (artistes, DJs & groupes) : filtre + booking ===== */
  const artistChips = $('#artistChips');
  const lineupGrid = $('#lineupGrid');
  if (artistChips && lineupGrid) {
    artistChips.addEventListener('click', e => {
      const chip = e.target.closest('.chip');
      if (!chip) return;
      $$('.chip', artistChips).forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      const cat = chip.dataset.cat;
      let visible = 0;
      $$(':scope > article', lineupGrid).forEach(card => {
        const show = cat === 'tous' || card.dataset.cat === cat;
        card.hidden = !show;
        if (show) visible++;
      });
      const empty = $('#noArtists');
      if (empty) empty.hidden = visible > 0;
    });
  }

  // « Booker » / « Rejoindre le line-up » → présélectionne le bon type
  // dans le formulaire partenaire et y fait défiler la page.
  // Changer manuellement le type de demande efface la note de booking
  $$('input[name="requestType"]').forEach(r => {
    r.addEventListener('change', () => { const n = $('#formNote'); if (n) n.hidden = true; });
  });

  $$('[data-request]').forEach(el => {
    el.addEventListener('click', () => {
      // Booking d'un talent précis : note (délai de réponse du management)
      // + préremplissage du message, sans écraser ce que l'utilisateur a saisi
      const host = el.closest('[data-book-note]');
      const type = el.dataset.request;
      const note = el.dataset.bookNote || host?.dataset.bookNote || '';
      const bookName = el.dataset.bookName || host?.dataset.name || '';

      // R10 : le formulaire vit dans partenaires.html. Sur une page qui ne le
      // contient pas (accueil, artistes…), on transmet l'intention et on
      // redirige ; partenaires.html l'applique au chargement.
      const form = $('#partnerForm');
      if (!form) {
        try { sessionStorage.setItem('syfir-partner-intent', JSON.stringify({ type, note, bookName })); } catch (e) {}
        location.href = 'partenaires.html#partnerForm';
        return;
      }

      const radio = $(`input[name="requestType"][value="${type}"]`);
      if (radio) { radio.checked = true; radio.dispatchEvent(new Event('change')); }
      const formNote = $('#formNote');
      if (formNote) {
        formNote.textContent = note ? '⏱ ' + note : '';
        formNote.hidden = !note;
      }
      if (note && bookName) {
        const msg = $('#pfMessage');
        if (msg && !msg.value.trim()) msg.value = `Demande de booking — ${bookName}. Date, lieu et type d'événement : `;
      }
      const top = form.getBoundingClientRect().top + window.scrollY - 90;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });

  /* ===== 10. CARROUSEL MÉDIA (cartes artistes + modale) =====
     Standards carrousel (NN/g, web.dev) : scroll-snap natif = swipe tactile,
     flèches ≥ 44 px, points indicateurs, PAS d'autoplay, clavier ←/→,
     aria-roledescription, lazy-load des médias hors écran.
     6 diapositives max : 5 photos + 1 vidéo (galerie officielle du lot 22). */
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

  const buildMediaCarousel = (box, { photos = '', video = '', name = '', badge = '', playBtn = false, videoInline = false, note = '', videoTitles = '' }) => {
    const list = photos.split('|').map(s => s.trim()).filter(Boolean).slice(0, 5);
    if (!list.length) return;

    // Un fichier vidéo peut avoir plusieurs sources séparées par « | »
    // (locale d'abord, hotlink en secours) : le navigateur essaie dans l'ordre.
    const videoSources = video.split('|').map(s => s.trim()).filter(Boolean)
      .map(u => `<source src="${u}" type="video/mp4">`).join('');
    // Plusieurs vidéos YouTube séparées par « | » = une façade lazy par vidéo
    // (thumbnail i.ytimg.com + bouton play, l'iframe ne charge qu'au clic)
    const titles = videoTitles.split('|').map(s => s.trim());
    const ytSlides = urls => urls.map((u, i) => {
      const id = (u.match(/embed\/([\w-]+)/) || [])[1] || '';
      const title = esc(titles[i] || `Vidéo de ${name}`);
      return `<div class="car-slide car-slide-video car-video-yt" role="group" aria-roledescription="diapositive">
          <img src="https://i.ytimg.com/vi/${id}/hqdefault.jpg" alt="" loading="lazy" decoding="async">
          <button class="car-video-load" data-embed="${u}" data-title="${title}" type="button" aria-label="Lire : ${title}">▶</button>
          <span class="car-video-title">${title}</span>
        </div>`;
    }).join('');
    const videoSlide = video
      ? (/youtube\.com|youtu\.be/.test(video)
        ? ytSlides(video.split('|').map(s => s.trim()).filter(Boolean))
        : (videoInline
          ? `<div class="car-slide car-slide-video car-video-live" role="group" aria-roledescription="diapositive">
               <video muted loop autoplay playsinline preload="metadata" aria-label="Vidéo de ${esc(name)}">${videoSources}</video>
               <button class="car-sound" type="button" aria-label="Activer le son" aria-pressed="false">🔇</button>
             </div>`
          : `<div class="car-slide car-slide-video" role="group" aria-roledescription="diapositive">
               <video controls preload="none" aria-label="Vidéo de ${esc(name)}">${videoSources}</video>
             </div>`))
      : `<div class="car-slide car-slide-video car-video-soon" role="group" aria-roledescription="diapositive">
           <span class="car-soon-ic" aria-hidden="true">🎬</span>
           <p>Vidéo bientôt disponible</p>
         </div>`;

    box.classList.add('media-car');
    box.setAttribute('role', 'group');
    box.setAttribute('aria-roledescription', 'carrousel');
    box.setAttribute('aria-label', `Galerie de ${name}`);
    box.tabIndex = 0;
    const photoSlides = list.map((src, i) => `
        <div class="car-slide" role="group" aria-roledescription="diapositive">
          <img src="${esc(src)}" alt="${esc(name)} — photo ${i + 1}" loading="${i === 0 && !videoInline ? 'eager' : 'lazy'}" decoding="async">
        </div>`).join('');
    box.innerHTML = `
      <div class="car-track">
        ${videoInline && video ? videoSlide + photoSlides : photoSlides + videoSlide}
      </div>
      <button class="car-btn car-prev" type="button" aria-label="Média précédent">‹</button>
      <button class="car-btn car-next" type="button" aria-label="Média suivant">›</button>
      <div class="car-dots"></div>
      ${note ? `<span class="car-note">${esc(note)}</span>` : ''}
      ${badge ? `<span class="artist-badge">${esc(badge)}</span>` : ''}
      ${playBtn ? `<button class="artist-play" type="button" aria-label="Écouter un extrait de ${esc(name)}">▶</button>` : ''}`;

    const track = box.querySelector('.car-track');
    const dotsBox = box.querySelector('.car-dots');
    const prev = box.querySelector('.car-prev');
    const next = box.querySelector('.car-next');
    let index = 0;

    const slides = () => [...track.children];
    const refresh = () => {
      const s = slides();
      s.forEach((sl, i) => sl.setAttribute('aria-label', `${i + 1} sur ${s.length}`));
      dotsBox.innerHTML = s.map((_, i) =>
        `<button class="car-dot ${i === index ? 'on' : ''}" type="button" data-i="${i}" aria-label="Aller au média ${i + 1}" aria-current="${i === index}"></button>`).join('');
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

    // Une photo qui ne charge pas disparaît proprement de la galerie
    // (les diapositives vidéo gardent leur façade même si le thumbnail échoue)
    box.querySelectorAll('.car-slide:not(.car-slide-video) img').forEach(img => {
      img.addEventListener('error', () => {
        img.closest('.car-slide')?.remove();
        index = Math.min(index, slides().length - 1);
        refresh();
      });
    });

    // Swipe / défilement natif -> synchronise points et flèches
    let tick = false;
    track.addEventListener('scroll', () => {
      if (tick) return;
      tick = true;
      requestAnimationFrame(() => {
        const i = Math.round(track.scrollLeft / Math.max(1, track.clientWidth));
        if (i !== index) { index = i; refresh(); }
        tick = false;
      });
    }, { passive: true });

    prev.addEventListener('click', e => { e.stopPropagation(); go(index - 1); });
    next.addEventListener('click', e => { e.stopPropagation(); go(index + 1); });
    dotsBox.addEventListener('click', e => {
      e.stopPropagation();
      const d = e.target.closest('.car-dot');
      if (d) go(+d.dataset.i);
    });
    box.addEventListener('keydown', e => {
      if (e.key === 'ArrowLeft') { e.preventDefault(); go(index - 1); }
      if (e.key === 'ArrowRight') { e.preventDefault(); go(index + 1); }
    });
    // Vidéos YouTube : façades — l'iframe ne se charge qu'au clic (perf + vie privée)
    box.querySelectorAll('.car-video-load').forEach(loader => {
      loader.addEventListener('click', e => {
        e.stopPropagation();
        const url = loader.dataset.embed + (loader.dataset.embed.includes('?') ? '&' : '?') + 'autoplay=1';
        loader.closest('.car-slide').innerHTML =
          `<iframe src="${esc(url)}" title="${esc(loader.dataset.title || `Vidéo de ${name}`)}" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe>`;
      });
    });

    // Bouton son de la vidéo inline (muette en boucle par défaut)
    const soundBtn = box.querySelector('.car-sound');
    soundBtn?.addEventListener('click', e => {
      e.stopPropagation();
      const v = soundBtn.parentElement.querySelector('video');
      v.muted = !v.muted;
      soundBtn.textContent = v.muted ? '🔇' : '🔊';
      soundBtn.setAttribute('aria-label', v.muted ? 'Activer le son' : 'Couper le son');
      soundBtn.setAttribute('aria-pressed', String(!v.muted));
      if (v.paused) v.play().catch(() => {});   // certains environnements n'ont pas le codec
    });

    refresh();
  };

  /* ===== 11. ÉCOUTE + FICHE ARTISTE =====
     Aucun faux extrait : le bouton ▶ ouvre la vraie page de l'artiste
     (YouTube/Spotify/SoundCloud) dans un nouvel onglet ; sans vraie
     plateforme, pas de bouton. */

  // Un vrai profil a un chemin au-delà de la racine (ex. /artist/xxx, /@handle) ;
  // une page d'accueil générique (open.spotify.com, youtube.com…) est ignorée.
  const isRealProfile = url => {
    if (!url) return false;
    try { return new URL(url).pathname.replace(/\/+$/, '').length > 1; }
    catch { return false; }
  };
  const listenUrl = d => [d.youtube, d.spotify, d.soundcloud].find(isRealProfile) || '';
  const platformName = url => {
    try {
      const h = new URL(url).hostname;
      if (/youtube\.|youtu\.be/.test(h)) return 'YouTube';
      if (/spotify/.test(h)) return 'Spotify';
      if (/soundcloud/.test(h)) return 'SoundCloud';
    } catch { /* URL invalide -> libellé générique */ }
    return 'sa page';
  };

  // Les visuels des cartes artistes deviennent des galeries média
  $$('.artist-card').forEach(card => {
    const d = card.dataset;
    const photoBox = card.querySelector('.artist-photo');
    if (photoBox && d.photos) {
      buildMediaCarousel(photoBox, {
        photos: d.photos, video: d.video || '', name: d.name || '',
        badge: d.badge || '', playBtn: !!(d.listenEmbed || listenUrl(d)), note: d.note || '',
        videoTitles: d.videoTitles || ''
      });
    }
  });

  // Modale fiche artiste
  const artistModal = $('#artistModal');
  if (artistModal) {
    const amHero = artistModal.querySelector('.am-hero'), amRole = $('#amRole'),
          amName = $('#amName'), amTags = $('#amTags'), amBio = $('#amBio'),
          amListen = $('#amListen'), amListenName = $('#amListenName'),
          amEmbed = $('#amEmbed');
    let modalEmbed = '';   // player embarqué (SoundCloud) de l'artiste affiché

    const openArtist = card => {
      const d = card.dataset;
      // Galerie média de la modale : mêmes photos/vidéo que la carte
      buildMediaCarousel(amHero, {
        photos: d.photos || d.img || '', video: d.video || '',
        name: d.name || '', badge: d.badge || '', note: d.note || '',
        videoTitles: d.videoTitles || ''
      });
      amRole.textContent = d.role || '';
      amName.textContent = d.name || '';
      amTags.innerHTML = (d.tags || '').split(',').filter(Boolean)
        .map(t => `<span>${esc(t.trim())}</span>`).join('');
      amBio.textContent = d.bio || '';
      // Liens streaming : n'afficher que les vrais profils (pas les pages
      // d'accueil génériques). Le data-attribute reste sur la carte.
      let anyStream = false;
      [['#amSpotify', d.spotify], ['#amSoundcloud', d.soundcloud], ['#amYoutube', d.youtube],
       ['#amInstagram', d.instagram], ['#amFacebook', d.facebook], ['#amTiktok', d.tiktok]].forEach(([sel, url]) => {
        const el = $(sel);
        const real = isRealProfile(url);
        el.hidden = !real;
        if (real) { el.href = url; anyStream = true; }
      });
      const amStream = $('#amStream');
      if (amStream) amStream.hidden = !anyStream;
      // Bouton écoute : mix embarqué (SoundCloud) chargé au clic si présent,
      // sinon lien direct vers la vraie plateforme, sinon masqué
      modalEmbed = d.listenEmbed || '';
      amEmbed.hidden = true;
      amEmbed.innerHTML = '';
      if (modalEmbed) {
        amListen.hidden = false;
        // repli utile (clic molette / nouvel onglet) : la page du mix elle-même
        const m = modalEmbed.match(/[?&]url=([^&]+)/);
        amListen.href = m ? decodeURIComponent(m[1]) : modalEmbed;
        amListenName.textContent = 'SoundCloud';
      } else {
        const listen = listenUrl(d);
        amListen.hidden = !listen;
        if (listen) { amListen.href = listen; amListenName.textContent = platformName(listen); }
      }
      // Contact direct du management : affiché uniquement si le talent l'a
      // autorisé (data-contact-phone / data-contact-email sur la carte)
      const amContact = $('#amContact');
      if (amContact) {
        const phone = $('#amPhone'), email = $('#amEmail');
        const hasPhone = !!d.contactPhone, hasEmail = !!d.contactEmail;
        phone.hidden = !hasPhone;
        if (hasPhone) {
          phone.href = 'tel:' + d.contactPhone;
          phone.querySelector('.am-contact-value').textContent = d.contactPhoneDisplay || d.contactPhone;
        }
        email.hidden = !hasEmail;
        if (hasEmail) {
          email.href = 'mailto:' + d.contactEmail;
          email.querySelector('.am-contact-value').textContent = d.contactEmail;
        }
        $('#amContactTitle').textContent = d.bookNote
          ? 'Contact management · ' + d.bookNote.split('—')[0].trim()
          : 'Contact management';
        amContact.hidden = !(hasPhone || hasEmail);
      }

      // Le bouton « Booker cet artiste » porte la note de booking du talent
      const amBook = artistModal.querySelector('.am-book');
      if (amBook) {
        if (d.bookNote) { amBook.dataset.bookNote = d.bookNote; amBook.dataset.bookName = d.name || ''; }
        else { delete amBook.dataset.bookNote; delete amBook.dataset.bookName; }
      }
      artistModal.classList.add('open');
      document.body.style.overflow = 'hidden';
    };
    const closeArtist = () => {
      artistModal.classList.remove('open');
      document.body.style.overflow = '';
    };
    $$('.artist-card').forEach(card => {
      card.addEventListener('click', e => {
        // Les contrôles du carrousel et du lecteur n'ouvrent pas la modale
        if (e.target.closest('[data-request]') || e.target.closest('.artist-play') ||
            e.target.closest('.car-btn') || e.target.closest('.car-dot') ||
            e.target.closest('.car-slide-video')) return;
        openArtist(card);
      });
    });
    artistModal.addEventListener('click', e => {
      if (e.target === artistModal || e.target.closest('[data-close]')) closeArtist();
    });
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && artistModal.classList.contains('open')) closeArtist();
    });
    artistModal.querySelector('.am-book')?.addEventListener('click', closeArtist);

    // Clic écoute : si l'artiste a un mix, le player se charge ICI, au clic
    // seulement (aucune requête SoundCloud avant) ; sinon le lien s'ouvre normalement
    amListen.addEventListener('click', e => {
      if (!modalEmbed) return;
      e.preventDefault();
      amEmbed.innerHTML = `<iframe title="Mix de ${esc(amName.textContent)} (SoundCloud)" width="100%" height="166"
        scrolling="no" allow="autoplay"
        src="${esc(modalEmbed)}&auto_play=true&color=%23ff7a00"></iframe>`;
      amEmbed.hidden = false;
      amListen.hidden = true;
    });

    // Écoute rapide depuis la carte : mix -> ouvre la fiche avec le player ;
    // sinon la vraie plateforme dans un nouvel onglet
    $$('.artist-card .artist-play').forEach(btn => {
      const card = btn.closest('.artist-card');
      const d = card.dataset;
      const url = listenUrl(d);
      btn.setAttribute('aria-label', d.listenEmbed
        ? `Écouter ${d.name || ''} (mix SoundCloud dans la fiche)`
        : `Écouter ${d.name || ''} sur ${platformName(url)} (nouvel onglet)`);
      btn.addEventListener('click', e => {
        e.stopPropagation();
        if (d.listenEmbed) { openArtist(card); amListen.click(); }
        else window.open(url, '_blank', 'noopener');
      });
    });
  }

  /* ===== 12. FOND VIDÉO DU HERO (accueil + billetterie) =====
     Vidéo injectée APRÈS l'événement load : le LCP reste l'image de fond CSS
     (poster). N'apparaît qu'une fois la lecture réellement lancée ; si aucune
     source ne décode (ex. environnement sans codec H.264), l'image reste.
     prefers-reduced-motion ou Save-Data -> pas de vidéo, l'image reste. */
  const injectHeroVideo = (host, sources, poster) => {
    if (!host || reducedMotion || navigator.connection?.saveData) return;
    addEventListener('load', () => {
      const wrap = document.createElement('div');
      wrap.className = 'hero-video';
      wrap.setAttribute('aria-hidden', 'true');
      wrap.innerHTML = `
        <video muted loop autoplay playsinline preload="metadata" tabindex="-1" poster="${poster}">
          ${sources.map(s => `<source src="${s}" type="video/mp4">`).join('')}
        </video>`;
      const v = wrap.querySelector('video');
      v.addEventListener('playing', () => wrap.classList.add('on'), { once: true });
      // l'événement error d'une <source> ne remonte pas jusqu'au <video> :
      // l'échec de la DERNIÈRE source signifie qu'aucune vidéo n'est disponible
      wrap.querySelector('source:last-of-type').addEventListener('error', () => wrap.remove());
      v.addEventListener('error', () => wrap.remove());
      host.insertBefore(wrap, host.querySelector('.hero-veil'));

      // Relance défensive de l'autoplay : certains navigateurs ignorent
      // l'autoplay au chargement (readyState OK mais lecture non lancée).
      // On (re)tente play() en silence — au chargement, puis à la première
      // interaction utilisateur et au retour d'onglet. Si tout échoue, le
      // poster reste (déjà le cas). Les écouteurs se retirent dès que ça joue.
      const tryPlay = () => { const pr = v.play(); if (pr) pr.catch(() => {}); };
      const kick = () => { if (!v.paused) return cleanup(); tryPlay(); };
      const onVis = () => { if (!document.hidden) kick(); };
      const events = ['pointerdown', 'touchstart', 'scroll', 'keydown'];
      const cleanup = () => {
        events.forEach(e => removeEventListener(e, kick));
        document.removeEventListener('visibilitychange', onVis);
      };
      v.addEventListener('playing', cleanup, { once: true });
      v.addEventListener('loadeddata', tryPlay, { once: true });
      tryPlay();
      events.forEach(e => addEventListener(e, kick, { passive: true, once: false }));
      document.addEventListener('visibilitychange', onVis);
    }, { once: true });
  };

  // Accueil : la vidéo publicitaire officielle SYFIR (« la fraîcheur qu'on
  // voit » — mouvement dès le premier écran). Poster = photo LCP du hero.
  injectHeroVideo($('.hero#accueil'), ['videos/syfir-pub-video.mp4'], 'images/produits/syfir-pub-plage-1.webp');
  // Billetterie : ambiance Pexels (fichier local d'abord, hotlink en secours)
  injectHeroVideo($('.tickets-hero'), ['videos/ambiance-sunset.mp4', 'https://www.pexels.com/download/video/9640964/'],
    'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1800&q=80');

  /* ===== 13. FICHE PRODUIT COCKTAIL (modale) ===== */
  const cocktailModal = $('#cocktailModal');
  if (cocktailModal) {
    const ckHero = cocktailModal.querySelector('.ck-hero');
    const openCocktail = card => {
      const d = card.dataset;
      buildMediaCarousel(ckHero, {
        photos: d.photos || '', video: d.video || '', name: d.name || '',
        videoInline: true, note: d.note || ''
      });
      $('#ckName').textContent = d.name || '';
      $('#ckNotes').textContent = d.notes || '';
      $('#ckDesc').textContent = d.desc || '';
      cocktailModal.classList.add('open');
      document.body.style.overflow = 'hidden';
    };
    const closeCocktail = () => {
      cocktailModal.classList.remove('open');
      document.body.style.overflow = '';
      ckHero.querySelector('video')?.pause();
    };
    $$('.cocktail-card').forEach(card => {
      card.addEventListener('click', e => {
        if (e.target.closest('.serve-link')) return;   // le lien direct garde son rôle
        openCocktail(card);
      });
      card.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openCocktail(card); }
      });
    });
    cocktailModal.addEventListener('click', e => {
      if (e.target === cocktailModal || e.target.closest('[data-close]')) closeCocktail();
    });
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && cocktailModal.classList.contains('open')) closeCocktail();
    });
  }

  /* ===== 14. CARROUSEL DE LOGOS PARTENAIRES ===== */
  const logosTrack = $('#logosTrack');
  const logosMarquee = $('#logosMarquee');
  if (logosTrack) {
    [...logosTrack.children].forEach(t => {
      const c = t.cloneNode(true);
      c.classList.add('logo-clone'); c.setAttribute('aria-hidden', 'true'); c.tabIndex = -1;
      logosTrack.appendChild(c);
    });
  }
  const logoChips = $('#logoChips');
  if (logoChips && logosMarquee) {
    logoChips.addEventListener('click', e => {
      const chip = e.target.closest('.chip');
      if (!chip) return;
      $$('.chip', logoChips).forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      const cat = chip.dataset.cat;
      logosMarquee.classList.toggle('is-filtered', cat !== 'tous');
      let visible = 0;
      $$('.logo-tile:not(.logo-clone)', logosTrack).forEach(tile => {
        const show = cat === 'tous' || tile.dataset.cat === cat;
        tile.hidden = !show;
        if (show) visible++;
      });
      const empty = $('#noLogos');
      if (empty) empty.hidden = visible > 0;
    });
  }

  /* ===== 15. FICHE PARTENAIRE (modale) ===== */
const placeModal = document.querySelector('#placeModal');
const placesGridEl = document.querySelector('#placesGrid');
if (placeModal && placesGridEl) {
  const pmImg = document.querySelector('#pmMainImg');
  const pmThumbs = document.querySelector('#pmThumbs');  const closePM = () => { placeModal.classList.remove('open'); document.body.style.overflow = ''; }; placeModal.addEventListener('click', ev => { if (ev.target === placeModal || ev.target.closest('[data-close]')) closePM(); }); document.addEventListener('keydown', ev => { if (ev.key === 'Escape' && placeModal.classList.contains('open')) closePM(); });
  placesGridEl.addEventListener('click', ev => {
    const card = ev.target.closest('.place-card');
    if (!card) return;
    const photos = (card.dataset.photos || '').split('|').filter(Boolean);
    document.querySelector('#pmType').textContent = card.querySelector('.place-type')?.textContent || '';
    document.querySelector('#pmTitle').textContent = card.querySelector('h3')?.textContent || '';
    document.querySelector('#pmLoc').textContent = card.querySelector('.place-loc')?.textContent || '';
    document.querySelector('#pmDesc').textContent = card.dataset.desc || '';
    document.querySelector('#pmServe').innerHTML = card.querySelector('.place-serve')?.innerHTML || '';
    const web = card.dataset.web;
    const link = document.querySelector('#pmWeb');
    if (web) { link.href = web; link.hidden = false; } else { link.hidden = true; }
    if (photos.length) {
      pmImg.src = photos[0];
      pmImg.alt = document.querySelector('#pmTitle').textContent;
      pmThumbs.innerHTML = photos.map((p, i) => `<button class="pm-thumb${i === 0 ? ' active' : ''}" data-src="${esc(p)}" type="button"><img src="${esc(p)}" alt="" loading="lazy"></button>`).join('');
    }
    placeModal.classList.add('open'); document.body.style.overflow = 'hidden';
  });
  pmThumbs.addEventListener('click', ev => {
    const t = ev.target.closest('.pm-thumb');
    if (!t) return;
    pmImg.src = t.dataset.src;
    pmThumbs.querySelectorAll('.pm-thumb').forEach(b => b.classList.remove('active'));
    t.classList.add('active');
  });
}

/* ===== 16. FORMULAIRE PARTENAIRE INTELLIGENT ===== */
  const validators = {
    name: v => v.trim().length >= 2 || 'Indique ton nom complet.',
    email: v => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) || 'Adresse email invalide.',
    phone: v => /^(\+?\d[\d\s.-]{8,14})$/.test(v.trim()) || 'Numéro de téléphone invalide.',
    required: v => v.trim().length > 0 || 'Ce champ est requis.',
    message: v => v.trim().length >= 10 || 'Donne-nous un peu plus de détails (10 caractères min.).'
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
      partenaire:   { label: 'Nom de l\'établissement *',      placeholder: 'Le nom de ton lieu' },
      evenement:    { label: 'Type d\'événement *',            placeholder: 'Mariage, soirée privée, festival…' },
      artiste:      { label: 'Nom de scène / du groupe *',     placeholder: 'DJ, chanteur, groupe… + style musical' },
      collaborateur:{ label: 'Ton rôle / talent *',          placeholder: 'Photographe, vidéaste, hôte·sse, ambassadeur·rice…' },
      distributeur: { label: 'Zone de distribution *',         placeholder: 'Région, département, île…' },
      investisseur: { label: 'Structure / société *',        placeholder: 'Société, fonds, particulier…' },
      autre:        { label: 'Objet de ta demande *',       placeholder: 'Presse, collaboration, idée…' }
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

    partnerForm.addEventListener('submit', async e => {
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
      const success = $('#formSuccess'), errorMsg = $('#formError');
      const submitBtn = partnerForm.querySelector('button[type="submit"]');
      const data = {
        _gotcha: $('input[name="_gotcha"]', partnerForm)?.value || '',
        type: $('input[name="requestType"]:checked', partnerForm)?.value,
        name: $('#pfName').value.trim(), email: $('#pfEmail').value.trim(),
        phone: $('#pfPhone').value.trim(), context: $('#pfContext').value.trim(),
        message: $('#pfMessage').value.trim(), source: 'partenaire'
      };
      const label = submitBtn.textContent; submitBtn.disabled = true; submitBtn.textContent = 'Envoi…';
      if (errorMsg) errorMsg.hidden = true;
      const res = await submitForm(data);
      submitBtn.disabled = false; submitBtn.textContent = label;
      if (res.ok) {
        partnerForm.reset();
        $$('.invalid', partnerForm).forEach(el => el.classList.remove('invalid'));
        success.hidden = false;
        success.scrollIntoView({ behavior: 'smooth', block: 'center' });
        showToast('✦ Demande envoyée à l\'équipe SYFIR !');
      } else if (errorMsg) {
        errorMsg.hidden = false;
        errorMsg.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });

    // R10 : intention transmise depuis une autre page (Booker, Rejoindre le
    // line-up, rôles…) — on présélectionne le type, pose la note/le message,
    // puis on défile jusqu'au formulaire.
    try {
      const raw = sessionStorage.getItem('syfir-partner-intent');
      if (raw) {
        sessionStorage.removeItem('syfir-partner-intent');
        const intent = JSON.parse(raw) || {};
        const radio = intent.type && $(`input[name="requestType"][value="${intent.type}"]`);
        if (radio) { radio.checked = true; radio.dispatchEvent(new Event('change')); }
        if ($('#formNote')) {
          $('#formNote').textContent = intent.note ? '⏱ ' + intent.note : '';
          $('#formNote').hidden = !intent.note;
        }
        if (intent.note && intent.bookName) {
          const msg = $('#pfMessage');
          if (msg && !msg.value.trim()) msg.value = `Demande de booking — ${intent.bookName}. Date, lieu et type d'événement : `;
        }
        const top = partnerForm.getBoundingClientRect().top + window.scrollY - 90;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    } catch (e) {}
  }

  /* ===== 17. RETOUR EN HAUT + BARRE DE PROGRESSION (toutes pages) ===== */
  const toTop = $('#toTop');
  const progress = $('#scrollProgress');
  if (toTop || progress) {
    let uiTick = false;
    const onScrollUI = () => {
      if (uiTick) return;
      uiTick = true;
      requestAnimationFrame(() => {
        const h = document.documentElement.scrollHeight - window.innerHeight;
        const p = h > 0 ? (window.scrollY / h) * 100 : 0;
        if (progress) progress.style.width = p + '%';
        if (toTop) toTop.classList.toggle('show', window.scrollY > 600);
        uiTick = false;
      });
    };
    window.addEventListener('scroll', onScrollUI, { passive: true });
    onScrollUI();
    toTop?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  }

  /* ===== 18. FAB BILLETS : un seul CTA principal par écran =====
     Le bouton flottant s'efface tant que le hero (et son CTA « Voir les
     événements ») est à l'écran, puis réapparaît plus bas dans la page. */
  const ticketsFab = $('#ticketsFab');
  const ticketsHero = $('.tickets-hero');
  if (ticketsFab && ticketsHero && 'IntersectionObserver' in window) {
    new IntersectionObserver(entries => {
      entries.forEach(en => ticketsFab.classList.toggle('fab-hidden', en.isIntersecting));
    }, { threshold: 0.2 }).observe(ticketsHero);
  }

  /* ===== 19. VIDÉO D'AMBIANCE (accueil, communauté) =====
     Remplace la façade aftermovie en attendant le vrai film : vidéo Pexels
     muette en boucle, lancée après load (lazy, preload=none + poster).
     prefers-reduced-motion -> pas d'autoplay, contrôles natifs à la place. */
  const ambianceBox = $('#ambianceBox');
  if (ambianceBox) {
    const v = ambianceBox.querySelector('video');
    const sound = ambianceBox.querySelector('.car-sound');
    if (reducedMotion) {
      v.controls = true;
      sound.hidden = true;   // les contrôles natifs gèrent déjà le son
    } else {
      addEventListener('load', () => { v.play().catch(() => {}); }, { once: true });
      sound.addEventListener('click', () => {
        v.muted = !v.muted;
        sound.textContent = v.muted ? '🔇' : '🔊';
        sound.setAttribute('aria-label', v.muted ? 'Activer le son' : 'Couper le son');
        sound.setAttribute('aria-pressed', String(!v.muted));
        if (v.paused) v.play().catch(() => {});
      });
      // aucune source ne charge (fichier absent + réseau) -> on retire le
      // bouton son, le poster/fond reste en place
      v.querySelector('source:last-of-type').addEventListener('error', () => { sound.hidden = true; });
    }
  }

  /* ===== 20. TILT 3D LÉGER (data-tilt : vitrines de la pochette) =====
     Perspective + rotateX/Y suivant le pointeur, 6° max, retour doux
     180 ms. Souris uniquement : rien au tactile ni en reduced-motion. */
  const tiltEls = $$('[data-tilt]');
  if (tiltEls.length && !reducedMotion && matchMedia('(hover: hover) and (pointer: fine)').matches) {
    tiltEls.forEach(el => {
      el.style.willChange = 'transform';
      el.addEventListener('pointermove', e => {
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - .5;   // -.5 → .5
        const y = (e.clientY - r.top) / r.height - .5;
        el.style.transition = 'none'; // suivi immédiat sous le pointeur
        el.style.transform = `perspective(800px) rotateX(${(-y * 12).toFixed(2)}deg) rotateY(${(x * 12).toFixed(2)}deg) scale(1.02)`;
      });
      el.addEventListener('pointerleave', () => {
        el.style.transition = 'transform 180ms var(--ease)';
        el.style.transform = '';
      });
    });
  }

  /* ===== 21. PWA : enregistrement du service worker =====
     network-first sur le HTML, cache-first sur les assets (sw.js).
     Échec silencieux (file://, vieux navigateurs, previews restrictives). */
  if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
    addEventListener('load', () => {
      navigator.serviceWorker.register('sw.js').catch(() => {});
    }, { once: true });
  }

  /* ===== 22. QR CODE — encodeur inline, zéro dépendance =====
     QR byte mode, correction M, versions 1 à 6 (≈ 100 caractères max),
     masque 0. Utilisé par les billets de « Mon espace » (payload
     SYFIR|numéro|événement|date — terrain préparé pour Wallet).
     Renvoie un <svg> prêt à injecter, ou null si le texte est trop long. */
  const makeQR = text => {
    const data = new TextEncoder().encode(text);
    // [version, codewords de données, ECC/bloc, nb de blocs] — niveau M
    const SPEC = [[1, 16, 10, 1], [2, 28, 16, 1], [3, 44, 26, 1], [4, 64, 18, 2], [5, 86, 24, 2], [6, 108, 16, 4]];
    const spec = SPEC.find(s => data.length + 2 <= s[1]);
    if (!spec) return null;
    const [ver, totalCw, ecLen, nBlocks] = spec;
    const size = 17 + ver * 4;

    /* -- 1. flux de bits : mode 0100, longueur, données, terminateur, bourrage */
    const bits = [];
    const push = (v, n) => { for (let i = n - 1; i >= 0; i--) bits.push((v >> i) & 1); };
    push(4, 4); push(data.length, 8);
    data.forEach(b => push(b, 8));
    push(0, Math.min(4, totalCw * 8 - bits.length));
    while (bits.length % 8) bits.push(0);
    const cw = [];
    for (let i = 0; i < bits.length; i += 8) cw.push(bits.slice(i, i + 8).reduce((a, b) => a * 2 + b, 0));
    for (let i = 0; cw.length < totalCw; i++) cw.push(i % 2 ? 0x11 : 0xEC);

    /* -- 2. Reed-Solomon sur GF(256), polynôme 0x11D */
    const EXP = new Array(510), LOG = new Array(256);
    for (let i = 0, x = 1; i < 255; i++) { EXP[i] = x; LOG[x] = i; x <<= 1; if (x & 256) x ^= 0x11D; }
    for (let i = 255; i < 510; i++) EXP[i] = EXP[i - 255];
    const mul = (a, b) => (a && b) ? EXP[LOG[a] + LOG[b]] : 0;
    let gen = [1];
    for (let i = 0; i < ecLen; i++) {
      const ng = new Array(gen.length + 1).fill(0);
      gen.forEach((g, j) => { ng[j] ^= g; ng[j + 1] ^= mul(g, EXP[i]); });
      gen = ng;
    }
    const ecOf = block => {
      const res = block.concat(new Array(ecLen).fill(0));
      for (let i = 0; i < block.length; i++) {
        const f = res[i];
        if (f) gen.forEach((g, j) => { res[i + j] ^= mul(g, f); });
      }
      return res.slice(block.length);
    };

    /* -- 3. découpe en blocs égaux + entrelacement */
    const bLen = totalCw / nBlocks;
    const blocks = Array.from({ length: nBlocks }, (_, i) => cw.slice(i * bLen, (i + 1) * bLen));
    const ecs = blocks.map(ecOf);
    const seq = [];
    for (let i = 0; i < bLen; i++) blocks.forEach(b => seq.push(b[i]));
    for (let i = 0; i < ecLen; i++) ecs.forEach(b => seq.push(b[i]));

    /* -- 4. matrice : motifs fonctionnels (null = cellule libre pour les données) */
    const M = Array.from({ length: size }, () => new Array(size).fill(null));
    const finder = (r, c) => {
      for (let i = -1; i < 8; i++) for (let j = -1; j < 8; j++) {
        if (r + i < 0 || r + i >= size || c + j < 0 || c + j >= size) continue;
        const on = i >= 0 && i < 7 && j >= 0 && j < 7 &&
          (i === 0 || i === 6 || j === 0 || j === 6 || (i >= 2 && i <= 4 && j >= 2 && j <= 4));
        M[r + i][c + j] = on ? 1 : 0;
      }
    };
    finder(0, 0); finder(0, size - 7); finder(size - 7, 0);
    for (let i = 8; i < size - 8; i++) { M[6][i] = M[i][6] = (i % 2) ^ 1; }
    if (ver >= 2) {                        // motif d'alignement (un seul jusqu'à v6)
      const c = size - 7;
      for (let i = -2; i <= 2; i++) for (let j = -2; j <= 2; j++)
        M[c + i][c + j] = Math.max(Math.abs(i), Math.abs(j)) !== 1 ? 1 : 0;
    }
    M[size - 8][8] = 1;                    // module sombre
    for (let i = 0; i < 9; i++) {          // zones réservées à l'info de format
      if (i !== 6) { if (M[8][i] === null) M[8][i] = 0; if (M[i][8] === null) M[i][8] = 0; }
      if (i < 8 && M[8][size - 1 - i] === null) M[8][size - 1 - i] = 0;
      if (i < 7 && M[size - 1 - i][8] === null) M[size - 1 - i][8] = 0;
    }

    /* -- 5. placement zigzag + masque 0 ((r+c) % 2 === 0) */
    const dataBits = [];
    seq.forEach(b => { for (let i = 7; i >= 0; i--) dataBits.push((b >> i) & 1); });
    let r = size - 1, dir = -1, k = 0;
    for (let c = size - 1; c > 0; c -= 2) {
      if (c === 6) c--;
      while (true) {
        for (const cc of [c, c - 1]) {
          if (M[r][cc] === null) M[r][cc] = (dataBits[k++] || 0) ^ ((r + cc) % 2 === 0 ? 1 : 0);
        }
        r += dir;
        if (r < 0 || r >= size) { r -= dir; dir = -dir; break; }
      }
    }

    /* -- 6. info de format : niveau M (00) + masque 0, BCH 15,5 */
    let fmt = 0 << 10;                     // 5 bits (00|000) placés en tête de 15
    let rem = fmt;
    for (let i = 14; i >= 10; i--) if (rem & (1 << i)) rem ^= 0x537 << (i - 10);
    fmt = (fmt | rem) ^ 0x5412;
    const f = i => (fmt >> i) & 1;
    const A = [[8, 0], [8, 1], [8, 2], [8, 3], [8, 4], [8, 5], [8, 7], [8, 8], [7, 8], [5, 8], [4, 8], [3, 8], [2, 8], [1, 8], [0, 8]];
    A.forEach(([rr, cc], i) => { M[rr][cc] = f(14 - i); });
    for (let i = 0; i < 7; i++) M[size - 1 - i][8] = f(14 - i);
    for (let i = 0; i < 8; i++) M[8][size - 1 - i] = f(i);

    /* -- 7. SVG (zone calme de 4 modules, fond clair pour rester scannable) */
    let d = '';
    for (let rr = 0; rr < size; rr++) for (let cc = 0; cc < size; cc++)
      if (M[rr][cc]) d += `M${cc + 4} ${rr + 4}h1v1h-1z`;
    const vb = size + 8;
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${vb} ${vb}" shape-rendering="crispEdges"><rect width="${vb}" height="${vb}" fill="#fff"/><path d="${d}" fill="#111"/></svg>`;
  };

  // Pic émotionnel (R3) — la confirmation d'achat devient LE moment signature :
  // onde or/sunset, le billet QR comme objet précieux, la signature « À très
  // vite. — SYFIR ». Partagé par la billetterie et la fiche événement.
  const ticketPeakHTML = ({ num, event, date }) => {
    const qr = makeQR(`SYFIR|${num || ''}|${event}|${date}`);
    return `
      <div class="ticket-peak" role="group" aria-label="Billet confirmé">
        <span class="ticket-peak-splash" aria-hidden="true"></span>
        <div class="ticket-peak-card">
          ${qr ? `<span class="qr-code" role="img" aria-label="QR code du billet ${esc(num || '')}">${qr}</span>` : ''}
          <p class="ticket-peak-num">N° ${esc(num || '')}</p>
        </div>
        <p class="ticket-peak-sign">À très vite.<span>— SYFIR</span></p>
      </div>`;
  };
  window.SYFIR.ticketPeakHTML = ticketPeakHTML;

  /* ===== 23. NEWSLETTER (footer + inline, toutes pages) ===== */
  $$('.footer-news').forEach(form => {
    form.addEventListener('submit', async e => {
      e.preventDefault();
      const input = form.querySelector('input[type="email"]');
      const msg = form.querySelector('.footer-news-msg');
      const btn = form.querySelector('button[type="submit"]');
      const email = input.value.trim();
      const hp = form.querySelector('input[name="_gotcha"]')?.value || '';
      msg.hidden = false; msg.classList.remove('is-error');
      if (!emailRe.test(email)) {
        msg.textContent = 'Entre une adresse email valide.';
        msg.classList.add('is-error');
        input.focus();
        return;
      }
      const label = btn ? btn.textContent : '';
      if (btn) { btn.disabled = true; btn.textContent = '…'; }
      const res = await submitForm({ email, _gotcha: hp, source: 'newsletter' });
      if (btn) { btn.disabled = false; btn.textContent = label; }
      if (res.ok) {
        msg.textContent = '✦ Inscription confirmée ! À très vite pour les prochaines soirées.';
        form.reset();
      } else {
        msg.textContent = 'Oups, l\'envoi a échoué. Réessaie dans un instant.';
        msg.classList.add('is-error');
      }
    });
  });

  /* ===== 24. PROCHAINS ÉVÉNEMENTS (accueil, conversion) =====
     3 prochaines dates réelles depuis la source partagée (events-data.js). */
  const nextBox = $('#nextEvents');
  if (nextBox && window.SYFIR) {
    const S = window.SYFIR;
    const startOfToday = new Date(); startOfToday.setHours(0, 0, 0, 0);
    const upcoming = S.getAllEvents()
      .filter(ev => new Date(ev.date + 'T00:00:00') >= startOfToday)
      .sort((a, b) => a.date.localeCompare(b.date));
    if (!upcoming.length) {
      nextBox.closest('.next-events').hidden = true;
    } else {
      // Carte riche façon chaîne TV : badge catégorie, date+lieu, compte à rebours.
      const fallback = 'images/produits/syfir-pub-plage-1.jpg';
      nextBox.innerHTML = upcoming.map(ev => {
        const d = new Date(ev.date + 'T12:00:00');
        const dateStr = d.getDate() + ' ' + S.MONTHS[d.getMonth()].toLowerCase();
        const badge = ev.prive ? 'Privé 🔒' : (S.typeLabel[ev.type] || 'Soirée');
        const badgeCls = ev.prive ? 'rb-badge-prive' : ('rb-badge-' + ev.type);
        const st = S.stockLabel(ev);
        const img = ev.img || fallback;
        return `
        <a class="rb-card" href="evenement.html?id=${ev.id}" aria-label="${esc(ev.name)} — ${esc(ev.city)}, le ${dateStr}">
          <picture class="rb-card-pic"><img class="rb-card-img" src="${esc(img)}" onerror="this.onerror=null;this.src='${fallback}'" loading="lazy" width="900" height="1200" alt="${esc(ev.name)} — ${esc(ev.city)}"></picture>
          ${st ? `<span class="rb-duration">${esc(st.text)}</span>` : ''}
          <div class="rb-card-overlay">
            <span class="rb-badge ${badgeCls}">${esc(badge)}</span>
            <h3 class="rb-card-title">${esc(ev.name)}</h3>
            <p class="rb-card-sub">📅 ${dateStr} · 📍 ${esc(ev.city)}</p>
            <span class="rb-countdown" data-countdown="${ev.date}T${ev.time || '20:00'}:00"></span>
          </div>
        </a>`;
      }).join('');
    }
  }

  /* ===== 25. COMPTE À REBOURS RÉEL (prochain événement, accueil) ===== */
  const cdEls = $$('[data-countdown]');
  if (cdEls.length && window.SYFIR) {
    const tickCd = () => cdEls.forEach(el => {
      const t = window.SYFIR.countdownText(el.dataset.countdown);
      el.textContent = t ? '⏳ ' + t : '';
    });
    tickCd();
    setInterval(tickCd, 60000);
  }

  /* ===== 26. AGENDA DES CONCERTS : masquer les dates passées (accueil) ===== */
  const agendaRows = $$('.agenda-row');
  if (agendaRows.length) {
    const startOfToday = new Date(); startOfToday.setHours(0, 0, 0, 0);
    let upcoming = 0;
    agendaRows.forEach(row => {
      const d = row.dataset.date ? new Date(row.dataset.date + 'T00:00:00') : null;
      const past = d && d < startOfToday;
      row.hidden = past;
      if (!past) upcoming++;
    });
    const agendaEmpty = $('#agendaEmpty');
    if (agendaEmpty) agendaEmpty.hidden = upcoming > 0;
  }

  /* ===== 27. FAVORIS + MODALES GÉNÉRIQUES (toutes pages) ===== */
  /* Favoris : exploration à coût zéro — un cœur par carte, conservé en
     localStorage. Pas de compteur, pas d'artifice : juste une liste à soi. */
  const getFavs = () => store.get('syfir-favs', []);
  const isFav = id => getFavs().includes(id);
  const toggleFav = id => {
    const favs = getFavs();
    const i = favs.indexOf(id);
    if (i >= 0) favs.splice(i, 1); else favs.push(id);
    store.set('syfir-favs', favs);
    return i < 0;
  };

  // Événements de base + ceux créés via l'espace pro (localStorage)
  let events = window.SYFIR.getAllEvents();

  /* ===== 28. POUR TOI (accueil) — personnalisation locale =====
     Équivalent statique honnête de l'adaptabilité : tout vient du
     localStorage (billets, favoris), rien ne sort de l'appareil.
     Premier visiteur : la section reste cachée. */
  const forYouBox = $('#forYou');
  if (forYouBox && window.SYFIR) {
    const S = window.SYFIR;
    const startOfToday = new Date(); startOfToday.setHours(0, 0, 0, 0);
    const upcoming = ev => new Date(ev.date + 'T00:00:00') >= startOfToday;
    const all = S.getAllEvents();
    const tickets = store.get('syfir-tickets', [])
      .filter(t => new Date(t.date + 'T00:00:00') >= startOfToday)
      .sort((a, b) => a.date.localeCompare(b.date));
    // le prochain événement où l'on a déjà son billet, en premier
    const nextTicketEv = tickets.length
      ? all.find(ev => ev.name === tickets[0].event && ev.date === tickets[0].date)
      : null;
    const favEvs = getFavs()
      .map(id => all.find(ev => ev.id === id)).filter(Boolean)
      .filter(upcoming).filter(ev => ev !== nextTicketEv)
      .sort((a, b) => a.date.localeCompare(b.date));
    const items = [];
    if (nextTicketEv) items.push({ ev: nextTicketEv, tag: '🎟 Ton billet est prêt' });
    favEvs.slice(0, 3 - items.length).forEach(ev => items.push({ ev, tag: '♥ Dans tes favoris' }));
    if (items.length) {
      forYouBox.closest('#pour-toi').hidden = false;
      forYouBox.innerHTML = items.map(({ ev, tag }) => {
        const d = new Date(ev.date + 'T12:00:00');
        return `
        <a class="next-card" href="evenement.html?id=${ev.id}">
          <span class="next-date"><strong>${d.getDate()}</strong><small>${S.MONTHS[d.getMonth()]}</small></span>
          <span class="next-info">
            <strong>${esc(ev.name)}</strong>
            <small>${tag} · 📍 ${esc(ev.city)}</small>
          </span>
          <span class="next-arrow" aria-hidden="true">→</span>
        </a>`;
      }).join('');
    }
  }


  const openModal = m => { m.classList.add('open'); document.body.style.overflow = 'hidden'; };
  const closeModal = m => { m.classList.remove('open'); document.body.style.overflow = ''; };
  $$('.modal').forEach(m => {
    m.addEventListener('click', e => { if (e.target === m || e.target.closest('[data-close]')) closeModal(m); });
  });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') $$('.modal.open').forEach(closeModal); });

  /* ===== 29. MON PROFIL / MON ESPACE (toutes pages) =====
     Billets, favoris, profil : le bouton et la modale existent désormais
     sur chaque page. La resynchronisation des cœurs de la grille
     billetterie passe par renderEventsHook (posé par evenements.html). */
  let renderEventsHook = null;
  // Idem dans l'autre sens : la billetterie rafraîchit Mon espace via ces hooks
  let renderMyTicketsHook = null;
  let renderMyFavsHook = null;
  const clientModal = $('#clientModal');
  const clientBtn = $('#clientSpaceBtn');
  let ticketSub = 'upcoming';

  const getUser = () => store.get('syfir-user', null);
  const isLogged = () => { const u = getUser(); return !!(u && u.name); };
  const firstNameOf = name => (name || '').trim().split(/\s+/)[0] || '';

  if (clientModal) {
  const switchTab = name => {
    $$('#clientTabs .tab').forEach(t => t.classList.toggle('active', t.dataset.tab === name));
    $$('#clientModal .tab-panel').forEach(p => p.classList.toggle('active', p.id === `panel-${name}`));
  };

  const renderAuthState = () => {
    const logged = isLogged();
    const u = getUser() || {};
    if (clientBtn) {
      if (logged) {
        clientBtn.classList.add('is-logged');
        clientBtn.innerHTML = `<span class="nav-avatar">${esc((firstNameOf(u.name)[0] || '?').toUpperCase())}</span>${esc(firstNameOf(u.name))}`;
      } else {
        clientBtn.classList.remove('is-logged');
        clientBtn.innerHTML = '<svg viewBox="0 0 24 24" width="19" height="19" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.6-6.5 8-6.5s8 2.5 8 6.5"/></svg>';
      }
    }
    // Connexion / Inscription seulement si déconnecté
    $$('#clientTabs .tab[data-auth]').forEach(t => { t.hidden = logged; });
    $('#profName').value = u.name || '';
    $('#profEmail').value = u.email || '';
    $('#profCity').value = u.city || '';
    $('#logoutBtn').hidden = !logged;
    const delBtn = $('#deleteProfileBtn'); if (delBtn) delBtn.hidden = !logged;
  };

  const ticketRow = t => {
    // QR réel généré côté client (terrain préparé pour Wallet) :
    // payload lisible par n'importe quel scanner, zéro appel réseau.
    const qr = makeQR(`SYFIR|${t.num || ''}|${t.event}|${t.date}`);
    return `
    <div class="my-ticket">
      <div class="my-ticket-main">
        <strong>${esc(t.event)}</strong>
        <small>${esc(t.city)} · ${new Date(t.date + 'T12:00:00').toLocaleDateString('fr-FR')} · ${esc(t.detail)}</small>
        <small class="ticket-num">N° ${esc(t.num || '—')} · Revente interdite</small>
        <a class="ticket-contact" href="mailto:booking@syfir.fr?subject=${encodeURIComponent('Billet ' + (t.num || '') + ' — ' + t.event)}">✉ Contacter l'organisateur</a>
      </div>
      ${qr
        ? `<span class="qr qr-code" role="img" aria-label="QR code du billet ${esc(t.num || '')}">${qr}</span>`
        : '<span class="qr" aria-label="QR code">▣</span>'}
    </div>`;
  };

  const renderMyTickets = () => {
    const all = store.get('syfir-tickets', []);
    const startOfToday = new Date(); startOfToday.setHours(0, 0, 0, 0);
    const upcoming = all.filter(t => new Date(t.date + 'T00:00:00') >= startOfToday);
    const past = all.filter(t => new Date(t.date + 'T00:00:00') < startOfToday);
    $$('#ticketSubtabs .subtab').forEach(b => { b.dataset.count = b.dataset.sub === 'past' ? past.length : upcoming.length; });
    const list = ticketSub === 'past' ? past : upcoming;
    $('#myTickets').innerHTML = list.length
      ? list.map(ticketRow).join('')
      : `<p class="cart-empty">${ticketSub === 'past' ? 'Aucun billet passé.' : 'Aucun billet à venir. Réserve ta première soirée SYFIR !'}</p>`;
  };

  /* Onglet Favoris : la liste à soi, reliée aux fiches */
  const renderMyFavs = () => {
    const box = $('#myFavs');
    if (!box) return;
    const favs = getFavs().map(id => events.find(ev => ev.id === id)).filter(Boolean);
    box.innerHTML = favs.length
      ? favs.map(ev => `
        <div class="my-ticket my-fav">
          <a href="evenement.html?id=${ev.id}">
            <strong>${esc(ev.name)}</strong>
            <small>${esc(ev.city)} · ${new Date(ev.date + 'T12:00:00').toLocaleDateString('fr-FR')}</small>
          </a>
          <button class="fav-remove" data-unfav="${ev.id}" type="button" aria-label="Retirer ${esc(ev.name)} des favoris">✕</button>
        </div>`).join('')
      : '<p class="cart-empty">Aucun favori pour l\'instant. Touche le ♥ d\'un événement pour le garder sous la main.</p>';
  };
  $('#myFavs')?.addEventListener('click', e => {
    const btn = e.target.closest('[data-unfav]');
    if (!btn) return;
    toggleFav(+btn.dataset.unfav);
    renderMyFavs();
    renderEventsHook?.();   // resynchronise les cœurs de la grille (billetterie)
  });

  renderMyTicketsHook = renderMyTickets;
  renderMyFavsHook = renderMyFavs;

  const openClient = (e, tab) => {
    e?.preventDefault();
    // Pas de profil sur l'appareil -> parcours de connexion dédié (compte.html).
    if (!(window.SYFIR_AUTH && window.SYFIR_AUTH.getProfile())) { location.href = 'compte.html'; return; }
    switchTab(tab || 'tickets');
    renderAuthState();
    renderMyTickets();
    renderMyFavs();
    openModal(clientModal);
  };
  $('#clientSpaceBtn')?.addEventListener('click', e => openClient(e));
  $('#clientSpaceBtnMobile')?.addEventListener('click', e => { openClient(e); mobileNav?.classList.remove('open'); });
  $('#footClientSpace')?.addEventListener('click', e => openClient(e));

  $('#clientTabs').addEventListener('click', e => {
    const tab = e.target.closest('.tab');
    if (tab && !tab.hidden) switchTab(tab.dataset.tab);
  });
  $('#ticketSubtabs').addEventListener('click', e => {
    const s = e.target.closest('.subtab');
    if (!s) return;
    ticketSub = s.dataset.sub;
    $$('#ticketSubtabs .subtab').forEach(b => b.classList.toggle('active', b === s));
    renderMyTickets();
  });

  const login = user => { store.set('syfir-user', user); renderAuthState(); switchTab('tickets'); renderMyTickets(); };

  renderAuthState();
  renderMyTickets();

  $('#panel-login').addEventListener('submit', e => {
    e.preventDefault();
    const okMail = check($('#clEmail'), validators.email);
    const okPass = check($('#clPass'), v => v.length >= 8 || '8 caractères minimum.');
    if (!okMail || !okPass) return;
    const email = $('#clEmail').value.trim();
    const existing = getUser() || {};
    login({ name: existing.name || email.split('@')[0], email, city: existing.city || '' });
    showToast('✦ Bienvenue dans ton espace SYFIR !');
  });

  $('#panel-register').addEventListener('submit', e => {
    e.preventDefault();
    const ok = [
      check($('#rgName'), validators.name),
      check($('#rgEmail'), validators.email),
      check($('#rgPass'), v => v.length >= 8 || '8 caractères minimum.')
    ].every(Boolean);
    if (!ok) return;
    login({ name: $('#rgName').value.trim(), email: $('#rgEmail').value.trim(), city: '' });
    showToast('✦ Compte créé ! Bienvenue dans la communauté SYFIR.');
  });

  $('#panel-profile').addEventListener('submit', e => {
    e.preventDefault();
    const ok = [check($('#profName'), validators.name), check($('#profEmail'), validators.email)].every(Boolean);
    if (!ok) return;
    store.set('syfir-user', { name: $('#profName').value.trim(), email: $('#profEmail').value.trim(), city: $('#profCity').value.trim() });
    renderAuthState();
    showToast('✦ Profil enregistré.');
  });

  $('#logoutBtn').addEventListener('click', () => {
    (window.SYFIR_AUTH ? window.SYFIR_AUTH.signOut() : localStorage.removeItem('syfir-user'));
    renderAuthState();
    switchTab('tickets');
    showToast('À bientôt sur SYFIR !');
  });

  // RGPD : « Supprimer mon profil » — injecté sous « Se déconnecter ».
  const profilePanel = $('#panel-profile');
  if (profilePanel && $('#logoutBtn') && !$('#deleteProfileBtn')) {
    const del = document.createElement('button');
    del.id = 'deleteProfileBtn'; del.type = 'button';
    del.className = 'btn btn-ghost btn-full danger-link';
    del.textContent = 'Supprimer mon profil';
    del.hidden = !isLogged();
    $('#logoutBtn').insertAdjacentElement('afterend', del);
    del.addEventListener('click', () => {
      if (!confirm('Supprimer ton profil de cet appareil ? Cette action est définitive.')) return;
      (window.SYFIR_AUTH ? window.SYFIR_AUTH.deleteProfile() : localStorage.removeItem('syfir-user'));
      renderAuthState();
      switchTab('tickets');
      showToast('Profil supprimé de cet appareil.');
    });
  }

  // Retour depuis compte.html : ouvrir Mon espace automatiquement.
  try {
    if (sessionStorage.getItem('syfir-open-espace')) {
      sessionStorage.removeItem('syfir-open-espace');
      if (window.SYFIR_AUTH && window.SYFIR_AUTH.getProfile()) openClient();
    }
  } catch (e) {}
  }

  /* ===== LIGHTBOX MOMENTS (R3) — les vraies photos en plein écran =====
     Toutes pages : clic/Entrée sur une photo -> plein écran ; flèches/swipe
     pour naviguer, Échap ou fond pour fermer. Pour être DANS le moment.
     Placé AVANT le garde billetterie pour tourner sur syf-tv.html. */
  (function initLightbox() {
    const grids = $$('.moments-grid, .insta-grid');
    if (!grids.length) return;

    const lb = document.createElement('div');
    lb.className = 'lightbox'; lb.hidden = true;
    lb.setAttribute('role', 'dialog'); lb.setAttribute('aria-modal', 'true');
    lb.setAttribute('aria-label', 'Photo en plein écran');
    lb.innerHTML =
      '<button class="lightbox-close" type="button" aria-label="Fermer">✕</button>' +
      '<button class="lightbox-nav lightbox-prev" type="button" aria-label="Photo précédente">‹</button>' +
      '<figure class="lightbox-stage"><img class="lightbox-img" alt=""><figcaption class="lightbox-cap"></figcaption></figure>' +
      '<button class="lightbox-nav lightbox-next" type="button" aria-label="Photo suivante">›</button>' +
      '<p class="lightbox-count" aria-hidden="true"></p>';
    document.body.appendChild(lb);

    const lbImg = $('.lightbox-img', lb), lbCap = $('.lightbox-cap', lb), lbCount = $('.lightbox-count', lb);
    let group = [], idx = 0, lastFocus = null;

    const show = i => {
      idx = (i + group.length) % group.length;
      const img = group[idx];
      lbImg.src = img.currentSrc || img.src;
      lbImg.alt = img.alt || '';
      lbCap.textContent = img.alt || '';
      lbCount.textContent = (idx + 1) + ' / ' + group.length;
    };
    const open = (g, i) => {
      group = g; lastFocus = document.activeElement;
      lb.hidden = false; document.body.style.overflow = 'hidden';
      show(i);
      $('.lightbox-close', lb).focus();
    };
    const close = () => {
      lb.hidden = true; document.body.style.overflow = '';
      lbImg.removeAttribute('src');
      if (lastFocus && lastFocus.focus) lastFocus.focus();
    };

    $('.lightbox-close', lb).addEventListener('click', close);
    $('.lightbox-prev', lb).addEventListener('click', () => show(idx - 1));
    $('.lightbox-next', lb).addEventListener('click', () => show(idx + 1));
    lb.addEventListener('click', e => { if (e.target === lb) close(); });
    document.addEventListener('keydown', e => {
      if (lb.hidden) return;
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowLeft') show(idx - 1);
      else if (e.key === 'ArrowRight') show(idx + 1);
    });
    let sx = 0;
    lb.addEventListener('touchstart', e => { sx = e.touches[0].clientX; }, { passive: true });
    lb.addEventListener('touchend', e => {
      const dx = e.changedTouches[0].clientX - sx;
      if (Math.abs(dx) > 40) show(idx + (dx < 0 ? 1 : -1));
    }, { passive: true });

    grids.forEach(grid => {
      const imgs = $$('img', grid);
      imgs.forEach((img, i) => {
        const trig = img.closest('a') || img;
        trig.style.cursor = 'zoom-in';
        if (trig === img) { img.setAttribute('role', 'button'); img.setAttribute('tabindex', '0'); }
        trig.addEventListener('click', e => { e.preventDefault(); open(imgs, i); });
        if (trig === img) trig.addEventListener('keydown', e => {
          if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(imgs, i); }
        });
      });
    });
  })();

  /* ===== 42. STREAMING ROWS (R8) — flèches des rangées horizontales =====
     Toutes pages. Scroll-snap natif (CSS) ; ici : flèches desktop qui font
     défiler d'une « page », masquées aux extrémités. Swipe mobile = natif. */
  (function initRows() {
    $$('.media-row-wrap').forEach(wrap => {
      const track = $('.media-row-track', wrap);
      if (!track) return;
      const prev = $('.row-prev', wrap), next = $('.row-next', wrap);
      const step = () => Math.max(track.clientWidth * 0.85, 240);
      prev && prev.addEventListener('click', () => track.scrollBy({ left: -step(), behavior: 'smooth' }));
      next && next.addEventListener('click', () => track.scrollBy({ left: step(), behavior: 'smooth' }));
      const update = () => {
        const max = track.scrollWidth - track.clientWidth - 2;
        if (prev) prev.hidden = track.scrollLeft <= 2;
        if (next) next.hidden = track.scrollLeft >= max || max <= 0;
      };
      track.addEventListener('scroll', update, { passive: true });
      addEventListener('resize', update);
      update();
    });
  })();

  /* ===== 45. HERO CARROUSEL PLEIN ÉCRAN (R8-C, accueil) — auto-rotation 6 s,
     stoppée au survol / focus / onglet caché / reduced-motion. ===== */
  (function initHomeHero() {
    const hh = $('#homeHero');
    if (!hh) return;
    const slides = $$('.hh-slide', hh);
    const dotsBox = $('#hhDots');
    if (slides.length < 2 || !dotsBox) return;
    let cur = 0, timer = null;
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    dotsBox.innerHTML = slides.map((_, j) => `<button class="hh-dot${j === 0 ? ' on' : ''}" type="button" aria-label="Aller au visuel ${j + 1}"></button>`).join('');
    const dots = $$('.hh-dot', dotsBox);
    const sync = () => dots.forEach((d, j) => d.classList.toggle('on', j === cur));
    const go = i => { cur = (i + slides.length) % slides.length; hh.scrollTo({ left: hh.clientWidth * cur, behavior: 'smooth' }); sync(); };
    const stop = () => { if (timer) { clearInterval(timer); timer = null; } };
    const start = () => { if (reduced) return; stop(); timer = setInterval(() => go(cur + 1), 6000); };
    const restart = () => { stop(); start(); };
    dots.forEach((d, j) => d.addEventListener('click', () => { go(j); restart(); }));
    $('.hh-prev')?.addEventListener('click', () => { go(cur - 1); restart(); });
    $('.hh-next')?.addEventListener('click', () => { go(cur + 1); restart(); });
    hh.addEventListener('scroll', () => { const i = Math.round(hh.scrollLeft / hh.clientWidth); if (i !== cur) { cur = i; sync(); } }, { passive: true });
    hh.addEventListener('mouseenter', stop); hh.addEventListener('mouseleave', start);
    hh.addEventListener('focusin', stop); hh.addEventListener('focusout', start);
    document.addEventListener('visibilitychange', () => document.hidden ? stop() : start());
    start();
  })();

  /* ============================================================
     PAGE ÉVÉNEMENTS — billetterie & espace pro
  ============================================================ */
  const eventsGrid = $('#eventsGrid');
  if (!eventsGrid) return; // tout ce qui suit ne concerne que evenements.html

  /* ===== 30. DONNÉES & RENDU (source unique : events-data.js -> window.SYFIR) ===== */
  const { TIERS_DEFAULT, MONTHS, baseEvents, typeLabel, stockLabel } = window.SYFIR;
  // Fourchette de prix réelle, calculée depuis les paliers (ex. « 20 € – 55 € »)
  const TIER_MULTS = () => TIERS_DEFAULT.map(t => t.mult);
  const priceRange = ev => {
    const m = TIER_MULTS();
    const lo = ev.price * Math.min(...m), hi = ev.price * Math.max(...m);
    return lo === hi ? euro(lo) : `${euro(lo)} – ${euro(hi)}`;
  };
  const fmtTime = t => t ? t.replace(':', 'h') : '';   // 18:00 -> 18h00
  const genreTags = ev => (ev.genres || []).slice(0, 3)
    .map(g => `<span class="event-genre">${esc(g)}</span>`).join('');

  /* Personnalisation locale : les genres des favoris de l'utilisateur.
     Un événement « recommandé » partage un genre avec un favori sans être
     lui-même déjà en favori. Tout reste dans le localStorage. */
  const favGenres = () => {
    const set = new Set();
    getFavs().forEach(id => {
      const ev = events.find(e => e.id === id);
      (ev?.genres || []).forEach(g => set.add(g.toLowerCase()));
    });
    return set;
  };
  const isReco = (ev, fg) => !isFav(ev.id) && (ev.genres || []).some(g => fg.has(g.toLowerCase()));

  const eventCardHTML = (ev, i) => {
    const d = new Date(ev.date + 'T12:00:00');
    const loc = [ev.city, ev.venue].filter(Boolean).join(' · ');
    const when = [fmtTime(ev.time) ? `🕘 ${fmtTime(ev.time)}` : '', `📍 ${loc}`].filter(Boolean).join(' · ');
    const fav = isFav(ev.id);
    const reco = isReco(ev, favGenres());
    const stock = stockLabel(ev);
    return `
    <article class="event-card${stock && stock.soldOut ? ' is-soldout' : ''}" data-id="${ev.id}" tabindex="0" role="link" aria-label="Voir ${esc(ev.name)}" style="animation-delay:${i * 0.07}s">
      <div class="event-card-media">
        <img src="${esc(ev.img)}" alt="${esc(ev.name)}" loading="lazy">
        <span class="event-date"><strong>${d.getDate()}</strong><small>${MONTHS[d.getMonth()]}</small></span>
        <span class="event-tag ${ev.prive ? 'tag-prive' : ''}">${ev.prive ? '🔒 Privé' : typeLabel[ev.type] || 'Événement'}</span>
        ${stock ? `<span class="stock-badge ${stock.cls}">${stock.text}</span>` : ''}
        <button class="fav-btn ${fav ? 'on' : ''}" data-fav="${ev.id}" type="button"
                aria-pressed="${fav}" aria-label="${fav ? 'Retirer des favoris' : 'Ajouter aux favoris'}">♥</button>
      </div>
      <div class="event-card-body">
        <h3>${esc(ev.name)}</h3>
        ${reco ? '<p class="event-reco">✦ Recommandé pour toi</p>' : ''}
        <p class="event-card-meta">${esc(when)}</p>
        ${genreTags(ev) ? `<div class="event-genres">${genreTags(ev)}</div>` : ''}
        <div class="event-card-foot">
          <span class="event-price"><small>Billets</small><strong>${priceRange(ev)}</strong></span>
          ${stock && stock.soldOut
            ? '<button class="btn btn-ghost btn-sm" type="button" disabled>Complet</button>'
            : `<button class="btn btn-solid btn-sm" data-tickets="${ev.id}">Billets</button>`}
        </div>
        <p class="event-organizer">Organisé par ${esc(ev.organizer)}</p>
      </div>
    </article>`;
  };

  const cityFilter = $('#cityFilter');
  const refreshCityOptions = () => {
    const current = cityFilter.value;
    const cities = [...new Set(events.map(e => e.city))].sort();
    cityFilter.innerHTML = '<option value="">Toutes les villes</option>' +
      cities.map(c => `<option value="${esc(c)}" ${c === current ? 'selected' : ''}>${esc(c)}</option>`).join('');
  };

  const genreFilter = $('#genreFilter');
  const refreshGenreOptions = () => {
    if (!genreFilter) return;
    const current = genreFilter.value;
    const genres = [...new Set(events.flatMap(e => e.genres || []))].sort((a, b) => a.localeCompare(b, 'fr'));
    genreFilter.innerHTML = '<option value="">Tous les genres</option>' +
      genres.map(g => `<option value="${esc(g)}" ${g === current ? 'selected' : ''}>${esc(g)}</option>`).join('');
  };

  /* ===== 31. FILTRES / RECHERCHE / TRI / GROUPEMENT PAR JOUR ===== */
  const state = { filter: 'tous', city: '', genre: '', sort: 'date', search: '' };

  const renderEvents = () => {
    const startOfToday = new Date(); startOfToday.setHours(0, 0, 0, 0);
    let list = events.filter(ev =>
      new Date(ev.date + 'T00:00:00') >= startOfToday &&   // masque les événements passés
      (state.filter === 'tous' || ev.type === state.filter || (state.filter === 'prive' && ev.prive)) &&
      (!state.city || ev.city === state.city) &&
      (!state.genre || (ev.genres || []).some(g => g.toLowerCase() === state.genre.toLowerCase())) &&
      (!state.search || (ev.name + ' ' + ev.city + ' ' + (ev.venue || '') + ' ' + ev.organizer).toLowerCase().includes(state.search))
    );

    // Compteur « X événements à venir »
    const count = list.length;
    $('#eventCount').textContent = count ? `${count} événement${count > 1 ? 's' : ''} à venir` : '';
    $('#noResults').hidden = count > 0;

    // Tri : jours dans l'ordre chronologique ; à l'intérieur d'un jour,
    // par prix si demandé, sinon par heure de début.
    list.sort((a, b) => a.date === b.date
      ? (state.sort === 'prix' ? a.price - b.price : (a.time || '').localeCompare(b.time || ''))
      : a.date.localeCompare(b.date));

    // Groupement par jour, façon Shotgun. À l'intérieur de chaque jour,
    // les événements qui matchent les genres favoris remontent en tête
    // (l'ordre chronologique des jours, lui, ne bouge jamais).
    const fg = favGenres();
    const groups = new Map();
    list.forEach(ev => { if (!groups.has(ev.date)) groups.set(ev.date, []); groups.get(ev.date).push(ev); });
    if (fg.size) groups.forEach(evs => evs.sort((a, b) => isReco(b, fg) - isReco(a, fg)));
    eventsGrid.innerHTML = [...groups.entries()].map(([date, evs]) => {
      const d = new Date(date + 'T12:00:00');
      const head = d.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' });
      return `<div class="day-group">
        <h3 class="day-head"><span class="day-head-label">${head}</span><span class="day-head-count">${evs.length}</span></h3>
        <div class="events-grid">${evs.map(eventCardHTML).join('')}</div>
      </div>`;
    }).join('');
  };

  $('#filterChips').addEventListener('click', e => {
    const chip = e.target.closest('.chip');
    if (!chip) return;
    $$('.chip').forEach(c => c.classList.remove('active'));
    chip.classList.add('active');
    state.filter = chip.dataset.filter;
    renderEventsHook = renderEvents;
    renderEvents();
  });
  cityFilter.addEventListener('change', () => { state.city = cityFilter.value; renderEvents(); });
  genreFilter?.addEventListener('change', () => { state.genre = genreFilter.value; renderEvents(); });
  $('#sortFilter').addEventListener('change', e => { state.sort = e.target.value; renderEvents(); });
  $('#eventSearch')?.addEventListener('input', e => { state.search = e.target.value.trim().toLowerCase(); renderEvents(); });

  refreshCityOptions();
  refreshGenreOptions();
  renderEvents();

  /* ===== 32. MODALE BILLETS ===== */
  const ticketModal = $('#ticketModal');
  let currentEvent = null;
  let tierQty = [];

  const renderTiers = () => {
    $('#ticketTiers').innerHTML = TIERS_DEFAULT.map((t, i) => `
      <div class="tier ${tierQty[i] > 0 ? 'has-qty' : ''} ${t.reco ? 'tier-reco' : ''}">
        <div class="tier-info"><strong>${t.name}${t.reco ? ' <span class="tier-badge">Recommandé</span>' : ''}</strong><small${t.scarce ? ' class="tier-scarce"' : ''}>${t.desc}</small></div>
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

  const openEventPage = card => {
    if (card && card.dataset.id) location.href = `evenement.html?id=${encodeURIComponent(card.dataset.id)}`;
  };
  // Clavier : Entrée/Espace sur une carte ouvre sa fiche
  eventsGrid.addEventListener('keydown', e => {
    if ((e.key === 'Enter' || e.key === ' ') && e.target.classList?.contains('event-card')) {
      e.preventDefault();
      openEventPage(e.target);
    }
  });
  eventsGrid.addEventListener('click', e => {
    // Cœur favori : bascule sans quitter la page
    const favBtn = e.target.closest('[data-fav]');
    if (favBtn) {
      e.stopPropagation();
      const added = toggleFav(+favBtn.dataset.fav);
      favBtn.classList.toggle('on', added);
      favBtn.setAttribute('aria-pressed', String(added));
      favBtn.setAttribute('aria-label', added ? 'Retirer des favoris' : 'Ajouter aux favoris');
      showToast(added ? '♥ Ajouté à tes favoris' : 'Retiré de tes favoris');
      renderMyFavsHook?.();
      return;
    }
    const btn = e.target.closest('[data-tickets]');
    if (!btn) {
      // Clic sur la carte (hors bouton Billets) -> fiche événement partageable
      openEventPage(e.target.closest('.event-card'));
      return;
    }
    currentEvent = events.find(ev => ev.id === +btn.dataset.tickets);
    tierQty = TIERS_DEFAULT.map(() => 0);
    const d = new Date(currentEvent.date + 'T12:00:00');
    $('#tmImage').src = currentEvent.img;
    $('#tmImage').alt = currentEvent.name;
    $('#tmTag').textContent = currentEvent.prive ? '🔒 Soirée privée' : typeLabel[currentEvent.type] || 'Événement';
    $('#tmTitle').textContent = currentEvent.name;
    const when = d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    const loc = [currentEvent.city, currentEvent.venue].filter(Boolean).join(' · ');
    $('#tmMeta').textContent = `📍 ${loc} · ${when}${currentEvent.time ? ' · ' + fmtTime(currentEvent.time) : ''} · Organisé par ${currentEvent.organizer}`;
    $('#tmSuccess').hidden = true;
    $('#tmCalendar').hidden = true;
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
      $('#gateError').textContent = 'Code invalide. Vérifie ton invitation.';
    }
  });

  $('#ticketTiers').addEventListener('click', e => {
    const btn = e.target.closest('.qty-btn');
    if (!btn) return;
    const i = +btn.dataset.tier;
    tierQty[i] = Math.max(0, tierQty[i] + +btn.dataset.delta);
    renderTiers();
  });

  // Numéro de billet unique (façon billetterie réelle)
  const ticketNum = () => 'SYF-' + Date.now().toString(36).toUpperCase() + '-' + Math.floor(Math.random() * 900 + 100);

  $('#tmBuy').addEventListener('click', () => {
    const bought = tierQty.map((q, i) => q > 0 ? `${q}× ${TIERS_DEFAULT[i].name}` : null).filter(Boolean).join(', ');
    const count = tierQty.reduce((s, q) => s + q, 0);
    const num = ticketNum();
    const myTickets = store.get('syfir-tickets', []);
    myTickets.push({ event: currentEvent.name, city: currentEvent.city, date: currentEvent.date, detail: bought, num });
    store.set('syfir-tickets', myTickets);
    $('#ticketTiers').style.display = 'none';
    $('#modalFoot').style.display = 'none';
    const ok = $('#tmSuccess');
    const prenom = firstNameOf((store.get('syfir-user', null) || {}).name);
    ok.textContent = `🎉 C'est dans la poche${prenom ? ', ' + prenom : ''} ! Tu as ${count} billet${count > 1 ? 's' : ''} (${bought}) — N° ${num}. Retrouve-les dans Mon espace.`;
    ok.hidden = false;
    ok.parentNode.querySelector('.ticket-peak')?.remove();
    ok.insertAdjacentHTML('afterend', ticketPeakHTML({ num, event: currentEvent.name, date: currentEvent.date }));
    $('#tmCalendar').hidden = false;
    renderMyTicketsHook?.();
  });

  // La date en poche, l'événement dans l'agenda : .ics généré côté client
  $('#tmCalendar')?.addEventListener('click', () => window.SYFIR.downloadICS(currentEvent));

  /* ===== 33. ESPACE PRO — création + facturation ===== */
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
      check($('#evDate'), v => (v && new Date(v) >= new Date().setHours(0, 0, 0, 0)) || 'Choisis une date à venir.'),
      check($('#evCity'), validators.required),
      check($('#evPrice'), v => (v !== '' && +v >= 0) || 'Indique un prix valide.'),
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
      club: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=900&q=80',
      soiree: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=900&q=80'
    };
    // Image de secours si un nouveau type n'a pas encore de visuel dédié
    const defaultImg = 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=900&q=80';
    const newEvent = {
      id: Date.now(),
      name: $('#evName').value.trim(),
      type: isPrivate ? 'prive' : $('#evType').value,
      city: $('#evCity').value.trim(),
      venue: $('#evVenue').value.trim(),
      date: $('#evDate').value,
      time: $('#evTime').value,
      price: +$('#evPrice').value,
      genres: ($('#evGenres').value || '').split(',').map(g => g.trim()).filter(Boolean).slice(0, 3),
      img: imgByType[$('#evType').value] || defaultImg,
      organizer: 'SYFIR Events',
      prive: isPrivate,
      code: isPrivate ? $('#evCode').value.trim().toUpperCase() : undefined
    };

    const proEvents = store.get('syfir-pro-events', []);
    proEvents.push(newEvent);
    store.set('syfir-pro-events', proEvents);
    events = [...baseEvents, ...proEvents];
    refreshCityOptions();
    refreshGenreOptions();
    renderEvents();

    const total = $('#billingTotal').textContent;
    const success = $('#proSuccess');
    success.textContent = isPrivate
      ? `✦ Événement privé créé ! Partage le code « ${newEvent.code} » avec tes invités. Facturation : ${total} + 2,5 % par billet vendu.`
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
