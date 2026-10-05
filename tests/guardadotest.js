// Reset y Kit con el almacenamiento fallando: lo que no se pudo guardar no se presenta como guardado,
// se conserva lo anterior y, al recuperarse, se vuelve a guardar con normalidad
const { chromium } = require('playwright'); const path = require('path');
const URL = 'file:///' + path.resolve(__dirname, '..', 'index.html').split(String.fromCharCode(92)).join('/');
const ok = (c, m) => console.log((c ? 'PASS ' : 'FAIL ') + m);
(async () => {
  const b = await chromium.launch();
  async function pagina(seed) {
    const p = await b.newPage({ viewport: { width: 820, height: 1180 } }); p.setDefaultTimeout(6000);
    const errs = []; p.on('pageerror', e => errs.push(e.message)); p.errs = errs;
    await p.addInitScript(seed => {
      // Interruptor de fallo: con window.__falla, setItem lanza como un almacenamiento lleno o bloqueado
      const orig = Storage.prototype.setItem;
      Storage.prototype.setItem = function (k, v) { if (window.__falla) throw new DOMException('lleno', 'QuotaExceededError'); return orig.call(this, k, v); };
      if (sessionStorage.getItem('s')) return; sessionStorage.setItem('s', '1');
      localStorage.clear(); localStorage.setItem('wesserWelcomeSeen', '1'); localStorage.setItem('wesserLastView', 'herramientas');
      if (seed) localStorage.setItem('wesserAppState', JSON.stringify(seed));
    }, seed || null);
    await p.goto(URL); await p.waitForTimeout(300);
    return p;
  }
  const guardado = p => p.evaluate(() => JSON.parse(localStorage.getItem('wesserAppState') || '{}'));
  const falla = (p, v) => p.evaluate(v => { window.__falla = v; }, v);
  const avisoError = p => p.evaluate(() => { const t = document.getElementById('toast'); return t.classList.contains('show') && t.classList.contains('error') && /No se ha podido guardar/.test(t.textContent); });
  const pulsado = (p, campo, valor) => p.evaluate(([c, v]) => document.querySelector(`#rc-${c} [data-action="resetChip"][data-value="${CSS.escape(v)}"]`)?.getAttribute('aria-pressed') === 'true', [campo, valor]);
  const chips = (p, campo) => p.evaluate(c => [...document.querySelectorAll(`#rc-${c} [data-action="resetChip"]`)].map(x => x.dataset.value), campo);
  const chip = (p, campo, valor) => p.locator(`#rc-${campo} [data-action="resetChip"][data-value="${valor}"]`).first().click();

  // ---------- A: Reset, cambio de una respuesta ----------
  let p = await pagina();
  await p.evaluate(() => openReset(true)); await p.waitForTimeout(200);
  const [x, y] = await chips(p, 'senal');
  // Sin nada guardado todavía: el primer cambio que falla no se queda marcado ni sale del paso
  await falla(p, true); await chip(p, 'senal', x); await p.waitForTimeout(150);
  ok(!(await pulsado(p, 'senal', x)) && !(await guardado(p)).resetProgress && await p.evaluate(() => resetStep === 1 && resetSenal === ''), 'A0: sin progreso previo, la respuesta que no se guarda no queda marcada y sigue en el paso');
  ok(await avisoError(p), 'A0: aparece el aviso existente «No se ha podido guardar…»');
  await falla(p, false); await chip(p, 'senal', x); await p.waitForTimeout(150);
  ok((await guardado(p)).resetProgress?.senal === x && await pulsado(p, 'senal', x), 'A: con almacenamiento normal, la respuesta se guarda sola');
  await falla(p, true); await chip(p, 'senal', y); await p.waitForTimeout(150);
  ok((await guardado(p)).resetProgress.senal === x, 'A: con el fallo, lo guardado sigue siendo la respuesta anterior');
  ok(await pulsado(p, 'senal', x) && !(await pulsado(p, 'senal', y)) && await p.evaluate(x => resetSenal === x && state.resetProgress.senal === x, x), 'A: en pantalla y en memoria sigue la anterior: no hay falsa impresión de guardado');

  // ---------- B: Reset, cambio de paso ----------
  await p.locator('#resetOverlay button[onclick="continuarReconoce()"]').click(); await p.waitForTimeout(200);
  ok((await guardado(p)).resetProgress.step === 1 && await p.evaluate(() => resetStep === 1 && state.resetProgress.step === 1), 'B: al fallar «continuar», el paso guardado y el mostrado siguen siendo el 1');
  ok(await p.evaluate(x => document.querySelector(`#rc-senal [data-value="${CSS.escape(x)}"]`) !== null, x), 'B: sigue en pantalla el paso 1, no uno avanzado a medias');

  // ---------- E: recuperación ----------
  await falla(p, false);
  await chip(p, 'senal', y); await p.waitForTimeout(150);
  ok((await guardado(p)).resetProgress.senal === y, 'E: al recuperarse, el siguiente cambio se guarda');
  await p.locator('#resetOverlay button[onclick="continuarReconoce()"]').click(); await p.waitForTimeout(200);
  ok((await guardado(p)).resetProgress.step === 2 && await p.evaluate(() => resetStep === 2), 'E: al recuperarse, cambiar de paso funciona y se guarda');
  await falla(p, true); await p.evaluate(() => { document.getElementById('toast').classList.remove('show'); });
  await chip(p, 'contexto', (await chips(p, 'contexto'))[0]); await p.waitForTimeout(150);
  ok(await avisoError(p), 'E: si vuelve a fallar después de recuperarse, se avisa otra vez');
  ok(p.errs.length === 0, 'A/B/E sin errores de JS ' + p.errs.join(' | '));
  await p.close();

  // ---------- C: contador ----------
  const progreso = { step: 5, senal: 'Me cuesta arrancar', examResultado: '', examRendimiento: '', aspecto1: '', aspecto2: '', micro: 'Simplificar la apertura', stops: 3, pacto: '', aprendizaje: '', ajusteNuevo: '', observacion: '' };
  p = await pagina({ dataVersion: 3, resetProgress: progreso });
  await p.evaluate(() => openReset(true)); await p.waitForTimeout(250);
  ok(await p.evaluate(() => resetStep === 5 && resetStops === 3), 'C: el Reset se reanuda en el contador con 3/10');
  await falla(p, true);
  await p.locator('#incrementStopBtn').click(); await p.waitForTimeout(450);
  ok((await guardado(p)).resetProgress.stops === 3 && await p.evaluate(() => resetStops === 3 && state.resetProgress.stops === 3), 'C: +1 con fallo: guardado, memoria y pantalla siguen en 3');
  ok(!(await p.evaluate(() => document.getElementById('srStatus').textContent)).includes('4 paradas'), 'C: no se anuncia «4 paradas»');
  ok(await p.evaluate(() => /\b3\b/.test(document.getElementById('resetBody').textContent) && !/\b4 de 10\b/.test(document.getElementById('resetBody').textContent)), 'C: la pantalla muestra 3, no 4');
  await falla(p, false); await p.locator('#incrementStopBtn').click(); await p.waitForTimeout(200);
  ok((await guardado(p)).resetProgress.stops === 4, 'C/E: al recuperarse, +1 guarda 4');
  await falla(p, true);
  await p.evaluate(() => decrementStop()); await p.waitForTimeout(150);
  ok((await guardado(p)).resetProgress.stops === 4 && await p.evaluate(() => resetStops === 4), 'C: «Deshacer» con fallo tampoco cambia lo guardado ni lo mostrado');
  await p.evaluate(() => { marcarTodasParadas(); }); await p.locator('#confirmOk').click(); await p.waitForTimeout(250);
  ok((await guardado(p)).resetProgress.stops === 4 && await p.evaluate(() => resetStops === 4 && resetStep === 5), 'C: «Ya he hecho las 10» con fallo no marca 10 ni avanza');
  await falla(p, false); await p.evaluate(() => decrementStop()); await p.waitForTimeout(150);
  ok((await guardado(p)).resetProgress.stops === 3, 'C/E: al recuperarse, «Deshacer» funciona');
  ok(p.errs.length === 0, 'C sin errores de JS ' + p.errs.join(' | '));
  await p.close();

  // ---------- D: Kit ----------
  p = await pagina();
  await p.evaluate(() => { openReset(); openKit(1); }); await p.waitForTimeout(200);
  const [s1, s2] = await chips(p, 'kitSenales');
  await chip(p, 'kitSenales', s1); await p.waitForTimeout(150);
  ok(JSON.stringify((await guardado(p)).kitSenales) === JSON.stringify([s1]), 'D: con almacenamiento normal, la señal del Kit se guarda sola');
  await falla(p, true); await chip(p, 'kitSenales', s2); await p.waitForTimeout(150);
  ok(JSON.stringify((await guardado(p)).kitSenales) === JSON.stringify([s1]) && await p.evaluate(s1 => state.kitSenales.length === 1 && state.kitSenales[0] === s1, s1) && !(await pulsado(p, 'kitSenales', s2)), 'D: señal con fallo: sigue la guardada, en memoria y en pantalla');
  await p.evaluate(() => kitIr(2)); await p.waitForTimeout(150);
  const h = (await chips(p, 'kitHerramienta'))[0];
  await chip(p, 'kitHerramienta', h); await p.waitForTimeout(150);
  ok(!(await guardado(p)).kitHerramienta && await p.evaluate(() => state.kitHerramienta === '') && !(await pulsado(p, 'kitHerramienta', h)), 'D: herramienta con fallo: no se guarda ni queda marcada');
  ok(await p.evaluate(() => !document.querySelector('#qlRow .ql-kit:not([hidden])') || !state.kitHerramienta), 'D: «Activar mi plan» no aparece con una herramienta que no se guardó');
  await p.evaluate(() => kitIr(3)); await p.waitForTimeout(150);
  const a = (await chips(p, 'kitAjuste'))[0];
  await chip(p, 'kitAjuste', a); await p.waitForTimeout(150);
  ok(!(await guardado(p)).kitAjuste && await p.evaluate(() => state.kitAjuste === ''), 'D: ajuste con fallo: no se guarda');
  await p.evaluate(() => kitIr(4)); await p.waitForTimeout(150);
  await p.fill('#kitPersonaInput', 'Marta'); await p.waitForTimeout(700);   // guardado diferido
  ok(!(await guardado(p)).kitPersona && await p.evaluate(() => document.getElementById('kitPersonaInput').value === 'Marta'), 'D: persona de apoyo con fallo: no sustituye lo guardado y no se borra lo escrito');
  await p.locator('#resetOverlay button[onclick="kitSiguiente()"]').click(); await p.waitForTimeout(200);
  ok(await p.evaluate(() => kitPaso === 4 && !/Plan guardado/.test(document.getElementById('toastMsg').textContent)), 'D: «Guardar mi plan» con fallo no dice «Plan guardado» y no sale del paso');
  // E: recuperación del guardado diferido al ocultar la página
  await falla(p, false);
  await p.evaluate(() => { Object.defineProperty(document, 'visibilityState', { value: 'hidden', configurable: true }); document.dispatchEvent(new Event('visibilitychange')); });
  ok((await guardado(p)).kitPersona === 'Marta', 'E: el guardado diferido que falló se reintenta al ocultar la página');
  await p.evaluate(() => { Object.defineProperty(document, 'visibilityState', { value: 'visible', configurable: true }); });
  await p.evaluate(() => kitIr(2)); await chip(p, 'kitHerramienta', h); await p.waitForTimeout(150);
  ok((await guardado(p)).kitHerramienta === h, 'E: al recuperarse, la herramienta del Kit se guarda');
  ok(p.errs.length === 0, 'D/E sin errores de JS ' + p.errs.join(' | '));
  await p.close(); await b.close();
})();
