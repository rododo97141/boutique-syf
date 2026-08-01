/* ============================================================
   tools/qa/maquette.mjs
   ------------------------------------------------------------
   L'ACCUEIL EST-IL LA MAQUETTE ? Sélecteur par sélecteur, propriété par
   propriété, sur le style CALCULÉ de l'élément réel.

   POURQUOI CET OUTIL EXISTE. Quatre tours durant, l'accueil a porté les
   classes DU SITE (home-hero, manifesto, next-events, section-dark,
   eco-grid…) auxquelles on appliquait les valeurs de la maquette. Chacune
   traîne des centaines de lignes de CSS hérité — paddings, max-width,
   arrondis, fonds, ombres — qui se battaient contre ces valeurs. Bonne
   structure, mauvaise peau, et « ça correspond à mes valeurs » ne suffit
   plus : il faut LIRE CE QUE LE NAVIGATEUR A CALCULÉ.

   TOUTE CASE FAUSSE EST UN HÉRITAGE QUI A SURVÉCU. On la traque jusqu'à
   sa règle et on la retire — on ne la surcharge pas. Une surcharge laisse
   vivre l'héritage, et l'héritage finit toujours par gagner ailleurs.

   ⚠ ON MESURE LE RÉSULTAT, PAS LA DÉCLARATION. `getComputedStyle` rend la
   valeur RÉSOLUE : les clamp() sont calculés, les var() substituées, la
   cascade tranchée. C'est le navigateur qui répond, pas la feuille.

   Les attendus dépendant du viewport (clamp) sont donnés par viewport.
============================================================ */
import { serve, browser, openPage, scrollToBottom, VIEWPORTS } from './lib.mjs';

/* Chaque ligne : [sélecteur, propriété, attendu desktop, attendu 390px]
   `null` = pas d'attendu à cette taille (on affiche sans juger). */
const CONTRAT = [
  // ---- 1. LE HERO ----
  ['.hero', 'display', 'grid', 'grid'],
  ['.hero', 'placeItems', 'center', 'center'],
  ['.hero', 'textAlign', 'center', 'center'],
  ['.hero', '_hauteurEcran', '100%', '100%'],       // min-height == innerHeight
  ['.hero-photo img', 'position', 'absolute', 'absolute'],
  ['.hero-photo img', 'objectFit', 'cover', 'cover'],
  ['.hero-photo img', 'opacity', '0.5', '0.5'],
  ['.marque', 'fontSize', '210px', '58.5px'],
  ['.marque', 'letterSpacing', '-10.5px', '-2.925px'],
  ['.marque', 'lineHeight', '180.6px', '50.31px'],
  ['.sous', 'fontSize', '11px', '11px'],
  ['.sous', 'letterSpacing', '5.5px', '5.5px'],
  ['.sous', 'color', 'rgb(233, 201, 136)', 'rgb(233, 201, 136)'],
  ['.tag', 'fontStyle', 'italic', 'italic'],
  ['.actions', 'display', 'flex', 'flex'],
  ['.actions', 'justifyContent', 'center', 'center'],
  ['.btn-1', 'backgroundColor', 'rgb(255, 250, 240)', 'rgb(255, 250, 240)'],
  ['.btn-1', 'borderRadius', '100px', '100px'],
  ['.btn-2', 'backgroundColor', 'rgba(0, 0, 0, 0)', 'rgba(0, 0, 0, 0)'],

  // ---- 2. LE BLOC CONTENU ----
  ['.sec', 'maxWidth', '1240px', '1240px'],
  ['.sec', 'paddingLeft', '26px', '26px'],
  ['.sec', 'backgroundColor', 'rgba(0, 0, 0, 0)', 'rgba(0, 0, 0, 0)'],
  ['.sec', 'backgroundImage', 'none', 'none'],
  ['.eyebrow', 'fontSize', '11px', '11px'],
  ['.eyebrow', 'letterSpacing', '3.3px', '3.3px'],
  ['.eyebrow', 'color', 'rgb(233, 201, 136)', 'rgb(233, 201, 136)'],
  ['.sec h2', 'fontSize', '66px', '34px'],
  ['.sec h2', 'textTransform', 'uppercase', 'uppercase'],
  ['.sec h2 em', 'fontStyle', 'italic', 'italic'],
  ['.sec h2 em', 'textTransform', 'none', 'none'],
  ['.lead', 'maxWidth', '60ch', '60ch'],

  // ---- 3. LE PLEIN CADRE ----
  ['.plein', '_min96', 'oui', 'oui'],               // min-height == 96% de innerHeight
  ['.plein', 'padding', '0px', '0px'],
  ['.plein img', 'position', 'absolute', 'absolute'],
  ['.plein img', 'objectFit', 'cover', 'cover'],
  ['.plein img', 'opacity', '0.56', '0.56'],
  ['.plein .bloc', 'maxWidth', '36ch', 'none'],

  // ---- 4. LES DATES ----
  ['.dates', 'display', 'grid', 'grid'],
  ['.dates', 'gap', '2px', '2px'],
  ['.dates', 'backgroundColor', 'rgba(238, 242, 248, 0.1)', 'rgba(238, 242, 248, 0.1)'],
  ['.dates', 'padding', '0px', '0px'],
  ['.date', 'minHeight', '400px', '400px'],
  ['.date', 'borderRadius', '0px', '0px'],
  ['.date', 'margin', '0px', '0px'],
  ['.date img', 'position', 'absolute', 'absolute'],
  ['.date img', 'objectFit', 'cover', 'cover'],
  ['.date img', 'opacity', '0.55', '0.55'],
  ['.puce', 'position', 'absolute', 'absolute'],
  ['.puce', 'top', '22px', '22px'],
  ['.puce', 'left', '22px', '22px'],
  ['.date .quand', 'position', 'absolute', 'absolute'],
  ['.date h3', 'position', 'absolute', 'absolute'],
  ['.date .ou', 'position', 'absolute', 'absolute'],

  // ---- 5. L'ÉCOSYSTÈME ----
  ['.eco', 'display', 'grid', 'grid'],
  ['.eco', 'gap', '18px', '18px'],
  ['.eco .c', 'backgroundColor', 'rgba(238, 242, 248, 0.04)', 'rgba(238, 242, 248, 0.04)'],
  ['.eco .c', 'borderRadius', '14px', '14px'],

  // ---- 6. LE PIED DE PAGE ----
  /* clamp(50px, 12vw, 150px) : à 390 px, 12vw = 46,8 px, mais le MINIMUM
     de 50 px l'emporte. Mon premier attendu était 46,8 — j'avais calculé
     le vw sans appliquer la borne basse. C'est le CSS qui avait raison ;
     l'erreur était dans le contrat de vérification, pas dans la page. */
  ['.signe', 'fontSize', '150px', '50px'],
  ['.signe', 'opacity', '0.14', '0.14'],
];

