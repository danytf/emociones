// «No sé qué necesito»: se elige la situación que más se parece y se entra directamente en su herramienta
const { chromium } = require('playwright'); const path = require('path');
const URL = 'file:///' + path.resolve(__dirname, '..', 'index.html').split(String.fromCharCode(92)).join('/');
const ok = (c, m) => console.log((c ? 'PASS ' : 'FAIL ') + m);
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 375, height: 812 } }); p.setDefaultTimeout(6000);
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.addInitScript(() => { if (sessionStorage.getItem('s')) return; sessionStorage.setItem('s', '1'); localStorage.clear(); localStorage.setItem('wesserWelcomeSeen', '1'); localStorage.setItem('wesserLastView', 'herramientas'); });
  await p.goto(URL); await p.waitForTimeout(300);
  const titulo = () => p.evaluate(() => Overlays.top() === 'tool' ? document.getElementById('toolTitle').textContent : (Overlays.top() || 'app'));
  const cerrar = async () => { await p.evaluate(() => { while (Overlays.top()) Overlays.close(Overlays.top()); goto('herramientas'); }); await p.waitForTimeout(400); };
  const abrirDesdeLanzador = async () => { await p.locator('#qlRow .ql-btn:visible', { hasText: 'No sé qué necesito' }).first().click(); await p.waitForTimeout(150); };
  const estadoAntes = await p.evaluate(() => localStorage.getItem('wesserAppState'));

  // Pantalla inicial: una pregunta de orientación y cuatro situaciones, sin las preguntas Sí/No
  await abrirDesdeLanzador();
  const pant = await p.evaluate(() => ({
    t: document.getElementById('toolTitle').textContent, pregunta: document.querySelector('#toolBody .nsqn-pregunta')?.textContent,
    opciones: [...document.querySelectorAll('#toolBody [data-action="nsqnGo"]')].map(b => ({ v: b.dataset.value, texto: b.textContent.replace(/\s+/g, ' ').trim(), boton: b.tagName === 'BUTTON' && b.type === 'button', pressed: b.hasAttribute('aria-pressed') })),
    siNo: [...document.querySelectorAll('#toolBody button')].some(b => /^(Sí|No)$/.test(b.textContent.trim())),
    aviso: /no una evaluación/.test(document.getElementById('toolBody').textContent),
  }));
  ok(pant.t === 'No sé qué necesito' && pant.pregunta === '¿Qué se parece más a lo que te pasa ahora?', 'desde el lanzador: una pregunta breve de orientación');
  ok(pant.opciones.length === 4 && !pant.siNo, 'cuatro situaciones y ninguna pregunta Sí/No');
  ok(pant.opciones.every(o => o.boton && !o.pressed), 'cada situación es un botón real, sin aria-pressed (abre una herramienta, no marca una opción)');
  ok(pant.aviso, 'mantiene la aclaración de que no es una evaluación');
  const esperado = { acelerado: ['Tengo el cuerpo acelerado', 'Suspiro fisiológico', 'Respirar 60 s'], cabeza: ['No paro de darle vueltas', 'Grounding 5-4-3-2-1', 'Volver al presente'],
    evitando: ['Me cuesta hacer paradas', 'El momento de decidir', 'Empezar'], dias: ['Llevo varios días sin encontrar mi ritmo', 'Modo Reset', 'Ir a Reset'] };
  ok(pant.opciones.every(o => esperado[o.v] && esperado[o.v].every(t => o.texto.includes(t))), 'cada situación dice qué herramienta abre y qué hará (CTA)');

  // Rutas: tocar una situación abre directamente su herramienta, sin pantalla intermedia
  for (const [v, tool] of [['acelerado', 'Suspiro fisiológico'], ['cabeza', 'Grounding 5‑4‑3‑2‑1'], ['evitando', 'El momento de decidir']]) {
    await cerrar(); await abrirDesdeLanzador();
    await p.locator(`#toolBody [data-action="nsqnGo"][data-value="${v}"]`).click(); await p.waitForTimeout(200);
    const t = (await titulo()).replace(/[‐-–]/g, '-');
    ok(t === tool.replace(/[‐-–]/g, '-'), `«${esperado[v][0]}» abre directamente ${tool}`);
  }
  await cerrar(); await abrirDesdeLanzador();
  await p.locator('#toolBody [data-action="nsqnGo"][data-value="dias"]').click(); await p.waitForTimeout(300);
  ok(await p.evaluate(() => Overlays.top() === 'reset' && !document.getElementById('toolOverlay').classList.contains('active')), '«Llevo varios días…» entra en el Modo Reset por su entrada habitual');

  // Teclado: Tab llega a las situaciones y Enter abre la herramienta
  await cerrar(); await abrirDesdeLanzador();
  await p.locator('#toolBody [data-action="nsqnGo"]').first().focus(); await p.keyboard.press('Enter'); await p.waitForTimeout(200);
  ok(await titulo() === 'Suspiro fisiológico', 'con teclado: Enter sobre una situación abre su herramienta');

  // «¿Ninguna encaja?»: ir a herramientas o a «Ponle nombre a lo que sientes»
  await cerrar(); await abrirDesdeLanzador();
  await p.locator('#toolBody button:has-text("Ver herramientas")').click(); await p.waitForTimeout(300);
  ok(await p.evaluate(() => Overlays.top() === null && document.getElementById('view-herramientas').classList.contains('active')), '«Ninguna encaja → Ver herramientas» lleva a la Caja de Herramientas');
  await abrirDesdeLanzador();
  await p.locator('#toolBody button:has-text("Ponle nombre a lo que sientes")').click(); await p.waitForTimeout(200);
  ok(await titulo() === '¿Qué te está pasando?', '«Ninguna encaja → Ponle nombre a lo que sientes» abre la lista de estados');

  // Desde «Ponle nombre a lo que sientes → No lo tengo claro», y atrás vuelve a la lista
  await cerrar();
  await p.locator('.ql-nombre:visible').first().click(); await p.locator('#toolBody [onclick^="startNoSeQueNecesito()"]').click(); await p.waitForTimeout(200);
  ok(await titulo() === 'No sé qué necesito', 'se abre desde «No lo tengo claro» de la lista de estados');
  await p.goBack(); await p.waitForTimeout(450);
  ok(await titulo() === '¿Qué te está pasando?', 'atrás vuelve a la lista de estados');

  // Cerrar y reabrir: sin estado guardado ni aviso al cerrar
  await cerrar(); await abrirDesdeLanzador(); await p.keyboard.press('Escape'); await p.waitForTimeout(350);
  ok(await titulo() === 'app', 'se cierra sin preguntar (no guarda nada)');
  await abrirDesdeLanzador();
  ok(await p.evaluate(() => document.querySelectorAll('#toolBody [data-action="nsqnGo"]').length === 4), 'reabrir muestra de nuevo las cuatro situaciones');
  ok(await p.evaluate(() => localStorage.getItem('wesserAppState')) === estadoAntes, 'no guarda ninguna respuesta');
  ok(errs.length === 0, 'sin errores de JS ' + errs.join(' | '));
  await b.close();
})();
