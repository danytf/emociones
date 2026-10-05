// Guardas de accesibilidad del Prompt 5 (se añaden a la batería como prueba propia)
const { chromium } = require('playwright'); const path = require('path');
const URL = 'file:///' + path.resolve(__dirname, '..', 'index.html').split(path.sep).join('/');
const ok = (c, m) => console.log((c ? 'PASS ' : 'FAIL ') + m);
(async () => { const b = await chromium.launch();
  // 1) Foco nunca debajo de la barra inferior fija
  let p = await b.newPage({ viewport: { width: 375, height: 812 } });
  await p.addInitScript(() => { localStorage.setItem('wesserWelcomeSeen', '1'); localStorage.setItem('wesserLastView', 'herramientas'); });
  await p.goto(URL); await p.waitForTimeout(200);
  let tapado = 0;
  for (let i = 0; i < 40; i++) { await p.keyboard.press('Tab'); tapado += await p.evaluate(() => { const a = document.activeElement, n = document.querySelector('.tabs-wrap'); if (!a || n.contains(a) || a === document.body) return 0; return a.getBoundingClientRect().bottom > n.getBoundingClientRect().top + 1 ? 1 : 0; }); }
  ok(tapado === 0, 'al recorrer con Tab, ningún elemento enfocado queda bajo la barra inferior fija');
  // 2) «Elegir otro» devuelve el foco al estado de origen
  await p.evaluate(() => { startEstados(); openEstado('impotencia'); });
  await p.locator('#toolBody button:has-text("Elegir otro")').click();
  ok(await p.evaluate(() => document.activeElement.dataset.value === 'impotencia'), '«Elegir otro» devuelve el foco al estado del que venías');
  await p.close();
  // 3) En oscuro, el contorno de foco usa el rojo noche (≥ 3:1 sobre las superficies)
  p = await b.newPage({ viewport: { width: 375, height: 812 } });
  await p.addInitScript(() => { localStorage.setItem('wesserWelcomeSeen', '1'); localStorage.setItem('wesserAppState', JSON.stringify({ dataVersion: 3, theme: 'dark' })); });
  await p.goto(URL); await p.waitForTimeout(200);
  await p.keyboard.press('Tab'); await p.keyboard.press('Tab');
  ok(await p.evaluate(() => getComputedStyle(document.activeElement).outlineColor) === 'rgb(239, 106, 110)', 'en oscuro el foco usa el rojo noche');
  // 4) La pestaña activa se distingue también por forma
  ok(await p.evaluate(() => getComputedStyle(document.querySelector('#headerTabs button.active')).boxShadow.includes('inset')), 'la pestaña activa lleva indicador, no solo color');
  await p.close();
  // 5) Pantalla muy baja (400 %): sin barras fijas
  p = await b.newPage({ viewport: { width: 320, height: 225 } });
  await p.addInitScript(() => { localStorage.setItem('wesserWelcomeSeen', '1'); });
  await p.goto(URL); await p.waitForTimeout(200);
  ok(await p.evaluate(() => getComputedStyle(document.querySelector('.tabs-wrap')).position === 'static' && document.documentElement.scrollWidth <= innerWidth), 'con 400 % de zoom la barra de secciones deja de estar fija y no hay desplazamiento horizontal');
  await p.close(); await b.close();
})();
