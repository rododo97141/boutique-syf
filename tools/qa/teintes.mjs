/* ============================================================
   tools/qa/teintes.mjs — LA COULEUR DE L'ÉVÉNEMENT NE PASSE PAS
                          SOUS LE TEXTE
   ------------------------------------------------------------
   Chaque événement porte sa teinte (déclarée dans `events-data.js`).
   L'accueil, lui, ne bouge pas. La règle qui rend tout ça sûr tient en
   une phrase :

     LA COULEUR VIT DANS L'ATMOSPHÈRE, JAMAIS SOUS LE TEXTE.

   Elle vient de trois échecs de ce chantier, tous le même geste : un fond
   qui change sous un texte qui ne change pas. Une règle qu'on se contente
   d'écrire dans un commentaire est une règle qui sera enfreinte — celle-ci
   est donc MESURÉE.

   MOYEN 1 — L'INVARIANCE DES SURFACES DE LECTURE. La fiche est rendue avec
   CHAQUE teinte déclarée, et on relève `backgroundColor` / `color` de tous
   les blocs porteurs de texte. Ces relevés doivent être **identiques au
   caractère près** d'une teinte à l'autre. Le jour où quelqu'un écrit
   `background: var(--ev-teinte)` sur un bloc de lecture, ce test tombe —
   et il tombe en nommant le bloc.

   MOYEN 2 — LE CONTRASTE, SUR CHAQUE TEINTE, PAS SUR UN ÉCHANTILLON.
   Le contraste réel est recalculé pour chaque teinte déclarée. Mesurer
   une seule teinte et généraliser, c'est ce que fait quelqu'un qui a déjà
   décidé que ça passe.

   Les deux sont indépendants : le premier ne regarde pas la lisibilité,
   le second ne regarde pas d'où vient la couleur.

   ⚠ CE QU'IL NE FAIT PAS : juger si la teinte est JOLIE, ni si elle va
   avec la photo. Ça se regarde sur une capture, et c'est la décision de
   Kily — la mesure prouve que rien n'est cassé, jamais que c'est beau.

   Usage : node tools/qa/teintes.mjs
============================================================ */
import { serve, browser, VIEWPORTS, BASE, parseRGB, contrast } from './lib.mjs';

/* Les blocs qui PORTENT DU TEXTE sur une fiche événement. Cette liste est
   le périmètre du moyen 1, et elle est écrite ici plutôt que déduite :
   une liste déduite du DOM changerait avec le DOM, et cesserait
   silencieusement de couvrir ce qu'on veut protéger. */
const LECTURE = [
  '.ed-main', '.ed-title', '.ed-blurb', '.ed-meta', '.ed-organizer',
  '.ed-tickets', '.ed-tickets-title', '.tier', '.tier-info', '.ed-total',
  '.ed-share-note', '.ed-related-title', 'body'
];

const srv = await serve();
const b = await browser();
const lignes = [];
let echecs = 0;
const dit = (nom, ok, detail = '') => { lignes.push({ nom, ok, detail }); if (!ok) echecs++; };

