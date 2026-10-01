/* Lanza todas las baterías sobre ../index.html y muestra un resumen.
   Uso:  node run-all.js          → pruebas locales
         node run-all.js --live   → además, pruebas contra la web publicada en GitHub Pages */
const { execFileSync } = require('child_process');
const path = require('path');

const LOCAL = [
  ['fulltest', 'Batería completa (navegación, Diario, Checkpoint, Reset, Kit, datos, XSS)'],
  ['sectest', 'Seguridad: saneamiento, importación y acciones'],
  ['importtest', 'Importación de archivos'],
  ['persisttest', 'Persistencia, fechas, exportación y límites'],
  ['overlaytest', 'Ventanas: foco, Escape, inert, confirmaciones'],
  ['a11ytest', 'Accesibilidad: chips, navegación, temporizadores, tamaños'],
  ['formtest', 'Errores de formulario en línea'],
  ['kittest', 'Kit de Emergencia'],
  ['histtest', 'Historial del Reset'],
  ['undotest', 'Testea: contador y deshacer'],
  ['stops3', 'Testea: +3 y «Ya he hecho las 10»'],
  ['nsqntest', 'No sé qué necesito'],
  ['sepaintro', 'Explicación plegable del Diario'],
  ['welcometest', 'Bienvenida de primera vez'],
  ['atrastest', 'Atrás en el Reset, gesto atrás del móvil y plan del Kit'],
  ['axetest', 'axe-core WCAG 2.2 A/AA en claro y oscuro'],
  ['resp', 'Responsive: 9 anchos × 17 pantallas'],
  ['refcheck', 'Referencias: funciones, acciones e IDs'],
];
const LIVE = [
  ['livetest', 'Web publicada en GitHub Pages'],
  ['offlineuse', 'Uso sin conexión con la app ya abierta'],
];

const suites = process.argv.includes('--live') ? LOCAL.concat(LIVE) : LOCAL;
let pass = 0, fail = 0;
const failures = [];
for (const [file, desc] of suites) {
  let out = '';
  try {
    out = execFileSync(process.execPath, [path.join(__dirname, file + '.js')], { cwd: __dirname, encoding: 'utf8', timeout: 10 * 60 * 1000, stdio: ['ignore', 'pipe', 'pipe'] });
  } catch (e) {
    out = (e.stdout || '') + (e.stderr || '');
    failures.push(`${file}: terminó con error\n${out.split('\n').slice(-8).join('\n')}`);
  }
  const p = (out.match(/^PASS /gm) || []).length;
  const f = (out.match(/^FAIL .*$/gm) || []);
  pass += p; fail += f.length;
  f.forEach(line => failures.push(`${file}: ${line}`));
  // Las pruebas que no usan PASS/FAIL (axe, responsive, referencias) imprimen su propio resumen
  const summary = p || f.length ? `${p} pass, ${f.length} fail` : out.trim().split('\n').slice(-1)[0];
  console.log(`${f.length ? '✗' : '✓'} ${file.padEnd(12)} ${desc}\n    ${summary}`);
}
console.log(`\nTOTAL: ${pass} comprobaciones superadas, ${fail} fallidas`);
if (failures.length) { console.log('\nFallos:\n' + failures.join('\n')); process.exitCode = 1; }
