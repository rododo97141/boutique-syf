/* ============================================================
   tools/qa/lisibilite.mjs [page] [--theme light|dark] [--pas N]
   ------------------------------------------------------------
   BALAYAGE CONTINU DE LA LISIBILITÉ.

   Pourquoi cet outil existe, alors que contraste.mjs mesure déjà :
   `contraste.mjs` descend par écrans (85 % du viewport). Sur l'accueil,
   le ciel s'interpole EN CONTINU au défilement tandis que la bascule
   d'encre suit des paliers DISCRETS. La zone où les deux divergent est,
   par construction, ENTRE deux positions — un test qui n'échantillonne
   qu'aux paliers, ou par grands sauts, ne la verra jamais.

   Ici on balaie par petits pas (25 % du viewport par défaut) et, à chaque
   pas, on prend UNE capture dont on découpe toutes les boîtes visibles.
   Un instant, une image, une vérité — la règle apprise à la dure sur les
   sept désynchronismes d'instrument précédents.

   Pour chaque élément on garde son PIRE rapport sur tout le parcours, et
   la progression de défilement à laquelle il survient : c'est ce qui
   localise la jointure au lieu de seulement la constater.

   Usage : node tools/qa/lisibilite.mjs index.html --theme light

   ⚠⚠ ÉTAT R103 — SON VERDICT N'EST PAS OPPOSABLE SUR L'ACCUEIL DE NUIT.
   À lire avant de croire un seul de ses chiffres.

   Cet outil était MORT sans le dire : sa garde « texte sur média »
   remontait jusqu'au body, qui porte le grain `--noise` en `url(…)` ; elle
   exemptait donc la page entière, l'outil suivait 0 élément et annonçait
   « ✓ aucun élément sous le seuil ». Trois défauts d'appareil ont été
   corrigés ici (remontée arrêtée au body, repeint forcé avant capture,
   boîtes mesurées seulement quand elles sont ENTIÈREMENT sous la barre et
   dans la fenêtre) : de 0 élément suivi on est passé à 93, et de
   15 « défauts » à 5.

   MAIS LES 5 QUI RESTENT SONT ENCORE FAUX, et on peut le prouver sans le
   moindre doute. Les fonds qu'il rapporte — 238,242,248 · 148,161,185 ·
   123,139,165 — SORTENT DE LA GAMME QUE LA PAGE SAIT PEINDRE : le cœur du
   ciel le plus clair de toute la soirée est mesuré à 51,74,109 par
   `soiree.mjs`, aux 12 pas. Aucune boîte de l'accueil ne peut reposer sur
   du 238,242,248. Vérification par un second moyen, découpage direct des
   quatre boîtes incriminées, molette bousculée : le bouton « S'inscrire »
   est sur son dégradé orange 248,136,16 ; `.badge-demo` sur 40,32,24 ;
   `.date .quand` sur 8,8,24 ; le pied de page sur 0,0,8. Toutes sombres.

   LA CAUSE DE FOND N'EST PAS UN RÉGLAGE, C'EST LA MÉTHODE. Cet outil
   suppose que chaque boîte a UN fond plat dominant. L'accueil de nuit
   n'en a pas : dégradés, `backdrop-filter`, photos plein cadre. Sur le
   lien de nav « Artistes », boîte 73×19, la tranche de couleur la plus
   large ne pèse que 6 % des pixels. On l'a rendu honnête sur ce qu'il ne
   sait pas lire (les boîtes sans fond dominant sortent en INDÉTERMINÉES,
   ni réussies ni en défaut) — mais on ne l'a PAS réglé pour qu'il passe au
   vert : ce serait accorder l'instrument au résultat voulu.

   D'ICI SA RECONSTRUCTION : l'instrument de référence pour l'AA est
   `contraste.mjs`, qui compose le fond par la cascade CSS au lieu de le
   deviner à l'image, et qui rapporte 0 défaut — accord confirmé par les
   découpages directs ci-dessus. `lisibilite.mjs` ne bloque rien et ne
   valide rien tant qu'il n'a pas de moyen de lire un fond non plat.
============================================================ */
import { serve, browser, openPage, VIEWPORTS } from './lib.mjs';

const args = process.argv.slice(2);
const url = args.find(a => !a.startsWith('--')) || 'index.html';
const ti = args.indexOf('--theme');
const theme = ti >= 0 && args[ti + 1] && !args[ti + 1].startsWith('--') ? args[ti + 1] : 'dark';  /* R98 : un seul thème, la nuit. Le défaut « light » restait ici et
     étiquetait chaque rapport « thème light » — un libellé faux sur une
     mesure juste, ce qui suffit à faire douter de la mesure. */
