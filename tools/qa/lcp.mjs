/* ============================================================
   tools/qa/lcp.mjs [page|--sweep] [--portal-first]
   ------------------------------------------------------------
   LCP mobile réel, au PerformanceObserver, CPU bridé ×4 (mêmes
   conditions que la référence R92 : 504 ms sur budget 2 500 ms).

   On mesure le RÉSULTAT peint (élément LCP + horodatage), pas une
   heuristique. Le nom de l'élément LCP est rapporté : c'est lui qui
   dit si un voile plein écran est devenu le LCP.

   Usage :
     node tools/qa/lcp.mjs                      # index, visite mémorisée
     node tools/qa/lcp.mjs --portal-first       # index, PREMIÈRE visite (voile)
     node tools/qa/lcp.mjs --sweep              # les 14 pages
============================================================ */
import { serve, browser, BASE, PAGES, VIEWPORTS } from './lib.mjs';

const args = process.argv.slice(2);
const sweep = args.includes('--sweep');
const portalFirst = args.includes('--portal-first');
const only = args.find(a => !a.startsWith('--'));
const BUDGET = 2500;

async function measure(b, url, { firstVisit }) {
  const ctx = await b.newContext({ viewport: VIEWPORTS.mobile });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(String(e.message || e)));
  // Visite mémorisée = portail déjà franchi ; première visite = rien en mémoire.
  if (!firstVisit) {
    await page.addInitScript(() => { try { localStorage.setItem('syfir-portal', 'in'); } catch (e) {} });
  }
  await page.addInitScript(() => {
    window.__lcp = { ms: 0, el: '', url: '' };
    new PerformanceObserver(list => {
      for (const e of list.getEntries()) {
        window.__lcp = {
          ms: Math.round(e.renderTime || e.loadTime || e.startTime),
          el: e.element ? (e.element.tagName.toLowerCase() +
              (e.element.id ? '#' + e.element.id : '') +
              (e.element.className ? '.' + String(e.element.className).split(' ')[0] : '')) : '(sans élément)',
          url: e.url || ''
        };
      }
    }).observe({ type: 'largest-contentful-paint', buffered: true });
  });
  const cdp = await ctx.newCDPSession(page);
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
  await page.goto(`${BASE}/${url}`, { waitUntil: 'load' });
  await page.waitForTimeout(2500);
  // Un geste fige le LCP (spec) — on le fait après la fenêtre de mesure.
  const r = await page.evaluate(() => window.__lcp);
  await ctx.close();
  return { ...r, errors };
}

const srv = await serve();
const b = await browser();

if (sweep) {
  console.log(`LCP mobile, CPU ×4, budget ${BUDGET} ms — 14 pages`);
  let worst = { ms: 0 };
  for (const url of PAGES) {
    const r = await measure(b, url, { firstVisit: false });
    if (r.ms > worst.ms) worst = { ...r, url };
    const flag = r.ms > BUDGET ? '✗' : '✓';
    console.log(`  ${flag} ${String(r.ms).padStart(5)} ms  ${url.padEnd(38)} LCP = ${r.el}`);
  }
  console.log(`\nPire page : ${worst.url} à ${worst.ms} ms (${worst.ms > BUDGET ? 'HORS' : 'dans'} budget).`);
} else {
  const url = only || 'index.html';
  const r = await measure(b, url, { firstVisit: portalFirst });
  const mode = portalFirst ? 'PREMIÈRE visite (voile attendu)' : 'visite mémorisée';
  console.log(`LCP mobile, CPU ×4 — ${url} — ${mode}`);
  console.log(`  ${r.ms} ms  (budget ${BUDGET})  ${r.ms > BUDGET ? '✗ HORS BUDGET' : '✓'}`);
  console.log(`  élément LCP : ${r.el}${r.url ? '  <- ' + r.url : ''}`);
  if (r.errors.length) console.log(`  ⚠ erreurs JS : ${r.errors.join(' | ')}`);
}

await b.close();
srv.close();
