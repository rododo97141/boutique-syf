/* ============================================================
   tools/qa/maquette.mjs
   ------------------------------------------------------------
   L'ACCUEIL EST-IL LA MAQUETTE ? On ne compare plus l'accueil à un
   TABLEAU TAPÉ À LA MAIN : on rend LA MAQUETTE ELLE-MÊME dans le même
   navigateur, et on compare les styles CALCULÉS des deux pages,
   sélecteur par sélecteur, propriété par propriété.

   POURQUOI CE CHANGEMENT D'INSTRUMENT. Cinq lots durant, l'accueil a été
   vérifié contre un RÉSUMÉ ÉCRIT de `maquettes/3-LUMIERE-DE-SCENE.html`,
   pas contre le fichier — il n'était pas dans le dépôt. Un tableau tapé
   à la main hérite de toutes les erreurs de lecture de celui qui le
   tape : il a par exemple annoncé `h2 em` en OR alors que la maquette le
   met en BLEU CLAIR, et rien ne pouvait le contredire.
   Ici, la référence est le fichier. Il ne peut pas se tromper sur
   lui-même.

   CE QUE ÇA MESURE, ET CE QUE ÇA NE MESURE PAS. On compare le RÉSULTAT
   résolu par le navigateur : clamp calculés, var substituées, cascade
   tranchée, héritage appliqué. Un écart est donc soit une valeur
   différente, soit un héritage du site qui a survécu — les deux se
   corrigent, jamais en surchargeant.

   ⚠ LES DEUX PAGES DOIVENT ÊTRE MESURÉES AU MÊME VIEWPORT, sinon tous
   les clamp() divergent et l'outil hurle sur du bruit.

   ⚠ Les images de la maquette (`img/…`) n'existent pas dans le dépôt.
   Sans importance : on compare le CSS et l'ossature, et ces images sont
   en `position:absolute; inset:0; width:100%; height:100%`, donc leur
   géométrie ne dépend pas du fichier chargé.
============================================================ */
import { serve, browser, VIEWPORTS, BASE } from './lib.mjs';

/* Les propriétés qui font la peau. On ne compare pas TOUT : la position
   exacte d'un élément dépend du contenu réel, qui diffère légitimement
   (la maquette a 3 dates de démonstration, l'accueil en a 4). */
const PROPS = [
  'display', 'position', 'flexDirection', 'justifyContent', 'alignItems', 'placeItems',
  'gridTemplateColumns', 'gap', 'isolation',
  'fontFamily', 'fontSize', 'fontWeight', 'fontStyle', 'lineHeight', 'letterSpacing',
  'textTransform', 'textAlign', 'color',
  'backgroundColor', 'backgroundImage',
  'padding', 'margin', 'maxWidth', 'minHeight',
  'borderRadius', 'borderTopWidth', 'borderTopColor', 'borderTopStyle',
  'opacity', 'objectFit', 'zIndex', 'overflow', 'textShadow', 'boxShadow', 'filter',
];

/* [nom lisible, sélecteur côté MAQUETTE, sélecteur côté ACCUEIL] */
const PAIRES = [
  ['body (la base)',      'body',              '.page-home'],
  ['.hero',               '.hero',             '.hero'],
  ['.hero-photo',         '.hero-photo',       '.hero-photo'],
  ['.hero-photo img',     '.hero-photo img',   '.hero-photo img'],
  ['.marque',             '.marque',           '.marque'],
  ['.sous',               '.hero .sous',       '.hero .sous'],
  ['.tag',                '.hero .tag',        '.hero .tag'],
  ['.actions',            '.actions',          '.actions'],
  ['.btn-1',              '.btn-1',            '.btn-1'],
  ['.btn-2',              '.btn-2',            '.btn-2'],
  ['.sec',                '.sec',              '.sec'],
  ['.eyebrow',            '.eyebrow',          '.eyebrow'],
  ['h2',                  '.sec h2',           '.sec h2'],
  ['h2 em',               '.sec h2 em',        '.sec h2 em'],
  ['.lead',               '.lead',             '.lead'],
  ['.plein',              '.plein',            '.plein'],
  ['.plein img',          '.plein img',        '.plein img'],
  ['.plein .dedans',      '.plein .dedans',    '.plein .dedans'],
  ['.plein .bloc',        '.plein .bloc',      '.plein .bloc'],
  ['.dates',              '.dates',            '.dates'],
  ['.date',               '.date',             '.date'],
  ['.date img',           '.date img',         '.date img'],
  ['.puce',               '.puce',             '.puce'],
  ['.date .quand',        '.date .quand',      '.date .quand'],
  ['.date h3',            '.date h3',          '.date h3'],
  ['.date .ou',           '.date .ou',         '.date .ou'],
  ['.eco',                '.eco',              '.eco'],
  ['.eco .c',             '.eco .c',           '.eco .c'],
  ['.eco .c b',           '.eco .c b',         '.eco .c b'],
  ['.eco .c span',        '.eco .c span',      '.eco .c span'],
  ['footer',              'footer',            'footer'],
  ['.f-in',               '.f-in',             '.f-in'],
  ['.signe',              '.signe',            '.signe'],
  ['.sante',              '.sante',            '.sante'],
];

