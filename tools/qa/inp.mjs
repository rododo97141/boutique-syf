/* ============================================================
   tools/qa/inp.mjs — LE TEMPS QU'UN BOUTON MET À RÉPONDRE (INP)
   ------------------------------------------------------------
   L'angle mort le plus embarrassant de ce harnais : on a construit une
   chasse aux boutons muets — `muets.mjs` puis `clics.mjs` — **sans jamais
   mesurer le temps que met un bouton à répondre**. On sait dire si une
   commande répond ; on ne savait pas dire si elle répond VITE.

   INP (Interaction to Next Paint) est la métrique qui compte pour un site
   où l'on réserve, filtre et cherche : elle mesure du geste jusqu'à la
   PEINTURE suivante, donc y compris le temps de rendu — là où LCP et CLS
   ne regardent que le chargement.

   Seuil visé : **200 ms** (« bon » au sens des Core Web Vitals).

   COMMENT C'EST MESURÉ, et pourquoi pas autrement :

   · `PerformanceObserver` sur `event` avec `durationThreshold: 0`, qui
     rend la durée réelle d'interaction telle que le navigateur la calcule
     — du geste jusqu'au prochain rendu. C'est la source dont se sert
     l'API web-vitals, pas une horloge à nous.
   · Chaque interaction est jouée sur une page NEUVE. Enchaîner les
     interactions sur une même page mesurerait un moteur déjà chaud, et
     rendrait des chiffres plus flatteurs que la réalité d'un visiteur.
   · **Le processeur est bridé ×4**, comme `lcp.mjs`. Sur la machine de
     l'atelier, tout répond en quelques millisecondes et la mesure ne dit
     rien du téléphone de quelqu'un — or plus de 65 % du trafic d'un site
     d'événements vient du mobile.
   · **Trois passes, on garde le PIRE.** L'INP réel d'une session est le
     pire de ses interactions (au 98e centile), pas leur moyenne. Prendre
     la médiane ici raconterait une histoire plus jolie que celle vécue.
   · Viewport **390 px** : c'est l'écran principal, pas un cas limite.

   ⚠ CE QU'IL NE MESURE PAS : le réseau. Les interactions jouées ici sont
   locales par construction (aucune ne dépend d'un serveur), donc la
   mesure porte sur le coût de calcul et de rendu, et sur rien d'autre.

   Usage : node tools/qa/inp.mjs [--passes=3]
============================================================ */
import { serve, browser, BASE } from './lib.mjs';

const passes = Number((process.argv.find(a => a.startsWith('--passes=')) || '').split('=')[1]) || 3;
const SEUIL = 200;
const CPU = 4;

/* Chaque scénario = une interaction RÉELLE du site, jouée sur une page
   neuve. `avant` prépare l'état, `geste` est ce que le visiteur fait. */
const SCENARIOS = [
  { nom: 'ouvrir le voile d\'entrée', page: 'index.html', frais: true,
    geste: '#portalEnter' },
  { nom: 'ouvrir la recherche (méga-menu)', page: 'index.html',
    geste: '#searchBtn' },
  { nom: 'ouvrir « Mon espace »', page: 'index.html',
    geste: '#clientSpaceBtn' },
  { nom: 'filtrer la billetterie', page: 'evenements.html',
    geste: '.chip[data-filter="rooftop"]' },
  { nom: 'ouvrir le tunnel billets', page: 'evenements.html',
    geste: '[data-tickets]' },
  { nom: 'ajouter un billet (+)', page: 'evenement.html?id=demo-rooftop-1',
    geste: '.qty-btn[data-delta="1"][data-tier="1"]' },
  { nom: 'RÉSERVER — le clic principal', page: 'evenement.html?id=demo-rooftop-1',
    avant: '.qty-btn[data-delta="1"][data-tier="1"]', geste: '#edBuy' },
  { nom: 'trier les partenaires', page: 'partenaires.html',
    geste: '.chip[data-sort="chrono"]' },
  { nom: 'aimer un événement (♥)', page: 'evenements.html',
    geste: '.fav-btn' },
  { nom: 'soumettre le formulaire de contact', page: 'partenaires.html',
    remplir: true, geste: '#partnerForm button[type="submit"]' }
];

