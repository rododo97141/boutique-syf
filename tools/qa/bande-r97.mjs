/* ============================================================
   tools/qa/bande-r97.mjs <nom-variante>
   ------------------------------------------------------------
   TEMPORAIRE — outil de comparaison pour la décision R97.
   Capture l'accueil aux MÊMES positions de défilement dans les deux
   thèmes, puis assemble une bande par thème.

   Les positions 28 à 83 % sont celles qui comptent : c'est là que les
   deux horloges divergent aujourd'hui.

   La page GRANDIT en descendant : on ne calcule jamais sa hauteur une
   seule fois — on descend progressivement AVANT de viser une position,
   puis on réancre. Sinon « 50 % » ne désigne pas le même endroit d'une
   variante à l'autre, et la comparaison ne compare rien.
============================================================ */
import { serve, browser, openPage, VIEWPORTS, ensureOut, OUT } from './lib.mjs';
import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const args = process.argv.slice(2);
const nom = args[0];
const vi = args.indexOf('--variante');
const variante = vi >= 0 && args[vi + 1] ? args[vi + 1] : '';
if (!nom) { console.error('usage: node tools/qa/bande-r97.mjs <nom-variante>'); process.exit(1); }
const POSITIONS = [0, 0.15, 0.28, 0.40, 0.55, 0.70, 0.75, 0.83, 0.90, 1];

const srv = await serve();
const b = await browser();
const dossier = ensureOut('comparaison-r97');

for (const theme of ['light', 'dark']) {
  const ctx = await b.newContext({ viewport: VIEWPORTS.desktop });
  const page = await ctx.newPage();
  if (variante) await page.addInitScript(v => { try { localStorage.setItem('syfir-r97', v); } catch (e) {} }, variante);
  await page.addInitScript(t => { try { localStorage.setItem('syfir-theme', t); localStorage.setItem('syfir-portal', 'in'); } catch (e) {} }, theme);
  await page.goto(`http://127.0.0.1:${process.env.QA_PORT || 8099}/index.html`, { waitUntil: 'load' });
  await page.waitForTimeout(900);
  await page.evaluate(() => document.querySelectorAll('.reveal').forEach(e => e.classList.add('in')));
  // la page doit avoir atteint sa vraie hauteur avant qu'un pourcentage ait un sens
  await page.evaluate(async () => {
    let last = -1, st = 0;
    for (let i = 0; i < 300; i++) {
      window.scrollBy(0, 700);
      await new Promise(r => setTimeout(r, 35));
      const h = document.documentElement.scrollHeight;
      if (h === last) st++; else { st = 0; last = h; }
      const m = h - innerHeight;
      if (m > 0 && window.scrollY / m >= 0.995 && st >= 3) break;
    }
  });
  await page.waitForTimeout(600);
  const H = await page.evaluate(() => document.documentElement.scrollHeight - innerHeight);

  const vignettes = [];
  for (const p of POSITIONS) {
    await page.evaluate(y => window.scrollTo(0, y), Math.round(H * p));
    await page.waitForTimeout(700);          // le verre a 300 ms de transition
    vignettes.push({ p, b64: (await page.screenshot()).toString('base64') });
  }

  // assemblage : une ligne de vignettes, pourcentage écrit sur chacune
  const dec = await ctx.newPage();
  await dec.goto('about:blank');
  const png = await dec.evaluate(async ({ list, titre }) => {
    const W = 300, H2 = 188, pad = 8, head = 26;
    const c = document.createElement('canvas');
    c.width = list.length * (W + pad) + pad;
    c.height = head + H2 + pad * 2;
    const g = c.getContext('2d');
    g.fillStyle = '#111'; g.fillRect(0, 0, c.width, c.height);
    g.fillStyle = '#FAF8F2';
    g.font = '600 15px system-ui, sans-serif';
    g.fillText(titre, pad, 18);
    for (let i = 0; i < list.length; i++) {
      const im = new Image();
      im.src = 'data:image/png;base64,' + list[i].b64;
      await im.decode();
      const x = pad + i * (W + pad), y = head + pad;
      g.drawImage(im, x, y, W, H2);
      g.strokeStyle = 'rgba(250,248,242,.35)'; g.lineWidth = 1;
      g.strokeRect(x + .5, y + .5, W - 1, H2 - 1);
      g.fillStyle = 'rgba(17,17,17,.78)'; g.fillRect(x, y, 54, 20);
      g.fillStyle = '#FAF8F2'; g.font = '600 13px system-ui, sans-serif';
      g.fillText(Math.round(list[i].p * 100) + ' %', x + 6, y + 15);
    }
    return c.toDataURL('image/png').split(',')[1];
  }, { list: vignettes, titre: `${nom} — thème ${theme}` });

  const f = resolve(dossier, `${nom}-${theme}.png`);
  writeFileSync(f, Buffer.from(png, 'base64'));
  console.log(`bande écrite : ${f}`);
  await ctx.close();
}
await b.close();
srv.close();
