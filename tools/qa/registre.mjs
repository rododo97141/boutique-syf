/* ============================================================
   tools/qa/registre.mjs — LOT A/2
   ------------------------------------------------------------
   LES 13 AUTRES PAGES N'ONT PAS DE MAQUETTE. Leur référence commune
   n'est donc pas une mise en page : c'est un VOCABULAIRE — les couleurs,
   les familles, les rayons et les durées de la nuit. Cet outil recense ce
   que chaque page utilise RÉELLEMENT, élément par élément, et le classe.

   POURQUOI IL EXISTE. `maquette.mjs` compare UNE page à UN fichier. Il ne
   sait rien dire des 13 autres. Or le seul défaut de registre qu'on ait
   trouvé jusqu'ici — le crème CHAUD du méga-menu, #FAF8F2 là où la nuit
   veut #EEF2F8 — a été vu à l'œil sur une capture, par un humain. Deux
   crèmes à quatre points d'écart : personne ne les distingue de mémoire,
   une machine ne les confond jamais.

   CE QU'IL MESURE : la valeur PEINTE, résolue par le navigateur. Pas les
   `var(--x)` écrits dans la feuille — leur RÉSULTAT. Une couleur codée en
   dur qui se trouve valoir #FF7A00 est comptée comme du sunset, même si
   aucun token n'a été invoqué : c'est ce que l'œil voit qui compte.

   CE QU'IL NE MESURE PAS, et il faut le dire (règle 1 de la passation) :
   · les images — une photo chaude n'est pas une faute de registre ;
   · la géométrie et le rythme — c'est le travail des lots D et suivants ;
   · les états au survol et au focus — ils demandent une passe par
     élément, hors périmètre de ce lot. LIMITE SIGNALÉE, DONC À TRAITER :
     elle a sa ligne dans le plan, pas seulement dans ce commentaire.

   Usage :
     node tools/qa/registre.mjs                 -> les 15 pages, résumé
     node tools/qa/registre.mjs --detail        -> + les coupables nommés
     node tools/qa/registre.mjs evenements.html -> une seule page
============================================================ */
import { serve, browser, PAGES, VIEWPORTS, BASE } from './lib.mjs';

/* ---- LES DEUX VOCABULAIRES, repris verbatim de syfir-ui/tokens.css ----
   Ils COEXISTENT volontairement depuis R98, et la distinction porte du
   sens : --gold #D4A017 est l'or de MARQUE (logo, liserés historiques),
   --or #E9C988 l'or de SCÈNE. --cream #FAF8F2 est le crème chaud de
   l'ancien monde d'été, --creme #EEF2F8 le crème froid de la nuit.
   Les confondre ferait de l'or de marque un éclairage. */
const NUIT = {
  '#04070f': '--nuit-0', '#060d1c': '--nuit-1', '#0a1226': '--nuit-2',
  '#2f6dff': '--bleu', '#7fb2ff': '--bleu-clair',
  '#e9c988': '--or', '#fffaf0': '--blanc', '#eef2f8': '--creme',
};
const ANCIEN = {
  '#ff7a00': '--sunset', '#ff9a3d': '--mango', '#ff8f70': '--coral',
  '#ffc857': '--passion', '#d4a017': '--gold', '#f0c84a': '--gold-light',
  '#b8860b': '--gold-deep', '#0f3d5e': '--ocean', '#071e30': '--ocean-deep',
  '#faf8f2': '--cream', '#111111': '--ink', '#1b1b1b': '--ink-soft',
  '#8a8a8a': '--grey',
};
/* Neutres assumés : ni nuit ni été. Le noir et le blanc purs, les gris de
   navigateur, les couleurs d'état. Les compter comme des fautes noierait
   le signal. */
const NEUTRES = new Set(['#000000', '#ffffff', '#e5484d', '#46a758']);

const args = process.argv.slice(2);
const detail = args.includes('--detail');
const seule = args.find(a => !a.startsWith('--'));
const pages = seule ? [seule] : PAGES;

const srv = await serve();
const b = await browser();
const total = { nuit: 0, ancien: 0, inconnu: 0 };
const parPage = [];
const coupables = new Map();   // token ancien -> compte global

