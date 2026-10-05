// «Mi motivo»: preparar, editar, borrar, límites, seguridad, exportar/importar, Desánimo y atrás (3 motores)
const pw = require('playwright'); const path = require('path'), fs = require('fs'), os = require('os');
const URL = 'file:///' + path.resolve(__dirname, '..', 'index.html').split(String.fromCharCode(92)).join('/');
const ok = (c, m) => console.log((c ? 'PASS ' : 'FAIL ') + m);
const titulo = p => p.evaluate(() => Overlays.top() === 'tool' ? document.getElementById('toolTitle').textContent : (Overlays.top() || 'app')).catch(() => 'fuera');
const guardado = p => p.evaluate(() => JSON.parse(localStorage.getItem('wesserAppState') || '{}').miMotivo);
async function escribirYGuardar(p, txt) {
  await p.evaluate(() => openMiMotivo());
  await p.fill('#miMotivoInput', txt);
  await p.locator('#toolBody button:has-text("Guardar")').click();
}
async function fichaDesanimo(p) {
  await p.evaluate(() => { while (Overlays.top()) Overlays.close(Overlays.top()); goto('herramientas'); });
  await p.waitForTimeout(400);
  await p.locator('.ql-nombre:visible').first().click();
  await p.locator('#toolBody .estado-opcion[data-value="desanimo"]').click();
}
(async () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'motivo-'));
  for (const motor of ['chromium', 'webkit', 'firefox']) {
    const b = await pw[motor].launch(); const completo = motor === 'chromium';
    const p = await b.newPage({ viewport: { width: 375, height: 812 } }); p.setDefaultTimeout(8000); const errs = []; p.on('pageerror', e => errs.push(e.message));
    await p.addInitScript(() => { if (sessionStorage.getItem('s')) return; sessionStorage.setItem('s', '1'); localStorage.clear(); localStorage.setItem('wesserWelcomeSeen', '1'); localStorage.setItem('wesserLastView', 'herramientas'); });
    await p.goto(URL); await p.waitForTimeout(300);
    const M = s => `${motor}: ${s}`;

    // Sin motivo: la ficha de Desánimo es la de siempre
    ok(await p.evaluate(() => state.miMotivo === ''), M('el motivo empieza vacío'));
    await fichaDesanimo(p);
    const sin = await p.evaluate(() => ({ motivo: !!document.querySelector('#toolBody .estado-motivo'), principal: document.querySelector('#toolBody .btn-navy')?.textContent.trim(), aviso: /motivo/i.test(document.getElementById('toolBody').textContent) }));
    ok(!sin.motivo && !sin.aviso && sin.principal === 'Probar ahora: Resultado vs. Proceso', M('sin motivo: Desánimo igual que antes, sin «Leer mi motivo» ni avisos'));

    // Preparar desde Herramientas → Preparación
    await p.evaluate(() => { while (Overlays.top()) Overlays.close(Overlays.top()); }); await p.waitForTimeout(400);
    await p.locator('#view-herramientas .trow:has-text("Mi motivo")').click();
    const prep = await p.evaluate(() => ({ t: document.getElementById('toolTitle').textContent, label: document.querySelector('label[for="miMotivoInput"]')?.textContent, ayuda: document.getElementById('miMotivoAyuda')?.textContent, priv: document.getElementById('miMotivoPrivado')?.textContent, borrar: /Borrar mi motivo/.test(document.getElementById('toolBody').textContent) }));
    ok(prep.t === 'Mi motivo' && prep.label === '¿Por qué estás en este trabajo?' && prep.ayuda.startsWith('También puede ayudarte') && prep.priv === 'Se guarda en este dispositivo. Solo saldrá de él si tú exportas tus datos.' && !prep.borrar, M('preparación: pregunta, ayuda visible, privacidad y sin «Borrar» cuando no hay motivo'));
    await p.locator('#toolBody button:has-text("Guardar")').click();
    ok(await p.evaluate(() => !!document.querySelector('#miMotivoInput[aria-invalid="true"]') && state.miMotivo === ''), M('guardar vacío no guarda y lo indica en el campo'));
    await escribirYGuardar(p, 'Para pagarme los estudios.');
    ok(await guardado(p) === 'Para pagarme los estudios.', M('guardar persiste en el dispositivo'));
    ok(await p.evaluate(() => document.activeElement.id === 'miMotivoInput' && /Borrar mi motivo/.test(document.getElementById('toolBody').textContent)), M('tras guardar: foco en el campo y aparece «Borrar mi motivo»'));
    // Cerrar tras guardar no avisa de cambios sin guardar; editar sin guardar sí
    await p.keyboard.press('Escape'); await p.waitForTimeout(300);
    ok(await p.evaluate(() => Overlays.top() === null), M('tras guardar, Escape cierra sin preguntar «¿Cerrar sin guardar?»'));
    await p.evaluate(() => openMiMotivo()); await p.waitForTimeout(150);
    await p.goBack().catch(() => {}); await p.waitForTimeout(450);
    ok(await p.evaluate(() => Overlays.top() === null), M('abrir con un motivo guardado y volver atrás no pregunta nada'));
    await p.evaluate(() => openMiMotivo()); await p.waitForTimeout(150);
    await p.locator('#miMotivoInput').fill('Cambio sin guardar');
    await p.keyboard.press('Escape'); await p.waitForTimeout(300);
    const aviso = await p.evaluate(() => ({ top: Overlays.top(), t: document.getElementById('confirmTitle').textContent }));
    ok(aviso.top === 'confirm' && aviso.t === '¿Cerrar sin guardar?', M('con un cambio sin guardar, cerrar sí avisa'));
    await p.locator('#confirmCancel').click(); await p.waitForTimeout(200);
    ok(await p.evaluate(() => Overlays.top() === 'tool' && document.getElementById('miMotivoInput').value === 'Cambio sin guardar'), M('«Seguir editando» conserva lo escrito'));
    await p.locator('#toolBody button:has-text("Guardar")').click(); await p.waitForTimeout(150);
    await p.keyboard.press('Escape'); await p.waitForTimeout(300);
    ok(await p.evaluate(() => Overlays.top() === null && JSON.parse(localStorage.getItem('wesserAppState')).miMotivo === 'Cambio sin guardar'), M('guardar el cambio y cerrar: guardado y sin aviso'));
    await escribirYGuardar(p, 'Para pagarme los estudios.');
    await p.evaluate(() => { borrarMiMotivo(); }); await p.locator('#confirmOk').click(); await p.waitForTimeout(250);
    await p.keyboard.press('Escape'); await p.waitForTimeout(300);
    ok(await p.evaluate(() => Overlays.top() === null), M('tras borrar, cerrar no pregunta nada'));
    await escribirYGuardar(p, 'Para pagarme los estudios.');

    if (completo) {
      await p.reload(); await p.waitForTimeout(300);
      ok(await p.evaluate(() => state.miMotivo) === 'Para pagarme los estudios.', M('recargar conserva el motivo'));
      await escribirYGuardar(p, 'Por dinero.\nY porque aprendo a hablar con desconocidos.');
      await p.reload(); await p.waitForTimeout(300);
      ok(await p.evaluate(() => state.miMotivo) === 'Por dinero.\nY porque aprendo a hablar con desconocidos.', M('editar sustituye al anterior y persiste'));
      // Longitud
      for (const n of [299, 300]) { await escribirYGuardar(p, 'a'.repeat(n)); ok((await guardado(p)).length === n, M(`${n} caracteres: válido`)); }
      await p.evaluate(() => openMiMotivo());
      await p.locator('#miMotivoInput').fill('b'.repeat(350));
      const largo = await p.evaluate(() => document.getElementById('miMotivoInput').value.length);
      await p.locator('#toolBody button:has-text("Guardar")').click();
      ok(largo === 300 && (await guardado(p)).length === 300, M('más de 300: el campo no admite más y se guarda limitado a 300'));
      ok(await p.evaluate(() => normalizeState({ ...state, miMotivo: 'c'.repeat(900) }).miMotivo.length === 300), M('un dato de más de 300 se limita al sanear'));
      ok(await p.evaluate(() => !document.getElementById('miMotivoCuenta').hidden), M('el contador aparece cerca del límite'));
      // Seguridad
      await escribirYGuardar(p, '<img src=x onerror="window.__x=1">');
      await fichaDesanimo(p); await p.locator('#toolBody .estado-motivo').click(); await p.waitForTimeout(150);
      ok(await p.evaluate(() => !window.__x && !document.querySelector('#toolBody img') && document.querySelector('.mi-motivo-texto').textContent === '<img src=x onerror="window.__x=1">'), M('HTML malicioso: se muestra como texto y no se ejecuta'));
      await p.evaluate(() => { openMiMotivo(); });
      ok(await p.evaluate(() => !window.__x && document.getElementById('miMotivoInput').value === '<img src=x onerror="window.__x=1">'), M('HTML malicioso al editar: no se ejecuta'));
      // Exportar e importar
      await escribirYGuardar(p, 'Por la causa.');
      const [dl] = await Promise.all([p.waitForEvent('download'), p.evaluate(() => exportarDatos())]);
      const f = path.join(tmp, 'export.json'); await dl.saveAs(f);
      ok(JSON.parse(fs.readFileSync(f, 'utf8')).miMotivo === 'Por la causa.', M('exportar incluye el motivo'));
      const importar = async (obj, nombre) => { const g = path.join(tmp, nombre); fs.writeFileSync(g, JSON.stringify(obj)); await p.setInputFiles('#importDatosInput', g); await p.locator('#confirmOk').waitFor(); await Promise.all([p.waitForEvent('load'), p.locator('#confirmOk').click()]); await p.waitForTimeout(300); };
      await escribirYGuardar(p, 'otro');
      await importar(JSON.parse(fs.readFileSync(f, 'utf8')), 'con.json');
      ok(await p.evaluate(() => state.miMotivo) === 'Por la causa.', M('importar recupera el motivo'));
      const antiguo = JSON.parse(fs.readFileSync(f, 'utf8')); delete antiguo.miMotivo;
      await importar(antiguo, 'antiguo.json');
      ok(await p.evaluate(() => state.miMotivo === '' && state.sepaEntries !== undefined), M('importar un archivo antiguo sin el campo: motivo vacío, sin error'));
      await importar({ ...antiguo, miMotivo: '' }, 'vacio.json');
      ok(await p.evaluate(() => state.miMotivo === ''), M('importar con el motivo vacío es válido'));
      ok(await p.evaluate(() => !!validateImport({ ...JSON.parse(JSON.stringify(state)), miMotivo: 5 })), M('importar un motivo que no es texto se rechaza'));
      // Borrar todos los datos
      await escribirYGuardar(p, 'Para ahorrar.');
      await p.evaluate(() => { borrarTodosDatos(); }); await p.locator('#confirmOk').waitFor();
      await Promise.all([p.waitForEvent('load'), p.locator('#confirmOk').click()]); await p.waitForTimeout(300);
      ok(await p.evaluate(() => state.miMotivo === '' && localStorage.getItem('wesserAppState') === null || !JSON.parse(localStorage.getItem('wesserAppState') || '{}').miMotivo), M('«Borrar todos los datos» elimina también el motivo'));
      await p.evaluate(() => localStorage.setItem('wesserWelcomeSeen', '1'));
      await escribirYGuardar(p, 'Porque me gusta trabajar con gente.');
    }

    // Con motivo: aparece la vía secundaria y Resultado vs. Proceso sigue siendo la principal
    await fichaDesanimo(p);
    const con = await p.evaluate(() => { const nav = document.querySelector('#toolBody .btn-navy'); const sec = document.querySelector('#toolBody .estado-motivo'); return { principal: nav?.textContent.trim(), sec: sec?.textContent.trim(), secEsSecundario: sec && !sec.classList.contains('btn-navy'), orden: nav && sec && (nav.compareDocumentPosition(sec) & Node.DOCUMENT_POSITION_FOLLOWING) }; });
    ok(con.principal === 'Probar ahora: Resultado vs. Proceso' && con.sec === 'Leer mi motivo' && con.secEsSecundario && !!con.orden, M('con motivo: «Leer mi motivo» secundario, después de la acción principal'));
    ok(await p.evaluate(() => { openEstado('frustracion'); return !document.querySelector('#toolBody .estado-motivo'); }), M('el resto de estados no muestran «Leer mi motivo»'));
    await p.evaluate(() => startEstados());
    await p.locator('#toolBody .estado-opcion[data-value="desanimo"]').click();
    // Navegación: Mi motivo → ficha → lista → app
    await p.locator('#toolBody .estado-motivo').click(); await p.waitForTimeout(250);
    const lectura = await p.evaluate(() => ({ t: document.getElementById('toolTitle').textContent, txt: document.querySelector('.mi-motivo-texto')?.textContent, botones: [...document.querySelectorAll('#toolBody button')].map(x => x.textContent.trim()) }));
    ok(lectura.t === 'Mi motivo' && lectura.txt === (completo ? 'Porque me gusta trabajar con gente.' : 'Para pagarme los estudios.') && JSON.stringify(lectura.botones) === '["Vuelvo a calle"]', M('lectura: el texto tal cual y solo «Vuelvo a calle»'));
    const cadena = [await titulo(p)];
    for (let i = 0; i < 3; i++) { await p.goBack().catch(() => {}); await p.waitForTimeout(450); cadena.push(await titulo(p)); }
    ok(cadena.join(' → ') === 'Mi motivo → Desánimo → ¿Qué te está pasando? → app', M('atrás: ' + cadena.join(' → ')));
    // Escape y «Vuelvo a calle»
    await fichaDesanimo(p); await p.locator('#toolBody .estado-motivo').click(); await p.keyboard.press('Escape'); await p.waitForTimeout(400);
    ok(await titulo(p) === 'app', M('Escape cierra la lectura'));
    await fichaDesanimo(p); await p.locator('#toolBody .estado-motivo').click(); await p.locator('#toolBody button:has-text("Vuelvo a calle")').click(); await p.waitForTimeout(400);
    ok(await titulo(p) === 'app', M('«Vuelvo a calle» vuelve a la app'));
    await fichaDesanimo(p); await p.locator('#toolBody .btn-navy').click(); await p.waitForTimeout(200);
    ok(await titulo(p) === 'Resultado vs. Proceso', M('Resultado vs. Proceso funciona igual desde la ficha'));

    // Aprender: el mismo botón desde la fuente única, y se oculta al borrar
    await p.evaluate(() => { while (Overlays.top()) Overlays.close(Overlays.top()); goto('aprender'); }); await p.waitForTimeout(400);
    const apr = () => p.evaluate(() => [...document.querySelectorAll('#estadosCaptacion .estado-motivo')].map(x => ({ id: x.dataset.value, oculto: x.hidden })));
    const a1 = await apr();
    ok(a1.length === 1 && a1[0].id === 'desanimo' && !a1[0].oculto, M('Aprender: «Leer mi motivo» solo en Desánimo y visible con motivo'));
    // Borrar mi motivo
    await p.evaluate(() => openMiMotivo());
    await p.locator('#toolBody button:has-text("Borrar mi motivo")').click(); await p.locator('#confirmOk').click(); await p.waitForTimeout(300);
    ok(await guardado(p) === '' && await p.evaluate(() => document.getElementById('miMotivoInput').value === '' && !/Borrar mi motivo/.test(document.getElementById('toolBody').textContent)), M('borrar: elimina el dato y vacía el campo'));
    ok((await apr())[0].oculto, M('al borrar, Aprender oculta «Leer mi motivo»'));
    if (completo) { await p.reload(); await p.waitForTimeout(300); ok(await p.evaluate(() => state.miMotivo === ''), M('tras recargar sigue borrado')); }
    await fichaDesanimo(p);
    ok(await p.evaluate(() => !document.querySelector('#toolBody .estado-motivo')), M('sin motivo, la ficha vuelve a ser la de siempre'));
    ok(errs.length === 0, M('sin errores de JS ' + errs.join(' | ')));
    await b.close();
  }
})();
