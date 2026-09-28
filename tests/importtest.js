const { chromium } = require('playwright');
const path = require('path'), fs = require('fs');
const URL = 'file:///' + path.resolve(__dirname, '..', 'index.html').replace(/\\/g, '/');
const ok = (c, m) => console.log((c ? 'PASS ' : 'FAIL ') + m);
require('fs').mkdirSync(require('path').join(__dirname, 'out'), { recursive: true });
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage(); await page.addInitScript(()=>{try{localStorage.setItem('wesserWelcomeSeen','1')}catch(e){}});
  const errors = [], dialogs = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('dialog', d => { dialogs.push(d.message()); d.accept(); });
  await page.goto(URL);
  ok(await page.evaluate(() => state.dataVersion === 3 && state.sepaEntries.length === 0), 'usuario nuevo arranca con estado v2 vacío');

  const X = n => `<img src=x onerror="window.pwned='${n}'">`;
  const file = path.join(__dirname, 'out', 'import.json');
  fs.writeFileSync(file, JSON.stringify({
    dataVersion: 1, sepaEntries: [{ id: '1)//', fecha: X('f'), situacion: X('s'), emociones: ['ira'], pensD: 'a', pensC: 'b', accion: 'c' }],
    checkpoints: [], visualAnchors: [X('va')], checkins: [{ id: 1, fecha: 'x', items: [X('ci')] }], confidenceAnchors: [{ word: X('w'), memory: 'm' }], resetHistory: [],
    resetProgress: { step: 5, micro: X('m'), stops: 3 }
  }));
  await page.setInputFiles('#importDatosInput', file);
  await page.locator('#confirmOk').waitFor();
  ok(await page.locator('#confirmTitle').innerText() === '¿Reemplazar tus datos?', 'importar pide confirmación accesible antes de reemplazar');
  await Promise.all([page.waitForEvent('load'), page.locator('#confirmOk').click()]);
  await page.waitForTimeout(200);
  ok((await page.locator('#toastMsg').innerText()) === 'Datos importados correctamente.' && await page.locator('#toast').evaluate(t => t.classList.contains('show')), 'aviso de éxito tras recargar');
  ok(await page.evaluate(() => state.dataVersion === 3 && state.sepaEntries.length === 1 && state.resetProgress.stops === 3), 'importación v1 aceptada, migrada y saneada');
  await page.evaluate(() => { goto('diario'); openAnchor(); closeTool(); openVisualAnchor(); closeModal(); openReset(); resumeReset(); openCheckinHistorial(); });
  await page.waitForTimeout(300);
  ok(!(await page.evaluate(() => window.pwned)), 'datos importados no ejecutan código');

  fs.writeFileSync(file, JSON.stringify({ dataVersion: 1, sepaEntries: 'no' }));
  await page.setInputFiles('#importDatosInput', file);
  await page.waitForTimeout(500);
  const dm = await page.locator('#datosMsg').innerText();
  ok(dm.includes('Falta la colección') && await page.locator('#datosMsg').evaluate(e => e.className === 'field-error'), 'importación inválida: motivo en línea en «Mis datos»: ' + dm);
  // Cancelar un reemplazo no toca nada
  fs.writeFileSync(file, JSON.stringify({ dataVersion: 3, sepaEntries: [], checkpoints: [], visualAnchors: [], checkins: [], confidenceAnchors: [], resetHistory: [] }));
  await page.setInputFiles('#importDatosInput', file);
  await page.locator('#confirmCancel').click();
  const dbg = await page.evaluate(() => ({ n: state.sepaEntries.length, top: Overlays.top(), msg: document.getElementById('datosMsg').textContent }));
  ok(dbg.n === 1 && dbg.top !== 'confirm', 'cancelar la importación mantiene los datos: ' + JSON.stringify(dbg));
  // Borrar todos los datos
  await page.evaluate(() => { openHelp(); borrarTodosDatos(); });
  ok(await page.locator('#confirmOk').innerText() === 'Borrar todo', 'borrar todo usa confirmación con botón explícito');
  await page.keyboard.press('Escape');
  ok(await page.evaluate(() => state.sepaEntries.length === 1 && Overlays.top() === 'help'), 'Escape cancela y se vuelve a la Ayuda');
  await page.evaluate(() => closeHelp());
  ok(await page.evaluate(() => state.sepaEntries.length === 1), 'los datos actuales no se tocan al rechazar');
  ok(errors.length === 0, 'sin errores de JS: ' + errors.join(' | '));
  await browser.close();
})();
