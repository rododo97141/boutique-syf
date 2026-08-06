/* ============================================================
   tools/qa/recalc.mjs — CE QUE COÛTE UN DÉFILEMENT
   ------------------------------------------------------------
   L'ANGLE MORT QUI A GELÉ LE NAVIGATEUR DEUX FOIS.

   Aucun instrument de ce harnais ne mesurait le coût de RECALCUL. Le
   contraste, le débordement, les cibles tactiles et l'INP regardent tous
   la page à un INSTANT donné, ou une interaction ponctuelle. Or les deux
   motifs qui ont arrêté le moteur de rendu le 04/08 ne se voient qu'en
   DÉFILANT :

     · une propriété dépendant de `--p` sur un pseudo-élément plein écran
       — `--p` est réécrite à chaque image, deux dégradés radiaux repeints
       60 fois par seconde sur un calque non promu arrêtent le moteur ;
     · un sélecteur universel (`.page-home *:focus-visible`) — tout le
       document entre dans l'ensemble candidat et le recalcul de style
       repart en boucle.

   Les deux sont CORRECTS au sens du CSS : ils produisent exactement
   l'effet demandé. C'est leur coût qui est fautif, et un coût ne se lit
   pas dans une capture.

   CE QU'IL MESURE, par deux moyens indépendants :

   MOYEN 1 — LES COMPTEURS DU MOTEUR (CDP `Performance.getMetrics`) :
     `RecalcStyleDuration`, `LayoutDuration`, `ScriptDuration`, relevés
     AVANT et APRÈS un défilement continu. On rapporte la différence,
     c'est-à-dire ce que le défilement a réellement coûté.

   MOYEN 2 — LES IMAGES PERDUES : la durée réelle entre deux images est
     échantillonnée pendant le même défilement. Une image au-delà de
     **50 ms** est une saccade visible ; au-delà de **250 ms**, l'interface
     est ressentie comme figée. Ce moyen ignore complètement d'où vient le
     coût — il ne voit que le résultat, ce qui est exactement le point.

   Le processeur est bridé ×4, comme `lcp.mjs` et `inp.mjs` : sur la
   machine de l'atelier tout passe, et la mesure ne dirait rien du
   téléphone de quelqu'un.

   ⚠ CE QU'IL NE FAIT PAS : désigner le coupable. Il dit qu'une page coûte
   cher à défiler, pas quelle règle en est la cause. Quand il rougit, les
   deux motifs ci-dessus sont les premiers suspects — et `--verifie` les
   cherche par lecture du CSS, ce qui est un troisième moyen, statique.

   Usage : node tools/qa/recalc.mjs [page…] [--verifie]
============================================================ */
import { serve, browser, BASE, ROOT } from './lib.mjs';
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

const args = process.argv.slice(2);
const verifie = args.includes('--verifie');
const pages = args.filter(a => !a.startsWith('--'));
const CIBLES = pages.length ? pages
  : ['index.html', 'evenements.html', 'syf-tv.html', 'artistes.html', 'partenaires.html'];

const CPU = 4;
const SEUIL_SACCADE = 50;    // ms — image visiblement perdue
const SEUIL_FIGE = 250;      // ms — interface ressentie comme bloquée
const SEUIL_RECALC = 1500;   // ms cumulés de style+layout sur ~5 s de défilement

