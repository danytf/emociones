/* Batería completa del punto 29: navegación, Diario, Checkpoint, Qué ha funcionado,
   herramientas, Reset completo, Kit, datos y prueba de seguridad XSS. */
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs');
const URL = 'file:///' + path.resolve(__dirname, '..', 'index.html').replace(/\\/g, '/');
const D = path.join(__dirname, 'out');
let pass = 0, fail = 0;
const ok = (c, m) => { c ? pass++ : fail++; console.log((c ? 'PASS ' : 'FAIL ') + m); };
const section = t => console.log('\n== ' + t + ' ==');

require('fs').mkdirSync(require('path').join(__dirname, 'out'), { recursive: true });
(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ acceptDownloads: true, viewport: { width: 820, height: 1180 } });
  const page = await ctx.newPage(); await page.addInitScript(()=>{try{localStorage.setItem('wesserWelcomeSeen','1')}catch(e){}});
  const errors = [], dialogs = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('dialog', d => { dialogs.push(d.message()); d.dismiss(); });
  await page.goto(URL);
  await page.evaluate(() => { localStorage.clear(); });
  await page.reload();
  const st = () => page.evaluate(() => state);
  const top = () => page.evaluate(() => Overlays.top());
  const confirmOk = async () => { await page.locator('#confirmOk').waitFor(); await page.locator('#confirmOk').click(); };
  const hidden = async (fn) => page.evaluate(fn);  // para elementos en pestañas no visibles

  // ================= NAVEGACIÓN =================
  section('Navegación');
  for (const v of ['aprender', 'bienestar', 'herramientas', 'diario']) {
    await page.locator(`#headerTabs button[data-view="${v}"]`).click();
    ok(await page.evaluate(v => document.getElementById('view-' + v).classList.contains('active') && document.querySelector(`#headerTabs [data-view="${v}"]`).getAttribute('aria-current') === 'page', v), `pestaña ${v}`);
  }
  await page.locator('#tabReset').click();
  ok(await top() === 'reset', 'pestaña Reset abre el Modo Reset');
  await page.keyboard.press('Escape');
  await page.locator('button[aria-label="Abrir ayuda"]').click();
  ok(await top() === 'help', 'Ayuda');
  await page.locator('#helpOverlay button[aria-label="Cerrar ayuda"]').click();
  const t0 = await page.evaluate(() => document.documentElement.dataset.theme);
  await page.locator('#themeToggle').click();
  const t1 = await page.evaluate(() => document.documentElement.dataset.theme);
  await page.reload();
  ok(t0 !== t1 && await page.evaluate(() => document.documentElement.dataset.theme) === t1, `tema ${t0} → ${t1} y se conserva al recargar`);
  await page.locator('#themeToggle').click();

  // ================= DIARIO =================
  section('Diario');
  await page.locator('#headerTabs [data-view="diario"]').click();
  await page.selectOption('#sepaSituacion', 'Presión por el objetivo');
  await page.locator('#sepaEmocionChips [data-id="miedo"]').click();
  await page.locator('#sepaEmocionChips [data-id="ira"]').click();
  await page.locator('#sepaEmocionChips [data-value="tristeza"]').click();
  ok(await top() === 'modal' && (await st()).sepaEntries.length === 0 && JSON.stringify(await page.evaluate(() => selectedEmociones)) === '["miedo","ira"]', 'ℹ️ abre la ficha sin tocar la selección (2 emociones marcadas)');
  await page.keyboard.press('Escape');
  await page.selectOption('#sepaPensDestructivo', '¿Y si me voy a 0?');
  await page.locator('button:has-text("Sugerir reencuadre")').click();
  ok((await page.inputValue('#sepaPensConstructivo')).startsWith('Sentir presión por el objetivo es normal'), 'Sugerir reencuadre');
  await page.locator('button.chip:has-text("Pausa consciente")').click();
  await page.locator('#sepaSaveBtn').click();
  let s = await st();
  ok(s.sepaEntries.length === 1 && s.sepaEntries[0].emociones.join() === 'miedo,ira' && s.sepaEntries[0].accion === 'Pausa consciente', 'crear registro con varias emociones');
  await page.selectOption('#sepaSituacion', 'Otra');
  await page.fill('#sepaSituacionOtra', 'Me han pedido el DNI dos veces');
  await page.locator('#sepaEmocionChips [data-id="sorpresa"]').click();
  await page.selectOption('#sepaPensDestructivo', 'Otro');
  await page.fill('#sepaPensDestructivoLibre', 'Esto no es para mí');
  await page.fill('#sepaPensConstructivo', 'Es una situación puntual');
  await page.fill('#sepaAccion', 'Sigo con la siguiente parada');
  await page.locator('#sepaSaveBtn').click();
  s = await st();
  ok(s.sepaEntries[0].situacion === 'Me han pedido el DNI dos veces' && s.sepaEntries[0].pensD === 'Esto no es para mí', '«Otra» y «Otro» guardan el texto libre');
  await page.locator('#sepaHistorial [data-action="editarSepa"]').first().click();
  ok(await page.inputValue('#sepaSituacionOtra') === 'Me han pedido el DNI dos veces' && await page.inputValue('#sepaPensDestructivoLibre') === 'Esto no es para mí', 'editar carga «Otra»/«Otro» en sus campos');
  await page.fill('#sepaAccion', 'Acción corregida');
  await page.locator('#sepaSaveBtn').click();
  s = await st();
  ok(s.sepaEntries.length === 2 && s.sepaEntries[0].accion === 'Acción corregida' && s.sepaEntries[0].updatedAt >= s.sepaEntries[0].createdAt, 'editar actualiza el registro');
  await page.locator('#sepaHistorial [data-action="borrarSepa"]').first().click();
  await confirmOk();
  ok((await st()).sepaEntries.length === 1, 'eliminar registro');
  await page.evaluate(() => { state.sepaEntries.push({ ...newRecord({ situacion: 'Lluvia / mal tiempo', emociones: ['tristeza'], pensD: 'a', pensC: 'b', accion: 'c' }), createdAt: new Date(Date.now() - 12 * 86400000).toISOString() }); save(); setPatronesRango(7); });
  const p7 = await page.locator('#patronesBody .patron-count').first().innerText();
  await page.locator('#patronesBtn30').click();
  const p30 = await page.locator('#patronesBody .patron-count').first().innerText();
  ok(p7.startsWith('1 registro') && p30.startsWith('2 registros'), `patrones 7/30 días (${p7} | ${p30})`);
  // Empate en el primer puesto: se muestran todos, no uno elegido al azar
  const empate = await page.evaluate(() => topText(topEntry({ ira: 2, miedo: 2, asco: 1 }), true));
  ok(empate === 'ira · miedo (2 cada una)' && !(await page.locator('#patronesBody').innerText()).includes('Mis patrones'), `patrones: empates completos y sin etiqueta «Mis patrones» (${empate})`);

  // ================= CHECKPOINT =================
  section('Checkpoint');
  await page.locator('#headerTabs [data-view="herramientas"]').click();
  await page.locator('#view-herramientas .trow:has-text("Checkpoint de mitad de turno")').click();
  await page.locator('#cpFatiga').fill('8');
  await page.fill('#cpNota', 'Bajar ritmo');
  await page.locator('#cpDecisionRow button:has-text("Hago una pausa")').click();
  ok(await page.locator('#cpDecisionRow [aria-pressed="true"]').innerText().then(t => t.includes('Hago una pausa')), 'decisión marcada');
  await page.locator('#toolBody button:has-text("Guardar checkpoint")').click();
  s = await st();
  ok(s.checkpoints.length === 1 && s.checkpoints[0].fatiga === 8 && s.checkpoints[0].decision === 'Hago una pausa', 'guardar checkpoint');
  ok((await page.locator('#checkpointHistorial').innerText()).includes('Fatiga: 8/10'), 'historial de checkpoints');
  await page.locator('#checkpointHistorial [data-action="editarCheckpoint"]').click();
  await page.locator('#cpDecisionRow button:has-text("Ajusto la estrategia")').click();
  await page.locator('#toolBody button:has-text("Actualizar checkpoint")').click();
  ok((await st()).checkpoints[0].decision === 'Ajusto la estrategia' && (await st()).checkpoints.length === 1, 'editar checkpoint');
  await page.locator('#checkpointHistorial [data-action="borrarCheckpoint"]').click();
  await confirmOk();
  ok((await st()).checkpoints.length === 0, 'eliminar checkpoint');

  // ================= QUÉ HA FUNCIONADO =================
  section('Qué ha funcionado');
  await page.locator('#view-herramientas .trow:has-text("¿Qué ha funcionado?")').click();
  await page.locator('#toolBody [data-value="He adaptado mi entrada"]').click();
  await page.fill('#exitoRepetirInput', 'Adaptar la entrada');
  await page.locator('#toolBody button:has-text("Guardar")').click();
  ok((await st()).exitos[0]?.conducta === 'He adaptado mi entrada', 'opción guardada');
  await page.locator('#toolBody button:has-text("Repetir")').click();
  ok(await page.locator('#toolBody [data-action="selectExitoConducta"]').count() === 4, '«Repetir» vuelve al formulario');
  await page.locator('#toolBody [data-value="Otra"]').click();
  await page.fill('#exitoOtraInput', 'Sonreír antes del saludo');
  await page.locator('#toolBody button:has-text("Guardar")').click();
  ok((await st()).exitos[0].conducta === 'Sonreír antes del saludo', '«Otra» guarda el texto');
  await page.keyboard.press('Escape');
  await page.locator('#headerTabs [data-view="diario"]').click();
  ok((await page.locator('#patronesBody').innerText()).includes('Conducta más repetida'), 'aparece en patrones');
  await page.locator('#headerTabs [data-view="herramientas"]').click();
  await page.locator('#exitoHistorial [data-action="borrarExito"]').first().click();
  await confirmOk();
  ok((await st()).exitos.length === 1, 'eliminar registro de Qué ha funcionado');

  // ================= HERRAMIENTAS: entrada y salida =================
  section('Herramientas');
  const toolButtons = await page.locator('#view-herramientas .trow').count();
  let opened = 0;
  for (let i = 0; i < toolButtons; i++) {
    await page.locator('#headerTabs [data-view="herramientas"]').click();
    await page.locator('#view-herramientas .trow').nth(i).click();
    const t = await top();
    if (t === 'tool' || t === 'modal') {
      opened++;
      await page.keyboard.press('Escape');
      if (await top() === 'confirm') await confirmOk();
    } else if (t === 'reset' && await page.evaluate(() => resetStep === 'kit' && document.getElementById('resetTitle').textContent === 'Kit de Emergencia')) {
      opened++;   // el Kit se abre en su propia ventana, con cabecera «Kit de Emergencia»
    }
    if (await top() !== null) await page.evaluate(() => { Overlays.close('modal'); Overlays.close('tool'); Overlays.close('reset'); });
  }
  ok(opened === toolButtons && await page.evaluate(() => toolTimers.length === 0), `las ${toolButtons} herramientas abren y cierran (temporizadores parados)`);
  const qlCount = await page.evaluate(() => { toggleQlMore(); return document.querySelectorAll('#quickLauncher .ql-row .ql-btn').length; });
  let qlOpened = 0;
  for (let i = 0; i < qlCount; i++) {
    const b = page.locator('#quickLauncher .ql-row .ql-btn').nth(i);
    if (!(await b.isVisible())) continue;
    await b.click();
    if (await top()) { qlOpened++; await page.keyboard.press('Escape'); if (await top() === 'confirm') await confirmOk(); }
    await page.evaluate(() => { ['confirm', 'modal', 'tool', 'reset', 'help'].forEach(n => Overlays.close(n)); });
  }
  ok(qlOpened >= 10, `accesos rápidos (momentos del turno + ahora mismo): ${qlOpened} abren su herramienta y se cierran`);
  await page.evaluate(() => toggleQlMore());

  // ================= RESET COMPLETO =================
  section('Reset');
  const resetNext = () => page.locator('#resetBody .reset-actions .btn-amber').click();
  await page.locator('#tabReset').click();
  ok(await page.locator('#resetBody .reset-hero button:has-text("Empezar el Reset")').isVisible(), 'la entrada del Reset tiene botón visible para empezar');
  await page.locator('#resetBody button:has-text("Revisar antes mis señales")').click();
  await page.locator('.check-item').nth(0).click();
  await resetNext(); await resetNext();
  await page.locator('.check-item').nth(2).click();
  await resetNext();
  await page.locator('#resetBody button:has-text("Guardar y continuar")').click();
  ok((await st()).checkins.length === 1 && (await st()).checkins[0].total === 2 && await page.evaluate(() => resetStep) === 1, 'check-in por bloques guardado y paso a R');
  ok(await page.locator('#resetBody .breath-circle').count() === 0, 'R sin respiración automática');
  await page.locator('#rc-senal [data-action="resetChip"]').nth(1).click();
  await resetNext();
  await page.locator('#rc-contexto [data-value="Flujo de gente"]').click();
  await resetNext();
  ok(await page.evaluate(() => resetStep === 2 && examinaParte === 1 && document.querySelector('#resetBody h3').textContent === 'Examina tu forma de trabajar'), 'Examina en dos pantallas: contexto y después forma de trabajar');
  await page.locator('#rc-forma [data-action="resetOtro"]').click();
  await page.fill('#rco-forma', 'Paro menos');
  await resetNext();
  await page.locator('#rc-funciona [data-action="resetChip"]').nth(0).click();
  await page.locator('#rc-funciona [data-action="resetChip"]').nth(1).click();
  await page.locator('#rc-funciona [data-action="resetChip"]').nth(2).click();
  await resetNext();
  const sug = await page.evaluate(() => ({ senal: resetSenal, sug: RESET_CAMPOS.micro.sugeridos(), visibles: [...document.querySelectorAll('#rc-micro > .reset-sug-title + .chip-group [data-action="resetChip"]')].map(b => b.dataset.value), todosAbierto: document.querySelector('#rc-micro details.reset-todos').open }));
  ok(sug.sug.length >= 3 && sug.sug.length <= 4 && sug.visibles.join() === sug.sug.join() && !sug.todosAbierto, `Elige: ${sug.sug.length} ajustes sugeridos para «${sug.senal}» y el resto plegado`);
  await page.locator('#rc-micro details.reset-todos > summary').click();
  await page.locator('#rc-micro details.reset-todos [data-value="Simplificar la apertura"]').click();
  await resetNext();
  ok(await page.evaluate(() => resetStep) === 5, 'R → E → S → E completados con toques');
  ok(await page.evaluate(() => resetExamResultado === 'Flujo de gente' && resetExamRendimiento === 'Paro menos' && resetAspecto1 === 'Mantengo la sonrisa en el saludo' && resetAspecto2 === 'Sigo escuchando antes de responder'), 'las respuestas rápidas se guardan en los campos de siempre (y como máximo 2 conductas)');
  for (let i = 0; i < 3; i++) await page.locator('#incrementStopBtn').click();
  await page.locator('#decrementStopBtn').click();
  ok(await page.evaluate(() => resetStops) === 2, 'contador +3 y deshacer → 2');
  ok(await page.locator('#resetBody button:text-is("Ver lo aprendido")').isDisabled() && await page.locator('#resetBody .btn-amber:text-is("Ver lo aprendido")').count() === 0, 'no se puede continuar antes de 10 (y el botón no compite en ámbar con +1)');
  // Cerrar a medias y reanudar
  await page.locator('#resetBody button:has-text("Cerrar y seguir luego")').click();
  await page.reload();
  ok(await page.locator('#tabReset').evaluate(b => b.classList.contains('pending')), 'aviso de Reset a medias tras recargar');
  await page.locator('#tabReset').click();
  const reanudar = await page.locator('#resetBody').innerText();
  ok(reanudar.includes('Tu test está a medias') && reanudar.includes('Simplificar la apertura') && reanudar.includes('2 de 10'), 'al volver, la tarjeta muestra el ajuste y las paradas que llevas');
  await page.locator('#resetBody button:text-is("Seguir con mis paradas")').click();
  ok(await page.evaluate(() => resetStep === 5 && resetStops === 2 && resetMicro === 'Simplificar la apertura'), 'reanudar donde se dejó');
  await page.evaluate(() => { closeReset(); goto('herramientas'); });
  ok((await page.locator('#qlRow .ql-reset').innerText()).includes('Seguir mi test · 2/10'), 'el lanzador muestra «Seguir mi test · 2/10»');
  await page.locator('#qlRow .ql-reset').click();
  ok(await page.evaluate(() => resetStep === 5 && resetStops === 2), '«Seguir mi test» lleva directo al contador');
  for (let i = 0; i < 8; i++) await page.locator('#incrementStopBtn').click();
  ok(await page.evaluate(() => !!document.querySelector('#resetBody .reset-completo') && !document.getElementById('incrementStopBtn') && document.activeElement.id === 'resetCompletoTitulo'), '10/10: bloque «Test completado», sin contadores y con el foco en su título');
  await page.locator('#resetBody button:text-is("Ver lo aprendido")').click();
  await page.locator('#resetBody [data-value="Lo mantengo"]').click();
  ok(await page.evaluate(() => { const b = document.querySelector('#resetBody [data-value="Lo mantengo"]'); return b.classList.contains('is-sel') && !b.classList.contains('btn-amber'); }), 'la opción elegida se marca con el tinte del Reset, no como botón de acción');
  await page.fill('#resetObservacionInput', 'Más conversaciones largas');
  await page.locator('#resetBody button:text-is("Ver mi resumen")').click();
  const cierre = await page.locator('#resetBody').innerText();
  ok(cierre.includes('Vuelve a calle con esto') && cierre.includes('Simplificar la apertura') && cierre.includes('Mi próximo paso'), 'aprendizaje → cierre con el ajuste elegido y «Mi próximo paso»');
  ok(await page.evaluate(() => !document.querySelector('#resetBody .reset-paso').open), '«Mi próximo paso» empieza plegado');
  await page.locator('#resetBody .reset-paso > summary').click();
  await page.locator('#rc-paso [data-action="resetOtro"]').click();
  await page.fill('#rco-paso', 'Volver a lo básico');
  await page.locator('#resetBody button:has-text("Vuelvo a calle")').click();
  s = await st();
  ok(s.resetHistory.length === 1 && s.resetHistory[0].stops === 10 && s.resetHistory[0].pacto === 'Volver a lo básico' && s.resetProgress === null && await top() === null, 'finalizar guarda la sesión y limpia el progreso');
  await page.locator('#tabReset').click();
  await page.locator('#resetBody button:has-text("Historial")').click();
  ok((await page.locator('#resetBody').evaluate(e => e.textContent)).includes('Volver a lo básico'), 'historial muestra la sesión');
  await page.evaluate(() => document.querySelector('#resetBody [data-action="repetirAjuste"]').click());
  ok(await page.evaluate(() => resetStep === 5 && resetStops === 0 && resetMicro === 'Simplificar la apertura'), 'repetir ajuste va a Testea desde 0');
  // Vistazo a la entrada sin tocar el Reset a medias que usa la prueba siguiente
  await page.evaluate(() => { resetStep = 0; renderResetStep(); });
  ok((await page.locator('#resetBody .reset-repetir').innerText()).includes('Simplificar la apertura'), 'la entrada del Reset ofrece «Repetir mi último ajuste» con el ajuste a la vista');
  await page.evaluate(() => { resetStep = 5; renderResetStep(); });
  await page.keyboard.press('Escape');
  await page.locator('#tabReset').click();
  await page.locator('#resetBody button:has-text("Empezar de nuevo")').click();
  ok(await top() === 'confirm' && await page.evaluate(() => state.resetProgress !== null), '«Empezar de nuevo» pide confirmación antes de borrar');
  await confirmOk();
  ok(await page.evaluate(() => resetStep === 0 && state.resetProgress === null), 'empezar de nuevo descarta el progreso');
  await page.keyboard.press('Escape');

  // ================= KIT =================
  section('Kit');
  await page.locator('#tabReset').click();
  await page.locator('#resetBody button:has-text("Mi Kit de Emergencia")').click();
  // Sin plan, el Kit empieza por el paso 1 (señales)
  ok(await page.evaluate(() => kitPaso) === 1, 'sin plan, el Kit empieza en el paso 1');
  for (let i = 0; i < 4; i++) await page.locator('#rc-kitSenales [data-action="resetChip"]').nth(i).click();
  ok((await st()).kitSenales.length === 3 && await page.locator('#rc-kitSenales + .field-error').count() === 1, 'máximo 3 señales con aviso');
  const KIT_NEXT = '#resetBody .reset-actions .btn-amber';
  await page.click(KIT_NEXT);
  await page.click(KIT_NEXT);   // sin herramienta: no avanza y lo dice
  ok(await page.evaluate(() => kitPaso) === 2 && await page.locator('#resetBody .field-error').count() === 1, 'la herramienta es obligatoria y se avisa en línea');
  await page.locator('#rc-kitHerramienta [data-action="resetOtro"]').click();
  await page.fill('#rco-kitHerramienta', 'Salir a respirar al parque');
  await page.click(KIT_NEXT);
  await page.evaluate(() => { const d = document.querySelector('#rc-kitAjuste details.reset-todos'); if(d) d.open = true; });
  await page.locator('#rc-kitAjuste [data-action="resetChip"][data-value="Simplificar la apertura"]').click();
  await page.click(KIT_NEXT);
  await page.fill('#kitPersonaInput', 'Laura');
  await page.fill('#kitPediraInput', 'Que me observe dos paradas');
  await page.locator('#resetBody button:has-text("Guardar mi plan")').click();
  ok(await page.evaluate(() => resetStep === 'kit' && kitPaso === 0 && document.getElementById('resetTitle').textContent === 'Kit de Emergencia' && document.getElementById('toastMsg').textContent.startsWith('Plan guardado')), 'guardar el plan vuelve a la vista del Kit y lo confirma');
  await page.reload();
  s = await st();
  ok(s.kitHerramienta === 'Salir a respirar al parque' && s.kitAjuste === 'Simplificar la apertura' && s.kitPersona === 'Laura' && s.kitPedira === 'Que me observe dos paradas' && s.kitSenales.length === 3, 'plan persistido tras recargar');
  // Tras recargar se abre la última sección usada; «Activar mi plan» está a mano en cualquiera de ellas
  const ultima = await page.evaluate(() => localStorage.getItem('wesserLastView'));
  ok(!ultima || ultima === 'aprender' || await page.evaluate(v => document.getElementById('view-' + v).classList.contains('active'), ultima), `al recargar se abre la última sección usada (${ultima || 'aprender'})`);
  await page.locator('#quickLauncher .ql-kit:visible').first().click();
  ok(await top() === 'modal' && (await page.locator('#modalSheet').innerText()).includes('Este es tu recurso personal'), 'activar con recurso personal lo muestra');
  await page.keyboard.press('Escape');
  await page.evaluate(() => { openReset(); openKit(2); });
  await page.locator('#rc-kitHerramienta [data-action="resetChip"][data-value="Grounding 5-4-3-2-1"]').click();
  await page.evaluate(() => kitIr(0));
  await page.locator('#resetBody .reset-actions button:has-text("Activar mi plan")').click();
  ok((await page.locator('#toolTitle').innerText()).startsWith('Grounding'), 'activar con herramienta interna la abre');
  await page.evaluate(() => { Overlays.close('tool'); Overlays.close('reset'); });

  // ================= DATOS =================
  section('Datos');
  await page.locator('button[aria-label="Abrir ayuda"]').click();
  const openMisDatos = async () => { const d = page.locator('#helpOverlay details:has(#datosMsg)'); if (!(await d.evaluate(e => e.open))) await d.locator('summary').click(); };
  await openMisDatos();
  const [dl] = await Promise.all([page.waitForEvent('download'), page.locator('button:has-text("Exportar datos")').click()]);
  const exportFile = path.join(D, 'full-export.json'); await dl.saveAs(exportFile);
  const exp = JSON.parse(fs.readFileSync(exportFile, 'utf8'));
  ok(exp.exportFormat === 'wesser-app-data' && exp.sepaEntries.length === 2 && exp.kitPersona === 'Laura', 'exportar');
  const before = JSON.stringify((await st()).sepaEntries);
  await page.evaluate(() => { state.sepaEntries = []; save(); });
  await page.setInputFiles('#importDatosInput', exportFile);
  await Promise.all([page.waitForEvent('load'), confirmOk()]);
  await page.locator('#toast.show').waitFor();
  ok(JSON.stringify((await st()).sepaEntries) === before, 'importar archivo correcto restaura los datos');
  const corrupt = path.join(D, 'full-corrupt.json'); fs.writeFileSync(corrupt, '{"sepaEntries": [ {"id": 1, ');
  await page.locator('button[aria-label="Abrir ayuda"]').click();
  await page.setInputFiles('#importDatosInput', corrupt);
  await page.waitForTimeout(300);
  console.log('CORRUPT MSG:', JSON.stringify(await page.locator('#datosMsg').textContent()), (await st()).sepaEntries.length, await top());
  ok((await page.locator('#datosMsg').textContent()) === 'El archivo no es un JSON válido.' && (await st()).sepaEntries.length === 2, 'importar archivo corrupto: aviso y datos intactos');
  const manip = path.join(D, 'full-manip.json'); fs.writeFileSync(manip, JSON.stringify({ dataVersion: 3, sepaEntries: [1, 2], checkpoints: [], visualAnchors: [], checkins: [], confidenceAnchors: [], resetHistory: [] }));
  await page.setInputFiles('#importDatosInput', manip);
  await page.waitForTimeout(300);
  ok((await page.locator('#datosMsg').textContent()).includes('formato no válido') && (await st()).sepaEntries.length === 2, 'importar JSON manipulado (tipos): rechazado');
  const old = path.join(D, 'full-old.json'); fs.writeFileSync(old, JSON.stringify({ dataVersion: 1, sepaEntries: [{ id: Date.now() - 3600000, fecha: '1/9/2026, 10:00:00', situacion: 'Antigua', emocion: 'miedo', pensD: 'a', pensC: 'b', accion: 'c' }], checkpoints: [{ id: Date.now() - 7200000, fatiga: '6', emocional: '4' }], visualAnchors: ['Frase antigua'], checkins: [], confidenceAnchors: [], resetHistory: [], anchorWord: 'x', kitSenales: ['El "no" me afecta más de lo habitual'] }));
  await page.setInputFiles('#importDatosInput', old);
  await Promise.all([page.waitForEvent('load'), confirmOk()]);
  s = await st();
  ok(s.dataVersion === 3 && s.sepaEntries[0].emociones.join() === 'miedo' && !!s.sepaEntries[0].createdAt && s.checkpoints[0].fatiga === 6 && s.kitSenales[0] === 'El «no» me afecta más de lo habitual', 'importar datos antiguos (v1) migra a v3');
  await page.locator('button[aria-label="Abrir ayuda"]').click();
  await openMisDatos();
  await page.locator('button:has-text("Borrar todos los datos")').click();
  await Promise.all([page.waitForEvent('load'), confirmOk()]);
  s = await st();
  ok(s.sepaEntries.length === 0 && s.checkpoints.length === 0 && s.visualAnchors.length === 0 && !s.kitHerramienta, 'borrar todos los datos');

  // ================= PRUEBA DE SEGURIDAD =================
  section('Seguridad (XSS)');
  const P = `<img src=x onerror="alert('XSS')">`;
  const MIX = P + ` "comillas" 'apóstrofes' \`backticks\` \${x} </p><script>alert(1)</script>\nsalto de línea\r\n\t tab`;
  const LONG = 'x'.repeat(20000);
  const now = Date.now();
  const rec = (i, extra) => ({ id: now - i * 1000, createdAt: new Date(now - i * 1000).toISOString(), ...extra });
  const evil = {
    dataVersion: 3, theme: P,
    sepaEntries: [rec(1, { situacion: MIX, emociones: ['ira', P], pensD: MIX, pensC: MIX, accion: MIX }), rec(2, { situacion: LONG, emociones: ['miedo'], pensD: LONG, pensC: LONG, accion: LONG })],
    checkpoints: [rec(3, { fatiga: P, emocional: MIX, nota: MIX, decision: MIX })],
    visualAnchors: [MIX, LONG],
    checkins: [rec(4, { items: [P, MIX, LONG], total: P })],
    confidenceAnchors: [{ word: MIX, memory: MIX }],
    resetHistory: [rec(5, { senal: MIX, examResultado: MIX, examRendimiento: MIX, aspecto1: MIX, aspecto2: MIX, micro: MIX, stops: P, pacto: MIX, aprendizaje: MIX, observacion: MIX })],
    exitos: [rec(6, { conducta: MIX, repetir: MIX })],
    kitSenales: [P, MIX], kitHerramienta: MIX, kitAjuste: MIX, kitPersona: MIX, kitPedira: MIX,
    resetProgress: { step: 5, senal: MIX, micro: MIX, stops: P, examResultado: MIX, pacto: MIX }
  };
  const evilFile = path.join(D, 'full-evil.json'); fs.writeFileSync(evilFile, JSON.stringify(evil));
  await page.locator('button[aria-label="Abrir ayuda"]').click();
  await page.setInputFiles('#importDatosInput', evilFile);
  await Promise.all([page.waitForEvent('load'), confirmOk()]);
  s = await st();
  ok(s.sepaEntries[1].situacion.length === 5000 && s.visualAnchors[1].length === 5000, 'cadenas de 20.000 caracteres recortadas a 5.000');
  const screens = [
    () => { goto('diario'); setPatronesRango(30); },
    () => { goto('herramientas'); },
    () => { startPreTurno(); },
    () => { openAnchor(); },
    () => { runAnchorGuide(0); },
    () => { openVisualAnchor(); },
    () => { usarRecordatorioVisual(0); },
    () => { activarKitPlan(); },
    () => { startPedirFeedback(); selectPedirFeedback('Mira mi ritmo'); finalizarPedirFeedback(); },
    () => { openReset(); resumeReset(); },
    () => { openReset(); openKit(); },
    () => { openReset(); openCheckinHistorial(); document.querySelectorAll('#resetBody details').forEach(d => d.open = true); },
    () => { openReset(); resetCheckinItems = state.checkins[0].items; resetGoto(1); },
  ];
  for (const fn of screens) {
    await page.evaluate(() => ['confirm', 'modal', 'tool', 'reset', 'help'].forEach(n => Overlays.close(n)));
    await page.evaluate(`(${fn.toString()})()`);
    await page.waitForTimeout(150);
  }
  // Repetir ajuste y editar con datos hostiles
  await page.evaluate(() => { ['confirm', 'modal', 'tool', 'reset', 'help'].forEach(n => Overlays.close(n)); goto('diario'); });
  await page.locator('#sepaHistorial [data-action="editarSepa"]').first().click();
  await page.locator('#sepaSaveBtn').click();
  await page.waitForTimeout(300);
  const shown = await page.evaluate(() => document.getElementById('sepaHistorial').textContent);
  console.log('DIALOGOS:', JSON.stringify(dialogs));
  console.log('INYECTADOS:', await page.evaluate(() => [...document.querySelectorAll('img[src="x"], script')].map(e => e.outerHTML.slice(0, 80) + ' @ ' + (e.parentElement && (e.parentElement.id || e.parentElement.className)))));
  ok(dialogs.length === 0, 'ningún alert() ejecutado en ninguna pantalla (' + dialogs.length + ' diálogos)');
  ok(await page.evaluate(() => !document.querySelector('img[src="x"], script:not([src]):not(:first-of-type)') && !window.pwned), 'ningún <img>/<script> inyectado en el DOM');
  ok(shown.includes(`<img src=x onerror="alert('XSS')">`) && shown.includes('`backticks`') && shown.includes("'apóstrofes'"), 'el payload se muestra como texto literal');
  const overflow = await page.evaluate(() => ({ main: document.querySelector('main').scrollWidth <= document.querySelector('main').clientWidth + 1 }));
  ok(overflow.main, 'las cadenas largas no provocan desplazamiento horizontal');
  ok(await page.evaluate(() => document.documentElement.dataset.theme === 'light' || document.documentElement.dataset.theme === 'dark'), 'tema hostil descartado');

  ok(errors.length === 0, 'sin errores de JavaScript en toda la batería: ' + errors.join(' | '));
  console.log(`\nTOTAL: ${pass} PASS, ${fail} FAIL`);
  await browser.close();
})();
