/* ============================================================
   tools/qa/grain.mjs [page] [--sel=<css>]
   ------------------------------------------------------------
   LE GRAIN : bande-t-il, ou bruite-t-il ?

   Question posée en R98/1 par le superviseur, et qui interdit la réponse
   paresseuse : le grain --noise devient PERMANENT quand il n'y a plus qu'un
   monde de nuit. Il ne doit pas être gardé parce que « c'est le remède
   classique au banding » — il doit être gardé si la mesure ET la capture
   sont meilleures avec.

   POURQUOI LE RISQUE EST RÉEL ICI. Les fonds de nuit vont de #04070f à
   #0a1226 : une plage de luminance très basse ET très resserrée. C'est
   exactement le régime où un dégradé 8 bits produit des BANDES visibles —
   les paliers de quantification y sont larges relativement à la plage
   parcourue. C'est aussi le régime où un grain trop marqué cesse d'être une
   texture pour devenir du bruit, surtout sous un mix-blend-mode: screen qui
   RELÈVE les valeurs basses (screen(a,b) = 1-(1-a)(1-b) : plus a est sombre,
   plus b pèse). Les faisceaux de projecteurs sont en screen.

   CE QU'ON MESURE — le résultat peint, jamais la déclaration. On capture une
   BANDE VERTICALE d'un pixel de large sur toute la hauteur du fond, et on
   compare deux tirages : grain actif, grain neutralisé.

     - marches      : nombre de valeurs de luminance distinctes rencontrées.
                      Un dégradé qui bande en produit PEU (de larges plateaux
                      plats séparés de sauts) ; un dégradé lisse en produit
                      beaucoup.
     - saut max     : plus grand écart de luminance entre deux lignes
                      voisines. C'est LA signature du banding : un dégradé
                      lisse monte par pas minuscules, un dégradé qui bande
                      reste plat puis saute d'un coup.
     - plateau max  : plus longue suite de lignes strictement identiques.
                      Un plateau long = une bande visible à l'œil.
     - amplitude    : écart-type du bruit résiduel ligne à ligne, une fois la
                      tendance du dégradé retirée. C'est la mesure du BRUIT :
                      trop haute, le grain ne texture plus, il salit.

   Le grain ne peut pas « ajouter » de l'information au dégradé : ce qu'il
   fait, c'est casser les plateaux en dithering. On attend donc de lui, s'il
   sert à quelque chose : marches EN HAUSSE, plateau max EN BAISSE, saut max
   EN BAISSE — et une amplitude qui reste basse. S'il monte les marches en
   faisant exploser l'amplitude, il ne dithère pas : il bruite.

   ⚠ Cet outil ne tranche PAS seul. Il donne le second moyen, chiffré, à côté
   de la capture — et c'est la capture que Kily juge. Un grain qui gagne sur
   les quatre nombres mais salit à l'œil se retire quand même.
============================================================ */
import { serve, browser, openPage, VIEWPORTS } from './lib.mjs';

const args = process.argv.slice(2);
const page = args.find(a => !a.startsWith('--')) || 'index.html';
const selArg = args.find(a => a.startsWith('--sel='));
const SEL = selArg ? selArg.slice('--sel='.length) : 'body';

const lum = (r, g, b) => {
  const f = c => { c /= 255; return c <= .03928 ? c / 12.92 : ((c + .055) / 1.055) ** 2.4; };
  return .2126 * f(r) + .7152 * f(g) + .0722 * f(b);
};

