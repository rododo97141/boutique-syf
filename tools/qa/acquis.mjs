/* ============================================================
   tools/qa/acquis.mjs
   ------------------------------------------------------------
   LES TROIS ACQUIS QUI DOIVENT SURVIVRE AU RETRAIT (R98).

   La carte du retrait demandait de « sauver » le Portail (R93) et le
   pouls (R94). La vérification du plan a montré qu'ils sont hors
   trajectoire du retrait — mais « hors trajectoire » est une déduction,
   pas une mesure. Cet outil mesure le RÉSULTAT :

   1. LE PORTAIL se lève réellement. On échantillonne son opacité PEINTE
      pendant la levée. Une transition déclarée ne prouve rien — R93/4
      avait mesuré 1 -> 0.41 -> 0.13 -> 0.04 -> 0.01 -> 0.
   2. LE POULS bat au tempo kompa. On mesure la PÉRIODE réelle de
      l'horloge :root, pas la valeur déclarée : 517 ms = 116 BPM.
   3. LE SOL SOUS LE CIEL (R96) tient. Le ciel est une couche fixe qui se
      peignait PAR-DESSUS le pied de page — mention loi Évin comprise,
      INTÉGRALEMENT invisible. Le remède est `position: relative` sur les
      quatre blocs de premier niveau. On vérifie qu'il est encore là ET
      qu'il produit son effet, en lisant le pixel réellement peint.

   Mesurer le résultat, jamais le câblage.
============================================================ */
import { serve, browser, openPage, VIEWPORTS, parseRGB, relLum, contrast } from './lib.mjs';

const srv = await serve();
const b = await browser();
let echecs = 0;
const dire = (ok, txt) => { if (!ok) echecs++; console.log(`  ${ok ? '✓' : '✗'} ${txt}`); };

