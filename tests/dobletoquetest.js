// Diario: un doble toque en «Guardar registro» guarda una vez y no muestra errores del formulario ya vacío;
// un registro nuevo poco después se guarda con normalidad
const { chromium } = require('playwright'); const path = require('path');
const URL = 'file:///' + path.resolve(__dirname, '..', 'index.html').split(String.fromCharCode(92)).join('/');
const ok = (c, m) => console.log((c ? 'PASS ' : 'FAIL ') + m);
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 375, height: 812 }, hasTouch: true }); p.setDefaultTimeout(6000);
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.addInitScript(() => { if (sessionStorage.getItem('s')) return; sessionStorage.setItem('s', '1'); localStorage.clear(); localStorage.setItem('wesserWelcomeSeen', '1'); localStorage.setItem('wesserLastView', 'diario'); });
  await p.goto(URL); await p.waitForTimeout(300);
  const rellenar = async accion => {
    await p.selectOption('#sepaSituacion', 'Zona con poco flujo'); await p.selectOption('#sepaPensDestructivo', 'No vale la pena');
    await p.locator('#sepaEmocionChips [data-id="miedo"]').click(); await p.fill('#sepaPensConstructivo', 'útil'); await p.fill('#sepaAccion', accion);
  };
  const n = () => p.evaluate(() => JSON.parse(localStorage.getItem('wesserAppState') || '{"sepaEntries":[]}').sepaEntries.length);
  const errores = () => p.evaluate(() => document.querySelectorAll('#view-diario .field-error').length);

  await rellenar('pausa');
  await p.locator('#sepaSaveBtn').dblclick(); await p.waitForTimeout(250);
  ok(await n() === 1, 'doble toque: se guarda un solo registro');
  ok(await errores() === 0, 'doble toque: no aparecen errores del formulario ya vacío');
  ok(/guardado/i.test(await p.evaluate(() => document.getElementById('toastMsg').textContent)), 'se ve el aviso de registro guardado');
  // Un segundo registro poco después (ya fuera del margen) se guarda normal
  await p.waitForTimeout(900);
  await rellenar('respirar'); await p.locator('#sepaSaveBtn').click(); await p.waitForTimeout(200);
  ok(await n() === 2, 'un registro nuevo después se guarda con normalidad');
  // Pulsar guardar con el formulario vacío (sin acabar de guardar) sigue mostrando los errores
  await p.waitForTimeout(900);
  await p.locator('#sepaSaveBtn').click(); await p.waitForTimeout(200);
  ok(await errores() > 0 && await n() === 2, 'guardar con el formulario vacío sigue indicando qué falta');
  ok(errs.length === 0, 'sin errores de JS ' + errs.join(' | '));
  await b.close();
})();
