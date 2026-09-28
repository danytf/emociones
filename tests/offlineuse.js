const { chromium } = require('playwright');
const ok = (c, m) => console.log((c ? 'PASS ' : 'FAIL ') + m);
(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext();
  const p = await ctx.newPage(); await p.addInitScript(()=>{try{localStorage.setItem('wesserWelcomeSeen','1')}catch(e){}});
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('https://danytf.github.io/emociones/');
  await ctx.setOffline(true);
  await p.locator('#headerTabs [data-view="diario"]').click();
  await p.locator('#sepaEmocionChips [data-id="miedo"]').click();
  await p.fill('#sepaPensConstructivo', 'sin cobertura');
  await p.fill('#sepaAccion', 'pausa');
  await p.locator('#sepaSaveBtn').click();
  ok(await p.evaluate(() => JSON.parse(localStorage.getItem('wesserAppState')).sepaEntries.length === 1), 'sin conexión: guardar en el Diario funciona');
  await p.evaluate(() => startBreath(60));
  ok(await p.evaluate(() => Overlays.top() === 'tool'), 'sin conexión: las herramientas funcionan');
  await p.evaluate(() => { closeTool(); openReset(); openKit(); });
  ok(await p.evaluate(() => Overlays.top() === 'reset'), 'sin conexión: Reset y Kit funcionan');
  let reloadFails = false;
  try { await p.reload({ timeout: 8000 }); } catch (e) { reloadFails = true; }
  ok(reloadFails, 'sin conexión: recargar la página falla (confirmado)');
  await ctx.setOffline(false);
  await p.goto('https://danytf.github.io/emociones/');
  ok(await p.evaluate(() => state.sepaEntries.length === 1 && state.sepaEntries[0].pensC === 'sin cobertura'), 'al volver la conexión, lo guardado sin cobertura sigue ahí');
  await p.evaluate(() => localStorage.clear());
  ok(errs.length === 0, 'sin errores de JS');
  await b.close();
})();
