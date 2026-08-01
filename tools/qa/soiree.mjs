/* ============================================================
   tools/qa/soiree.mjs [--pas=N]
   ------------------------------------------------------------
   LA SOIRÉE AVANCE-T-ELLE VRAIMENT ?

   C'est LA mesure de R98/3, et elle a une histoire. R97 a découvert que
   La Traversée n'interpolait pas : elle avançait par TROIS PALIERS, parce
   que ses keyframes animaient le raccourci `background` (composant image
   traité en discret). Le symptôme mesuré à l'époque : luminance constante,
   puis SAUT, puis constante — 0 valeur intermédiaire sur 30 relevés, et
   seulement 3 valeurs de `background-image` calculé sur tout le parcours.

   L'empilement d'opacités, lui, avait été mesuré à 11 valeurs de
   luminance distinctes sur 12 relevés. C'est le seuil à retrouver — pas
   un seuil inventé pour l'occasion, mais celui qu'un mécanisme concurrent
   a réellement atteint sur ce site.

   DEUX MOYENS INDÉPENDANTS, parce qu'un seul ne prouve rien :

   1. LA LUMINANCE RÉELLEMENT PEINTE du ciel, relevée à N positions de
      défilement. C'est ce que l'œil voit. Si le ciel saute, on retrouve
      des plateaux et peu de valeurs distinctes.
   2. L'OPACITÉ CALCULÉE de chaque couche empilée, aux mêmes positions.
      C'est le mécanisme. Il doit varier de façon monotone et continue.

   Les deux doivent concorder. Le premier seul pourrait être trompé par
   une photo qui passe ; le second seul mesurerait le câblage — exactement
   ce que la doctrine du dépôt interdit.

   ⚠ L'ACCUEIL GRANDIT PENDANT QU'ON LE MESURE : on descend par
   scrollToBottom() avant de connaître la hauteur, puis on se replace en
   FRACTION de la hauteur réelle à chaque pas.
============================================================ */
import { serve, browser, openPage, scrollToBottom, VIEWPORTS } from './lib.mjs';

const args = process.argv.slice(2);
const pasArg = args.find(a => a.startsWith('--pas='));
const N = pasArg ? Number(pasArg.slice('--pas='.length)) : 12;

const lum = (r, g, b) => {
  const f = c => { c /= 255; return c <= .03928 ? c / 12.92 : ((c + .055) / 1.055) ** 2.4; };
  return .2126 * f(r) + .7152 * f(g) + .0722 * f(b);
};

