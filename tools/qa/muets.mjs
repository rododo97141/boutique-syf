/* ============================================================
   tools/qa/muets.mjs — LOT E/3 — LA CHASSE AUX BOUTONS MUETS
   ------------------------------------------------------------
   La méthode de la chasse aux survivants, appliquée à L'INTERACTION au
   lieu du style : on ne cherche plus ce qui est peint sans être nommé,
   mais ce qui SE CLIQUE SANS RIEN FAIRE.

   « Un bouton qui ne fait rien pendant une démonstration coûte plus cher
   qu'un bouton absent. »

   MOYEN 1 — L'INTENTION DÉCLARÉE : `disabled`, `aria-disabled`,
   `href="#"`, `href` vide, `<a>` sans href, ancre dont la cible n'existe
   pas dans la page.
   MOYEN 2 — LE CÂBLAGE RÉEL : `addEventListener` est remplacé AVANT tout
   script, et on note quel élément reçoit un écouteur `click`. Un élément
   sans écouteur propre, sans href utile et sans `onclick` est muet —
   SAUF si un ancêtre porte un écouteur délégué, cas qu'on compte à part
   parce qu'il rend le verdict incertain, pas faux.

   ⚠ CE QU'IL NE SAIT PAS FAIRE, et il faut le dire : il ne clique pas.
   Un élément câblé dont le gestionnaire ne fait rien d'utile passera pour
   répondant. Le second moyen reste l'essai à la main.

   Usage : node tools/qa/muets.mjs [page]
============================================================ */
import { serve, browser, PAGES, VIEWPORTS, BASE } from './lib.mjs';

const seule = process.argv.slice(2).find(a => !a.startsWith('--'));
const pages = seule ? [seule] : PAGES;
const srv = await serve();
const b = await browser();
const tout = [];

try {
  const ctx = await b.newContext({ viewport: VIEWPORTS.desktop });
  for (const p of pages) {
    const pg = await ctx.newPage();
    await pg.addInitScript(() => {
      try { localStorage.setItem('syfir-portal', 'in'); } catch (e) {}
      window.__clic = new WeakSet(); window.__delegue = [];
      const ael = EventTarget.prototype.addEventListener;
      EventTarget.prototype.addEventListener = function (t, ...r) {
        if (t === 'click' || t === 'pointerdown' || t === 'submit') {
          if (this === document || this === document.body || this === window) window.__delegue.push(t);
          else if (this instanceof Element) window.__clic.add(this);
        }
        return ael.call(this, t, ...r);
      };
    });
    const rep = await pg.goto(`${BASE}/${p}`, { waitUntil: 'load' }).catch(() => null);
    if (!rep || rep.status() >= 400) { await pg.close(); continue; }
    await pg.waitForTimeout(1600);
    await pg.evaluate(() => scrollTo(0, document.body.scrollHeight));
    await pg.waitForTimeout(900);

    const r = await pg.evaluate(() => {
      const sig = el => el.tagName.toLowerCase()
        + (el.id ? '#' + el.id : '')
        + (typeof el.className === 'string' && el.className.trim() ? '.' + el.className.trim().split(/\s+/)[0] : '');
      const out = [];
      /* ⚠ `summary` EXCLU — faux positif mesuré au premier passage. Un
         <summary> ouvre son <details> par comportement NATIF du
         navigateur : il n'a besoin d'aucun écouteur, et l'outil en
         rapportait sept sur faq.html comme « muets » alors qu'ils
         répondent parfaitement. Un instrument qui accuse ce qui marche
         se fait ignorer aussi sûrement qu'un instrument qui laisse
         passer ce qui est cassé. */
      const cliquables = document.querySelectorAll('a, button, [role="button"], input[type="submit"]');
      for (const el of cliquables) {
        const cs = getComputedStyle(el);
        if (cs.display === 'none' || cs.visibility === 'hidden') continue;
        const txt = (el.textContent || el.value || el.getAttribute('aria-label') || '').trim().slice(0, 34);
        const href = el.getAttribute('href');
        const desactive = el.disabled || el.getAttribute('aria-disabled') === 'true';
        const propre = window.__clic.has(el);
        const inline = !!el.getAttribute('onclick') || !!el.getAttribute('onsubmit');
        const dansForm = !!el.closest('form') && (el.type === 'submit' || el.tagName === 'BUTTON');
        let motif = null;
        if (desactive) motif = 'DÉSACTIVÉ';
        else if (el.tagName === 'A') {
          if (href === null) motif = 'lien sans href';
          else if (href === '' || href === '#') motif = 'href vide ou « # »';
          else if (href.startsWith('#') && href.length > 1 && !document.querySelector(href)) motif = `ancre morte ${href}`;
        } else if (!propre && !inline && !dansForm) motif = 'aucun écouteur propre';
        if (motif) out.push({ sel: sig(el), txt, motif, href: href || '' });
      }
      return { out, delegue: window.__delegue.length };
    });
    tout.push({ page: p, ...r });
    await pg.close();
  }
} finally { await b.close(); srv.close(); }

console.log('\nLES ÉLÉMENTS QUI SE CLIQUENT SANS RIEN FAIRE\n');
let n = 0;
for (const t of tout) {
  if (!t.out.length) { console.log(`  ${t.page.padEnd(38)} ✓ aucun`); continue; }
  console.log(`\n  ── ${t.page}   (${t.out.length}) · ${t.delegue} écouteur(s) délégué(s) sur document/body`);
  for (const e of t.out) { n++; console.log(`     ${e.motif.padEnd(22)} ${e.sel.padEnd(34)} « ${e.txt} »`); }
}
console.log(`\nTOTAL : ${n} élément(s) sur ${tout.length} page(s).`);
console.log('⚠ Un écouteur DÉLÉGUÉ sur document peut répondre pour un enfant sans');
console.log('  écouteur propre : les « aucun écouteur propre » sont des CANDIDATS,');
console.log('  à confirmer au clic. Les « DÉSACTIVÉ » et « href vide », eux, sont sûrs.\n');
