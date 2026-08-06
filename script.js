/* ============================================================
   SYFIR
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
  /* <picture> webp+jpg pour les images locales (R25) : le WebP n'est proposé
     que pour images/ext/ et images/produits/ (WebP garanti à côté du JPEG) ;
     sinon repli <img> simple (ex. .png sans WebP). */
  const picHTML = (src, attrs = '') => {
    const w = /\/(ext|produits)\/[^"']+\.jpe?g$/i.test(src) ? src.replace(/\.jpe?g$/i, '.webp') : null;
    return w
      ? `<picture><source type="image/webp" srcset="${esc(w)}"><img src="${esc(src)}" ${attrs}></picture>`
      : `<img src="${esc(src)}" ${attrs}>`;
  };
  const store = {
    get(key, fallback) {
      try { return JSON.parse(localStorage.getItem(key)) ?? fallback; }
      catch { return fallback; }
    },
    set(key, val) { localStorage.setItem(key, JSON.stringify(val)); }
  };

  /* ===== 01b. ENDPOINT DES FORMULAIRES ===== LOT E/2
     ------------------------------------------------------------------
     ACTIVÉ. Autorisation explicite du fondateur, levée de liste rouge
     limitée À CE SEUL POINT. Le compte prestataire a été créé par lui,
     pas par une session : aucune inscription chez un tiers n'est faite
     depuis ce dépôt, et cette règle-là n'a pas bougé.

     Prestataire : WEB3FORMS. Retenu contre Formspree parce qu'il ne
     demande qu'une adresse mail — Formspree exige la création d'un
     compte, que ni le fondateur ni le superviseur ne feront.
     Le contrat de l'API : POST JSON sur https://api.web3forms.com/submit
     avec `access_key` DANS LE CORPS.

     ⚠ LA CLÉ N'EST PAS UN SECRET, et il faut le dire pour que personne
     ne « corrige » ça plus tard : Web3Forms la documente comme publique
     (« This is a public key. You can use it in client side code. »).
     Elle est même une PROTECTION : elle sert d'alias, l'adresse de
     destination réelle n'apparaît nulle part dans les sources du site.
     La sortir vers un fichier de configuration n'ajouterait aucune
     sécurité et ajouterait une étape de build — liste rouge.

     Compatibilité Formspree conservée, et elle ne coûte rien : une URL
     `https://formspree.io/f/xxxxxxxx` fonctionne telle quelle, le champ
     `access_key` surnuméraire étant simplement ignoré par Formspree.

     Anti-spam : chaque formulaire porte un honeypot (champ caché
     `_gotcha`), invisible pour l'humain ; s'il est rempli, c'est un bot
     → on abandonne EN SILENCE, sans requête réseau, et le bot croit
     avoir réussi. Le champ n'est jamais transmis au prestataire. */
  const FORM_ENDPOINT = 'https://api.web3forms.com/submit';
  const FORM_ACCESS_KEY = '35807543-abbf-4253-a494-b5b730d90942';   // ← LA LIGNE DE LA CLÉ

  /* QUELS FORMULAIRES TRANSMETTENT — et pourquoi la newsletter n'est pas
     de la liste. « Brancher la newsletter » est un point de liste rouge
     DISTINCT, et il n'a pas été levé : une inscription newsletter est un
     consentement commercial qui appelle son propre traitement (registre,
     désinscription, double opt-in), pas un simple message. Elle reste
     donc en mode démo, et sa note « démo » reste affichée — ce qui est
     la vérité pour elle. Le jour où le fondateur la lève, il suffit
     d'ajouter 'newsletter' ici. */
  const FORM_SOURCES_ACTIVES = ['partenaire'];
  const formTransmet = source => !!FORM_ENDPOINT && FORM_SOURCES_ACTIVES.includes(source);

  // Message VRAI pour un formulaire qui ne transmet pas : ne jamais laisser
  // croire qu'une donnée a été transmise OU stockée (R29-1, durci en R80.1
  // final — plus de sauvegarde locale automatique, les champs gardent juste
  // la saisie).
  const DEMO_FORM_MSG = 'L\'envoi en ligne n\'est pas encore actif. Tes informations restent dans ce formulaire, sur cet écran — rien n\'est enregistré ni transmis.';
  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  const submitForm = async data => {
    if (data._gotcha) return { ok: true, bot: true };        // honeypot → abandon silencieux
    if (!formTransmet(data.source)) return { ok: false, demo: true };
    /* Le honeypot ne quitte jamais le navigateur : il a fait son travail
       ci-dessus, et l'envoyer ne ferait que salir le message reçu. */
    const { _gotcha, ...champs } = data;
    const corps = { access_key: FORM_ACCESS_KEY, ...champs };
    try {
      const r = await fetch(FORM_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(corps)
      });
      /* ⚠ `r.ok` SEUL MENTIRAIT. Web3Forms répond en JSON `{success:…}` et
         peut rendre un 200 avec `success:false` (clé invalide, message
         classé spam, quota). Un formulaire qui affiche « merci » alors que
         rien n'est parti est pire que le mode démo : il ment au visiteur
         ET au destinataire. On lit donc le corps, et on ne conclut au
         succès que si les DEUX concordent. */
      let corpsRep = null;
      try { corpsRep = await r.clone().json(); } catch (e) { corpsRep = null; }
      const ok = r.ok && (!corpsRep || corpsRep.success !== false);
      return { ok, statut: r.status, motif: ok ? '' : String((corpsRep && corpsRep.message) || '') };
    } catch (e) {
      return { ok: false, reseau: true };   // hors ligne, DNS, CORS, blocage
    }
  };

  /* Bandeau discret « démo — transmission bientôt active » près d'un bouton
     d'envoi — uniquement pour un formulaire qui ne transmet PAS. Il
     disparaît de lui-même dès que sa source entre dans
     FORM_SOURCES_ACTIVES : aucune note à retirer à la main, donc aucune
     note oubliée qui mentirait dans l'autre sens. */
  const addDemoNote = (btn, source) => {
    if (formTransmet(source) || !btn || btn.parentNode?.querySelector('.form-demo-note')) return;
    const note = document.createElement('span');
    note.className = 'form-demo-note';
    note.textContent = 'démo — transmission bientôt active';
    btn.insertAdjacentElement('afterend', note);
  };

  /* ===== 02. NAVBAR DYNAMIQUE + MENU MOBILE ===== */
  // Anciennes ancres de l'accueil -> pages dédiées (transposition maquette).
  // On ne redirige que si la cible n'existe pas sur la page courante.
  const movedAnchors = { '#cocktails': 'saveurs.html', '#communaute': 'syf-tv.html' };
  const movedTo = movedAnchors[location.hash];
  if (movedTo && !document.getElementById(location.hash.slice(1))) location.replace(movedTo);

  const nav = $('#nav');
  const avyrBar = $('.avyr-bar');
  const onScrollNav = () => {
    const s = window.scrollY > 40;
    if (nav) nav.classList.toggle('scrolled', s);
    if (avyrBar) avyrBar.classList.toggle('scrolled', s);
  };
  window.addEventListener('scroll', onScrollNav, { passive: true });
  onScrollNav();

  // R21-A : onglet caché -> met en pause les animations d'ambiance (Ken Burns
  // du hero) via une classe globale ; économise CPU/batterie en arrière-plan.
  const onTabVis = () => document.body.classList.toggle('tab-hidden', document.hidden);
  document.addEventListener('visibilitychange', onTabVis);
  onTabVis();

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
    const envies = [
      ['evenements.html', 'Fête', 'images/ext/unsplash-photo-1533174072545-7a4b6ad7a6c3.jpg'],
      ['evenements.html', 'Plage', 'images/ext/unsplash-photo-1507525428034-b723cf961d3e.jpg'],
      ['index.html#artistes', 'Concert', 'images/artiste-unity.jpg'],
      ['evenements.html', 'Privé', 'images/ext/unsplash-photo-1574391884720-bbc3740c59d1.jpg'],
    ];
    const idx = [
      ['Accueil', 'index.html#accueil', 'marque hero'],
      ['L\'Écosystème', 'partenaires.html', 'partenaires reseau lieux bars clubs organisateurs prestataires'],
      ['Lieux', 'partenaires.html#eco-lieux', 'bars restaurants clubs beach clubs hôtels espaces événementiels'],
      ['Marques partenaires', 'partenaires.html#eco-marques', 'marques avyr cocktails boissons produits expériences'],
      ['Événements & Fêtes', 'evenements.html', 'billetterie soirées beach party festival'],
      ['Artistes', 'index.html#artistes', 'djs line-up groupes'],
      ['SYFIR TV', 'syf-tv.html', 'moments chaîne aftermovie ambiance'],
      ['Espace pro', 'espace-pro.html', 'organisateur smartboard billetterie'],
      ['Devenir partenaire', 'partenaires.html', 'partenaire investisseur lieu ambassadeur bars clubs hôtels prestataire marque média référencement'],
      ['Investisseurs', 'partenaires.html#investisseurs', 'investir levée de fonds actionnaire capital la maison institutionnel'],
      ['Nous rejoindre', 'partenaires.html#partnerForm', 'recrutement emploi carrière rejoindre équipe candidature partenaire la maison institutionnel'],
      ['Contact', 'partenaires.html#partnerForm', 'contact formulaire écrire nous joindre la maison institutionnel'],
      ['FAQ', 'faq.html', 'questions fréquentes aide pochette degré alcool où acheter conservation billets âge'],
    ];
    if (S) S.getAllEvents().forEach(ev => idx.push([ev.name, 'evenement.html?id=' + ev.id, ev.city + ' ' + (S.typeLabel[ev.type] || '') + ' événement soirée']));

    const mega = document.createElement('div');
    mega.className = 'mega'; mega.id = 'megaMenu'; mega.hidden = true;
    mega.setAttribute('role', 'dialog'); mega.setAttribute('aria-modal', 'true'); mega.setAttribute('aria-label', 'Rechercher et naviguer dans SYFIR');
    mega.innerHTML =
      `<div class="mega-top">
        <a class="mega-logo" href="index.html#accueil">SYFIR</a>
        <div class="mega-search">
          <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.6-3.6"/></svg>
          <input type="search" id="megaSearch" placeholder="Chercher une soirée, un artiste, une page…" aria-label="Rechercher dans l'univers SYFIR" autocomplete="off">
        </div>
        <button class="mega-close" id="megaClose" type="button" aria-label="Fermer le menu">✕</button>
      </div>
      <div class="mega-body">
        <div class="mega-side" role="navigation" aria-label="Rubriques">
          <a href="index.html#accueil">Accueil</a>
          <!-- R82.1c : les 6 catégories validées de l'écosystème — ce que
               chaque partenaire APPORTE aux expériences SYFIR. -->
          <div class="mega-side-group">
            <button class="mega-side-head" type="button" aria-expanded="false" aria-controls="grp-eco">
              L'Écosystème<span class="mega-chev" aria-hidden="true"></span>
            </button>
            <div class="mega-side-sub" id="grp-eco" hidden>
              <a href="partenaires.html">Vue d'ensemble</a>
              <a href="partenaires.html#eco-lieux">Lieux</a>
              <a href="partenaires.html#eco-artistes">Artistes et talents</a>
              <a href="partenaires.html#eco-marques">Marques partenaires</a>
              <a href="partenaires.html#eco-organisateurs">Organisateurs</a>
              <a href="partenaires.html#eco-prestataires">Prestataires</a>
              <a href="partenaires.html#eco-medias">Médias et communautés</a>
            </div>
          </div>
          <a href="evenements.html">Événements</a>
          <a href="index.html#artistes">Artistes</a>
          <a href="syf-tv.html">SYFIR TV</a>
          <a href="partenaires.html">Devenir partenaire</a>
          <a href="espace-pro.html">Espace pro</a>
          <div class="mega-side-group">
            <button class="mega-side-head" type="button" aria-expanded="false" aria-controls="grp-maison">
              La Maison<span class="mega-chev" aria-hidden="true"></span>
            </button>
            <div class="mega-side-sub" id="grp-maison" hidden>
              <a href="partenaires.html#investisseurs">Investisseurs</a>
              <a href="partenaires.html#partnerForm">Nous rejoindre</a>
              <a href="partenaires.html#partnerForm">Contact</a>
            </div>
          </div>
        </div>
        <div class="mega-content">
          <div class="mega-results" id="megaResults" hidden></div>
          <div class="mega-panels" id="megaPanels">
            <section class="mega-row">
              <div class="mega-row-head"><h3>Parcourir par envies</h3><a href="evenements.html">Afficher tout →</a></div>
              <div class="mega-envies">
                ${envies.map(([u, n, img]) => `<a class="mega-envie" href="${u}"><img src="${img}" loading="lazy" decoding="async" alt=""><span>${esc(n)}</span></a>`).join('')}
              </div>
            </section>
          </div>
        </div>
      </div>`;
    document.body.appendChild(mega);

    /* Les sous-rubriques sont REPLIÉES au départ.
       Avant, les six catégories de l'écosystème et les trois de La Maison
       étaient étalées en permanence : neuf lignes de plus, sur deux
       niveaux de hiérarchie, avant même d'avoir cherché quoi que ce soit.
       On voit maintenant huit rubriques nettes ; on ouvre celle qu'on
       veut. Un seul groupe ouvert à la fois — deux panneaux dépliés en
       même temps, c'est de nouveau une liste. */
    $$('.mega-side-head[aria-controls]', mega).forEach(tete => {
      tete.addEventListener('click', () => {
        const sous = mega.querySelector('#' + tete.getAttribute('aria-controls'));
        const ouvert = tete.getAttribute('aria-expanded') === 'true';
        $$('.mega-side-head[aria-controls]', mega).forEach(autre => {
          autre.setAttribute('aria-expanded', 'false');
          const s2 = mega.querySelector('#' + autre.getAttribute('aria-controls'));
          if (s2) s2.hidden = true;
        });
        if (!ouvert) { tete.setAttribute('aria-expanded', 'true'); sous.hidden = false; }
      });
    });

    // R11 : le menu est display:none au chargement, donc ses images lazy ne
    // partent qu'à l'ouverture → cartes vides ~1 s. À l'« idle » (LCP passé),
    // on bascule en eager : le fetch part menu fermé, tout est décodé avant
    // la première ouverture. Micro-fade si l'utilisateur ouvre plus vite.
    const megaImgs = [...$$('.mega-envie img', mega)];
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
        ? hits.map(([t, u, k]) => {
            // Un résultat qui ne dit que son titre oblige à cliquer pour savoir
            // où il mène. On affiche la destination en clair.
            const ou = u.startsWith('evenement.html') ? 'Événement'
                     : u.startsWith('evenements')     ? 'Billetterie'
                     : u.startsWith('artiste')        ? 'Artistes'
                     : u.startsWith('syf-tv')         ? 'SYFIR TV'
                     : u.startsWith('espace-pro')     ? 'Espace pro'
                     : u.startsWith('faq')            ? 'Aide'
                     : u.startsWith('partenaire')     ? 'Écosystème'
                     : 'Le site';
            return `<a class="mega-result" href="${u}"><strong>${esc(t)}</strong><small>${ou}</small></a>`;
          }).join('')
        : `<p class="mega-result-empty">Rien pour « ${esc(search.value.trim())} ».<br>Essaie « rooftop », « carnaval », « partenaire » ou « billets ».</p>`;
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
    // La loupe est la porte UNIQUE : recherche et navigation au même endroit.
    $('#searchBtn')?.addEventListener('click', () => open(true));
    $('#megaClose', mega).addEventListener('click', close);
    $$('a', mega).forEach(a => a.addEventListener('click', close));
    // R39-B : lien profond de recherche (?q=) — rend le SearchAction du JSON-LD
    // WebSite honnête (la recherche existe et est adressable par URL).
    const qDeep = new URLSearchParams(location.search).get('q');
    if (qDeep) { open(true); search.value = qDeep; doSearch(); }
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

  /* LE MENU MOBILE A ÉTÉ RETIRÉ — décision de Kily.
     Le burger ouvrait un second menu, plus pauvre que le panneau de
     recherche qui contient déjà toute la navigation (les six rubriques
     de l'écosystème, La Maison, l'espace pro). Deux menus pour un
     site, c'est un menu de trop : on gardait celui qui sait tout faire.
     Le code de `initMobileNav` est supprimé, pas neutralisé : un bloc
     qui s'auto-désactive derrière un `if (!menu) return` finit toujours
     par faire croire qu'une fonction existe encore. */

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

  // Skip-link « Aller au contenu » : déplace aussi le FOCUS vers le contenu
  // principal (le smooth-scroll ci-dessus ne fait que défiler). (R24-3)
  $$('.skip-link').forEach(a => {
    a.addEventListener('click', () => {
      const t = document.getElementById(a.getAttribute('href').slice(1));
      if (t) { t.setAttribute('tabindex', '-1'); t.focus(); }
    });
  });

  /* ===== 03. REVEAL ON SCROLL ===== */
  const reveals = $$('.reveal');
  /* ⚠ ON N'ARME RIEN QUAND IL N'Y A RIEN À OBSERVER — R106, décision de
     Kily : « du code qui observe le vide n'est pas neutre, il est trompeur
     pour la prochaine session — elle croira que les apparitions existent ».

     L'accueil n'a plus aucun `.reveal` depuis la transplantation R100, et
     pourtant l'inventaire R105 y trouvait un IntersectionObserver, une
     minuterie de 1600 ms et quatre écouteurs armés pour eux. Ils
     observaient le vide.

     LE GARDE EST GÉNÉRAL, PAS UNE EXCEPTION POUR L'ACCUEIL : ce fichier
     est partagé par les 14 pages, et « zéro élément à révéler » est la
     seule condition qui compte. Sur les 13 autres pages, qui en ont, rien
     ne change — vérifié page par page, chiffres au journal. La machinerie
     entière reste en place pour elles ET pour le jour où l'accueil
     retrouvera ses apparitions (la maquette en a 22, c'est un manque
     ouvert depuis R103) : rien n'est supprimé, on ne démarre simplement
     pas un moteur qui n'a rien à entraîner. */
  const inViewport = el => {
    const r = el.getBoundingClientRect();
    return r.top < window.innerHeight * 0.95 && r.bottom > 0;
  };
  if (reveals.length) {
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
  }

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

  /* aria-current sur la nav de la page active (a11y, R24-3). L'état visuel
     du pill vient déjà de .active ; ici on ajoute la sémantique. */
  document.querySelector('.nav-link.active')?.setAttribute('aria-current', 'page');
  (() => {
    const path = location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.mobile-nav a[href]').forEach(a => {
      const href = a.getAttribute('href').split('#')[0].split('/').pop();
      if (href === path) a.setAttribute('aria-current', 'page');
    });
  })();

  /* Partage natif (WhatsApp/SMS… en mobile) avec repli copie du lien + toast.
     Essentiel en Guadeloupe où tout passe par WhatsApp. */
  const shareLink = async ({ title, text, url }) => {
    if (navigator.share) {
      try { await navigator.share({ title, text, url }); } catch (e) { /* partage annulé */ }
    } else if (navigator.clipboard) {
      try { await navigator.clipboard.writeText(url); showToast('Lien copié'); }
      catch (e) { showToast('Copie le lien depuis la barre d\'adresse.'); }
    } else {
      showToast('Copie le lien depuis la barre d\'adresse.');
    }
  };

  /* ===== 06. (retiré, R98/1-3) — LE MENU DE THÈME =====
     Le site avait deux thèmes (clair « été doré », sombre « nuit
     festive ») et un mode automatique qui suivait l'heure. Kily a tranché
     après avoir ouvert le site dans son propre navigateur : « le thème,
     c'est le monde de la nuit ». Il n'y a plus de choix à offrir, donc
     plus de menu, plus de préférence en localStorage, plus de résolution
     avant le premier pixel.

     Ce que ce retrait emporte avec lui, et qui occupait deux lots entiers :
     la JOINTURE DES DEUX HORLOGES (R96/R97). Il n'y a plus de bascule
     d'encre, donc plus de zone où l'encre a basculé avant le ciel — et la
     bande morte L ∈ [0,168 ; 0,243], où aucune encre de la charte ne
     tenait 4,5:1, n'est plus jamais traversée. Le problème n'a pas été
     résolu : il n'a plus d'objet.

     La clé localStorage `syfir-theme` n'est plus ni lue ni écrite. On ne
     la purge pas : elle est inerte, et la purger coûterait un accès
     disque à chaque visite pour rien. */

  /* ===== 07. (retiré, R82.1.1) =====
     L'ancienne modale 18+ globale bloquait TOUTES les pages SYFIR, y
     compris les pages purement événementielles sans alcool — ce n'est
     plus le cas : SYFIR n'est pas un site consacré à l'alcool, c'est une
     marque événementielle dont certains événements peuvent être 18+.
     La condition d'âge vit désormais par ÉVÉNEMENT (voir ageLabel dans
     events-data.js), affichée sur sa carte et sa fiche, rappelée au
     moment de la réservation pour les événements 18+. Rien ne prétend
     vérifier juridiquement l'âge de la personne. */

  /* ===== 07b-0. R93 — L'AMBIANCE (Web Audio, générée, zéro fichier) =====
     Une percussion douce type ka à 116 BPM et une houle d'océan, produites
     à la volée. Aucun asset : zéro question de droits, zéro poids réseau,
     et rien à charger avant de pouvoir jouer.

     JAMAIS D'AUTOPLAY. Le contexte audio n'est même pas construit tant
     qu'un geste explicite ne l'a pas demandé — les navigateurs bloquent le
     son automatique, et c'est très bien ainsi : le geste d'entrer EST
     l'immersion. On ne cherche jamais à contourner cette politique.

     POINT D'INSERTION D'UN VRAI FICHIER : quand une ambiance enregistrée
     sera validée, il suffit de donner une URL à AMBIENCE_FILE ci-dessous.
     Le fichier remplace alors les deux générateurs et passe par le MÊME
     nœud de gain maître : les fondus, le toggle et les garde-fous
     continuent de fonctionner sans être touchés. */
  const AMBIENCE_FILE = null;   // ex. 'audio/ambiance-syfir.mp3'
  const AMBIENCE_BPM = 116;
  const AMBIENCE_VOL = 0.16;    // volume maître modéré, jamais brutal
  const AMBIENCE_FADE = 2.5;    // montée en fondu, en secondes

  const createAmbience = () => {
    const AC = window.AudioContext || window.webkitAudioContext;
    let ctx = null, master = null, timer = null, nodes = [];
    let playing = false;
    const beat = 60 / AMBIENCE_BPM;

    /* Bruit blanc en mémoire : la matière première de la houle et de la
       frappe claire. Deux secondes bouclées suffisent, l'oreille ne
       reconnaît pas la boucle sous un filtre passe-bas. */
    const noiseBuffer = () => {
      const len = ctx.sampleRate * 2;
      const buf = ctx.createBuffer(1, len, ctx.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
      return buf;
    };

    const buildSwell = () => {
      const src = ctx.createBufferSource();
      src.buffer = noiseBuffer();
      src.loop = true;
      const lp = ctx.createBiquadFilter();
      lp.type = 'lowpass'; lp.frequency.value = 380; lp.Q.value = 0.7;
      const g = ctx.createGain(); g.gain.value = 0.5;
      // LFO très lent : le va-et-vient de la houle, ~14 s par respiration
      const lfo = ctx.createOscillator(); lfo.frequency.value = 0.07;
      const lfoGain = ctx.createGain(); lfoGain.gain.value = 0.32;
      lfo.connect(lfoGain).connect(g.gain);
      src.connect(lp).connect(g).connect(master);
      src.start(); lfo.start();
      nodes.push(src, lfo);
    };

    // Frappe grave du ka : une descente rapide, pas un « bip »
    const kaLow = at => {
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.type = 'sine';
      o.frequency.setValueAtTime(165, at);
      o.frequency.exponentialRampToValueAtTime(52, at + 0.17);
      g.gain.setValueAtTime(0.0001, at);
      g.gain.exponentialRampToValueAtTime(0.9, at + 0.008);
      g.gain.exponentialRampToValueAtTime(0.0001, at + 0.28);
      o.connect(g).connect(master);
      o.start(at); o.stop(at + 0.32);
    };

    // Frappe claire, en contretemps : bruit filtré, très court
    const kaHigh = at => {
      const src = ctx.createBufferSource(); src.buffer = noiseBuffer();
      const bp = ctx.createBiquadFilter();
      bp.type = 'bandpass'; bp.frequency.value = 1750; bp.Q.value = 1.4;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, at);
      g.gain.exponentialRampToValueAtTime(0.16, at + 0.004);
      g.gain.exponentialRampToValueAtTime(0.0001, at + 0.09);
      src.connect(bp).connect(g).connect(master);
      src.start(at); src.stop(at + 0.12);
    };

    /* Ordonnanceur à anticipation : on programme un peu à l'avance sur
       l'horloge audio, seule assez stable pour un tempo. Un setInterval
       qui déclencherait les sons lui-même dériverait audiblement. */
    let nextBeat = 0, beatIndex = 0;
    const schedule = () => {
      while (nextBeat < ctx.currentTime + 0.25) {
        const pos = beatIndex % 4;
        if (pos === 0 || pos === 2) kaLow(nextBeat);
        if (pos === 1 || pos === 3) kaHigh(nextBeat + beat * 0.5);
        nextBeat += beat; beatIndex++;
      }
    };

    const start = () => {
      if (playing) return;
      if (!AC) return;                 // navigateur sans Web Audio : silence
      playing = true;
      if (!ctx) {
        ctx = new AC();
        master = ctx.createGain();
        master.gain.value = 0.0001;
        master.connect(ctx.destination);
        buildSwell();
        nextBeat = ctx.currentTime + 0.1; beatIndex = 0;
      }
      ctx.resume?.();
      // Montée en fondu : jamais un démarrage brutal
      master.gain.cancelScheduledValues(ctx.currentTime);
      master.gain.setValueAtTime(Math.max(master.gain.value, 0.0001), ctx.currentTime);
      master.gain.exponentialRampToValueAtTime(AMBIENCE_VOL, ctx.currentTime + AMBIENCE_FADE);
      schedule();
      timer = setInterval(schedule, 60);
    };

    const stop = () => {
      if (!playing || !ctx) return;
      playing = false;
      clearInterval(timer); timer = null;
      // Descente en fondu : jamais un arrêt sec
      master.gain.cancelScheduledValues(ctx.currentTime);
      master.gain.setValueAtTime(master.gain.value, ctx.currentTime);
      master.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.2);
      setTimeout(() => { if (!playing) ctx?.suspend?.(); }, 1400);
    };

    return { start, stop, isPlaying: () => playing, available: () => !!AC };
  };

  /* Les trois portes de sortie du son : les mêmes que celles du mouvement.
     Un visiteur en économie de données ou en mouvement réduit n'a rien
     demandé de sonore non plus. */
  const conn0 = navigator.connection;
  /* matchMedia relu ici plutôt que la constante `reducedMotion` de §08a :
     ce bloc s'évalue AVANT elle, et y toucher lèverait une erreur de zone
     morte temporelle (constaté à la mesure). */
  const ambienceAllowed = !matchMedia('(prefers-reduced-motion: reduce)').matches &&
    !conn0?.saveData && !/(^|-)[23]g$/.test(conn0?.effectiveType || '');
  const ambience = createAmbience();

  /* ===== 07b-bis. R93 — LE PORTAIL (accueil, première visite) =====
     Le voile est déjà peint par le HTML quand on arrive ici ; ce bloc lui
     donne sa sortie. R93/2 pose la sortie BRUTE — on entre, on mémorise,
     le voile disparaît. Ce qui vient ensuite est traité à son point :
     le clavier et le piège de focus en R93/3, le fondu croisé vers le
     ciel et le démarrage du film en R93/4, le son en R93/6.
     Un voile sans sortie ne serait pas une structure, ce serait un piège. */
  const portal = $('#portal');
  const portalActive = portal && document.documentElement.getAttribute('data-portal') !== 'done';
  /* Le film de marque attend derrière le voile : « Entrer » doit le
     DÉCLENCHER, pas le découvrir déjà commencé. Aux visites mémorisées,
     la porte est déjà ouverte — la promesse est résolue d'emblée. */
  let openPortalGate = () => {};
  const portalGate = portalActive
    ? new Promise(res => { openPortalGate = res; })
    : Promise.resolve();
  if (portalActive) {
    const enterBtn = $('#portalEnter'), quietBtn = $('#portalQuiet');

    /* Le reste de la page est mis hors d'atteinte pendant que le voile est
       là : `inert` retire d'un coup le focus clavier ET l'arbre
       d'accessibilité, ce qu'aria-hidden seul ne fait pas. On le pose sur
       les frères du voile, jamais sur un ancêtre commun — sinon le voile
       s'inerterait lui-même. */
    const siblings = [...document.body.children].filter(el => el !== portal && el.tagName !== 'NOSCRIPT');
    siblings.forEach(el => el.setAttribute('inert', ''));

    let leaving = false;
    const leavePortal = withSound => {
      if (leaving) return;
      leaving = true;
      try { localStorage.setItem('syfir-portal', withSound ? 'son' : 'muet'); } catch (e) {}
      siblings.forEach(el => el.removeAttribute('inert'));
      document.removeEventListener('keydown', onPortalKey);
      // Le focus ne doit pas retomber dans le vide : on le rend au début
      // du document, là où le visiteur vient d'arriver.
      const first = document.querySelector('.skip-link') || document.body;
      if (first.focus) { first.setAttribute('tabindex', '-1'); first.focus({ preventScroll: true }); }

      /* CONTINUITÉ (point d'architecture 3 de la passation) : le ciel
         d'arrivée est DÉJÀ peint derrière le voile — La Traversée a posé
         son palier avant tout scroll. On ne force donc aucun palier : on
         baisse simplement l'opacité du voile, et le fondu croisé se fait
         tout seul entre la nuit de la porte et le ciel du site. Aucun saut
         possible, quel que soit le palier d'arrivée (day, dusk ou night
         selon le thème). */
      openPortalGate();
      // Le son ne démarre QUE là : sur le geste explicite, jamais avant.
      if (withSound && ambienceAllowed) ambience.start();
      if (reducedMotion) { document.documentElement.setAttribute('data-portal', 'done'); return; }
      portal.classList.add('is-leaving');
      let closed = false;
      const finish = () => {
        if (closed) return;
        closed = true;
        document.documentElement.setAttribute('data-portal', 'done');
      };
      /* transitionend REMONTE depuis les enfants : sans ce filtre, la
         transition du bouton qui perd le survol au moment du clic terminait
         la levée dans la même frame — le fondu ne se voyait jamais.
         Constaté à la mesure (opacité échantillonnée à 0 d'emblée). */
      portal.addEventListener('transitionend', e => {
        if (e.target === portal && e.propertyName === 'opacity') finish();
      });
      setTimeout(finish, 1200);   // filet : une transition peut ne jamais finir
    };

    /* Piège de focus : Tab et Shift+Tab tournent entre les deux commandes.
       Échap = entrer sans le son — une porte doit rester franchissable au
       clavier, jamais une impasse pour un lecteur d'écran. */
    function onPortalKey(e) {
      if (e.key === 'Escape') { e.preventDefault(); leavePortal(false); return; }
      if (e.key !== 'Tab') return;
      const f = [enterBtn, quietBtn].filter(Boolean);
      if (!f.length) return;
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
    document.addEventListener('keydown', onPortalKey);

    enterBtn?.addEventListener('click', () => leavePortal(true));
    quietBtn?.addEventListener('click', () => leavePortal(false));
    requestAnimationFrame(() => enterBtn?.focus());
  }

  /* ===== 07b-ter. R93 — LE RÉGLAGE DU SON (nav de l'accueil) =====
     Visible et persistant, état mémorisé. Trois états, parce que deux
     mentiraient : le navigateur EXIGE un geste avant de produire du son,
     donc une préférence « son » au rechargement n'est pas « coupé » — elle
     est EN ATTENTE. Le bouton le montre (état « prêt », point doré qui
     respire) plutôt que d'afficher un haut-parleur barré trompeur, et
     n'importe quel geste sur la page suffit à la réveiller : c'est un
     geste valide au sens des navigateurs. */
  const soundBtn = $('#soundBtn');
  if (soundBtn && ambienceAllowed && ambience.available()) {
    soundBtn.hidden = false;
    const setSoundState = state => {
      soundBtn.dataset.sound = state;
      soundBtn.setAttribute('aria-pressed', String(state === 'on'));
      soundBtn.setAttribute('aria-label',
        state === 'on' ? 'Couper l\'ambiance sonore'
        : state === 'ready' ? 'Ambiance sonore prête — touchez pour la lancer'
        : 'Activer l\'ambiance sonore');
      soundBtn.title = soundBtn.getAttribute('aria-label');
    };
    const wantsSound = () => {
      try { return localStorage.getItem('syfir-sound') === 'on'; } catch (e) { return false; }
    };
    const rememberSound = on => {
      try { localStorage.setItem('syfir-sound', on ? 'on' : 'off'); } catch (e) {}
    };

    // Réveil au premier geste, si et seulement si la préférence le demande.
    let wakeArmed = false;
    const wake = () => {
      if (!wakeArmed) return;
      disarmWake();
      ambience.start();
      setSoundState('on');
    };
    const wakeEvents = ['pointerdown', 'keydown', 'touchstart'];
    function disarmWake() {
      wakeArmed = false;
      wakeEvents.forEach(e => removeEventListener(e, wake));
    }
    const armWake = () => {
      if (wakeArmed) return;
      wakeArmed = true;
      wakeEvents.forEach(e => addEventListener(e, wake, { passive: true }));
    };

    soundBtn.addEventListener('click', e => {
      e.stopPropagation();          // le clic ne doit pas déclencher aussi le réveil
      disarmWake();
      if (ambience.isPlaying()) { ambience.stop(); rememberSound(false); setSoundState('off'); }
      else { ambience.start(); rememberSound(true); setSoundState('on'); }
    });

    // État initial. Le Portail décide pour la première visite ; ensuite
    // c'est la préférence mémorisée qui parle.
    if (portalActive) {
      setSoundState('off');
    } else if (wantsSound()) {
      setSoundState('ready');
      armWake();
    } else {
      setSoundState('off');
    }
    // Le Portail vient de démarrer le son : le bouton doit le refléter.
    portalGate.then(() => {
      if (ambience.isPlaying()) { rememberSound(true); setSoundState('on'); }
      else if (!portalActive) { /* rien : l'état mémorisé fait déjà foi */ }
      else { rememberSound(false); setSoundState('off'); }
    });
  }

  /* ===== 08. OÙ NOUS TROUVER : FILTRE DES PARTENAIRES ===== */
  const placeChips = $('#placeChips');
  const mapPins = $$('.map-pin');
  const syncPins = type => {
    mapPins.forEach(pin => {
      const match = type === 'tous' || pin.dataset.type === type;
      pin.classList.toggle('pin-off', !match);
      pin.setAttribute('tabindex', match ? '0' : '-1');
    });
  };
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
      syncPins(type);
    });
  }

  /* Store locator : clic/clavier sur un pin -> surligne + scrolle la carte partenaire */
  const locatorMap = $('#locatorMap');
  if (locatorMap && mapPins.length) {
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const activatePin = pin => {
      const card = document.getElementById(pin.dataset.target);
      if (!card) return;
      if (card.hidden) placeChips?.querySelector('[data-place="tous"]')?.click();
      $$('.place-card').forEach(c => c.classList.remove('place-card--pinned'));
      mapPins.forEach(p => p.classList.remove('pin-selected'));
      pin.classList.add('pin-selected');
      card.classList.add('place-card--pinned');
      card.setAttribute('tabindex', '-1');
      card.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' });
      card.focus({ preventScroll: true });
      setTimeout(() => card.classList.remove('place-card--pinned'), 2600);
    };
    locatorMap.addEventListener('click', e => {
      const pin = e.target.closest('.map-pin');
      if (pin && !pin.classList.contains('pin-off')) activatePin(pin);
    });
    locatorMap.addEventListener('keydown', e => {
      const pin = e.target.closest('.map-pin');
      if (pin && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); activatePin(pin); }
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
    // (miniature LOCALE images/ext/yt-<id>.jpg + bouton play ; l'iframe ne
    //  charge qu'au clic — zéro requête externe tant qu'on ne lit pas)
    const titles = videoTitles.split('|').map(s => s.trim());
    const ytSlides = urls => urls.map((u, i) => {
      const id = (u.match(/embed\/([\w-]+)/) || [])[1] || '';
      const title = esc(titles[i] || `Vidéo de ${name}`);
      return `<div class="car-slide car-slide-video car-video-yt" role="group" aria-roledescription="diapositive">
          <img src="images/ext/yt-${id}.jpg" onerror="this.onerror=null;this.src='images/artiste-unity.jpg'" alt="" loading="lazy" decoding="async">
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
               <button class="car-sound" type="button" aria-label="Activer le son" aria-pressed="false"></button>
             </div>`
          : `<div class="car-slide car-slide-video" role="group" aria-roledescription="diapositive">
               <video controls preload="none" aria-label="Vidéo de ${esc(name)}">${videoSources}</video>
             </div>`))
      : `<div class="car-slide car-slide-video car-video-soon" role="group" aria-roledescription="diapositive">
           <span class="car-soon-ic" aria-hidden="true"></span>
           <p>Vidéo bientôt disponible</p>
         </div>`;

    box.classList.add('media-car');
    box.setAttribute('role', 'group');
    box.setAttribute('aria-roledescription', 'carrousel');
    box.setAttribute('aria-label', `Galerie de ${name}`);
    box.tabIndex = 0;
    const photoSlides = list.map((src, i) => `
        <div class="car-slide" role="group" aria-roledescription="diapositive">
          ${picHTML(src, `alt="${esc(name)} — photo ${i + 1}" loading="${i === 0 && !videoInline ? 'eager' : 'lazy'}" decoding="async"`)}
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
      soundBtn.textContent = v.muted ? '' : '';
      soundBtn.setAttribute('aria-label', v.muted ? 'Activer le son' : 'Couper le son');
      soundBtn.setAttribute('aria-pressed', String(!v.muted));
      if (v.paused) v.play().catch(() => {});   // certains environnements n'ont pas le codec
    });

    refresh();
  };
  // Exposé pour la page produit dédiée (produit.js) — même galerie que la
  // fiche modale, sans dupliquer la logique (R28).
  window.SYFIR.buildMediaCarousel = buildMediaCarousel;
  window.SYFIR.picHTML = picHTML;

  /* ===== 11. FICHE ARTISTE — la carte mène à sa page dédiée (R35) =====
     Les modales artistes sont remplacées par de vraies pages partageables /
     indexables (artiste.html?id=X). Le clic (et le bouton ▶) redirige. */
  const goArtist = card => {
    const slug = (card.id || '').replace(/^artiste-/, '');
    if (!slug) return;
    const media = card.querySelector('.artist-photo picture, .artist-photo img');
    if (media && !reducedMotion) media.style.viewTransitionName = 'artist-hero';
    location.href = 'artiste.html?id=' + encodeURIComponent(slug);
  };
  $$('.artist-card').forEach(card => {
    card.style.cursor = 'pointer';
    if (!card.getAttribute('role')) card.setAttribute('role', 'link');
    if (!card.hasAttribute('tabindex')) card.setAttribute('tabindex', '0');
    card.setAttribute('aria-label', 'Voir la fiche de ' + (card.dataset.name || "l'artiste"));
    card.addEventListener('click', () => goArtist(card));
    card.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); goArtist(card); } });
    const play = card.querySelector('.artist-play');
    if (play) {
      play.setAttribute('aria-label', 'Voir la fiche de ' + (card.dataset.name || "l'artiste"));
      play.addEventListener('click', e => { e.stopPropagation(); goArtist(card); });
    }
  });
  // Deep-link : #artiste-<slug> (anciens liens / line-up) -> page artiste dédiée
  const artistFromHash = () => {
    const m = location.hash.match(/^#artiste-([\w-]+)$/);
    if (m) location.replace('artiste.html?id=' + encodeURIComponent(m[1]));
  };
  artistFromHash();
  addEventListener('hashchange', artistFromHash);

  /* ===== 12. FOND VIDÉO DU HERO (accueil) =====
     Vidéo injectée APRÈS l'événement load : le LCP reste l'image de fond CSS
     (poster, préchargée en fetchpriority=high). N'apparaît qu'une fois la
     lecture réellement lancée ; si aucune source ne décode (ex. environnement
     sans codec H.264), l'image reste.
     Trois portes de sortie -> pas de vidéo du tout, le poster reste :
       - prefers-reduced-motion ;
       - Save-Data (« économiseur de données » activé) ;
       - connexion lente (effectiveType 2g/3g) — R91 : le film pèse ~9,5 Mo,
         et autoplay le fait streamer en entier malgré preload=metadata. Le
         télécharger sur un forfait mobile lent serait un coût imposé sans
         contrepartie, le poster raconte déjà la même chose. */
  const injectHeroVideo = (host, sources, poster) => {
    const conn = navigator.connection;
    const slowNet = /(^|-)[23]g$/.test(conn?.effectiveType || '');
    if (!host || reducedMotion || conn?.saveData || slowNet) return;
    /* R93/4 : le film attend que la porte soit franchie. Sur une visite
       mémorisée, portalGate est déjà résolue et le comportement est
       exactement celui d'avant. */
    const afterLoad = cb => {
      if (document.readyState === 'complete') cb();
      else addEventListener('load', cb, { once: true });
    };
    afterLoad(() => portalGate.then(() => {
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
    }));
  };

  // R88 point (b) puis R89 point 3 : l'injection de videos/syfir-pub-video.mp4
  // a été retirée du hero d'accueil ET de .tickets-hero (billetterie). Le
  // fichier est nommé « pub » (publicité), au moins un de ses posters était
  // un visuel produit confirmé, et le commentaire d'origine le décrivait comme
  // « la vidéo publicitaire officielle SYFIR » — un faisceau d'indices
  // suffisant pour ne pas la laisser sur des pages SYFIR sans l'avoir
  // visionnée (aucun outil d'extraction vidéo dans ce bac à sable). Fichier
  // conservé dans le dépôt, disponible pour avyr-site/.
  //
  // R90/R91 : premier film de marque conforme du projet (45 s, muet, fondus
  // d'entrée et de sortie pour boucler), contenu vérifié image par image par
  // le fondateur — aucun produit, aucune boisson, aucun logo tiers, aucun
  // texte incrusté. Câblé uniquement sur le hero d'accueil — pas sur
  // .tickets-hero, qui reste sur son image statique en attendant un jugement
  // séparé. Ce n'est PAS un aftermovie (aucun événement n'a eu lieu) : ne
  // jamais employer ce mot ici.
  /* ⚠ R105 — PLUS DE FILM DANS LE HERO DE L'ACCUEIL.
     « Il doit pas avoir la vidéo, ça doit être comme la maquette. » (Kily)
     `maquettes/3-LUMIERE-DE-SCENE.html` n'a AUCUNE vidéo : son hero est une
     photo fixe à opacité .5 avec un zoom lent, rien d'autre. L'appel
     ci-dessous injectait le film par-dessus cette photo — un survivant que
     ni la liste de R103 ni les 102 couches de `maquette.mjs` ne pouvaient
     voir, parce qu'il n'est déclaré NULLE PART en CSS : il naît à
     l'exécution.

     LE FILM N'EST PAS SUPPRIMÉ. `videos/syfir-film-canva-web.mp4` et son
     poster restent dans le dépôt — c'est un vrai travail du fondateur,
     vérifié image par image, et il aura sa place ailleurs (`syf-tv.html`
     est le candidat naturel). `injectHeroVideo` est donc CONSERVÉE telle
     quelle, prête pour son futur hôte : on retire l'appel, pas l'outil.

     Ce que ça change, mesuré : ici le <video> n'apparaissait déjà pas dans
     le DOM (son gestionnaire d'erreur le retirait, faute de codec H.264
     dans le conteneur) — mais les DEUX fichiers étaient tout de même
     téléchargés, mp4 de ~9,5 Mo compris. Sur une machine avec les codecs,
     le film s'injectait et se peignait. */

  /* ===== 13. FICHE PRODUIT — la carte cocktail mène à sa page dédiée (R28) =====
     Les modales de fiche produit sont remplacées par de vraies pages
     partageables/indexables (produit.html?id=X). Le clic redirige. */
  $$('.cocktail-card').forEach(card => {
    const goToProduct = () => {
      if (!card.id) return;
      // View Transition : nomme le visuel source -> morph vers le hero produit
      const media = card.querySelector('.cocktail-media picture, .cocktail-media img');
      if (media && !reducedMotion) media.style.viewTransitionName = 'product-hero';
      location.href = 'produit.html?id=' + encodeURIComponent(card.id);
    };
    // A11y (R39) : le titre est le vrai lien focusable (clavier) ; le clic sur
    // la carte reste une commodité SOURIS et laisse les liens agir nativement.
    card.addEventListener('click', e => {
      if (e.target.closest('a')) return;   // lien titre / « Où le trouver » : navigation native
      goToProduct();
    });
  });

  /* ===== 13b. R94 — LE POULS : plus rien à synchroniser ici =====
     Une première version mettait en phase, en JS, une animation posée sur
     CHAQUE élément d'appel. Deux mesures ont montré que poser une
     animation sur ces éléments écrasait la leur (entrée de reveal, ombre
     propre). Le pouls est donc devenu UNE horloge sur :root et des
     consommateurs qui lisent une variable (style.css §41) : la mise en
     phase n'est plus un problème à résoudre, c'est une conséquence — il
     n'y a qu'une seule horloge. Ce bloc n'existe plus que pour dire
     pourquoi il n'existe plus. */

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
      pmThumbs.innerHTML = photos.map((p, i) => `<button class="pm-thumb${i === 0 ? ' active' : ''}" data-src="${esc(p)}" type="button" aria-label="Photo ${i + 1} sur ${photos.length}">${picHTML(p, 'alt="" loading="lazy" decoding="async"')}</button>`).join('');
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

  /* ===== TRI DES PARTENAIRES OFFICIELS (R89 point 2) =====
     Alphabétique par défaut (ordre déjà vrai des 2 cartes actuelles) ;
     chronologique via data-added (ordre réel de validation, pas une date
     inventée). Fonctionne dès aujourd'hui, prêt pour plus de partenaires. */
  const officialSort = $('#officialSort');
  const officialGrid = $('#officialGrid');
  if (officialSort && officialGrid) {
    officialSort.addEventListener('click', e => {
      const btn = e.target.closest('.chip');
      if (!btn) return;
      $$('.chip', officialSort).forEach(c => c.classList.remove('active'));
      btn.classList.add('active');
      const cards = $$('.official-card', officialGrid);
      const key = btn.dataset.sort === 'alpha'
        ? c => c.dataset.name
        : c => +c.dataset.added;
      cards.sort((a, b) => {
        const ka = key(a), kb = key(b);
        return typeof ka === 'string' ? ka.localeCompare(kb, 'fr') : ka - kb;
      }).forEach(c => officialGrid.appendChild(c));
    });
  }

  const partnerForm = $('#partnerForm');
  if (partnerForm) {
    addDemoNote(partnerForm.querySelector('button[type="submit"]'), 'partenaire');   // (R29-1) — s'efface seul depuis E/2
    // Le champ contextuel s'adapte au type de demande choisi
    const contextConfig = {
      partenaire:   { label: 'Nom de l\'établissement *',      placeholder: 'Le nom de ton lieu' },
      evenement:    { label: 'Type d\'événement *',            placeholder: 'Mariage, soirée privée, festival…' },
      'soiree-particulier': { label: 'Ta soirée *',            placeholder: 'Anniversaire, fête privée… + ce dont tu aurais besoin' },
      artiste:      { label: 'Nom de scène / du groupe *',     placeholder: 'DJ, chanteur, groupe… + style musical' },
      collaborateur:{ label: 'Ton rôle / talent *',          placeholder: 'Photographe, vidéaste, hôte·sse, ambassadeur·rice…' },
      'marque-partenaire': { label: 'Nom de ta marque *',       placeholder: 'Le nom de ta marque ou de ton produit' },
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

    // R85 point 3 : un mineur ne peut pas valablement engager SYFIR sans
    // représentant légal (droit des contrats) — les champs responsable
    // légal n'apparaissent que si « Non » est choisi.
    $('#pfMajeur')?.addEventListener('change', () => {
      const isMinor = $('#pfMajeur').value === 'non';
      $('#guardianFields').hidden = !isMinor;
      if (!isMinor) {
        setFieldState($('#pfGuardianName'), '');
        setFieldState($('#pfGuardianContact'), '');
      }
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
      const isMinor = $('#pfMajeur').value === 'non';
      const ok = [
        ...liveRules.map(([sel, rule]) => check($(sel), rule)),
        check($('#pfMajeur'), validators.required),
        !isMinor || check($('#pfGuardianName'), validators.required),
        !isMinor || check($('#pfGuardianContact'), validators.required),
        setFieldState(consent, consent.checked ? '' : 'Merci de cocher cette case.')
      ].every(Boolean);
      if (!ok) {
        $('.invalid', partnerForm)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
      }
      const success = $('#formSuccess'), errorMsg = $('#formError');
      const submitBtn = partnerForm.querySelector('button[type="submit"]');
      const type = $('input[name="requestType"]:checked', partnerForm)?.value;
      const data = {
        _gotcha: $('input[name="_gotcha"]', partnerForm)?.value || '',
        /* `subject`, `from_name` et `replyto` sont les trois champs que
           Web3Forms sait interpréter pour composer le mail : sans eux
           l'objet est générique et « Répondre » ne renvoie nulle part.
           Formspree lit `_replyto` — les deux coexistent sans conflit,
           chacun ignorant le champ de l'autre. */
        subject: `SYFIR — demande « ${type || 'autre'} » depuis le site`,
        from_name: 'Formulaire du site SYFIR',
        replyto: $('#pfEmail').value.trim(),
        _replyto: $('#pfEmail').value.trim(),
        type,
        name: $('#pfName').value.trim(), email: $('#pfEmail').value.trim(),
        phone: $('#pfPhone').value.trim(), context: $('#pfContext').value.trim(),
        message: $('#pfMessage').value.trim(), source: 'partenaire',
        majeur: $('#pfMajeur').value,
        guardianName: isMinor ? $('#pfGuardianName').value.trim() : '',
        guardianContact: isMinor ? $('#pfGuardianContact').value.trim() : ''
      };
      const label = submitBtn.textContent; submitBtn.disabled = true; submitBtn.textContent = 'Envoi…';
      if (errorMsg) errorMsg.hidden = true;
      const res = await submitForm(data);
      submitBtn.disabled = false; submitBtn.textContent = label;
      if (res.demo) {
        // Transmission désactivée (R80.1 final) : rien n'est stocké ni envoyé —
        // la saisie reste visible dans le formulaire, pas de reset.
        success.textContent = '✦ ' + DEMO_FORM_MSG;
        success.hidden = false;
        success.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else if (res.ok) {
        partnerForm.reset();
        $$('.invalid', partnerForm).forEach(el => el.classList.remove('invalid'));
        /* Ce qui est promis ici est ce qui est vérifiable : le message est
           PARTI et le prestataire l'a accepté. Aucun délai de réponse n'est
           annoncé — « sous 48 h » était un engagement que personne ne tient
           dans le contrat, et rien ne le mesure. */
        success.textContent = '✦ Message envoyé. L\'équipe SYFIR l\'a reçu et te répondra à l\'adresse que tu as indiquée.';
        showToast('✦ Message envoyé à l\'équipe SYFIR !');
        success.hidden = false;
        success.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else if (errorMsg) {
        /* ÉCHEC — et il se dit. Le formulaire n'est PAS réinitialisé : la
           saisie reste à l'écran, sinon « réessaie » demanderait de tout
           retaper. Deux causes distinctes, deux phrases distinctes : un
           visiteur hors ligne n'a pas le même geste à faire qu'un visiteur
           dont l'envoi a été refusé. */
        errorMsg.textContent = res.reseau
          ? 'L\'envoi n\'a pas pu partir — connexion indisponible. Ton message est toujours là : vérifie ta connexion et renvoie-le.'
          : 'L\'envoi a été refusé et ton message n\'est pas parti. Ton texte est toujours là : réessaie dans un instant.';
        errorMsg.hidden = false;
        errorMsg.scrollIntoView({ behavior: 'smooth', block: 'center' });
        /* PAS de toast ici. Vu sur la capture : le toast est ancré en bas
           d'écran et recouvrait la fin de la phrase d'échec — deux messages
           qui se marchent dessus, dont celui qui compte. La bannière porte
           déjà `role="alert"` et vient d'elle-même sous les yeux. */
      }
    });

    // R78 : lien direct partageable depuis une carte de marque partenaire
    // (partenaires.html?type=marque-partenaire#partnerForm) — présélectionne
    // le type sans écraser le choix si l'utilisateur en change ensuite.
    const urlType = new URLSearchParams(location.search).get('type');
    if (urlType) {
      const urlRadio = $(`input[name="requestType"][value="${urlType}"]`);
      if (urlRadio) { urlRadio.checked = true; urlRadio.dispatchEvent(new Event('change')); }
    }

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

  /* ===== 18. FAB BILLETS STICKY (modèle We Love Green) =====
     Pilule flottante discrète : apparaît après 600px de scroll, s'efface
     quand le footer est visible. Clic = scroll doux vers la billetterie
     (evenements.html) ou le panneau billets de la fiche (evenement.html). */
  const ticketsFab = $('#ticketsFab');
  if (ticketsFab) {
    const footEl = document.querySelector('footer');
    let footerVisible = false;
    const syncFab = () => {
      const show = window.scrollY > 600 && !footerVisible;
      ticketsFab.classList.toggle('fab-hidden', !show);
    };
    if (footEl && 'IntersectionObserver' in window) {
      new IntersectionObserver(es => { footerVisible = es.some(e => e.isIntersecting); syncFab(); }, { threshold: 0 }).observe(footEl);
    }
    window.addEventListener('scroll', syncFab, { passive: true });
    syncFab();
    ticketsFab.addEventListener('click', e => {
      const tgt = ticketsFab.dataset.target ? document.querySelector(ticketsFab.dataset.target) : null;
      if (tgt) {
        e.preventDefault();
        tgt.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
      }
    });
  }

  /* ===== 19. VIDÉO D'AMBIANCE — retirée (R89 point 3) =====
     #ambianceBox n'affiche plus qu'un fond statique (.ambiance-box, CSS) ;
     plus de <video> ni de bouton son à initialiser. */

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

  /* ===== 21. LE SERVICE WORKER EST DÉSINSTALLÉ =====
     Il gardait une copie complète du site et la resservait à la place
     des fichiers réels. Trois fois dans la même journée, Kily et moi
     avons regardé une version périmée en croyant voir la dernière —
     une fois vingt minutes durant. En présentation, ce serait montrer
     un site d'il y a deux jours sans le savoir.
     Un cache hors ligne n'apporte rien à un site servi depuis le Mac
     qui fait la présentation. On ne l'enregistre plus, ET on
     désinscrit celui qui traîne déjà dans le navigateur : sans ça, il
     survit indéfiniment à sa propre suppression du code.
     À rétablir le jour d'une vraie mise en ligne, et pas avant. */
  if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
    navigator.serviceWorker.getRegistrations()
      .then(rs => rs.forEach(r => r.unregister()))
      .catch(() => {});
    if (window.caches && caches.keys) {
      caches.keys().then(ks => ks.forEach(k => caches.delete(k))).catch(() => {});
    }
  }

  /* ===== 21b. R38-1 : onde « goutte » au point de clic des CTA principaux =====
     Retour tactile localisé (l'eau qui s'écarte sous le doigt), <300ms, discret.
     Coupé sous prefers-reduced-motion. Activation clavier → onde centrée. */
  if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.addEventListener('click', e => {
      const btn = e.target.closest('.btn-solid, .btn-gradient');
      if (!btn || btn.disabled) return;
      const r = btn.getBoundingClientRect();
      const d = Math.max(r.width, r.height) * 2;
      // clic souris/tactile : point réel ; activation clavier (clientX/Y=0) : centre
      const cx = e.clientX ? e.clientX - r.left : r.width / 2;
      const cy = e.clientY ? e.clientY - r.top : r.height / 2;
      const s = document.createElement('span');
      s.className = 'cta-ripple';
      s.style.cssText = `width:${d}px;height:${d}px;left:${cx}px;top:${cy}px`;
      btn.appendChild(s);
      s.addEventListener('animationend', () => s.remove(), { once: true });
    });
  }

  /* ===== 21c. R38-4 : count-up doux des chiffres (KPI Smartboard, Company Facts) =====
     À l'entrée dans le viewport, le nombre monte de 0 à sa valeur (easeOutCubic,
     ~850ms). N'anime QUE le nœud texte de tête → les enfants (flèches colorées
     .kpi-delta) restent intacts. Ignore le non-numérique et les années seules.
     prefers-reduced-motion : valeur finale directe, aucun mouvement. */
  const countUp = (root) => {
    root = root || document;
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const fmt = (n, d) => (d ? n.toFixed(d).replace('.', ',') : Math.round(n).toString());
    root.querySelectorAll('.kpi-value, .fact-num').forEach(el => {
      if (el.dataset.counted) return;
      const node = el.firstChild;
      if (!node || node.nodeType !== 3) { el.dataset.counted = '1'; return; }  // pas de nœud texte en tête
      const txt = node.nodeValue;
      const m = txt.match(/-?\d(?:[\d\u00a0\u202f]*\d)?(?:[.,]\d+)?/);
      if (!m) { el.dataset.counted = '1'; return; }
      const raw = m[0];
      const target = parseFloat(raw.replace(/[\u00a0\u202f]/g, '').replace(',', '.'));
      if (!isFinite(target)) { el.dataset.counted = '1'; return; }
      const decimals = /[.,]\d/.test(raw) ? raw.replace(/.*[.,]/, '').length : 0;
      const prefix = txt.slice(0, m.index), suffix = txt.slice(m.index + raw.length);
      // année seule (ex. « 2026 ») : pas d'odomètre disgracieux
      if (decimals === 0 && target >= 1900 && target <= 2100 && !prefix.trim() && !suffix.trim()) { el.dataset.counted = '1'; return; }
      el.dataset.counted = '1';
      const set = v => { node.nodeValue = prefix + fmt(v, decimals) + suffix; };
      if (reduce) return;   // la valeur finale est déjà affichée
      const io = new IntersectionObserver((ents, obs) => {
        ents.forEach(e => {
          if (!e.isIntersecting) return;
          obs.disconnect();
          const dur = 850, t0 = performance.now();
          const tick = now => {
            const p = Math.min(1, (now - t0) / dur);
            set(target * (1 - Math.pow(1 - p, 3)));
            if (p < 1) requestAnimationFrame(tick); else set(target);
          };
          requestAnimationFrame(tick);
        });
      }, { threshold: .4 });
      io.observe(el);
    });
  };
  window.SYFIR.countUp = countUp;
  countUp(document);   // Company Facts statiques (partenaires) ; KPIs dynamiques → rappel dans espace-pro.js

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

  /* ===== 22 bis. LA MENTION « DÉMONSTRATION » — LOT E/1 =====
     ------------------------------------------------------------------
     RÈGLE ABSOLUE du lot : le parcours de réservation va jusqu'au bout —
     choix du billet, confirmation, vrai billet avec son QR dans le profil,
     consultable hors ligne — mais AUCUN paiement n'existe. Un billet qui
     ne dit pas ce qu'il est laisserait croire à une entrée achetée.

     TROIS CHOIX QUI RENDENT LA MENTION INDÉLÉBILE, et chacun se justifie :

     1. Elle est INCONDITIONNELLE. Elle ne dépend ni de `ev.demo`, ni d'un
        champ enregistré sur le billet, ni d'un réglage. Le parcours entier
        est une démonstration, pas seulement les dates d'exemple : un
        billet pris sur un événement créé depuis l'espace pro n'encaisse
        pas davantage. Aucune donnée manquante ne peut donc l'effacer.
     2. Elle est POSÉE AU RENDU, pas à l'écriture. Les billets déjà dans
        le localStorage d'un visiteur — pris avant ce lot — la portent
        aussi, dès le prochain affichage. Une mention écrite dans la donnée
        aurait laissé les anciens billets nus.
     3. Elle est DANS LE QR. Le code encode `SYFIR|DEMO|…` : même sorti de
        la page, scanné par un contrôle à l'entrée, le billet se déclare.
        C'est le seul endroit où la mention survit à la capture d'écran.

     Le libellé dit les deux choses qui comptent, et rien de plus :
     aucun paiement n'a eu lieu, et le billet ne donne pas accès. */
  const DEMO_TICKET = window.SYFIR.demoTicketText;
  const demoStamp = () =>
    `<span class="ticket-demo" role="note"><span class="ticket-demo-badge">Démonstration</span><span class="ticket-demo-text">${DEMO_TICKET}</span></span>`;
  // Charge utile du QR : le marqueur DEMO vient en deuxième position, juste
  // après la marque, pour qu'il soit lu même par un scanner qui tronque.
  const qrPayload = (num, event, date) => `SYFIR|DEMO|${num || ''}|${event}|${date}`;
  /* L'encodeur est exposé au même titre que `escapeHtml` ou `downloadICS` :
     c'est un utilitaire du module partagé, pas un crochet de test. Il rend
     le QR AUDITABLE — sans lui, personne ne peut vérifier de l'extérieur
     quelle chaîne un code peint encode réellement, et « le QR dit DEMO »
     resterait une affirmation invérifiable. */
  window.SYFIR.makeQR = makeQR;

  // Pic émotionnel (R3) — la confirmation d'achat devient LE moment signature :
  // onde or/sunset, le billet QR comme objet précieux, la signature « À très
  // vite. — SYFIR ». Partagé par la billetterie et la fiche événement.
  const ticketPeakHTML = ({ num, event, date }) => {
    const qr = makeQR(qrPayload(num, event, date));
    return `
      <div class="ticket-peak" role="group" aria-label="Billet de démonstration confirmé">
        <span class="ticket-peak-splash" aria-hidden="true"></span>
        <div class="ticket-peak-card">
          <span class="ticket-demo-badge ticket-demo-badge-peak">Démonstration</span>
          ${qr ? `<span class="qr-code" role="img" aria-label="QR code du billet de démonstration ${esc(num || '')}">${qr}</span>` : ''}
          <p class="ticket-peak-num">N° ${esc(num || '')}</p>
        </div>
        <p class="ticket-peak-demo">${DEMO_TICKET}</p>
        <p class="ticket-peak-sign">À très vite.<span>— SYFIR</span></p>
      </div>`;
  };
  window.SYFIR.ticketPeakHTML = ticketPeakHTML;

  /* ===== 23. NEWSLETTER (footer + inline, toutes pages) ===== */
  $$('.footer-news').forEach(form => {
    addDemoNote(form.querySelector('button[type="submit"]'), 'newsletter');   // reste affiché : la newsletter ne transmet pas (E/2)
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
      if (res.demo) {
        // Transmission désactivée (R80.1 final) : rien n'est stocké ni envoyé —
        // l'email reste visible dans le champ, pas de reset.
        msg.textContent = '✦ ' + DEMO_FORM_MSG;
      } else if (res.ok) {
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
      /* R99 — L'ÉTAT VIDE ASSUMÉ, ET IL REMPLACE UN TROU.
         Cette branche faisait `section.hidden = true` : quand aucune date
         réelle n'est publiée, le bloc « Prochaines dates » DISPARAISSAIT.
         C'est précisément la section que Kily pointait dans la maquette.
         On n'invente aucun événement ; on assume le vide et on le
         travaille — une seule carte, pleine largeur, même traitement. */
      nextBox.classList.add('vide');
      nextBox.innerHTML = `
        <a class="date" href="partenaires.html?type=soiree-particulier#partnerForm">
          <img src="images/ext/unsplash-photo-1533174072545-7a4b6ad7a6c3.jpg" loading="lazy" decoding="async" width="1600" height="1068" alt="">
          <span class="puce">Bient&ocirc;t</span>
          <div class="quand">Prochainement</div>
          <h3>Les prochaines dates arrivent.</h3>
          <p class="ou">Rien de publi&eacute; pour l'instant &mdash; on n'annonce que du r&eacute;el. Organiser la mienne &rarr;</p>
        </a>`;
    } else {
      /* R100 — CLASSES DE LA MAQUETTE : article.date > img / span.puce /
         div.quand / h3 / p.ou. Le rendu n'émet plus .rb-card ni aucune
         classe du site : celles-ci traînaient leur CSS hérité
         (aspect-ratio 3/4, border-radius, box-shadow, overlay) qui se
         battait contre les valeurs de la maquette. */
      const fallback = 'images/ext/unsplash-photo-1507525428034-b723cf961d3e.jpg';
      nextBox.classList.remove('vide');
      nextBox.innerHTML = upcoming.map(ev => {
        const d = new Date(ev.date + 'T12:00:00');
        const dateStr = d.getDate() + ' ' + S.MONTHS[d.getMonth()].toLowerCase();
        /* La maquette met le JOUR et l'HEURE dans .quand (« Vendredi · 22h »),
           et le LIEU dans .ou (« Le Gosier — toit-terrasse »). On respecte
           ce partage avec les données réelles : date + heure d'un côté,
           commune de l'autre. */
        const JOURS = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
        const heure = (ev.time || '').replace(':00', 'h').replace(':', 'h');
        const quand = JOURS[d.getDay()] + ' ' + dateStr + (heure ? ' · ' + heure : '');
        const badge = ev.prive ? 'Privé' : (S.typeLabel[ev.type] || 'Soirée');
        const img = ev.img || fallback;
        return `
        <a class="date" href="evenement.html?id=${ev.id}" aria-label="${esc(ev.name)} — ${esc(ev.city)}, le ${dateStr}">
          <img src="${esc(img)}" onerror="this.onerror=null;this.src='${fallback}'" loading="lazy" decoding="async" width="900" height="1200" alt="${esc(ev.name)} — ${esc(ev.city)}">
          <span class="puce">${esc(badge)}</span>
          <div class="quand">${esc(quand)}</div>
          <h3>${esc(ev.name)}</h3>
          <p class="ou">${esc(ev.city)}${ev.demo ? ' · <span class="badge-demo">Exemple</span>' : ''}</p>
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
  /* ===== E/3 — LES IDENTIFIANTS NE SONT PLUS DES NOMBRES =====
     R99 a donné aux événements des identifiants TEXTE (`demo-rooftop-1`).
     Le code de la billetterie, lui, les relisait encore avec `+…`, hérité
     de l'époque où ils étaient numériques. `+'demo-rooftop-1'` vaut NaN,
     et NaN n'est égal à rien — pas même à lui-même.

     Deux commandes en sont mortes sans que rien ne le signale :
       · le bouton « Billets » de la billetterie levait une TypeError et
         la modale ne s'ouvrait JAMAIS (l'action principale de la page) ;
       · le cœur ♥ enregistrait NaN, qui devient `null` une fois passé par
         JSON : le favori était écrit et ne se retrouvait plus.

     Trouvé au CLIC, pas à la lecture — `muets.mjs` les avait rangés en
     « candidats servis par un écouteur délégué », ce qui était vrai et ne
     disait rien de ce qui se passait ensuite.

     Le remède est un seul geste, appliqué partout où un identifiant
     revient d'un attribut HTML : comparer en TEXTE. `String(a) === String(b)`
     survit aux deux formes — les identifiants texte de R99 et les
     identifiants numériques que l'espace pro fabrique encore avec
     `Date.now()`. */
  const memeId = (a, b) => String(a) === String(b);
  const getFavs = () => store.get('syfir-favs', []);
  const isFav = id => getFavs().some(f => memeId(f, id));
  const toggleFav = id => {
    const favs = getFavs();
    const i = favs.findIndex(f => memeId(f, id));
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
      .map(id => all.find(ev => memeId(ev.id, id))).filter(Boolean)
      .filter(upcoming).filter(ev => ev !== nextTicketEv)
      .sort((a, b) => a.date.localeCompare(b.date));
    const items = [];
    if (nextTicketEv) items.push({ ev: nextTicketEv, tag: 'Ton billet est prêt' });
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
            <small>${tag} · ${esc(ev.city)}</small>
          </span>
          <span class="next-arrow" aria-hidden="true">→</span>
        </a>`;
      }).join('');
    }
  }


  /* R39-A : gestion réelle du focus des modales — focus entrant, piégeage du
     Tab, restitution du focus à la fermeture. (Le mega-menu et l'age gate
     avaient déjà leur piège ; les modales billets/profil/lieu ne l'avaient pas.) */
  let modalLastFocus = null;
  const modalFocusables = m => [...m.querySelectorAll('a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])')].filter(el => el.offsetParent !== null);
  const openModal = m => {
    modalLastFocus = document.activeElement;
    m.classList.add('open'); document.body.style.overflow = 'hidden';
    // Focus après application de la transition visibility (hidden→visible) : un
    // simple rAF est parfois trop tôt (élément pas encore focusable).
    setTimeout(() => { const f = modalFocusables(m); (f[0] || m).focus(); }, 60);
  };
  const closeModal = m => {
    m.classList.remove('open'); document.body.style.overflow = '';
    if (modalLastFocus && modalLastFocus.focus) { modalLastFocus.focus(); modalLastFocus = null; }
  };
  $$('.modal').forEach(m => {
    m.addEventListener('click', e => { if (e.target === m || e.target.closest('[data-close]')) closeModal(m); });
    m.addEventListener('keydown', e => {
      if (e.key !== 'Tab') return;
      const f = modalFocusables(m); if (!f.length) return;
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });
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
    const qr = makeQR(qrPayload(t.num, t.event, t.date));
    return `
    <div class="my-ticket my-ticket-demo">
      <div class="my-ticket-main">
        <strong>${esc(t.event)}</strong>
        ${demoStamp()}
        <small>${esc(t.city)} · ${new Date(t.date + 'T12:00:00').toLocaleDateString('fr-FR')} · ${esc(t.detail)}</small>
        <!-- « Revente interdite » est CONSERVÉ tel quel. Sur un billet qui ne
             donne accès à rien, la mention sonne étrangement — mais la retirer
             serait supprimer du texte existant de ma propre initiative, et rien
             ne l'impose. Signalé au superviseur plutôt que tranché ici. -->
        <small class="ticket-num">N° ${esc(t.num || '—')} · Revente interdite</small>
        <div class="ticket-actions">
          <button class="ticket-share" type="button" data-share-id="${esc(t.id || '')}" data-share-title="${esc(t.event)}" data-share-date="${esc(t.date || '')}" aria-label="Partager ${esc(t.event)}">Partager</button>
          <a class="ticket-contact" href="partenaires.html#partnerForm">Contacter l'organisateur</a>
        </div>
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
    const favs = getFavs().map(id => events.find(ev => memeId(ev.id, id))).filter(Boolean);
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
    toggleFav(btn.dataset.unfav);
    renderMyFavs();
    renderEventsHook?.();   // resynchronise les cœurs de la grille (billetterie)
  });

  /* Partager un billet depuis Mon espace : titre + date + URL de la fiche */
  $('#myTickets')?.addEventListener('click', e => {
    const btn = e.target.closest('.ticket-share');
    if (!btn) return;
    const id = btn.dataset.shareId;
    const url = id
      ? new URL('evenement.html?id=' + id, location.href).href
      : new URL('evenements.html', location.href).href;
    const d = btn.dataset.shareDate;
    const dateTxt = d ? new Date(d + 'T12:00:00').toLocaleDateString('fr-FR') : '';
    const title = btn.dataset.shareTitle || 'un événement SYFIR';
    shareLink({
      title: 'SYFIR — ' + title,
      text: title + (dateTxt ? ' · ' + dateTxt : '') + ' — on se voit là-bas ✦',
      url
    });
  });

  renderMyTicketsHook = renderMyTickets;
  renderMyFavsHook = renderMyFavs;

  const openClient = (e, tab) => {
    e?.preventDefault();
    // R17 : un invité qui a déjà des billets ou des favoris peut consulter
    // Mon espace (ses données locales) sans compte. Sans profil NI données,
    // on l'envoie vers le parcours de connexion dédié (compte.html).
    const hasProfile = window.SYFIR_AUTH && window.SYFIR_AUTH.getProfile();
    const hasLocalData = store.get('syfir-tickets', []).length || store.get('syfir-favs', []).length;
    if (!hasProfile && !hasLocalData) { location.href = 'compte.html'; return; }
    switchTab(tab || 'tickets');
    renderAuthState();
    renderMyTickets();
    renderMyFavs();
    openModal(clientModal);
  };
  $('#clientSpaceBtn')?.addEventListener('click', e => openClient(e));
  $('#clientSpaceBtnMobile')?.addEventListener('click', e => { openClient(e); });
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
    // Galeries photo : les grilles historiques + les rangées streaming (R8)
    // qui contiennent de vraies photos (.moment-shot). On EXCLUT les rangées
    // de cartes-liens (.rb-card) qui mènent à des pages, pas à un plein écran.
    const grids = [
      ...$$('.moments-grid, .insta-grid'),
      ...$$('.media-row-track').filter(t => t.querySelector('.moment-shot'))
    ];
    if (!grids.length) return;

    const lb = document.createElement('div');
    lb.className = 'lightbox'; lb.hidden = true;
    lb.setAttribute('role', 'dialog'); lb.setAttribute('aria-modal', 'true');
    lb.setAttribute('aria-label', 'Photo en plein écran');
    lb.innerHTML =
      '<button class="lightbox-close" type="button" aria-label="Fermer">✕</button>' +
      '<button class="lightbox-nav lightbox-prev" type="button" aria-label="Photo précédente">‹</button>' +
      '<figure class="lightbox-stage"><img class="lightbox-img" src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==" alt=""><figcaption class="lightbox-cap"></figcaption></figure>' +
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
      else if (e.key === 'Tab') {   // R39-A : piégeage du focus dans la lightbox
        const f = [...lb.querySelectorAll('button')].filter(el => el.offsetParent !== null);
        if (!f.length) return;
        const first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
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

  /* ===== 44. RANGÉE « À REGARDER » (R23-4, SYFIR TV) — façades cliquables :
     l'iframe YouTube / le lecteur SoundCloud / la vidéo locale ne se chargent
     qu'au clic (perf + vie privée). Aucun autoplay avant action de l'utilisateur. */
  (function initReplays() {
    const track = $('#replayTrack');
    if (!track) return;
    track.addEventListener('click', e => {
      const btn = e.target.closest('.replay-play');
      if (!btn) return;
      const card = btn.closest('.replay-card');
      const thumb = card.querySelector('.replay-thumb');
      const title = esc(card.querySelector('.replay-title')?.textContent || 'Vidéo SYFIR');
      const kind = card.dataset.kind;
      if (kind === 'yt') {
        const src = card.dataset.embed + (card.dataset.embed.includes('?') ? '&' : '?') + 'autoplay=1';
        thumb.innerHTML = `<iframe src="${esc(src)}" title="${title}" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen loading="lazy"></iframe>`;
      } else if (kind === 'sc') {
        thumb.innerHTML = `<iframe title="${title} (SoundCloud)" allow="autoplay" scrolling="no" src="${esc(card.dataset.embed)}&auto_play=true&color=%23ff7a00"></iframe>`;
      } else {
        thumb.innerHTML = `<video controls autoplay playsinline preload="metadata" aria-label="${title}"><source src="${esc(card.dataset.src)}" type="video/mp4"></video>`;
      }
    });
  })();

  /* ===== 44b. RECAP « REVIVRE EN IMAGES » (R25-3) — lightbox par édition passée.
     Délégation globale sur [data-recap] : marche sur la billetterie (archives)
     ET sur la fiche d'un événement terminé. Focus piégé, clavier, swipe. */
  (function initRecap() {
    const S = window.SYFIR;
    if (!S) return;
    let lb, imgEl, capEl, countEl, prevBtn, nextBtn, photos = [], idx = 0, lastFocus = null;
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const build = () => {
      lb = document.createElement('div');
      lb.className = 'recap-lb'; lb.hidden = true;
      lb.setAttribute('role', 'dialog'); lb.setAttribute('aria-modal', 'true'); lb.setAttribute('aria-label', 'Revivre en images');
      lb.innerHTML =
        `<button class="recap-close" type="button" aria-label="Fermer">✕</button>
         <button class="recap-nav recap-prev" type="button" aria-label="Photo précédente">‹</button>
         <figure class="recap-stage"><img class="recap-img" src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==" alt="" decoding="async"><figcaption class="recap-cap"></figcaption></figure>
         <button class="recap-nav recap-next" type="button" aria-label="Photo suivante">›</button>
         <span class="recap-count" aria-hidden="true"></span>`;
      document.body.appendChild(lb);
      imgEl = lb.querySelector('.recap-img'); capEl = lb.querySelector('.recap-cap');
      countEl = lb.querySelector('.recap-count'); prevBtn = lb.querySelector('.recap-prev'); nextBtn = lb.querySelector('.recap-next');
      lb.addEventListener('click', e => { if (e.target === lb || e.target.closest('.recap-close')) close(); });
      prevBtn.addEventListener('click', () => show(idx - 1));
      nextBtn.addEventListener('click', () => show(idx + 1));
      document.addEventListener('keydown', e => {
        if (lb.hidden) return;
        if (e.key === 'Escape') close();
        else if (e.key === 'ArrowLeft') show(idx - 1);
        else if (e.key === 'ArrowRight') show(idx + 1);
      });
      let sx = 0;
      lb.addEventListener('touchstart', e => { sx = e.touches[0].clientX; }, { passive: true });
      lb.addEventListener('touchend', e => { const dx = e.changedTouches[0].clientX - sx; if (Math.abs(dx) > 40) show(idx + (dx < 0 ? 1 : -1)); }, { passive: true });
    };
    const show = i => {
      idx = (i + photos.length) % photos.length;
      imgEl.src = photos[idx];
      countEl.textContent = `${idx + 1} / ${photos.length}`;
      const multi = photos.length > 1;
      prevBtn.hidden = !multi; nextBtn.hidden = !multi;
    };
    const openRecap = ev => {
      if (!lb) build();
      photos = ev.recap || [];
      if (!photos.length) return;
      capEl.textContent = `${ev.name} — ${new Date(ev.date + 'T12:00:00').toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}`;
      imgEl.alt = `Revivre : ${ev.name}`;
      lastFocus = document.activeElement;
      lb.hidden = false; document.body.style.overflow = 'hidden';
      show(0);
      lb.querySelector('.recap-close').focus();
    };
    const close = () => { lb.hidden = true; document.body.style.overflow = ''; lastFocus?.focus?.(); };
    document.addEventListener('click', e => {
      const t = e.target.closest('[data-recap]');
      if (!t) return;
      const ev = S.getEvent(t.dataset.recap);
      if (ev && ev.recap && ev.recap.length) { e.preventDefault(); openRecap(ev); }
    });
  })();

  /* ===== 46. R98 — LA PROGRESSION DE LA SOIRÉE (accueil) =====
     UNE SEULE HORLOGE, et elle ne fait qu'une chose : poser --p entre 0
     et 1 sur :root, selon où on en est du défilement. Le ciel, les
     faisceaux et la brume la CONSOMMENT depuis le CSS. C'est la forme
     apprise en R94 — une horloge, des consommateurs — et c'est elle qui
     n'écrase rien : aucune animation posée sur les couches, donc rien à
     remettre en phase, rien à réinitialiser.

     Ce que ça remplace : §46 posait quatre paliers discrets par
     IntersectionObserver, §47 rejouait les mêmes trajectoires en repli,
     et les keyframes CSS les redisaient une troisième fois. Trois
     endroits à tenir alignés — la « dépendance triple » de la carte du
     retrait. Il n'en reste qu'un, et il tient en dix lignes.

     ⚠ L'ACCUEIL GRANDIT PENDANT QU'ON LE MESURE (piège R92 §4B) : les
     sections `content-visibility: auto` ne déclarent leur hauteur qu'en
     approchant du viewport. La hauteur de défilement est donc relue À
     CHAQUE FRAME, jamais mise en cache : une valeur mesurée une seule
     fois au chargement ferait arriver --p à 1 bien avant le bas de page.

     PAS de garde `prefers-reduced-motion` ici, et c'est un choix motivé :
     --p suit LE DÉFILEMENT DE L'UTILISATEUR, pas une horloge. Rien ne
     bouge tout seul, rien ne clignote, rien ne défile de soi-même. Couper
     --p reviendrait à figer le décor, or le principe du dépôt est
     l'inverse : on coupe le mouvement, pas le décor (R92/10). Ce qui est
     réellement animé — la rotation des faisceaux, la dérive de la brume —
     est coupé, lui, dans le CSS. */
  const ciel = $('.sky');
  if (ciel) {
    let enVol = false;
    const poseP = () => {
      enVol = false;
      const doc = document.documentElement;
      const course = doc.scrollHeight - innerHeight;
      const p = course > 0 ? Math.min(1, Math.max(0, scrollY / course)) : 0;
      /* Trois décimales : en dessous, l'œil ne voit rien et on ferait
         recalculer le style pour du bruit ; au-dessus, on gagnerait une
         précision que l'opacité peinte n'a pas. */
      doc.style.setProperty('--p', p.toFixed(3));
    };
    const surDefilement = () => {
      if (enVol) return;
      enVol = true;
      requestAnimationFrame(poseP);
    };
    addEventListener('scroll', surDefilement, { passive: true });
    addEventListener('resize', surDefilement, { passive: true });
    poseP();
  }

  /* ===== 47 (retiré, R98/1-4) — LA TRAVERSÉE =====
     §46 posait les paliers du ciel (IntersectionObserver, resolveStage,
     html[data-sky]) ; §47 était son repli requestAnimationFrame sans
     scroll-timeline, et portait PISTES — les trajectoires du ciel
     encodées PAR PRÉFÉRENCE DE THÈME.

     Les trois étaient couplés, et leur propre commentaire l'annonçait :
     PISTES devait rester synchronisé avec les keyframes CSS §39.2 et les
     plafonds §39.3. Ils sont donc retirés ENSEMBLE — en retirer un seul
     aurait laissé le site dans un état incohérent que rien n'aurait
     signalé.

     Il n'y a plus de passage jour -> nuit. Le voyage, lui, demeure : la
     SOIRÉE AVANCE au défilement, entièrement dans la nuit, pilotée par
     une seule variable --p calculée en rAF (R98/3). Une variable, pas
     quatre paliers ; une horloge, pas trois endroits à tenir alignés. */

  /* ===== 48. R92 — GARDE-FOU SAVE-DATA / RÉSEAU LENT =====
     prefers-reduced-motion est une media query, donc le CSS la gère seul.
     Save-Data et le type de connexion, NON : aucune media query ne les
     expose de façon fiable (prefers-reduced-data n'est pas implémenté
     partout). Il faut donc les traduire en attribut pour que le CSS
     puisse s'en saisir.

     CE QU'ON COUPE : le mouvement d'ambiance — scintillement des
     étoiles, respiration des ampoules, filantes, éclats. CE QU'ON GARDE :
     la traversée du ciel elle-même et TOUT le décor en version fixe. Un
     visiteur en Save-Data doit voir le même site, pas un site amputé ;
     on lui épargne les cycles processeur et la batterie, pas la nuit
     étoilée.

     Posé avant tout rendu utile, et jamais retiré : la préférence peut
     changer en cours de navigation mais rebasculer l'ambiance en pleine
     lecture serait plus perturbant que la garder coupée. */
  (function initEconomie() {
    if (!document.body.classList.contains('page-home')) return;
    const conn = navigator.connection || navigator.webkitConnection;
    if (!conn) return;
    const lent = conn.saveData || /(^|-)[23]g$/.test(conn.effectiveType || '');
    if (lent) document.documentElement.setAttribute('data-econome', '');
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

  /* ===== MICRO-MOMENT GOUTTE (R30-3) — l'image du désert : une seule goutte
     dorée qui se forme et tombe UNE fois par session sur le hero (600ms),
     jamais en boucle, jamais sous reduced-motion. Rare, donc précieuse. */
  (function dropMoment() {
    const hero = $('#homeHero') || $('.hero#accueil');
    if (!hero) return;
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    try {
      if (sessionStorage.getItem('syfir-drop-seen')) return;
      sessionStorage.setItem('syfir-drop-seen', '1');
    } catch (e) { /* stockage indisponible : on joue la goutte une fois quand même */ }
    const d = document.createElement('span');
    d.className = 'drop-moment';
    d.setAttribute('aria-hidden', 'true');
    d.addEventListener('animationend', () => d.remove(), { once: true });
    hero.appendChild(d);
  })();

  /* ============================================================
     PAGE ÉVÉNEMENTS — billetterie & espace pro
  ============================================================ */
  const eventsGrid = $('#eventsGrid');
  if (!eventsGrid) return; // tout ce qui suit ne concerne que evenements.html

  /* ===== 30. DONNÉES & RENDU (source unique : events-data.js -> window.SYFIR) ===== */
  const { TIERS_DEFAULT, MONTHS, baseEvents, typeLabel, stockLabel, ageLabel } = window.SYFIR;
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
      const ev = events.find(e => memeId(e.id, id));
      (ev?.genres || []).forEach(g => set.add(g.toLowerCase()));
    });
    return set;
  };
  const isReco = (ev, fg) => !isFav(ev.id) && (ev.genres || []).some(g => fg.has(g.toLowerCase()));

  const eventCardHTML = (ev, i) => {
    const d = new Date(ev.date + 'T12:00:00');
    const loc = [ev.city, ev.venue].filter(Boolean).join(' · ');
    const when = [fmtTime(ev.time) ? `${fmtTime(ev.time)}` : '', `${loc}`].filter(Boolean).join(' · ');
    const fav = isFav(ev.id);
    const reco = isReco(ev, favGenres());
    const stock = stockLabel(ev);
    const age = ageLabel(ev);
    return `
    <article class="event-card${stock && stock.soldOut ? ' is-soldout' : ''}" data-id="${ev.id}" tabindex="0" role="link" aria-label="Voir ${esc(ev.name)}" style="animation-delay:${i * 0.07}s">
      <div class="event-card-media">
        ${picHTML(ev.img, `alt="${esc(ev.name)}" loading="lazy" decoding="async"`)}
        <span class="event-date"><strong>${d.getDate()}</strong><small>${MONTHS[d.getMonth()]}</small></span>
        <span class="event-tag ${ev.prive ? 'tag-prive' : ''}">${ev.prive ? 'Privé' : typeLabel[ev.type] || 'Événement'}</span>
        ${stock ? `<span class="stock-badge ${stock.cls}">${stock.text}</span>` : ''}
        <button class="fav-btn ${fav ? 'on' : ''}" data-fav="${ev.id}" type="button"
                aria-pressed="${fav}" aria-label="${fav ? 'Retirer des favoris' : 'Ajouter aux favoris'}">♥</button>
      </div>
      <div class="event-card-body">
        <h3>${esc(ev.name)}</h3>
        ${ev.blurb ? `<p class="event-blurb">${esc(ev.blurb)}</p>` : ''}
        ${reco ? '<p class="event-reco">✦ Recommandé pour toi</p>' : ''}
        <p class="event-card-meta">${esc(when)}</p>
        <p class="event-age-badge ${age.cls}">${age.icon} ${age.text}</p>
        ${genreTags(ev) ? `<div class="event-genres">${genreTags(ev)}</div>` : ''}
        <div class="event-card-foot">
          <span class="event-price"><small>Billets</small><strong>${priceRange(ev)}</strong></span>
          ${stock && stock.soldOut
            ? '<button class="btn btn-ghost btn-sm" type="button" disabled>Complet</button>'
            : `<button class="btn btn-solid btn-sm" data-tickets="${ev.id}">Billets</button>`}
        </div>
        <p class="event-organizer">Organisé par ${esc(ev.organizer)}${ev.demo ? ' <span class="badge-demo">Exemple</span>' : ''}</p>
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

    // Groupement par MOIS, pas par jour.
    // Le groupement par jour donnait une grille de trois colonnes pour un
    // seul événement, répétée à chaque date : deux tiers de vide, autant de
    // fois qu'il y a de dates. La page se lisait « site vide » alors qu'elle
    // était pleine. Le mois est la maille juste pour un agenda de soirées :
    // il garde la lecture chronologique et remplit la rangée.
    // La date exacte reste sur chaque carte, elle n'est perdue nulle part.
    const fg = favGenres();
    const groups = new Map();
    list.forEach(ev => {
      const cle = ev.date.slice(0, 7);            // AAAA-MM
      if (!groups.has(cle)) groups.set(cle, []);
      groups.get(cle).push(ev);
    });
    if (fg.size) groups.forEach(evs => evs.sort((a, b) => isReco(b, fg) - isReco(a, fg)));
    eventsGrid.innerHTML = [...groups.entries()].map(([cle, evs]) => {
      const d = new Date(cle + '-01T12:00:00');
      const head = d.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
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

  /* ===== 31b. LES ÉDITIONS PASSÉES (R24-1) — preuve sociale =====
     Les événements dont la date est révolue basculent en cartes compactes
     « Revivre en images » vers SYFIR TV. Section masquée s'il n'y a rien. */
  (function renderPastEvents() {
    const grid = $('#pastGrid');
    const section = $('#archives');
    if (!grid || !section) return;
    const startOfToday = new Date(); startOfToday.setHours(0, 0, 0, 0);
    const past = events
      .filter(ev => new Date(ev.date + 'T00:00:00') < startOfToday && !ev.prive)
      .sort((a, b) => b.date.localeCompare(a.date));   // plus récent d'abord
    if (!past.length) { section.hidden = true; return; }
    section.hidden = false;
    grid.innerHTML = past.map(ev => {
      const d = new Date(ev.date + 'T12:00:00');
      const when = d.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
      const loc = [ev.city, ev.venue].filter(Boolean).join(' · ');
      return `
      <article class="past-card">
        <div class="past-media">
          ${picHTML(ev.img, `alt="${esc(ev.name)}" loading="lazy" decoding="async"`)}
          <span class="past-badge">Terminé</span>
        </div>
        <div class="past-body">
          <h3>${esc(ev.name)}${ev.demo ? ' <span class="badge-demo">Exemple</span>' : ''}</h3>
          <p class="past-meta">${esc(when)} · ${esc(loc)}</p>
          <a class="past-recap" href="syf-tv.html#moments"${ev.recap && ev.recap.length ? ` data-recap="${ev.id}"` : ''}>▷ Revivre en images</a>
        </div>
      </article>`;
    }).join('');
  })();

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
      </div>`).join('')
      + '<p class="tier-note">Le billet donne accès à l\'événement. Boissons en vente séparément sur place.</p>';
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
      const added = toggleFav(favBtn.dataset.fav);
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
    currentEvent = events.find(ev => memeId(ev.id, btn.dataset.tickets));
    tierQty = TIERS_DEFAULT.map(() => 0);
    const d = new Date(currentEvent.date + 'T12:00:00');
    $('#tmImage').src = currentEvent.img;
    $('#tmImage').alt = currentEvent.name;
    $('#tmTag').textContent = currentEvent.prive ? 'Soirée privée' : typeLabel[currentEvent.type] || 'Événement';
    $('#tmTitle').textContent = currentEvent.name;
    const when = d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    const loc = [currentEvent.city, currentEvent.venue].filter(Boolean).join(' · ');
    $('#tmMeta').textContent = `${loc} · ${when}${currentEvent.time ? ' · ' + fmtTime(currentEvent.time) : ''} · Organisé par ${currentEvent.organizer}`;
    // R82.1.1 : rappel de la condition d'âge AU MOMENT de la réservation
    // (déjà visible sur la carte/fiche avant ce clic) — simple rappel,
    // aucune vérification d'identité effectuée par le site.
    const tmAge = ageLabel(currentEvent);
    const tmAgeNote = $('#tmAgeNote');
    if (tmAgeNote) {
      if (tmAge.reminder) { tmAgeNote.textContent = `${tmAge.icon} ${tmAge.reminder}`; tmAgeNote.hidden = false; }
      else tmAgeNote.hidden = true;
    }
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
      showToast('Accès débloqué — bienvenue !');
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
    myTickets.push({ id: currentEvent.id, event: currentEvent.name, city: currentEvent.city, date: currentEvent.date, detail: bought, num });
    store.set('syfir-tickets', myTickets);
    $('#ticketTiers').style.display = 'none';
    $('#modalFoot').style.display = 'none';
    const ok = $('#tmSuccess');
    const prenom = firstNameOf((store.get('syfir-user', null) || {}).name);
    /* La confirmation NE PROMET RIEN QU'ELLE NE TIENNE. Le billet existe
       vraiment, il est dans Mon espace, il a son QR — et il ne donne accès
       à rien parce qu'aucun paiement n'a lieu. Les deux se disent dans la
       même phrase, pas l'un après l'autre. (E/1) */
    ok.textContent = `C'est dans la poche${prenom ? ', ' + prenom : ''} ! Tu as ${count} billet${count > 1 ? 's' : ''} de démonstration (${bought}) — N° ${num}. Retrouve-les dans Mon espace. ${DEMO_TICKET}`;
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

  // Le champ "code privé" n'apparaît que si l'événement est privé
  $$('input[name="evVisibility"]').forEach(r => {
    r.addEventListener('change', () => {
      $('#privateCodeField').hidden = r.value !== 'prive' || !r.checked;
    });
  });

  proForm.addEventListener('submit', e => {
    e.preventDefault();
    const isPrivate = $('input[name="evVisibility"]:checked').value === 'prive';
    const ok = [
      check($('#evName'), validators.required),
      check($('#evType'), validators.required),
      check($('#evDate'), v => (v && new Date(v) >= new Date().setHours(0, 0, 0, 0)) || 'Choisis une date à venir.'),
      check($('#evCity'), validators.required),
      check($('#evPrice'), v => (v !== '' && +v >= 0) || 'Indique un prix valide.'),
      check($('#evAgeStatus'), validators.required),
      !isPrivate || check($('#evCode'), v => v.trim().length >= 4 || 'Code de 4 caractères minimum.')
    ].every(Boolean);
    if (!ok) {
      $('.invalid', proForm)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    const imgByType = {
      beach: 'images/ext/unsplash-photo-1507525428034-b723cf961d3e.jpg',
      rooftop: 'images/ext/unsplash-photo-1496337589254-7e19d01cec44.jpg',
      festival: 'images/ext/unsplash-photo-1470225620780-dba8ba36b745.jpg',
      club: 'images/ext/unsplash-photo-1514525253161-7a46d19cd819.jpg',
      soiree: 'images/ext/unsplash-photo-1492684223066-81342ee5ff30.jpg'
    };
    // Image de secours si un nouveau type n'a pas encore de visuel dédié
    const defaultImg = 'images/ext/unsplash-photo-1533174072545-7a4b6ad7a6c3.jpg';
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
      ageStatus: $('#evAgeStatus').value || 'a-confirmer',
      code: isPrivate ? $('#evCode').value.trim().toUpperCase() : undefined
    };

    const proEvents = store.get('syfir-pro-events', []);
    proEvents.push(newEvent);
    store.set('syfir-pro-events', proEvents);
    events = [...baseEvents, ...proEvents];
    refreshCityOptions();
    refreshGenreOptions();
    renderEvents();

    // Honnêteté (R80-4) : ce formulaire ne collecte aucun contact (nom/email/téléphone),
    // donc pas de promesse de rappel ici — le devis sur les prestations se demande via
    // le formulaire de contact (partenaires.html#partnerForm).
    const success = $('#proSuccess');
    success.textContent = isPrivate
      ? `✦ Événement privé créé ! Partage le code « ${newEvent.code} » avec tes invités. Pour un devis sur les prestations choisies, écris-nous via le formulaire de contact.`
      : `✦ Événement publié dans la billetterie SYFIR ! Pour un devis sur les prestations choisies, écris-nous via le formulaire de contact.`;
    success.hidden = false;

    proForm.reset();
    $$('.invalid', proForm).forEach(el => el.classList.remove('invalid'));
    $('#privateCodeField').hidden = true;
    showToast('✦ Événement créé avec succès !');
    document.getElementById('billetterie').scrollIntoView({ behavior: 'smooth' });
  });

})();

