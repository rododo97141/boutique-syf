/* ============================================================
   tools/qa/clics.mjs — LOT E/3 bis — ON CLIQUE, ENFIN
   ------------------------------------------------------------
   `muets.mjs` s'arrête à la porte et le dit dans son en-tête : il ne
   clique pas. Il rend des CANDIDATS — 36 « aucun écouteur propre » —
   dont une part est servie par un écouteur DÉLÉGUÉ sur `document`.
   Un candidat n'est pas un verdict. Cet outil clique.

   « Mesurer le RÉSULTAT, jamais le câblage. » (tools/qa/README §1)
   Ici le câblage, c'est justement ce que muets.mjs regardait.

   DEUX MOYENS INDÉPENDANTS, exigés par la gouvernance R93 :

   MOYEN 1 — L'ÉTAT DU DOCUMENT. Un MutationObserver posé avant le clic
   compte les mutations réelles de l'arbre ; on relève en plus l'URL, le
   localStorage, la position de défilement et le nombre de `.modal.open`.
   Il voit ce qui change dans le document.

   MOYEN 2 — LE PIXEL PEINT. Capture du viewport avant et après, comparée
   octet par octet. Il voit ce que voit l'œil, et il est aveugle à ce que
   le moyen 1 regarde : un état interne sans peinture ne le bouge pas, une
   peinture sans mutation (défilement natif) ne bouge pas le moyen 1.
   `prefers-reduced-motion` est émulé et les animations résiduelles sont
   figées à t=0 des DEUX côtés, sinon la brume et l'anneau du bouton
   principal feraient différer deux captures d'une page immobile — bruit
   pris pour un signal, exactement le piège de R93/1.

   VERDICT :
     RÉPOND  — au moins un des deux moyens bouge
     MUET    — les deux sont immobiles

   ⚠ CE QU'IL NE SAIT PAS FAIRE : dire si l'effet est le BON effet. Un
   filtre déjà actif recliqué ne change rien et se déclarera muet à
   raison ; c'est à la lecture de trancher. Chaque « MUET » est donc une
   ligne à instruire, pas une condamnation.

   Usage : node tools/qa/clics.mjs [page] [--frais] [--garder]
     --frais   ne pose PAS `syfir-portal` : visiteur de première fois
               (c'est le seul état où le Portail existe).
     --garder  conserve les captures de chaque essai dans out/clics/.
============================================================ */
import { serve, browser, PAGES, VIEWPORTS, BASE, ensureOut } from './lib.mjs';
import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const args = process.argv.slice(2);
const seule = args.find(a => !a.startsWith('--'));
const frais = args.includes('--frais');
const garder = args.includes('--garder');
const pages = seule ? [seule] : PAGES;

/* Le même recensement que muets.mjs, à l'identique, pour que les deux
   outils parlent des mêmes éléments dans le même ordre. Un décalage
   d'indice ici ferait cliquer un élément et en nommer un autre. */
const RECENSE = () => {
  const sig = el => el.tagName.toLowerCase()
    + (el.id ? '#' + el.id : '')
    + (typeof el.className === 'string' && el.className.trim() ? '.' + el.className.trim().split(/\s+/)[0] : '');
  const out = [];
  const cliquables = document.querySelectorAll('a, button, [role="button"], input[type="submit"]');
  for (const el of cliquables) {
    const cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden') continue;
    const txt = (el.textContent || el.value || el.getAttribute('aria-label') || '').trim().slice(0, 30);
    const href = el.getAttribute('href');
    const desactive = el.disabled || el.getAttribute('aria-disabled') === 'true';
    const propre = window.__clic && window.__clic.has(el);
    const inline = !!el.getAttribute('onclick') || !!el.getAttribute('onsubmit');
    const dansForm = !!el.closest('form') && (el.type === 'submit' || el.tagName === 'BUTTON');
    let motif = null;
    if (desactive) motif = 'DÉSACTIVÉ';
    else if (el.tagName === 'A') {
      if (href === null) motif = 'lien sans href';
      else if (href === '' || href === '#') motif = 'href vide ou « # »';
      else if (href.startsWith('#') && href.length > 1 && !document.querySelector(href)) motif = `ancre morte ${href}`;
    } else if (!propre && !inline && !dansForm) motif = 'aucun écouteur propre';
    if (motif) out.push({ sel: sig(el), txt, motif });
  }
  return out;
};