/* Une colonne de pixels, décodée depuis un PNG de capture via canvas. */
async function colonne(pg, { grain }) {
  await pg.evaluate(on => {
    document.getElementById('qa-grain-off')?.remove();
    if (!on) {
      const s = document.createElement('style');
      s.id = 'qa-grain-off';
      /* ⚠ DÉFAUT D'INSTRUMENT CORRIGÉ (R98/1, le 8ᵉ de ce harnais).
         La première version posait `background-image: none` sur .sky et les
         sections. Or le grain n'est qu'UNE COUCHE parmi d'autres dans ces
         fonds (`background: var(--noise), radial-gradient(…), …`), et le
         ciel est lui-même un background-image : la règle effaçait donc LES
         DÉGRADÉS ET LE CIEL en même temps que le grain. On comparait deux
         fonds différents, pas deux grains — et la mesure annonçait « le
         grain n'apporte rien » sur un fond qui n'était pas le bon.

         Le remède neutralise le grain À LA SOURCE, dans le token : la
         couche existe toujours, elle ne peint simplement plus rien
         (`none` est une valeur d'image valide dans une liste de couches).
         Tout le reste du fond — dégradés, ciel, photos — est intact. */
      s.textContent = ':root, html { --noise: none !important; }';
      document.head.appendChild(s);
    }
  }, grain);
  await pg.waitForTimeout(120);

  return pg.evaluate(async sel => {
    const el = document.querySelector(sel) || document.body;
    /* La capture est en coordonnées de VIEWPORT : un élément sous la ligne
       de flottaison serait clippé hors image et on mesurerait du vide. */
    if (el !== document.body) {
      el.scrollIntoView({ block: 'center', behavior: 'instant' });
      await new Promise(r => setTimeout(r, 250));
    }
    const r = el.getBoundingClientRect();
    const h = Math.min(Math.floor(r.height) || innerHeight, innerHeight);
    /* Colonne prise à 4 % du bord par défaut : au centre on traverse le
       contenu (titres, photos), et on mesurerait le CONTENU au lieu du
       FOND. Réglable — sur un fond chargé, une colonne mal placée croise
       une arête et produit un « saut max » qui n'est pas du banding. */
    const x = Math.floor(innerWidth * (window.__qaX ?? 0.04));
    /* html2canvas n'existe pas (zéro dépendance) : on lit les pixels
       réellement peints via l'API de capture de la page côté Playwright.
       Ici on ne fait que renvoyer la géométrie ; la lecture est faite
       au-dessus, sur le PNG. */
    return { x, top: Math.max(0, Math.floor(r.top)), h };
  }, SEL);
}

/* Masque le CONTENU pour ne mesurer que le fond.
   Sans ça, la colonne capturée traverse titres, photos et cartes, et le
   « saut max » relevé est une ARÊTE de contenu, pas une bande du dégradé
   — mesuré 0,85 de saut là où un dégradé de nuit ne dépasse pas 0,01.
   On mesurerait la page ; la question porte sur le fond. */
async function masqueContenu(pg, on) {
  await pg.evaluate(o => {
    document.getElementById('qa-fond-seul')?.remove();
    if (!o) return;
    const s = document.createElement('style');
    s.id = 'qa-fond-seul';
    /* On masque TOUT sauf la couche de fond, plutôt que d'énumérer les
       coupables. L'énumération a échoué une première fois : `main` masqué,
       .manifesto restait visible (une règle plus spécifique la remontait)
       et un .toast crème traînait en bas de fenêtre — d'où un « saut max »
       de 0,85 qui n'était pas du banding mais du contenu.
       Une liste de ce qu'on cache est toujours incomplète ; une liste de
       ce qu'on garde ne l'est jamais. */
    s.textContent = 'body > *:not(.sky) { visibility: hidden !important; }'
      + ' .sky { visibility: visible !important; }'
      + ' .sky > *:not(.sky-grade) { visibility: hidden !important; }'
      + ' .sky-grade { visibility: visible !important; }'
      /* --scene : on garde les faisceaux et la brume. C'est LE régime qui
         décide du sort du grain — screen relève les valeurs basses, et
         un grain qui texture proprement sur du #04070F nu peut devenir du
         bruit dès qu'une lumière passe dessus. */
      + (window.__qaScene ? ' .sky .beams, .sky .beams *, .sky .haze { visibility: visible !important; }' : '');
    document.head.appendChild(s);
  }, on);
  await pg.waitForTimeout(120);
}

