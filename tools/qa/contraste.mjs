/* ============================================================
   tools/qa/contraste.mjs [page] [--theme light|dark] [--portal-first]
   ------------------------------------------------------------
   Contraste WCAG AA sur le RENDU réel. Le fond effectif est composé
   en remontant les ancêtres (ciel + verre de section + cartes) ;
   les textes posés sur une image/vidéo sont écartés (mesurés au 90ᵉ
   centile ailleurs, ils produisent sinon des faux positifs — leçon R92).

   Seuils : 4.5:1 texte normal, 3:1 grand texte (>=24 px, ou >=18.66 px gras).

   Usage : node tools/qa/contraste.mjs index.html --theme light
============================================================ */
import { serve, browser, openPage, VIEWPORTS } from './lib.mjs';

const args = process.argv.slice(2);
const url = args.find(a => !a.startsWith('--')) || 'index.html';
/* ⚠ `indexOf` RENVOIE −1 QUAND L'OPTION EST ABSENTE, et `args[-1 + 1]`
   vaut `args[0]` — c'est-à-dire LE NOM DE LA PAGE. Sans `--theme`, le
   rapport s'intitulait donc « thème evenements.html ». La mesure était
   juste, l'étiquette fausse ; et un libellé faux sur une mesure juste
   suffit à faire douter de la mesure — c'est exactement ce qui avait été
   corrigé en R106 sur le défaut « light », en laissant passer la cause. */
const iTheme = args.indexOf('--theme');
const theme = (iTheme >= 0 && args[iTheme + 1] && !args[iTheme + 1].startsWith('--'))
  ? args[iTheme + 1] : 'dark';  /* R98 : un seul thème, la nuit. Le défaut « light » restait ici et
     étiquetait chaque rapport « thème light » — un libellé faux sur une
     mesure juste, ce qui suffit à faire douter de la mesure. */
const portalFirst = args.includes('--portal-first');

const srv = await serve();
const b = await browser();
const ctx = await b.newContext({ viewport: VIEWPORTS.desktop });
const page = await openPage(ctx, url, { theme, portalSeen: !portalFirst });

