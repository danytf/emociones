# Pruebas automáticas

La app es **solo `index.html`**. Esta carpeta no forma parte de ella: sirve para comprobar,
después de cualquier cambio, que no se ha roto nada. GitHub Pages la ignora a efectos de la app.

## Preparación (una sola vez)

Necesitas [Node.js](https://nodejs.org). Desde esta carpeta:

```
npm run setup
```

Instala Playwright (navegador automatizado) y axe-core (comprobación de accesibilidad).

## Ejecutar

```
npm test            # todas las pruebas sobre ../index.html
npm run test:live   # además, prueba la web publicada en GitHub Pages
```

Al final aparece un resumen. Cualquier línea con ✗ indica algo que revisar.
Las capturas y archivos temporales se guardan en `out/` (ignorada por git).

## Qué cubren

| Archivo | Qué comprueba |
|---|---|
| `fulltest.js` | Recorrido completo: navegación, Diario, Checkpoint, Qué ha funcionado, todas las herramientas, Reset de principio a fin, Kit, exportar/importar/borrar y prueba de seguridad (XSS) |
| `sectest.js`, `importtest.js` | Saneamiento de datos, importación de archivos correctos, corruptos, manipulados y antiguos |
| `persisttest.js` | Guardado diferido, fechas, migraciones, exportación y límites de texto |
| `overlaytest.js` | Ventanas: foco, Escape, fondo inactivo, confirmaciones |
| `a11ytest.js`, `axetest.js` | Accesibilidad (WCAG 2.2 A/AA) en modo claro y oscuro |
| `formtest.js` | Mensajes de error en los formularios |
| `kittest.js`, `histtest.js`, `undotest.js`, `stops3.js`, `nsqntest.js`, `sepaintro.js`, `welcometest.js` | Funciones concretas |
| `resp.js` | Sin desbordamientos horizontales en 9 anchos de pantalla |
| `refcheck.js` | Que existan todas las funciones, acciones e IDs usados en el HTML |
| `livetest.js`, `offlineuse.js` | La web publicada y su uso sin conexión |
