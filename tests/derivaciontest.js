// Derivación responsable: aviso en «Desánimo» (ficha y Aprender) y párrafo en la Ayuda; sin la frase de crisis
// que el usuario descartó expresamente
const { chromium } = require('playwright'); const path = require('path'), fs = require('fs');
const FILE = path.resolve(__dirname, '..', 'index.html');
const URL = 'file:///' + FILE.split(String.fromCharCode(92)).join('/');
const ok = (c, m) => console.log((c ? 'PASS ' : 'FAIL ') + m);
const AVISO = 'Si esta sensación se repite casi a diario o dura semanas, no es solo una mala racha: háblalo con tu responsable o con alguien de confianza, y valora consultarlo con un profesional.';
const AYUDA = 'Esta app te ayuda en el día a día, pero no sustituye a un profesional. Si el malestar dura semanas, va a más o te afecta fuera del trabajo, háblalo con tu responsable o con alguien de confianza y valora pedir ayuda profesional.';
(async () => {
  const html = fs.readFileSync(FILE, 'utf8');
  ok(!/hacerte daño|llama al 024/i.test(html), 'la frase de crisis descartada no aparece en ningún sitio');
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 375, height: 812 } }); const errs = [];
  p.on('pageerror', e => errs.push(e.message));
  await p.addInitScript(() => { localStorage.setItem('wesserWelcomeSeen', '1'); localStorage.setItem('wesserLastView', 'herramientas'); });
  await p.goto(URL); await p.waitForTimeout(300);
  const norm = t => t.replace(/\s+/g, ' ').trim();
  // Ficha de «Desánimo» desde «Ponle nombre a lo que sientes»
  await p.locator('.ql-nombre:visible').first().click(); await p.locator('#toolBody .estado-opcion[data-value="desanimo"]').click();
  ok(norm(await p.locator('#toolBody').innerText()).includes(AVISO), 'ficha de Desánimo: muestra el aviso de derivación');
  // Mismo aviso en Aprender (fuente única) y solo en Desánimo y Fatiga mental
  const avisos = await p.evaluate(() => ESTADOS_CAPTACION.filter(e => e.aviso).map(e => e.id));
  ok(JSON.stringify(avisos) === JSON.stringify(['desanimo', 'fatiga']), 'solo Desánimo y Fatiga mental llevan aviso (' + avisos.join(', ') + ')');
  ok(await p.evaluate(a => document.getElementById('estadosCaptacion').textContent.replace(/\s+/g, ' ').includes(a), AVISO), 'Aprender: el aviso aparece también en Desánimo');
  // Ayuda, en «¿Por dónde empiezo?»
  const ayuda = await p.evaluate(() => { const d = [...document.querySelectorAll('#helpOverlay details')].find(x => x.querySelector('summary').textContent.includes('¿Por dónde empiezo?')); return d ? d.textContent.replace(/\s+/g, ' ') : ''; });
  ok(ayuda.includes(AYUDA), 'Ayuda «¿Por dónde empiezo?»: dice que no sustituye a un profesional y cuándo pedir ayuda');
  ok(errs.length === 0, 'sin errores de JS ' + errs.join(' | '));
  await b.close();
})();
