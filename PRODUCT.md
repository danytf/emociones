# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Captador en calle** (captación de socios para ONG, en calle y puerta a puerta). Usa la app durante el turno: en la parada, entre paradas o en tiempos muertos, de pie, con una mano, con prisa y a menudo a pleno sol. Su trabajo es parar a personas, hacer el speech y conseguir firmas; recibe muchos «no» seguidos y puede entrar en mala racha.
- **Captador fuera de turno**. Antes de salir, al terminar o en casa: aprende los fundamentos, registra en el Diario, repasa lo que le funcionó y prepara su Kit de Emergencia.
- **Responsable de equipo (RE)**. La usa o la recomienda para acompañar a su equipo. No tiene acceso a los datos de cada captador (ver Capacidades y restricciones).

## Product Purpose

Herramientas prácticas para que el captador gestione sus emociones en el día a día del trabajo de calle: reconocer lo que siente, cortar una reacción automática, salir de una mala racha y cuidar su bienestar para sostener el trabajo en el tiempo.

Éxito, según el departamento:
- **Menos malas rachas largas**: el captador se recupera antes de llegar a un bloqueo.
- **Uso autónomo**: la abre sin que nadie se lo pida, sobre todo el Modo Reset y las herramientas.
- **Menos abandonos**: ayuda a que los captadores aguanten y no dejen el trabajo.

## Positioning

No es una app genérica de bienestar: traduce la formación de inteligencia emocional de Wesser a herramientas para el momento exacto del turno. Habla el idioma del trabajo (paradas, firmas, zona, speech, «irse a 0», resultado puntual frente a rendimiento técnico) e incluye protocolos propios de la formación Wesser, como el Modo Reset (R-E-S-E-T con Testea de 10 paradas), el Kit de Emergencia del captador y el Diario S-E-P-A.

## Operating Context

- Se usa en el móvil y en la tablet del captador; también en escritorio.
- Momentos de uso reales: antes de salir, al volver a calle tras una mala interacción, a mitad de turno (Checkpoint), en mala racha (Reset), al cierre del turno y fuera del trabajo.
- Se publica en GitHub Pages (`danytf/emociones`) y se abre por enlace.
- Contenido basado en los documentos de formación de Wesser, resumidos en `compendio_inteligencia_emocional_wesser.md` y `prompt_claude_app_captadores_v5.md`.
- La mantiene el Departamento de Formación de Wesser. Pertenece a la familia de apps Wesser junto a «Banco de objeciones» (`rebatidapp`) y «Biblioteca ONG» (`bibliowesser`).

## Capabilities and Constraints

**Secciones:** Aprender (fundamentos y las 6 emociones básicas), Bienestar (hábitos y recuperación), Herramientas (reinicio y regulación, foco, anclaje, seguimiento del turno), Diario S-E-P-A (Situación, Emoción, Pensamiento, Acción, con patrones e historial) y Modo Reset (check-in de señales, R-E-S-E-T, Kit de Emergencia, historial). Hay accesos rápidos «¿Qué necesitas ahora?», una ayuda y una bienvenida la primera vez.

**Restricciones que no se negocian:**
- **Los datos se quedan en el móvil.** Todo se guarda en `localStorage` del dispositivo: sin servidor, sin analítica, sin cuentas. Ni el RE ni Wesser ven el diario ni los registros. Existe exportar, importar y borrar datos, que controla el propio usuario.
- **No es terapia.** Es una herramienta de autogestión. Cuando el malestar se repite, dura semanas o afecta fuera del trabajo, la app lo dice claramente y anima a hablarlo con el responsable, con alguien de confianza o con un profesional. Las herramientas no sustituyen al descanso.

**Técnicas:**
- Un único archivo `index.html` (HTML, CSS y JS en línea; datos en bloques JSON), sin frameworks, sin compilación, sin dependencias ni recursos externos.
- Una vez cargada funciona sin cobertura (guardar, herramientas, Reset, Kit). Recargar la página sin conexión no funciona.
- Pruebas automáticas en `tests/` (Playwright en Chromium, WebKit y Firefox, y axe-core).

**Terminología fija:** Modo Reset, Kit de Emergencia, Diario S-E-P-A, Checkpoint, «Qué ha funcionado», paradas, captador, responsable (RE).

## Brand Commitments

- Marca Wesser («Un buen trabajo»), con logotipo oficial incrustado. Forma parte de la familia de apps Wesser, cuyas reglas están en `../GUIA_DISENO_WESSER.md`; esta app es una de sus referencias.
- Voz: español de España, de tú, frases cortas, cercana y sin dramatizar. Botones que dicen la acción, errores que explican cómo arreglarlo, sin signos de exclamación ni emojis en la interfaz.

## Evidence on Hand

- Contenido real de formación: `compendio_inteligencia_emocional_wesser.md` y `prompt_claude_app_captadores_v5.md` (11 documentos de origen).
- No hay testimonios, métricas de uso ni datos de resultados: la app no recoge datos. No se deben inventar.

## Product Principles

1. **Lo que se necesita ahora, a un toque.** En calle no hay tiempo: la herramienta adecuada al momento del turno va primero y abre directamente.
2. **Separar resultado de rendimiento.** Todo el producto refuerza que una mala racha no define el valor ni la técnica del captador; se ajusta una sola variable y se prueba.
3. **Acompañar sin dramatizar ni diagnosticar.** Tono sereno y práctico; ante señales serias, derivar a personas, nunca sustituirlas.
4. **Lo tuyo es tuyo.** Privacidad por diseño: nada sale del dispositivo y el usuario decide qué guarda, exporta o borra.
5. **Funcionar en condiciones reales.** Una mano, sol, prisa y mala cobertura son el caso normal, no el extremo.

## Accessibility & Inclusion

- WCAG 2.2 A/AA en tema claro y oscuro (comprobado con axe-core); contraste de texto de 4,5:1 como mínimo.
- Áreas táctiles de 44 × 44 px, navegación inferior al alcance del pulgar en móvil, uso con teclado y lector de pantalla (foco atrapado en pantallas completas, Escape para cerrar).
- Respeta `prefers-reduced-motion`: por ejemplo, el círculo de respiración no cambia de tamaño y la fase se indica con texto.
