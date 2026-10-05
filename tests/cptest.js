// Checkpoint: los niveles empiezan «Sin indicar» y hay que elegirlos; al editar se conservan los guardados
const { chromium } = require('playwright'); const path = require('path');
const URL = 'file:///' + path.resolve(__dirname, '..', 'index.html').split(String.fromCharCode(92)).join('/');
const ok = (c, m) => console.log((c ? 'PASS ' : 'FAIL ') + m);
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 820, height: 1180 } }); p.setDefaultTimeout(6000);
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.addInitScript(() => { if (sessionStorage.getItem('s')) return; sessionStorage.setItem('s', '1'); localStorage.clear(); localStorage.setItem('wesserWelcomeSeen', '1'); localStorage.setItem('wesserLastView', 'herramientas'); });
  await p.goto(URL); await p.waitForTimeout(300);
  const abrir = () => p.locator('#view-herramientas .trow:has-text("Checkpoint de mitad de turno")').click();
  const guardar = () => p.locator('#toolBody button:has-text("checkpoint")').click();
  const nivel = id => p.evaluate(id => { const el = document.getElementById(id); return { valor: el.value, visible: document.getElementById(id + 'Val').textContent, aria: el.getAttribute('aria-valuetext'), vacio: el.classList.contains('sin-indicar'), invalido: el.getAttribute('aria-invalid') === 'true' }; }, id);
  const errorDe = id => p.evaluate(id => { const el = document.getElementById(id); const e = el.dataset.errorId && document.getElementById(el.dataset.errorId); return e ? e.textContent : ''; }, id);
  const guardados = () => p.evaluate(() => JSON.parse(localStorage.getItem('wesserAppState') || '{"checkpoints":[]}').checkpoints || []);

  // Estado inicial: «Sin indicar», distinto de un valor real para la vista y para el lector de pantalla
  await abrir();
  const f0 = await nivel('cpFatiga'), e0 = await nivel('cpEmocional');
  ok(f0.valor === '0' && f0.visible === 'Sin indicar' && f0.aria === 'Sin indicar' && f0.vacio && e0.valor === '0' && e0.visible === 'Sin indicar' && e0.vacio, 'nuevo: fatiga y activación empiezan «Sin indicar» (texto, aria-valuetext y tirador vacío)');

  // A: sin tocar los niveles, con decisión → no se guarda y pide los niveles
  await p.locator('#cpDecisionRow button:has-text("Sigo igual")').click();
  await guardar(); await p.waitForTimeout(200);
  ok((await guardados()).length === 0 && await p.evaluate(() => Overlays.top() === 'tool'), 'A: sin niveles no se guarda y el formulario sigue abierto');
  ok(/fatiga/.test(await errorDe('cpFatiga')) && /activación/.test(await errorDe('cpEmocional')) && (await nivel('cpFatiga')).invalido, 'A: errores en línea en fatiga y activación');
  ok(await p.evaluate(() => document.activeElement.id) === 'cpFatiga', 'A: el foco va al primer nivel que falta (fatiga)');
  ok(await p.evaluate(() => !document.querySelector('.modal-back.active, [role="alertdialog"]:not([hidden]) #confirmTitle') || Overlays.top() !== 'confirm'), 'A: sin ventana modal ni alert');

  // B: solo fatiga (con teclado) → no se guarda y pide activación; el foco va a activación
  await p.locator('#cpFatiga').focus(); await p.keyboard.press('ArrowRight');
  const f1 = await nivel('cpFatiga');
  ok(f1.valor === '1' && f1.visible === '1/10' && f1.aria === '1 de 10' && !f1.vacio && await errorDe('cpFatiga') === '', 'teclado: desde «Sin indicar», flecha derecha elige 1/10 («1 de 10») y retira el error');
  await p.locator('#cpFatiga').fill('8');
  await guardar(); await p.waitForTimeout(200);
  ok((await guardados()).length === 0 && await errorDe('cpFatiga') === '' && /activación/.test(await errorDe('cpEmocional')), 'B: solo fatiga → no se guarda y se pide la activación');
  ok(await p.evaluate(() => document.activeElement.id) === 'cpEmocional', 'B: el foco va a activación');

  // C: ambos (8 y 3) + decisión → se guardan exactamente esos valores
  await p.locator('#cpEmocional').fill('3');
  ok((await nivel('cpEmocional')).visible === '3/10' && (await nivel('cpEmocional')).aria === '3 de 10', 'el valor elegido se muestra como «3/10» y se anuncia «3 de 10»');
  await guardar(); await p.waitForTimeout(300);
  let g = await guardados();
  ok(g.length === 1 && g[0].fatiga === 8 && g[0].emocional === 3 && g[0].decision === 'Sigo igual', 'C: se guarda exactamente fatiga 8 y emocional 3');

  // Decisión sigue siendo obligatoria aunque los niveles estén indicados
  await abrir(); await p.locator('#cpFatiga').fill('5'); await p.locator('#cpEmocional').fill('5');
  await guardar(); await p.waitForTimeout(200);
  ok((await guardados()).length === 1 && await p.evaluate(() => (document.querySelector('#cpDecisionRow + .field-error') || {}).textContent) === 'Elige qué vas a hacer ahora.', 'con niveles pero sin decisión: sigue sin guardarse y lo indica');
  await p.evaluate(() => { Overlays.close('tool'); }); await p.waitForTimeout(300);

  // D: editar uno existente (7 y 4): se cargan, cuentan como indicados y solo cambia lo tocado
  await p.evaluate(() => { const r = newRecord({ fatiga: 7, emocional: 4, nota: 'previo', decision: 'Hago una pausa' }); state.checkpoints = [r, ...state.checkpoints]; save(); renderCheckpointHistorial(); });
  await p.locator('#checkpointHistorial [data-action="editarCheckpoint"]').first().click(); await p.waitForTimeout(200);
  const f7 = await nivel('cpFatiga'), e4 = await nivel('cpEmocional');
  ok(f7.valor === '7' && f7.visible === '7/10' && !f7.vacio && e4.valor === '4' && e4.visible === '4/10' && e4.aria === '4 de 10', 'D: al editar, 7 y 4 aparecen seleccionados');
  await p.locator('#toolBody button:has-text("Actualizar checkpoint")').click(); await p.waitForTimeout(300);
  g = await guardados();
  ok(g[0].fatiga === 7 && g[0].emocional === 4 && await p.evaluate(() => Overlays.top() === null), 'D: se puede guardar la edición sin mover los niveles');
  await p.locator('#checkpointHistorial [data-action="editarCheckpoint"]').first().click(); await p.waitForTimeout(200);
  await p.locator('#cpEmocional').fill('9');
  await p.locator('#toolBody button:has-text("Actualizar checkpoint")').click(); await p.waitForTimeout(300);
  g = await guardados();
  ok(g.length === 2 && g[0].fatiga === 7 && g[0].emocional === 9 && Number.isInteger(g[0].fatiga) && g[1].fatiga === 8 && g[1].emocional === 3, 'D: cambiar solo la activación conserva la fatiga (7) y no toca los demás');

  // Compatibilidad: un checkpoint antiguo guardado con valores 1–10 se lee y se edita igual
  ok(await p.evaluate(() => normalizeState({ ...state, checkpoints: [{ id: 99, createdAt: new Date().toISOString(), fatiga: 2, emocional: 10, nota: '', decision: 'Sigo igual' }] }).checkpoints[0].fatiga === 2), 'compatibilidad: los checkpoints existentes (1–10) se conservan');
  ok(errs.length === 0, 'sin errores de JS ' + errs.join(' | '));
  await b.close();
})();