async function mesure(pg, grain) {
  const geo = await colonne(pg, { grain });
  const buf = await pg.screenshot({
    clip: { x: geo.x, y: geo.top, width: 1, height: Math.max(1, geo.h) },
  });
  /* Décodage du PNG par le navigateur lui-même — aucune bibliothèque. */
  const px = await pg.evaluate(async b64 => {
    const img = new Image();
    img.src = 'data:image/png;base64,' + b64;
    await img.decode();
    const c = document.createElement('canvas');
    c.width = img.width; c.height = img.height;
    const ctx = c.getContext('2d', { willReadFrequently: true });
    ctx.drawImage(img, 0, 0);
    const d = ctx.getImageData(0, 0, img.width, img.height).data;
    const out = [];
    for (let i = 0; i < d.length; i += 4) out.push([d[i], d[i + 1], d[i + 2]]);
    return out;
  }, buf.toString('base64'));

  const L = px.map(([r, g, b]) => lum(r, g, b));
  const marches = new Set(L.map(v => v.toFixed(6))).size;

  let sautMax = 0, plateau = 1, plateauMax = 1;
  for (let i = 1; i < L.length; i++) {
    const d = Math.abs(L[i] - L[i - 1]);
    if (d > sautMax) sautMax = d;
    if (d === 0) { plateau++; if (plateau > plateauMax) plateauMax = plateau; }
    else plateau = 1;
  }

  /* Bruit résiduel : on retire la tendance locale (moyenne glissante 9) et on
     mesure l'écart-type de ce qui reste. Le dégradé lui-même ne compte donc
     pas comme du bruit — seul le grain compte. */
  const res = [];
  for (let i = 4; i < L.length - 4; i++) {
    let m = 0; for (let k = -4; k <= 4; k++) m += L[i + k];
    res.push(L[i] - m / 9);
  }
  const moy = res.reduce((a, b) => a + b, 0) / (res.length || 1);
  const amplitude = Math.sqrt(res.reduce((a, b) => a + (b - moy) ** 2, 0) / (res.length || 1));

  return { lignes: L.length, marches, sautMax, plateauMax, amplitude };
}

const fmt = n => (n < 0.001 ? n.toExponential(2) : n.toFixed(5));

const srv = await serve();
const b = await browser();
try {
  const ctx = await b.newContext({ viewport: VIEWPORTS.desktop });
  const pg = await openPage(ctx, page, { theme: 'dark' });
  const xArg = args.find(a => a.startsWith('--x='));
  if (xArg) await pg.evaluate(v => { window.__qaX = v; }, Number(xArg.slice('--x='.length)));
  await pg.evaluate(() => scrollTo(0, 0));
  await pg.waitForTimeout(200);
  if (args.includes('--scene')) await pg.evaluate(() => { window.__qaScene = 1; });
  if (args.includes('--fond') || args.includes('--scene')) await masqueContenu(pg, true);

  const avec = await mesure(pg, true);
  const sans = await mesure(pg, false);

  console.log(`\nGRAIN — ${page}, sélecteur « ${SEL} », colonne de ${avec.lignes} px` +
    (args.includes('--fond') ? ' — CONTENU MASQUÉ (fond seul)' : '') + '\n');
  console.log('                   sans grain      avec grain     verdict');
  const ligne = (nom, a, b, mieux) => {
    const ok = mieux(b, a);
    console.log(`  ${nom.padEnd(16)} ${fmt(a).padStart(12)}  ${fmt(b).padStart(12)}     ${ok ? '✓' : '✗'}`);
    return ok;
  };
  const m = ligne('marches', sans.marches, avec.marches, (b, a) => b > a);
  const s = ligne('saut max', sans.sautMax, avec.sautMax, (b, a) => b <= a);
  const p = ligne('plateau max', sans.plateauMax, avec.plateauMax, (b, a) => b < a);
  console.log(`  ${'amplitude'.padEnd(16)} ${fmt(sans.amplitude).padStart(12)}  ${fmt(avec.amplitude).padStart(12)}`);

  console.log('');
  if (m && p) {
    console.log('→ Le grain DITHÈRE : il casse les plateaux du dégradé.');
    console.log(`  Bruit ajouté : ${fmt(avec.amplitude - sans.amplitude)} de luminance.`);
  } else if (!m && !p) {
    console.log('→ Le grain n\'apporte RIEN de mesurable sur ce fond.');
  } else {
    console.log('→ Résultat MIXTE — la capture tranche, pas ce tableau.');
  }
  console.log('\n⚠ Ce tableau est le SECOND moyen, pas le premier. La capture décide.\n');
} finally {
  await b.close();
  srv.close();
}