const pi = args.indexOf('--pas');
const pasRatio = pi >= 0 && args[pi + 1] ? Number(args[pi + 1]) : 0.25;
/* Temps de stabilisation avant chaque relevé. Le verre des sections a une
   transition de 300 ms : mesurer plus tôt, c'est mesurer un état
   transitoire — et prendre un transitoire pour un défaut structurel. */
const ai = args.indexOf('--attente');
const attente = ai >= 0 && args[ai + 1] ? Number(args[ai + 1]) : 120;

const vi = args.indexOf('--variante');
const variante = vi >= 0 && args[vi + 1] ? args[vi + 1] : '';

const srv = await serve();
const b = await browser();
const ctx = await b.newContext({ viewport: VIEWPORTS.desktop });
const page = await ctx.newPage();
if (variante) await page.addInitScript(v => { try { localStorage.setItem('syfir-r97', v); } catch (e) {} }, variante);
await page.addInitScript(t => { try { localStorage.setItem('syfir-theme', t); localStorage.setItem('syfir-portal', 'in'); } catch (e) {} }, theme);
await page.goto(`http://127.0.0.1:${process.env.QA_PORT || 8099}/${url}`, { waitUntil: 'load' });
await page.waitForTimeout(900);
await page.evaluate(() => document.querySelectorAll('.reveal').forEach(e => e.classList.add('in')));
await page.waitForTimeout(400);
const decoder = await ctx.newPage();
await decoder.goto('about:blank');

/* Marquage : chaque élément porteur de texte reçoit un identifiant stable,
   posé UNE fois. On mesure ensuite le même élément à chaque pas. */
