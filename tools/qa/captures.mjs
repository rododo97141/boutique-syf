/* ============================================================
   tools/qa/captures.mjs <lot>
   ------------------------------------------------------------
   Dépose dans tools/qa/captures/ la pleine page de l'accueil ET celle de
   la maquette, aux deux viewports, dans des conditions IDENTIQUES.

   Pourquoi cet outil existe : `tools/qa/out/` est gitignoré. Six lots
   durant, le superviseur a jugé sur des chiffres pendant que Kily jugeait
   sur des images — et les images n'étaient nulle part. Trois « toujours
   pas » se sont joués là.

   ⚠ LES DEUX PAGES DOIVENT ÊTRE PRISES DANS LE MÊME ÉTAT, sinon on
   compare deux instants et non deux pages : voile levé, `.rev` à leur
   état final, animations figées au même instant, page descendue jusqu'en
   bas AVANT la capture (l'accueil grandit pendant qu'on le mesure) puis
   remontée en haut.

   ⚠ CE QU'UNE CAPTURE PLEINE PAGE NE SAIT PAS FAIRE, et qu'il faut savoir
   en lisant les images : une couche `position: fixed` — le ciel, les
   faisceaux — ne se peint QU'UNE FOIS, en haut. Tout le reste de la
   hauteur montre le fond de la PAGE. Ce n'est pas un défaut de l'image :
   c'est la seule façon de voir ce fond, et c'est comme ça que R103 a
   trouvé que l'accueil retombait sur l'ENCRE #111 (gris neutre) là où la
   maquette retombe sur la nuit #04070F. Les deux pages ont maintenant le
   même fond de repli, donc les deux images sont comparables de bout en
   bout.

   ⚠ ET CE QU'UNE CAPTURE DE FENÊTRE NE SAIT PAS FAIRE NON PLUS : un
   `scrollTo()` programmatique suivi d'une capture photographie une TUILE
   COMPOSITÉE PÉRIMÉE de cette même couche fixe (`contain: paint`). Lu
   comme ça, le ciel de l'accueil rendait 17,17,17 à mi-page alors qu'il
   peint 4,7,15 dès qu'un vrai cran de molette force le repeint. Toute
   mesure de pixel après défilement programmatique doit donc bousculer la
   molette (`mouse.wheel(0,1)` puis `(0,-1)`) avant de déclencher — sans
   quoi on diagnostique l'appareil et pas la page.
============================================================ */
import { serve, browser, scrollToBottom, VIEWPORTS, ensureOut, ROOT, BASE } from './lib.mjs';
import { resolve } from 'node:path';
import { mkdirSync, existsSync } from 'node:fs';

const lot = process.argv[2] || 'lot';
const dir = resolve(ROOT, 'tools/qa/captures');
if (!existsSync(dir)) mkdirSync(dir, { recursive: true });

const srv = await serve();
const b = await browser();
try {
  for (const [nomVp, vp] of [['desktop', VIEWPORTS.desktop], ['390', VIEWPORTS.mobile]]) {
    const ctx = await b.newContext({ viewport: vp });
    for (const [url, nom] of [
      ['index.html', 'accueil'],
      ['maquettes/3-LUMIERE-DE-SCENE.html', 'maquette'],
    ]) {
      const pg = await ctx.newPage();
      /* Voile du Portail levé : sans ça on photographie la porte, pas la
         page — erreur commise une fois en R101. */
      await pg.addInitScript(() => { try { localStorage.setItem('syfir-portal', 'in'); } catch (e) {} });
      await pg.goto(`${BASE}/${url}`, { waitUntil: 'domcontentloaded' });
      await pg.waitForTimeout(1200);
      await pg.evaluate(() => {
        const st = document.createElement('style');
        st.textContent = '.rev,.reveal{opacity:1!important;transform:none!important;transition:none!important}';
        document.head.appendChild(st);
        document.querySelectorAll('.rev,.reveal').forEach(e => e.classList.add('in'));
      });
      await scrollToBottom(pg);
      await pg.evaluate(() => scrollTo(0, 0));
      await pg.waitForTimeout(700);
      await pg.evaluate(() => {
        document.getAnimations().forEach(a => { try { a.pause(); a.currentTime = 0; } catch (e) {} });
      });
      await pg.waitForTimeout(300);
      const f = resolve(dir, `${lot}-${nom}-${nomVp}.png`);
      await pg.screenshot({ path: f, fullPage: true });
      console.log('  ' + f.replace(ROOT + '/', ''));
      await pg.close();
    }
    await ctx.close();
  }
} finally {
  await b.close(); srv.close();
}
console.log('\n✓ captures déposées — c\'est ce qui se regarde en premier.\n');
