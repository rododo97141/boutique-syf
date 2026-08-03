/* tools/qa/voile-bande.mjs [page] [nom]
   L'APPORT DU VOILE, RENDU VISIBLE. Le voile pèse 5 à 20 % d'alpha : sur
   une capture pleine page, l'avant et l'après sont indiscernables à l'œil,
   et prétendre le contraire serait mentir sur ce qu'une image montre. Ce
   qu'on peut montrer, c'est la MESURE : à douze positions de défilement,
   la contribution du voile seul (différentiel avec/sans, page figée),
   amplifiée x40 et posée en bande. Un voile qui dérive donne un dégradé ;
   un voile qui saute donne des blocs. */
import { serve, browser, VIEWPORTS, BASE } from './lib.mjs';
const page = process.argv[2] || 'partenaires.html';
const nom  = process.argv[3] || 'voile';
const N = 12;
const srv = await serve(); const b = await browser();
try {
  const ctx = await b.newContext({ viewport: VIEWPORTS.desktop });
  const pg = await ctx.newPage();
  await pg.addInitScript(() => { try { localStorage.setItem('syfir-portal','in'); } catch(e){} });
  await pg.goto(`${BASE}/${page}`, { waitUntil: 'load' });
  await pg.waitForTimeout(1400);
  const zone = { x: 0, y: 0, width: 120, height: 120 };
  const moy = async () => {
    const sh = await pg.screenshot({ clip: zone });
    return pg.evaluate(async b64 => {
      const im = new Image(); im.src='data:image/png;base64,'+b64; await im.decode();
      const c=document.createElement('canvas'); c.width=im.width;c.height=im.height;
      const g=c.getContext('2d'); g.drawImage(im,0,0);
      const d=g.getImageData(0,0,im.width,im.height).data;
      let r=0,v=0,bl=0,n=0; for(let k=0;k<d.length;k+=4){r+=d[k];v+=d[k+1];bl+=d[k+2];n++;}
      return [r/n,v/n,bl/n];
    }, sh.toString('base64'));
  };
  const pts = [];
  for (let i=0;i<N;i++){
    const f=i/(N-1);
    await pg.evaluate(x=>scrollTo(0,Math.round((document.documentElement.scrollHeight-innerHeight)*x)), f);
    await pg.mouse.move(700,400); await pg.mouse.wheel(0,1); await pg.mouse.wheel(0,-1);
    await pg.waitForTimeout(260);
    await pg.evaluate(()=>{window.__g=document.getAnimations().filter(a=>a.playState==='running');window.__g.forEach(a=>{try{a.pause()}catch(e){}})});
    await pg.waitForTimeout(350);
    const A=await moy();
    await pg.evaluate(()=>document.querySelector('.ambience').style.display='none');
    await pg.waitForTimeout(350);
    const S=await moy();
    await pg.evaluate(()=>{document.querySelector('.ambience').style.display='';(window.__g||[]).forEach(a=>{try{a.play()}catch(e){}})});
    pts.push([A[0]-S[0],A[1]-S[1],A[2]-S[2]]);
  }
  await pg.close();
  /* rendu de la bande */
  const vue = await ctx.newPage();
  await vue.setViewportSize({ width: 980, height: 260 });
  await vue.setContent(`<style>
    body{margin:0;background:#04070f;font:600 12px/1.4 system-ui;color:#EEF2F8;padding:22px}
    h1{font:700 15px/1 system-ui;letter-spacing:.08em;text-transform:uppercase;margin:0 0 4px}
    p{margin:0 0 16px;opacity:.6;font-weight:400}
    .b{display:flex;height:110px;border-radius:6px;overflow:hidden}
    .b i{flex:1;display:block}
    .x{display:flex;margin-top:6px}.x span{flex:1;text-align:center;opacity:.55;font-weight:400}
  </style>
  <h1>${nom} — apport du voile, amplifié ×40</h1>
  <p>${page} · différentiel avec/sans, page figée · un dégradé = le voile dérive · des blocs = il saute</p>
  <div class="b">${pts.map(p=>`<i style="background:rgb(${p.map(v=>Math.max(0,Math.min(255,128+v*40))).join(',')})"></i>`).join('')}</div>
  <div class="x">${pts.map((_,i)=>`<span>${Math.round(i*100/(N-1))}%</span>`).join('')}</div>`);
  await vue.waitForTimeout(300);
  await vue.screenshot({ path: `tools/qa/captures/${nom}.png` });
  console.log(`  tools/qa/captures/${nom}.png`);
  console.log('  Δrgb :', pts.map(p=>p.map(x=>x.toFixed(1)).join('/')).join('  '));
} finally { await b.close(); srv.close(); }
