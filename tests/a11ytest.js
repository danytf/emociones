const { chromium } = require('playwright');
const path = require('path'), fs = require('fs');
const URL = 'file:///' + path.resolve(__dirname, '..', 'index.html').replace(/\\/g, '/');
const ok = (c, m) => console.log((c ? 'PASS ' : 'FAIL ') + m);

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 820, height: 1180 }, hasTouch: true }); // tablet
  const page = await ctx.newPage(); await page.addInitScript(()=>{try{localStorage.setItem('wesserWelcomeSeen','1')}catch(e){}});
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('dialog', d => d.accept());
  await page.goto(URL);
  // Registro de anuncios de la región viva
  await page.evaluate(() => {
    window.__ann = [];
    new MutationObserver(() => { const t = document.getElementById('srStatus').textContent; if (t) window.__ann.push([Date.now(), t]); })
      .observe(document.getElementById('srStatus'), { childList: true, characterData: true, subtree: true });
  });

  // ---- 4.1 Chips como <button> reales ----
  const openAll = async () => page.evaluate(() => { goto('diario'); });
  await openAll();
  const chipsInfo = async () => page.evaluate(() => [...document.querySelectorAll('.chip, .chip-info')].map(c => ({ tag: c.tagName, type: c.type, pressed: c.getAttribute('aria-pressed'), role: c.getAttribute('role'), tab: c.getAttribute('tabindex') })));
  let all = [];
  all.push(...await chipsInfo());
  for (const fn of ['startExito()', 'selectRP("resultado")', 'startPedirFeedback()']) { await page.evaluate(f => { closeTool(); eval(f); }, fn); all.push(...await chipsInfo()); }
  await page.evaluate(() => { closeTool(); state.kitSenales = []; openReset(); openKit(); }); all.push(...await chipsInfo());
  await page.evaluate(() => { resetMicro = null; resetGoto(4); }); all.push(...await chipsInfo());
  await page.evaluate(() => { resetCheckinItems = [CHECKIN_SECTIONS[0].items[0], CHECKIN_SECTIONS[0].items[1]]; resetGoto(1); }); all.push(...await chipsInfo());
  ok(all.length > 60 && all.every(c => c.tag === 'BUTTON' && c.type === 'button' && !c.role && !c.tab), `todos los chips son <button type="button"> sin role/tabindex (${all.length})`);
  ok(await page.evaluate(() => typeof enhanceChip === 'undefined' && typeof chipObserver === 'undefined'), 'eliminado el MutationObserver de chips');
  ok(await page.evaluate(() => !document.querySelector('[role="button"]:not(button)')), 'no quedan role="button" no nativos');

  // R · Reconoce: paso de reconocimiento, sin respiración automática ni temporizador
  const r = await page.evaluate(() => ({ circle: !!document.querySelector('#resetBody .breath-circle'), timer: !!document.querySelector('#resetBody [role="timer"]'), timers: toolTimers.length, text: document.getElementById('resetBody').innerText }));
  ok(!r.circle && !r.timer && r.timers === 0, 'R · Reconoce sin respiración automática ni temporizador');
  ok(r.text.includes('Reconoce lo que está pasando') && r.text.includes('Estoy atravesando una mala racha. Eso no significa que haya dejado de saber hacer mi trabajo.') && r.text.includes('¿Qué señal estás notando con más fuerza hoy?'), 'R · Reconoce con el copy aprobado');
  await page.locator('#resetBody [data-action="selectSenal"]').nth(1).click();
  await page.locator('#resetBody button:has-text("Continuar")').click();
  ok(await page.evaluate(() => resetStep === 2), 'se elige la señal y se continúa al momento');
  await page.evaluate(() => resetGoto(1));
  const senal = await page.evaluate(() => ({ s: resetSenal, p: [...document.querySelectorAll('#resetBody [data-action="selectSenal"]')].map(b => b.getAttribute('aria-pressed')) }));
  ok(senal.s === 'El «no» me afecta más de lo habitual' && senal.p.join() === 'false,true', 'señal guardada como título + aria-pressed: ' + JSON.stringify(senal));
  await page.evaluate(() => { startFreshReset(); closeReset(); });

  // ---- 4.2 Emociones: chip y ℹ️ independientes ----
  await openAll();
  const chip = page.locator('#sepaEmocionChips [data-action="toggleEmocion"][data-id="miedo"]');
  const info = page.locator('#sepaEmocionChips [data-action="showEmotion"][data-value="miedo"]');
  ok(await chip.evaluate(e => e.parentElement === document.querySelector('#sepaEmocionChips [data-value="miedo"]').parentElement && !e.contains(document.querySelector('#sepaEmocionChips [data-value="miedo"]'))), 'ℹ️ es un botón hermano, no anidado');
  await chip.focus(); await page.keyboard.press('Enter');
  ok(await chip.getAttribute('aria-pressed') === 'true' && await page.evaluate(() => selectedEmociones.join()) === 'miedo', 'Enter en el chip marca la emoción (aria-pressed=true)');
  await page.keyboard.press('Space');
  ok(await chip.getAttribute('aria-pressed') === 'false' && await page.evaluate(() => selectedEmociones.length) === 0, 'Espacio la desmarca');
  await page.keyboard.press('Tab');
  ok(await page.evaluate(() => document.activeElement.getAttribute('aria-label')) === 'Ver ficha de Miedo', 'Tab pasa del chip a su ℹ️');
  await page.keyboard.press('Enter');
  ok(await page.evaluate(() => Overlays.top() === 'modal' && selectedEmociones.length === 0), 'Enter en ℹ️ abre la ficha sin marcar la emoción');
  await page.keyboard.press('Escape');
  ok(await page.evaluate(() => document.activeElement.getAttribute('aria-label')) === 'Ver ficha de Miedo', 'al cerrar, el foco vuelve a ℹ️');
  const gap = await page.evaluate(() => { const a = document.querySelector('#sepaEmocionChips [data-id="miedo"]').getBoundingClientRect(), b = document.querySelector('#sepaEmocionChips [data-value="miedo"]').getBoundingClientRect(); return b.left - a.right; });
  ok(gap >= 4, `chip y ℹ️ separados (${gap}px): sin doble activación`);
  await page.evaluate(() => { const c = document.querySelector('#sepaEmocionChips [data-id="ira"]'); c.click(); editarSepa; });
  await page.evaluate(() => { selectedEmociones = ['ira']; document.getElementById('sepaPensConstructivo').value = 'a'; document.getElementById('sepaAccion').value = 'b'; guardarSepa(); });
  ok(await page.evaluate(() => [...document.querySelectorAll('#sepaEmocionChips [aria-pressed="true"]')].length) === 0, 'al guardar se desmarcan (aria-pressed sincronizado)');

  // ---- Check-in: casillas nativas ----
  await page.evaluate(() => { startCheckin(); openReset(); startCheckin(); });
  const cb = page.locator('.check-item input[type="checkbox"]').nth(2);
  await cb.focus(); await page.keyboard.press('Space');
  ok(await page.evaluate(() => checkinState[0][2] === true && document.querySelectorAll('.check-item')[2].classList.contains('checked')), 'Espacio en la casilla marca la señal');
  ok(await page.evaluate(() => document.activeElement.matches('.check-item input')), 'el foco se mantiene en la casilla (sin re-render)');
  const nameOf = await page.evaluate(() => { const i = document.querySelectorAll('.check-item input')[2]; return i.labels[0].textContent.trim().slice(0, 25); });
  ok(nameOf.startsWith('Empiezo ya cansado'), 'la casilla tiene nombre accesible por su <label>: ' + nameOf);
  await page.evaluate(() => closeReset());

  // ---- 4.3 Navegación ----
  await page.evaluate(() => goto('herramientas'));
  const nav = await page.evaluate(() => [...document.querySelectorAll('#headerTabs button')].map(b => [b.dataset.view || b.id, b.getAttribute('aria-current'), b.getAttribute('aria-haspopup')]));
  ok(nav.filter(n => n[1] === 'page').length === 1 && nav.find(n => n[0] === 'herramientas')[1] === 'page', 'aria-current="page" solo en la sección activa');
  ok(nav.find(n => n[0] === 'tabReset')[2] === 'dialog', 'Reset marcado como botón que abre un diálogo');
  const lbl0 = await page.locator('#tabReset').getAttribute('aria-label');
  await page.evaluate(() => { openReset(); resetGoto(2); closeReset(); });
  const lbl1 = await page.locator('#tabReset').getAttribute('aria-label');
  const pend = await page.locator('#tabReset').evaluate(b => b.classList.contains('pending'));
  ok(lbl0 === 'Reset: abre el Modo Reset' && lbl1.includes('a medias') && pend, 'estado del Reset a medias visible y anunciado: ' + lbl1);
  await page.evaluate(() => { openReset(); startFreshReset(); closeReset(); });
  ok(!(await page.locator('#tabReset').evaluate(b => b.classList.contains('pending'))), 'al empezar de nuevo desaparece el aviso');
  ok(await page.locator('#qlToggleBtn').getAttribute('aria-expanded') === 'false', '«Más situaciones» con aria-expanded');
  await page.locator('#qlToggleBtn').click();
  ok(await page.locator('#qlToggleBtn').getAttribute('aria-expanded') === 'true', 'aria-expanded se actualiza');

  // ---- 4.4 Ayuda ----
  const help = await page.evaluate(() => { openHelp(); const s = document.querySelector('#helpOverlay summary'); const after = getComputedStyle(s, '::after').content; closeHelp(); return after; });
  ok(help.includes('/ ""') || help.includes("/ ''"), 'el +/– de los desplegables no se lee (texto alternativo vacío): ' + help);

  // ---- 4.5 Temporizadores ----
  await page.waitForTimeout(500);   // deja salir los avisos pendientes de pruebas anteriores (announce() agrupa con retardo)
  await page.evaluate(() => { window.__ann = []; startBreath(60); });
  await page.waitForTimeout(6500);
  const ann = await page.evaluate(() => window.__ann.map(a => a[1]));
  ok(ann[0].startsWith('Suspiro fisiológico: 60 segundos') && ann[0].includes('Inhala.'), 'anuncia el comienzo: ' + ann[0]);
  ok(ann.length >= 2 && ann.length <= 4 && ann.every(a => !/^\d+$/.test(a)), `anuncia fases, no segundos (${ann.length} anuncios en 6,5 s): ` + ann.join(' | '));
  ok(await page.evaluate(() => document.getElementById('breathTimer').getAttribute('role')) === 'timer', 'contador con role="timer" (no se lee cada segundo)');
  await page.evaluate(() => { window.__ann = []; showToolDone('Suspiro fisiológico', () => startBreath(60)); });
  await page.waitForTimeout(300);
  ok((await page.evaluate(() => window.__ann.map(a => a[1]))).join().includes('Suspiro fisiológico: completado.'), 'anuncia la finalización');
  await page.evaluate(() => { closeTool(); window.__ann = []; startTense(); });
  await page.waitForTimeout(5800);
  const tann = await page.evaluate(() => window.__ann.map(a => a[1]));
  ok(tann[0].includes('4 grupos musculares') && tann[0].includes('Puños: tensa.') && tann.some(a => a === 'Puños: suelta.'), 'Tense & Release anuncia inicio y fases: ' + tann.join(' | '));
  await page.evaluate(() => { closeTool(); state.confidenceAnchors = [{ word: 'Calma', memory: 'm' }]; window.__ann = []; runAnchorGuide(0); });
  await page.waitForTimeout(300);
  ok((await page.evaluate(() => window.__ann.map(a => a[1]))).join().includes('Recordatorio de confianza: 30 segundos'), 'anclaje anuncia el comienzo');
  ok(await page.evaluate(() => { openReset(); return true; }) && await page.evaluate(() => getComputedStyle(document.getElementById('srStatus')).display !== 'none' && !document.getElementById('srStatus').inert && !document.getElementById('srStatus').hasAttribute('aria-hidden')), 'la región viva sigue activa con overlays abiertos');
  await page.evaluate(() => { closeTool(); closeReset(); });

  // ---- 4.6 Movimiento reducido ----
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.evaluate(() => startBreath(60));
  await page.waitForTimeout(300);
  const rm = await page.evaluate(() => { const c = document.getElementById('breathCircle'); return { grow: c.classList.contains('grow'), transform: getComputedStyle(c).transform, text: c.textContent, motionOK: motionOK() }; });
  ok(rm.grow && rm.transform === 'none' && rm.text === 'Inhala' && !rm.motionOK, 'con movimiento reducido el círculo no se escala y la fase se da por texto: ' + JSON.stringify(rm));
  await page.evaluate(() => closeTool());
  await page.emulateMedia({ reducedMotion: 'no-preference' });

  // ---- Tamaño de objetivo (WCAG 2.5.8) y foco visible ----
  const small = [];
  const measure = async (label) => {
    const r = await page.evaluate(() => [...document.querySelectorAll('button, summary, select, input, textarea, [data-action]')]
      .filter(e => e.checkVisibility() && !e.closest('[inert]') && e.getClientRects().length && !(e.type === 'range'))
      .map(e => { const b = e.getBoundingClientRect(); return { w: Math.round(b.width), h: Math.round(b.height), t: (e.getAttribute('aria-label') || e.textContent || e.type || '').trim().slice(0, 25), chip: e.matches('.chip, .chip-info') }; }));
    r.forEach(x => { if (x.w < 24 || x.h < 24 || (x.chip && (x.w < 44 || x.h < 44))) small.push(label + ': ' + x.t + ' ' + x.w + 'x' + x.h); });
  };
  for (const v of ['aprender', 'bienestar', 'herramientas', 'diario']) { await page.evaluate(v => goto(v), v); await measure(v); }
  await page.evaluate(() => { openHelp(); document.querySelectorAll('#helpOverlay details').forEach(d => d.open = true); }); await measure('ayuda'); await page.evaluate(() => closeHelp());
  await page.evaluate(() => { openReset(); openKit(); }); await measure('kit'); await page.evaluate(() => openCheckinHistorial()); await measure('historial'); await page.evaluate(() => startCheckin()); await measure('checkin'); await page.evaluate(() => closeReset());
  await page.evaluate(() => { goto('diario'); }); await measure('diario2');
  await page.evaluate(() => startExito()); await measure('exito'); await page.evaluate(() => closeTool());
  ok(small.length === 0, 'objetivos ≥24px y chips ≥44px: ' + (small.slice(0, 8).join(' ; ') || 'todos'));
  await page.evaluate(() => goto('aprender'));
  await page.locator('button[aria-label="Abrir ayuda"]').focus();
  await page.keyboard.press('Shift+Tab'); await page.keyboard.press('Tab');
  const oc = await page.evaluate(() => getComputedStyle(document.activeElement).outlineColor);
  ok(oc === 'rgb(204, 46, 52)', 'foco visible en rojo de marca sobre la cabecera: ' + oc);

  // Botones repetidos en listas: el nombre accesible dice a qué elemento se refieren
  const lista = await page.evaluate(() => {
    state.sepaEntries.unshift(newRecord({ situacion: 'Zona con poco flujo', emociones: ['ira'], pensD: 'a', pensC: 'b', accion: 'c' }));
    goto('diario'); renderSepaHistorial();
    const del = document.querySelector('#sepaHistorial [data-action="borrarSepa"]');
    window.__ann = [];
    insertAccion('Pausa consciente');
    return { del: del.getAttribute('aria-label'), visible: del.textContent };
  });
  await page.waitForTimeout(300);
  const anuncios = await page.evaluate(() => window.__ann.map(a => a[1]).join(' | '));
  ok(lista.del.startsWith(lista.visible + ' registro del') && lista.del.includes('Zona con poco flujo'), 'Eliminar del historial nombra el registro: ' + lista.del);
  ok(anuncios.includes('Añadido a la acción: Pausa consciente'), 'los chips de acción anuncian lo añadido: ' + anuncios);

  // Grounding: cada paso se anuncia al lector de pantalla
  await page.evaluate(() => { window.__ann = []; startGrounding(); nextGrounding(); });
  await page.waitForTimeout(300);
  const annG = await page.evaluate(() => window.__ann.map(a => a[1]).join(' | '));
  ok(annG.includes('4 sonidos que puedes escuchar'), 'Grounding anuncia cada paso: ' + annG);
  await page.evaluate(() => Overlays.close('tool'));

  ok(errors.length === 0, 'sin errores de JS: ' + errors.join(' | '));
  await browser.close();
})();
