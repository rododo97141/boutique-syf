/* ============================================================
   tools/qa/intentions.mjs <dumpA> <dumpB> — LOT A/1
   ------------------------------------------------------------
   LA PREUVE DE CONFINEMENT DEVIENT UNE PREUVE D'INTENTION.

   POURQUOI IL FAUT CHANGER D'INSTRUMENT. `ui-diff-hors-index.mjs` a tenu
   neuf lots en répondant « 0 différence hors accueil ». Cette preuve
   n'existe que parce que rien ne bougeait ailleurs. À partir du moment où
   les 13 autres pages passent à la nuit, elle dira « 4 000 différences »
   et ne prouvera plus rien du tout — ni que le lot est propre, ni qu'il
   est sale.

   CE QU'ON PEUT ENCORE PROUVER QUAND TOUT BOUGE : non pas que rien n'a
   changé, mais que **CHAQUE CHANGEMENT ÉTAIT VOULU**. Le manifeste
   `tools/qa/intentions.json` déclare, avant le lot, ce qui doit bouger.
   L'outil vérifie ensuite les DEUX SENS :

     · toute différence mesurée doit être RÉCLAMÉE par une entrée ;
     · toute entrée doit correspondre à AU MOINS UNE différence réelle.

   Le second sens est le plus important, et c'est celui qu'on oublie : un
   manifeste qui n'exige pas que ses réclamations se réalisent devient un
   blanc-seing. On écrirait `{page:"*", prop:"*"}` et tout passerait.
   Une réclamation qui ne trouve rien est donc un ÉCHEC — soit le lot n'a
   pas fait ce qu'il annonçait, soit la réclamation était trop large.

   FORMAT D'UNE ENTRÉE
     {
       "lot": "D/2",
       "page": "syf-tv.html",          // exact, ou préfixe avec *
       "sel": "*",                     // sélecteur, ou * pour tous
       "prop": "color|backgroundColor",// une ou plusieurs, séparées par |
       "raison": "passage du crème chaud au crème froid de la nuit"
     }
   `page` accepte `*` en fin de chaîne. `sel` et `prop` acceptent `*` seul.
   Rien d'autre : un langage de motifs riche deviendrait un langage
   d'excuses.

   Usage : node tools/qa/intentions.mjs r106 r107
============================================================ */
import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { OUT } from './lib.mjs';

const ICI = dirname(fileURLToPath(import.meta.url));
const MANIFESTE = resolve(ICI, 'intentions.json');

const args = process.argv.slice(2);
const themeArg = args.find(x => x.startsWith('--theme='));
const theme = themeArg ? themeArg.slice('--theme='.length) : null;
const [a, b] = args.filter(x => !x.startsWith('--'));
if (!a || !b) {
  console.error('usage: node tools/qa/intentions.mjs <dumpA> <dumpB> [--theme=dark]');
  process.exit(1);
}
const load = l => JSON.parse(readFileSync(resolve(OUT, `${l}.json`), 'utf8'));
const A = load(a), B = load(b);
/* ⚠ CHAQUE ENTRÉE EST LIÉE À SA PAIRE DE DUMPS (`de` / `vers`) — défaut
   trouvé au PREMIER usage réel de l'outil, et c'en était un vrai. Sans ce
   lien, une réclamation honorée au lot N est réévaluée au lot N+1, où le
   changement a déjà eu lieu : elle ne trouve plus rien et fait échouer un
   lot innocent. Le manifeste s'accumule, donc chaque entrée doit dire de
   quel passage elle parle. Les entrées d'autres passages sont ignorées —
   et le rapport dit COMBIEN, pour qu'on ne les croie pas vérifiées.

   ⚠ ET UN LOT PEUT LÉGITIMEMENT NE RIEN RÉCLAMER. Le lot B — la
   correction du voile `.ambience` — n'a produit AUCUNE différence dans le
   dump : il change une INTERPOLATION, donc un comportement dans le temps,
   et un dump lit la page AU REPOS. Zéro différence, zéro réclamation,
   preuve verte : c'est cohérent, à condition de dire que cette preuve
   porte sur l'état statique et pas sur ce que le lot a corrigé. C'est
   `tools/qa/voile.mjs` qui prouve le lot B, pas cet outil-ci. */
const toutes = existsSync(MANIFESTE) ? JSON.parse(readFileSync(MANIFESTE, 'utf8')) : [];
const regles = toutes.filter(r => r.de === a && r.vers === b);
const horsPaire = toutes.length - regles.length;

