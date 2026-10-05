const { chromium } = require('playwright');
const path = require('path'), fs = require('fs');
const URL = 'file:///' + path.resolve(__dirname, '..', 'index.html').replace(/\\/g, '/');
const ok = (c, m) => console.log((c ? 'PASS ' : 'FAIL ') + m);

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage(); await page.addInitScript(()=>{try{localStorage.setItem('wesserWelcomeSeen','1')}catch(e){}});
  const errors = [], dialogs = [];
  let dialogAnswer = true;
  page.on('pageerror', e => errors.push(e.message));
  page.on('dialog', d => { dialogs.push(d.message()); dialogAnswer ? d.accept() : d.dismiss(); });
  await page.addInitScript(() => { if (!sessionStorage.getItem('s')) { localStorage.setItem('wesserAppState', JSON.stringify({ dataVersion: 3, kitHerramienta: 'Suspiro fisiológico' })); sessionStorage.setItem('s', '1'); } });
  await page.goto(URL);
  const active = () => page.evaluate(() => { const a = document.activeElement; return a ? (a.id || a.getAttribute('aria-label') || a.dataset.action || a.textContent.trim().slice(0, 30)) : null; });
  const openSet = () => page.evaluate(() => ['modalBack', 'toolOverlay', 'resetOverlay', 'helpOverlay'].filter(id => document.getElementById(id).classList.contains('active')));

  // ---- Ayuda: foco inicial, inert, focus trap, Escape, restauración ----
  await page.locator('button[aria-label="Abrir ayuda"]').focus();
  await page.keyboard.press('Enter');
  ok(await active() === 'helpOverlay', 'foco inicial en el diálogo de Ayuda');
  const inert = await page.evaluate(() => ({ header: document.querySelector('header').inert, main: document.querySelector('main').inert, help: document.getElementById('helpOverlay').inert, aria: document.querySelector('main').getAttribute('aria-hidden') }));
  ok(inert.header && inert.main && !inert.help && inert.aria === 'true', 'fondo inert + aria-hidden, diálogo activo no');
  let escaped = false;
  for (let i = 0; i < 40; i++) {
    await page.keyboard.press('Tab');
    if (!(await page.evaluate(() => document.getElementById('helpOverlay').contains(document.activeElement)))) escaped = true;
  }
  ok(!escaped, 'Tab ×40 nunca sale de la Ayuda');
  await page.evaluate(() => document.getElementById('helpOverlay').focus());
  await page.keyboard.press('Shift+Tab');
  const lastInHelp = await page.evaluate(() => { const a = document.activeElement; return a.tagName === 'SUMMARY' && a.textContent.includes('Mis datos'); });
  ok(lastInHelp, 'Mayús+Tab desde el principio va al último control');
  await page.keyboard.press('Escape');
  ok((await openSet()).length === 0 && await active() === 'Abrir ayuda', 'Escape cierra y devuelve el foco al botón ❓');
  ok(await page.evaluate(() => !document.querySelector('main').inert && !document.querySelector('main').hasAttribute('aria-hidden')), 'al cerrar, el fondo vuelve a ser interactivo');

  // ---- Reset + Kit + Herramienta apilada ----
  await page.locator('button.tab-reset').click();
  ok(JSON.stringify(await openSet()) === '["resetOverlay"]', 'Reset abierto');
  await page.locator('#resetBody button:has-text("Mi Kit de Emergencia")').click();
  await page.locator('#resetBody button:has-text("ACTIVAR MI PLAN")').focus();
  await page.keyboard.press('Enter');
  ok(JSON.stringify(await openSet()) === '["toolOverlay","resetOverlay"]', 'Herramienta apilada sobre el Reset');
  ok(await page.evaluate(() => document.getElementById('resetOverlay').inert && !document.getElementById('toolOverlay').inert), 'el Reset queda inert bajo la Herramienta');
  await page.keyboard.press('Escape');
  ok(JSON.stringify(await openSet()) === '["resetOverlay"]', 'Escape cierra solo la Herramienta');
  ok((await active()).includes('Activar mi plan'), 'foco vuelve a «Activar mi plan» dentro del Reset: ' + await active());
  ok(await page.evaluate(() => toolTimers.length === 0), 'al cerrar la herramienta se paran sus temporizadores');

  // Cerrar el Reset cierra lo que tenga encima; Ayuda y Reset son excluyentes
  await page.evaluate(() => startBreath(60));
  await page.evaluate(() => closeReset());
  ok((await openSet()).length === 0, 'cerrar el Reset cierra también la Herramienta de encima');
  await page.evaluate(() => { openReset(); openHelp(); });
  ok(JSON.stringify(await openSet()) === '["helpOverlay"]', 'abrir Ayuda cierra el Reset (excluyentes)');
  await page.evaluate(() => { closeHelp(); startBreath(60); openReset(); });
  ok(JSON.stringify(await openSet()) === '["resetOverlay"]', 'abrir el Reset cierra una Herramienta suelta');
  await page.evaluate(() => closeReset());

  // ---- Modal: fondo cierra, contenido no ----
  await page.evaluate(() => goto('diario'));
  await page.locator('#sepaEmocionChips [data-action="showEmotion"]').first().click();
  ok(await active() === 'modalSheet', 'foco inicial en la ficha (modal)');
  ok(await page.evaluate(() => document.getElementById('modalSheet').getAttribute('aria-labelledby') === 'modalTitle' && document.getElementById('modalTitle').textContent.includes('Alegría')), 'modal etiquetado por su título');
  await page.locator('#modalSheet h2').click();
  ok((await openSet()).includes('modalBack'), 'clic dentro del modal no lo cierra');
  await page.mouse.click(10, 10);
  ok(!(await openSet()).includes('modalBack'), 'clic en el fondo del modal lo cierra');
  ok((await active()) === 'Ver ficha de Alegría', 'foco vuelve al ℹ️ que abrió la ficha: ' + await active());
  await page.locator('#sepaEmocionChips .chip-info').nth(1).focus(); await page.keyboard.press('Enter');
  ok((await openSet()).includes('modalBack') && await page.evaluate(() => selectedEmociones.length === 0), 'ℹ️ se activa con teclado sin seleccionar la emoción');
  await page.keyboard.press('Escape');

  // ---- No perder lo escrito ----
  await page.evaluate(() => openCheckpoint());
  await page.locator('#cpNota').fill('bajar ritmo');
  const confirmOpen = () => page.evaluate(() => Overlays.top() === 'confirm');
  await page.keyboard.press('Escape');
  ok(await confirmOpen() && (await page.locator('#confirmMsg').innerText()).startsWith('Tienes cambios que todavía no has guardado'), 'Escape con cambios sin guardar abre la confirmación accesible');
  ok(await page.evaluate(() => document.activeElement.id) === 'confirmCancel', 'foco inicial en la opción segura (Seguir editando)');
  ok(await page.evaluate(() => document.getElementById('toolOverlay').inert && !document.getElementById('confirmBack').inert), 'la herramienta queda inert bajo la confirmación');
  await page.keyboard.press('Enter');
  ok(!(await confirmOpen()) && (await openSet()).includes('toolOverlay'), '«Seguir escribiendo» mantiene la herramienta abierta');
  ok(await page.inputValue('#cpNota') === 'bajar ritmo', 'el texto sigue ahí tras cancelar');
  await page.locator('#toolOverlay button[aria-label="Cerrar herramienta"]').click();
  ok(await confirmOpen(), '✕ también pide confirmación');
  await page.keyboard.press('Escape');
  ok(!(await confirmOpen()) && (await openSet()).includes('toolOverlay'), 'Escape en la confirmación = cancelar');
  ok(await page.evaluate(() => document.activeElement.getAttribute('aria-label')) === 'Cerrar herramienta', 'el foco vuelve a la ✕');
  await page.keyboard.press('Escape');
  await page.locator('#confirmOk').click();
  ok(!(await openSet()).includes('toolOverlay') && !(await confirmOpen()), 'aceptando, se cierra');
  const noConfirm = async () => !(await confirmOpen());
  await page.evaluate(() => { openCheckpoint(); });
  await page.locator('#cpNota').fill('otra');
  await page.evaluate(() => { setCpDecision('Sigo igual'); guardarCheckpoint(); });
  ok(await noConfirm() && !(await openSet()).includes('toolOverlay'), 'guardar cierra sin preguntar');
  await page.evaluate(() => openCheckpoint(state.checkpoints[0].id));
  await page.keyboard.press('Escape');
  ok(await noConfirm() && !(await openSet()).includes('toolOverlay'), 'editar sin tocar nada y cerrar no pregunta');

  // Cambios sin guardar en controles que no son texto (Checkpoint)
  const soloCambio = async (label, cambio) => {
    await page.evaluate(() => openCheckpoint());
    await cambio();
    await page.locator('#toolOverlay button[aria-label="Cerrar herramienta"]').click();
    const t = await page.evaluate(() => Overlays.top() === 'confirm' && document.getElementById('confirmTitle').textContent);
    ok(t === '¿Cerrar sin guardar?', `${label}: cerrar pide «¿Cerrar sin guardar?»`);
    if (await confirmOpen()) await page.locator('#confirmOk').click();
    await page.evaluate(() => Overlays.close('tool'));
  };
  await soloCambio('mover solo «Nivel de fatiga»', () => page.locator('#cpFatiga').fill('8'));
  await soloCambio('cambiar solo «Activación emocional»', () => page.locator('#cpEmocional').fill('2'));
  await soloCambio('elegir solo «¿Qué hago ahora?»', () => page.locator('#cpDecisionRow button').nth(1).click());
  // Volver al valor inicial no cuenta como cambio
  await page.evaluate(() => openCheckpoint());
  await page.locator('#cpFatiga').fill('8'); await page.locator('#cpFatiga').fill('5');
  await page.keyboard.press('Escape');
  ok(await noConfirm() && !(await openSet()).includes('toolOverlay'), 'volver al valor inicial no cuenta como cambio sin guardar');
  // «¿Qué ha funcionado?»: elegir solo un chip también cuenta; «No sé qué necesito» (no guarda) no pregunta
  await page.evaluate(() => startExito());
  await page.locator('#toolBody [data-action="selectExitoConducta"]').first().click();
  await page.keyboard.press('Escape');
  ok(await page.evaluate(() => Overlays.top() === 'confirm'), '«¿Qué ha funcionado?»: elegir solo una conducta y cerrar pide confirmación');
  await page.locator('#confirmOk').click();
  await page.evaluate(() => { startNoSeQueNecesito(); setNsqnAnswer('cabeza', true); });
  await page.keyboard.press('Escape');
  ok(await noConfirm() && !(await openSet()).includes('toolOverlay'), '«No sé qué necesito» (no guarda nada) se cierra sin preguntar');

  // Reset: lo escrito se guarda solo, no pregunta
  await page.evaluate(() => { openReset(); resetGoto(2); });
  await page.locator('#rc-contexto [data-action="resetOtro"]').click();
  await page.locator('#rco-contexto').fill('poco flujo');
  await page.keyboard.press('Escape');
  ok(await noConfirm() && (await openSet()).length === 0, 'Reset se cierra sin preguntar (su progreso se guarda solo)');
  ok(await page.evaluate(() => JSON.parse(localStorage.getItem('wesserAppState')).resetProgress.examResultado) === 'poco flujo', 'y lo escrito queda guardado al cerrar');
  await page.evaluate(() => { openReset(); });
  ok(await page.locator('#resetBody').innerText().then(t => t.includes('Reset a medias')), 'al volver se ofrece continuar');
  await page.evaluate(() => { startFreshReset(); closeReset(); });

  // ---- Foco estable al re-renderizar ----
  await page.evaluate(() => { state.kitSenales = []; openReset(); openKit(1); });
  const chip = page.locator('#rc-kitSenales [data-action="resetChip"]').nth(2);
  await chip.focus();
  await page.keyboard.press('Enter');
  const f = await page.evaluate(() => ({ action: document.activeElement.dataset.action, value: document.activeElement.dataset.value, pressed: document.activeElement.getAttribute('aria-pressed') }));
  ok(f.action === 'resetChip' && f.value === 'Empiezo ya cansado' && f.pressed === 'true', 'tras re-renderizar, el foco sigue en el mismo chip: ' + JSON.stringify(f));
  await page.evaluate(() => closeReset());

  // Fondo no clicable con overlay abierto
  await page.evaluate(() => openHelp());
  const clicked = await page.evaluate(() => { let hit = false; const b = document.querySelector('#headerTabs button'); b.addEventListener('click', () => hit = true, { once: true }); b.focus(); return document.activeElement === b; });
  ok(!clicked, 'no se puede enfocar nada del fondo');
  await page.evaluate(() => closeHelp());

  // Rutinas rápidas que no guardan: el aviso no sugiere que falte guardar
  await page.evaluate(() => { Overlays.close('confirm'); Overlays.close('modal'); Overlays.close('tool'); Overlays.close('reset'); Overlays.close('help'); startCierreTurno(); });
  await page.fill('#cierreTurno1', 'Un turno duro');
  await page.keyboard.press('Escape'); await page.waitForTimeout(150);
  const efimero = await page.evaluate(() => [document.getElementById('confirmTitle').textContent, document.getElementById('confirmMsg').textContent]);
  ok(efimero[0] === '¿Cerrar?' && efimero[1].includes('no se guarda'), 'Cierre de turno a medias: «¿Cerrar? Lo que has escrito aquí no se guarda»');
  await page.locator('#confirmOk').click();
  await page.evaluate(() => { openCheckpoint(); });
  await page.fill('#cpNota', 'Beber agua');
  await page.keyboard.press('Escape'); await page.waitForTimeout(150);
  ok(await page.evaluate(() => document.getElementById('confirmTitle').textContent) === '¿Cerrar sin guardar?', 'herramienta que sí guarda: mantiene «¿Cerrar sin guardar?»');
  await page.locator('#confirmOk').click();

  ok(errors.length === 0, 'sin errores de JS: ' + errors.join(' | '));
  await browser.close();
})();
