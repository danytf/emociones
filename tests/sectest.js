const { chromium } = require('playwright');
const path = require('path'), fs = require('fs');
const URL = 'file:///' + path.resolve(__dirname, '..', 'index.html').replace(/\\/g, '/');

const X = n => `<img src=x onerror="window.pwned=(window.pwned||[]).concat('${n}')">`;
const Q = n => `x');window.pwned=(window.pwned||[]).concat('${n}');('`;
const v1 = {
  dataVersion: 1, theme: 'dark" onload="x',
  sepaEntries: [
    { id: '1);window.pwned=["sepaId"];(1', fecha: X('sepaFecha'), situacion: X('sit'), emocion: 'miedo', pensD: X('pd'), pensC: X('pc'), accion: X('acc') },
    { id: 1700000000000, fecha: 'hoy', situacion: 'Zona con poco flujo', emociones: ['ira', X('emo')], pensD: 'No vale la pena', pensC: 'ok', accion: 'Pedir apoyo', extra: 'desconocido' }
  ],
  checkpoints: [{ id: 5, fecha: 'f', fatiga: X('fat'), emocional: '7', nota: X('nota'), decision: X('dec') }],
  visualAnchors: [X('va'), 42, null],
  checkins: [{ id: 9, fecha: X('cf'), total: X('ct'), items: [X('ci'), '<b>El "no" me afecta más de lo habitual</b><br>Cada rechazo me pesa, me irrita o me desanima más de lo normal.'] }],
  anchorWord: X('aw'), anchorMemory: X('am'),
  kitSenales: ['El "no" me afecta más de lo habitual', Q('kit')], kitHerramienta: 'constructor', kitAjuste: X('ka'), kitPersona: X('kp'), kitPedira: X('kpe'),
  resetProgress: { step: 5, stops: X('stops'), micro: X('micro'), senal: 'Pienso que "ya debería saber hacerlo"' },
  resetHistory: [{ id: 77, fecha: X('rf'), senal: 'El "no" me afecta más de lo habitual', micro: Q('micro2'), stops: X('rs'), pacto: X('rp') }],
  exitos: [{ id: 3, fecha: 'f', conducta: X('ec'), repetir: X('er') }],
  __proto__polluted: true
};

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage(); await page.addInitScript(()=>{try{localStorage.setItem('wesserWelcomeSeen','1')}catch(e){}});
  const dialogs = [];
  page.on('dialog', d => { dialogs.push(d.message()); d.accept(); });
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.addInitScript(data => {
    if (!sessionStorage.getItem('seeded')) { localStorage.setItem('wesserAppState', JSON.stringify(data)); sessionStorage.setItem('seeded', '1'); }
  }, v1);
  await page.goto(URL);
  if(errors.length){ console.log('LOAD ERRORS', errors); }
  const ok = (c, m) => console.log((c ? 'PASS ' : 'FAIL ') + m);

  const st = await page.evaluate(() => state);
  ok(st.dataVersion === 3, 'migra a dataVersion 3');
  ok(st.theme === null, 'tema inválido descartado');
  ok(st.kitSenales[0] === 'El «no» me afecta más de lo habitual', 'migración de comillas en kitSenales');
  ok(st.confidenceAnchors.length === 1, 'anclaje antiguo migrado a lista');
  ok(JSON.stringify(st.sepaEntries[0].emociones) === '["miedo"]', 'emocion → emociones');
  ok(JSON.stringify(st.sepaEntries[1].emociones) === '["ira"]', 'emociones desconocidas descartadas');
  ok(Number.isSafeInteger(st.sepaEntries[0].id), 'id no numérico reemplazado: ' + st.sepaEntries[0].id);
  ok(!('extra' in st.sepaEntries[1]) && !('anchorWord' in st), 'campos desconocidos descartados');
  ok(st.checkpoints[0].fatiga === 5 && st.checkpoints[0].emocional === 7, 'fatiga/emocional a enteros');
  ok(st.visualAnchors.length === 2 && st.visualAnchors[1] === '42', 'visualAnchors saneados');
  ok(st.checkins[0].total === 2, 'total de check-in recalculado');
  ok(st.resetProgress.stops === 0 && st.resetProgress.step === 5, 'resetProgress saneado');
  ok(st.resetHistory[0].senal === 'El «no» me afecta más de lo habitual', 'migración de comillas en historial');

  // Renderizar todas las vistas con datos hostiles
  await page.evaluate(() => { goto('diario'); goto('herramientas'); });
  await page.evaluate(() => openReset());           // pantalla "Reset a medias"
  await page.click('#resetBody button.btn-amber');                // reanuda en paso 5 (micro hostil)
  await page.evaluate(() => { openCheckinHistorial(); });
  await page.evaluate(() => { openKit(); });
  await page.evaluate(() => { openAnchor(); runAnchorGuide(0); closeTool(); openVisualAnchor(); closeModal(); usarRecordatorioVisual(0); closeTool(); });
  await page.evaluate(() => { activarKitPlan(); });
  await page.waitForTimeout(300);
  ok(!(await page.evaluate(() => window.pwned)), 'ningún payload se ha ejecutado: ' + JSON.stringify(await page.evaluate(() => window.pwned)));
  ok(await page.evaluate(() => !document.querySelector('img[src="x"]')), 'ningún <img> inyectado en el DOM');

  // Check-in: etiqueta antigua como texto plano, sin HTML
  await page.evaluate(() => { closeModal(); openCheckinHistorial(); });
  const ciText = await page.locator('#resetBody li').first().innerHTML();
  ok(!ciText.includes('<img'), 'item de check-in no válido se muestra como texto: ' + ciText.slice(0, 60));

  // Acciones delegadas
  await page.evaluate(() => { closeReset(); goto('diario'); });
  const before = await page.evaluate(() => state.sepaEntries.length);
  await page.locator('#sepaHistorial [data-action="borrarSepa"]').first().click();
  ok(await page.locator('#confirmTitle').innerText() === '¿Eliminar este registro del Diario?', 'borrar pide confirmación accesible');
  await page.locator('#confirmOk').click();
  ok(await page.evaluate(() => state.sepaEntries.length) === before - 1, 'borrar registro del diario por data-action');
  await page.locator('#sepaHistorial [data-action="editarSepa"]').first().click();
  ok(await page.evaluate(() => editingSepaId) === st.sepaEntries[1].id, 'editar registro del diario por data-action');
  await page.evaluate(() => cancelarEdicionSepa());

  const selBefore = await page.evaluate(() => JSON.stringify(selectedEmociones));
  await page.locator('#sepaEmocionChips [data-action="showEmotion"]').first().click();
  ok(await page.evaluate(sb => document.getElementById('modalBack').classList.contains('active') && JSON.stringify(selectedEmociones) === sb, selBefore), 'ℹ️ abre la ficha sin cambiar la selección');
  await page.evaluate(() => closeModal());
  await page.evaluate(() => document.querySelectorAll('#wheelGrid [data-action="showEmotion"]')[2].click());
  ok(await page.locator('#modalSheet h2').innerText() === '😨 Miedo', 'rueda de emociones abre la ficha');
  await page.evaluate(() => closeModal());

  // Otra… muestra el campo libre
  await page.selectOption('#sepaSituacion', 'Otra');
  ok(await page.isVisible('#sepaSituacionOtra'), 'situación «Otra…» muestra el campo libre');
  await page.selectOption('#sepaPensDestructivo', 'Otro');
  ok(await page.isVisible('#sepaPensDestructivoLibre'), 'pensamiento «Otro…» muestra el campo libre');

  // Kit: toggle de una señal con «»
  await page.evaluate(() => { state.kitSenales = []; openKit(); Overlays.open('reset'); });
  await page.locator('#kitSenalChips [data-action="toggleKitSenal"]').nth(1).click();
  ok(JSON.stringify(await page.evaluate(() => state.kitSenales)) === '["El «no» me afecta más de lo habitual"]', 'chip de señal del Kit con «no» funciona');

  // Repetir ajuste desde el historial
  await page.evaluate(() => openCheckinHistorial());
  await page.evaluate(() => document.querySelector('#resetBody [data-action="repetirAjuste"]').click());
  console.log('   estado:', JSON.stringify(await page.evaluate(() => ({resetStep, resetMicro, resetSenal}))));
  ok(await page.evaluate(() => resetStep === 5 && resetMicro.startsWith("x');")), 'repetir ajuste por id (micro hostil tratado como texto)');
  ok(!(await page.evaluate(() => window.pwned)), 'repetir ajuste no ejecuta código');
  await page.locator('#resetBody [data-action]').first().count();
  await page.evaluate(() => closeReset());

  // Pide feedback con comillas y barras
  await page.evaluate(() => { startPedirFeedback(); selectPedirFeedback('Otro'); document.getElementById('pedirFeedbackOtroInput').value = `a'b"c\\d</p><img src=x onerror=window.pwned=1>`; finalizarPedirFeedback(); });
  await page.locator('[data-action="guardarPedirFeedbackEnKit"]').click();
  ok(await page.evaluate(() => state.kitPedira) === `a'b"c\\d</p><img src=x onerror=window.pwned=1>`, 'petición con comillas guardada literalmente en el Kit');

  // No sé qué necesito + Repetir de herramienta
  await page.evaluate(() => startNoSeQueNecesito());
  await page.locator('[data-action="nsqnAnswer"][data-value="acelerado"][data-answer="1"]').click();
  await page.locator('[data-action="nsqnGo"]').first().click();
  ok(await page.locator('#toolTitle').innerText() === 'Suspiro fisiológico', 'No sé qué necesito lanza la herramienta');
  await page.evaluate(() => showToolDone('Grounding 5‑4‑3‑2‑1', startGrounding));
  await page.locator('[data-action="toolRepeat"]').click();
  ok(await page.locator('#toolTitle').innerText() === 'Grounding 5‑4‑3‑2‑1', 'botón Repetir usa la función guardada');
  await page.evaluate(() => closeTool());

  // Checkpoint: guarda enteros
  await page.evaluate(() => { openCheckpoint(); guardarCheckpoint(); });
  ok(await page.evaluate(() => typeof state.checkpoints[0].fatiga) === 'number', 'checkpoint guarda números');
  await page.evaluate(() => document.querySelector('#checkpointHistorial [data-action="editarCheckpoint"]').click());
  ok(await page.evaluate(() => document.getElementById('toolOverlay').classList.contains('active')), 'editar checkpoint por data-action');
  await page.evaluate(() => closeTool());

  // Check-in: marcar con clic en fila y en checkbox
  await page.evaluate(() => { startCheckin(); Overlays.open('reset'); });
  await page.locator('.check-item').nth(0).click();
  await page.locator('.check-item input').nth(1).click();
  ok(JSON.stringify(await page.evaluate(() => checkinState[0].slice(0, 2))) === '[true,true]', 'check-in: fila y casilla marcan la señal');
  await page.evaluate(() => closeReset());

  // validateImport
  const vi = await page.evaluate(() => {
    const base = { sepaEntries: [], checkpoints: [], visualAnchors: [], checkins: [], confidenceAnchors: [], resetHistory: [] };
    return {
      ok1: validateImport({ ...base, dataVersion: 1 }),
      okMissingVer: validateImport(base),
      arr: validateImport([]),
      future: validateImport({ ...base, dataVersion: 99 }),
      weirdVer: validateImport({ ...base, dataVersion: 'x' }),
      missing: validateImport({ dataVersion: 2 }),
      badRec: validateImport({ ...base, sepaEntries: [1] }),
      badVA: validateImport({ ...base, visualAnchors: [{}] }),
      huge: validateImport({ ...base, exitos: new Array(6000).fill({}) }),
      badKit: validateImport({ ...base, kitPersona: {} })
    };
  });
  ok(vi.ok1 === null && vi.okMissingVer === null, 'import válido aceptado (v1 y sin versión)');
  ok(vi.arr && vi.future && vi.weirdVer && vi.missing && vi.badRec && vi.badVA && vi.huge && vi.badKit, 'imports inválidos rechazados: ' + JSON.stringify(vi));

  ok(errors.length === 0, 'sin errores de JS: ' + errors.join(' | '));
  console.log('dialogs:', dialogs);
  await browser.close();
})();
