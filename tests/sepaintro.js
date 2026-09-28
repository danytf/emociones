const { chromium } = require('playwright');
const path = require('path'), fs = require('fs');
const URL = 'file:///' + path.resolve(__dirname, '..', 'index.html').replace(/\\/g, '/');
const ok = (c, m) => console.log((c ? 'PASS ' : 'FAIL ') + m);
require('fs').mkdirSync(require('path').join(__dirname, 'out'), { recursive: true });
(async () => {
  const b = await chromium.launch();
  for (const [w, h] of [[390, 844], [768, 1024]]) {
    const p = await b.newPage({ viewport: { width: w, height: h } }); await p.addInitScript(()=>{try{localStorage.setItem('wesserWelcomeSeen','1')}catch(e){}});
    await p.goto(URL);
    await p.evaluate(() => localStorage.clear());
    await p.reload();
    await p.locator('#headerTabs [data-view="diario"]').click();
    const y = () => p.evaluate(() => Math.round(document.getElementById('sepaSituacion').getBoundingClientRect().top));
    const open1 = await p.evaluate(() => document.getElementById('sepaIntro').open);
    const yOpen = await y();
    await p.locator('#sepaIntro summary').click();
    await p.waitForTimeout(150);
    const yClosed = await y();
    await p.reload();
    await p.locator('#headerTabs [data-view="diario"]').click();
    const remembered = await p.evaluate(() => !document.getElementById('sepaIntro').open);
    const yAfter = await y();
    ok(open1 && remembered, `${w}px: abierta la 1.ª vez y se recuerda plegada`);
    console.log(`   ${w}x${h}: primer campo en y=${yOpen}px (${Math.round(100 * yOpen / h)}%) → plegada y=${yAfter}px (${Math.round(100 * yAfter / h)}%)`);
    if (w === 390) await p.screenshot({ path: path.join(__dirname, 'out', 'sepa-plegada.png'), clip: { x: 0, y: 0, width: 390, height: 844 } });
    await p.locator('#sepaIntro summary').click();
    ok(await p.evaluate(() => document.getElementById('sepaIntro').open && document.getElementById('sepaIntro').innerText.includes('Ejemplo útil')), `${w}px: se vuelve a abrir con toda la explicación`);
    await p.close();
  }
  await b.close();
})();
