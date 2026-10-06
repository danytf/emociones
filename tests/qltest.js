// Barra compacta de «¿Qué necesitas ahora?» (fuera de Herramientas) en móvil: con un segundo botón
// («Seguir mi test» o «Activar mi plan») el título no se parte en 3 líneas ni se monta con la pista
const { chromium } = require('playwright'); const path = require('path');
const URL = 'file:///' + path.resolve(__dirname, '..', 'index.html').split(String.fromCharCode(92)).join('/');
const ok = (c, m) => console.log((c ? 'PASS ' : 'FAIL ') + m);
const test = { step: 5, senal: 'x', examResultado: '', examRendimiento: '', aspecto1: '', aspecto2: '', micro: 'Simplificar la apertura', stops: 4, pacto: '', aprendizaje: '', ajusteNuevo: '', observacion: '' };
(async () => {
  const b = await chromium.launch(); const errs = [];
  const medir = async (w, st) => {
    const p = await b.newPage({ viewport: { width: w, height: 800 } }); p.on('pageerror', e => errs.push(e.message));
    await p.addInitScript(s => { localStorage.setItem('wesserWelcomeSeen', '1'); localStorage.setItem('wesserLastView', 'aprender'); localStorage.setItem('wesserAppState', JSON.stringify(s)); }, st);
    await p.goto(URL); await p.waitForTimeout(150);
    const r = await p.evaluate(() => {
      const lb = document.querySelector('.ql-compact-btn .ql-lb');
      return { lineas: Math.round(lb.getBoundingClientRect().height / parseFloat(getComputedStyle(lb).lineHeight)),
        pista: parseFloat(getComputedStyle(document.querySelector('.ql-compact-btn .ql-go')).fontSize) > 0,
        desborda: document.documentElement.scrollWidth > innerWidth + 1,
        alturas: [...document.querySelectorAll('.ql-compact-bar button')].filter(x => x.getBoundingClientRect().width > 0).map(x => x.getBoundingClientRect().height) };
    });
    await p.close(); return r;
  };
  for (const [n, st] of [['test a medias', { dataVersion: 3, resetProgress: test }], ['Kit preparado', { dataVersion: 3, kitHerramienta: 'Suspiro fisiológico' }]]) {
    for (const w of [360, 375, 390, 420, 430, 460, 500, 559]) {
      const r = await medir(w, st);
      ok(r.lineas <= 2 && !r.desborda && r.alturas.every(h => h >= 44), `${n}, ${w} px: título en ≤2 líneas, sin desbordes y botones ≥44 px (${r.lineas} líneas)`);
      if (w > 420) ok(!r.pista, `${n}, ${w} px: la pista «Ver accesos rápidos» no compite con el segundo botón`);
    }
    const r6 = await medir(600, st);
    ok(r6.pista && r6.lineas === 1, `${n}, 600 px: con sitio, vuelve la pista y el título va en una línea`);
  }
  const solo = await medir(430, { dataVersion: 3 });
  ok(solo.pista && solo.lineas === 1, 'sin segundo botón, a 430 px la pista se mantiene como antes');
  ok(errs.length === 0, 'sin errores de JS ' + errs.join(' | '));
  await b.close();
})();
