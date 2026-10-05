// «Mis patrones»: una acción del Diario cuenta solo si se registra como hecha o decidida (no negada,
// hipotética ni referida); como mucho una vez por registro; el resto de los patrones no cambia
const { chromium } = require('playwright'); const path = require('path');
const URL = 'file:///' + path.resolve(__dirname, '..', 'index.html').split(String.fromCharCode(92)).join('/');
const ok = (c, m) => console.log((c ? 'PASS ' : 'FAIL ') + m);
(async () => {
  const b = await chromium.launch(); const p = await b.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.addInitScript(() => { try { localStorage.setItem('wesserWelcomeSeen', '1'); } catch (e) {} });
  await p.goto(URL); await p.waitForTimeout(300);

  const cuentan = { 'Pedir apoyo': 'Pedir apoyo', 'Hoy voy a pedir apoyo': 'Pedir apoyo', 'Decidí pedir apoyo': 'Pedir apoyo',
    'Hice una pausa consciente': 'Pausa consciente', 'Hice una pausa consciente y luego seguí': 'Pausa consciente', 'Voy a ajustar el ritmo': 'Ajustar el ritmo',
    'Sí, voy a pedir apoyo': 'Pedir apoyo', 'Hoy no pude, pero mañana voy a pedir apoyo': 'Pedir apoyo' };
  const noCuentan = ['No voy a pedir apoyo', 'No hice una pausa consciente', 'No ajusté el ritmo', 'Podría pedir apoyo', 'Quizá haga una pausa consciente',
    'Si hace falta, voy a ajustar el ritmo', 'Pensé en pedir apoyo pero seguí solo', 'Me recomendaron pedir apoyo', 'Me dijeron que revisara mi técnica', 'Hablamos de adaptar el speech'];
  const r = await p.evaluate(([si, no]) => ({
    si: Object.entries(si).map(([t, lbl]) => [t, JSON.stringify(accionesRegistradas(t)) === JSON.stringify([lbl])]),
    no: no.map(t => [t, accionesRegistradas(t).length === 0]),
    dos: accionesRegistradas('Pausa consciente. Pedir apoyo'),
    repetida: accionesRegistradas('Pedir apoyo. Después, pedir apoyo otra vez'),
  }), [cuentan, noCuentan]);
  r.si.forEach(([t, b]) => ok(b, `cuenta: «${t}»`));
  r.no.forEach(([t, b]) => ok(b, `no cuenta: «${t}»`));
  ok(JSON.stringify(r.dos) === JSON.stringify(['Pausa consciente', 'Pedir apoyo']), 'dos acciones válidas en un registro cuentan las dos');
  ok(JSON.stringify(r.repetida) === JSON.stringify(['Pedir apoyo']), 'una misma acción cuenta como mucho una vez por registro');

  // En la pantalla real de «Mis patrones», con registros de los últimos 7 días
  const pantalla = await p.evaluate(() => {
    const mk = (accion, situacion, emociones) => newRecord({ situacion, emociones, pensD: 'a', pensC: 'b', accion });
    state.sepaEntries = [
      mk('No voy a pedir apoyo', 'Zona con poco flujo', ['miedo']),
      mk('Podría pedir apoyo', 'Zona con poco flujo', ['miedo']),
      mk('Me recomendaron pedir apoyo', 'Zona con poco flujo', ['ira']),
      mk('Pausa consciente', 'Lluvia / mal tiempo', ['ira']),
      mk('Hice una pausa consciente. Pausa consciente', 'Zona con poco flujo', ['miedo']),
      mk('Voy a ajustar el ritmo', 'Lluvia / mal tiempo', ['tristeza']),
    ];
    goto('diario'); setPatronesRango(7);
    const cards = [...document.querySelectorAll('#patronesBody .mini-card')].map(c => c.textContent.replace(/\s+/g, ' ').trim());
    return { cards, cuenta: document.querySelector('#patronesBody .patron-count').textContent };
  });
  const accion = pantalla.cards.find(c => c.startsWith('Acción más utilizada')) || '';
  ok(accion.includes('Pausa consciente (2)') && !accion.includes('Pedir apoyo'), `«Acción más utilizada»: solo acciones reales (${accion})`);
  const sit = pantalla.cards.find(c => c.startsWith('Situación más repetida')) || '';
  ok(sit.includes('Zona con poco flujo (4)') && pantalla.cuenta.startsWith('6 registros'), `el resto de «Mis patrones» no cambia (${sit}; ${pantalla.cuenta})`);

  // Empates: topEntry() sigue devolviendo todas las empatadas
  const empate = await p.evaluate(() => {
    state.sepaEntries = [newRecord({ situacion: 'x', emociones: [], pensD: 'a', pensC: 'b', accion: 'Pausa consciente' }), newRecord({ situacion: 'x', emociones: [], pensD: 'a', pensC: 'b', accion: 'Pedir apoyo' })];
    renderPatrones();
    return [...document.querySelectorAll('#patronesBody .mini-card')].map(c => c.textContent.replace(/\s+/g, ' ').trim()).find(c => c.startsWith('Acción más utilizada'));
  });
  ok(/Pausa consciente · Pedir apoyo \(1 cada una\)/.test(empate), `empate de acciones como antes (${empate})`);
  ok(errs.length === 0, 'sin errores de JS ' + errs.join(' | '));
  await b.close();
})();
