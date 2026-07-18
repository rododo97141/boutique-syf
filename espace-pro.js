/* ============================================================
   SYFIR — Espace pro organisateur (Smartboard)
   Tableau de bord alimenté par window.SYFIR + ventes simulées.
============================================================ */
(function () {
  'use strict';
  const S = window.SYFIR;
  const esc = S.escapeHtml;   // échappement HTML systématique
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];

  const toastEl = $('#toast');
  let toastTimer;
  const toast = msg => {
    if (!toastEl) return;
    toastEl.textContent = msg; toastEl.classList.add('show');
    clearTimeout(toastTimer); toastTimer = setTimeout(() => toastEl.classList.remove('show'), 3000);
  };

  // --- Navigation sidebar ---
  const switchSec = sec => {
    $$('.dash-link').forEach(l => l.classList.toggle('active', l.dataset.sec === sec));
    $$('.dash-section').forEach(s => s.classList.toggle('active', s.id === `sec-${sec}`));
  };
  $('#dashNav').addEventListener('click', e => {
    const b = e.target.closest('.dash-link');
    if (b) switchSec(b.dataset.sec);
  });

  // --- Ventes simulées (déterministes, stables par événement) ---
  const seed = str => { let h = 0; for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0; return h; };
  const salesOf = ev => {
    const s = seed((ev.name || '') + ev.date);
    const capacity = 120 + (s % 380);
    const sold = 20 + (s % Math.max(1, capacity - 40));
    const avg = ev.price * 1.2;
    return { sold, capacity, revenue: Math.round(sold * avg) };
  };
  const statusOf = ev => {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    if (ev.prive) return { label: 'Privé', cls: 'st-prive' };
    return new Date(ev.date + 'T00:00:00') >= today ? { label: 'À venir', cls: 'st-live' } : { label: 'Passé', cls: 'st-past' };
  };

  const emptyState = (title, desc, cta) => `
    <div class="dash-empty">
      <div class="dash-empty-ic">✦</div>
      <h3>${title}</h3>
      <p>${desc}</p>
      ${cta ? '<a class="btn btn-solid btn-sm" href="evenements.html#pro">+ Créer un événement</a>' : ''}
    </div>`;

  const renderOverview = () => {
    const pro = S.getProEvents();
    const body = $('#overviewBody');
    if (!pro.length) {
      body.innerHTML = emptyState('Pas encore de données', 'Crée ton premier événement avec SYFIR Experience : tes ventes et revenus s\'afficheront ici.', true);
      return;
    }
    let sold = 0, rev = 0;
    pro.forEach(ev => { const s = salesOf(ev); sold += s.sold; rev += s.revenue; });
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const next = pro.filter(e => new Date(e.date + 'T00:00:00') >= today).sort((a, b) => a.date.localeCompare(b.date))[0];
    body.innerHTML = `
      <div class="kpi-grid">
        <div class="kpi-card">
          <span class="kpi-label">Billets vendus</span>
          <strong class="kpi-value">${sold}</strong>
          <span class="kpi-sub">sur ${pro.length} événement${pro.length > 1 ? 's' : ''}</span>
        </div>
        <div class="kpi-card">
          <span class="kpi-label">Revenus</span>
          <strong class="kpi-value">${S.euro(rev)}</strong>
          <span class="kpi-sub">ventes cumulées</span>
        </div>
        <div class="kpi-card">
          <span class="kpi-label">Prochain événement</span>
          <strong class="kpi-value kpi-value-sm">${next ? esc(next.name) : '—'}</strong>
          <span class="kpi-sub">${next ? new Date(next.date + 'T12:00:00').toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' }) : 'Aucun à venir'}</span>
        </div>
      </div>
      ${(() => {
        // Comparatifs simulés, stables sur la journée (graine = date + événements)
        const dayKey = new Date().toISOString().slice(0, 10);
        const g = seed(dayKey + pro.map(e => e.name).join(''));
        const todaySold = 2 + (g % 14);
        const yestSold = 2 + ((g >> 4) % 14);
        const dSold = yestSold ? Math.round((todaySold - yestSold) / yestSold * 100) : 0;
        const monthRev = Math.round(rev * (0.22 + (g % 30) / 100));
        const lastMonthRev = Math.round(rev * (0.22 + ((g >> 6) % 30) / 100));
        const dRev = lastMonthRev ? Math.round((monthRev - lastMonthRev) / lastMonthRev * 100) : 0;
        const arrow = v => v >= 0 ? `<span class="kpi-delta up">▲ +${v}%</span>` : `<span class="kpi-delta down">▼ ${v}%</span>`;
        return `
      <div class="kpi-grid kpi-grid-compare">
        <div class="kpi-card">
          <span class="kpi-label">Billets aujourd'hui</span>
          <strong class="kpi-value">${todaySold} ${arrow(dSold)}</strong>
          <span class="kpi-sub">vs ${yestSold} hier</span>
        </div>
        <div class="kpi-card">
          <span class="kpi-label">Revenus du mois</span>
          <strong class="kpi-value kpi-value-sm">${S.euro(monthRev)} ${arrow(dRev)}</strong>
          <span class="kpi-sub">vs ${S.euro(lastMonthRev)} le mois dernier</span>
        </div>
      </div>`;
      })()}
      <p class="dash-note">✦ Chiffres de ventes simulés pour la démo — ils seront connectés à la billetterie réelle.</p>`;
  };

  const renderEvents = () => {
    const pro = S.getProEvents();
    const box = $('#proEventsList');
    if (!pro.length) {
      box.innerHTML = emptyState('Aucun événement créé', 'Tes événements créés via SYFIR Experience apparaîtront ici, avec leur statut et leurs ventes.', true);
      return;
    }
    box.innerHTML = pro.slice().sort((a, b) => a.date.localeCompare(b.date)).map(ev => {
      const st = statusOf(ev), s = salesOf(ev);
      const d = new Date(ev.date + 'T12:00:00');
      return `
        <div class="pro-event-row">
          <div class="pro-event-info">
            <span class="pro-status ${st.cls}">${st.label}</span>
            <strong>${esc(ev.name)}</strong>
            <small>${d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })} · ${esc(ev.city)} · ${s.sold} billets vendus</small>
          </div>
          <div class="pro-event-actions">
            <a class="btn btn-ghost btn-sm" href="evenement.html?id=${ev.id}" target="_blank" rel="noopener">Voir la fiche ↗</a>
            <button class="btn btn-ghost btn-sm" data-dup="${ev.id}">Dupliquer</button>
            <button class="btn btn-ghost btn-sm pro-del" data-del="${ev.id}">Supprimer</button>
          </div>
        </div>`;
    }).join('');
  };

  $('#proEventsList').addEventListener('click', e => {
    const dup = e.target.closest('[data-dup]');
    const del = e.target.closest('[data-del]');
    if (!dup && !del) return;
    let pro = S.getProEvents();
    if (dup) {
      const ev = pro.find(x => String(x.id) === dup.dataset.dup);
      if (ev) {
        pro.push({ ...ev, id: Date.now() + Math.floor(Math.random() * 1000), name: ev.name + ' (copie)' });
        localStorage.setItem('syfir-pro-events', JSON.stringify(pro));
        toast('✦ Événement dupliqué');
      }
    }
    if (del) {
      pro = pro.filter(x => String(x.id) !== del.dataset.del);
      localStorage.setItem('syfir-pro-events', JSON.stringify(pro));
      toast('Événement supprimé');
    }
    renderEvents();
    renderOverview();
  });

  renderOverview();
  renderEvents();

  /* ============================================================
     PORTAIL DISTRIBUTEUR (R26-A) — transposition myHerbalife, démo honnête.
     Chiffres démo déterministes (graine = jour), badgés « démo ».
  ============================================================ */
  (function initPortail() {
    if (!$('#sec-portail')) return;
    const dayKey = new Date().toISOString().slice(0, 10);

    // 1. Bandeau KPI perso (démo, stable sur la journée)
    const g = seed(dayKey + 'distrib');
    const ventesMois = 1200 + (g % 3800);
    const billets = 40 + ((g >> 3) % 160);
    const volume = 800 + ((g >> 6) % 2200);
    const kpis = $('#portailKpis');
    if (kpis) kpis.innerHTML = `
      <div class="kpi-card"><span class="kpi-label">Ventes du mois</span><strong class="kpi-value">${S.euro(ventesMois)}</strong><span class="kpi-sub">cumul distributeur</span></div>
      <div class="kpi-card"><span class="kpi-label">Pochettes vendues</span><strong class="kpi-value">${billets}</strong><span class="kpi-sub">ce mois-ci</span></div>
      <div class="kpi-card"><span class="kpi-label">Volume</span><strong class="kpi-value">${volume}</strong><span class="kpi-sub">unités écoulées</span></div>`;

    // 2. Onglets
    const tabs = $$('.portail-tab');
    tabs.forEach(t => t.addEventListener('click', () => {
      const key = t.dataset.ptab;
      tabs.forEach(x => { const on = x === t; x.classList.toggle('active', on); x.setAttribute('aria-selected', String(on)); });
      $$('.portail-panel').forEach(p => { const on = p.id === `ptab-${key}`; p.classList.toggle('active', on); p.hidden = !on; });
    }));

    // 3. Catalogue (les 3 signatures)
    const pic = (base, alt) => `<picture><source type="image/webp" srcset="${base}.webp"><img src="${base}.jpg" alt="${esc(alt)}" loading="lazy" decoding="async" width="864" height="1184"></picture>`;
    const CATALOG = [
      { name: 'Sirium Planteur', desc: 'Mangue mûre, passion, ananas rôti', base: 'images/produits/syfir-planteur-marbre' },
      { name: 'Sirium Coral Breeze', desc: 'Agrumes, hibiscus, fruits rouges', base: 'images/produits/syfir-coral-fruits-rouges' },
      { name: 'Sirium Golden Escape', desc: 'Citron vert, passion, fruits exotiques', base: 'images/produits/syfir-tropical-ananas' }
    ];
    const catBox = $('#portailCatalog');
    if (catBox) catBox.innerHTML = CATALOG.map(c => `
      <article class="catalog-card">
        <div class="catalog-media">${pic(c.base, c.name)}</div>
        <div class="catalog-body">
          <h3>${esc(c.name)}</h3>
          <p>${esc(c.desc)}</p>
          <button class="btn btn-solid btn-sm" data-order="${esc(c.name)}">Je commande</button>
        </div>
      </article>`).join('');

    // 4. Modale de commande grossiste -> mailto (pré-rempli) + mémoire locale
    const orderModal = $('#orderModal');
    const openOrder = product => {
      $('#orderProduct').textContent = 'Commander — ' + product;
      orderModal.dataset.product = product;
      orderModal.classList.add('open'); orderModal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    };
    const closeOrder = () => { orderModal.classList.remove('open'); orderModal.setAttribute('aria-hidden', 'true'); document.body.style.overflow = ''; };
    catBox?.addEventListener('click', e => { const b = e.target.closest('[data-order]'); if (b) openOrder(b.dataset.order); });
    orderModal?.addEventListener('click', e => { if (e.target === orderModal || e.target.closest('[data-close]')) closeOrder(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && orderModal?.classList.contains('open')) closeOrder(); });

    const readOrders = () => { try { return JSON.parse(localStorage.getItem('syfir-orders')) || []; } catch { return []; } };
    const renderOrders = () => {
      const box = $('#portailOrders');
      if (!box) return;
      const orders = readOrders();
      box.innerHTML = orders.length
        ? orders.slice().reverse().map(o => `
          <div class="order-row">
            <div class="order-row-main"><strong>${esc(o.product)}</strong><small>${esc(o.qty)} carton${o.qty > 1 ? 's' : ''} · ${esc(o.place || '—')} · ${esc(o.city || '—')}</small></div>
            <span class="order-status">À finaliser dans ton mail</span>
          </div>`).join('')
        : emptyState('Aucune commande', 'Passe ta première commande depuis le Catalogue : elle apparaîtra ici, avec son statut.', false);
    };

    $('#orderForm')?.addEventListener('submit', e => {
      e.preventDefault();
      const product = orderModal.dataset.product || 'SYFIR';
      const qty = Math.max(1, parseInt($('#orderQty').value, 10) || 1);
      const place = $('#orderPlace').value.trim();
      const city = $('#orderCity').value.trim();
      // Mémoire locale (démo) — l'endpoint réel de commande reste à brancher (TODO)
      const orders = readOrders();
      orders.push({ product, qty, place, city, date: dayKey });
      try { localStorage.setItem('syfir-orders', JSON.stringify(orders)); } catch { /* stockage indisponible */ }
      // Le formulaire de contact vit sur partenaires.html — on transmet l'intention (distributeur) et on redirige.
      try { sessionStorage.setItem('syfir-partner-intent', JSON.stringify({ type: 'distributeur' })); } catch (e) { /* stockage indisponible */ }
      location.href = 'partenaires.html#partnerForm';
      closeOrder();
      renderOrders();
      toast('✉ Demande de commande prête dans ton mail');
    });
    renderOrders();
  })();

  /* Bulle d'aide flottante (R26-A) */
  (function initHelp() {
    const toggle = $('#helpToggle'), pop = $('#helpPop');
    if (!toggle || !pop) return;
    const setOpen = open => { pop.hidden = !open; toggle.setAttribute('aria-expanded', String(open)); $('#helpBubble').classList.toggle('open', open); };
    toggle.addEventListener('click', () => setOpen(pop.hidden));
    document.addEventListener('click', e => { if (!e.target.closest('#helpBubble')) setOpen(false); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') setOpen(false); });
  })();

  /* R38-4 : count-up doux des KPI du Smartboard (rendus dynamiquement ci-dessus).
     L'utilitaire (script.js) n'anime que le nœud texte → flèches .kpi-delta
     intactes ; reduced-motion → valeur finale directe. */
  if (S && S.countUp) S.countUp(document);
})();
