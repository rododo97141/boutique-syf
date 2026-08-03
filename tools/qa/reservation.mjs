/* ============================================================
   tools/qa/reservation.mjs — LOT E/1 — LE PARCOURS DE RÉSERVATION
   ------------------------------------------------------------
   « Ce qui se clique doit répondre. » Le parcours va de bout en bout —
   choix d'un type de billet, confirmation, vrai billet avec son QR dans
   le profil, consultable hors ligne — et AUCUN paiement n'existe.

   ⚠ LA CORRECTION DE FAIT QUE CET OUTIL A APPORTÉE. La passation
   annonçait « `#edBuy` est disabled, on clique l'action principale et il
   ne se passe RIEN ». C'est FAUX, et seul le clic pouvait le dire : le
   bouton naît désactivé et s'active dès qu'une quantité passe à 1 — un
   garde-fou, pas un bouton mort. Le verdict venait de la lecture du code
   (`disabled` dans la chaîne HTML), pas de l'essai. C'est exactement la
   faute que la section 0 de HANDOFF.md décrit, dans l'autre sens : on ne
   condamne que ce qu'on a cliqué.

   Ce qui manquait vraiment, et que ce lot ajoute : la mention
   « démonstration », absente PARTOUT — message de confirmation, carte du
   pic, ligne de Mon espace, et charge utile du QR.

   DEUX MOYENS INDÉPENDANTS pour la mention :
     MOYEN 1 — le TEXTE rendu (ce que le visiteur lit).
     MOYEN 2 — la CHARGE UTILE DU QR, décodée depuis le SVG peint, donc
       ce qu'un scanner lira. Le second est aveugle au premier : effacer
       la phrase de la page ne toucherait pas le code, et réciproquement.

   LES DEUX PARCOURS SONT TESTÉS. Le tunnel existe en deux exemplaires —
   la modale de `evenements.html` et la fiche `evenement.html` — et une
   correction posée sur l'un a déjà toutes les chances d'oublier l'autre.

   Usage : node tools/qa/reservation.mjs [--captures]
============================================================ */
import { serve, browser, VIEWPORTS, BASE, ROOT } from './lib.mjs';
import { writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

const captures = process.argv.includes('--captures');
const DOSSIER = resolve(ROOT, 'tools/qa/captures');
if (captures && !existsSync(DOSSIER)) mkdirSync(DOSSIER, { recursive: true });

const srv = await serve();
const b = await browser();
const lignes = [];
let echecs = 0;
const dit = (nom, ok, detail = '') => { lignes.push({ nom, ok, detail }); if (!ok) echecs++; };

/* Le QR est un SVG de modules noirs sur fond blanc, sans texte : sa charge
   utile ne se lit pas dans le DOM. On la met donc en évidence par
   DISCRIMINATION : on réencode les DEUX chaînes candidates — avec et sans
   le marqueur `DEMO` — et on regarde laquelle produit le tracé réellement
   peint. Le test n'est vert que si le tracé peint est celui de la version
   AVEC marqueur ET diffère de celui de la version sans : le jour où
   quelqu'un retire `DEMO` du payload, l'égalité bascule et le test tombe.

   ⚠ SON PÉRIMÈTRE, parce qu'un rapport vert sans périmètre déclaré est une
   opinion (HANDOFF §0, règle 1) : il partage l'encodeur de la page. Il
   prouve donc QUELLE CHAÎNE a été encodée, pas que l'encodeur est correct.
   La justesse de l'encodeur lui-même est un acquis antérieur (R95), hors
   du périmètre de ce lot. */
const qrDitDemo = (pg, num, event, date) => pg.evaluate(({ n, e, d }) => {
  const svg = document.querySelector('.ticket-peak .qr-code svg, .my-ticket .qr-code svg');
  if (!svg) return { ok: false, why: 'aucun QR peint' };
  const peint = svg.querySelector('path')?.getAttribute('d') || '';
  if (!peint) return { ok: false, why: 'QR sans tracé' };
  if (!window.SYFIR || !window.SYFIR.makeQR) return { ok: false, why: 'encodeur non exposé (window.SYFIR.makeQR)' };
  const trace = s => ((window.SYFIR.makeQR(s) || '').match(/ d="([^"]*)"/) || [])[1] || '';
  const avec = trace(`SYFIR|DEMO|${n}|${e}|${d}`);
  const sans = trace(`SYFIR|${n}|${e}|${d}`);
  if (!avec || avec === sans) return { ok: false, why: 'encodage de contrôle inexploitable' };
  return { ok: peint === avec, why: peint === sans ? 'le QR encode encore SANS le marqueur DEMO' : 'tracé inattendu' };
}, { n: num, e: event, d: date });

async function ouvrir(ctx, url, init) {
  const pg = await ctx.newPage();
  pg.on('pageerror', e => dit(`ERREUR JS sur ${url}`, false, e.message.slice(0, 70)));
  await pg.addInitScript(() => { try { localStorage.setItem('syfir-portal', 'in'); } catch (e) {} });
  if (init) await pg.addInitScript(init);
  await pg.goto(`${BASE}/${url}`, { waitUntil: 'load' });
  await pg.waitForTimeout(1400);
  return pg;
}

try {
  const ctx = await b.newContext({ viewport: VIEWPORTS.desktop, reducedMotion: 'reduce' });
  const EV = { id: 'demo-rooftop-1', nom: 'Rooftop Sunset Session', date: '2026-08-22' };

  /* ---------------- PARCOURS 1 — la fiche evenement.html ---------------- */
  {
    const pg = await ouvrir(ctx, `evenement.html?id=${EV.id}`);

    const depart = await pg.evaluate(() => ({
      existe: !!document.querySelector('#edBuy'),
      desactive: document.querySelector('#edBuy')?.disabled,
      tiers: document.querySelectorAll('#edTiers .tier').length
    }));
    dit('le bouton « Réserver mes billets » existe', depart.existe);
    dit('les types de billets sont proposés (TIERS_DEFAULT)', depart.tiers === 3, `${depart.tiers} types`);
    dit('au départ il est désactivé — garde-fou, aucun billet choisi', depart.desactive === true);

    await pg.click('.qty-btn[data-delta="1"][data-tier="1"]');
    await pg.waitForTimeout(250);
    const choisi = await pg.evaluate(() => ({
      desactive: document.querySelector('#edBuy')?.disabled,
      total: document.querySelector('#edTotal')?.textContent
    }));
    dit('UN CLIC SUR « + » L\'ACTIVE — le bouton n\'était pas muet', choisi.desactive === false, `total ${choisi.total}`);

    await pg.click('#edBuy');
    await pg.waitForTimeout(900);
    const apres = await pg.evaluate(() => {
      let t = []; try { t = JSON.parse(localStorage.getItem('syfir-tickets')) || []; } catch (e) {}
      const ok = document.querySelector('#edSuccess');
      return {
        billets: t.length, num: t[0]?.num || '',
        message: ok && !ok.hidden ? ok.textContent.trim() : '',
        qr: !!document.querySelector('.ticket-peak .qr-code svg'),
        badge: !!document.querySelector('.ticket-peak .ticket-demo-badge'),
        phrase: (document.querySelector('.ticket-peak-demo')?.textContent || '').trim()
      };
    });
    dit('un VRAI billet est créé et persisté', apres.billets === 1 && !!apres.num, apres.num);
    dit('le QR est peint sur la confirmation', apres.qr);
    dit('MOYEN 1 — le message de confirmation dit « démonstration »', /démonstration/i.test(apres.message));
    dit('MOYEN 1 — il dit qu\'aucun paiement n\'a eu lieu', /aucun paiement/i.test(apres.message + apres.phrase));
    dit('MOYEN 1 — il dit que le billet ne donne pas accès', /ne donne pas accès/i.test(apres.message + apres.phrase));
    dit('MOYEN 1 — la carte du pic porte la pastille « Démonstration »', apres.badge);

    const qr1 = await qrDitDemo(pg, apres.num, EV.nom, EV.date);
    dit('MOYEN 2 — le QR peint encode bien « SYFIR|DEMO|… »', qr1.ok === true, qr1.ok === true ? 'tracé identique à l\'attendu' : qr1.why);

    if (captures) {
      await pg.locator('.ticket-peak').scrollIntoViewIfNeeded().catch(() => {});
      await pg.waitForTimeout(400);
      writeFileSync(resolve(DOSSIER, 'e1-confirmation-fiche.png'), await pg.screenshot());
    }

    /* --- le billet dans le profil --- */
    await pg.click('#clientSpaceBtn');
    await pg.waitForTimeout(900);
    const espace = await pg.evaluate(() => {
      const t = document.querySelector('#myTickets');
      return {
        lignes: t ? t.querySelectorAll('.my-ticket').length : 0,
        badge: !!t?.querySelector('.ticket-demo-badge'),
        texte: (t?.querySelector('.ticket-demo-text')?.textContent || '').trim(),
        qr: !!t?.querySelector('.qr-code svg')
      };
    });
    dit('le billet apparaît DANS LE PROFIL (Mon espace › Mes billets)', espace.lignes === 1);
    dit('… avec son QR', espace.qr);
    dit('… et la mention « Démonstration » y est aussi', espace.badge && /aucun paiement/i.test(espace.texte));
    if (captures) {
      await pg.waitForTimeout(300);
      writeFileSync(resolve(DOSSIER, 'e1-billet-profil.png'), await pg.screenshot());
    }
    await pg.close();
  }

  /* ---------------- PARCOURS 2 — la modale de evenements.html ---------------- */
  {
    /* Le contexte est partagé avec le parcours 1 : sans ce nettoyage,
       `syfir-tickets` contient déjà son billet et le contrôle lirait le
       MAUVAIS — vert ou rouge par accident. (Constaté au premier passage.) */
    const pg = await ouvrir(ctx, 'evenements.html', () => {
      try { localStorage.removeItem('syfir-tickets'); } catch (e) {}
    });
    await pg.evaluate(() => {
      const b = [...document.querySelectorAll('.event-card .btn')].find(x => /billets/i.test(x.textContent));
      b?.click();
    });
    await pg.waitForTimeout(800);
    const tiers = await pg.evaluate(() => document.querySelectorAll('#ticketTiers .tier').length);
    dit('[modale] les types de billets sont proposés', tiers === 3, `${tiers} types`);
    await pg.click('#ticketTiers .qty-btn[data-delta="1"][data-tier="1"]');
    await pg.waitForTimeout(250);
    await pg.click('#tmBuy');
    await pg.waitForTimeout(900);
    const r = await pg.evaluate(() => {
      const ok = document.querySelector('#tmSuccess');
      let t = []; try { t = JSON.parse(localStorage.getItem('syfir-tickets')) || []; } catch (e) {}
      return {
        billets: t.length, num: t[0]?.num || '', ev: t[0]?.event || '', date: t[0]?.date || '',
        message: ok && !ok.hidden ? ok.textContent.trim() : '',
        badge: !!document.querySelector('.ticket-peak .ticket-demo-badge')
      };
    });
    dit('[modale] un VRAI billet est créé', r.billets === 1 && !!r.num, r.num);
    dit('[modale] MOYEN 1 — le message dit « démonstration » et « aucun paiement »',
      /démonstration/i.test(r.message) && /aucun paiement/i.test(r.message));
    dit('[modale] MOYEN 1 — la carte du pic porte la pastille', r.badge);
    const qr2 = await qrDitDemo(pg, r.num, r.ev, r.date);
    dit('[modale] MOYEN 2 — le QR encode « SYFIR|DEMO|… »', qr2.ok === true, qr2.ok === true ? 'tracé identique' : qr2.why);
    await pg.close();
  }

  /* ---------------- LE BILLET HORS LIGNE ----------------
     Exigence explicite du lot. On ne le suppose pas depuis le code du
     service worker : on COUPE le réseau pour de bon et on recharge. */
  {
    const pg = await ouvrir(ctx, 'evenements.html', () => {
      try {
        localStorage.setItem('syfir-tickets', JSON.stringify([{
          id: 'demo-rooftop-1', event: 'Rooftop Sunset Session', city: 'Pointe-à-Pitre',
          date: '2026-08-22', detail: '1× Entrée', num: 'SYF-HORSLIGNE-001'
        }]));
      } catch (e) {}
    });
    // laisse au service worker le temps de s'installer et de précharger la coquille
    await pg.waitForTimeout(2500);
    await pg.context().setOffline(true);
    let charge = true;
    try { await pg.reload({ waitUntil: 'load', timeout: 15000 }); } catch (e) { charge = false; }
    await pg.waitForTimeout(1600);
    const hl = charge ? await pg.evaluate(() => {
      document.querySelector('#clientSpaceBtn')?.click();
      return new Promise(res => setTimeout(() => {
        const t = document.querySelector('#myTickets');
        res({
          lignes: t ? t.querySelectorAll('.my-ticket').length : 0,
          qr: !!t?.querySelector('.qr-code svg'),
          badge: !!t?.querySelector('.ticket-demo-badge')
        });
      }, 800));
    }) : { lignes: 0, qr: false, badge: false };
    await pg.context().setOffline(false);
    dit('HORS LIGNE — la page se recharge sans réseau (service worker)', charge);
    dit('HORS LIGNE — le billet est toujours consultable', hl.lignes === 1);
    dit('HORS LIGNE — son QR est toujours peint', hl.qr);
    dit('HORS LIGNE — la mention « Démonstration » survit aussi', hl.badge);
    await pg.close();
  }

  /* ---------------- L'INDÉLÉBILITÉ ----------------
     Un billet écrit AVANT ce lot n'a aucun champ « demo » : si la mention
     dépendait de la donnée, il s'afficherait nu. Elle est posée au rendu,
     donc il la porte. C'est ce que ce contrôle vérifie — et il tomberait
     au rouge le jour où quelqu'un la conditionnerait à un champ. */
  {
    const pg = await ouvrir(ctx, 'evenements.html', () => {
      try {
        localStorage.setItem('syfir-tickets', JSON.stringify([{
          id: 'ancien', event: 'Billet d\'avant le lot E/1', city: 'Le Gosier',
          date: '2027-03-03', detail: '1× Entrée', num: 'SYF-ANCIEN-001'
        }]));
      } catch (e) {}
    });
    await pg.click('#clientSpaceBtn');
    await pg.waitForTimeout(900);
    const v = await pg.evaluate(() => {
      const t = document.querySelector('#myTickets .my-ticket');
      return { badge: !!t?.querySelector('.ticket-demo-badge'), texte: (t?.textContent || '') };
    });
    dit('INDÉLÉBILE — un billet enregistré AVANT le lot porte la mention', v.badge && /aucun paiement/i.test(v.texte));
    await pg.close();
  }
} finally { await b.close(); srv.close(); }

console.log('\nE/1 — LE PARCOURS DE RÉSERVATION, SANS PAIEMENT\n');
for (const l of lignes) console.log(`  ${l.ok ? '✓' : '✗'} ${l.nom.padEnd(66)} ${l.detail}`);
console.log(`\n  ${lignes.length - echecs}/${lignes.length} vérifications vertes.\n`);
process.exit(echecs ? 1 : 0);
