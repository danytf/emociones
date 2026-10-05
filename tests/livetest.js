const { chromium } = require('playwright');
const ok = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); if (!c) process.exitCode = 1; };
const PAGES = 'https://danytf.github.io/emociones/';
// index.html de main leído por la API de GitHub (sin la caché del CDN de raw.githubusercontent)
const MAIN = 'https://api.github.com/repos/danytf/emociones/contents/index.html?ref=main';
const sha256 = buf => require('crypto').createHash('sha256').update(buf).digest('hex');
async function bajar(url, headers) {
  const r = await fetch(url, { headers: { 'cache-control': 'no-cache', ...headers } });
  if (!r.ok) throw new Error(url + ' → HTTP ' + r.status);
  return Buffer.from(await r.arrayBuffer());
}
(async () => {
  // Identidad de contenido: el index.html que sirve Pages debe ser byte a byte el de main
  try {
    const [main, web] = await Promise.all([bajar(MAIN, { accept: 'application/vnd.github.raw' }), bajar(PAGES + '?nc=' + Date.now())]);
    const hMain = sha256(main), hWeb = sha256(web);
    if (hMain === hWeb) ok(true, 'versión publicada coincide con main: ' + hMain);
    else ok(false, 'versión publicada NO coincide con main (main ' + hMain.slice(0, 12) + '…, Pages ' + hWeb.slice(0, 12) + '…)');
  } catch (e) { ok(false, 'no se pudo comprobar la versión publicada: ' + e.message); }
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 820, height: 1180 } }); await p.addInitScript(()=>{try{localStorage.setItem('wesserWelcomeSeen','1')}catch(e){}});
  const errs = [];
  p.on('pageerror', e => errs.push(e.message));
  p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  const r = await p.goto('https://danytf.github.io/emociones/', { waitUntil: 'load' });
  ok(r.status() === 200, 'GitHub Pages responde 200 por https');
  // Qué publicación se ha probado: un PASS de la versión anterior no valida un cambio nuevo
  console.log('INFO versión servida: ' + (r.headers()['last-modified'] || 'desconocida'));
  for (const v of ['bienestar', 'herramientas', 'diario', 'aprender']) await p.locator(`#headerTabs [data-view="${v}"]`).click();
  ok(await p.evaluate(() => document.getElementById('view-aprender').classList.contains('active')), 'navegación entre secciones');
  await p.locator('#headerTabs [data-view="diario"]').click();
  await p.selectOption('#sepaSituacion', 'Zona con poco flujo');
  await p.selectOption('#sepaPensDestructivo', 'No vale la pena');
  await p.locator('#sepaEmocionChips [data-id="ira"]').click();
  await p.fill('#sepaPensConstructivo', 'prueba en producción');
  await p.fill('#sepaAccion', 'pausa');
  await p.locator('#sepaSaveBtn').click();
  await p.reload();
  ok(await p.evaluate(() => state.sepaEntries.length === 1 && state.dataVersion === 3), 'guardar en localStorage en el dominio publicado y conservar tras recargar');
  await p.locator('#tabReset').click();
  ok(await p.evaluate(() => Overlays.top() === 'reset'), 'Modo Reset abre');
  await p.keyboard.press('Escape');
  ok(await p.evaluate(() => Overlays.top() === null), 'Escape cierra');
  await p.evaluate(() => localStorage.clear());
  ok(errs.length === 0, 'sin errores en consola: ' + errs.join(' | '));
  await b.close();
})();
