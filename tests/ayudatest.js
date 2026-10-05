// La Ayuda describe la app real: cada herramienta de la Caja aparece en ella y las cifras que cita coinciden
const { chromium } = require('playwright'); const path = require('path');
const URL = 'file:///' + path.resolve(__dirname, '..', 'index.html').split(String.fromCharCode(92)).join('/');
const ok = (c, m) => console.log((c ? 'PASS ' : 'FAIL ') + m);
(async () => {
  const b = await chromium.launch(); const p = await b.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.addInitScript(() => { try { localStorage.setItem('wesserWelcomeSeen', '1'); } catch (e) {} });
  await p.goto(URL); await p.waitForTimeout(300);
  const r = await p.evaluate(() => {
    const ayuda = document.getElementById('helpOverlay') || document.querySelector('[id^="help"]');
    const norm = t => t.replace(/[‐-–]/g, '-').replace(/\s+/g, ' ');   // guiones no separables = guion normal
    const texto = norm(ayuda.textContent);
    const herramientas = [...document.querySelectorAll('#view-herramientas .trow-title')].map(t => norm(t.textContent).trim());
    const grupos = [...document.querySelectorAll('#view-herramientas .tool-group')].map(g => g.querySelector('.tgroup-title').textContent.trim());
    return {
      faltan: herramientas.filter(h => !texto.includes(h)),
      gruposFaltan: grupos.filter(g => !texto.includes(g)),
      nHerramientas: herramientas.length, nGrupos: grupos.length,
      bloques: texto.includes(`${grupos.length} bloques`),
      fichas: texto.includes(`${document.querySelectorAll('#view-aprender details[name="aprender-fichas"]').length} fichas`),
      nFichas: document.querySelectorAll('#view-aprender details[name="aprender-fichas"]').length,
      emociones: EMOTIONS.every(e => texto.includes(e.nombre)), nEmociones: EMOTIONS.length,
      senales: texto.includes(`${CHECKIN_SECTIONS.reduce((n, s) => n + s.items.length, 0)} señales`), nSenales: CHECKIN_SECTIONS.reduce((n, s) => n + s.items.length, 0),
      nBloquesCheckin: CHECKIN_SECTIONS.length, bloquesCheckin: texto.includes('cuatro bloques') === (CHECKIN_SECTIONS.length === 4),
    };
  });
  ok(r.faltan.length === 0, `las ${r.nHerramientas} herramientas de la Caja aparecen en la Ayuda` + (r.faltan.length ? ' — faltan: ' + r.faltan.join(', ') : ''));
  ok(r.gruposFaltan.length === 0 && r.bloques, `la Ayuda nombra los ${r.nGrupos} bloques de Herramientas y su número`);
  ok(r.fichas, `la Ayuda dice ${r.nFichas} fichas de Aprender, como hay`);
  ok(r.emociones && r.nEmociones === 6, 'la Ayuda nombra las 6 emociones');
  ok(r.senales && r.bloquesCheckin, `la Ayuda dice ${r.nSenales} señales de Check-in en ${r.nBloquesCheckin} bloques, como hay`);
  ok(errs.length === 0, 'sin errores de JS ' + errs.join(' | '));
  await b.close();
})();
