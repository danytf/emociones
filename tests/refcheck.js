/* Validación de referencias: funciones de manejadores inline, data-action y IDs. */
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs');
const html = fs.readFileSync(path.resolve(__dirname, '..', 'index.html'), 'utf8');
const URL = 'file:///' + path.resolve(__dirname, '..', 'index.html').replace(/\\/g, '/');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage(); await p.addInitScript(()=>{try{localStorage.setItem('wesserWelcomeSeen','1')}catch(e){}});
  const consoleErrors = [];
  p.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') consoleErrors.push(m.type() + ': ' + m.text()); });
  p.on('pageerror', e => consoleErrors.push('pageerror: ' + e.message));
  await p.goto(URL);

  // 1) Funciones invocadas desde atributos on*="…" (estáticos y dentro de plantillas)
  const handlerCode = [...html.matchAll(/\son[a-z]+="([^"]*)"/g)].map(m => m[1]);
  const calls = new Set();
  handlerCode.forEach(code => [...code.matchAll(/(?:^|[^.\w$])([A-Za-z_$][\w$]*)\s*\(/g)].forEach(m => calls.add(m[1])));
  ['if', 'return', 'function'].forEach(k => calls.delete(k));
  const missingFns = await p.evaluate(names => names.filter(n => { try { return typeof eval(n) !== 'function'; } catch (e) { return true; } }), [...calls]);
  // Métodos usados como Objeto.metodo( en manejadores
  const methodCalls = new Set();
  handlerCode.forEach(code => [...code.matchAll(/([A-Za-z_$][\w$]*)\.([A-Za-z_$][\w$]*)\s*\(/g)].forEach(m => methodCalls.add(m[1] + '.' + m[2])));
  const missingMethods = await p.evaluate(list => list.filter(x => { const [o, m] = x.split('.'); try { const obj = eval(o); return !obj || typeof obj[m] !== 'function'; } catch (e) { return !['document', 'this', 'event', 'window'].includes(o); } }), [...methodCalls]);

  // 2) data-action usados vs registrados
  const actionsUsed = new Set([...html.matchAll(/data-action="([^"$]+)"/g)].map(m => m[1]));
  const missingActions = await p.evaluate(list => list.filter(a => !Object.prototype.hasOwnProperty.call(ACTIONS, a)), [...actionsUsed]);
  const unusedActions = await p.evaluate(list => Object.keys(ACTIONS).filter(a => !list.includes(a)), [...actionsUsed]);

  // 3) IDs: getElementById('x') y atributos que referencian IDs
  const idRefs = new Set([...html.matchAll(/getElementById\('([^'$]+)'\)/g)].map(m => m[1]));
  [...html.matchAll(/\s(?:aria-controls|aria-labelledby|aria-describedby|for)="([^"$]+)"/g)].forEach(m => m[1].split(/\s+/).forEach(id => idRefs.add(id)));
  const definedIds = new Set([...html.matchAll(/\sid="([^"$]+)"/g)].map(m => m[1]));
  // IDs creados por JS (p.createElement / el.id = …)
  [...html.matchAll(/\.id\s*=\s*'([^']+)'/g)].forEach(m => definedIds.add(m[1]));
  const missingIds = [...idRefs].filter(id => !definedIds.has(id));
  const dupIds = [...html.matchAll(/\sid="([^"$]+)"/g)].map(m => m[1]).filter((id, i, a) => a.indexOf(id) !== i);

  console.log('Funciones llamadas desde HTML:', calls.size, '→ inexistentes:', JSON.stringify(missingFns));
  console.log('Métodos llamados desde HTML:', methodCalls.size, '→ inexistentes:', JSON.stringify(missingMethods));
  console.log('data-action distintos:', actionsUsed.size, '→ sin registrar:', JSON.stringify(missingActions), '| registrados sin uso:', JSON.stringify(unusedActions));
  console.log('IDs referenciados:', idRefs.size, '→ sin definir:', JSON.stringify(missingIds));
  console.log('IDs duplicados en el código:', JSON.stringify([...new Set(dupIds)]));
  console.log('Consola al cargar:', JSON.stringify(consoleErrors));
  await b.close();
})();
