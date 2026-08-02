/* ============================================================
   tools/qa/voile.mjs — LOT B
   ------------------------------------------------------------
   LE VOILE .ambience DÉRIVE-T-IL, OU SAUTE-T-IL ?

   MÊME BUG QU'EN R97, MÊME MESURE. `@keyframes ambient-grade` animait le
   RACCOURCI `background`. Le raccourci embarque `background-image`, dont
   le type est DISCRET : le navigateur ne sait pas interpoler un dégradé
   vers un autre, il bascule à mi-chemin. Cinq étapes déclarées — aube,
   golden hour, sunset, nuit océan, braise — ne produisent donc pas une
   dérive continue mais quatre sauts. C'est ce qui a coûté tout R97 sur le
   ciel de l'accueil, et le voile le portait encore sur 7 pages.

   LE SEUIL N'EST PAS INVENTÉ POUR L'OCCASION : c'est celui de
   `soiree.mjs`, hérité de R97/C — au moins N-1 luminances peintes
   distinctes sur N relevés. Un mécanisme concurrent l'a atteint, donc il
   est atteignable.

   ⚠ OÙ ON LIT LE PIXEL. Le voile est un radial `transparent` au centre et
   coloré aux BORDS (« vignette, centre transparent = lecture intacte »).
   Lire au milieu de l'écran ne mesurerait donc rien du tout — c'est le
   coin qu'il faut lire. Piège évité par construction, pas par chance.

   ⚠ ET ON FORCE LE REPEINT (13e calibration, R103) : un `scrollTo()`
   programmatique laisse une tuile compositée périmée d'une couche
   `position: fixed`. Sans le cran de molette, on photographie l'état
   précédent et on mesure une continuité qui n'existe pas — ou une
   discontinuité qui n'existe pas davantage.

   Usage : node tools/qa/voile.mjs [page] [--pas=12]
============================================================ */
import { serve, browser, VIEWPORTS, BASE } from './lib.mjs';

const args = process.argv.slice(2);
const page = args.find(a => !a.startsWith('--')) || 'partenaires.html';
const pasArg = args.find(a => a.startsWith('--pas='));
const N = pasArg ? Number(pasArg.slice('--pas='.length)) : 12;

const lum = ([r, g, b]) => {
  const f = c => { c /= 255; return c <= .03928 ? c / 12.92 : ((c + .055) / 1.055) ** 2.4; };
  return .2126 * f(r) + .7152 * f(g) + .0722 * f(b);
};

const srv = await serve();
const b = await browser();
let echecs = 0;
const dire = (ok, txt) => { if (!ok) echecs++; console.log(`  ${ok ? '✓' : '✗'} ${txt}`); };