const total = await page.evaluate(() => {
  let n = 0;
  /* ⚠ LA REMONTÉE S'ARRÊTE AU BODY — corrigé R103, sinon l'instrument
     s'exempte lui-même. Cette garde existe pour ne pas juger du texte
     posé sur une PHOTO. Mais le body porte le grain `--noise`, qui est un
     `url(data:image/svg+xml…)` : la remontée le trouvait pour TOUS les
     éléments de la page, les exemptait tous, suivait 0 élément et
     annonçait « ✓ aucun élément sous le seuil ». Un feu vert sur une
     mesure vide. Le grain n'est pas un fond média : on ne remonte plus
     jusqu'à lui. */
  const surMedia = el => {
    let x = el, h = 0;
    while (x && x !== document.body && h < 10) {
      const cs = getComputedStyle(x);
      const bi = cs.backgroundImage;
      if (bi && bi !== 'none' && /url\(/.test(bi)) return true;
      if (/hero|car-slide|visual-card|artist-photo|band-photo|am-hero|aftermovie|moment\b|ed-hero/
        .test(String(x.className || ''))) return true;
      x = x.parentElement; h++;
    }
    return false;
  };
  document.body.querySelectorAll('*').forEach(el => {
    const direct = [...el.childNodes].some(k => k.nodeType === 3 && k.textContent.trim().length > 1);
    if (!direct) return;
    const cs = getComputedStyle(el);
    if (cs.visibility === 'hidden' || cs.display === 'none' || el.closest('[hidden]')) return;
    if (parseFloat(cs.opacity) < 0.3) return;
    if (cs.webkitBackgroundClip === 'text' || cs.backgroundClip === 'text') return;  // or métallique
    if (surMedia(el)) return;
    el.setAttribute('data-lis', String(n++));
  });
  return n;
});

const pire = new Map();   // id -> { ratio, need, sel, txt, size, fg, bg, prog }
/* Boîtes sans fond lisible par ce moyen : ni réussite, ni défaut. On les
   COMPTE et on les NOMME — une mesure impossible qu'on tait est une
   mesure ratée qui passe pour un succès. */
const indetermines = new Map();

const mesurePas = async () => {
  const boites = await page.evaluate(() => {
    const out = [];
    document.querySelectorAll('[data-lis]').forEach(el => {
      const r = el.getBoundingClientRect();
      if (r.width < 4 || r.height < 4) return;
      /* ⚠ ON NE MESURE QUE LES BOÎTES ENTIÈREMENT DANS LA FENÊTRE, et
         entièrement SOUS LA BARRE FIXE — corrigé R103. Avant, une boîte à
         cheval sur le bord haut voyait son `y` ramené à 0 pendant que sa
         hauteur restait entière : on découpait donc une bande qui
         commençait EN HAUT DE L'ÉCRAN, c'est-à-dire DANS LA BARRE, dont le
         `backdrop-filter: blur(14px)` étale la photo du hero en gris
         clairs. D'où des fonds relevés à 238,242,248 — exactement le crème
         — sous des textes qui sont en réalité sur la nuit.
         Rien n'est perdu : le balayage avance par quarts d'écran, chaque
         élément finit entièrement visible à l'un des pas. */
      const barre = document.querySelector('nav');
      const bas = barre ? barre.getBoundingClientRect().bottom : 0;
      if (r.top < bas || r.bottom > innerHeight || r.left < 0 || r.right > innerWidth) return;
      const cs = getComputedStyle(el);
      const size = parseFloat(cs.fontSize), gras = parseInt(cs.fontWeight) >= 700;
      out.push({
        id: el.getAttribute('data-lis'),
        sel: el.tagName.toLowerCase() + (el.className ? '.' + String(el.className).split(' ').slice(0, 2).join('.') : ''),
        txt: el.textContent.trim().slice(0, 28), size: Math.round(size), fg: cs.color,
        need: (size >= 24 || (size >= 18.66 && gras)) ? 3 : 4.5,
        x: Math.round(Math.max(0, r.x)), y: Math.round(Math.max(0, r.y)),
        w: Math.round(Math.min(r.width, innerWidth - Math.max(0, r.x))),
        h: Math.round(Math.min(r.height, innerHeight - Math.max(0, r.y)))
      });
    });
    const max = document.documentElement.scrollHeight - innerHeight;
    return { list: out, prog: max > 0 ? window.scrollY / max : 1 };
  });
  if (!boites.list.length) return boites.prog;

  /* ⚠ FORCER LE REPEINT AVANT DE DÉCLENCHER — corrigé R103. Les boîtes
     sont relevées à la NOUVELLE position de défilement ; la capture, elle,
     pouvait encore montrer la TUILE COMPOSITÉE de la position PRÉCÉDENTE
     (le ciel est une couche fixe en `contain: paint`, qui ne se repeint
     pas d'elle-même après un défilement programmatique). Boîtes d'un
     instant, pixels d'un autre : l'outil lisait alors des fonds qui
     n'existaient nulle part — il annonçait `bg(238,242,248)` sous un
     eyebrow dont le découpage direct donne 0,0,8. Un cran de molette
     aller-retour force le repeint sans bouger la page. */
  await page.mouse.wheel(0, 1);
  await page.mouse.wheel(0, -1);
  await page.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))));

  const img = (await page.screenshot()).toString('base64');
  const res = await decoder.evaluate(async ({ b64, list }) => {
    const im = new Image();
    im.src = 'data:image/png;base64,' + b64;
    await im.decode();
    const c = document.createElement('canvas');
    c.width = im.width; c.height = im.height;
    const g = c.getContext('2d', { willReadFrequently: true });
    g.drawImage(im, 0, 0);
    const lum = ({ r, g: gg, b: bb }) => {
      const a = [r, gg, bb].map(v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); });
      return 0.2126 * a[0] + 0.7152 * a[1] + 0.0722 * a[2];
    };
    const parse = s => {
      const m = String(s).match(/rgba?\(([^)]+)\)/);
      if (!m) return null;
      const q = m[1].split(',').map(parseFloat);
      return { r: q[0], g: q[1], b: q[2], a: q[3] === undefined ? 1 : q[3] };
    };
    return list.map(it => {
      const d = g.getImageData(it.x, it.y, Math.max(1, it.w), Math.max(1, it.h)).data;
      const bins = new Map();
      for (let i = 0; i < d.length; i += 4) {
        if (d[i + 3] < 200) continue;
        const k = `${d[i] >> 3},${d[i + 1] >> 3},${d[i + 2] >> 3}`;
        const e = bins.get(k) || { n: 0, r: 0, g: 0, b: 0 };
        e.n++; e.r += d[i]; e.g += d[i + 1]; e.b += d[i + 2];
        bins.set(k, e);
      }
      let best = null, opaques = 0;
      for (const e of bins.values()) { opaques += e.n; if (!best || e.n > best.n) best = e; }
      if (!best) return null;
      /* ⚠ « DOMINANT » DOIT VRAIMENT DOMINER — corrigé R103. Le commentaire
         d'origine posait que « le texte est toujours minoritaire » dans la
         boîte. C'est faux pour une boîte serrée sur du texte interlettré
         posé sur un `backdrop-filter: blur()` : mesuré sur le lien de nav
         « Artistes », boîte 73×19, la plus grosse tranche ne pèse que 6 %
         des pixels — un dégradé flouté n'a PAS de fond dominant. Prendre
         cette tranche pour le fond fabriquait des gris moyens qui
         n'existent nulle part, et l'outil annonçait 15 défauts qu'un
         découpage direct de la même boîte dément.
         En dessous du seuil, la boîte n'a pas de fond lisible PAR CE
         MOYEN : on la déclare INDÉTERMINÉE. Ni réussite, ni défaut — elle
         demande un second moyen. */
      if (best.n < opaques * 0.25) {
        return { id: it.id, sel: it.sel, txt: it.txt, indetermine: true,
          part: Math.round(best.n * 100 / opaques) };
      }
      const bg = { r: Math.round(best.r / best.n), g: Math.round(best.g / best.n), b: Math.round(best.b / best.n) };
      const f = parse(it.fg);
      if (!f || f.a < 0.3) return null;
      // texte semi-transparent : composé sur son fond réel avant calcul
      const comp = { r: f.r * f.a + bg.r * (1 - f.a), g: f.g * f.a + bg.g * (1 - f.a), b: f.b * f.a + bg.b * (1 - f.a) };
      const L1 = lum(comp) + 0.05, L2 = lum(bg) + 0.05;
      return {
        id: it.id, sel: it.sel, txt: it.txt, size: it.size, need: it.need,
        fg: `${Math.round(f.r)},${Math.round(f.g)},${Math.round(f.b)}`,
        bg: `${bg.r},${bg.g},${bg.b}`,
        ratio: +(Math.max(L1, L2) / Math.min(L1, L2)).toFixed(2)
      };
    }).filter(Boolean);
  }, { b64: img, list: boites.list });

  for (const r of res) {
    if (r.indetermine) { indetermines.set(r.id, r); continue; }
    const p = pire.get(r.id);
    if (!p || r.ratio < p.ratio) pire.set(r.id, { ...r, prog: boites.prog });
  }
  return boites.prog;
};