const findings = await page.evaluate(() => {
  const lum = ({ r, g, b }) => {
    const c = [r, g, b].map(v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); });
    return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
  };
  const parse = s => {
    const m = String(s || '').match(/rgba?\(([^)]+)\)/);
    if (!m) return null;
    const p = m[1].split(',').map(parseFloat);
    return { r: p[0], g: p[1], b: p[2], a: p[3] === undefined ? 1 : p[3] };
  };
  // Texte sur média (photo/vidéo) : écarté — mesure séparée au 90e centile.
  const onMedia = el => {
    let n = el, hops = 0;
    while (n && hops < 10) {
      const cs = getComputedStyle(n);
      const bi = cs.backgroundImage;
      if (bi && bi !== 'none' && /url\(/.test(bi)) return true;
      const cls = String(n.className || '');
      if (/hero|car-slide|visual-card|artist-photo|band-photo|am-hero|aftermovie|moment\b|ed-hero/.test(cls)) return true;
      n = n.parentElement; hops++;
    }
    return false;
  };

  /* Fond effectif par COMPOSITION alpha réelle des ancêtres.
     Piège mesuré en R93/1 : s'arrêter au premier fond « assez opaque »
     (alpha > .5) et ignorer les DÉGRADÉS faisait remonter le crème du
     body sous des sections dont le fond est un dégradé sombre —
     6 faux positifs sur 11. Un dégradé rencontré rend le fond
     INDÉTERMINÉ : on le déclare tel quel plutôt que d'inventer. */
  /* Couche de fond FIXE couvrant le viewport (le ciel de La Traversée) :
     elle peint PAR-DESSUS le fond du body sans être un ancêtre, donc une
     remontée d'ancêtres ne la voit pas. Vérité établie par capture en
     R93/1 : une porte annoncée « crème sur crème » est en réalité crème
     sur marine sombre. Si ce fond existe, tout ce qui retombe sur le body
     est INDÉTERMINÉ, pas « crème ». */
  const backdrop = [...document.querySelectorAll('body > *')].find(el => {
    const cs = getComputedStyle(el);
    if (cs.position !== 'fixed' || cs.display === 'none' || cs.visibility === 'hidden') return false;
    if (parseFloat(cs.opacity) < 0.1) return false;
    const r = el.getBoundingClientRect();
    return r.width >= innerWidth * 0.9 && r.height >= innerHeight * 0.9;
  });

  const effBg = el => {
    const layers = [];
    let n = el, gradient = false;
    let reachedBody = false;
    while (n && n !== document.documentElement) {
      const cs = getComputedStyle(n);
      const bi = cs.backgroundImage;
      if (bi && bi !== 'none' && /gradient/.test(bi)) { gradient = true; break; }
      const c = parse(cs.backgroundColor);
      if (c && c.a > 0) {
        if (n === document.body) reachedBody = true;
        layers.push(c);
        if (c.a >= 0.999) break;
      }
      n = n.parentElement;
    }
    // Fond du body invalidé par une couche fixe qui le recouvre
    if (gradient || (backdrop && (reachedBody || !layers.length))) return { undetermined: true };
    let base = parse(getComputedStyle(document.documentElement).backgroundColor);
    if (!base || base.a < 0.999) base = { r: 255, g: 255, b: 255, a: 1 };
    // compose du plus lointain au plus proche
    let out = base;
    for (let i = layers.length - 1; i >= 0; i--) {
      const c = layers[i];
      out = {
        r: c.r * c.a + out.r * (1 - c.a),
        g: c.g * c.a + out.g * (1 - c.a),
        b: c.b * c.a + out.b * (1 - c.a),
        a: 1
      };
    }
    return out;
  };
  /* Un voile plein écran (Le Portail) OCCULTE la page : mesurer les
     éléments derrière lui revient à les mesurer contre le voile, ce qui
     fabrique des dizaines de faux défauts sur du contenu que personne ne
     voit. Quand il est là, on ne mesure QUE lui. Constaté en R93/8 :
     36 faux positifs, tous derrière le voile. */
  const veil = [...document.querySelectorAll('body > *')].find(el => {
    const cs = getComputedStyle(el);
    if (cs.position !== 'fixed' || cs.display === 'none' || cs.visibility === 'hidden') return false;
    if (parseFloat(cs.opacity) < 0.9) return false;
    const bg = parse(cs.backgroundColor), bi = cs.backgroundImage;
    if ((!bg || bg.a < 0.9) && (!bi || bi === 'none')) return false;
    const r = el.getBoundingClientRect();
    return r.width >= innerWidth * 0.95 && r.height >= innerHeight * 0.95 && (+cs.zIndex || 0) >= 100;
  });
  const scope = veil || document.body;

  const out = [], undet = [];
  scope.querySelectorAll('*').forEach(el => {
    const hasText = [...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim().length > 1);
    if (!hasText) return;
    const cs = getComputedStyle(el);
    if (cs.visibility === 'hidden' || cs.display === 'none' || el.closest('[hidden]')) return;
    if (parseFloat(cs.opacity) < 0.3) return;
    if (cs.webkitBackgroundClip === 'text' || cs.backgroundClip === 'text') return; // or métallique
    const r = el.getBoundingClientRect();
    if (r.width < 4 || r.height < 4) return;
    if (onMedia(el)) return;
    const fg = parse(cs.color); if (!fg || fg.a < 0.3) return;
    const bg = effBg(el);
    const desc = {
      sel: el.tagName.toLowerCase() + (el.className ? '.' + String(el.className).split(' ').slice(0, 2).join('.') : ''),
      txt: el.textContent.trim().slice(0, 30), size: Math.round(parseFloat(cs.fontSize))
    };
    if (bg.undetermined) {
      el.setAttribute('data-qa-id', String(undet.length));
      undet.push({ ...desc, qaId: undet.length, fg: `${fg.r},${fg.g},${fg.b}`, need: (parseFloat(cs.fontSize) >= 24 || (parseFloat(cs.fontSize) >= 18.66 && parseInt(cs.fontWeight) >= 700)) ? 3 : 4.5 });
      return;
    }
    const L1 = lum(fg) + 0.05, L2 = lum(bg) + 0.05;
    const ratio = +(Math.max(L1, L2) / Math.min(L1, L2)).toFixed(2);
    const size = parseFloat(cs.fontSize), bold = parseInt(cs.fontWeight) >= 700;
    const need = (size >= 24 || (size >= 18.66 && bold)) ? 3 : 4.5;
    if (ratio < need) {
      out.push({
        ...desc, ratio, need,
        fg: `${fg.r},${fg.g},${fg.b}`,
        bg: `${Math.round(bg.r)},${Math.round(bg.g)},${Math.round(bg.b)}`
      });
    }
  });
  const dedupe = arr => {
    const seen = new Set(), uniq = [];
    arr.forEach(o => {
      const k = o.sel + '|' + (o.fg || '') + '|' + (o.bg || '');
      if (!seen.has(k)) { seen.add(k); uniq.push(o); }
    });
    return uniq;
  };
  return { fails: dedupe(out.sort((a, b) => a.ratio - b.ratio)), undetermined: dedupe(undet), veiled: !!veil };
});

