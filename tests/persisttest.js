const { chromium } = require('playwright');
const path = require('path'), fs = require('fs');
const URL = 'file:///' + path.resolve(__dirname, '..', 'index.html').replace(/\\/g, '/');
const ok = (c, m) => console.log((c ? 'PASS ' : 'FAIL ') + m);
const DAY = 86400000;

require('fs').mkdirSync(require('path').join(__dirname, 'out'), { recursive: true });
(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ acceptDownloads: true, timezoneId: 'Europe/Madrid' });
  const page = await ctx.newPage(); await page.addInitScript(()=>{try{localStorage.setItem('wesserWelcomeSeen','1')}catch(e){}});
  const errors = [], dialogs = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('dialog', d => { dialogs.push(d.message()); d.accept(); });

  const now = Date.now();
  const v2 = {
    dataVersion: 2,
    sepaEntries: [
      { id: now - 2 * DAY, fecha: 'x', situacion: 'reciente por id', emociones: ['ira'], pensD: 'a', pensC: 'b', accion: 'c' },
      { id: 12345, fecha: '3/9/2026, 14:05:03', situacion: 'por fecha', emociones: [], pensD: '', pensC: '', accion: '' },
      { id: 999, fecha: 'texto raro', situacion: 'sin fecha', emociones: [], pensD: '', pensC: '', accion: '' },
      { id: now, createdAt: new Date(now - 20 * DAY).toISOString(), situacion: 'id reciente pero creado hace 20 días', emociones: [], pensD: '', pensC: '', accion: '' }
    ],
    checkpoints: [], visualAnchors: [], checkins: [], confidenceAnchors: [], resetHistory: [], exitos: []
  };
  await page.addInitScript(d => { if (!sessionStorage.getItem('seeded')) { localStorage.setItem('wesserAppState', JSON.stringify(d)); sessionStorage.setItem('seeded', '1'); } }, v2);
  await page.goto(URL);

  // ---- 2.2 Modelo de fechas ----
  const st = await page.evaluate(() => state);
  ok(st.dataVersion === 3, 'migra a dataVersion 3');
  ok(st.sepaEntries[0].createdAt === new Date(now - 2 * DAY).toISOString(), 'createdAt deducido del id antiguo');
  ok(st.sepaEntries[1].createdAt === await page.evaluate(() => new Date(2026, 8, 3, 14, 5, 3).toISOString()), 'createdAt deducido del texto fecha (hora local)');
  ok(st.sepaEntries[2].createdAt === null && st.sepaEntries[2].fecha === 'texto raro', 'sin fecha deducible: createdAt null y se conserva el texto');
  ok(!('fecha' in st.sepaEntries[0]), 'fecha legada eliminada cuando hay createdAt');
  ok(st.sepaEntries.every(e => e.updatedAt === e.createdAt), 'updatedAt inicial = createdAt');
  await page.evaluate(() => { goto('diario'); setPatronesRango(7); });
  const c7 = await page.locator('#patronesBody .patron-count').first().innerText();
  await page.evaluate(() => setPatronesRango(30));
  const c30 = await page.locator('#patronesBody .patron-count').first().innerText();
  ok(c7.startsWith('1 registro'), 'últimos 7 días usa createdAt (no el id): ' + c7);
  ok(c30.startsWith('3 registros'), 'últimos 30 días usa createdAt: ' + c30);
  const metas = await page.locator('#sepaHistorial .meta').allInnerTexts();
  ok(metas[2].startsWith('texto raro') && /\d{1,2}\/\d{1,2}\/\d{4}/.test(metas[0]), 'fechas mostradas desde createdAt: ' + metas.slice(0, 3).join(' | '));

  // Registro nuevo y edición
  await page.evaluate(() => { startExito(); selectExitoConducta('He escuchado bien'); guardarExito(); closeTool(); });
  const ex = await page.evaluate(() => state.exitos[0]);
  ok(Number.isSafeInteger(ex.id) && /Z$/.test(ex.createdAt) && ex.updatedAt === ex.createdAt && !('fecha' in ex), 'registro nuevo con id, createdAt y updatedAt ISO');
  const idA = await page.evaluate(() => newId()), idB = await page.evaluate(() => newId());
  ok(idB > idA, 'ids únicos aunque se creen en el mismo milisegundo');
  await page.waitForTimeout(20);
  await page.evaluate(id => { editarSepa(id); document.getElementById('sepaPensConstructivo').value = 'editado'; document.getElementById('sepaAccion').value = 'x'; guardarSepa(); }, st.sepaEntries[0].id);
  const ed = await page.evaluate(id => state.sepaEntries.find(e => e.id === id), st.sepaEntries[0].id);
  ok(ed.updatedAt > ed.createdAt && ed.pensC === 'editado', 'editar actualiza updatedAt y conserva createdAt');

  // ---- 2.1 Debounce ----
  await page.evaluate(() => {
    window.__writes = 0;
    const orig = Storage.prototype.setItem;
    Storage.prototype.setItem = function (k, v) { if (k === 'wesserAppState') window.__writes++; return orig.call(this, k, v); };
    openKit(); Overlays.open('reset');
  });
  await page.locator('#kitAjusteInput').pressSequentially('escuchar hasta el final', { delay: 30 });
  const duringTyping = await page.evaluate(() => window.__writes);
  await page.waitForTimeout(600);
  const afterPause = await page.evaluate(() => window.__writes);
  const stored = await page.evaluate(() => JSON.parse(localStorage.getItem('wesserAppState')).kitAjuste);
  ok(duringTyping === 0, `sin escrituras mientras se teclea (23 teclas → ${duringTyping})`);
  ok(afterPause === 1 && stored === 'escuchar hasta el final', `una sola escritura tras la pausa (${afterPause}) con el texto completo`);

  await page.evaluate(() => { resetGoto(2); });
  await page.evaluate(() => { window.__writes = 0; });
  await page.locator('#resetExamResultadoInput').pressSequentially('poco flujo', { delay: 20 });
  await page.evaluate(() => { Object.defineProperty(document, 'visibilityState', { value: 'hidden', configurable: true }); document.dispatchEvent(new Event('visibilitychange')); });
  const flushed = await page.evaluate(() => JSON.parse(localStorage.getItem('wesserAppState')).resetProgress.examResultado);
  ok(flushed === 'poco flujo', 'al ocultar la página se vuelca el guardado pendiente');
  await page.evaluate(() => { Object.defineProperty(document, 'visibilityState', { value: 'visible', configurable: true }); closeReset(); });

  // ---- 2.4 Límites ----
  await page.evaluate(() => { goto('diario'); openKit(); });
  const lim = await page.evaluate(() => {
    return {
      ta: document.getElementById('sepaPensConstructivo').maxLength,
      inp: document.getElementById('sepaSituacionOtra').maxLength,
      kit: document.getElementById('kitPediraInput').maxLength,
      noLimit: [...document.querySelectorAll('textarea, input[type="text"]')].filter(e => e.maxLength < 0).map(e => e.id)
    };
  });
  ok(lim.ta === 5000 && lim.inp === 300 && lim.kit === 300 && lim.noLimit.length === 0, 'maxlength en todos los campos: ' + JSON.stringify(lim));
  await page.evaluate(() => { closeReset(); startPedirFeedback(); });
  ok(await page.evaluate(() => document.getElementById('pedirFeedbackOtroInput').maxLength) === 300, 'campo creado dinámicamente también limitado');
  await page.evaluate(() => closeTool());

  // ---- 2.3 Exportación ----
  const [dl] = await Promise.all([page.waitForEvent('download'), page.evaluate(() => exportarDatos())]);
  const expectedName = await page.evaluate(() => `wesser-datos-${localDateStamp()}.json`);
  ok(dl.suggestedFilename() === expectedName, 'nombre de archivo con fecha local: ' + dl.suggestedFilename());
  const file = path.join(__dirname, 'out', 'export.json');
  await dl.saveAs(file);
  const exp = JSON.parse(fs.readFileSync(file, 'utf8'));
  ok(exp.exportFormat === 'wesser-app-data' && exp.dataVersion === 3 && /Z$/.test(exp.exportedAt), 'export incluye formato, versión y fecha de exportación');
  ok((await page.locator('#datosMsg').innerText()).startsWith('Copia de seguridad descargada: ' + expectedName), 'mensaje de éxito claro (en línea)');
  const madridMidnight = await page.evaluate(() => { const d = new Date(2026, 8, 28, 0, 30); return { local: localDateStamp(d), utc: d.toISOString().slice(0, 10) }; });
  ok(madridMidnight.local === '2026-09-28' && madridMidnight.utc === '2026-09-27', 'a las 00:30 usa la fecha local, no la UTC');
  const revoked = await page.evaluate(() => new Promise(res => {
    const orig = URL.revokeObjectURL; let called = false;
    URL.revokeObjectURL = u => { called = true; orig(u); };
    const origAlert = window.alert; window.alert = () => {};
    exportarDatos(); window.alert = origAlert;
    setTimeout(() => res(called), 200);
  }));
  ok(!revoked, 'el Blob URL no se revoca inmediatamente');
  const failMsg = await page.evaluate(() => {
    const orig = URL.createObjectURL; URL.createObjectURL = () => { throw new Error('boom'); };
    exportarDatos(); URL.createObjectURL = orig; return document.getElementById('datosMsg').textContent;
  });
  ok(failMsg.startsWith('No se ha podido exportar'), 'error de exportación gestionado con mensaje');

  // Reimportar el export
  await page.setInputFiles('#importDatosInput', file);
  await page.locator('#confirmOk').waitFor();
  await Promise.all([page.waitForEvent('load'), page.locator('#confirmOk').click()]);
  const re = await page.evaluate(() => ({ v: state.dataVersion, n: state.sepaEntries.length, e: state.exitos.length, k: state.kitAjuste }));
  ok(re.v === 3 && re.n === 4 && re.e === 1 && re.k === 'escuchar hasta el final', 'el archivo exportado se vuelve a importar sin pérdidas');
  const bad = await page.evaluate(() => validateImport({ exportFormat: 'otra-app', sepaEntries: [], checkpoints: [], visualAnchors: [], checkins: [], confidenceAnchors: [], resetHistory: [] }));
  ok(!!bad, 'rechaza archivos de otro formato: ' + bad);

  ok(errors.length === 0, 'sin errores de JS: ' + errors.join(' | '));
  await browser.close();
})();
