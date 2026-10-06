// Tablets antiguas: la app no se rompe sin MediaQueryList.addEventListener (Safari < 14), las ventanas no
// dependen solo de «inset» (Safari < 14.1, Chrome < 87) y el script no usa sintaxis ES2020 («?.», «??»)
const { chromium } = require('playwright'); const path = require('path'), fs = require('fs');
const FILE = path.resolve(__dirname, '..', 'index.html');
const URL = 'file:///' + FILE.split(String.fromCharCode(92)).join('/');
const ok = (c, m) => console.log((c ? 'PASS ' : 'FAIL ') + m);
(async () => {
  // Sintaxis: el script de la app no debe contener «?.» ni «??» (impiden que se ejecute en Safari < 13.1)
  const html = fs.readFileSync(FILE, 'utf8');
  const script = html.slice(html.lastIndexOf('<script>'), html.lastIndexOf('</script>'));
  const sinCadenas = script.replace(/`(?:\\[\s\S]|\$\{|[^`\\$])*`|'(?:\\.|[^'\\\n])*'|"(?:\\.|[^"\\\n])*"|\/\*[\s\S]*?\*\/|\/\/[^\n]*/g, '""');
  ok(!/\?\.(?=[A-Za-z_$(\[])/.test(sinCadenas) && !/\?\?/.test(sinCadenas), 'el script no usa «?.» ni «??» (ES2020)');

  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 820, height: 1180 } }); const errs = [];
  p.on('pageerror', e => errs.push(e.message));
  await p.addInitScript(() => {
    // Como Safari < 14: MediaQueryList sin addEventListener (solo addListener)
    // addEventListener se hereda de EventTarget: hay que anularlo en el propio MediaQueryList
    Object.defineProperty(MediaQueryList.prototype, 'addEventListener', { value: undefined, configurable: true });
    Object.defineProperty(MediaQueryList.prototype, 'removeEventListener', { value: undefined, configurable: true });
    localStorage.setItem('wesserWelcomeSeen', '1'); localStorage.setItem('wesserLastView', 'aprender');
  });
  await p.goto(URL); await p.waitForTimeout(300);
  await p.locator('#headerTabs [data-view="herramientas"]').click(); await p.waitForTimeout(150);
  ok(await p.evaluate(() => document.getElementById('view-herramientas').classList.contains('active')) && errs.length === 0, 'sin MediaQueryList.addEventListener la app arranca y las pestañas responden' + (errs.length ? ' — ' + errs.join(' | ') : ''));

  // Ventanas: las reglas no dependen solo de «inset»; al quitarlo, siguen ocupando toda la pantalla
  // En el CSS fuente: el navegador traduce «inset» a top/right/bottom/left al leerlo, así que el CSSOM no sirve
  const css = html.slice(html.indexOf('<style>'), html.indexOf('</style>'));
  const reglas = ['.overlay', '.modal-back'].map(sel => {
    const i = css.search(new RegExp('(^|\\n)' + sel.replace('.', '\\.') + '\\{'));
    const cuerpo = i < 0 ? '' : css.slice(i, css.indexOf('}', i));
    return { sel, ok: ['top', 'right', 'bottom', 'left'].every(k => new RegExp('[{;\\s]' + k + ':0').test(cuerpo)) };
  });
  ok(reglas.every(x => x.ok), 'las ventanas tienen top/right/bottom/left además de inset: ' + reglas.map(x => x.sel + (x.ok ? ' sí' : ' NO')).join(', '));
  await p.evaluate(() => startBreath(60)); await p.waitForTimeout(150);
  const caja = await p.evaluate(() => { const r = document.getElementById('toolOverlay').getBoundingClientRect(); return [Math.round(r.width), Math.round(r.height)]; });
  ok(caja[0] === 820 && caja[1] === 1180, `la ventana de herramienta ocupa toda la pantalla (${caja.join('×')})`);
  ok(errs.length === 0, 'sin errores de JS ' + errs.join(' | '));
  await b.close();
})();
