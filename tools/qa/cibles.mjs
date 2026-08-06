/* ============================================================
   tools/qa/cibles.mjs — LES CIBLES TACTILES, MESURÉES AU RENDU
   ------------------------------------------------------------
   `CLAUDE.md` §2.5 : cibles tactiles **≥ 44px**. La règle existe depuis
   toujours et n'a jamais eu son instrument : elle était tenue par un bloc
   de CSS écrit à la main (`@media (max-width: 639px)`, « Cibles tactiles
   ≥ 44px »), c'est-à-dire par une LISTE DE SÉLECTEURS.

   Or « on ne compare que ce qu'on sait nommer » : tout composant né après
   ce bloc en est absent, et personne ne s'en aperçoit. C'est comme ça que
   `.ticket-share` — le bouton « Partager » d'un billet — est resté à
   34 px : il n'est dans aucune ligne de la liste.

   La mesure ne lit donc AUCUN sélecteur. Elle prend tous les éléments
   réellement cliquables, à 390 px, et mesure la boîte PEINTE.

   TROIS PRÉCAUTIONS, chacune apprise d'un faux positif possible :

   1. LES ÉLÉMENTS CACHÉS NE COMPTENT PAS — mais « caché » se mesure
      (display, visibility, opacité, boîte nulle), pas se devine.
   2. UN LIEN DANS UNE PHRASE N'EST PAS UNE CIBLE TACTILE. La norme
      (WCAG 2.5.8) exempte explicitement le lien en flux de texte : lui
      imposer 44 px de haut casserait l'interligne du paragraphe. On
      détecte le cas par la mise en forme réelle (`display: inline`) et
      on le range à part, compté et nommé, jamais silencieusement ignoré.
   3. LES CONTENUS DE MODALE ne sont mesurables que modale OUVERTE. On
      ouvre donc « Mon espace » et le tunnel billets avant de mesurer :
      sans ça, tout ce qui vit dans une modale sort du périmètre sans
      qu'aucune ligne du rapport ne le dise.

   Usage : node tools/qa/cibles.mjs [page]
============================================================ */
import { serve, browser, PAGES, BASE } from './lib.mjs';

const seule = process.argv.slice(2).find(a => !a.startsWith('--'));
const pages = seule ? [seule] : PAGES;
const MIN = 44;

const srv = await serve();
const b = await browser();
const rapport = [];

