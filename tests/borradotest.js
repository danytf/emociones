// «Borrar todos los datos»: solo recarga si ha comprobado que las claves de la app ya no están;
// si falla, no recarga, avisa y no deja un borrado a medias; nunca toca datos ajenos
const { chromium } = require('playwright'); const path = require('path');
const URL = 'file:///' + path.resolve(__dirname, '..', 'index.html').split(String.fromCharCode(92)).join('/');
const ok = (c, m) => console.log((c ? 'PASS ' : 'FAIL ') + m);
const CLAVES = ['wesserAppState', 'wesserLastView', 'wesserWelcomeSeen', 'wesserSepaIntro'];
(async () => {
  const b = await chromium.launch();
  // fallo: null | 'lanza' (removeItem lanza en la 2.ª clave) | 'ignora' (removeItem no hace nada en la 2.ª) | 'todo' (además falla setItem)
  async function pagina(fallo) {
    const p = await b.newPage(); p.setDefaultTimeout(6000); const errs = []; p.on('pageerror', e => errs.push(e.message)); p.errs = errs;
    await p.addInitScript(fallo => {
      if (fallo) {
        const rm = Storage.prototype.removeItem, set = Storage.prototype.setItem;
        Storage.prototype.removeItem = function (k) {
          if (window.__activo && k === 'wesserLastView') { if (fallo === 'ignora') return; throw new DOMException('bloqueado', 'SecurityError'); }
          return rm.call(this, k);
        };
        Storage.prototype.setItem = function (k, v) { if (window.__activo && fallo === 'todo') throw new DOMException('bloqueado', 'SecurityError'); return set.call(this, k, v); };
      }
      if (sessionStorage.getItem('s')) return; sessionStorage.setItem('s', '1');
      localStorage.clear();
      localStorage.setItem('otraAppDato', 'no tocar');
      localStorage.setItem('wesserWelcomeSeen', '1'); localStorage.setItem('wesserLastView', 'diario'); localStorage.setItem('wesserSepaIntro', 'closed');
      localStorage.setItem('wesserAppState', JSON.stringify({ dataVersion: 3, miMotivo: 'Para aprender', kitPersona: 'Marta',
        sepaEntries: [{ id: 1, createdAt: new Date().toISOString(), situacion: 'Zona con poco flujo', emociones: ['miedo'], pensD: 'a', pensC: 'b', accion: 'Pausa consciente' }] }));
    }, fallo || null);
    await p.goto(URL); await p.waitForTimeout(300);
    return p;
  }
  const claves = p => p.evaluate(C => Object.fromEntries(C.map(k => [k, localStorage.getItem(k)])), CLAVES);
  const pulsarBorrar = async p => { await p.evaluate(() => { openHelp(); borrarTodosDatos(); }); await p.locator('#confirmOk').waitFor(); };
  const recarga = async (p, fn) => { let r = false; const h = () => { r = true; }; p.on('load', h); await fn(); await p.waitForTimeout(1200); p.off('load', h); return r; };

  // ---- Borrado normal ----
  let p = await pagina();
  // Guardado diferido pendiente justo antes de borrar: no debe reescribir los datos al recargar
  await p.evaluate(() => { state.kitPersona = 'Escrito justo antes'; saveSoon(); });
  await pulsarBorrar(p);
  const recargo = await recarga(p, () => p.locator('#confirmOk').click());
  const despues = await p.evaluate(() => ({ estado: localStorage.getItem('wesserAppState'), sepa: localStorage.getItem('wesserSepaIntro'), ajena: localStorage.getItem('otraAppDato'),
    entradas: state.sepaEntries.length, motivo: state.miMotivo, persona: state.kitPersona, bienvenida: Overlays.top() === 'modal' && /bienvenida/i.test(document.getElementById('modalSheet').textContent) }));
  ok(recargo, 'borrado normal: la página se recarga');
  ok((despues.estado === null || !/Para aprender|Marta|Escrito justo antes|Pausa consciente/.test(despues.estado)) && despues.entradas === 0 && despues.motivo === '' && despues.persona === '', 'tras recargar no queda nada de los datos anteriores');
  // Al arrancar como nueva, la app vuelve a escribir su valor por defecto («open»): no debe quedar el anterior («closed»)
  ok(despues.sepa !== 'closed', `la preferencia anterior de la explicación del Diario no se conserva (${despues.sepa})`);
  ok(despues.bienvenida, 'la bienvenida vuelve a aparecer, como en el primer uso');
  ok(despues.ajena === 'no tocar', 'una clave ajena a la app (otraAppDato) no se toca');
  ok(p.errs.length === 0, 'borrado normal sin errores de JS ' + p.errs.join(' | '));
  await p.close();

  // ---- Fallos ----
  for (const [fallo, nombre] of [['lanza', 'removeItem lanza una excepción'], ['ignora', 'removeItem no lanza pero la clave sigue ahí']]) {
    p = await pagina(fallo);
    const antes = await claves(p);
    await p.evaluate(() => { window.__activo = true; });
    await pulsarBorrar(p);
    const r = await recarga(p, () => p.locator('#confirmOk').click());
    await p.evaluate(() => { window.__activo = false; });
    const msg = await p.evaluate(() => ({ t: document.getElementById('datosMsg').textContent, error: document.getElementById('datosMsg').className === 'field-error', toast: document.getElementById('toastMsg').textContent }));
    ok(!r, `${nombre}: no se recarga`);
    ok(msg.error && /No se han podido borrar tus datos/.test(msg.t) && /Siguen guardados/.test(msg.t) && !/borrad[oa]s? correctamente/i.test(msg.t + msg.toast), `${nombre}: aviso de error claro («siguen guardados»), sin falso éxito`);
    ok(JSON.stringify(await claves(p)) === JSON.stringify(antes), `${nombre}: no queda un borrado a medias (todas las claves como antes)`);
    ok(await p.evaluate(() => state.sepaEntries.length === 1 && state.miMotivo === 'Para aprender'), `${nombre}: la app sigue con sus datos`);
    ok(p.errs.length === 0, `${nombre}: sin errores de JS ` + p.errs.join(' | '));
    await p.close();
  }

  // ---- Fallo también al restaurar: se dice que el borrado quedó a medias ----
  p = await pagina('todo');
  await p.evaluate(() => { window.__activo = true; });
  await pulsarBorrar(p);
  const r3 = await recarga(p, () => p.locator('#confirmOk').click());
  await p.evaluate(() => { window.__activo = false; });
  const t3 = await p.evaluate(() => document.getElementById('datosMsg').textContent);
  ok(!r3 && /solo ha permitido borrar una parte/.test(t3), 'si tampoco se puede restaurar: no se recarga y se dice que el borrado quedó a medias');
  // Al reintentar con el almacenamiento ya normal, se completa
  const r4 = await recarga(p, async () => { await pulsarBorrar(p); await p.locator('#confirmOk').click(); });
  ok(r4 && await p.evaluate(() => localStorage.getItem('wesserAppState') === null || state.sepaEntries.length === 0) && await p.evaluate(() => localStorage.getItem('otraAppDato') === 'no tocar'), 'reintentar con el almacenamiento normal completa el borrado');
  await p.close(); await b.close();
})();
