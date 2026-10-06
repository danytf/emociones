// Dos pestañas abiertas: una pestaña con una copia vieja no puede pisar lo guardado en otra ni devolver datos borrados
const { chromium } = require('playwright'); const path = require('path');
const URL = 'file:///' + path.resolve(__dirname, '..', 'index.html').split(String.fromCharCode(92)).join('/');
const ok = (c, m) => console.log((c ? 'PASS ' : 'FAIL ') + m);
(async () => {
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 820, height: 1180 } });
  await ctx.addInitScript(() => { try { localStorage.setItem('wesserWelcomeSeen', '1'); } catch (e) {} });
  const errs = []; const recargas = { A: 0, B: 0 };
  const abrir = async n => { const p = await ctx.newPage(); p.on('pageerror', e => errs.push(n + ' ' + e.message)); p.on('load', () => recargas[n]++); await p.goto(URL); await p.waitForTimeout(250); return p; };
  const A = await abrir('A'), B = await abrir('B');
  const guardado = () => A.evaluate(() => JSON.parse(localStorage.getItem('wesserAppState') || '{}'));
  const registroEnA = async texto => {
    await A.evaluate(() => goto('diario'));
    await A.selectOption('#sepaSituacion', 'Zona con poco flujo'); await A.selectOption('#sepaPensDestructivo', 'No vale la pena');
    await A.locator('#sepaEmocionChips [data-id="miedo"]').click(); await A.fill('#sepaPensConstructivo', 'útil'); await A.fill('#sepaAccion', texto);
    await A.locator('#sepaSaveBtn').click(); await A.waitForTimeout(150);
  };

  // 1. A guarda; B (abierta antes) toca algo que guarda: no debe borrar lo de A
  recargas.A = recargas.B = 0;
  await registroEnA('respirar'); await B.waitForTimeout(600);
  ok(recargas.B === 1 && await B.evaluate(() => state.sepaEntries.length === 1), 'B se pone al día sola con el registro guardado en A');
  await B.locator('#themeToggle').click(); await B.waitForTimeout(200);
  ok((await guardado()).sepaEntries.length === 1, 'cambiar el tema en B ya no borra el registro de A');

  // 2. Guardado diferido pendiente en B cuando A guarda: B no reescribe su copia vieja al recargar
  await B.evaluate(() => { state.kitPersona = 'copia vieja'; saveSoon(); });
  recargas.B = 0;
  await registroEnA('pausa'); await B.waitForTimeout(900);
  const g2 = await guardado();
  ok(g2.sepaEntries.length === 2 && g2.kitPersona !== 'copia vieja' && recargas.B === 1, 'un guardado pendiente en B no pisa lo que A acaba de guardar');

  // 3. «Borrar todos los datos» en A: B no devuelve los datos borrados
  recargas.B = 0;
  await A.evaluate(() => { openHelp(); borrarTodosDatos(); }); await A.locator('#confirmOk').waitFor();
  await Promise.all([A.waitForEvent('load'), A.locator('#confirmOk').click()]); await B.waitForTimeout(800);
  ok(recargas.B >= 1 && await B.evaluate(() => state.sepaEntries.length === 0), 'tras borrar en A, B también queda sin los datos');
  await B.evaluate(() => { openMiMotivo(); }); await B.fill('#miMotivoInput', 'Por la causa'); await B.locator('#toolBody button:has-text("Guardar")').click(); await B.waitForTimeout(300);
  const g3 = await guardado();
  ok((g3.sepaEntries || []).length === 0 && g3.miMotivo === 'Por la causa', 'guardar después en B no resucita los registros borrados');

  // 4. Sin bucles: con todo quieto, ninguna pestaña sigue recargándose
  recargas.A = recargas.B = 0; await A.waitForTimeout(1500);
  ok(recargas.A === 0 && recargas.B <= 1, `sin recargas en bucle (A: ${recargas.A}, B: ${recargas.B})`);
  // 5. Cambios que no son los datos (p. ej., la última sección) no recargan la otra pestaña
  recargas.B = 0; await A.evaluate(() => goto('aprender')); await B.waitForTimeout(500);
  ok(recargas.B === 0, 'cambiar de sección en A no recarga B');
  ok(errs.length === 0, 'sin errores de JS ' + errs.join(' | '));
  await b.close();
})();