/* ---- appariement, volontairement pauvre ---- */
const colle = (motif, valeur) => {
  if (motif === '*') return true;
  if (motif.endsWith('*')) return valeur.startsWith(motif.slice(0, -1));
  return motif === valeur;
};
const colleProp = (motif, prop) => motif === '*' || motif.split('|').some(m => colle(m.trim(), prop));

/* ---- relevé des différences ---- */
const keepTheme = key => !theme || key.split('|')[1] === theme;
const diffs = [];
const keys = new Set([...Object.keys(A.pages), ...Object.keys(B.pages)].filter(keepTheme));
for (const key of [...keys].sort()) {
  const page = key.split('|')[0];
  const pa = A.pages[key], pb = B.pages[key];
  if (!pa || !pb) { diffs.push({ page, key, sel: '(page)', prop: '(présence)', de: !!pa, vers: !!pb }); continue; }
  const sels = new Set([...Object.keys(pa.styles), ...Object.keys(pb.styles)]);
  for (const sel of sels) {
    const ra = pa.styles[sel], rb = pb.styles[sel];
    if (!ra || !rb) { diffs.push({ page, key, sel, prop: '(présence)', de: !!ra, vers: !!rb }); continue; }
    for (const prop of new Set([...Object.keys(ra), ...Object.keys(rb)])) {
      const va = JSON.stringify(ra[prop]), vb = JSON.stringify(rb[prop]);
      if (va !== vb) diffs.push({ page, key, sel, prop, de: va, vers: vb });
    }
  }
  const ea = pa.jsErrors.join('|'), eb = pb.jsErrors.join('|');
  if (ea !== eb) diffs.push({ page, key, sel: '(page)', prop: 'erreursJS', de: ea, vers: eb });
}

/* ---- confrontation ---- */
const utilisee = new Map(regles.map((_, i) => [i, 0]));
const orphelines = [];
for (const d of diffs) {
  const i = regles.findIndex(r => colle(r.page, d.page) && colle(r.sel, d.sel) && colleProp(r.prop, d.prop));
  if (i < 0) orphelines.push(d);
  else utilisee.set(i, utilisee.get(i) + 1);
}
const mortes = regles.map((r, i) => ({ r, i, n: utilisee.get(i) })).filter(x => x.n === 0);

console.log(`\nINTENTION — ${a} -> ${b}${theme ? ` · thème « ${theme} »` : ''}`);
console.log(`${diffs.length} différence(s) mesurée(s) · ${regles.length} réclamation(s) pour ce passage`
  + (horsPaire ? ` · ${horsPaire} entrée(s) concernent d'autres passages, NON ÉVALUÉES ici` : '') + '\n');

if (!orphelines.length) console.log('  ✓ toute différence mesurée est réclamée par un lot');
else {
  console.log(`  ✗ ${orphelines.length} DIFFÉRENCE(S) QUE PERSONNE N'A RÉCLAMÉE(S) :`);
  const parPage = {};
  for (const d of orphelines) (parPage[d.page] ??= []).push(d);
  for (const [p, l] of Object.entries(parPage)) {
    console.log(`\n    ── ${p}  (${l.length})`);
    l.slice(0, 8).forEach(d => console.log(
      `       ${d.sel}.${d.prop}\n         ${String(d.de).slice(0, 60)}\n      -> ${String(d.vers).slice(0, 60)}`));
    if (l.length > 8) console.log(`       … et ${l.length - 8} autre(s)`);
  }
}

if (regles.length) {
  console.log('');
  if (!mortes.length) console.log('  ✓ toute réclamation a trouvé au moins une différence réelle');
  else {
    console.log(`  ✗ ${mortes.length} RÉCLAMATION(S) SANS EFFET — un manifeste qui ne se réalise pas`);
    console.log('    est un blanc-seing : soit le lot n\'a pas fait ce qu\'il annonçait,');
    console.log('    soit la réclamation était trop large.');
    mortes.forEach(({ r }) => console.log(
      `       [${r.lot}] ${r.page} ${r.sel}.${r.prop} — « ${r.raison} »`));
  }
  const top = regles.map((r, i) => [r, utilisee.get(i)]).filter(([, n]) => n > 0)
    .sort((x, z) => z[1] - x[1]);
  if (top.length) {
    console.log('\n  Réclamations honorées :');
    top.forEach(([r, n]) => console.log(
      `    [${r.lot}] ${String(n).padStart(5)} diff. · ${r.page} ${r.sel}.${r.prop} — ${r.raison}`));
  }
}

const echec = orphelines.length + mortes.length;
console.log(`\n${echec === 0
  ? '✓ le lot a changé exactement ce qu\'il annonçait, ni plus ni moins.'
  : `✗ ${echec} écart(s) entre ce qui était annoncé et ce qui a changé.`}\n`);
process.exit(echec ? 1 : 0);