const { fails, undetermined } = findings;

/* ÉTAGE 2 — mesure des PIXELS RÉELLEMENT PEINTS.
   Les fonds non composables (dégradés, ciel fixe, verre) ne sont pas
   abandonnés : on capture la boîte de l'élément et on lit le fond dans
   l'image rendue. Le fond est la couleur DOMINANTE de la boîte (le texte
   y est toujours minoritaire) ; on la quantifie par paquets de 8 pour
   absorber l'anticrénelage et le grain. C'est la seule mesure qui voit
   ce que voit l'œil — le reste n'est que déclaration. */
const decoder = await ctx.newPage();
await decoder.goto('about:blank');

/* Mesure par PASSES DE VIEWPORT, et non élément par élément.
   ------------------------------------------------------------
   Quatrième désynchronisme d'instrument, trouvé en R96 : faire défiler
   jusqu'à CHAQUE élément avant de le capturer change le palier du ciel
   entre deux mesures. Deux éléments voisins étaient donc mesurés dans
   deux mondes différents — un enfant relevait « crème » quand son propre
   parent relevait « saumon », ce qui est impossible et a mis sur la voie.

   Méthode : on descend par écrans, et à chaque palier on prend UNE seule
   capture, dans laquelle on découpe toutes les boîtes visibles à cet
   instant. Un instant, une image, une vérité. */
const dominantOf = async (b64, boxes) => decoder.evaluate(async ({ img64, list }) => {
  const img = new Image();
  img.src = 'data:image/png;base64,' + img64;
  await img.decode();
  const c = document.createElement('canvas');
  c.width = img.width; c.height = img.height;
  const g = c.getContext('2d', { willReadFrequently: true });
  g.drawImage(img, 0, 0);
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
    let best = null;
    for (const e of bins.values()) if (!best || e.n > best.n) best = e;
    return best ? { qaId: it.qaId, fg: it.fg,
      bg: { r: Math.round(best.r / best.n), g: Math.round(best.g / best.n), b: Math.round(best.b / best.n) } } : null;
  }).filter(Boolean);
}, { img64: b64, list: boxes });

/* Descente par écrans. La page GRANDIT en descendant (content-visibility),
   donc on ne calcule jamais la hauteur une seule fois : on avance tant
   qu'on n'est pas ancré au fond. */
