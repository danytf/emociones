/* axe-core (WCAG 2.0/2.1/2.2 A y AA) sobre las pantallas principales, en modo claro y oscuro. */
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs');
const URL = 'file:///' + path.resolve(__dirname, '..', 'index.html').replace(/\\/g, '/');
const AXE = fs.readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8');
const OUT = path.join(__dirname, 'out', 'dark'); fs.mkdirSync(OUT, { recursive: true });
require('fs').mkdirSync(require('path').join(__dirname, 'out'), { recursive: true });
(async () => {
  const b = await chromium.launch();
  const summary = {};
  for (const theme of ['light', 'dark']) {
    const p = await b.newPage({ viewport: { width: 820, height: 1180 } }); await p.addInitScript(()=>{try{localStorage.setItem('wesserWelcomeSeen','1')}catch(e){}});
    await p.addInitScript(t => { localStorage.setItem('wesserAppState', JSON.stringify({ dataVersion: 3, theme: t, kitHerramienta: 'Suspiro fisiológico',
      sepaEntries: [{ id: 1, createdAt: new Date().toISOString(), situacion: 'Zona con poco flujo', emociones: ['ira'], pensD: 'a', pensC: 'b', accion: 'c' }],
      checkpoints: [{ id: 2, createdAt: new Date().toISOString(), fatiga: 5, emocional: 5, nota: 'n', decision: 'Sigo igual' }],
      exitos: [{ id: 3, createdAt: new Date().toISOString(), conducta: 'x', repetir: 'y' }], resetHistory: [{ id: 5, createdAt: new Date().toISOString(), senal: 's', micro: 'Simplificar la apertura', stops: 10, pacto: 'p' }] })); }, theme);
    await p.goto(URL);
    const states = {
      aprender: () => { goto('aprender'); },
      estados: () => { startEstados(); },
      estadoFicha: () => { openEstado('fatiga'); },
      bienestar: () => { goto('bienestar'); },
      herramientas: () => { goto('herramientas'); },
      diario: () => { goto('diario'); showFieldErrors([['sepaAccion', 'Indica qué vas a hacer ahora.']]); },
      ayuda: () => { openHelp(); document.querySelectorAll('#helpOverlay details').forEach(d => d.open = true); },
      ficha: () => { goto('diario'); showEmotion('ira'); },
      reset0: () => { openReset(); },
      checkin: () => { openReset(); startCheckin(); },
      reset4: () => { openReset(); resetGoto(4); },
      reset5: () => { openReset(); resetMicro = 'Simplificar la apertura'; resetStops = 3; resetGoto(5); },
      kit: () => { openReset(); openKit(); },
      historial: () => { openReset(); openCheckinHistorial(); },
      breath: () => { startBreath(60); },
      exito: () => { startExito(); },
      confirm: () => { borrarTodosDatos(); },
      toast: () => { notify('No se ha podido guardar.', 'error'); },
      rpFoco: () => { finalizarRP('Escuchar hasta el final'); },
      momento: () => { selectMomentoDecidir('evita'); },
      pedir: () => { startPedirFeedback(); selectPedirFeedback('Mira mi ritmo'); finalizarPedirFeedback(); },
      anchorGuide: () => { state.confidenceAnchors = [{ word: 'Calma', memory: 'm' }]; runAnchorGuide(0); },
      checkpoint: () => { openCheckpoint(); },
      preTurno: () => { startPreTurno(); },
      reset7: () => { openReset(); resetGoto(7); },
      nsqn: () => { startNoSeQueNecesito(); setNsqnAnswer('dias', true); setNsqnAnswer('cabeza', true); },
      testeaOk: () => { openReset(); resetMicro = 'Simplificar la apertura'; resetStops = 10; resetGoto(5); },
    };
    for (const [name, fn] of Object.entries(states)) {
      await p.evaluate(() => { ['confirm', 'modal', 'tool', 'reset', 'help'].forEach(n => Overlays.close(n)); hideToast(); });
      await p.evaluate(`(${fn.toString()})()`);
      await p.waitForTimeout(250);
      if (!(await p.evaluate(() => !!window.axe))) await p.addScriptTag({ content: AXE });
      const res = await p.evaluate(async () => {
        const r = await axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'] } });
        return r.violations.map(v => ({ id: v.id, impact: v.impact, n: v.nodes.length, ej: v.nodes.slice(0, 2).map(x => x.target.join(' ') + ' → ' + (x.any[0] ? x.any[0].message : '')).join(' | ') }));
      });
      res.forEach(v => { const k = `${theme} · ${v.id} (${v.impact})`; summary[k] = summary[k] || []; summary[k].push(`${name}[${v.n}]: ${v.ej}`); });
      if (theme === 'dark' && ['herramientas', 'diario', 'kit', 'ayuda', 'rpFoco', 'pedir', 'anchorGuide'].includes(name)) await p.screenshot({ path: path.join(OUT, name + '.png') });
    }
    await p.close();
  }
  const keys = Object.keys(summary);
  console.log(keys.length ? keys.map(k => k + '\n   ' + summary[k].slice(0, 4).join('\n   ')).join('\n') : 'axe: 0 infracciones WCAG A/AA en claro y oscuro');
  await b.close();
})();
