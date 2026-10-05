// Aviso «¿Cerrar sin guardar?» con interacciones reales (Escape y gesto atrás), nunca cerrando por código.
// Casos: A escribir y cerrar → avisa · B guardar y cerrar → no avisa · C reabrir, cambiar y cerrar → avisa
//        D cambiar y volver a dejar lo guardado → no avisa. En los formularios [data-guarda] y en uno por texto escrito.
const { chromium } = require('playwright'); const path = require('path');
const URL = 'file:///' + path.resolve(__dirname, '..', 'index.html').split(String.fromCharCode(92)).join('/');
const ok = (c, m) => console.log((c ? 'PASS ' : 'FAIL ') + m);
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 820, height: 1180 } }); p.setDefaultTimeout(6000);
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.addInitScript(() => { if (sessionStorage.getItem('s')) return; sessionStorage.setItem('s', '1'); localStorage.clear(); localStorage.setItem('wesserWelcomeSeen', '1'); localStorage.setItem('wesserLastView', 'herramientas'); });
  await p.goto(URL); await p.waitForTimeout(300);
  const top = () => p.evaluate(() => Overlays.top());
  const aviso = () => p.evaluate(() => Overlays.top() === 'confirm' && /sin guardar/.test(document.getElementById('confirmTitle').textContent));
  // Cierra como lo haría una persona: Escape o gesto atrás
  const cerrar = async (como) => { if (como === 'atras') await p.goBack().catch(() => {}); else await p.keyboard.press('Escape'); await p.waitForTimeout(400); };
  const fila = t => p.locator(`#view-herramientas .trow:has-text("${t}")`).click();

  // ---- Mi motivo ----
  await fila('Mi motivo'); await p.fill('#miMotivoInput', 'Para aprender');
  await cerrar('esc'); ok(await aviso(), 'Mi motivo A: escribir y cerrar → avisa');
  await p.locator('#confirmCancel').click(); await p.waitForTimeout(200);
  await p.locator('#toolBody button:has-text("Guardar")').click(); await p.waitForTimeout(200);
  await cerrar('atras'); ok(await top() === null, 'Mi motivo B: guardar y cerrar con atrás → no avisa');
  await fila('Mi motivo'); await p.fill('#miMotivoInput', 'Para aprender y ahorrar');
  await cerrar('atras'); ok(await aviso(), 'Mi motivo C: reabrir, cambiar y cerrar → avisa');
  await p.locator('#confirmOk').click(); await p.waitForTimeout(400);
  ok(await top() === null && await p.evaluate(() => state.miMotivo === 'Para aprender'), 'Mi motivo C: «Cerrar sin guardar» descarta el cambio y conserva lo guardado');
  await fila('Mi motivo'); await p.fill('#miMotivoInput', 'otra cosa'); await p.fill('#miMotivoInput', 'Para aprender');
  await cerrar('esc'); ok(await top() === null, 'Mi motivo D: cambiar y volver a lo guardado → no avisa');

  // ---- Checkpoint (nuevo y edición) ----
  await fila('Checkpoint'); await p.fill('#cpNota', 'cansancio');
  await cerrar('esc'); ok(await aviso(), 'Checkpoint A: escribir y cerrar → avisa');
  await p.locator('#confirmCancel').click(); await p.waitForTimeout(200);
  await p.locator('#cpDecisionRow [aria-pressed]').first().click();
  await p.locator('#toolBody button:has-text("Guardar")').first().click(); await p.waitForTimeout(400);
  await cerrar('esc'); ok(await top() === null && await p.evaluate(() => state.checkpoints.length === 1), 'Checkpoint B: guardar y cerrar → no avisa');
  const editar = () => p.locator('#checkpointHistorial [data-action="editarCheckpoint"]').first().click();
  await editar(); await p.waitForTimeout(200);
  await cerrar('atras'); ok(await top() === null, 'Checkpoint: abrir la edición y cerrar sin tocar nada → no avisa');
  await editar(); await p.waitForTimeout(200); await p.fill('#cpNota', 'cansancio y prisa');
  await cerrar('esc'); ok(await aviso(), 'Checkpoint C: reabrir, cambiar y cerrar → avisa');
  await p.locator('#confirmOk').click(); await p.waitForTimeout(400);
  await editar(); await p.waitForTimeout(200); await p.fill('#cpNota', 'otra'); await p.fill('#cpNota', 'cansancio');
  await cerrar('atras'); ok(await top() === null, 'Checkpoint D: cambiar y volver a lo guardado → no avisa');

  // ---- ¿Qué ha funcionado? ----
  await fila('¿Qué ha funcionado?');
  await p.locator('#exitoChips [aria-pressed]').first().click();
  await cerrar('esc'); ok(await aviso(), '¿Qué ha funcionado? A: elegir y cerrar → avisa');
  await p.locator('#confirmCancel').click(); await p.waitForTimeout(200);
  await p.locator('#toolBody button:has-text("Guardar")').first().click(); await p.waitForTimeout(300);
  await cerrar('esc'); ok(await top() === null && await p.evaluate(() => state.exitos.length === 1), '¿Qué ha funcionado? B: guardar y cerrar → no avisa');
  await fila('¿Qué ha funcionado?'); await p.fill('#exitoRepetirInput', 'repetirlo');
  await cerrar('atras'); ok(await aviso(), '¿Qué ha funcionado? C: reabrir, escribir y cerrar → avisa');
  await p.locator('#confirmOk').click(); await p.waitForTimeout(400);
  // Las opciones son de elección única (no se desmarcan): el caso D se hace con su campo de texto
  await fila('¿Qué ha funcionado?'); await p.fill('#exitoRepetirInput', 'algo'); await p.fill('#exitoRepetirInput', '');
  await cerrar('esc'); ok(await top() === null, '¿Qué ha funcionado? D: escribir y volver a dejarlo vacío → no avisa');

  // ---- Recordatorio de confianza (aviso por texto escrito) ----
  await fila('Recordatorio de confianza'); await p.fill('#anchorWordInput', 'Calma');
  await cerrar('esc'); ok(await aviso(), 'Recordatorio de confianza A: escribir y cerrar → avisa');
  await p.locator('#confirmCancel').click(); await p.waitForTimeout(200);
  await p.fill('#anchorMemoryInput', 'Aquel día en la plaza');
  await p.locator('#toolBody button:has-text("Guardar recordatorio")').click(); await p.waitForTimeout(300);
  await cerrar('atras'); ok(await top() === null && await p.evaluate(() => state.confidenceAnchors.length === 1), 'Recordatorio de confianza B: guardar y cerrar → no avisa');
  await fila('Recordatorio de confianza'); await p.fill('#anchorWordInput', 'Foco');
  await cerrar('esc'); ok(await aviso(), 'Recordatorio de confianza C: reabrir, escribir y cerrar → avisa');
  await p.locator('#confirmOk').click(); await p.waitForTimeout(400);
  await fila('Recordatorio de confianza'); await p.fill('#anchorWordInput', 'x'); await p.fill('#anchorWordInput', '');
  await cerrar('esc'); ok(await top() === null, 'Recordatorio de confianza D: escribir y borrarlo → no avisa');

  ok(await p.evaluate(() => !!document.querySelector('.view.active')), 'tras todos los cierres sigue dentro de la app');
  ok(errs.length === 0, 'sin errores de JS ' + errs.join(' | '));
  await b.close();
})();