const collected = new Map();
const sweep = async () => {
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(400);
  for (let pass = 0; pass < 200; pass++) {
    await page.waitForTimeout(220);          // le verre a 300 ms de transition
    const boxes = await page.evaluate(() => {
      const out = [];
      document.querySelectorAll('[data-qa-id]').forEach(e => {
        const r = e.getBoundingClientRect();
        if (r.bottom < 0 || r.top > innerHeight || r.width < 2 || r.height < 2) return;
        out.push({ qaId: e.getAttribute('data-qa-id'), fg: getComputedStyle(e).color,
          x: Math.round(Math.max(0, r.x)), y: Math.round(Math.max(0, r.y)),
          w: Math.round(Math.min(r.width, innerWidth - Math.max(0, r.x))),
          h: Math.round(Math.min(r.height, innerHeight - Math.max(0, r.y))) });
      });
      return out;
    });
    const todo = boxes.filter(b2 => !collected.has(b2.qaId));
    if (todo.length) {
      const shot = (await page.screenshot()).toString('base64');
      for (const m of await dominantOf(shot, todo)) collected.set(m.qaId, m);
    }
    const done = await page.evaluate(() => {
      const max = document.documentElement.scrollHeight - innerHeight;
      if (max <= 0) return true;
      if (window.scrollY / max >= 0.995) return true;
      window.scrollBy(0, Math.round(innerHeight * 0.85));
      return false;
    });
    if (done) break;
  }
};
await sweep();

const lumJS = ({ r, g, b }) => {
  const c = [r, g, b].map(v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); });
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
};
const measured = [], unmeasurable = [];
const parseFg = t => { const r = String(t || '').match(/rgba?\(([^)]+)\)/); return r ? r[1].split(',').map(parseFloat) : null; };
for (const u of undetermined) {
  const m = collected.get(String(u.qaId));
  if (!m) { unmeasurable.push(u); continue; }
  const bg = m.bg;
  const live = parseFg(m.fg);
  const [fr, fg_, fb] = live ? live : u.fg.split(',').map(Number);
  const a = live && live.length > 3 ? live[3] : 1;
  // composition du texte semi-transparent sur son fond réel
  const comp = { r: fr * a + bg.r * (1 - a), g: fg_ * a + bg.g * (1 - a), b: fb * a + bg.b * (1 - a) };
  const L1 = lumJS(comp) + 0.05, L2 = lumJS(bg) + 0.05;
  const ratio = +(Math.max(L1, L2) / Math.min(L1, L2)).toFixed(2);
  if (ratio < u.need) measured.push({ ...u, ratio,
    fg: `${Math.round(fr)},${Math.round(fg_)},${Math.round(fb)}`, bg: `${bg.r},${bg.g},${bg.b}` });
}

console.log(`Contraste AA — ${url} — thème ${theme}${portalFirst ? ' — PREMIÈRE visite' : ''}`);
if (findings.veiled) console.log('(un voile plein écran occulte la page : seul le voile est mesuré)');
console.log(`\n[composition] ${fails.length} paire(s) sous le seuil`);
fails.forEach(f => console.log(`  ✗ ${f.ratio}/${f.need}  ${f.sel}  « ${f.txt} »  ${f.size}px  fg(${f.fg}) bg(${f.bg})`));
console.log(`\n[pixels peints] ${undetermined.length} fond(s) non composable(s) mesuré(s) à l'image — ${measured.length} sous le seuil`);
measured.forEach(f => console.log(`  ✗ ${f.ratio}/${f.need}  ${f.sel}  « ${f.txt} »  ${f.size}px  fg(${f.fg}) bg(${f.bg})`));
if (unmeasurable.length) {
  console.log(`\n${unmeasurable.length} élément(s) non capturable(s) (hors flux / masqué) :`);
  unmeasurable.slice(0, 8).forEach(u => console.log(`  ? ${u.sel}  « ${u.txt} »`));
}
const total = fails.length + measured.length;
console.log(`\nTOTAL défauts AA confirmés : ${total}`);

await b.close();
srv.close();