const srv = await serve();
const b = await browser();
let echecs = 0;

try {
  for (const [nom, vp] of [['desktop', VIEWPORTS.desktop], ['390 px', VIEWPORTS.mobile]]) {
    const idx = nom === 'desktop' ? 2 : 3;
    const ctx = await b.newContext({ viewport: vp });
    const pg = await openPage(ctx, 'index.html');
    await scrollToBottom(pg);
    await pg.evaluate(() => scrollTo(0, 0));
    await pg.waitForTimeout(400);

    const releves = await pg.evaluate(lignes => {
      const out = [];
      for (const [sel, prop] of lignes) {
        const el = document.querySelector('.page-home ' + sel) || document.querySelector(sel);
        if (!el) { out.push('ÉLÉMENT ABSENT'); continue; }
        const cs = getComputedStyle(el);
        if (prop === '_hauteurEcran') {
          /* Le résultat, pas la déclaration : on compare la hauteur
             RENDUE à celle de la fenêtre. `min-height: 100svh` déclaré ne
             prouve rien si une règle héritée impose une autre hauteur. */
          out.push(Math.round(el.getBoundingClientRect().height / innerHeight * 100) + '%');
        } else if (prop === '_min96') {
          const h = el.getBoundingClientRect().height;
          out.push(h >= innerHeight * 0.95 ? 'oui' : 'non (' + Math.round(h) + 'px)');
        } else {
          out.push(cs[prop]);
        }
      }
      return out;
    }, CONTRAT.map(l => [l[0], l[1]]));

    console.log(`\n═══ ${nom} ═══`);
    console.log('  sélecteur                propriété           attendu                        mesuré');
    let ko = 0;
    for (let i = 0; i < CONTRAT.length; i++) {
      const [sel, prop] = CONTRAT[i];
      const attendu = CONTRAT[i][idx];
      const mesure = releves[i];
      if (attendu === null) continue;
      /* maxWidth en `ch` est résolu en px par le navigateur : on accepte
         toute valeur en px non nulle, la limite existe. */
      const ok = String(mesure) === String(attendu)
        || (String(attendu).endsWith('ch') && /^\d+(\.\d+)?px$/.test(String(mesure)));
      if (!ok) { ko++; echecs++; }
      console.log(`  ${ok ? '✓' : '✗'} ${sel.padEnd(22)} ${prop.padEnd(19)} ${String(attendu).padEnd(30)} ${mesure}`);
    }
    console.log(`  → ${CONTRAT.length - ko}/${CONTRAT.length} conformes${ko ? `, ${ko} HÉRITAGE(S) SURVIVANT(S)` : ''}`);
    await ctx.close();
  }
} finally {
  await b.close(); srv.close();
}

console.log(`\n${echecs === 0
  ? '✓ l\'accueil est conforme au contrat de la maquette, aux deux tailles.'
  : `✗ ${echecs} case(s) fausse(s) — chacune est un héritage à traquer jusqu'à sa règle.`}\n`);
process.exit(echecs ? 1 : 0);