/* Écarts ATTENDUS et assumés : le site n'est pas la maquette sur ces
   points, pour des raisons documentées. Chacun doit être justifié, sinon
   c'est une excuse déguisée en exception. */
/* Les clés portent la couche : « .eyebrow.color » pour l'élément,
   « .eyebrow::before.présence » pour un pseudo en trop. */
const TOLERES = {
  /* ⚠ `body.backgroundColor` N'EST PLUS TOLÉRÉ (R103). Le motif inscrit
     ici — « le fond de l'accueil est peint par la couche .sky » — était
     une EXCUSE DÉGUISÉE EN EXCEPTION, exactement ce que l'en-tête de ce
     bloc interdit. La mesure l'a démentie : .sky est `position: fixed`,
     donc il ne couvre QUE la fenêtre courante ; dans une capture pleine
     page il ne se peint qu'une fois et c'est le fond du body qui sort —
     gris neutre 17,17,17 sur l'accueil, bleu 4,7,15 sur la maquette.
     L'écart est désormais compté, et corrigé côté CSS. */
  'body (la base).backgroundImage': 'le grain --noise du site, absent de la maquette : survivant soumis à arbitrage, pas encore tranché',
  'body (la base).margin': 'la maquette pose margin:0 sur body ; le site l’a déjà via son reset',
  'body (la base).overflow': 'overflow-x:hidden posé ailleurs dans le site',
  'body (la base).minHeight': 'hauteur de page réelle, dépend du contenu',
  'body (la base).maxWidth': 'idem',
  'body (la base).padding': 'idem',
  'footer.zIndex': 'le pied de page du site vit hors <main> ; z-index géré par R96',
  '.dates.gridTemplateColumns': 'minmax(min(290px,100%),1fr) au lieu de minmax(290px,1fr) : évite un débordement à 390 px, mesuré',
  '.eco.gridTemplateColumns': 'idem, borne min(215px,100%)',
  /* Le site pose `img{display:block; max-width:100%}` (style.css §01), un
     reset sain que la maquette n'a pas. INERTIE PROUVÉE PAR MESURE, pas
     supposée : les trois images concernées sont en position absolue ou
     remplissent exactement leur parent, et la boîte rendue de
     `.hero-photo img` est IDENTIQUE AU PIXEL des deux côtés —
     1527x954 @-43,-27. Les largeurs de `.plein img` et `.date img`
     diffèrent seulement parce que la maquette a 3 dates et l'accueil 4
     (1440/3 = 480 contre 1438/4 = 359) : c'est du contenu, pas du style.
     On garde le reset du site plutôt que de le dégrader pour épouser une
     absence. */
  '.hero-photo img.display': 'reset img du site, inertie mesurée (boîte identique au pixel)',
  '.hero-photo img.maxWidth': 'idem',
  '.plein img.maxWidth': 'idem — image en absolute inset:0, max-width sans effet',
  '.date img.maxWidth': 'idem',
};