try {
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
  await ctx.addInitScript(() => {
    try {
      localStorage.setItem('syfir-portal', 'in');
      // un billet pour que le contenu de « Mes billets » existe et se mesure
      localStorage.setItem('syfir-tickets', JSON.stringify([{
        id: 'demo-rooftop-1', event: 'Rooftop Sunset Session', city: 'Pointe-à-Pitre',
        date: '2027-08-22', detail: '1× Entrée', num: 'SYF-CIBLES-001'
      }]));
    } catch (e) {}
  });

  for (const p of pages) {
    const pg = await ctx.newPage();
    const rep = await pg.goto(`${BASE}/${p}`, { waitUntil: 'load' }).catch(() => null);
    if (!rep || rep.status() >= 400) { await pg.close(); continue; }
    await pg.waitForTimeout(1400);
    await pg.evaluate(() => scrollTo(0, document.body.scrollHeight));
    await pg.waitForTimeout(700);
    await pg.evaluate(() => scrollTo(0, 0));
    await pg.waitForTimeout(300);

    // les modales, sinon leur contenu n'est jamais mesuré
    await pg.evaluate(() => {
      document.querySelector('#clientSpaceBtn')?.click();
      document.querySelector('[data-tickets]')?.click();
    });
    await pg.waitForTimeout(900);

    const r = await pg.evaluate(min => {
      const sig = el => el.tagName.toLowerCase()
        + (el.id ? '#' + el.id : '')
        + (typeof el.className === 'string' && el.className.trim() ? '.' + el.className.trim().split(/\s+/).join('.') : '');
      const petits = [], enLigne = [], portes = [];
      /* LA CIBLE EFFECTIVE. Un champ de formulaire n'est pas toujours sa
         propre cible : `#eventSearch` mesure 290×16 parce que c'est son
         ENVELOPPE `.ticket-search` (359×43) qui porte le rembourrage, la
         bordure et le rond — on touche l'enveloppe, pas le champ. Idem
         pour une case à cocher enveloppée dans son `<label>`, dont le CSS
         du dépôt dit explicitement « la cible réelle est le label
         englobant ». Accuser le champ serait accuser ce qui marche, et un
         instrument qui fait ça se fait ignorer aussi sûrement qu'un
         instrument qui laisse passer. On remonte donc de deux niveaux au
         plus, et on retient l'ancêtre qui CONTIENT l'élément et qui est
         lui-même assez grand. */
      const cibleEffective = (el, b, min) => {
        let p = el.parentElement;
        for (let i = 0; i < 2 && p; i++, p = p.parentElement) {
          const pb = p.getBoundingClientRect();
          const contient = pb.top <= b.top + 1 && pb.bottom >= b.bottom - 1
                        && pb.left <= b.left + 1 && pb.right >= b.right - 1;
          if (contient && pb.height >= min && pb.width >= min) return p;
        }
        return null;
      };
      const sel = 'a[href], button, [role="button"], input:not([type="hidden"]), select, textarea, summary';
      for (const el of document.querySelectorAll(sel)) {
        const cs = getComputedStyle(el);
        if (cs.display === 'none' || cs.visibility === 'hidden' || +cs.opacity === 0) continue;
        if (cs.pointerEvents === 'none') continue;
        const b = el.getBoundingClientRect();
        if (b.width === 0 || b.height === 0) continue;
        // un ancêtre replié / hors écran
        if (el.closest('[hidden], [inert], [aria-hidden="true"]')) continue;
        const h = Math.round(b.height * 10) / 10, w = Math.round(b.width * 10) / 10;
        if (h >= min && w >= min) continue;
        const rec = { sel: sig(el).slice(0, 52), txt: (el.textContent || el.value || el.getAttribute('aria-label') || '').trim().slice(0, 26), w, h };
        // WCAG 2.5.8 : exception explicite du lien en flux de texte
        if (el.tagName === 'A' && cs.display === 'inline') { enLigne.push(rec); continue; }
        // un champ dont l'enveloppe est la vraie cible
        if (/^(INPUT|SELECT|TEXTAREA)$/.test(el.tagName)) {
          const env = cibleEffective(el, b, min);
          if (env) { portes.push({ ...rec, par: sig(env).slice(0, 40) }); continue; }
        }
        petits.push(rec);
      }
      return { petits, enLigne, portes };
    }, MIN);

    rapport.push({ page: p, ...r });
    await pg.close();
  }
} finally { await b.close(); srv.close(); }

console.log(`\nCIBLES TACTILES À 390 px — seuil ${MIN} px (CLAUDE.md §2.5)\n`);
let total = 0, exempts = 0, portes = 0;
const vus = new Set();
for (const r of rapport) {
  exempts += r.enLigne.length;
  portes += r.portes.length;
  if (!r.petits.length) { console.log(`  ${r.page.padEnd(38)} ✓ aucune`); continue; }
  console.log(`\n  ── ${r.page}   (${r.petits.length})`);
  for (const e of r.petits) {
    total++; vus.add(e.sel);
    console.log(`     ${String(e.w).padStart(6)} × ${String(e.h).padEnd(6)} ${e.sel.padEnd(52)} « ${e.txt} »`);
  }
}
console.log(`\n  ${total} cible(s) sous ${MIN} px · ${vus.size} sélecteur(s) distinct(s).`);
console.log(`  ${exempts} lien(s) en flux de texte exclus — exception explicite de WCAG 2.5.8.`);
console.log(`  ${portes} champ(s) exclus parce que leur ENVELOPPE fait la cible (≥ ${MIN} px).`);
console.log('  Les deux exclusions sont comptées et nommées : une exclusion silencieuse');
console.log('  est indiscernable d\'un angle mort.\n');
process.exit(total ? 1 : 0);