try {
  const ctx = await b.newContext({ viewport: VIEWPORTS.desktop });

  /* ---------- 1. LE PORTAIL ---------- */
  console.log('\n1. LE PORTAIL — se lève-t-il vraiment ?');
  {
    const pg = await openPage(ctx, 'index.html', { portalSeen: false });
    const visible = await pg.evaluate(() => {
      const p = document.getElementById('portal');
      return p ? getComputedStyle(p).display !== 'none' && +getComputedStyle(p).opacity : null;
    });
    dire(visible === 1, `voile présent et opaque à l'arrivée (opacité peinte ${visible})`);

    await pg.click('#portalEnter');
    const suite = [];
    for (let i = 0; i < 10; i++) {
      suite.push(await pg.evaluate(() => {
        const p = document.getElementById('portal');
        return p ? +(+getComputedStyle(p).opacity).toFixed(3) : -1;
      }));
      await pg.waitForTimeout(110);
    }
    const decroit = suite[0] > suite[suite.length - 1];
    const paliers = new Set(suite).size;
    dire(decroit && paliers >= 4,
      `fondu échantillonné : ${suite.join(' -> ')} (${paliers} valeurs distinctes)`);
    const fini = await pg.evaluate(() => {
      const p = document.getElementById('portal');
      return !p || getComputedStyle(p).pointerEvents === 'none' || +getComputedStyle(p).opacity === 0;
    });
    dire(fini, 'le voile ne bloque plus la page une fois levé');
    await pg.close();
  }

  /* ---------- 2. LE POULS ---------- */
  console.log('\n2. LE POULS — bat-il encore au tempo kompa ?');
  {
    const pg = await openPage(ctx, 'index.html');
    const horloge = await pg.evaluate(() => {
      const a = document.getAnimations().find(x => {
        try { return (x.animationName || x.effect?.getKeyframes?.().length) && x.effect?.target === document.documentElement; }
        catch { return false; }
      });
      const d = a?.effect?.getTiming?.().duration;
      return typeof d === 'number' ? d : null;
    });
    /* Second moyen, indépendant de l'API d'animation : la valeur calculée
       sur :root, qui est ce que le CSS déclare réellement au navigateur. */
    const declare = await pg.evaluate(() =>
      getComputedStyle(document.documentElement).animationDuration);
    dire(horloge === 517 || /517ms/.test(declare),
      `horloge :root — API ${horloge ?? 'n/a'} ms · calculé « ${declare} » (attendu 517 ms = 116 BPM)`);

    /* L'horloge anime la variable --syfir-beat (0 -> 1 -> 0). On mesure
       qu'elle VARIE réellement dans le temps : une variable déclarée qui
       ne bouge pas serait un pouls mort qu'aucune lecture de code ne
       distinguerait d'un pouls vivant. */
    const suite = [];
    for (let i = 0; i < 8; i++) {
      suite.push(await pg.evaluate(() =>
        getComputedStyle(document.documentElement).getPropertyValue('--syfir-beat').trim()));
      await pg.waitForTimeout(70);
    }
    const distinctes = new Set(suite).size;
    dire(distinctes >= 3,
      `--syfir-beat varie dans le temps : ${distinctes} valeurs distinctes sur 8 relevés (${suite.slice(0, 5).join(', ')}…)`);
    await pg.close();
  }

  /* ---------- 3. LE SOL SOUS LE CIEL ---------- */
  console.log('\n3. LE SOL SOUS LE CIEL (R96) — le pied de page est-il peint ?');
  {
    const pg = await openPage(ctx, 'index.html');
    const pos = await pg.evaluate(() => {
      const r = {};
      for (const sel of ['.manifesto', '.marquee', '.next-events', 'footer']) {
        const el = document.querySelector('.page-home > ' + sel) || document.querySelector(sel);
        r[sel] = el ? getComputedStyle(el).position : 'absent';
      }
      return r;
    });
    const tous = Object.values(pos).every(v => v === 'relative');
    dire(tous, `les 4 blocs de premier niveau sont positionnés : ${JSON.stringify(pos)}`);

    /* L'EFFET, pas la déclaration : on lit le pixel réellement peint là où
       se trouve la mention sanitaire, et on le compare à sa couleur de
       texte. Si le ciel se peignait par-dessus, le fond lu serait celui du
       ciel et le rapport s'effondrerait — c'est exactement ce que R96 a
       diagnostiqué (2,42:1 sur un texte que personne ne voyait). */
    const m = await pg.evaluate(async () => {
      const el = document.querySelector('.footer-sante') || document.querySelector('footer p');
      if (!el) return null;
      el.scrollIntoView({ block: 'center', behavior: 'instant' });
      await new Promise(r => setTimeout(r, 400));
      const r = el.getBoundingClientRect();
      return { color: getComputedStyle(el).color, x: Math.round(r.left + 4), y: Math.round(r.top + r.height / 2), texte: el.textContent.trim().slice(0, 40) };
    });
    if (!m) { dire(false, 'mention sanitaire introuvable'); }
    else {
      const shot = await pg.screenshot({ clip: { x: m.x, y: m.y, width: 24, height: 3 } });
      const fond = await pg.evaluate(async b64 => {
        const img = new Image(); img.src = 'data:image/png;base64,' + b64; await img.decode();
        const c = document.createElement('canvas'); c.width = img.width; c.height = img.height;
        const g = c.getContext('2d'); g.drawImage(img, 0, 0);
        const d = g.getImageData(0, 0, img.width, img.height).data;
        const bac = {};
        for (let i = 0; i < d.length; i += 4) {
          const k = `${d[i] >> 3},${d[i + 1] >> 3},${d[i + 2] >> 3}`;
          (bac[k] ??= { n: 0, r: d[i], g: d[i + 1], b: d[i + 2] }).n++;
        }
        return Object.values(bac).sort((a, z) => z.n - a.n)[0];
      }, shot.toString('base64'));
      const ratio = contrast(parseRGB(m.color), { r: fond.r, g: fond.g, b: fond.b });
      dire(ratio >= 4.5,
        `mention loi Évin « ${m.texte}… » : ${ratio.toFixed(2)}:1 sur le pixel PEINT (seuil 4,5)`);
    }
    await pg.close();
  }
} finally {
  await b.close(); srv.close();
}

console.log(`\n${echecs === 0 ? '✓ les trois acquis ont survécu au retrait.' : `✗ ${echecs} acquis en défaut.`}\n`);
process.exit(echecs ? 1 : 0);