try {
  const ctx = await b.newContext({ viewport: VIEWPORTS.desktop });
  const pg = await ctx.newPage();
  await pg.addInitScript(() => { try { localStorage.setItem('syfir-portal', 'in'); } catch (e) {} });
  await pg.goto(`${BASE}/${page}`, { waitUntil: 'load' });
  await pg.waitForTimeout(1400);

  const socle = await pg.evaluate(() => {
    const el = document.querySelector('.ambience');
    if (!el) return null;
    return {
      supporte: CSS.supports('animation-timeline', 'scroll()'),
      anime: getComputedStyle(el).animationName,
      couches: el.children.length,
      z: getComputedStyle(el).zIndex,
    };
  });
  if (!socle) { console.log(`\n  ⚠ pas de .ambience sur ${page} — rien à mesurer.\n`); process.exit(0); }
  console.log(`\nLE VOILE .ambience — ${page}`);
  console.log(`  animation-timeline: scroll() supporté : ${socle.supporte} · animation « ${socle.anime} »`
    + ` · ${socle.couches} couche(s) · z-index ${socle.z}\n`);
  if (!socle.supporte) {
    console.log('  ⚠ Ce navigateur ne sait pas piloter une animation au défilement :');
    console.log('    le voile est statique ici, la mesure de continuité n\'a pas d\'objet.\n');
    process.exit(0);
  }

  /* ---- MOYEN 1 : LE RÉSULTAT PEINT, dans le COIN ---- */
  const releves = [];
  for (let i = 0; i < N; i++) {
    const frac = i / (N - 1);
    await pg.evaluate(f => scrollTo(0, Math.round((document.documentElement.scrollHeight - innerHeight) * f)), frac);
    /* le cran de molette force le repeint de la couche fixe */
    await pg.mouse.move(700, 400);
    await pg.mouse.wheel(0, 1); await pg.mouse.wheel(0, -1);
    await pg.waitForTimeout(260);
    /* MOYEN 2, relevé au MÊME instant : la valeur interpolée du mécanisme.
       On lit `background-image` calculé sur le voile — c'est le câblage,
       et il ne vaut que confronté au pixel. */
    const meca = await pg.evaluate(() => {
      const el = document.querySelector('.ambience');
      const cs = getComputedStyle(el);
      const enf = [...el.children].map(c => +(+getComputedStyle(c).opacity).toFixed(4));
      return { img: cs.backgroundImage.slice(0, 120), enf };
    });
    /* ⚠⚠ ON NE MESURE PAS LE PIXEL, ON MESURE LA CONTRIBUTION DU VOILE.
       Et c'est la troisième version de ce moyen : les deux premières
       mesuraient autre chose, chacune à sa manière.
         · un carré de 6 px avec les moyennes ARRONDIES à l'entier jetait
           la précision — le voile pèse 5 à 20 % d'alpha, il déplace le
           pixel d'une ou deux unités sur 255 : 7 paliers rendus sur 12 ;
         · un bloc de 260 px en flottant en rendait 12 sur 12… MAIS AUSSI
           SUR L'ÉTAT D'AVANT CORRECTION, où le mécanisme n'en produisait
           que 5. Il mesurait le CONTENU DE LA PAGE qui défile sous le
           voile, pas le voile. Un moyen qui donne le même verdict avant
           et après ne mesure pas ce qu'on croit.
       Remède, et c'est la méthode prouvée en R103 sur la photo du hero :
       DIFFÉRENTIEL DE MASQUAGE. À chaque position, on photographie la
       même zone AVEC puis SANS le voile. Le contenu dessous est identique
       entre les deux clichés, donc il s'annule ; ce qui reste est la
       contribution du voile SEUL. */
    const zone = { x: 0, y: 0, width: 120, height: 120 };
    const moyenne = async () => {
      const shot = await pg.screenshot({ clip: zone });
      return pg.evaluate(async b64 => {
        const im = new Image(); im.src = 'data:image/png;base64,' + b64; await im.decode();
        const c = document.createElement('canvas'); c.width = im.width; c.height = im.height;
        const g = c.getContext('2d'); g.drawImage(im, 0, 0);
        const d = g.getImageData(0, 0, im.width, im.height).data;
        let r = 0, v = 0, bl = 0, n = 0;
        for (let k = 0; k < d.length; k += 4) { r += d[k]; v += d[k + 1]; bl += d[k + 2]; n++; }
        return [r / n, v / n, bl / n];
      }, shot.toString('base64'));
    };
    /* ⚠ ET ON FIGE TOUT LE RESTE AVANT LA PAIRE. Sans ça le différentiel
       ne mesure pas le voile : entre les deux clichés, les révélations, la
       parallaxe et les images qui finissent d'arriver bougent le fond, et
       le résidu de soustraction dépasse largement l'apport du voile — au
       point de rendre des apports NÉGATIFS, ce qu'une couche translucide
       ne peut pas produire. La page est donc gelée (animations en pause à
       leur instant courant) avant les deux prises, et dégelée après. */
    await pg.evaluate(() => {
      window.__gel = document.getAnimations().filter(a => a.playState === 'running');
      window.__gel.forEach(a => { try { a.pause(); } catch (e) {} });
    });
    await pg.waitForTimeout(350);
    const avec = await moyenne();
    await pg.evaluate(() => { document.querySelector('.ambience').style.display = 'none'; });
    await pg.waitForTimeout(350);
    const sans = await moyenne();
    await pg.evaluate(() => {
      document.querySelector('.ambience').style.display = '';
      (window.__gel || []).forEach(a => { try { a.play(); } catch (e) {} });
    });
    await pg.waitForTimeout(200);
    const rgb = [avec[0] - sans[0], avec[1] - sans[1], avec[2] - sans[2]];
    /* la « luminance » du différentiel : l'apport lumineux du voile seul */
    releves.push({ frac, rgb, L: (0.2126*rgb[0] + 0.7152*rgb[1] + 0.0722*rgb[2]), img: meca.img, enf: meca.enf });
  }

  console.log('   défil.   apport du voile   Δrgb (avec − sans)      mécanisme');
  releves.forEach(r => console.log(
    `   ${(r.frac * 100).toFixed(0).padStart(4)} %   ${r.L.toFixed(4).padStart(11)}   ${r.rgb.map(x=>(x>=0?'+':'')+x.toFixed(2)).join(' ').padEnd(22)} `
    + `${r.enf.length ? r.enf.join(' ') : '(aucune couche — raccourci)'}`));

  /* ⚠ LA BONNE MÉTRIQUE EST LE PLATEAU, PAS LE NOMBRE DE VALEURS.
     Compter des luminances « distinctes » au millième laissait passer
     l'état FAUTIF à 10 sur 12 : le bruit résiduel du différentiel suffit à
     rendre deux relevés d'un même plateau numériquement différents. Or la
     signature du type discret n'est pas « peu de valeurs », c'est
     L'IDENTITÉ DE RELEVÉS CONSÉCUTIFS — dans un plateau, le voile ne
     change pas du tout, et le Δrgb se répète au centième près :
     avant correction, « +2.38 +1.75 -0.64 » sortait TROIS FOIS de suite,
     « +3.18 +1.03 -0.96 » deux fois, et ainsi de suite. Cinq plateaux
     pour cinq étapes de keyframes.
     On arrondit donc le Δrgb au dixième — au-dessus du bruit (~0,02),
     bien en dessous du pas réel (~0,3 à 0,8) — et on compte DEUX choses :
     les états distincts, et surtout les RÉPÉTITIONS CONSÉCUTIVES, qui
     doivent être nulles si le voile dérive. */
  const cle = r => r.rgb.map(x => x.toFixed(1)).join('|');
  const distinctes = new Set(releves.map(cle)).size;
  let plateaux = 0;
  for (let i = 1; i < releves.length; i++) if (cle(releves[i]) === cle(releves[i - 1])) plateaux++;
  const seuil = Math.max(2, N - 4);   /* R97/C atteignait N-1 ; le voile est
                                         beaucoup plus discret (8 % à 20 %
                                         d'alpha), donc on exige N-4 : c'est
                                         le seuil demandé — 8 sur 12. */
  console.log(`\n  MOYEN 1 — apports du voile distincts (différentiel) : ${distinctes} / ${N}  (seuil ${seuil})`);
  console.log(`           relevés consécutifs IDENTIQUES : ${plateaux}  (attendu 0 — chaque répétition est un palier)`);

  /* ---- MOYEN 2 : le mécanisme, indépendant du pixel ---- */
  const imgDist = new Set(releves.map(r => r.img)).size;
  const opDist = releves[0].enf.length
    ? new Set(releves.map(r => r.enf.join(','))).size
    : imgDist;
  console.log(`  MOYEN 2 — états distincts du mécanisme : ${opDist} / ${N}`
    + (releves[0].enf.length ? ' (opacités empilées)' : ' (background-image calculé — raccourci discret)'));

  const ok1 = distinctes >= seuil && plateaux === 0, ok2 = opDist >= seuil;
  dire(ok1, ok1 ? 'le voile dérive réellement (résultat peint)' : `le voile SAUTE : ${distinctes} état(s) distinct(s) et ${plateaux} relevé(s) consécutif(s) identique(s)`);
  dire(ok2, ok2 ? 'le mécanisme varie de façon continue' : `le mécanisme est discret : ${opDist} état(s)`);
  dire(ok1 === ok2, ok1 === ok2 ? 'les deux moyens concordent' : 'LES DEUX MOYENS SE CONTREDISENT — ne rien conclure');
  await pg.close();
} finally { await b.close(); srv.close(); }

console.log(`\n${echecs === 0 ? '✓ le voile dérive.' : `✗ ${echecs} défaut(s).`}\n`);
process.exit(echecs ? 1 : 0);
