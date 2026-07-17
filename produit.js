/* ============================================================
   SYFIR — Fiche produit partageable (produit.html?id=X)
   Réutilise window.SYFIR (products-data.js + helpers de script.js).
   Chaque signature devient une vraie page indexable et partageable.
============================================================ */
(function () {
  'use strict';
  const S = window.SYFIR;
  const $ = (s, c = document) => c.querySelector(s);
  const esc = S.escapeHtml;

  const id = new URLSearchParams(location.search).get('id');
  const p = (id != null && S && S.getProduct) ? S.getProduct(id) : null;

  const detail = $('#productDetail');
  const notFound = $('#productNotFound');

  // --- Id inconnu : message propre + retour Collection ---
  if (!p) {
    if (notFound) notFound.hidden = false;
    const t = document.getElementById('pageTitle');
    if (t) t.textContent = 'Signature introuvable — SYFIR';
    return;
  }

  // URL de base réellement contrôlée (GitHub Pages) ; basculer vers syfir.fr une fois acheté
  const CANON_BASE = 'https://rododo97141.github.io/boutique-syf';
  const cleanName = p.name.replace(/™/g, '').trim();
  const shareText = `${cleanName} — ${p.notes}. Collection Syf, SYFIR.`;
  // Image absolue déterministe (URL canonique contrôlée), indépendante de l'hôte d'accès
  const absImg = `${CANON_BASE}/${p.ogImage}`;

  // --- SEO & aperçus sociaux ---
  const setAttr = (sel, attr, val) => { const el = document.querySelector(sel); if (el) el.setAttribute(attr, val); };
  document.getElementById('pageTitle').textContent = `${cleanName} — Collection Syf, SYFIR`;
  setAttr('#metaDesc', 'content', `${p.desc}`);
  setAttr('#ogTitle', 'content', `${cleanName} — SYFIR`);
  setAttr('#ogDesc', 'content', shareText);
  setAttr('#ogImage', 'content', p.ogImage);
  setAttr('#twImage', 'content', p.ogImage);
  setAttr('#ogUrl', 'content', location.href);
  setAttr('#canonical', 'href', `${CANON_BASE}/produit.html?id=${encodeURIComponent(p.id)}`);

  // --- Données structurées JSON-LD Product (schema.org) ---
  const ld = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: cleanName,
    image: [absImg],
    description: p.desc,
    brand: { '@type': 'Brand', name: 'SYFIR' },
    category: 'Cocktail'
  };
  const ldScript = document.createElement('script');
  ldScript.type = 'application/ld+json';
  ldScript.textContent = JSON.stringify(ld).replace(/</g, '\\u003C'); // pas de </script> injectable
  document.head.appendChild(ldScript);

  // --- « Ce qu'il y a dedans » : fruits publiés + rôle gustatif (aucune allégation) ---
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

  // --- « Les deux façons » : verre (sur place) + pochette (à emporter) ---
  const pic = S.picHTML || ((src, attrs) => `<img src="${esc(src)}" ${attrs}>`);
  const verre = 'images/produits/syf-planteur-verre.jpg';
  const formatsHtml = `
    <section class="pd-section container">
      <h2 class="pd-h2">Les deux <em>façons</em></h2>
      <div class="ck-formats pd-formats">
        <div class="ck-format">
          ${pic(verre, 'alt="Servi sur glace dans le verre SYFIR" loading="lazy" decoding="async" width="1086" height="1448"')}
          <div><strong>🥂 Sur place</strong><small>Servi dans le verre SYFIR</small></div>
        </div>
        <div class="ck-format">
          ${pic(p.photos[0], `alt="La pochette ${esc(cleanName)} scellée" loading="lazy" decoding="async"`)}
          <div><strong>🛍️ À emporter</strong><small>Scellée — elle te suit partout</small></div>
        </div>
      </div>
      <a class="btn btn-solid btn-full pd-where" href="index.html#ou-trouver">Où le trouver</a>
    </section>`;

  // --- FAQ produit inline (accordéon natif, identique à la Collection) ---
  const faqHtml = `
    <section class="pd-section container faq-wrap">
      <h2 class="pd-h2">Questions <em>produit</em></h2>
      <div class="faq-list">
        <details class="faq-item" open>
          <summary><span class="faq-q">Qu'est-ce qu'une pochette SYFIR&nbsp;?</span><span class="faq-ic" aria-hidden="true"></span></summary>
          <div class="faq-a"><p>Une pochette, c'est un cocktail premium prêt à boire, scellée à la main, format liberté. Tu la glisses dans ton sac, tu la plantes dans la glace, tu la sirotes où tu veux. Le soleil en pochette.</p></div>
        </details>
        <details class="faq-item">
          <summary><span class="faq-q">Comment conserver une pochette&nbsp;?</span><span class="faq-ic" aria-hidden="true"></span></summary>
          <div class="faq-a"><p>Au frais, à l'abri du soleil. Avant de la boire : deux heures au congélateur ou un bon bain de glace. Une fois ouverte, elle se déguste tout de suite — c'est fait pour.</p></div>
        </details>
        <details class="faq-item">
          <summary><span class="faq-q">Sur place ou à emporter, quelle différence&nbsp;?</span><span class="faq-ic" aria-hidden="true"></span></summary>
          <div class="faq-a"><p>Sur place, ton cocktail est servi dans le verre SYFIR chez nos partenaires. À emporter, c'est la pochette scellée, à vivre où tu veux. Même saveur, deux libertés.</p></div>
        </details>
      </div>
      <p class="faq-foot">D'autres questions&nbsp;? <a href="faq.html">Voir toute la FAQ →</a></p>
    </section>`;

  // --- Sélecteur de saveurs : circuler dans la gamme (pages sœurs) ---
  const selItems = (S.products || []).map(o => {
    const on = o.id === p.id;
    const thumb = (o.photos && o.photos[0]) || '';
    return `<a class="ck-sel-item${on ? ' active' : ''}" href="produit.html?id=${esc(o.id)}"${on ? ' aria-current="page"' : ''}>
      <span class="ck-sel-thumb">${pic(thumb, 'alt="" loading="lazy" decoding="async"')}</span>
      <span class="ck-sel-name">${esc(o.short || o.name)}</span>
    </a>`;
  }).join('');
  const selSoon = [1, 2].map(() => `<a class="ck-sel-item ck-sel-soon" href="saveurs.html#bientot" aria-label="Bientôt dans la collection">
      <span class="ck-sel-thumb ck-sel-pouch" aria-hidden="true">?</span>
      <span class="ck-sel-name">Bientôt</span>
    </a>`).join('');
  const selectorHtml = `
    <section class="pd-section container">
      <h2 class="pd-h2">Toute la <em>gamme</em></h2>
      <div class="ck-selector pd-selector" role="group" aria-label="Naviguer dans la Collection Syf">${selItems}${selSoon}</div>
    </section>`;

  // --- Rendu de la fiche ---
  detail.hidden = false;
  detail.innerHTML = `
    <div class="pd-top container">
      <div class="pd-hero"><div class="ck-hero pd-gallery"></div></div>
      <div class="pd-intro">
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
    ${faqHtml}
    ${selectorHtml}`;

  // Galerie média (même carrousel que la fiche modale — exposé par script.js)
  const gallery = detail.querySelector('.pd-gallery');
  if (gallery && S.buildMediaCarousel) {
    S.buildMediaCarousel(gallery, {
      photos: p.photos.join('|'), video: p.video || '', name: cleanName,
      videoInline: true, badge: p.badge || ''
    });
    if (p.badgeCls) gallery.querySelector('.artist-badge')?.classList.add(p.badgeCls);
  }

  // WhatsApp
  const wa = $('#pdWhatsapp');
  if (wa) wa.href = 'https://wa.me/?text=' + encodeURIComponent(shareText + ' — ' + location.href);

  // Partage natif (navigator.share) sinon copie du lien
  const toastEl = $('#toast');
  let toastTimer;
  const toast = msg => {
    if (!toastEl) return;
    toastEl.textContent = msg; toastEl.classList.add('show');
    clearTimeout(toastTimer); toastTimer = setTimeout(() => toastEl.classList.remove('show'), 3200);
  };
  $('#pdShare')?.addEventListener('click', async () => {
    const data = { title: `SYFIR — ${cleanName}`, text: shareText, url: location.href };
    if (navigator.share) {
      try { await navigator.share(data); } catch (e) { /* partage annulé */ }
    } else if (navigator.clipboard) {
      try { await navigator.clipboard.writeText(location.href); toast('🔗 Lien copié dans le presse-papier !'); }
      catch (e) { toast('Copie le lien depuis la barre d\'adresse.'); }
    } else {
      toast('Copie le lien depuis la barre d\'adresse.');
    }
  });
})();
