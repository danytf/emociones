const { chromium } = require('playwright');
const path = require('path'), fs = require('fs');
const URL = 'file:///' + path.resolve(__dirname, '..', 'index.html').replace(/\\/g, '/');
const ok = (c, m) => console.log((c ? 'PASS ' : 'FAIL ') + m);
const S = path.join(__dirname, 'out');
require('fs').mkdirSync(require('path').join(__dirname, 'out'), { recursive: true });
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } }); await page.addInitScript(()=>{try{localStorage.setItem('wesserWelcomeSeen','1')}catch(e){}});
  const errors = []; let nativeDialogs = 0;
  page.on('pageerror', e => errors.push(e.message));
  page.on('dialog', d => { nativeDialogs++; d.dismiss(); });
  await page.goto(URL);

  // Diario vacío: todos los errores a la vez, foco al primero
  await page.evaluate(() => goto('diario'));
  await page.locator('#sepaSaveBtn').click();
  const e1 = await page.evaluate(() => ({
    msgs: [...document.querySelectorAll('#view-diario .field-error')].map(p => p.textContent),
    focusId: document.activeElement.id, groupDesc: document.getElementById('sepaEmocionChips').getAttribute('aria-describedby'),
    invalid: document.getElementById('sepaPensConstructivo').getAttribute('aria-invalid'),
    desc: document.getElementById(document.getElementById('sepaPensConstructivo').getAttribute('aria-describedby')).textContent,
    saved: state.sepaEntries.length
  }));
  ok(e1.msgs.length === 5 && e1.saved === 0, 'Diario: se muestran los 5 errores a la vez (situación y pensamiento ya no vienen elegidos) y no se guarda: ' + e1.msgs.join(' | '));
  ok(e1.focusId === 'sepaSituacion' && !!e1.groupDesc, 'foco en el primer campo con error (situación) y grupo de emociones enlazado a su mensaje');
  ok(e1.invalid === 'true' && e1.desc.startsWith('Escribe un pensamiento útil'), 'aria-invalid + aria-describedby en el campo');
  await page.locator('#view-diario').screenshot({ path: S + '/err-sepa.png' });
  await page.selectOption('#sepaSituacion', 'Zona con poco flujo');
  await page.selectOption('#sepaPensDestructivo', 'No vale la pena');
  await page.locator('#sepaEmocionChips [data-id="ira"]').click();
  await page.locator('#sepaPensConstructivo').fill('algo');
  const e2 = await page.evaluate(() => ({ n: document.querySelectorAll('#view-diario .field-error').length, inv: document.getElementById('sepaPensConstructivo').hasAttribute('aria-invalid'), d: document.getElementById('sepaPensConstructivo').hasAttribute('aria-describedby') }));
  ok(e2.n === 1 && !e2.inv && !e2.d, 'cada error desaparece al corregir su campo');
  await page.locator('#sepaAccion').fill('pausa');
  await page.locator('#sepaSaveBtn').click();
  ok(await page.evaluate(() => state.sepaEntries.length === 1 && !document.querySelector('#view-diario .field-error')), 'con todo relleno se guarda (misma lógica que antes)');
  ok(await page.evaluate(() => document.getElementById('sepaSituacion').value === '' && document.getElementById('sepaPensDestructivo').value === ''), 'tras guardar, situación y pensamiento vuelven a «Elige…» (nada preseleccionado)');

  // Qué ha funcionado
  await page.evaluate(() => startExito());
  await page.locator('#toolBody button:has-text("Guardar")').click();
  ok((await page.locator('#toolBody .field-error').innerText()).includes('Elige o escribe qué ha funcionado'), 'Qué ha funcionado: error en línea bajo los chips');
  await page.locator('#toolBody [data-value="Otra"]').click();
  await page.locator('#toolBody button:has-text("Guardar")').click();
  ok(await page.evaluate(() => document.activeElement.id === 'exitoOtraInput' && document.querySelector('#toolBody .field-error').textContent === 'Indica qué ha funcionado antes de guardar.'), '«Otra» vacía: «Indica qué ha funcionado antes de guardar.» con foco en el campo');
  await page.evaluate(() => closeTool());

  // Reset: Continuar sin elegir nada
  const resetNext = () => page.locator('#resetBody .reset-actions .btn-amber').click();
  await page.evaluate(() => { openReset(); resetGoto(2); });
  await resetNext();
  ok(await page.evaluate(() => resetStep === 2 && examinaParte === 0 && document.querySelectorAll('#resetBody .field-error').length === 1 && !!document.activeElement.closest('#rc-contexto')), 'Examina (contexto): error en línea, foco en los chips y se queda en el paso');
  ok(await page.evaluate(() => { const e = document.querySelector('#resetBody .field-error').getBoundingClientRect(), bar = document.querySelector('#resetBody .reset-actions').getBoundingClientRect(); return e.bottom <= bar.top && e.top >= 0; }), 'el mensaje de error queda a la vista, por encima de la barra fija');
  ok(await page.evaluate(() => { const g = document.getElementById('rc-contexto').getBoundingClientRect(), e = document.querySelector('#resetBody .field-error').getBoundingClientRect(); return e.top >= g.bottom + 6; }), 'el contorno del grupo no pisa el mensaje');
  await page.evaluate(() => { resetGoto(1); });
  await resetNext();
  ok(await page.evaluate(() => resetStep === 1 && !!document.activeElement.closest('#rc-senal') && document.querySelector('#resetBody .field-error').textContent === 'Elige tu señal principal antes de continuar.'), 'Reconoce: error en línea con foco en los chips');
  await page.locator('#rc-senal [data-action="resetOtro"]').click();
  await resetNext();
  ok(await page.evaluate(() => resetStep === 1 && document.activeElement.id === 'rco-senal' && !!document.querySelector('#resetBody .field-error')), 'Reconoce con «Otra señal…» vacía: error con foco en el campo');
  await page.fill('#rco-senal', 'Me cuesta arrancar');
  await resetNext();
  ok(await page.evaluate(() => resetStep === 2 && resetSenal === 'Me cuesta arrancar'), 'Reconoce: la señal escrita en «Otra…» se guarda y se continúa');
  await page.evaluate(() => { resetMicro = null; resetGoto(4); });
  await resetNext();
  ok(await page.evaluate(() => resetStep === 4 && !document.querySelector('#resetBody .reset-actions .btn-amber').disabled && !!document.querySelector('#resetBody .field-error')), 'Elige: el botón no está deshabilitado y explica qué falta');
  await page.evaluate(() => { resetAprendizaje = ''; resetGoto(6); });
  await resetNext();
  ok(await page.evaluate(() => resetStep === 6 && document.querySelector('#resetBody .field-error').textContent === 'Elige una opción para continuar.'), '¿Qué he aprendido?: explica qué falta en lugar de un botón deshabilitado');
  await page.evaluate(() => startFreshReset());

  // Kit: límite de 3 señales
  await page.evaluate(() => { state.kitSenales = []; openKit(1); });
  for (let i = 0; i < 4; i++) await page.locator('#rc-kitSenales [data-action="resetChip"]').nth(i).click();
  ok(await page.evaluate(() => state.kitSenales.length === 3 && document.querySelector('#rc-kitSenales + .field-error').textContent.includes('hasta 3 señales')), 'Kit: la 4.ª señal muestra aviso en línea');
  await page.evaluate(() => startFreshReset());
  await page.evaluate(() => closeReset());

  // Pide feedback → guardado en Kit en línea
  await page.evaluate(() => { startPedirFeedback(); selectPedirFeedback('Mira mi ritmo'); finalizarPedirFeedback(); });
  await page.locator('[data-action="guardarPedirFeedbackEnKit"]').click();
  ok((await page.locator('#pedirKitMsg').innerText()).startsWith('Guardado en tu Kit'), 'Pide feedback: confirmación en línea');
  await page.evaluate(() => closeTool());

  // Confirmación de borrado
  await page.evaluate(() => goto('diario'));
  await page.locator('#sepaHistorial [data-action="borrarSepa"]').first().click();
  await page.locator('#confirmBox').screenshot({ path: S + '/confirm.png' });
  const role = await page.evaluate(() => ({ r: document.getElementById('confirmBox').getAttribute('role'), f: document.activeElement.id }));
  ok(role.r === 'alertdialog' && role.f === 'confirmCancel', 'borrado: alertdialog con foco en Cancelar');
  await page.mouse.click(10, 10);
  ok(await page.evaluate(() => state.sepaEntries.length === 1 && Overlays.top() === null), 'clic en el fondo = cancelar');

  // «Sugerir reencuadre» no borra lo que ha escrito el usuario
  const reenc = await page.evaluate(() => {
    goto('diario');
    const el = document.getElementById('sepaPensConstructivo');
    el.value = ''; sugerirReencuadre(); const sola = el.value;
    sugerirReencuadre(); const repetida = el.value;               // pulsar dos veces: sustituye, no duplica
    el.value = 'Mi propia idea'; sugerirReencuadre(); const conPropia = el.value;
    sugerirReencuadre(); const otraVez = el.value;
    el.value = '';
    return { sola, repetida, conPropia, otraVez };
  });
  ok(reenc.sola && reenc.repetida === reenc.sola && !reenc.sola.includes('zona difícil'), 'reencuadre: con el campo vacío se rellena; al repetir no se duplica; sin «zona difícil» genérica');
  ok(reenc.conPropia.startsWith('Mi propia idea') && reenc.conPropia.includes(reenc.sola) && reenc.otraVez === reenc.conPropia, 'reencuadre: conserva lo escrito y añade la sugerencia debajo, una sola vez');

  // Guardar confirma con un aviso (Diario y Checkpoint)
  const avisos = await page.evaluate(() => {
    goto('diario');
    selectedEmociones = ['ira']; syncEmocionChips();
    document.getElementById('sepaSituacion').value = 'Zona con poco flujo';
    document.getElementById('sepaPensConstructivo').value = 'Otra forma de verlo';
    document.getElementById('sepaAccion').value = 'Pausa consciente';
    guardarSepa();
    const diario = document.getElementById('toastMsg').textContent;
    // Checkpoint sin decisión: no se guarda, no se cierra y explica qué falta
    const nCp = state.checkpoints.length;
    openCheckpoint(); guardarCheckpoint();
    const sinDecision = { guardado: state.checkpoints.length !== nCp, abierto: Overlays.top() === 'tool',
      error: (document.querySelector('#cpDecisionRow + .field-error') || {}).textContent || '' };
    document.getElementById('cpFatiga').value = 6; document.getElementById('cpEmocional').value = 4; setCpDecision('Hago una pausa'); guardarCheckpoint();
    const cp = document.getElementById('toastMsg').textContent;
    return { diario, cp, sinDecision, conDecision: state.checkpoints.length === nCp + 1 };
  });
  ok(!avisos.sinDecision.guardado && avisos.sinDecision.abierto && avisos.sinDecision.error === 'Elige qué vas a hacer ahora.', 'Checkpoint sin decisión: no se guarda ni se cierra y muestra el error');
  ok(avisos.conDecision, 'Checkpoint con decisión: se guarda');
  ok(avisos.diario.startsWith('Registro guardado') && avisos.cp.startsWith('Checkpoint guardado'), `guardar confirma con aviso (${avisos.diario} | ${avisos.cp})`);

  // Error al guardar: aviso no modal, sin repetir
  await page.evaluate(() => { Storage.prototype.setItem = () => { throw new Error('QuotaExceeded'); }; save(); save(); });
  ok(await page.locator('#toast').evaluate(t => t.classList.contains('show') && t.classList.contains('error')), 'error de guardado como aviso no modal');
  await page.locator('#toast').screenshot({ path: S + '/toast.png' });
  // Si no se puede guardar, «¿Qué ha funcionado?» no muestra «Guardado» ni deja el registro en memoria
  const fallo = await page.evaluate(() => {
    const antes = state.exitos.length;
    startExito(); selectExitoConducta(EXITO_OPCIONES[0]); guardarExito();
    return { h3: document.querySelector('#toolBody h3')?.textContent || '', igual: state.exitos.length === antes };
  });
  ok(fallo.h3 !== 'Guardado' && fallo.igual, '«¿Qué ha funcionado?» no dice «Guardado» si el guardado falla');

  // Guardado transaccional: con el almacenamiento fallando, nada se confirma ni avanza
  const tx = await page.evaluate(() => {
    Overlays.close('tool'); hideToast();
    const r = {};
    // Diario: nuevo registro
    goto('diario');
    const nS = state.sepaEntries.length;
    selectedEmociones = ['miedo']; syncEmocionChips();
    document.getElementById('sepaPensConstructivo').value = 'Mi idea';
    document.getElementById('sepaAccion').value = 'Pausa consciente';
    guardarSepa();
    r.diarioNuevo = state.sepaEntries.length === nS && document.getElementById('sepaPensConstructivo').value === 'Mi idea'
      && selectedEmociones.includes('miedo') && !document.getElementById('toastMsg').textContent.startsWith('Registro');
    // Diario: edición
    const id = state.sepaEntries[0].id, original = state.sepaEntries[0].pensC;
    editarSepa(id);
    document.getElementById('sepaPensConstructivo').value = 'Cambio que no se guarda';
    guardarSepa();
    r.diarioEdicion = state.sepaEntries[0].pensC === original && editingSepaId === id && document.getElementById('sepaSaveBtn').textContent === 'Actualizar registro';
    cancelarEdicionSepa();
    // Checkpoint: nuevo y edición
    const nC = state.checkpoints.length;
    openCheckpoint(); document.getElementById('cpFatiga').value = 6; document.getElementById('cpEmocional').value = 4; document.getElementById('cpNota').value = 'Agua'; setCpDecision('Sigo igual'); guardarCheckpoint();
    r.cpNuevo = state.checkpoints.length === nC && Overlays.top() === 'tool' && document.getElementById('cpNota').value === 'Agua';
    Overlays.close('tool');
    const cid = state.checkpoints[0].id, notaOrig = state.checkpoints[0].nota;
    openCheckpoint(cid); document.getElementById('cpNota').value = 'Nueva nota'; guardarCheckpoint();
    r.cpEdicion = state.checkpoints[0].nota === notaOrig && editingCheckpointId === cid && Overlays.top() === 'tool';
    Overlays.close('tool');
    // Check-in: no avanza
    const nK = state.checkins.length;
    openReset(); startCheckin(); checkinState[0][0] = true; saveCheckin();
    r.checkin = state.checkins.length === nK && resetStep === 'checkin' && checkinState[0][0] === true;
    Overlays.close('reset');
    // Eliminar: se revierte (Diario, Checkpoint, Qué ha funcionado)
    const antes = [state.sepaEntries.length, state.checkpoints.length];
    return { r, antes };
  });
  ok(tx.r.diarioNuevo, 'fallo al guardar: el Diario conserva el formulario y no confirma');
  ok(tx.r.diarioEdicion, 'fallo al guardar: la edición del Diario conserva el original y sigue en edición');
  ok(tx.r.cpNuevo, 'fallo al guardar: el Checkpoint no se cierra y conserva los valores');
  ok(tx.r.cpEdicion, 'fallo al guardar: la edición del Checkpoint conserva el original');
  ok(tx.r.checkin, 'fallo al guardar: el Check-in no avanza y conserva lo marcado');
  // Eliminar con el almacenamiento fallando: se confirma el borrado y no desaparece nada
  await page.evaluate(() => goto('diario'));
  await page.locator('#sepaHistorial [data-action="borrarSepa"]').first().click();
  await page.locator('#confirmOk').click();
  await page.waitForTimeout(100);
  const del = await page.evaluate(n => ({ estado: state.sepaEntries.length === n, visibles: document.querySelectorAll('#sepaHistorial .history-item').length }), tx.antes[0]);
  ok(del.estado && del.visibles === Math.min(tx.antes[0], 10), 'fallo al guardar: eliminar se revierte y el registro sigue visible');
  // Importar con el almacenamiento fallando: sin aviso de éxito y con los datos anteriores
  const antesImport = await page.evaluate(() => state.sepaEntries.length);
  await page.evaluate(() => openHelp());
  await page.setInputFiles('#importDatosInput', { name: 'copia.json', mimeType: 'application/json',
    buffer: Buffer.from(JSON.stringify({ format: 'wesser-app-data', dataVersion: 3, sepaEntries: [], checkpoints: [], visualAnchors: [], checkins: [], confidenceAnchors: [], resetHistory: [] })) });
  await page.waitForTimeout(300);
  if (await page.evaluate(() => Overlays.top() === 'confirm')) await page.locator('#confirmOk').click();
  await page.waitForTimeout(300);
  const imp = await page.evaluate(() => ({ n: state.sepaEntries.length, aviso: (() => { try { return sessionStorage.getItem('wesserNotice'); } catch (e) { return 'x'; } })(), msg: document.getElementById('datosMsg').textContent }));
  ok(imp.n === antesImport && !imp.aviso && imp.msg.startsWith('No se han importado'), 'fallo al guardar: importar no muestra éxito y conserva los datos anteriores');

  ok(nativeDialogs === 0, 'ningún alert()/confirm() nativo en todo el recorrido');
  ok(errors.length === 0, 'sin errores de JS: ' + errors.join(' | '));
  await browser.close();
})();