try {
  const ctx = await b.newContext({ viewport: VIEWPORTS.desktop, reducedMotion: 'reduce' });
  await ctx.addInitScript(() => { try { localStorage.setItem('syfir-portal', 'in'); } catch (e) {} });

  // La liste des événements et de leurs teintes vient de la SOURCE, pas
  // d'une copie tapée ici : une copie divergerait au premier ajout.
  const sonde = await ctx.newPage();
  await sonde.goto(`${BASE}/evenements.html`, { waitUntil: 'load' });
  await sonde.waitForTimeout(1200);
  const evs = await sonde.evaluate(() => window.SYFIR.getAllEvents().map(e => ({
    id: String(e.id), nom: e.name, teinte: window.SYFIR.teinteOf(e), declaree: !!e.teinte
  })));
  const defaut = await sonde.evaluate(() => window.SYFIR.TEINTE_DEFAUT);
  await sonde.close();

  dit(`la source déclare ${evs.length} événement(s)`, evs.length > 0, evs.map(e => e.teinte).join(' '));
  dit('le repli existe et est une couleur valide', /^#[0-9a-f]{6}$/i.test(defaut), defaut);
  dit('les teintes déclarées sont toutes distinctes',
      new Set(evs.filter(e => e.declaree).map(e => e.teinte)).size === evs.filter(e => e.declaree).length,
      'sinon deux soirées auraient la même affiche');

  const surfaces = [];
  for (const ev of evs) {
    const pg = await ctx.newPage();
    await pg.goto(`${BASE}/evenement.html?id=${encodeURIComponent(ev.id)}`, { waitUntil: 'load' });
    await pg.waitForTimeout(1400);

    const r = await pg.evaluate(sels => {
      const doc = document.documentElement;
      const out = { posee: getComputedStyle(doc).getPropertyValue('--ev-teinte').trim(), lecture: {}, contrastes: [] };
      for (const s of sels) {
        const el = document.querySelector(s);
        if (!el) { out.lecture[s] = 'ABSENT'; continue; }
        const cs = getComputedStyle(el);
        out.lecture[s] = `${cs.backgroundColor}|${cs.color}`;
      }
      /* Pour le contraste on prend les blocs de texte réels et leur fond
         effectif composé — même méthode que contraste.mjs, étage 1. */
      const fondDe = el => {
        let n = el;
        while (n && n !== document.documentElement) {
          const c = getComputedStyle(n).backgroundColor;
          const m = c.match(/rgba?\(([^)]+)\)/);
          if (m) { const p = m[1].split(',').map(parseFloat); if ((p[3] === undefined ? 1 : p[3]) >= .95) return c; }
          n = n.parentElement;
        }
        return getComputedStyle(document.body).backgroundColor;
      };
      for (const s of ['.ed-title', '.ed-blurb', '.ed-tickets-title', '.ed-total']) {
        const el = document.querySelector(s);
        if (!el) continue;
        out.contrastes.push({ sel: s, fg: getComputedStyle(el).color, bg: fondDe(el) });
      }
      return out;
    }, LECTURE);

    dit(`[${ev.nom.slice(0, 26)}] la teinte est posée sur la page`,
        r.posee.toLowerCase() === ev.teinte.toLowerCase(), `${r.posee || '(rien)'} attendu ${ev.teinte}`);

    // moyen 2 — le contraste, pour CETTE teinte
    for (const c of r.contrastes) {
      const fg = parseRGB(c.fg), bg = parseRGB(c.bg);
      if (!fg || !bg) continue;
      const ratio = contrast(fg, bg);
      const seuil = 4.5;
      if (ratio < seuil) dit(`[${ev.teinte}] contraste ${c.sel}`, false, `${ratio}:1 (< ${seuil})`);
    }
    surfaces.push({ ev, lecture: r.lecture });
    await pg.close();
  }

  // moyen 1 — l'invariance : toutes les fiches doivent rendre les MÊMES
  // surfaces de lecture, quelle que soit la teinte.
  if (surfaces.length >= 2) {
    /* ⚠ UN BLOC ABSENT N'EST PAS UN BLOC DIFFÉRENT. « Tu aimeras aussi »
       ne se rend que s'il existe des événements voisins : sur une fiche
       sans voisin, `.ed-related-title` n'existe pas. Compter cette absence
       comme une divergence de couleur, c'était accuser du CONTENU au nom
       du style — mesuré au premier passage, et corrigé plutôt que toléré.
       On ne compare donc que là où le bloc existe, et on DIT sur combien
       de fiches la comparaison a réellement porté : une comparaison sur
       une seule fiche ne prouve rien et doit se voir. */
    let comparees = 0, invariantes = 0;
    for (const s of LECTURE) {
      const presentes = surfaces.filter(x => x.lecture[s] !== 'ABSENT');
      if (presentes.length < 2) {
        dit(`INVARIANT ${s} — NON TESTÉ`, true, `présent sur ${presentes.length} fiche(s) seulement`);
        continue;
      }
      comparees++;
      const ref = presentes[0].lecture[s];
      const ok = presentes.every(x => x.lecture[s] === ref);
      if (ok) invariantes++;
      else dit(`INVARIANT ${s}`, false, presentes.map(x => `${x.ev.teinte}→${x.lecture[s]}`).join('  '));
    }
    dit(`surfaces de lecture IDENTIQUES d'une teinte à l'autre`,
        comparees > 0 && invariantes === comparees,
        `${invariantes}/${comparees} comparables, sur ${surfaces.length} teintes — la couleur ne passe jamais sous le texte`);
  } else {
    dit('assez d\'événements pour comparer les teintes entre elles', false,
        `${surfaces.length} — l'invariance ne peut pas être testée sur une seule fiche`);
  }
} finally { await b.close(); srv.close(); }

console.log('\nLA COULEUR DE L\'ÉVÉNEMENT — ATMOSPHÈRE OUI, TEXTE JAMAIS\n');
for (const l of lignes) console.log(`  ${l.ok ? '✓' : '✗'} ${l.nom.padEnd(62)} ${l.detail}`);
console.log(`\n  ${lignes.length - echecs}/${lignes.length} vérifications vertes.`);
console.log('  Moyen 1 = invariance des surfaces de lecture d\'une teinte à l\'autre.');
console.log('  Moyen 2 = contraste recalculé sur CHAQUE teinte déclarée, pas sur un échantillon.');
console.log('  ⚠ Aucun des deux ne dit si la teinte est belle : ça se regarde, et ça se tranche.\n');
process.exit(echecs ? 1 : 0);