const ESPION = ({ seen }) => {
  try { if (seen) localStorage.setItem('syfir-portal', 'in'); } catch (e) {}
  window.__clic = new WeakSet();
  const ael = EventTarget.prototype.addEventListener;
  EventTarget.prototype.addEventListener = function (t, ...r) {
    if ((t === 'click' || t === 'pointerdown' || t === 'submit') && this instanceof Element
        && this !== document.body) window.__clic.add(this);
    return ael.call(this, t, ...r);
  };
};

const srv = await serve();
const b = await browser();
const dossier = garder ? ensureOut('clics') : null;
const rapport = [];

/* Prépare une page dans l'état de mesure : mouvement réduit, portail
   selon l'option, animations figées. */
async function prepare(ctx, url) {
  const pg = await ctx.newPage();
  await pg.addInitScript(ESPION, { seen: !frais });
  const rep = await pg.goto(`${BASE}/${url}`, { waitUntil: 'load' }).catch(() => null);
  if (!rep || rep.status() >= 400) { await pg.close(); return null; }
  await pg.waitForTimeout(1500);
  return pg;
}
const figer = pg => pg.evaluate(() => {
  document.getAnimations().forEach(a => { try { a.pause(); a.currentTime = 0; } catch (e) {} });
});

try {
  const ctx = await b.newContext({ viewport: VIEWPORTS.desktop, reducedMotion: 'reduce' });

  for (const p of pages) {
    const sonde = await prepare(ctx, p);
    if (!sonde) continue;
    await sonde.evaluate(() => scrollTo(0, document.body.scrollHeight));
    await sonde.waitForTimeout(700);
    const liste = await sonde.evaluate(RECENSE);
    await sonde.close();
    if (!liste.length) { rapport.push({ page: p, essais: [] }); continue; }

    const essais = [];
    for (let i = 0; i < liste.length; i++) {
      const cible = liste[i];
      const pg = await prepare(ctx, p);
      if (!pg) break;
      /* On refait le recensement dans CETTE page et on marque le i-ème :
         l'ordre du DOM est déterministe, l'indice désigne le même bouton. */
      const marque = await pg.evaluate(({ idx }) => {
        const els = [];
        // on rejoue le filtre de RECENSE en gardant les ÉLÉMENTS, pas leurs
        // signatures : c'est la seule façon de désigner le bon bouton.
        const sig = el => el.tagName.toLowerCase()
          + (el.id ? '#' + el.id : '')
          + (typeof el.className === 'string' && el.className.trim() ? '.' + el.className.trim().split(/\s+/)[0] : '');
        for (const el of document.querySelectorAll('a, button, [role="button"], input[type="submit"]')) {
          const cs = getComputedStyle(el);
          if (cs.display === 'none' || cs.visibility === 'hidden') continue;
          const href = el.getAttribute('href');
          const desactive = el.disabled || el.getAttribute('aria-disabled') === 'true';
          const propre = window.__clic && window.__clic.has(el);
          const inline = !!el.getAttribute('onclick') || !!el.getAttribute('onsubmit');
          const dansForm = !!el.closest('form') && (el.type === 'submit' || el.tagName === 'BUTTON');
          let motif = null;
          if (desactive) motif = 'D';
          else if (el.tagName === 'A') {
            if (href === null || href === '' || href === '#') motif = 'A';
            else if (href.startsWith('#') && href.length > 1 && !document.querySelector(href)) motif = 'A';
          } else if (!propre && !inline && !dansForm) motif = 'E';
          if (motif) els.push(el);
        }
        const el = els[idx];
        if (!el) return null;
        el.setAttribute('data-qa-clic', '1');
        el.scrollIntoView({ block: 'center' });
        return sig(el);
      }, { idx: i });

      if (!marque) { await pg.close(); continue; }
      await pg.waitForTimeout(300);
      await figer(pg);

      // --- état AVANT (moyen 1) + capture AVANT (moyen 2)
      const avant = await pg.evaluate(() => {
        window.__mut = 0;
        new MutationObserver(m => { window.__mut += m.length; })
          .observe(document.documentElement, { subtree: true, childList: true, attributes: true, characterData: true });
        const ls = {}; for (let k = 0; k < localStorage.length; k++) { const n = localStorage.key(k); ls[n] = localStorage.getItem(n); }
        return { url: location.href, ls: JSON.stringify(ls), y: Math.round(scrollY), modales: document.querySelectorAll('.modal.open').length };
      });
      const imgAvant = await pg.screenshot();

      // --- le clic
      let erreur = null;
      try {
        await pg.click('[data-qa-clic]', { timeout: 4000 });
      } catch (e) { erreur = 'clic impossible : ' + String(e.message).split('\n')[0].slice(0, 60); }
      await pg.waitForTimeout(900);
      await figer(pg).catch(() => {});

      // --- état APRÈS
      let apres = null, imgApres = null;
      try {
        apres = await pg.evaluate(() => {
          const ls = {}; for (let k = 0; k < localStorage.length; k++) { const n = localStorage.key(k); ls[n] = localStorage.getItem(n); }
          return { url: location.href, ls: JSON.stringify(ls), y: Math.round(scrollY), modales: document.querySelectorAll('.modal.open').length, mut: window.__mut || 0 };
        });
        imgApres = await pg.screenshot();
      } catch (e) { erreur = erreur || 'page partie : ' + String(e.message).slice(0, 50); }

      const m1 = apres ? {
        mut: apres.mut,
        url: apres.url !== avant.url,
        ls: apres.ls !== avant.ls,
        y: apres.y !== avant.y,
        modales: apres.modales !== avant.modales
      } : { mut: 0, url: true, ls: false, y: false, modales: false };   // navigation = la page est partie
      const m2 = imgApres ? !imgAvant.equals(imgApres) : true;
      const bouge1 = m1.mut > 0 || m1.url || m1.ls || m1.y || m1.modales;

      if (garder && (!bouge1 && !m2)) {
        writeFileSync(resolve(dossier, `${p.replace(/[^\w.-]/g, '_')}-${i}-avant.png`), imgAvant);
        if (imgApres) writeFileSync(resolve(dossier, `${p.replace(/[^\w.-]/g, '_')}-${i}-apres.png`), imgApres);
      }

      essais.push({ ...cible, sel: marque, m1, m2, bouge1, erreur });
      await pg.close();
    }
    rapport.push({ page: p, essais });
  }
} finally { await b.close(); srv.close(); }