/* ============================================================
   ARRIVER À LA BONNE ANCRE, MÊME LOIN DANS LA PAGE
   ------------------------------------------------------------
   `scroll-behavior: smooth` est posé sur <html>. Au CHARGEMENT d'une
   page ouverte sur une ancre (partenaires.html#partnerForm, à 5 373 px
   du haut), le navigateur lance une animation pendant que les images
   se chargent encore : la cible se déplace sous l'animation, qui est
   annulée. Résultat mesuré : on reste à 62 px du haut. Plusieurs
   boutons du site pointent sur cette ancre — « Organiser la mienne »
   en tête d'accueil, le menu mobile, le pied de page.
   Au chargement on saute donc SANS animation, une fois la page posée.
   Les clics à l'intérieur d'une page gardent le défilement doux.
============================================================ */
(function () {
  'use strict';
  if (!location.hash || location.hash.length < 2) return;

  const viser = () => {
    let cible;
    try { cible = document.querySelector(location.hash); } catch (e) { return; }
    if (!cible) return;
    const barre = document.querySelector('nav#nav');
    const marge = (barre ? barre.getBoundingClientRect().height : 0) + 18;
    const y = cible.getBoundingClientRect().top + window.scrollY - marge;
    const avant = document.documentElement.style.scrollBehavior;
    document.documentElement.style.scrollBehavior = 'auto';
    window.scrollTo(0, Math.max(0, y));
    document.documentElement.style.scrollBehavior = avant || '';
    poserLesReveals();
  };

  /* Sans ceci, l'ancre arrivait au bon endroit sur un écran NOIR.
     Les sections portent `.reveal` (opacité 0 jusqu'à ce qu'elles entrent
     dans l'écran). Le filet de sécurité du site s'exécute au chargement,
     donc AVANT notre saut : la cible n'était pas encore à l'écran, elle
     n'a jamais été révélée. Mesuré sur partenaires.html#partnerForm :
     bonne position, opacité 0. On repasse le filet après le saut. */
  const poserLesReveals = () => {
    const h = window.innerHeight || document.documentElement.clientHeight;
    document.querySelectorAll('.reveal').forEach(el => {
      const r = el.getBoundingClientRect();
      if (r.top < h + 200 && r.bottom > -200) el.classList.add('in', 'in-done');
    });
  };

  // Trois passages : au DOM prêt, au chargement complet, puis une fois
  // les images paresseuses posées. Sans le troisième, une image qui
  // arrive au-dessus de la cible décale tout ce qui suit.
  document.addEventListener('DOMContentLoaded', viser);
  window.addEventListener('load', () => { viser(); setTimeout(viser, 350); });
})();
