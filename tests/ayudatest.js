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
      // Diario: 4 pasos, con P+ dentro del paso P (no como quinto paso)
      sepa4: texto.includes('4 pasos principales: Situación, Emoción, Pensamiento y Acción') && texto.includes('En el paso P también escribes un pensamiento útil (P+)'),
      sepa5: /\b(5|cinco) pasos\b/i.test(texto),
      // Parar y decidir ya no es la opción «cuando no sabes cuál elegir»: para eso está «No sé qué necesito»
      pararNuevo: texto.includes('Si no sabes qué herramienta elegir, usa «No sé qué necesito»'),
      pararViejo: /Úsala cuando no sepas cuál elegir/i.test(texto),
      // Mis patrones documentado, y con los periodos que de verdad ofrece la app
      patrones: ['Mis patrones', '7 o 30 días', 'emociones', 'situaciones', 'acciones', 'no es un diagnóstico'].filter(t => !texto.includes(t)),
      periodos: !!document.getElementById('patronesBtn7') && !!document.getElementById('patronesBtn30'),
    };
  });
  ok(r.faltan.length === 0, `las ${r.nHerramientas} herramientas de la Caja aparecen en la Ayuda` + (r.faltan.length ? ' — faltan: ' + r.faltan.join(', ') : ''));
  ok(r.gruposFaltan.length === 0 && r.bloques, `la Ayuda nombra los ${r.nGrupos} bloques de Herramientas y su número`);
  ok(r.fichas, `la Ayuda dice ${r.nFichas} fichas de Aprender, como hay`);
  ok(r.emociones && r.nEmociones === 6, 'la Ayuda nombra las 6 emociones');
  ok(r.senales && r.bloquesCheckin, `la Ayuda dice ${r.nSenales} señales de Check-in en ${r.nBloquesCheckin} bloques, como hay`);
  ok(r.sepa4 && !r.sepa5, 'Diario: «4 pasos principales» (Situación, Emoción, Pensamiento y Acción) con el pensamiento útil (P+) dentro del paso P, no como quinto paso');
  ok(r.pararNuevo && !r.pararViejo, 'Parar y decidir: remite a «No sé qué necesito» y ya no dice «Úsala cuando no sepas cuál elegir»');
  ok(r.patrones.length === 0 && r.periodos, 'Mis patrones: documentado (7 o 30 días, emociones, situaciones, acciones, no es un diagnóstico)' + (r.patrones.length ? ' — falta: ' + r.patrones.join(', ') : ''));
  ok(errs.length === 0, 'sin errores de JS ' + errs.join(' | '));
  await b.close();
})();
