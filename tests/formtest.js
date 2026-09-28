const { chromium } = require('playwright');
const path = require('path'), fs = require('fs');
const URL = 'file:///' + path.resolve(__dirname, '..', 'index.html').replace(/\\/g, '/');
const ok = (c, m) => console.log((c ? 'PASS ' : 'FAIL ') + m);
const S = path.join(__dirname, 'out');
require('fs').mkdirSync(require('path').join(__dirname, 'out'), { recursive: true });
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } }); await page.addInitScript(()=>{try{localStorage.setItem('wesserWelcomeSeen','1')}catch(e){}});
  const errors = []; let nativeDialogs = 0;
  page.on('pageerror', e => errors.push(e.message));
  page.on('dialog', d => { nativeDialogs++; d.dismiss(); });
  await page.goto(URL);

  // Diario vacío: todos los errores a la vez, foco al primero
  await page.evaluate(() => goto('diario'));
  await page.locator('#sepaSaveBtn').click();
  const e1 = await page.evaluate(() => ({
    msgs: [...document.querySelectorAll('#view-diario .field-error')].map(p => p.textContent),
    focus: document.activeElement.dataset.action, groupDesc: document.getElementById('sepaEmocionChips').getAttribute('aria-describedby'),
    invalid: document.getElementById('sepaPensConstructivo').getAttribute('aria-invalid'),
    desc: document.getElementById(document.getElementById('sepaPensConstructivo').getAttribute('aria-describedby')).textContent,
    saved: state.sepaEntries.length
  }));
  ok(e1.msgs.length === 3 && e1.saved === 0, 'Diario: se muestran los 3 errores a la vez y no se guarda: ' + e1.msgs.join(' | '));
  ok(e1.focus === 'toggleEmocion' && !!e1.groupDesc, 'foco en el primer campo con error (emociones) y grupo enlazado al mensaje');
  ok(e1.invalid === 'true' && e1.desc.startsWith('Escribe un pensamiento útil'), 'aria-invalid + aria-describedby en el campo');
  await page.locator('#view-diario').screenshot({ path: S + '/err-sepa.png' });
  await page.locator('#sepaEmocionChips [data-id="ira"]').click();
  await page.locator('#sepaPensConstructivo').fill('algo');
  const e2 = await page.evaluate(() => ({ n: document.querySelectorAll('#view-diario .field-error').length, inv: document.getElementById('sepaPensConstructivo').hasAttribute('aria-invalid'), d: document.getElementById('sepaPensConstructivo').hasAttribute('aria-describedby') }));
  ok(e2.n === 1 && !e2.inv && !e2.d, 'cada error desaparece al corregir su campo');
  await page.locator('#sepaAccion').fill('pausa');
  await page.locator('#sepaSaveBtn').click();
  ok(await page.evaluate(() => state.sepaEntries.length === 1 && !document.querySelector('#view-diario .field-error')), 'con todo relleno se guarda (misma lógica que antes)');

  // Qué ha funcionado
  await page.evaluate(() => startExito());
  await page.locator('#toolBody button:has-text("Guardar")').click();
  ok((await page.locator('#toolBody .field-error').innerText()).includes('Elige o escribe qué ha funcionado'), 'Qué ha funcionado: error en línea bajo los chips');
  await page.locator('#toolBody [data-value="Otra"]').click();
  await page.locator('#toolBody button:has-text("Guardar")').click();
  ok(await page.evaluate(() => document.activeElement.id === 'exitoOtraInput' && document.querySelector('#toolBody .field-error').textContent === 'Indica qué ha funcionado antes de guardar.'), '«Otra» vacía: «Indica qué ha funcionado antes de guardar.» con foco en el campo');
  await page.evaluate(() => closeTool());

  // Reset: Continuar sin rellenar
  await page.evaluate(() => { openReset(); resetGoto(2); });
  await page.locator('#resetBody button:has-text("Continuar")').click();
  ok(await page.evaluate(() => resetStep === 2 && document.querySelectorAll('#resetBody .field-error').length === 2 && document.activeElement.id === 'resetExamResultadoInput'), 'Examina: dos errores en línea y se queda en el paso');
  await page.evaluate(() => { resetGoto(1); });
  await page.locator('#resetBody button:has-text("Continuar")').click();
  ok(await page.evaluate(() => resetStep === 1 && document.activeElement.id === 'resetSenalInput' && !!document.querySelector('#resetBody .field-error')), 'Reconoce: error en línea con foco en el campo');

  // Kit: límite de 3 señales
  await page.evaluate(() => { state.kitSenales = []; openKit(); });
  for (let i = 0; i < 4; i++) await page.locator('#kitSenalChips button').nth(i).click();
  ok(await page.evaluate(() => state.kitSenales.length === 3 && document.querySelector('#kitSenalChips + .field-error').textContent.includes('hasta 3 señales')), 'Kit: la 4.ª señal muestra aviso en línea');
  await page.evaluate(() => startFreshReset());
  await page.evaluate(() => closeReset());

  // Pide feedback → guardado en Kit en línea
  await page.evaluate(() => { startPedirFeedback(); selectPedirFeedback('Mira mi ritmo'); finalizarPedirFeedback(); });
  await page.locator('[data-action="guardarPedirFeedbackEnKit"]').click();
  ok((await page.locator('#pedirKitMsg').innerText()).startsWith('Guardado en tu Kit'), 'Pide feedback: confirmación en línea');
  await page.evaluate(() => closeTool());

  // Confirmación de borrado
  await page.evaluate(() => goto('diario'));
  await page.locator('#sepaHistorial [data-action="borrarSepa"]').first().click();
  await page.locator('#confirmBox').screenshot({ path: S + '/confirm.png' });
  const role = await page.evaluate(() => ({ r: document.getElementById('confirmBox').getAttribute('role'), f: document.activeElement.id }));
  ok(role.r === 'alertdialog' && role.f === 'confirmCancel', 'borrado: alertdialog con foco en Cancelar');
  await page.mouse.click(10, 10);
  ok(await page.evaluate(() => state.sepaEntries.length === 1 && Overlays.top() === null), 'clic en el fondo = cancelar');

  // «Sugerir reencuadre» no borra lo que ha escrito el usuario
  const reenc = await page.evaluate(() => {
    goto('diario');
    const el = document.getElementById('sepaPensConstructivo');
    el.value = ''; sugerirReencuadre(); const sola = el.value;
    sugerirReencuadre(); const repetida = el.value;               // pulsar dos veces: sustituye, no duplica
    el.value = 'Mi propia idea'; sugerirReencuadre(); const conPropia = el.value;
    sugerirReencuadre(); const otraVez = el.value;
    el.value = '';
    return { sola, repetida, conPropia, otraVez };
  });
  ok(reenc.sola && reenc.repetida === reenc.sola && !reenc.sola.includes('zona difícil'), 'reencuadre: con el campo vacío se rellena; al repetir no se duplica; sin «zona difícil» genérica');
  ok(reenc.conPropia.startsWith('Mi propia idea') && reenc.conPropia.includes(reenc.sola) && reenc.otraVez === reenc.conPropia, 'reencuadre: conserva lo escrito y añade la sugerencia debajo, una sola vez');

  // Guardar confirma con un aviso (Diario y Checkpoint)
  const avisos = await page.evaluate(() => {
    goto('diario');
    selectedEmociones = ['ira']; syncEmocionChips();
    document.getElementById('sepaSituacion').value = 'Zona con poco flujo';
    document.getElementById('sepaPensConstructivo').value = 'Otra forma de verlo';
    document.getElementById('sepaAccion').value = 'Pausa consciente';
    guardarSepa();
    const diario = document.getElementById('toastMsg').textContent;
    openCheckpoint(); guardarCheckpoint();
    const cp = document.getElementById('toastMsg').textContent;
    return { diario, cp };
  });
  ok(avisos.diario.startsWith('Registro guardado') && avisos.cp.startsWith('Checkpoint guardado'), `guardar confirma con aviso (${avisos.diario} | ${avisos.cp})`);

  // Error al guardar: aviso no modal, sin repetir
  await page.evaluate(() => { Storage.prototype.setItem = () => { throw new Error('QuotaExceeded'); }; save(); save(); });
  ok(await page.locator('#toast').evaluate(t => t.classList.contains('show') && t.classList.contains('error')), 'error de guardado como aviso no modal');
  await page.locator('#toast').screenshot({ path: S + '/toast.png' });
  // Si no se puede guardar, «¿Qué ha funcionado?» no muestra «Guardado» ni deja el registro en memoria
  const fallo = await page.evaluate(() => {
    const antes = state.exitos.length;
    startExito(); selectExitoConducta(EXITO_OPCIONES[0]); guardarExito();
    return { h3: document.querySelector('#toolBody h3')?.textContent || '', igual: state.exitos.length === antes };
  });
  ok(fallo.h3 !== 'Guardado' && fallo.igual, '«¿Qué ha funcionado?» no dice «Guardado» si el guardado falla');

  ok(nativeDialogs === 0, 'ningún alert()/confirm() nativo en todo el recorrido');
  ok(errors.length === 0, 'sin errores de JS: ' + errors.join(' | '));
  await browser.close();
})();
