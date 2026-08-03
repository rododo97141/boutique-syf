/* ============================================================
   SYFIR — Fiche artiste partageable (artiste.html?id=X)
   Réutilise window.SYFIR (artistes-data.js + events-data.js + helpers).
   Troisième pilier des pages dédiées, après evenement.html et produit.html.
============================================================ */
(function () {
  'use strict';
  const S = window.SYFIR;
  const $ = (s, c = document) => c.querySelector(s);
  const esc = S.escapeHtml;
  const pic = S.picHTML || ((src, attrs) => `<img src="${esc(src)}" ${attrs}>`);

  const id = new URLSearchParams(location.search).get('id');
  const a = (id != null && S && S.getArtist) ? S.getArtist(id) : null;

  const detail = $('#artistDetail');
  const notFound = $('#artistNotFound');

  if (!a) {
    if (notFound) notFound.hidden = false;
    const t = document.getElementById('pageTitle');
    if (t) t.textContent = 'Artiste introuvable — SYFIR';
    return;
  }

  const CANON_BASE = 'https://rododo97141.github.io/boutique-syf';
  const shareText = `${a.name} — ${a.role}. Sur les scènes SYFIR.`;
  const absImg = `${CANON_BASE}/${a.photo}`;

  // --- SEO & aperçus sociaux ---
  const setAttr = (sel, attr, val) => { const el = document.querySelector(sel); if (el) el.setAttribute(attr, val); };
  /* Même raison que sur la fiche événement : une og:image relative ne
     s'affiche pas dans une conversation. Le HTML porte une valeur absolue
     par défaut, le JS ne doit pas la remplacer par un chemin. */
  const CANON = 'https://rododo97141.github.io/boutique-syf';
  const absolu = u => (!u || /^https?:/.test(u)) ? u : `${CANON}/${String(u).replace(/^\.?\//, '')}`;
  document.getElementById('pageTitle').textContent = `${a.name} — Artistes SYFIR`;
  setAttr('#metaDesc', 'content', `${a.name} — ${a.role}. ${a.bio.slice(0, 120)}`);
  setAttr('#ogTitle', 'content', `${a.name} — SYFIR`);
  setAttr('#ogDesc', 'content', shareText);
  setAttr('#ogImage', 'content', absolu(a.photo));
  setAttr('#twImage', 'content', absolu(a.photo));
  setAttr('#ogUrl', 'content', location.href);
  setAttr('#canonical', 'href', `${CANON_BASE}/artiste.html?id=${encodeURIComponent(a.id)}`);

  // --- JSON-LD MusicGroup (schema.org) — pas d'invention pour les démos ---
  const ld = { '@context': 'https://schema.org', '@type': 'MusicGroup', name: a.name, genre: a.genres, image: [absImg] };
  if (!a.demo && a.socials) {
    ld.url = a.socials.youtube || location.href;
    ld.sameAs = Object.values(a.socials).filter(Boolean);
  }
  const ldScript = document.createElement('script');
  ldScript.type = 'application/ld+json';
  ldScript.textContent = JSON.stringify(ld).replace(/</g, '\\u003C');
  document.head.appendChild(ldScript);

  // --- Fil d'Ariane structuré (R39-B) : Accueil > Les artistes > cet artiste ---
  const crumbLd = {
    '@context': 'https://schema.org', '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Accueil', item: `${CANON_BASE}/index.html` },
      { '@type': 'ListItem', position: 2, name: 'Les artistes', item: `${CANON_BASE}/index.html#artistes` },
      { '@type': 'ListItem', position: 3, name: a.name, item: `${CANON_BASE}/artiste.html?id=${encodeURIComponent(a.id)}` }
    ]
  };
  const crumbScript = document.createElement('script');
  crumbScript.type = 'application/ld+json';
  crumbScript.textContent = JSON.stringify(crumbLd).replace(/</g, '\\u003C');
  document.head.appendChild(crumbScript);

  const webpOf = src => /\/(ext|produits)\/[^"']+\.jpe?g$/i.test(src) ? src.replace(/\.jpe?g$/i, '.webp') : null;
  const genresHtml = (a.genres || []).map(g => `<span class="event-genre">${esc(g)}</span>`).join('');

  // --- Prochaines dates : lien latéral vers les événements (réseau, pas pyramide) ---
  const evs = (a.dates || []).map(eid => S.getEvent && S.getEvent(eid)).filter(Boolean);
  const startOfToday = new Date(); startOfToday.setHours(0, 0, 0, 0);
  const upcoming = evs.filter(e => new Date(e.date + 'T00:00:00') >= startOfToday)
    .sort((e1, e2) => e1.date.localeCompare(e2.date));
  const datesHtml = upcoming.length ? `
    <section class="ar-section container">
      <h2 class="pd-h2">Prochaines <em>dates</em></h2>
      <div class="ar-dates">
        ${upcoming.map(e => {
          const d = new Date(e.date + 'T12:00:00');
          const when = d.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'long' });
          return `<a class="ar-date" href="evenement.html?id=${esc(String(e.id))}">
            <span class="ar-date-when">${esc(when)}</span>
            <span class="ar-date-name">${esc(e.name)}</span>
            <span class="ar-date-loc">${esc([e.city, e.venue].filter(Boolean).join(' · '))}</span>
            <span class="ar-date-go">Voir l'événement →</span>
          </a>`;
        }).join('')}
      </div>
    </section>` : '';

  // --- Embeds (façades locales, iframe au clic) — Unity 141 ---
  const ytHtml = (a.embedsYt && a.embedsYt.length) ? `
      <div class="ar-embeds">
        ${a.embedsYt.map(v => `
          <div class="ar-embed" data-embed="https://www.youtube-nocookie.com/embed/${esc(v.id)}" data-title="${esc(v.title)}">
            <picture><source type="image/webp" srcset="images/ext/yt-${esc(v.id)}.webp">
              <img src="images/ext/yt-${esc(v.id)}.jpg" onerror="this.onerror=null;this.src='images/artiste-unity.jpg'" alt="${esc(v.title)}" loading="lazy" decoding="async" width="480" height="360"></picture>
            <button class="ar-embed-play" type="button" aria-label="Lire : ${esc(v.title)}">▶</button>
            <span class="ar-embed-title">${esc(v.title)}</span>
          </div>`).join('')}
      </div>` : '';
  const scHtml = a.soundcloudEmbed ? `
      <div class="ar-embed ar-embed-audio" data-embed="${esc(a.soundcloudEmbed)}&color=%23D4A017&auto_play=true" data-title="Mix Zouk Live — ${esc(a.name)}" data-audio="1">
        ${pic(a.photo, `alt="Mix ${esc(a.name)} sur SoundCloud" loading="lazy" decoding="async" width="480" height="360"`)}
        <button class="ar-embed-play" type="button" aria-label="Écouter le mix ${esc(a.name)}">▶</button>
        <span class="ar-embed-title">Mix Zouk Live · SoundCloud</span>
      </div>` : '';
  const embedsHtml = (ytHtml || scHtml) ? `
    <section class="ar-section container">
      <h2 class="pd-h2">En <em>live</em></h2>
      <p class="ck-sub-note">Lives et mix officiels — le lecteur ne charge qu'au clic.</p>
      ${ytHtml}${scHtml}
    </section>` : '';

  // --- Booking (Unity 141) — contacts réels publics, rien d'inventé ---
  const bookHtml = a.booking ? `
    <section class="ar-section container">
      <h2 class="pd-h2">Booking &amp; <em>contact</em></h2>
      <div class="ar-booking">
        ${a.booking.phone ? `<a class="btn btn-solid" href="tel:${esc(a.booking.phone)}">📞 ${esc(a.booking.phoneDisplay || a.booking.phone)}</a>` : ''}
        ${a.booking.email ? `<a class="btn btn-ghost" href="mailto:${esc(a.booking.email)}">✉ ${esc(a.booking.email)}</a>` : ''}
      </div>
      ${a.booking.note ? `<p class="ar-book-note">${esc(a.booking.note)}</p>` : ''}
    </section>` : '';

  // --- Réseaux (Unity) ---
  const socialsHtml = (!a.demo && a.socials) ? `
    <div class="ar-socials">
      ${Object.entries({ youtube: 'YouTube', soundcloud: 'SoundCloud', instagram: 'Instagram', facebook: 'Facebook', tiktok: 'TikTok' })
        .filter(([k]) => a.socials[k]).map(([k, label]) => `<a href="${esc(a.socials[k])}" target="_blank" rel="noopener">${label}</a>`).join('')}
    </div>` : '';

  // --- Rendu ---
  detail.hidden = false;
  detail.innerHTML = `
    <div class="ar-top container">
      <div class="ar-photo">
        ${(() => { const w = webpOf(a.photo); return w
          ? `<picture><source type="image/webp" srcset="${esc(w)}"><img src="${esc(a.photo)}" alt="${esc(a.name)}" fetchpriority="high" width="900" height="1200"></picture>`
          : `<img src="${esc(a.photo)}" alt="${esc(a.name)}" fetchpriority="high" width="900" height="1200">`; })()}
      </div>
      <div class="ar-intro">
        <nav class="fiche-crumb" aria-label="Fil d'Ariane"><a href="index.html#artistes">← Les artistes</a></nav>
        <p class="eyebrow">Artiste${a.demo ? '' : ' · SYFIR'}</p>
        <h1 class="ar-name">${esc(a.name)}${a.demo ? ' <span class="badge-demo">Exemple</span>' : ''}</h1>
        <p class="ar-role">${esc(a.role)}</p>
        ${genresHtml ? `<div class="event-genres ar-genres">${genresHtml}</div>` : ''}
        <p class="ar-bio">${esc(a.bio)}</p>
        ${socialsHtml}
        <div class="ar-share">
          <button class="btn btn-solid btn-sm" id="arShare" type="button">🔗 Partager</button>
          <a class="btn btn-ghost btn-sm" id="arWhatsapp" target="_blank" rel="noopener">Partager sur WhatsApp</a>
        </div>
        ${a.demo ? '<p class="ar-demo-note">Artiste de démonstration — exemple de fiche. Les vrais artistes partenaires ont leur fiche complète (voir Unity 141).</p>' : ''}
      </div>
    </div>
    ${embedsHtml}
    ${datesHtml}
    ${bookHtml}`;

  // View Transition : nomme la photo hero (morph depuis la carte)
  const photoImg = detail.querySelector('.ar-photo img');
  if (photoImg && !matchMedia('(prefers-reduced-motion: reduce)').matches) photoImg.style.viewTransitionName = 'artist-hero';

  // WhatsApp + partage natif
  const wa = $('#arWhatsapp');
  if (wa) wa.href = 'https://wa.me/?text=' + encodeURIComponent(shareText + ' — ' + location.href);
  const toastEl = $('#toast'); let toastTimer;
  const toast = msg => { if (!toastEl) return; toastEl.textContent = msg; toastEl.classList.add('show'); clearTimeout(toastTimer); toastTimer = setTimeout(() => toastEl.classList.remove('show'), 3200); };
  $('#arShare')?.addEventListener('click', async () => {
    const data = { title: `SYFIR — ${a.name}`, text: shareText, url: location.href };
    if (navigator.share) { try { await navigator.share(data); } catch (e) { /* annulé */ } }
    else if (navigator.clipboard) { try { await navigator.clipboard.writeText(location.href); toast('🔗 Lien copié dans le presse-papier !'); } catch (e) { toast('Copie le lien depuis la barre d\'adresse.'); } }
    else { toast('Copie le lien depuis la barre d\'adresse.'); }
  });

  // Façades embeds : l'iframe (YouTube-nocookie / SoundCloud) ne charge qu'au clic
  detail.querySelectorAll('.ar-embed').forEach(box => {
    box.addEventListener('click', () => {
      const url = box.dataset.embed, title = box.dataset.title || a.name;
      const isAudio = box.dataset.audio === '1';
      const src = url + (isAudio ? '' : (url.includes('?') ? '&' : '?') + 'autoplay=1');
      box.innerHTML = `<iframe src="${esc(src)}" title="${esc(title)}" loading="lazy" ${isAudio ? 'height="166"' : 'allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen'} frameborder="0"></iframe>`;
      box.classList.add('ar-embed-live');
    });
  });
})();
