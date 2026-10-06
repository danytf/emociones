// «Después de una mala interacción»: en «Aprende» se aclara que tras insultos o amenazas no hay nada que
// revisar y que se avise al responsable; los pasos y la navegación siguen igual
const { chromium } = require('playwright'); const path = require('path');
const URL = 'file:///' + path.resolve(__dirname, '..', 'index.html').split(String.fromCharCode(92)).join('/');
const ok = (c, m) => console.log((c ? 'PASS ' : 'FAIL ') + m);
const AVISO = 'Si ha habido insultos o amenazas, no es algo de tu técnica. Avísalo a tu responsable antes de seguir.';
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 375, height: 812 } }); p.setDefaultTimeout(6000);
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.addInitScript(() => { if (sessionStorage.getItem('s')) return; sessionStorage.setItem('s', '1'); localStorage.setItem('wesserWelcomeSeen', '1'); localStorage.setItem('wesserLastView', 'herramientas'); });
  await p.goto(URL); await p.waitForTimeout(300);
  const paso = () => p.evaluate(() => ({ t: document.querySelector('#toolBody h3').textContent, texto: document.getElementById('toolBody').textContent.replace(/\s+/g, ' ') }));
  const siguiente = () => p.locator('#toolBody button:has-text("Siguiente")').click();

  await p.locator('#view-herramientas .trow:has-text("Después de una mala interacción")').click();
  const vistos = [];
  for (let i = 0; i < 5; i++) { const s = await paso(); vistos.push(s); if (i < 4) await siguiente(); }
  ok(JSON.stringify(vistos.map(s => s.t)) === JSON.stringify(['Corta', 'Separa', 'Aprende', 'Suelta', 'Vuelve']), 'los cinco pasos siguen igual');
  const aprende = vistos[2];
  ok(aprende.texto.includes('¿Hay algo concreto que pueda revisar?') && aprende.texto.includes(AVISO), '«Aprende»: la pregunta y la aclaración sobre insultos, amenazas y riesgo');
  ok(vistos.filter(s => s.texto.includes('insultos')).length === 1, 'la aclaración aparece solo en «Aprende»');
  // El aviso va antes del campo de texto (se lee antes de ponerse a escribir)
  await p.evaluate(() => { badApproachIdx = 2; renderBadApproachStep(); });
  ok(await p.evaluate(() => { const a = [...document.querySelectorAll('#toolBody p')].find(x => x.textContent.includes('insultos')); const t = document.getElementById('badApproachInput'); return !!a && !!t && (a.compareDocumentPosition(t) & Node.DOCUMENT_POSITION_FOLLOWING) > 0; }), 'la aclaración se lee antes del campo para escribir');
  // Terminar y atrás siguen funcionando
  await p.evaluate(() => { badApproachIdx = 4; renderBadApproachStep(); });
  await p.locator('#toolBody button:has-text("Terminar")').click(); await p.waitForTimeout(200);
  ok(await p.evaluate(() => /completado|Repetir/i.test(document.getElementById('toolBody').textContent)), '«Terminar» completa la herramienta');
  await p.goBack(); await p.waitForTimeout(450);
  ok(await p.evaluate(() => Overlays.top() === null), 'atrás cierra la herramienta');
  ok(errs.length === 0, 'sin errores de JS ' + errs.join(' | '));
  await b.close();
})();
