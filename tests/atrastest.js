/* «Atrás» en el Reset, gesto atrás del móvil (historial) y plan del Kit al terminar antes de tiempo */
const { chromium } = require('playwright');
const path = require('path');
const URL = 'file:///' + path.resolve(__dirname, '..', 'index.html').replace(/\\/g, '/');
const ok = (c, m) => console.log((c ? 'PASS ' : 'FAIL ') + m);
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 375, height: 812 } });
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.addInitScript(() => { if (sessionStorage.getItem('s')) return; sessionStorage.setItem('s', '1');
    localStorage.setItem('wesserWelcomeSeen', '1');
    localStorage.setItem('wesserAppState', JSON.stringify({ dataVersion: 3, kitHerramienta: 'Suspiro fisiológico', kitAjuste: 'Saludar más despacio', kitPersona: 'Laura' })); });
  await p.goto(URL);
  const NEXT = '#resetBody .reset-actions .btn-amber', BACK = '#resetBody .reset-actions .reset-atras';
  const paso = () => p.evaluate(() => ({ step: resetStep, parte: examinaParte, h: document.querySelector('#resetBody h3') && document.querySelector('#resetBody h3').textContent }));

  // ---- Botón «Atrás» ----
  await p.click('#tabReset'); await p.click('#resetBody button:has-text("Empezar el Reset")');
  ok(await p.locator(BACK).isVisible(), 'R: «Atrás» visible junto a «Continuar»');
  await p.locator('#rc-senal [data-action="resetChip"]').nth(1).click(); await p.click(NEXT);
  await p.locator('#rc-contexto [data-action="resetChip"]').first().click(); await p.click(NEXT);
  ok((await paso()).parte === 1, 'Examina 2/2');
  await p.click(BACK);
  let s = await paso(); ok(s.step === 2 && s.parte === 0, 'Atrás desde Examina 2/2 vuelve a Examina 1/2');
  ok(await p.evaluate(() => resetExamResultado) === 'Flujo de gente', 'lo elegido se conserva al volver');
  await p.click(BACK);
  s = await paso(); ok(s.step === 1, 'Atrás desde Examina 1/2 vuelve a R');
  ok(await p.evaluate(() => resetSenal) === 'El «no» me afecta más de lo habitual', 'la señal elegida sigue marcada');
  await p.click(NEXT); await p.click(NEXT); await p.locator('#rc-forma [data-action="resetChip"]').first().click(); await p.click(NEXT);
  ok((await paso()).step === 3, 'Separa');
  await p.click(BACK);
  s = await paso(); ok(s.step === 2 && s.parte === 1, 'Atrás desde Separa vuelve a Examina 2/2');

  // ---- Gesto atrás del móvil (historial) ----
  await p.goBack(); await p.waitForTimeout(150);
  s = await paso(); ok(s.step === 2 && s.parte === 0 && await p.evaluate(() => Overlays.top()) === 'reset', 'gesto atrás: retrocede un paso dentro del Reset sin salir de la app');
  await p.goBack(); await p.waitForTimeout(150);
  ok((await paso()).step === 1, 'gesto atrás otra vez: vuelve a R');
  await p.goBack(); await p.waitForTimeout(150);
  ok((await paso()).step === 0 && await p.evaluate(() => Overlays.top()) === 'reset', 'desde R vuelve a la entrada');
  await p.goBack(); await p.waitForTimeout(150);
  ok(await p.evaluate(() => Overlays.top()) === null && p.url().startsWith('file:'), 'desde la entrada, el gesto atrás cierra el Reset y la app sigue abierta');
  // Abrir y cerrar con la ✕ no deja entradas sueltas en el historial
  const largo0 = await p.evaluate(() => history.length);
  await p.evaluate(() => openHelp()); await p.keyboard.press('Escape'); await p.waitForTimeout(150);
  await p.evaluate(() => openHelp()); await p.keyboard.press('Escape'); await p.waitForTimeout(150);
  ok(await p.evaluate(() => Overlays.top()) === null && await p.evaluate(() => !history.state || !history.state.gestorOverlay), 'abrir y cerrar con Escape no deja la marca de pantalla en el historial');
  ok(await p.evaluate(() => history.length) <= largo0 + 1, 'el historial no crece al abrir y cerrar pantallas');
  // Recargar con una marca antigua no confunde al cerrar
  await p.evaluate(() => openHelp()); await p.reload(); await p.waitForTimeout(200);
  await p.evaluate(() => openHelp()); await p.keyboard.press('Escape'); await p.waitForTimeout(250);
  ok(p.url().startsWith('file:') && await p.evaluate(() => typeof Overlays === 'object'), 'tras recargar con una pantalla abierta, cerrar no sale de la página');

  // ---- «Activar mi plan»: terminar antes de tiempo muestra el resto del plan ----
  await p.evaluate(() => goto('herramientas'));
  await p.locator('#qlKitSlot .ql-kit').click();
  ok(await p.evaluate(() => Overlays.top()) === 'tool' && (await p.locator('#toolTitle').innerText()).includes('Suspiro'), 'Activar mi plan abre su herramienta');
  await p.locator('#toolBody button:has-text("Terminar")').click();
  const hecho = await p.locator('#toolBody').textContent();
  ok(hecho.includes('Sigue tu plan') && hecho.includes('Saludar más despacio') && hecho.includes('Laura'), 'al pulsar «Terminar» antes de tiempo se muestra igualmente el resto del plan');
  ok(await p.evaluate(() => document.querySelector('#toolBody .btn-navy').textContent.trim()) === 'Vuelvo a calle', 'en «Hecho», el botón principal es «Vuelvo a calle»');
  await p.locator('#toolBody .btn-navy').click();
  ok(await p.evaluate(() => Overlays.top()) === null, '«Vuelvo a calle» cierra la herramienta');
  // Fuera del plan, «Terminar» sigue cerrando sin más
  await p.evaluate(() => startBreath(60)); await p.locator('#toolBody button:has-text("Terminar")').click();
  ok(await p.evaluate(() => Overlays.top()) === null, 'fuera del plan, «Terminar» cierra la herramienta');

  // ---- Enlace «Saltar al contenido» ----
  await p.reload(); await p.waitForTimeout(200);
  await p.keyboard.press('Tab');
  const salto = await p.evaluate(() => ({ cls: document.activeElement.className, txt: document.activeElement.textContent, visible: document.activeElement.getBoundingClientRect().top >= 0 }));
  ok(salto.cls === 'skip-link' && salto.txt === 'Saltar al contenido' && salto.visible, 'el primer Tab llega a «Saltar al contenido» y se ve');
  await p.keyboard.press('Enter');
  ok(await p.evaluate(() => document.activeElement.id) === 'contenido', '«Saltar al contenido» lleva el foco al contenido principal');

  // ---- Lote de la 7ª crítica ----
  // Barra del Reset siempre al fondo, aunque el paso sea corto
  await p.evaluate(() => { openReset(); resetGoto(2); });
  const hueco = await p.evaluate(() => Math.round(innerHeight - document.querySelector('#resetBody .reset-actions .btn-amber').getBoundingClientRect().bottom));
  ok(hueco >= 0 && hueco <= 20, `el botón principal del Reset queda al fondo en un paso corto (${hueco}px)`);
  // Test a medias: «Seguir mi test» también en la fila compacta de otra sección
  await p.evaluate(() => { resetMicro = 'Simplificar la apertura'; resetStops = 3; resetGoto(5); closeReset(); goto('diario'); });
  const compacto = p.locator('#qlTestSlotCompact .ql-btn');
  ok(await compacto.isVisible() && (await compacto.innerText()).includes('Seguir mi test · 3/10') && !(await p.locator('#qlKitSlotCompact').isVisible()), '«Seguir mi test · 3/10» en la fila compacta del Diario (en lugar de «Activar mi plan»)');
  await compacto.click();
  ok(await p.evaluate(() => resetStep === 5 && resetStops === 3), 'lleva directo al contador');
  await p.evaluate(() => { startFreshReset(); closeReset(); });
  // Check-in: títulos a la vista y explicaciones a demanda
  await p.evaluate(() => { openReset(); startCheckin(); });
  ok(!(await p.locator('#resetBody .ci-desc').first().isVisible()), 'check-in: las explicaciones empiezan ocultas');
  await p.click('#resetBody .checkin-desc-btn');
  ok(await p.locator('#resetBody .ci-desc').first().isVisible(), 'check-in: «Ver qué significa cada señal» las muestra');
  await p.evaluate(() => closeReset());
  // Herramientas de calle: pulsar en vez de escribir
  await p.evaluate(() => startVolverCalle());
  await p.locator('#tc-volverCalle1 [data-action="toolChip"]').first().click();
  ok(await p.evaluate(() => document.querySelector('#tc-volverCalle1 [data-action="toolChip"]').textContent === 'Con más calma'), 'Volver a calle: opciones pulsables');
  ok(await p.evaluate(() => document.querySelector('#tc-volverCalle2 [data-action="toolChip"]').textContent) === 'Saludar más despacio', 'el ajuste del Kit es la primera opción de «primera parada» (sin marcar)');
  await p.locator('#toolBody button:has-text("Vuelvo a calle")').click();
  ok((await p.locator('#toolBody').innerText()).includes('Con más calma'), 'el resumen muestra lo pulsado');
  await p.evaluate(() => closeTool());

  // ---- Lote de la 8ª crítica: «¿Qué he aprendido?» decide de verdad ----
  const prepAprendido = () => p.evaluate(() => { openReset(); resetSenal = 'Anticipo el rechazo'; resetExamResultado = 'Clima'; resetAspecto1 = 'Explico con claridad'; resetMicro = 'Simplificar la apertura'; resetStops = 10; resetGoto(6); });
  await prepAprendido();
  await p.click('#resetBody [data-value="Lo ajusto"]');
  await p.fill('#resetAjusteNuevoInput', 'Simplificar la apertura y sonreír');
  await p.click('#resetBody .reset-actions .btn-amber');
  const cierreAjuste = await p.locator('#resetBody .reset-cierre').innerText();
  ok(cierreAjuste.includes('Tu ajuste nuevo') && cierreAjuste.includes('Simplificar la apertura y sonreír') && cierreAjuste.includes('Lo que probaste'), '«Lo ajusto»: el cierre muestra el ajuste nuevo y el probado');
  await p.click('#resetBody .reset-actions .btn-amber');
  ok(await p.evaluate(() => state.resetHistory[0].ajusteNuevo === 'Simplificar la apertura y sonreír'), '«Lo ajusto»: el historial guarda el ajuste nuevo');
  await prepAprendido();
  await p.click('#resetBody [data-value="Pruebo otra cosa"]');
  ok((await p.locator('#resetBody .reset-actions .btn-amber').innerText()).includes('Elegir otro ajuste'), '«Pruebo otra cosa»: el botón dice «Elegir otro ajuste»');
  await p.click('#resetBody .reset-actions .btn-amber');
  ok(await p.evaluate(() => resetStep === 4 && resetMicro === null && resetStops === 0 && resetSenal === 'Anticipo el rechazo' && resetAspecto1 === 'Explico con claridad' && state.resetHistory[0].aprendizaje === 'Pruebo otra cosa'), '«Pruebo otra cosa»: guarda el test y vuelve a Elige conservando R, E y S');
  await p.evaluate(() => { startFreshReset(); closeReset(); });
  // Círculo de respiración: al crecer no tapa el texto
  await p.evaluate(() => { startBreath(60); const c = document.getElementById('breathCircle'); c.style.transition = 'none'; c.classList.add('grow'); });
  ok(await p.evaluate(() => { const c = document.getElementById('breathCircle').getBoundingClientRect(); return [...document.querySelectorAll('#toolBody p')].every(x => { const r = x.getBoundingClientRect(); return r.bottom <= c.top - 14 || r.top >= c.bottom + 14; }); }), 'el círculo de respiración, crecido, no tapa ningún texto');
  await p.evaluate(() => closeTool());

  // ---- Lote de la 9ª crítica ----
  // Cambiar de ajuste con paradas contadas: el test empieza de cero y se avisa
  await p.evaluate(() => { openReset(); resetSenal = 'Anticipo el rechazo'; resetMicro = 'Simplificar la apertura'; resetStops = 6; resetGoto(4); });
  await p.locator('#rc-micro [data-action="resetChip"]').first().click();
  await p.click('#resetBody .reset-actions .btn-amber');
  ok(await p.evaluate(() => resetStep === 5 && resetStops === 0) && await p.locator('#resetBody .reset-aviso').isVisible(), 'cambiar de ajuste con 6 paradas: el test empieza de cero y lo dice');
  await p.click('#incrementStopBtn');
  ok(await p.locator('#resetBody .reset-aviso').count() === 0, 'el aviso desaparece al contar la primera parada');
  // «Lo ajusto» sin cambiar nada no avanza
  await p.evaluate(() => { resetMicro = 'Simplificar la apertura'; resetStops = 10; resetGoto(6); });
  await p.click('#resetBody [data-value="Lo ajusto"]');
  await p.click('#resetBody .reset-actions .btn-amber');
  ok(await p.evaluate(() => resetStep === 6 && !!document.querySelector('#resetBody .field-error')), '«Lo ajusto» sin cambios pide cambiar algo o elegir «Lo mantengo»');
  // «Pruebo otra cosa»: el descartado no vuelve a sugerirse y el aviso va en línea
  await p.click('#resetBody [data-value="Pruebo otra cosa"]');
  await p.click('#resetBody .reset-actions .btn-amber');
  const sugeridos = await p.evaluate(() => [...document.querySelectorAll('#rc-micro > .reset-sug-title + .chip-group [data-action="resetChip"]')].map(b => b.dataset.value));
  ok(!sugeridos.includes('Simplificar la apertura') && await p.locator('#resetBody .reset-aviso-izq').isVisible(), 'tras «Pruebo otra cosa», el ajuste descartado no sale en los sugeridos y el aviso va en la tarjeta');
  await p.evaluate(() => { startFreshReset(); });
  // Señal escrita a mano: ajustes habituales, no la lista entera
  await p.evaluate(() => { resetSenal = 'Me noto sin fuerzas'; resetGoto(4); });
  const habituales = await p.evaluate(() => ({ t: document.querySelector('#rc-micro .reset-sug-title').textContent, n: document.querySelectorAll('#rc-micro > .reset-sug-title + .chip-group [data-action="resetChip"]').length, todos: document.querySelector('#rc-micro details.reset-todos').open }));
  ok(habituales.t === 'Ajustes habituales' && habituales.n <= 4 && !habituales.todos, 'señal escrita a mano: «Ajustes habituales» a la vista y el resto plegado');
  // Dentro del Kit no se ve el botón «Kit»
  await p.evaluate(() => openKit(0));
  ok(!(await p.locator('#resetOverlay .oh-actions [onclick="openKit()"]').isVisible()), 'dentro del Kit no se ve el botón «Kit» de la cabecera');
  await p.evaluate(() => { startFreshReset(); closeReset(); goto('diario'); });
  // Diario: los errores se borran al rellenar con botones y al guardar
  await p.click('#sepaSaveBtn');
  await p.locator('#view-diario .chip:has-text("Pausa consciente")').click();
  ok(await p.evaluate(() => !document.querySelector('#sepaAccion').hasAttribute('aria-invalid')), 'Diario: el error de A se borra al rellenarla con un chip');
  await p.selectOption('#sepaSituacion', 'Zona con poco flujo');
  await p.locator('#sepaEmocionChips [data-id="ira"]').click();
  await p.selectOption('#sepaPensDestructivo', 'No vale la pena');
  await p.click('button:has-text("Sugerir reencuadre")');
  await p.click('#sepaSaveBtn');
  ok(await p.evaluate(() => state.sepaEntries.length >= 1 && document.querySelectorAll('#view-diario .field-error').length === 0), 'Diario: tras guardar, el formulario queda sin errores');

  // ---- Menores de la 9ª crítica ----
  await p.evaluate(() => { state.resetProgress = { step: 5, micro: 'Simplificar la apertura', stops: 3 }; renderResetTab(); goto('herramientas'); });
  ok(await p.evaluate(() => getComputedStyle(document.querySelector('#qlRow .ql-reset')).backgroundColor !== getComputedStyle(document.querySelector('#qlRow .ql-kit')).backgroundColor && document.getElementById('qlRow').classList.contains('con-test')), 'con un test a medias, «Seguir mi test» es el principal del lanzador y «Activar mi plan» va neutro');
  await p.evaluate(() => { state.resetProgress = null; renderResetTab(); openReset(); });
  ok((await p.locator('#resetBody').innerText()).includes('Reconoce, examina, separa'), 'la entrada del Reset nombra los cinco pasos');
  await p.evaluate(() => resetGoto(3));
  ok((await p.locator('#resetBody').innerText()).includes('Marca una o dos cosas'), 'Separa no usa el verbo del paso siguiente');
  await p.evaluate(() => closeReset());

  // ---- Estados durante la captación: una sola fuente, acceso rápido y paso a la acción ----
  await p.evaluate(() => goto('herramientas'));
  await p.locator('.ql-nombre:visible').first().click();
  ok(await p.evaluate(() => document.querySelectorAll('#toolBody .estado-opcion').length === 6 && !!document.querySelector('#toolBody [onclick="startNoSeQueNecesito()"]')), '«Ponle nombre a lo que sientes»: 6 estados y «No lo tengo claro»');
  const destinos = await p.evaluate(() => ESTADOS_CAPTACION.map(e => [e.id, e.herramienta]));
  for (const [id, herramienta] of destinos) {
    await p.evaluate(id => { startEstados(); openEstado(id); }, id);
    await p.locator('#toolBody button:has-text("Probar ahora")').click();
    ok(await p.evaluate(h => (document.getElementById('toolTitle').textContent || '').startsWith(h.slice(0, 10)), herramienta), `estado «${id}» → abre «${herramienta}»`);
    await p.evaluate(() => { if (Overlays.top() === 'tool') closeTool(); if (Overlays.top() === 'reset') closeReset(); });
  }
  await p.evaluate(() => goto('aprender'));
  ok(await p.evaluate(() => document.querySelectorAll('#estadosCaptacion details').length === 6 && document.querySelectorAll('#estadosVistazo li').length === 6 && document.querySelectorAll('#estadosCaptacion .estado-cta').length === 6), 'Aprender pinta los 6 estados y su resumen desde la misma fuente, con su botón de acción');
  await p.evaluate(() => { const d = document.querySelector('#estadosCaptacion details:nth-child(6)'); let x = d; while (x) { x.open = true; x = x.parentElement.closest('details'); } });
  await p.locator('#estadosCaptacion details:nth-child(6) .estado-cta').click();
  ok(await p.evaluate(() => Overlays.top() === 'tool' && document.getElementById('toolTitle').textContent === 'Checkpoint de mitad de turno'), 'el botón de Aprender (Fatiga mental) abre el Checkpoint, igual que el acceso rápido');
  await p.evaluate(() => closeTool());

  ok(errs.length === 0, 'sin errores de JS ' + errs.join(' | '));
  await b.close();
})();