const norm = (s) => String(s)
  .replace(/\s+/g, ' ')
  .replace(/"/g, '')
  .trim();

/* Les familles de police : la maquette liste « Unbounded » nu, le site
   « 'Unbounded', sans-serif ». On compare la PREMIÈRE famille. */
const famille = (s) => norm(s).split(',')[0].toLowerCase();

const srv = await serve();
const b = await browser();
let ecarts = 0, toleres = 0;

try {
  for (const [nomVp, vp] of [['desktop', VIEWPORTS.desktop], ['390 px', VIEWPORTS.mobile]]) {
    const ctx = await b.newContext({ viewport: vp });

    const lire = async (url, sels) => {
      const pg = await ctx.newPage();
      await pg.goto(url, { waitUntil: 'domcontentloaded' });
      await pg.waitForTimeout(1200);
      /* Les blocs `.rev` de la maquette démarrent à opacity:0 : on les
         révèle, sinon on comparerait un état transitoire. Même chose pour
         les `.reveal` du site s’il en restait. */
      /* On force l'état FINAL par CSS, et on coupe les transitions : les
         classer « in » puis attendre ne suffit pas — la transition de 1 s
         reste en vol et on mesure 0,016 au lieu de 1. */
      await pg.evaluate(() => {
        const st = document.createElement('style');
        st.textContent = '.rev,.reveal{opacity:1!important;transform:none!important;'
          + 'transition:none!important;transition-delay:0s!important}';
        document.head.appendChild(st);
        document.querySelectorAll('.rev, .reveal').forEach(e => e.classList.add('in'));
      });
      await pg.waitForTimeout(600);
      /* ⚠ DEUX SOURCES DE BRUIT À NEUTRALISER, sans quoi l'outil hurle
         sur des états transitoires et non sur des écarts :
         1. les blocs `.rev` de la maquette montent de opacity 0 à 1 en
            1 s — mesurés en vol ils donnent 0,016 contre 1 ;
         2. le bouton principal anime son anneau à 1,034 s — deux pages
            échantillonnées à deux instants donnent deux box-shadow
            différents, ce qui n'est PAS un écart de style.
         On fige toutes les animations à t=0 et on force la fin des
         transitions. Même remède qu'en R93/1 sur ce harnais. */
      /* Le bouton principal anime son anneau à 1,034 s : deux pages
         échantillonnées à deux instants donnent deux box-shadow
         différents, ce qui n'est PAS un écart de style. On fige les
         animations au MÊME instant des deux côtés. */
      await pg.evaluate(() => {
        document.getAnimations().forEach(a => { try { a.pause(); a.currentTime = 0; } catch (e) {} });
      });
      await pg.waitForTimeout(300);
      const r = await pg.evaluate(({ sels, props }) => {
        const out = {};
        for (const s of sels) {
          const el = document.querySelector(s);
          if (!el) { out[s] = null; continue; }
          const lit = (pe) => {
            const cs = getComputedStyle(el, pe);
            const o = {};
            for (const p of props) o[p] = cs[p];
            /* `content` n'a de sens que sur un pseudo-élément, mais c'est
               LUI qui dit si le pseudo EXISTE : « none » = pas de pseudo. */
            if (pe) o.content = cs.content;
            return o;
          };
          out[s] = { el: lit(null), before: lit('::before'), after: lit('::after') };
        }
        return out;
      }, { sels, props: PROPS });
      await pg.close();
      return r;
    };

    const M = await lire(`${BASE}/maquettes/3-LUMIERE-DE-SCENE.html`, PAIRES.map(p => p[1]));
    const A = await lire(`${BASE}/index.html`, PAIRES.map(p => p[2]));

    console.log(`\n═══════════ ${nomVp} ═══════════`);
    let ko = 0, tol = 0;
    for (const [nom, sm, sa] of PAIRES) {
      const m = M[sm], a = A[sa];
      if (!m) { console.log(`  ⚠ ${nom} : absent de la MAQUETTE (${sm})`); continue; }
      if (!a) { console.log(`  ✗ ${nom} : absent de l'ACCUEIL (${sa})`); ko++; ecarts++; continue; }

      /* Trois couches par paire : l'élément, puis ses deux pseudo-éléments.
         C'est la leçon R104 : un ::before n'est PAS un sélecteur, donc les
         34 paires ne pouvaient pas le voir. Le losange doré posé devant
         chaque sur-titre par `syfir-ui/components.css` a traversé six lots
         d'écarts « 0 » — trouvé à l'œil par Kily, pas par l'instrument. */
      for (const [couche, suff] of [['el', ''], ['before', '::before'], ['after', '::after']]) {
        const cm = m[couche], ca = a[couche];

        /* PRÉSENCE AVANT VALEURS. Sur un pseudo qui n'existe pas, le
           navigateur répond quand même à toutes les propriétés (héritées
           ou initiales) : comparer ces valeurs-là ferait du bruit. La
           seule question qui vaille d'abord est « ce pseudo existe-t-il
           des deux côtés ? », et c'est `content` qui y répond. */
        if (suff) {
          const vm = cm.content === 'none', va = ca.content === 'none';
          if (vm && va) continue;                       // aucun des deux : rien à comparer
          if (vm !== va) {
            const cle = nom + suff + '.présence';
            if (TOLERES[cle]) { tol++; toleres++; continue; }
            ko++; ecarts++;
            console.log(`  ✗ ${(nom + suff).padEnd(18)} ${'PSEUDO EN TROP'.padEnd(20)}`
              + ` maquette « ${vm ? 'aucun' : cm.content.slice(0, 30)} »`);
            console.log(`    ${''.padEnd(18)} ${''.padEnd(20)} accueil  « ${va ? 'aucun' : ca.content.slice(0, 30)} »`);
            continue;                                   // inutile de détailler 34 propriétés d'un décor à supprimer
          }
        }

        for (const p of PROPS) {
          const vm = p === 'fontFamily' ? famille(cm[p]) : norm(cm[p]);
          const va = p === 'fontFamily' ? famille(ca[p]) : norm(ca[p]);
          if (vm === va) continue;
          const cle = nom + suff + '.' + p;
          if (TOLERES[cle]) { tol++; toleres++; continue; }
          ko++; ecarts++;
          console.log(`  ✗ ${(nom + suff).padEnd(18)} ${p.padEnd(20)} maquette « ${vm.slice(0, 46)} »`);
          console.log(`    ${''.padEnd(18)} ${''.padEnd(20)} accueil  « ${va.slice(0, 46)} »`);
        }
      }
    }
    console.log(`  → ${ko} écart(s)${tol ? `, ${tol} toléré(s) et documenté(s)` : ''}`);
    await ctx.close();
  }
} finally {
  await b.close(); srv.close();
}

console.log(`\n${ecarts === 0
  ? `✓ l'accueil est conforme au FICHIER de la maquette, aux deux tailles (${toleres} écarts tolérés et documentés).`
  : `✗ ${ecarts} écart(s) au fichier — chacun est soit une valeur fausse, soit un héritage du site qui a survécu.`}\n`);
process.exit(ecarts ? 1 : 0);
