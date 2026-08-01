/* ============================================================
   tools/qa/debordement.mjs [page] [--large]
   ------------------------------------------------------------
   LE DÉBORDEMENT HORIZONTAL À 390 px — risque numéro un du plein cadre.

   Règle du dépôt : mobile 390 px sans débordement horizontal. La refonte
   « Lumière de scène » multiplie les occasions de le violer — sections
   photo en pleine largeur qui débordent du conteneur, hero en 100svh,
   grilles bord à bord. Le superviseur a demandé de le mesurer à CHAQUE
   étape, pas seulement à la fin.

   CE QU'ON MESURE, ET POURQUOI PAS scrollWidth SEUL. `documentElement
   .scrollWidth > clientWidth` dit QU'IL Y A un débordement, jamais D'OÙ
   il vient — et sur une page de 900 éléments, c'est une aiguille dans une
   botte de foin. On descend donc toute la page et on relève chaque
   élément dont la boîte dépasse le bord droit du viewport, avec son
   débordement en pixels.

   ⚠ L'ACCUEIL GRANDIT PENDANT QU'ON LE MESURE (piège R92 §4B) : les
   sections `content-visibility: auto` ne déclarent leur vraie hauteur
   qu'en approchant du viewport. On utilise donc scrollToBottom() de
   lib.mjs — descente progressive PUIS réancrage — et non une hauteur
   mesurée une seule fois, qui n'atteint jamais le bas.

   Les éléments volontairement hors cadre (décor en position fixe,
   marquee) sont EXCLUS NOMMÉMENT, jamais par un seuil de tolérance : un
   seuil masquerait aussi les vrais défauts.
============================================================ */
import { serve, browser, openPage, scrollToBottom, VIEWPORTS } from './lib.mjs';

const args = process.argv.slice(2);
const page = args.find(a => !a.startsWith('--')) || 'index.html';
const vp = args.includes('--large') ? VIEWPORTS.desktop : VIEWPORTS.mobile;

const srv = await serve();
const b = await browser();
let code = 0;
try {
  const ctx = await b.newContext({ viewport: vp });
  const pg = await openPage(ctx, page);
  await scrollToBottom(pg);
  await pg.evaluate(() => scrollTo(0, 0));
  await pg.waitForTimeout(300);

  const r = await pg.evaluate(() => {
    const W = document.documentElement.clientWidth;
    /* Décor volontairement plus large que le cadre, et qui ne peut PAS
       créer de barre de défilement : couches fixes (le ciel, les
       faisceaux, la brume) et bandeau défilant, tous en overflow hidden
       ou pointer-events: none. Exclus nommément — jamais par tolérance. */
    /* ⚠ 9e CALIBRATION DE CE HARNAIS. La première version comptait les
       diapositives INACTIVES du carrousel du hero (.hh-slide, .hh-bg,
       posées à droite en attendant leur tour) : 46 « débordements »
       annoncés, zéro réel. Un élément clippé par un ancêtre en
       overflow hidden/clip/auto/scroll NE PEUT PAS élargir la page —
       c'est une propriété du modèle de rendu, pas une tolérance.
       On remonte donc la chaîne d'ancêtres. Sans ça l'outil hurle en
       permanence, et un outil qui hurle toujours n'est plus lu. */
    const clippe = el => {
      for (let p = el.parentElement; p && p !== document.documentElement; p = p.parentElement) {
        const o = getComputedStyle(p);
        if (/hidden|clip|auto|scroll/.test(o.overflowX)) return true;
      }
      return false;
    };
    const permis = el =>
      el.closest('.sky, .ambience, .marquee, .beams, .haze, .portal') !== null ||
      getComputedStyle(el).position === 'fixed' ||
      clippe(el);

    const cas = [];
    for (const el of document.querySelectorAll('body *')) {
      const b = el.getBoundingClientRect();
      if (b.width === 0 && b.height === 0) continue;
      const trop = Math.max(b.right - W, -b.left);
      if (trop > 0.5 && !permis(el)) {
        cas.push({
          sel: el.tagName.toLowerCase() + (el.className && typeof el.className === 'string'
            ? '.' + el.className.trim().split(/\s+/).slice(0, 2).join('.') : ''),
          trop: +trop.toFixed(1), gauche: +b.left.toFixed(1), droite: +b.right.toFixed(1),
        });
      }
    }
    return {
      W,
      scrollWidth: document.documentElement.scrollWidth,
      barre: document.documentElement.scrollWidth > W,
      cas: cas.sort((a, z) => z.trop - a.trop).slice(0, 15),
      total: cas.length,
    };
  });

  console.log(`\nDÉBORDEMENT — ${page} à ${vp.width} px\n`);
  console.log(`  largeur du cadre : ${r.W} px · scrollWidth : ${r.scrollWidth} px`);
  console.log(`  barre de défilement horizontale : ${r.barre ? '✗ OUI' : '✓ non'}`);
  console.log(`  éléments qui dépassent : ${r.total}`);
  for (const c of r.cas) console.log(`    ${String(c.trop).padStart(7)} px  ${c.sel}  [${c.gauche} → ${c.droite}]`);
  if (r.total > r.cas.length) console.log(`    … et ${r.total - r.cas.length} de plus`);
  console.log('');
  code = (r.barre || r.total) ? 1 : 0;
  console.log(code ? '✗ débordement horizontal.\n' : '✓ aucun débordement horizontal.\n');
} finally {
  await b.close(); srv.close();
}
process.exit(code);
