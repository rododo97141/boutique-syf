/* ============================================================
   tools/qa/formulaires.mjs — LOT E/2 — LE FORMULAIRE DIT-IL LA VÉRITÉ ?
   ------------------------------------------------------------
   L'endpoint est branché (Web3Forms). La question qui reste n'est pas
   « est-ce que ça part » — c'est « **est-ce que le message affiché
   correspond à ce qui s'est réellement passé** ».

   « Un formulaire qui dit “merci” alors que rien n'est parti est pire
   que l'ancien mode démo : il ment au visiteur ET au destinataire. »

   Cinq scénarios, chacun forcé au niveau du RÉSEAU (page.route), donc
   sans toucher au code du site — on mesure le résultat, pas le câblage :

     1. SUCCÈS       200 {"success":true}   → confirmation
     2. REFUS        200 {"success":false}  → ÉCHEC (le piège : r.ok vaut
                                              true, le corps dit non)
     3. ERREUR HTTP  422                    → ÉCHEC
     4. RÉSEAU MORT  connexion abandonnée   → ÉCHEC, phrase différente
     5. HONEYPOT     `_gotcha` rempli       → ZÉRO requête réseau

   Et deux contrôles de contenu du POST :
     — `access_key` est bien dans le CORPS (contrat Web3Forms) ;
     — `_gotcha` n'est JAMAIS transmis au prestataire.

   Plus l'état des notes « démo », qui doivent s'effacer seules là où la
   transmission est active et RESTER là où elle ne l'est pas.

   Usage : node tools/qa/formulaires.mjs [--captures]
============================================================ */
import { serve, browser, VIEWPORTS, BASE, ROOT } from './lib.mjs';
import { writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

const captures = process.argv.includes('--captures');
const DOSSIER = resolve(ROOT, 'tools/qa/captures');
if (captures && !existsSync(DOSSIER)) mkdirSync(DOSSIER, { recursive: true });

const HOTE = '**api.web3forms.com**';
const srv = await serve();
const b = await browser();
const lignes = [];
let echecs = 0;
const dit = (nom, ok, detail) => { lignes.push({ nom, ok, detail }); if (!ok) echecs++; };

/* Remplit le formulaire partenaire avec un jeu valide. `gotcha` non vide
   simule un bot (le champ est invisible pour un humain). */
async function remplir(pg, { gotcha = '' } = {}) {
  await pg.evaluate(g => {
    const $ = s => document.querySelector(s);
    $('input[name="requestType"][value="partenaire"]').checked = true;
    $('input[name="requestType"][value="partenaire"]').dispatchEvent(new Event('change', { bubbles: true }));
    $('#pfName').value = 'Test Harnais';
    $('#pfEmail').value = 'harnais@exemple.fr';
    $('#pfPhone').value = '0690000000';   // validators.phone : 9 à 15 chiffres, pas plus
    $('#pfContext').value = 'Vérification du câblage';
    $('#pfMessage').value = 'Message de vérification du harnais QA, dix caractères au moins.';
    $('#pfMajeur').value = 'oui';
    $('#pfConsent').checked = true;
    $('input[name="_gotcha"]').value = g;
  }, gotcha);
}

const messageAffiche = pg => pg.evaluate(() => {
  const s = document.querySelector('#formSuccess'), e = document.querySelector('#formError');
  return {
    succes: s && !s.hidden ? s.textContent.trim() : null,
    erreur: e && !e.hidden ? e.textContent.trim() : null
  };
});

try {
  const ctx = await b.newContext({ viewport: VIEWPORTS.desktop, reducedMotion: 'reduce' });
  await ctx.addInitScript(() => { try { localStorage.setItem('syfir-portal', 'in'); } catch (e) {} });

  /* ---------- 1 à 4 : les quatre réponses possibles du prestataire ---------- */
  const SCENARIOS = [
    { cle: 'succes', titre: 'SUCCÈS  200 {"success":true}',
      route: r => r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, message: 'Email sent successfully' }) }),
      attendu: 'succes', capture: 'e2-formulaire-succes' },
    { cle: 'refus', titre: 'REFUS   200 {"success":false}',
      route: r => r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: false, message: 'Invalid Access Key' }) }),
      attendu: 'erreur', capture: 'e2-formulaire-refus' },
    { cle: 'http', titre: 'ERREUR  422',
      route: r => r.fulfill({ status: 422, contentType: 'application/json', body: JSON.stringify({ success: false, message: 'Unprocessable' }) }),
      attendu: 'erreur' },
    { cle: 'reseau', titre: 'RÉSEAU  connexion abandonnée',
      route: r => r.abort('connectionfailed'),
      attendu: 'erreur', capture: 'e2-formulaire-echec-reseau' }
  ];

  for (const sc of SCENARIOS) {
    const pg = await ctx.newPage();
    const envois = [];
    await pg.route(HOTE, r => { envois.push(r.request().postDataJSON()); return sc.route(r); });
    await pg.goto(`${BASE}/partenaires.html`, { waitUntil: 'load' });
    await pg.waitForTimeout(900);
    await remplir(pg);
    await pg.evaluate(() => document.querySelector('#partnerForm').requestSubmit());
    await pg.waitForTimeout(1200);
    const msg = await messageAffiche(pg);

    const partie = envois.length === 1;
    dit(`${sc.titre} — la requête part`, partie, `${envois.length} POST`);
    if (partie && sc.cle === 'succes') {
      const c = envois[0] || {};
      dit('  access_key dans le CORPS', c.access_key === '35807543-abbf-4253-a494-b5b730d90942', String(c.access_key).slice(0, 8) + '…');
      dit('  _gotcha JAMAIS transmis', !('_gotcha' in c), '_gotcha' in c ? 'PRÉSENT' : 'absent');
      dit('  champs du formulaire présents',
        c.name === 'Test Harnais' && c.email === 'harnais@exemple.fr' && !!c.message && !!c.subject && !!c.replyto,
        `name/email/message/subject/replyto`);
    }
    const bonMessage = sc.attendu === 'succes' ? (!!msg.succes && !msg.erreur) : (!!msg.erreur && !msg.succes);
    dit(`${sc.titre} — message affiché`, bonMessage, msg.succes || msg.erreur || '(rien)');

    if (captures && sc.capture) {
      const cible = await pg.$('#partnerForm');
      await cible?.scrollIntoViewIfNeeded();
      await pg.waitForTimeout(300);
      writeFileSync(resolve(DOSSIER, `${sc.capture}.png`), await pg.screenshot());
    }
    await pg.close();
  }

  /* ---------- 5 : le honeypot ---------- */
  {
    const pg = await ctx.newPage();
    const envois = [];
    await pg.route(HOTE, r => { envois.push(1); return r.fulfill({ status: 200, contentType: 'application/json', body: '{"success":true}' }); });
    await pg.goto(`${BASE}/partenaires.html`, { waitUntil: 'load' });
    await pg.waitForTimeout(900);
    await remplir(pg, { gotcha: 'je-suis-un-bot' });
    await pg.evaluate(() => document.querySelector('#partnerForm').requestSubmit());
    await pg.waitForTimeout(1200);
    dit('HONEYPOT — aucune requête réseau', envois.length === 0, `${envois.length} POST`);
    await pg.close();
  }

  /* ---------- les notes « démo » ---------- */
  {
    const pg = await ctx.newPage();
    await pg.goto(`${BASE}/partenaires.html`, { waitUntil: 'load' });
    await pg.waitForTimeout(1200);
    const n = await pg.evaluate(() => ({
      partenaire: document.querySelectorAll('#partnerForm .form-demo-note').length,
      newsletter: document.querySelectorAll('.footer-news .form-demo-note').length
    }));
    dit('note « démo » EFFACÉE sur le formulaire partenaire', n.partenaire === 0, `${n.partenaire} note(s)`);
    dit('note « démo » CONSERVÉE sur la newsletter (elle ne transmet pas)', n.newsletter >= 1, `${n.newsletter} note(s)`);
    await pg.close();
  }
  {
    const pg = await ctx.newPage();
    await pg.goto(`${BASE}/evenements.html`, { waitUntil: 'load' });
    await pg.waitForTimeout(1200);
    const n = await pg.evaluate(() => ({
      pro: document.querySelectorAll('#proForm .form-demo-note').length,
      news: document.querySelectorAll('.footer-news .form-demo-note').length
    }));
    dit('espace pro : aucune note « démo » à effacer (il ne transmet rien, par conception R80-4)', n.pro === 0, `${n.pro} note(s)`);
    dit('newsletter (evenements.html) : note conservée', n.news >= 1, `${n.news} note(s)`);
    await pg.close();
  }
  /* ---------- la liste d'attente ----------
     ⚠ AUCUN événement du jeu de données ne porte `stock: 'complet'` : le
     formulaire de liste d'attente n'est donc RENDU NULLE PART aujourd'hui.
     Ne pas le mesurer et conclure « rien à signaler » serait un vert sur
     zéro donnée — la forme de faux positif qui ressemble le plus à un
     succès (cf. README, l'essai négatif de `--theme=`). On fabrique donc
     l'événement complet dans le stockage local, comme le ferait l'espace
     pro, et on rend la page pour de vrai.

     Attendu : la note « démo » RESTE. La liste d'attente ne traverse pas
     `submitForm` — elle écrit dans localStorage et le dit. L'effacer
     parce qu'un endpoint est branché ailleurs promettrait un envoi qui
     n'existe pas. */
  {
    const pg = await ctx.newPage();
    await pg.addInitScript(() => {
      try {
        localStorage.setItem('syfir-portal', 'in');
        localStorage.setItem('syfir-pro-events', JSON.stringify([{
          id: 'qa-complet', name: 'Événement complet (harnais QA)', type: 'club',
          city: 'Les Abymes', date: '2027-01-01', time: '21:00', price: 10,
          genres: [], img: 'images/ext/unsplash-photo-1514525253161-7a46d19cd819.jpg',
          organizer: 'SYFIR', ageStatus: 'a-confirmer', stock: 'complet'
        }]));
      } catch (e) {}
    });
    await pg.goto(`${BASE}/evenement.html?id=qa-complet`, { waitUntil: 'load' });
    await pg.waitForTimeout(1200);
    const r = await pg.evaluate(() => ({
      form: !!document.querySelector('#edWaitForm'),
      note: document.querySelectorAll('#edWaitForm .form-demo-note').length
    }));
    dit('liste d\'attente : le formulaire est bien rendu sur un événement complet', r.form, r.form ? 'présent' : 'ABSENT');
    dit('liste d\'attente : note « démo » conservée (chemin local, hors submitForm)', r.note >= 1, `${r.note} note(s)`);
    await pg.close();
  }
} finally { await b.close(); srv.close(); }

console.log('\nE/2 — LE FORMULAIRE DIT-IL LA VÉRITÉ ?\n');
for (const l of lignes) console.log(`  ${l.ok ? '✓' : '✗'} ${l.nom.padEnd(62)} ${l.detail}`);
console.log(`\n  ${lignes.length - echecs}/${lignes.length} vérifications vertes.\n`);
process.exit(echecs ? 1 : 0);
