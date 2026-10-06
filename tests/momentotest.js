// «El momento de decidir»: texto final de la pregunta y de las dos ramas; Repetir, Volver y atrás
const { chromium } = require('playwright'); const path = require('path');
const URL = 'file:///' + path.resolve(__dirname, '..', 'index.html').split(String.fromCharCode(92)).join('/');
const ok = (c, m) => console.log((c ? 'PASS ' : 'FAIL ') + m);
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 375, height: 812 } }); p.setDefaultTimeout(6000);
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.addInitScript(() => { if (sessionStorage.getItem('s')) return; sessionStorage.setItem('s', '1'); localStorage.setItem('wesserWelcomeSeen', '1'); localStorage.setItem('wesserLastView', 'herramientas'); });
  await p.goto(URL); await p.waitForTimeout(300);
  const cuerpo = () => p.evaluate(() => document.getElementById('toolBody').textContent.replace(/\s+/g, ' ').trim());
  const botones = () => p.evaluate(() => [...document.querySelectorAll('#toolBody button')].map(b => b.textContent.trim()));
  const top = () => p.evaluate(() => Overlays.top() === 'tool' ? document.getElementById('toolTitle').textContent : (Overlays.top() || 'app'));
  const abrir = () => p.locator('#view-herramientas .trow:has-text("El momento de decidir")').click();

  await abrir();
  ok(await cuerpo() === 'Antes de dejar pasar a alguien, hazte esta pregunta: ¿Estoy decidiendo no hacer la parada o estoy evitando sentir el rechazo? Decido conscientemente Estoy evitando', 'pantalla inicial: pregunta y botones con el texto final');

  await p.locator('#toolBody button:has-text("Decido conscientemente")').click();
  ok(await cuerpo() === 'Es tu decisión No todas las paradas tienen que producirse. Decidir con criterio también es parte del trabajo. Repetir Volver', 'rama «Decido conscientemente»: texto final');
  await p.locator('#toolBody button:has-text("Repetir")').click();
  ok((await cuerpo()).startsWith('Antes de dejar pasar a alguien'), '«Repetir» vuelve a la pregunta');

  await p.locator('#toolBody button:has-text("Estoy evitando")').click();
  const ev = await p.evaluate(() => ({ h: document.querySelector('#toolBody h3').textContent, q: document.querySelector('#toolBody .quote-strong').textContent }));
  ok(ev.h === 'No te adelantes al rechazo' && ev.q === '«Primero decido. Después veo qué pasa.»', 'rama «Estoy evitando»: título y frase finales');
  ok(await cuerpo() === 'No te adelantes al rechazo «Primero decido. Después veo qué pasa.» Repetir Volver' && !(await cuerpo()).includes('Solo necesito decidir'), 'rama «Estoy evitando»: sin el texto anterior ni frases añadidas');
  ok(JSON.stringify(await botones()) === '["Repetir","Volver"]', 'rama «Estoy evitando»: botones «Repetir» y «Volver»');
  await p.locator('#toolBody button:has-text("Volver")').click(); await p.waitForTimeout(350);
  ok(await top() === 'app', '«Volver» cierra la herramienta');

  await abrir(); await p.locator('#toolBody button:has-text("Estoy evitando")').click();
  await p.goBack(); await p.waitForTimeout(450);
  ok(await top() === 'app' && await p.evaluate(() => !!document.querySelector('.view.active')), 'atrás cierra la herramienta y sigue en la app');
  ok(errs.length === 0, 'sin errores de JS ' + errs.join(' | '));
  await b.close();
})();
