/* ============================================================
   tools/qa/lib.mjs — socle commun du harnais QA SYFIR
   ------------------------------------------------------------
   Aucune dépendance installée : Playwright est fourni par
   l'environnement (NODE_PATH). Le site est servi en statique.
============================================================ */
import { createRequire } from 'node:module';
import { spawn } from 'node:child_process';
import { mkdirSync, existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

/* Playwright est fourni par l'environnement (NODE_PATH), pas installé
   dans le dépôt : l'import ESM ne consulte pas NODE_PATH, `require` si.
   C'est ce qui garde le site à zéro dépendance. */
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');

export const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
export const OUT = resolve(ROOT, 'tools/qa/out');
export const PORT = Number(process.env.QA_PORT || 8099);
export const BASE = `http://127.0.0.1:${PORT}`;

/* Les 14 pages réelles du site. Exclus volontairement :
   actualite/communaute/medias (stubs de redirection vers syf-tv)
   et apercu-syfir.html (snapshot ancien, non maintenu). */
export const PAGES = [
  'index.html', 'evenements.html', 'evenement.html?id=1', 'espace-pro.html',
  'partenaires.html', 'partenaire-avyr.html', 'partenaire-delices-bassin-bleu.html',
  'syf-tv.html', 'artiste.html', 'compte.html', 'faq.html',
  'cgv.html', 'mentions-legales.html', 'confidentialite.html'
];

export const VIEWPORTS = { mobile: { width: 390, height: 844 }, desktop: { width: 1440, height: 900 } };
export const THEMES = ['light', 'dark'];

/* ---- serveur statique : il MEURT régulièrement (piège R92 §5),
   on le (re)démarre et on attend qu'il réponde vraiment. ---- */
export async function serve() {
  const alive = async () => {
    try { const r = await fetch(`${BASE}/index.html`, { method: 'HEAD' }); return r.ok; }
    catch { return false; }
  };
  if (await alive()) return { close() {} };
  const proc = spawn('python3', ['-m', 'http.server', String(PORT), '--bind', '127.0.0.1'],
    { cwd: ROOT, stdio: 'ignore', detached: true });
  for (let i = 0; i < 60; i++) {
    await new Promise(r => setTimeout(r, 250));
    if (await alive()) return { close() { try { process.kill(-proc.pid); } catch {} } };
  }
  throw new Error(`serveur statique injoignable sur ${BASE}`);
}

export async function browser() {
  return chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
}

/* Page prête : thème forcé AVANT tout script de la page, reveals
   déclenchés, et attente de stabilisation. */
export async function openPage(ctx, url, { theme = 'dark', portalSeen = true, reduce = false } = {}) {
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(String(e.message || e)));
  await page.addInitScript(({ t, seen }) => {
    try {
      localStorage.setItem('syfir-theme', t);
      // R93 : neutralise le voile du Portail pour les mesures « site »
      if (seen) localStorage.setItem('syfir-portal', 'in');
    } catch (e) {}
  }, { t: theme, seen: portalSeen });
  await page.goto(`${BASE}/${url}`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(900);
  await page.evaluate(() => document.querySelectorAll('.reveal').forEach(e => e.classList.add('in')));
  await page.waitForTimeout(400);
  page.qaErrors = errors;
  return page;
}

/* Fige TOUTES les animations à t=0. Sans cela, un dump échantillonne des
   animations en vol : deux passes du même dépôt diffèrent alors sur des
   décimales (opacity .950207 vs .950219, matrix …2.09131 vs …2.0908) et
   la preuve de confinement se noie dans un bruit qu'elle prend pour un
   changement. Constaté en R93/1, sur ce harnais lui-même. */
export async function freezeAnimations(page) {
  await page.evaluate(() => {
    document.getAnimations().forEach(a => { try { a.pause(); a.currentTime = 0; } catch (e) {} });
  });
  await page.waitForTimeout(120);
}

/* Descente complète d'une page qui GRANDIT pendant la mesure
   (content-visibility:auto — piège R92 §4B). Motif validé :
   descente progressive + hauteur stable, PUIS réancrage jusqu'à
   scrollY/max >= 0.995. Ne jamais scroller vers une hauteur
   mesurée une seule fois. */
export async function scrollToBottom(page, { step = 700, maxTours = 400 } = {}) {
  let last = -1, stable = 0;
  for (let i = 0; i < maxTours; i++) {
    const h = await page.evaluate(s => {
      window.scrollBy(0, s);
      return document.documentElement.scrollHeight;
    }, step);
    await page.waitForTimeout(60);
    if (h === last) stable++; else { stable = 0; last = h; }
    const done = await page.evaluate(() => {
      const max = document.documentElement.scrollHeight - innerHeight;
      return max <= 0 ? true : window.scrollY / max >= 0.995;
    });
    if (done && stable >= 3) break;
  }
  // réancrage final : la hauteur a pu bouger au dernier instant
  for (let i = 0; i < 30; i++) {
    const ok = await page.evaluate(() => {
      const max = document.documentElement.scrollHeight - innerHeight;
      if (max <= 0) return true;
      if (window.scrollY / max >= 0.995) return true;
      window.scrollTo(0, document.documentElement.scrollHeight);
      return false;
    });
    if (ok) break;
    await page.waitForTimeout(120);
  }
}

/* ---- couleurs & contraste ---- */
export const parseRGB = s => {
  const m = String(s || '').match(/rgba?\(([^)]+)\)/);
  if (!m) return null;
  const p = m[1].split(',').map(parseFloat);
  return { r: p[0], g: p[1], b: p[2], a: p[3] === undefined ? 1 : p[3] };
};
export const relLum = ({ r, g, b }) => {
  const c = [r, g, b].map(v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); });
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
};
export const contrast = (fg, bg) => {
  const L1 = relLum(fg) + 0.05, L2 = relLum(bg) + 0.05;
  return +(Math.max(L1, L2) / Math.min(L1, L2)).toFixed(2);
};

export function ensureOut(sub = '') {
  const dir = sub ? resolve(OUT, sub) : OUT;
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  return dir;
}