/* Descente par petits pas. La page GRANDIT en descendant : on n'anticipe
   jamais sa hauteur, on avance tant qu'on n'est pas ancré au fond. */
await page.evaluate(() => window.scrollTo(0, 0));
await page.waitForTimeout(500);
let pas = 0;
for (let i = 0; i < 600; i++) {
  await page.waitForTimeout(attente);
  await mesurePas();
  pas++;
  const fini = await page.evaluate((r) => {
    const max = document.documentElement.scrollHeight - innerHeight;
    if (max <= 0) return true;
    if (window.scrollY / max >= 0.999) return true;
    window.scrollBy(0, Math.round(innerHeight * r));
    return false;
  }, pasRatio);
  if (fini) { await page.waitForTimeout(attente); await mesurePas(); break; }
}

const echecs = [...pire.values()].filter(v => v.ratio < v.need).sort((a, b) => a.ratio - b.ratio);
console.log(`Lisibilité en balayage continu — ${url} — thème ${theme}`);
console.log(`${total} éléments suivis · ${pas} pas de ${Math.round(pasRatio * 100)} % d'écran · ${attente} ms de stabilisation\n`);
if (!echecs.length) console.log('  ✓ aucun élément sous le seuil, à AUCUN moment du parcours');
echecs.forEach(f => console.log(
  `  ✗ ${String(f.ratio).padStart(6)}/${f.need}  à ${String(Math.round(f.prog * 100)).padStart(3)} %  ` +
  `${f.sel.padEnd(30)} « ${f.txt} »  fg(${f.fg}) bg(${f.bg})`));
console.log(`\nTOTAL sous le seuil : ${echecs.length}`);
const ind = [...indetermines.values()].filter(v => !pire.has(v.id));
if (ind.length) {
  console.log(`\n${ind.length} boîte(s) SANS FOND LISIBLE par ce moyen — ni réussie(s), ni en défaut :`);
  ind.slice(0, 12).forEach(v => console.log(`  ? ${v.sel.padEnd(30)} « ${v.txt} » (tranche la plus large : ${v.part} %)`));
  if (ind.length > 12) console.log(`  … et ${ind.length - 12} autre(s)`);
  console.log('  → texte sur dégradé flouté : à juger par contraste.mjs (composition CSS) ou au découpage direct.');
}

await b.close();
srv.close();
process.exit(echecs.length ? 1 : 0);
