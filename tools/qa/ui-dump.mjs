/* ============================================================
   tools/qa/ui-dump.mjs <label>
   ------------------------------------------------------------
   Empreinte des styles CALCULÉS : 14 pages × 2 thèmes × 2 viewports
   = 56 combinaisons. Sert de référence de comparaison entre deux
   états du dépôt (cf. ui-diff-hors-index.mjs).

   Principe (piège R92 §4, corollaire) : on enregistre le RÉSULTAT
   rendu (couleurs, tailles, opacités effectives), jamais le câblage.

   Usage :  node tools/qa/ui-dump.mjs r93-00-baseline
   Sortie :  tools/qa/out/<label>.json
============================================================ */
import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { serve, browser, openPage, freezeAnimations, PAGES, THEMES, VIEWPORTS, ensureOut, OUT } from './lib.mjs';

const label = process.argv[2];
if (!label) { console.error('usage: node tools/qa/ui-dump.mjs <label>'); process.exit(1); }

/* Sélecteurs suivis : structure de page, composants partagés et
   surfaces sensibles au thème. On prend les 3 premiers de chaque. */
const SELECTORS = [
  'body', 'nav#nav', '.nav-logo', '.nav-link', '.nav-actions', '.nav-icon',
  'footer', '.footer-sante', '.footer-logo', '.footer-col a',
  '.h2', 'h1', '.eyebrow', '.section', '.section-intro',
  '.btn', '.btn-solid', '.btn-ghost', '.chip', '.card', '.event-card',
  '.hero', '.hero-title', '.hero-tagline', '.sky', '.sky-grade',
  '.theme-btn', '.modal-box', '.pill', '.badge-soon'
];

const PROPS = [
  'color', 'backgroundColor', 'backgroundImage', 'borderTopColor', 'borderTopWidth',
  'fontFamily', 'fontSize', 'fontWeight', 'letterSpacing', 'lineHeight',
  'opacity', 'display', 'position', 'paddingTop', 'paddingBottom',
  'marginTop', 'marginBottom', 'borderRadius', 'boxShadow', 'transform',
  'animationName', 'animationDuration', 'visibility', 'zIndex'
];

const srv = await serve();
const b = await browser();
const dump = { label, at: new Date().toISOString(), pages: {} };
let combos = 0;

for (const vpName of Object.keys(VIEWPORTS)) {
  const ctx = await b.newContext({ viewport: VIEWPORTS[vpName] });
  for (const theme of THEMES) {
    for (const url of PAGES) {
      const page = await openPage(ctx, url, { theme });
      await freezeAnimations(page);
      const data = await page.evaluate(({ sels, props }) => {
        const out = {};
        for (const sel of sels) {
          const els = [...document.querySelectorAll(sel)].slice(0, 3);
          els.forEach((el, i) => {
            const cs = getComputedStyle(el);
            const rec = {};
            for (const p of props) {
              // Quantification : le rendu sous-pixel varie d'un run à l'autre
              // sans qu'aucun style n'ait changé. On garde 2 décimales.
              rec[p] = String(cs[p]).replace(/-?\d+\.\d{3,}/g, m => (+m).toFixed(2));
            }
            const r = el.getBoundingClientRect();
            rec._box = [Math.round(r.width), Math.round(r.height)];
            out[`${sel}[${i}]`] = rec;
          });
        }
        return out;
      }, { sels: SELECTORS, props: PROPS });
      const key = `${url}|${theme}|${vpName}`;
      dump.pages[key] = { styles: data, jsErrors: page.qaErrors.slice(0, 5) };
      combos++;
      await page.close();
    }
  }
  await ctx.close();
}

await b.close();
srv.close();
ensureOut();
const file = resolve(OUT, `${label}.json`);
writeFileSync(file, JSON.stringify(dump, null, 1));
const errs = Object.entries(dump.pages).filter(([, v]) => v.jsErrors.length);
console.log(`dump « ${label} » : ${combos} combinaisons -> ${file}`);
console.log(errs.length ? `⚠ erreurs JS sur ${errs.length} combinaison(s) : ${errs.slice(0, 5).map(([k]) => k).join(', ')}`
                        : '✓ zéro erreur JS sur les 56 combinaisons');
