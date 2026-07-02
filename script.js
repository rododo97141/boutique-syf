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

  /* (02. Préloader retiré au lot 8 — vitesse perçue > cérémonie) */

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
  const reveals = $$('.reveal');
  const inViewport = el => {
    const r = el.getBoundingClientRect();
    return r.top < window.innerHeight * 0.95 && r.bottom > 0;
  };
  // Au chargement : révèle immédiatement tout ce qui est déjà dans le viewport
  // (le reste est visible par défaut et s'anime en entrant à l'écran).
  reveals.forEach(el => { if (inViewport(el)) el.classList.add('in'); });
  const revealObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('in'); revealObs.unobserve(e.target); }
    });
  }, { threshold: 0, rootMargin: '0px 0px -8% 0px' });
  reveals.forEach(el => { if (!el.classList.contains('in')) revealObs.observe(el); });

  /* ===== 05. PARALLAXE DOUCE =====
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

  /* ===== 07b. MENU DE THÈME : AUTOMATIQUE / CLAIR / SOMBRE =====
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

  /* ===== 07c. AGE GATE 18+ =====
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

  /* ===== 08a-bis. LINE-UP (artistes, DJs & groupes) : filtre + booking ===== */
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
  $$('[data-request]').forEach(el => {
    el.addEventListener('click', () => {
      const radio = $(`input[name="requestType"][value="${el.dataset.request}"]`);
      if (radio) { radio.checked = true; radio.dispatchEvent(new Event('change')); }
      const form = $('#partnerForm');
      if (form) {
        const top = form.getBoundingClientRect().top + window.scrollY - 90;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

  /* ===== 08a-ter-0. CARROUSEL MÉDIA (cartes artistes + modale) =====
     Standards carrousel (NN/g, web.dev) : scroll-snap natif = swipe tactile,
     flèches ≥ 44 px, points indicateurs, PAS d'autoplay, clavier ←/→,
     aria-roledescription, lazy-load des médias hors écran.
     4 diapositives max : 3 photos + 1 vidéo (fin atteignable en 3 swipes). */
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

  const buildMediaCarousel = (box, { photos = '', video = '', name = '', badge = '', playBtn = false }) => {
    const list = photos.split('|').map(s => s.trim()).filter(Boolean).slice(0, 3);
    if (!list.length) return;

    const videoSlide = video
      ? (/youtube\.com|youtu\.be/.test(video)
        ? `<div class="car-slide car-slide-video" role="group" aria-roledescription="diapositive">
             <button class="car-video-load" data-embed="${video}" type="button" aria-label="Lire la vidéo de ${name}">▶ Voir la vidéo</button>
           </div>`
        : `<div class="car-slide car-slide-video" role="group" aria-roledescription="diapositive">
             <video controls preload="none" src="${video}" aria-label="Vidéo de ${name}"></video>
           </div>`)
      : `<div class="car-slide car-slide-video car-video-soon" role="group" aria-roledescription="diapositive">
           <span class="car-soon-ic" aria-hidden="true">🎬</span>
           <p>Vidéo bientôt disponible</p>
         </div>`;

    box.classList.add('media-car');
    box.setAttribute('role', 'group');
    box.setAttribute('aria-roledescription', 'carrousel');
    box.setAttribute('aria-label', `Galerie de ${name}`);
    box.tabIndex = 0;
    box.innerHTML = `
      <div class="car-track">
        ${list.map((src, i) => `
        <div class="car-slide" role="group" aria-roledescription="diapositive">
          <img src="${src}" alt="${name} — photo ${i + 1}" loading="${i === 0 ? 'eager' : 'lazy'}" decoding="async">
        </div>`).join('')}
        ${videoSlide}
      </div>
      <button class="car-btn car-prev" type="button" aria-label="Média précédent">‹</button>
      <button class="car-btn car-next" type="button" aria-label="Média suivant">›</button>
      <div class="car-dots"></div>
      ${badge ? `<span class="artist-badge">${badge}</span>` : ''}
      ${playBtn ? `<button class="artist-play" type="button" aria-label="Écouter un extrait de ${name}">▶</button>` : ''}`;

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
    box.querySelectorAll('.car-slide img').forEach(img => {
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
    // Vidéo YouTube : façade — l'iframe ne se charge qu'au clic (perf + vie privée)
    const loader = box.querySelector('.car-video-load');
    loader?.addEventListener('click', e => {
      e.stopPropagation();
      const url = loader.dataset.embed + (loader.dataset.embed.includes('?') ? '&' : '?') + 'autoplay=1';
      loader.closest('.car-slide').innerHTML =
        `<iframe src="${url}" title="Vidéo de ${name}" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe>`;
    });

    refresh();
  };

  // Les visuels des cartes artistes deviennent des galeries média
  $$('.artist-card').forEach(card => {
    const d = card.dataset;
    const photoBox = card.querySelector('.artist-photo');
    if (photoBox && d.photos) {
      buildMediaCarousel(photoBox, {
        photos: d.photos, video: d.video || '', name: d.name || '',
        badge: d.badge || '', playBtn: true
      });
    }
  });

  /* ===== 08a-ter. LECTEUR D'EXTRAITS + FICHE ARTISTE ===== */
  const audio = $('#previewAudio');
  let currentBtn = null;
  const fmt = s => { s = Math.floor(s || 0); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); };
  const setPlayIcon = (btn, playing) => {
    if (!btn) return;
    btn.textContent = playing ? '❚❚' : '▶';
    btn.classList.toggle('playing', playing);
  };
  const stopCurrent = () => { setPlayIcon(currentBtn, false); currentBtn = null; };
  const toggleAudio = (src, btn) => {
    if (!audio || !src) { showToast('🎧 Extrait audio bientôt disponible'); return; }
    if (currentBtn === btn && !audio.paused) { audio.pause(); return; }
    if (!audio.src.endsWith(src)) { audio.src = src; }
    if (currentBtn && currentBtn !== btn) setPlayIcon(currentBtn, false);
    currentBtn = btn;
    audio.play()
      .then(() => setPlayIcon(btn, true))
      .catch(() => { showToast('🎧 Extrait audio bientôt disponible'); stopCurrent(); });
  };
  audio?.addEventListener('pause', () => { if (currentBtn) setPlayIcon(currentBtn, false); });
  audio?.addEventListener('ended', stopCurrent);

  // Lecture rapide depuis la carte
  $$('.artist-play').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      toggleAudio(btn.closest('.artist-card')?.dataset.audio, btn);
    });
  });

  // Modale fiche artiste
  const artistModal = $('#artistModal');
  if (artistModal) {
    const amHero = artistModal.querySelector('.am-hero'), amRole = $('#amRole'),
          amName = $('#amName'), amTags = $('#amTags'), amBio = $('#amBio'),
          amPlay = $('#amPlay'), amBar = artistModal.querySelector('.am-bar'),
          amBarFill = $('#amBarFill'), amTime = $('#amTime');
    let modalSrc = '';

    // Un vrai profil a un chemin au-delà de la racine (ex. /artist/xxx, /@handle) ;
    // une page d'accueil générique (open.spotify.com, youtube.com…) est ignorée.
    const isRealProfile = url => {
      if (!url) return false;
      try { return new URL(url).pathname.replace(/\/+$/, '').length > 1; }
      catch { return false; }
    };

    const openArtist = card => {
      const d = card.dataset;
      // Galerie média de la modale : mêmes photos/vidéo que la carte
      buildMediaCarousel(amHero, {
        photos: d.photos || d.img || '', video: d.video || '',
        name: d.name || '', badge: d.badge || ''
      });
      amRole.textContent = d.role || '';
      amName.textContent = d.name || '';
      amTags.innerHTML = (d.tags || '').split(',').filter(Boolean)
        .map(t => `<span>${t.trim()}</span>`).join('');
      amBio.textContent = d.bio || '';
      // Liens streaming : n'afficher que les vrais profils (pas les pages
      // d'accueil génériques). Le data-attribute reste sur la carte.
      let anyStream = false;
      [['#amSpotify', d.spotify], ['#amSoundcloud', d.soundcloud], ['#amYoutube', d.youtube]].forEach(([sel, url]) => {
        const el = $(sel);
        const real = isRealProfile(url);
        el.hidden = !real;
        if (real) { el.href = url; anyStream = true; }
      });
      const amStream = $('#amStream');
      if (amStream) amStream.hidden = !anyStream;
      modalSrc = d.audio || '';
      amBarFill.style.width = '0%'; amTime.textContent = '0:00';
      setPlayIcon(amPlay, false);
      artistModal.classList.add('open');
      document.body.style.overflow = 'hidden';
    };
    const closeArtist = () => {
      artistModal.classList.remove('open');
      document.body.style.overflow = '';
      if (currentBtn === amPlay) audio?.pause();
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
    amPlay?.addEventListener('click', () => toggleAudio(modalSrc, amPlay));
    audio?.addEventListener('timeupdate', () => {
      if (currentBtn !== amPlay) return;
      const p = audio.duration ? (audio.currentTime / audio.duration) * 100 : 0;
      amBarFill.style.width = p + '%';
      amTime.textContent = fmt(audio.currentTime);
    });
    amBar?.addEventListener('click', e => {
      if (!audio.duration) return;
      const r = amBar.getBoundingClientRect();
      audio.currentTime = ((e.clientX - r.left) / r.width) * audio.duration;
    });
  }

  /* ===== 08a-ter-2. FICHE PRODUIT COCKTAIL (modale) ===== */
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

  /* ===== 08a-quater. CARROUSEL DE LOGOS PARTENAIRES ===== */
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

  /* ===== 08b. FICHE PARTENAIRE (modale) ===== */
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
      pmThumbs.innerHTML = photos.map((p, i) => `<button class="pm-thumb${i === 0 ? ' active' : ''}" data-src="${p}" type="button"><img src="${p}" alt="" loading="lazy"></button>`).join('');
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
      partenaire:   { label: 'Nom de l\'établissement *',      placeholder: 'Le nom de votre lieu' },
      evenement:    { label: 'Type d\'événement *',            placeholder: 'Mariage, soirée privée, festival…' },
      artiste:      { label: 'Nom de scène / du groupe *',     placeholder: 'DJ, chanteur, groupe… + style musical' },
      collaborateur:{ label: 'Votre rôle / talent *',          placeholder: 'Photographe, vidéaste, hôte·sse, ambassadeur·rice…' },
      distributeur: { label: 'Zone de distribution *',         placeholder: 'Région, département, île…' },
      autre:        { label: 'Objet de votre demande *',       placeholder: 'Presse, collaboration, idée…' }
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

  /* ===== 09b. RETOUR EN HAUT + BARRE DE PROGRESSION (toutes pages) ===== */
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

  /* ===== 09b-bis. FAB BILLETS : un seul CTA principal par écran =====
     Le bouton flottant s'efface tant que le hero (et son CTA « Voir les
     événements ») est à l'écran, puis réapparaît plus bas dans la page. */
  const ticketsFab = $('#ticketsFab');
  const ticketsHero = $('.tickets-hero');
  if (ticketsFab && ticketsHero && 'IntersectionObserver' in window) {
    new IntersectionObserver(entries => {
      entries.forEach(en => ticketsFab.classList.toggle('fab-hidden', en.isIntersecting));
    }, { threshold: 0.2 }).observe(ticketsHero);
  }

  /* ===== 09b-2. AFTERMOVIE : façade lazy (accueil) =====
     L'iframe YouTube ne se charge qu'au clic (performance / vie privée).
     Tant que data-embed contient VIDEO_ID (placeholder), on informe
     simplement que la vidéo arrive. */
  const aftermovieBtn = $('#aftermovieBtn');
  aftermovieBtn?.addEventListener('click', () => {
    const embed = aftermovieBtn.dataset.embed || '';
    if (!embed || embed.includes('VIDEO_ID')) {
      showToast('🎬 L\'aftermovie arrive très bientôt !');
      return;
    }
    const url = embed + (embed.includes('?') ? '&' : '?') + 'autoplay=1';
    aftermovieBtn.closest('.aftermovie').innerHTML =
      `<iframe class="aftermovie-frame" src="${url}" title="Aftermovie SYFIR"
        allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe>`;
  });

  /* ===== 09b-ter. NEWSLETTER (footer, toutes pages) ===== */
  $$('.footer-news').forEach(form => {
    form.addEventListener('submit', e => {
      e.preventDefault();
      const input = form.querySelector('input[type="email"]');
      const msg = form.querySelector('.footer-news-msg');
      const email = input.value.trim();
      msg.hidden = false;
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
        msg.textContent = 'Entrez une adresse email valide.';
        msg.classList.add('is-error');
        input.focus();
        return;
      }
      // TODO : brancher l'endpoint d'emailing (Brevo ou Mailchimp). Exemple Brevo :
      // fetch('https://api.brevo.com/v3/contacts', {
      //   method: 'POST',
      //   headers: { 'api-key': BREVO_API_KEY, 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ email, listIds: [ID_LISTE_SYFIR], updateEnabled: true })
      // }).then(...)
      msg.classList.remove('is-error');
      msg.textContent = '✦ Inscription confirmée ! À très vite pour les prochaines soirées.';
      form.reset();
    });
  });

  /* ===== 09b-quater. PROCHAINS ÉVÉNEMENTS (accueil, conversion) =====
     3 prochaines dates réelles depuis la source partagée (events-data.js). */
  const nextBox = $('#nextEvents');
  if (nextBox && window.SYFIR) {
    const startOfToday = new Date(); startOfToday.setHours(0, 0, 0, 0);
    const next3 = window.SYFIR.getAllEvents()
      .filter(ev => !ev.prive && new Date(ev.date + 'T00:00:00') >= startOfToday)
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(0, 3);
    if (!next3.length) {
      nextBox.closest('.next-events').hidden = true;
    } else {
      nextBox.innerHTML = next3.map((ev, i) => {
        const d = new Date(ev.date + 'T12:00:00');
        return `
        <a class="next-card" href="evenement.html?id=${ev.id}">
          <span class="next-date"><strong>${d.getDate()}</strong><small>${window.SYFIR.MONTHS[d.getMonth()]}</small></span>
          <span class="next-info">
            <strong>${ev.name}</strong>
            <small>${ev.time ? '🕘 ' + window.SYFIR.fmtTime(ev.time) + ' · ' : ''}📍 ${ev.city}</small>
            ${i === 0 ? '<span class="next-countdown" data-countdown="' + ev.date + 'T' + (ev.time || '20:00') + ':00"></span>' : ''}
          </span>
          <span class="next-arrow" aria-hidden="true">→</span>
        </a>`;
      }).join('');
    }
  }

  /* ===== 09b-5. COMPTE À REBOURS RÉEL (prochain événement, accueil) ===== */
  const cdEls = $$('[data-countdown]');
  if (cdEls.length && window.SYFIR) {
    const tickCd = () => cdEls.forEach(el => {
      const t = window.SYFIR.countdownText(el.dataset.countdown);
      el.textContent = t ? '⏳ ' + t : '';
    });
    tickCd();
    setInterval(tickCd, 60000);
  }

  /* ===== 09c. AGENDA DES CONCERTS : masquer les dates passées (accueil) ===== */
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

  /* ============================================================
     PAGE ÉVÉNEMENTS — billetterie & espace pro
  ============================================================ */
  const eventsGrid = $('#eventsGrid');
  if (!eventsGrid) return; // tout ce qui suit ne concerne que evenements.html

  /* ===== 10. DONNÉES & RENDU (source unique : events-data.js -> window.SYFIR) ===== */
  const { TIERS_DEFAULT, MONTHS, baseEvents, typeLabel } = window.SYFIR;
  // Événements de base + ceux créés via l'espace pro (localStorage)
  let events = window.SYFIR.getAllEvents();

  // Fourchette de prix réelle, calculée depuis les paliers (ex. « 20 € – 55 € »)
  const TIER_MULTS = () => TIERS_DEFAULT.map(t => t.mult);
  const priceRange = ev => {
    const m = TIER_MULTS();
    const lo = ev.price * Math.min(...m), hi = ev.price * Math.max(...m);
    return lo === hi ? euro(lo) : `${euro(lo)} – ${euro(hi)}`;
  };
  const fmtTime = t => t ? t.replace(':', 'h') : '';   // 18:00 -> 18h00
  const genreTags = ev => (ev.genres || []).slice(0, 3)
    .map(g => `<span class="event-genre">${g}</span>`).join('');

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

  const eventCardHTML = (ev, i) => {
    const d = new Date(ev.date + 'T12:00:00');
    const loc = [ev.city, ev.venue].filter(Boolean).join(' · ');
    const when = [fmtTime(ev.time) ? `🕘 ${fmtTime(ev.time)}` : '', `📍 ${loc}`].filter(Boolean).join(' · ');
    const fav = isFav(ev.id);
    return `
    <article class="event-card" data-id="${ev.id}" tabindex="0" role="link" aria-label="Voir ${ev.name}" style="animation-delay:${i * 0.07}s">
      <div class="event-card-media">
        <img src="${ev.img}" alt="${ev.name}" loading="lazy">
        <span class="event-date"><strong>${d.getDate()}</strong><small>${MONTHS[d.getMonth()]}</small></span>
        <span class="event-tag ${ev.prive ? 'tag-prive' : ''}">${ev.prive ? '🔒 Privé' : typeLabel[ev.type] || 'Événement'}</span>
        <button class="fav-btn ${fav ? 'on' : ''}" data-fav="${ev.id}" type="button"
                aria-pressed="${fav}" aria-label="${fav ? 'Retirer des favoris' : 'Ajouter aux favoris'}">♥</button>
      </div>
      <div class="event-card-body">
        <h3>${ev.name}</h3>
        <p class="event-card-meta">${when}</p>
        ${genreTags(ev) ? `<div class="event-genres">${genreTags(ev)}</div>` : ''}
        <div class="event-card-foot">
          <span class="event-price"><small>Billets</small><strong>${priceRange(ev)}</strong></span>
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

  const genreFilter = $('#genreFilter');
  const refreshGenreOptions = () => {
    if (!genreFilter) return;
    const current = genreFilter.value;
    const genres = [...new Set(events.flatMap(e => e.genres || []))].sort((a, b) => a.localeCompare(b, 'fr'));
    genreFilter.innerHTML = '<option value="">Tous les genres</option>' +
      genres.map(g => `<option value="${g}" ${g === current ? 'selected' : ''}>${g}</option>`).join('');
  };

  /* ===== 11. FILTRES / RECHERCHE / TRI / GROUPEMENT PAR JOUR ===== */
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

    // Groupement par jour, façon Shotgun
    const groups = new Map();
    list.forEach(ev => { if (!groups.has(ev.date)) groups.set(ev.date, []); groups.get(ev.date).push(ev); });
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
    renderEvents();
  });
  cityFilter.addEventListener('change', () => { state.city = cityFilter.value; renderEvents(); });
  genreFilter?.addEventListener('change', () => { state.genre = genreFilter.value; renderEvents(); });
  $('#sortFilter').addEventListener('change', e => { state.sort = e.target.value; renderEvents(); });
  $('#eventSearch')?.addEventListener('input', e => { state.search = e.target.value.trim().toLowerCase(); renderEvents(); });

  refreshCityOptions();
  refreshGenreOptions();
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
      showToast(added ? '♥ Ajouté à vos favoris' : 'Retiré de vos favoris');
      renderMyFavs();
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
    renderMyTickets();
  });

  /* ===== 13. MON PROFIL (espace membre : billets À venir/Passés, profil, auth) ===== */
  const clientModal = $('#clientModal');
  const clientBtn = $('#clientSpaceBtn');
  let ticketSub = 'upcoming';

  const getUser = () => store.get('syfir-user', null);
  const isLogged = () => { const u = getUser(); return !!(u && u.name); };
  const firstNameOf = name => (name || '').trim().split(/\s+/)[0] || '';

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
        clientBtn.innerHTML = `<span class="nav-avatar">${(firstNameOf(u.name)[0] || '?').toUpperCase()}</span>${firstNameOf(u.name)}`;
      } else {
        clientBtn.classList.remove('is-logged');
        clientBtn.textContent = 'Mon profil';
      }
    }
    // Connexion / Inscription seulement si déconnecté
    $$('#clientTabs .tab[data-auth]').forEach(t => { t.hidden = logged; });
    $('#profName').value = u.name || '';
    $('#profEmail').value = u.email || '';
    $('#profCity').value = u.city || '';
    $('#logoutBtn').hidden = !logged;
  };

  const ticketRow = t => `
    <div class="my-ticket">
      <div class="my-ticket-main">
        <strong>${t.event}</strong>
        <small>${t.city} · ${new Date(t.date + 'T12:00:00').toLocaleDateString('fr-FR')} · ${t.detail}</small>
        <small class="ticket-num">N° ${t.num || '—'} · Revente interdite</small>
        <a class="ticket-contact" href="mailto:booking@syfir.fr?subject=${encodeURIComponent('Billet ' + (t.num || '') + ' — ' + t.event)}">✉ Contacter l'organisateur</a>
      </div>
      <span class="qr" aria-label="QR code">▣</span>
    </div>`;

  const renderMyTickets = () => {
    const all = store.get('syfir-tickets', []);
    const startOfToday = new Date(); startOfToday.setHours(0, 0, 0, 0);
    const upcoming = all.filter(t => new Date(t.date + 'T00:00:00') >= startOfToday);
    const past = all.filter(t => new Date(t.date + 'T00:00:00') < startOfToday);
    $$('#ticketSubtabs .subtab').forEach(b => { b.dataset.count = b.dataset.sub === 'past' ? past.length : upcoming.length; });
    const list = ticketSub === 'past' ? past : upcoming;
    $('#myTickets').innerHTML = list.length
      ? list.map(ticketRow).join('')
      : `<p class="cart-empty">${ticketSub === 'past' ? 'Aucun billet passé.' : 'Aucun billet à venir. Réservez votre première soirée SYFIR !'}</p>`;
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
            <strong>${ev.name}</strong>
            <small>${ev.city} · ${new Date(ev.date + 'T12:00:00').toLocaleDateString('fr-FR')}</small>
          </a>
          <button class="fav-remove" data-unfav="${ev.id}" type="button" aria-label="Retirer ${ev.name} des favoris">✕</button>
        </div>`).join('')
      : '<p class="cart-empty">Aucun favori pour l\'instant. Touchez le ♥ d\'un événement pour le garder sous la main.</p>';
  };
  $('#myFavs')?.addEventListener('click', e => {
    const btn = e.target.closest('[data-unfav]');
    if (!btn) return;
    toggleFav(+btn.dataset.unfav);
    renderMyFavs();
    renderEvents();   // resynchronise les cœurs de la grille
  });

  const openClient = (e, tab) => {
    e?.preventDefault();
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
    localStorage.removeItem('syfir-user');
    renderAuthState();
    switchTab('tickets');
    showToast('À bientôt sur SYFIR !');
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
      organizer: 'Votre organisation × SYFIR',
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
