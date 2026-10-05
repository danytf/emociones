const { chromium } = require('playwright');
const path = require('path'), fs = require('fs');
const URL = 'file:///' + path.resolve(__dirname, '..', 'index.html').replace(/\\/g, '/');
const OUT = path.join(__dirname, 'out', 'resp'); fs.mkdirSync(OUT, { recursive: true });
const SIZES = [[320, 640], [360, 740], [390, 844], [430, 932], [768, 1024], [1024, 768], [1024, 1366], [1280, 800], [1920, 1080]];
const SHOT = new Set(['320', '768', '1024x768']);

const SCREENS = [
  ['aprender', () => { goto('aprender'); document.querySelectorAll('#view-aprender details').forEach(d => d.open = true); }],
  ['bienestar', () => { goto('bienestar'); document.querySelectorAll('#view-bienestar details').forEach(d => d.open = true); }],
  ['herramientas', () => goto('herramientas')],
  ['diario', () => { goto('diario'); document.getElementById('sepaSituacion').value = 'Otra'; toggleSituacionOtra(); showFieldErrors([['sepaEmocionChips', 'Selecciona al menos una emoción.']]); }],
  ['ayuda', () => { openHelp(); document.querySelectorAll('#helpOverlay details').forEach(d => d.open = true); }],
  ['reset0', () => { openReset(); resetStep = 0; renderResetStep(); document.querySelectorAll('#resetBody details').forEach(d => d.open = true); }],
  ['checkin', () => { openReset(); startCheckin(); }],
  ['reset1', () => { openReset(); resetCheckinItems = [CHECKIN_SECTIONS[0].items[1], CHECKIN_SECTIONS[1].items[3]]; resetGoto(1); }],
  ['reset4', () => { openReset(); resetGoto(4); }],
  ['reset5', () => { openReset(); resetMicro = 'Reconocer lo que dice la persona antes de responder'; resetStops = 3; resetGoto(5); }],
  ['reset7', () => { openReset(); resetGoto(7); }],
  ['kit', () => { openReset(); state.kitSenales = ['El «no» me afecta más de lo habitual']; state.kitPedira = 'Quiero que observes dos paradas y me digas una cosa que estoy haciendo bien y una que pueda ajustar.'; openKit(); }],
  ['historial', () => { openReset(); openCheckinHistorial(); }],
  ['breath', () => startBreath(60)],
  ['nsqn', () => { startNoSeQueNecesito(); }],
  ['ficha', () => { goto('diario'); showEmotion('ira'); }],
  ['confirm', () => { openHelp(); borrarTodosDatos(); }],
];

require('fs').mkdirSync(require('path').join(__dirname, 'out'), { recursive: true });
(async () => {
  const browser = await chromium.launch();
  const problems = [];
  for (const [w, h] of SIZES) {
    const tag = w === 1024 ? `${w}x${h}` : String(w);
    const page = await browser.newPage({ viewport: { width: w, height: h } }); await page.addInitScript(()=>{try{localStorage.setItem('wesserWelcomeSeen','1')}catch(e){}});
    const errs = []; page.on('pageerror', e => errs.push(e.message));
    await page.addInitScript(() => { if (!sessionStorage.getItem('s')) { localStorage.setItem('wesserAppState', JSON.stringify({ dataVersion: 3, kitHerramienta: 'Suspiro fisiológico',
      sepaEntries: [{ id: 1, createdAt: new Date().toISOString(), situacion: 'Una situación con un texto muy largo sinespaciosquepodriadesbordarlacajadelhistorialsinoestabienprotegidoporelcss', emociones: ['ira', 'miedo'], pensD: 'No vale la pena', pensC: 'x', accion: 'Pedir apoyo' }] })); sessionStorage.setItem('s', '1'); } });
    await page.goto(URL);
    for (const [name, fn] of SCREENS) {
      await page.evaluate(() => { try { Overlays.close('confirm'); Overlays.close('modal'); Overlays.close('tool'); Overlays.close('reset'); Overlays.close('help'); } catch (e) {} });
      await page.evaluate(`(${fn.toString()})()`);
      await page.waitForTimeout(150);
      const r = await page.evaluate(() => {
        const vw = document.documentElement.clientWidth;
        const scrollers = ['html', 'body', 'main', '.content-wrap', '#resetOverlay', '#toolOverlay', '#helpOverlay', '#modalSheet', '.overlay-body']
          .flatMap(sel => [...document.querySelectorAll(sel)]).filter(el => el.getClientRects().length && el.scrollWidth > el.clientWidth + 1)
          // Intencionado: la Caja de Herramientas ocupa todo el ancho de la ventana (ver #view-herramientas en el CSS)
          .filter(el => !(el.classList.contains('content-wrap') && document.querySelector('#view-herramientas.active')))
          .map(el => (el.id || el.className || el.tagName) + ' ' + el.scrollWidth + '>' + el.clientWidth);
        const top = document.querySelector('#confirmBack.active, #modalBack.active, #toolOverlay.active, #resetOverlay.active, #helpOverlay.active') || document.querySelector('main');
        const over = [...top.querySelectorAll('*')].filter(el => {
          if (!el.getClientRects().length || el.closest('#headerTabs')) return false;
          const b = el.getBoundingClientRect();
          return b.width > 0 && (b.right > vw + 1 || b.left < -1);
        }).slice(0, 5).map(el => el.tagName + '.' + (el.className || '') + ' ' + Math.round(el.getBoundingClientRect().right) + ' «' + (el.textContent || '').trim().slice(0, 30) + '»');
        const header = document.querySelector('header').getBoundingClientRect();
        return { scrollers, over, headerOver: header.right > vw + 1 };
      });
      if (r.scrollers.length || r.over.length || r.headerOver) problems.push(`${tag} ${name}: ${JSON.stringify(r)}`);
      if (SHOT.has(tag)) await page.screenshot({ path: path.join(OUT, `${tag}-${name}.png`), fullPage: false });
    }
    if (errs.length) problems.push(`${tag} errores JS: ${errs.join(' | ')}`);
    await page.close();
  }
  console.log(problems.length ? problems.join('\n') : 'SIN DESBORDAMIENTOS en ' + SIZES.length + ' tamaños × ' + SCREENS.length + ' pantallas');
  await browser.close();
})();