/* ---------------------------------------------------------------- */
console.log(`\nON A CLIQUÉ.  ${frais ? '(visiteur de première fois — Portail actif)' : '(visite mémorisée)'}\n`);
let muets = 0, repond = 0;
for (const r of rapport) {
  if (!r.essais.length) { console.log(`  ${r.page.padEnd(38)} — aucun candidat`); continue; }
  console.log(`\n  ── ${r.page}`);
  for (const e of r.essais) {
    const preuves = [];
    if (e.m1.mut) preuves.push(`${e.m1.mut} mutation(s)`);
    if (e.m1.url) preuves.push('URL');
    if (e.m1.ls) preuves.push('localStorage');
    if (e.m1.y) preuves.push('défilement');
    if (e.m1.modales) preuves.push('modale');
    if (e.m2) preuves.push('pixels');
    const ok = e.bouge1 || e.m2;
    if (ok) repond++; else muets++;
    console.log(`     ${(ok ? '✓ RÉPOND' : '✗ MUET  ').padEnd(10)} ${e.sel.padEnd(30)} « ${e.txt} »${preuves.length ? '  → ' + preuves.join(' · ') : ''}${e.erreur ? '  ⚠ ' + e.erreur : ''}`);
  }
}
console.log(`\n  ${repond} répondent · ${muets} muets.`);
console.log('  Moyen 1 = état du document (mutations, URL, localStorage, défilement, modales).');
console.log('  Moyen 2 = pixels du viewport, mouvement réduit + animations figées des deux côtés.');
console.log('  ⚠ Un MUET peut être légitime (filtre déjà actif recliqué) : chaque ligne s\'instruit.\n');
