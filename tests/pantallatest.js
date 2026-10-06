// La pantalla no se apaga durante los ejercicios guiados (Suspiro, Tense & Release, Recordatorio de confianza)
// y se suelta al terminar o cerrar. Se simula navigator.wakeLock para contar peticiones y liberaciones.
const { chromium } = require('playwright'); const path = require('path');
const URL = 'file:///' + path.resolve(__dirname, '..', 'index.html').split(String.fromCharCode(92)).join('/');
const ok = (c, m) => console.log((c ? 'PASS ' : 'FAIL ') + m);
(async () => {
  const b = await chromium.launch();
  async function pagina(conApi) {
    const p = await b.newPage({ viewport: { width: 375, height: 812 } }); p.setDefaultTimeout(6000); p.errs = []; p.on('pageerror', e => p.errs.push(e.message));
    await p.addInitScript(conApi => {
      if (!sessionStorage.getItem('s')) { sessionStorage.setItem('s', '1'); localStorage.clear(); localStorage.setItem('wesserWelcomeSeen', '1'); localStorage.setItem('wesserLastView', 'herramientas'); }
      if (!conApi) { try { Object.defineProperty(Navigator.prototype, 'wakeLock', { get: undefined, configurable: true }); delete Navigator.prototype.wakeLock; } catch (e) {} return; }
      window.__wl = { pedidas: 0, activas: 0, ultima: null };
      const api = { request: async () => {
        window.__wl.pedidas++; window.__wl.activas++;
        const ev = new EventTarget(); let suelta = false;
        const s = { addEventListener: (...a) => ev.addEventListener(...a), release: async () => { if (suelta) return; suelta = true; window.__wl.activas--; ev.dispatchEvent(new Event('release')); } };
        window.__wl.ultima = s; return s;
      } };
      Object.defineProperty(Navigator.prototype, 'wakeLock', { get: () => api, configurable: true });
    }, conApi);
    await p.goto(URL); await p.waitForTimeout(250); return p;
  }
  const wl = p => p.evaluate(() => ({ ...window.__wl, ultima: undefined }));
  const top = p => p.evaluate(() => Overlays.top());

  let p = await pagina(true);
  // Suspiro desde «Voy a mil»
  await p.locator('#qlRow .ql-btn:has-text("Voy a mil")').click(); await p.waitForTimeout(150);
  let w = await wl(p); ok(w.pedidas === 1 && w.activas === 1, '«Voy a mil»: el Suspiro mantiene la pantalla encendida');
  await p.locator('#toolBody button:has-text("Terminar")').click(); await p.waitForTimeout(200);
  w = await wl(p); ok(w.activas === 0 && await top(p) === null, '«Terminar» suelta la pantalla');
  // Al completarse también se suelta
  await p.evaluate(() => startBreath(60)); await p.waitForTimeout(100);
  await p.evaluate(() => showToolDone('Suspiro fisiológico', () => startBreath(60))); await p.waitForTimeout(100);
  w = await wl(p); ok(w.activas === 0, 'al completar el Suspiro se suelta');
  await p.evaluate(() => closeTool()); await p.waitForTimeout(300);
  // Tense & Release: una sola petición activa durante todas las fases; Escape la suelta
  await p.evaluate(() => startTense()); await p.waitForTimeout(150);
  await p.evaluate(() => { runTensePhase('release', 5); runTensePhase('tense', 5); }); await p.waitForTimeout(100);
  w = await wl(p); ok(w.activas === 1, 'Tense & Release: pantalla encendida, sin acumular peticiones entre fases');
  await p.keyboard.press('Escape'); await p.waitForTimeout(300);
  w = await wl(p); ok(w.activas === 0 && await top(p) === null, 'cerrar Tense & Release con Escape suelta la pantalla');
  // Recordatorio de confianza (30 s)
  await p.evaluate(() => { state.confidenceAnchors = [{ word: 'Calma', memory: 'Aquel día' }]; runAnchorGuide(0); }); await p.waitForTimeout(150);
  w = await wl(p); ok(w.activas === 1, 'Recordatorio de confianza: pantalla encendida');
  await p.goBack(); await p.waitForTimeout(450);
  w = await wl(p); ok(w.activas === 0 && await top(p) === null, 'el gesto atrás también la suelta');
  // Al ocultar la pestaña el navegador la suelta; al volver se pide otra vez solo si el ejercicio sigue
  await p.evaluate(() => startBreath(60)); await p.waitForTimeout(100);
  const pedidasAntes = (await wl(p)).pedidas;
  await p.evaluate(async () => { await window.__wl.ultima.release(); });   // lo que hace el navegador al ocultar
  await p.evaluate(() => { Object.defineProperty(document, 'visibilityState', { value: 'visible', configurable: true }); document.dispatchEvent(new Event('visibilitychange')); }); await p.waitForTimeout(100);
  w = await wl(p); ok(w.pedidas === pedidasAntes + 1 && w.activas === 1, 'al volver a la pestaña con el Suspiro en marcha se vuelve a pedir');
  await p.evaluate(() => closeTool()); await p.waitForTimeout(300);
  const tras = (await wl(p)).pedidas;
  await p.evaluate(() => document.dispatchEvent(new Event('visibilitychange'))); await p.waitForTimeout(100);
  ok((await wl(p)).pedidas === tras && (await wl(p)).activas === 0, 'con el ejercicio cerrado, volver a la pestaña no la pide');
  // Herramientas sin temporizador no la piden
  await p.evaluate(() => startMomentoDecidir()); await p.waitForTimeout(100);
  ok((await wl(p)).activas === 0, 'herramientas sin temporizador no mantienen la pantalla');
  ok(p.errs.length === 0, 'sin errores de JS ' + p.errs.join(' | '));
  await p.close();

  // Navegador sin la API: todo funciona igual
  p = await pagina(false);
  const sinApi = await p.evaluate(() => !('wakeLock' in navigator));
  await p.locator('#qlRow .ql-btn:has-text("Voy a mil")').click(); await p.waitForTimeout(1300);
  const corre = await p.evaluate(() => Number(document.getElementById('breathTimer').textContent) < 60);
  await p.locator('#toolBody button:has-text("Terminar")').click(); await p.waitForTimeout(200);
  ok(sinApi && corre && await top(p) === null && p.errs.length === 0, 'sin wakeLock en el navegador, el Suspiro funciona igual y sin errores');
  await b.close();
})();
