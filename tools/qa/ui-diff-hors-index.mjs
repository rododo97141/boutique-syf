/* ============================================================
   tools/qa/ui-diff-hors-index.mjs <dumpA> <dumpB>
   ------------------------------------------------------------
   PREUVE DE CONFINEMENT. Compare deux dumps en EXCLUANT index.html :
   un lot confiné à l'accueil doit produire 0 différence sur les
   13 autres pages. C'est la preuve centrale héritée de R91/R92.

   Usage : node tools/qa/ui-diff-hors-index.mjs r93-00-baseline r93-02-voile
   Sortie : rapport console + code de sortie 1 si différences.

   ----- OPTION --theme=<t> : LA PROJECTION (R98) -----
   Le retrait des deux thèmes fait tomber le harnais de 56 à 28 combinaisons.
   La carte du retrait en concluait que « tous les dumps antérieurs deviennent
   incomparables ». C'est vrai de l'accueil, refondu ; c'est FAUX de la preuve
   de confinement, et c'est ce qui la sauve : on perd UNE dimension, pas deux.

   Le sombre est le monde qui survit. Comparer la moitié sombre d'un dump à
   deux thèmes avec un dump à un seul thème met les deux dans le MÊME
   référentiel — la preuve reste donc opposable PENDANT le changement
   site-wide, au lieu d'être reconstruite après lui (et de ne plus rien
   prouver sur la transition elle-même).

   node tools/qa/ui-diff-hors-index.mjs avant-nuit nuit-00 --theme=dark
============================================================ */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { OUT } from './lib.mjs';

const args = process.argv.slice(2);
const themeArg = args.find(x => x.startsWith('--theme='));
const theme = themeArg ? themeArg.slice('--theme='.length) : null;
const [a, b] = args.filter(x => !x.startsWith('--'));
if (!a || !b) { console.error('usage: node tools/qa/ui-diff-hors-index.mjs <dumpA> <dumpB> [--theme=dark]'); process.exit(1); }
const load = l => JSON.parse(readFileSync(resolve(OUT, `${l}.json`), 'utf8'));
const A = load(a), B = load(b);

const isIndex = key => key.startsWith('index.html|');
/* La clé est « page|thème|viewport » : on filtre sur le SEGMENT, pas sur la
   chaîne entière — « dark » apparaîtrait sinon dans un nom de page. */
const keepTheme = key => !theme || key.split('|')[1] === theme;
const diffs = [];
const keys = new Set([...Object.keys(A.pages), ...Object.keys(B.pages)]
  .filter(k => !isIndex(k) && keepTheme(k)));

for (const key of [...keys].sort()) {
  const pa = A.pages[key], pb = B.pages[key];
  if (!pa) { diffs.push(`${key} : absente du dump « ${a} »`); continue; }
  if (!pb) { diffs.push(`${key} : absente du dump « ${b} »`); continue; }
  const sels = new Set([...Object.keys(pa.styles), ...Object.keys(pb.styles)]);
  for (const sel of sels) {
    const ra = pa.styles[sel], rb = pb.styles[sel];
    if (!ra || !rb) { diffs.push(`${key} ${sel} : élément présent d'un seul côté`); continue; }
    for (const prop of new Set([...Object.keys(ra), ...Object.keys(rb)])) {
      const va = JSON.stringify(ra[prop]), vb = JSON.stringify(rb[prop]);
      if (va !== vb) diffs.push(`${key} ${sel}.${prop} : ${va} -> ${vb}`);
    }
  }
  const ea = pa.jsErrors.join('|'), eb = pb.jsErrors.join('|');
  if (ea !== eb) diffs.push(`${key} : erreurs JS « ${ea} » -> « ${eb} »`);
}

const projection = theme ? `, projeté sur le thème « ${theme} »` : '';
console.log(`Confinement : ${a} -> ${b}, index.html exclu${projection}, ${keys.size} combinaisons hors index.`);
if (keys.size === 0) { console.log('✗ 0 combinaison retenue — filtre erroné, la mesure ne prouve RIEN.'); process.exit(1); }
if (!diffs.length) {
  console.log('✓ 0 différence — le lot est confiné à l\'accueil.');
  process.exit(0);
}
console.log(`✗ ${diffs.length} différence(s) — le lot DÉBORDE hors de l'accueil :`);
diffs.slice(0, 40).forEach(d => console.log('  ' + d));
if (diffs.length > 40) console.log(`  … et ${diffs.length - 40} de plus`);
process.exit(1);