const srv = await serve();
const b = await browser();
let code = 0;
try {
  const ctx = await b.newContext({ viewport: VIEWPORTS.desktop });
  const pg = await openPage(ctx, 'index.html');
  await scrollToBottom(pg);
  const course = await pg.evaluate(() => document.documentElement.scrollHeight - innerHeight);

  /* Masque posé une seule fois, avant la boucle (voir 12e calibration). */
  await pg.evaluate(() => {
    const s = document.createElement('style'); s.id = 'qa-ciel';
    s.textContent = 'body > *:not(.sky){visibility:hidden!important}'
      + '.sky, .sky *{visibility:visible!important}'
      + '.sky .projos, .sky .brume{visibility:hidden!important}'
      + '.sky .nuit, .sky .nuit *{visibility:visible!important}';
    document.head.appendChild(s);
  });
  await pg.waitForTimeout(400);

  const releves = [];
  for (let i = 0; i < N; i++) {
    const frac = i / (N - 1);
    await pg.evaluate(f => scrollTo(0, f * (document.documentElement.scrollHeight - innerHeight)), frac);

    /* ⚠ 10e CALIBRATION — ET C'EST LA CINQUIÈME FOIS QUE CE HARNAIS SE
       FAIT PRENDRE PAR LA MÊME FAMILLE DE DÉFAUT : comparer deux choses
       prises à deux INSTANTS différents.

       La première version attendait 160 ms puis lisait le mécanisme, puis
       capturait l'image 80 ms plus tard. Entre les deux, la boucle rAF
       avait mis --p à jour : elle relevait --p = 0,959 (valeur héritée du
       bas de page) tout en photographiant un ciel à --p = 0. Le signe qui
       ne trompe pas, exactement comme en R96 : une opacité de montée à
       1,000 au-dessus d'un pixel peint en #04070F — géométriquement
       impossible.

       On attend donc que --p se STABILISE (deux lectures consécutives
       égales) avant de mesurer quoi que ce soit. Un instant, une vérité. */
    /* « Stable » ne veut pas dire « juste » : si l'événement de
       défilement n'a pas encore été traité, deux lectures consécutives
       donnent la MÊME valeur PÉRIMÉE et la boucle sort satisfaite. C'est
       ce qui faisait plafonner --p à 0,909 au bas de page. On attend donc
       que --p ATTEIGNE la valeur attendue, et on ne se contente de la
       stabilité qu'en dernier recours. */
    let av = null, stable = 0;
    for (let t = 0; t < 60; t++) {
      await pg.waitForTimeout(50);
      const v = await pg.evaluate(() =>
        getComputedStyle(document.documentElement).getPropertyValue('--p').trim());
      stable = (v === av) ? stable + 1 : 0;
      av = v;
      if (Math.abs(Number(v) - frac) < 0.01) break;
      if (stable >= 6) break;
    }

    /* Moyen 2 — le mécanisme : opacité calculée de chaque couche. */
    /* R102 : les couches sont désormais .n0/.n1/.n2 (classes de la
       maquette), plus des pseudo-éléments de .sky-grade. La « montée »
       est n1, le « cœur de nuit » n2. */
    const meca = await pg.evaluate(() => {
      const o = s => { const e = document.querySelector(s); return e ? +getComputedStyle(e).opacity : 0; };
      return {
        p: +getComputedStyle(document.documentElement).getPropertyValue('--p'),
        montee: o('.n1'), coeur: o('.n2'),
      };
    });

    /* Moyen 1 — le résultat : luminance PEINTE du ciel seul.
       ⚠ 12e CALIBRATION. La première version posait ce masque, capturait
       80 ms plus tard, puis le RETIRAIT — à chaque tour. Depuis que les
       faisceaux portent un `filter: blur(22px)` sur quatre surfaces plein
       écran, masquer/démasquer force une recomposition que 80 ms ne
       suffisent plus à terminer : on photographiait la frame où tout est
       caché et où le ciel n'a pas encore été repeint, c'est-à-dire le
       fond nu du body — nuit-0 pur, 4,7,15, à dix positions sur douze.
       L'outil annonçait « 3 luminances distinctes sur 12 », soit
       exactement le symptôme du bug de R97 qu'il est censé détecter.
       Un FAUX POSITIF qui imitait le vrai défaut : le pire des cas.
       Le masque est désormais posé UNE FOIS, hors de la boucle. */
    await pg.waitForTimeout(220);
    const shot = await pg.screenshot({ clip: { x: 700, y: 440, width: 6, height: 6 } });
    const px = await pg.evaluate(async b64 => {
      const img = new Image(); img.src = 'data:image/png;base64,' + b64; await img.decode();
      const c = document.createElement('canvas'); c.width = img.width; c.height = img.height;
      const g = c.getContext('2d'); g.drawImage(img, 0, 0);
      const d = g.getImageData(0, 0, img.width, img.height).data;
      let r = 0, v = 0, bl = 0, n = 0;
      for (let i = 0; i < d.length; i += 4) { r += d[i]; v += d[i + 1]; bl += d[i + 2]; n++; }
      return [r / n, v / n, bl / n];
    }, shot.toString('base64'));

    releves.push({ frac, ...meca, L: lum(...px), rgb: px.map(x => Math.round(x)) });
  }

  console.log(`\nLA SOIRÉE AVANCE — ${N} relevés sur ${course} px de course\n`);
  console.log('   défil.     --p    montée    cœur    luminance peinte   rgb');
  for (const r of releves) {
    console.log(`   ${(r.frac * 100).toFixed(0).padStart(4)} %  ${r.p.toFixed(3)}  ${r.montee.toFixed(3)}  ${r.coeur.toFixed(3)}   ${r.L.toFixed(6).padStart(12)}   ${r.rgb.join(',')}`);
  }

  const distinctes = new Set(releves.map(r => r.L.toFixed(6))).size;
  const seuil = Math.max(2, N - 1);
  console.log(`\n  MOYEN 1 — luminances peintes distinctes : ${distinctes} / ${N}  (seuil ${seuil}, atteint par R97/C)`);

  /* R102 : le mécanisme de la maquette n'est PAS monotone — n1 monte
     puis redescend en triangle, c'est un fondu enchaîné à trois temps.
     Le critère devient : le CŒUR DE NUIT (n2) croît, lui, sans jamais
     reculer. C'est lui qui porte la progression de la soirée. */
  const coeur = releves.map(r => r.coeur);
  let monotone = true;
  for (let i = 1; i < coeur.length; i++) if (coeur[i] < coeur[i - 1] - 1e-6) monotone = false;
  const opDist = new Set(releves.map(r => (r.montee + r.coeur).toFixed(4))).size;
  console.log(`  MOYEN 2 — opacités empilées : ${opDist} valeurs distinctes · cœur de nuit ${monotone ? 'croissant sans recul' : 'EN RECUL quelque part'}`);

  const ok1 = distinctes >= seuil, ok2 = opDist >= seuil && monotone;
  console.log(`\n  ${ok1 ? '✓' : '✗'} le ciel est réellement continu (résultat peint)`);
  console.log(`  ${ok2 ? '✓' : '✗'} le mécanisme varie de façon continue et monotone`);
  const concordent = ok1 === ok2;
  console.log(`  ${concordent ? '✓' : '✗'} les deux moyens concordent`);
  code = (ok1 && ok2 && concordent) ? 0 : 1;
  console.log(code ? '\n✗ la soirée n\'avance pas comme annoncé.\n' : '\n✓ la soirée avance vraiment.\n');
} finally {
  await b.close(); srv.close();
}
process.exit(code);