const srv = await serve();
const b = await browser();
const resultats = new Map();

try {
  for (let passe = 1; passe <= passes; passe++) {
    const ctx = await b.newContext({ viewport: { width: 390, height: 844 } });
    for (const sc of SCENARIOS) {
      const pg = await ctx.newPage();
      if (!sc.frais) await pg.addInitScript(() => { try { localStorage.setItem('syfir-portal', 'in'); } catch (e) {} });
      // le formulaire ne doit pas partir sur le réseau : on répond à sa place
      await pg.route('**api.web3forms.com**', r => r.fulfill({ status: 200, contentType: 'application/json', body: '{"success":true}' }));

      const cdp = await ctx.newCDPSession(pg);
      await cdp.send('Emulation.setCPUThrottlingRate', { rate: CPU });

      const rep = await pg.goto(`${BASE}/${sc.page}`, { waitUntil: 'load' }).catch(() => null);
      if (!rep) { await pg.close(); continue; }
      await pg.waitForTimeout(1600);

      await pg.evaluate(() => {
        window.__inp = 0;
        new PerformanceObserver(l => {
          for (const e of l.getEntries()) {
            if (e.interactionId) window.__inp = Math.max(window.__inp, e.duration);
          }
        }).observe({ type: 'event', buffered: true, durationThreshold: 0 });
      });

      if (sc.remplir) {
        await pg.evaluate(() => {
          const $ = s => document.querySelector(s);
          $('input[name="requestType"][value="partenaire"]').checked = true;
          $('#pfName').value = 'Test INP'; $('#pfEmail').value = 'inp@exemple.fr';
          $('#pfPhone').value = '0690000000'; $('#pfContext').value = 'Mesure INP';
          $('#pfMessage').value = 'Mesure du délai de réponse, dix caractères au moins.';
          $('#pfMajeur').value = 'oui'; $('#pfConsent').checked = true;
        });
      }
      if (sc.avant) { await pg.click(sc.avant, { timeout: 5000 }).catch(() => {}); await pg.waitForTimeout(300); }

      let joue = true;
      try { await pg.click(sc.geste, { timeout: 6000 }); }
      catch (e) { joue = false; }
      await pg.waitForTimeout(1200);

      const inp = joue ? await pg.evaluate(() => Math.round(window.__inp || 0)) : null;
      const cle = sc.nom;
      const acc = resultats.get(cle) || { pire: 0, mesures: [], joue: false };
      if (inp !== null) { acc.joue = true; acc.mesures.push(inp); acc.pire = Math.max(acc.pire, inp); }
      resultats.set(cle, acc);
      await pg.close();
    }
    await ctx.close();
  }
} finally { await b.close(); srv.close(); }

console.log(`\nINP — DÉLAI ENTRE LE GESTE ET LA PEINTURE  ·  390 px · CPU ×${CPU} · ${passes} passes, on garde le PIRE`);
console.log(`Seuil « bon » : ${SEUIL} ms.\n`);
let hors = 0, injouables = 0;
for (const [nom, r] of resultats) {
  if (!r.joue) { injouables++; console.log(`  ⚠ NON JOUÉ   ${nom}`); continue; }
  const ok = r.pire <= SEUIL;
  if (!ok) hors++;
  console.log(`  ${ok ? '✓' : '✗'} ${String(r.pire).padStart(5)} ms   ${nom.padEnd(38)} (passes : ${r.mesures.join(', ')} ms)`);
}
console.log(`\n  ${resultats.size - hors - injouables}/${resultats.size - injouables} interaction(s) sous ${SEUIL} ms.`);
if (injouables) console.log(`  ⚠ ${injouables} interaction(s) non jouée(s) — ce n'est pas un succès, c'est une question.`);
console.log('  Le chiffre affiché est le PIRE des passes : l\'INP vécu est le pire cas,');
console.log('  pas la moyenne. Arrondir vers le bas ici reviendrait à se mentir.\n');
process.exit(hors ? 1 : 0);