try {
  const ctx = await b.newContext({ viewport: VIEWPORTS.desktop });
  for (const p of pages) {
    const pg = await ctx.newPage();
    await pg.addInitScript(() => { try { localStorage.setItem('syfir-portal', 'in'); } catch (e) {} });
    const rep = await pg.goto(`${BASE}/${p}`, { waitUntil: 'load' }).catch(() => null);
    if (!rep || rep.status() >= 400) { console.log(`  ${p.padEnd(38)} (absente)`); await pg.close(); continue; }
    await pg.waitForTimeout(1300);
    /* On descend la page : beaucoup de contenu n'existe qu'après un
       défilement (rendus différés, révélations). Mesurer en haut ne verrait
       qu'un tiers du vocabulaire — c'est l'erreur R105, corrigée. */
    await pg.evaluate(() => scrollTo(0, document.body.scrollHeight));
    await pg.waitForTimeout(900);
    await pg.evaluate(() => scrollTo(0, 0));
    await pg.waitForTimeout(400);

    const r = await pg.evaluate(({ NUIT, ANCIEN, NEUTRES }) => {
      const hex = (r, g, b) => '#' + [r, g, b].map(v =>
        Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('');
      /* Toutes les couleurs d'une valeur CSS : `rgb()`, `rgba()`, et
         celles noyées dans un dégradé ou une ombre. */
      const couleurs = (v) => {
        if (!v || v === 'none' || v === 'normal') return [];
        const out = [];
        for (const m of String(v).matchAll(/rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)(?:[,/\s]+([\d.%]+))?\s*\)/g)) {
          const a = m[4] === undefined ? 1 : (String(m[4]).endsWith('%') ? parseFloat(m[4]) / 100 : parseFloat(m[4]));
          if (a < 0.06) continue;          // invisible : ne compte pas
          out.push(hex(+m[1], +m[2], +m[3]));
        }
        return out;
      };
      const PROPS = ['color', 'backgroundColor', 'backgroundImage', 'boxShadow', 'textShadow',
        'borderTopColor', 'borderRightColor', 'borderBottomColor', 'borderLeftColor',
        'outlineColor', 'fill', 'stroke', 'textDecorationColor', 'caretColor'];
      const res = { nuit: 0, ancien: 0, inconnu: 0, parToken: {}, exemples: {}, inconnus: {} };
      const sig = el => el.tagName.toLowerCase()
        + (el.id ? '#' + el.id : '')
        + (typeof el.className === 'string' && el.className.trim()
          ? '.' + el.className.trim().split(/\s+/)[0] : '');
      for (const el of document.body.querySelectorAll('*')) {
        const cs = getComputedStyle(el);
        if (cs.display === 'none' || cs.visibility === 'hidden') continue;
        const vus = new Set();
        for (const prop of PROPS) {
          for (const h of couleurs(cs[prop])) {
            /* une même couleur comptée une seule fois par élément : sinon
               un bouton qui la répète en bordure, ombre et texte pèserait
               trois fois plus qu'un aplat de fond. */
            if (vus.has(h)) continue;
            vus.add(h);
            if (NEUTRES.includes(h)) continue;
            if (NUIT[h]) { res.nuit++; res.parToken[NUIT[h]] = (res.parToken[NUIT[h]] || 0) + 1; }
            else if (ANCIEN[h]) {
              res.ancien++;
              res.parToken[ANCIEN[h]] = (res.parToken[ANCIEN[h]] || 0) + 1;
              (res.exemples[ANCIEN[h]] ??= []).push(sig(el) + ' · ' + prop);
            } else {
              res.inconnu++;
              res.inconnus[h] = (res.inconnus[h] || 0) + 1;
            }
          }
        }
      }
      /* Les familles de police réellement utilisées, et les rayons. */
      const fams = {}, rayons = {};
      for (const el of document.body.querySelectorAll('*')) {
        const cs = getComputedStyle(el);
        if (cs.display === 'none') continue;
        const f = cs.fontFamily.split(',')[0].replace(/["']/g, '').trim();
        fams[f] = (fams[f] || 0) + 1;
        const rr = cs.borderRadius;
        if (rr && rr !== '0px') rayons[rr] = (rayons[rr] || 0) + 1;
      }
      res.familles = fams; res.rayons = rayons;
      res.elements = document.body.querySelectorAll('*').length;
      return res;
    }, { NUIT, ANCIEN, NEUTRES: [...NEUTRES] });

    total.nuit += r.nuit; total.ancien += r.ancien; total.inconnu += r.inconnu;
    for (const [t, n] of Object.entries(r.parToken)) if (ANCIEN[Object.keys(ANCIEN).find(k => ANCIEN[k] === t)] || t.startsWith('--'))
      if (Object.values(ANCIEN).includes(t)) coupables.set(t, (coupables.get(t) || 0) + n);
    parPage.push({ page: p, ...r });
    await pg.close();
  }
} finally { await b.close(); srv.close(); }

console.log('\nREGISTRE — quel vocabulaire chaque page parle-t-elle ?');
console.log('(valeurs PEINTES, pas les var() écrites · desktop · page parcourue de bout en bout)\n');
console.log(`${'page'.padEnd(38)} ${'élém.'.padStart(6)} ${'nuit'.padStart(6)} ${'ancien'.padStart(7)} ${'hors voc.'.padStart(10)}   part nuit`);
console.log('─'.repeat(96));
for (const r of parPage) {
  const clas = r.nuit + r.ancien;
  const part = clas ? Math.round(r.nuit * 100 / clas) : 0;
  const barre = '█'.repeat(Math.round(part / 5)).padEnd(20, '·');
  console.log(`${r.page.padEnd(38)} ${String(r.elements).padStart(6)} ${String(r.nuit).padStart(6)} `
    + `${String(r.ancien).padStart(7)} ${String(r.inconnu).padStart(10)}   ${barre} ${String(part).padStart(3)} %`);
}
const clasT = total.nuit + total.ancien;
console.log('─'.repeat(96));
console.log(`${'TOTAL'.padEnd(38)} ${''.padStart(6)} ${String(total.nuit).padStart(6)} `
  + `${String(total.ancien).padStart(7)} ${String(total.inconnu).padStart(10)}   `
  + `part nuit ${clasT ? Math.round(total.nuit * 100 / clasT) : 0} %`);

console.log('\nLES TOKENS DE L\'ANCIEN RÉGIME ENCORE PEINTS, du plus fréquent au moins :');
[...coupables].sort((a, z) => z[1] - a[1]).forEach(([t, n]) =>
  console.log(`  ${t.padEnd(14)} ${String(n).padStart(5)} occurrence(s)`));

if (detail) {
  console.log('\nOÙ, NOMMÉMENT :');
  for (const r of parPage) {
    const ex = Object.entries(r.exemples);
    if (!ex.length) continue;
    console.log(`\n  ── ${r.page}`);
    for (const [t, liste] of ex.sort((a, z) => z[1].length - a[1].length)) {
      const uniq = [...new Set(liste)];
      console.log(`     ${t.padEnd(14)} ×${String(liste.length).padStart(4)}  ${uniq.slice(0, 4).join(' · ')}`
        + (uniq.length > 4 ? ` … +${uniq.length - 4}` : ''));
    }
  }
  console.log('\nFAMILLES DE POLICE ET RAYONS (le reste du vocabulaire) :');
  for (const r of parPage) {
    const f = Object.entries(r.familles).sort((a, z) => z[1] - a[1]).slice(0, 3)
      .map(([k, v]) => `${k} ×${v}`).join(' · ');
    const ra = Object.entries(r.rayons).sort((a, z) => z[1] - a[1]).slice(0, 4)
      .map(([k, v]) => `${k}×${v}`).join(' ');
    console.log(`  ${r.page.padEnd(38)} ${f}`);
    if (ra) console.log(`  ${''.padEnd(38)} rayons : ${ra}`);
  }
}

console.log('\n⚠ Cet outil NE JUGE PAS : il recense. Un token de l\'ancien régime n\'est');
console.log('  pas une faute en soi — l\'or de MARQUE a sa place. C\'est la matière du');
console.log('  chiffrage du lot C, pas un verdict.\n');