/* ---------- MOYEN 3, statique : les deux motifs, cherchés dans le CSS ---------- */
function lecturesInterdites() {
  const out = [];
  for (const f of ['style.css', 'syfir-ui/components.css', 'syfir-ui/tokens.css']) {
    const p = resolve(ROOT, f);
    if (!existsSync(p)) continue;
    const src = readFileSync(p, 'utf8');
    const lignes = src.split('\n');

    /* 1. un bloc de pseudo-élément qui lit --p. On délimite le bloc par
       ses accolades plutôt que par un nombre de lignes fixe : un bloc long
       passerait sous le radar d'une fenêtre arbitraire. */
    for (let i = 0; i < lignes.length; i++) {
      if (!/::(before|after)\b/.test(lignes[i]) || !lignes[i].includes('{')) continue;
      let prof = 0, corps = '';
      for (let j = i; j < lignes.length && j < i + 60; j++) {
        corps += lignes[j] + '\n';
        prof += (lignes[j].match(/{/g) || []).length - (lignes[j].match(/}/g) || []).length;
        if (prof <= 0 && j > i) break;
      }
      if (/var\(\s*--p\s*[),]/.test(corps)) {
        out.push({ fichier: f, ligne: i + 1, motif: 'pseudo-élément qui lit --p', extrait: lignes[i].trim().slice(0, 70) });
      }
    }

    /* 2. sélecteur universel PORTANT UN ÉTAT. Le reset
       `*, *::before, *::after { box-sizing }` est exclu nommément : il ne
       porte aucun état et ne se réévalue jamais. Exclure « les étoiles »
       en bloc aurait rendu ce contrôle inutile. */
    lignes.forEach((l, i) => {
      if (!/\*/.test(l) || !l.includes('{')) return;
      const sel = l.split('{')[0];
      if (/box-sizing/.test(l)) return;
      if (/\*\s*:(focus|hover|active|target|checked)/.test(sel) || /\s\*\s*[,{]/.test(sel)) {
        out.push({ fichier: f, ligne: i + 1, motif: 'sélecteur universel portant un état', extrait: sel.trim().slice(0, 70) });
      }
    });
  }
  return out;
}

const srv = await serve();
const b = await browser();
const rapport = [];

try {
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 } });
  await ctx.addInitScript(() => { try { localStorage.setItem('syfir-portal', 'in'); } catch (e) {} });

  for (const p of CIBLES) {
    const pg = await ctx.newPage();
    const cdp = await ctx.newCDPSession(pg);
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: CPU });
    await cdp.send('Performance.enable');

    const rep = await pg.goto(`${BASE}/${p}`, { waitUntil: 'load' }).catch(() => null);
    if (!rep) { await pg.close(); continue; }
    await pg.waitForTimeout(1800);

    const lire = async () => {
      const { metrics } = await cdp.send('Performance.getMetrics');
      const g = n => (metrics.find(m => m.name === n) || { value: 0 }).value * 1000;  // s → ms
      return { style: g('RecalcStyleDuration'), layout: g('LayoutDuration'), script: g('ScriptDuration') };
    };
    const avant = await lire();

    /* Le défilement doit être CONTINU et piloté par le temps, pas par un
       nombre de pas : c'est la boucle du ciel qu'on veut solliciter, et
       elle réagit à chaque image. */
    const images = await pg.evaluate(() => new Promise(res => {
      const t = []; let dernier = performance.now();
      const fin = dernier + 5000;
      const pas = Math.max(6, (document.documentElement.scrollHeight - innerHeight) / 300);
      (function boucle(now) {
        t.push(now - dernier); dernier = now;
        scrollBy(0, pas);
        if (now < fin) requestAnimationFrame(boucle); else res(t.slice(1));
      })(performance.now());
    }));

    const apres = await lire();
    const d = {
      style: +(apres.style - avant.style).toFixed(1),
      layout: +(apres.layout - avant.layout).toFixed(1),
      script: +(apres.script - avant.script).toFixed(1)
    };
    const saccades = images.filter(x => x > SEUIL_SACCADE).length;
    const figes = images.filter(x => x > SEUIL_FIGE).length;
    const pire = Math.round(Math.max(0, ...images));

    rapport.push({ page: p, d, images: images.length, saccades, figes, pire });
    await pg.close();
  }
} finally { await b.close(); srv.close(); }

console.log(`\nCE QUE COÛTE UN DÉFILEMENT  ·  390 px · CPU ×${CPU} · 5 s de défilement continu\n`);
let rouges = 0;
for (const r of rapport) {
  const recalc = r.d.style + r.d.layout;
  const ok = recalc < SEUIL_RECALC && r.figes === 0;
  if (!ok) rouges++;
  console.log(`  ${ok ? '✓' : '✗'} ${r.page.padEnd(20)} style ${String(r.d.style).padStart(7)} ms · layout ${String(r.d.layout).padStart(7)} ms · script ${String(r.d.script).padStart(7)} ms`);
  console.log(`     ${String(r.images).padStart(4)} images · ${r.saccades} saccade(s) > ${SEUIL_SACCADE} ms · ${r.figes} figée(s) > ${SEUIL_FIGE} ms · pire ${r.pire} ms`);
}
console.log(`\n  ${rapport.length - rouges}/${rapport.length} page(s) sous les seuils.`);
console.log(`  Moyen 1 = compteurs du moteur (recalcul de style + mise en page) pendant le défilement.`);
console.log(`  Moyen 2 = images réellement perdues — aveugle à la cause, ce qui est le but.`);

if (verifie) {
  const trouves = lecturesInterdites();
  console.log(`\n  MOYEN 3 (statique) — les deux motifs interdits, cherchés dans le CSS :`);
  if (!trouves.length) console.log('     ✓ aucun');
  for (const t of trouves) {
    rouges++;
    console.log(`     ✗ ${t.fichier}:${t.ligne}  ${t.motif}`);
    console.log(`        ${t.extrait}`);
  }
}
console.log('\n  ⚠ Il dit qu\'une page coûte cher à défiler, PAS quelle règle en est la cause.\n');
process.exit(rouges ? 1 : 0);
