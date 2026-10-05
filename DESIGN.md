---
name: Gestión emocional · Wesser
description: Herramientas prácticas para el día a día del captador
colors:
  rojo-wesser: "#CC2E34"
  rojo-wesser-hondo: "#A8242A"
  rojo-wesser-tinte: "#FAEAEB"
  antracita-wesser: "#292C2F"
  gris-niebla-wesser: "#F2F4F4"
  blanco: "#FFFFFF"
  linea: "#E1E5E5"
  linea-marcada: "#CDD3D2"
  tinta: "#1C1F21"
  tinta-media: "#4A5250"
  tinta-suave: "#646C69"
  azul-petroleo: "#2F7494"
  azul-petroleo-tinta: "#215670"
  indigo-suave: "#5A5FA8"
  indigo-suave-tinta: "#43477F"
  verde-pino: "#3C8158"
  verde-pino-tinta: "#2C6143"
  ocre: "#B7791F"
  ocre-tinta: "#7A4F12"
  ambar-reset: "#E0A030"
  ambar-reset-hondo: "#D4942A"
  verde-correcto: "#047857"
  rojo-error: "#B91C1C"
  carbon-noche: "#1B1D1F"
  antracita-noche: "#292C2F"
  linea-noche: "#3C4145"
  linea-marcada-noche: "#4D5357"
  tinta-noche: "#F2F4F4"
  tinta-media-noche: "#C4CAC8"
  tinta-suave-noche: "#A3ABA8"
  rojo-wesser-noche: "#EF6A6E"
  rosa-wesser-noche: "#F4A3A6"
typography:
  page-title:
    fontFamily: "Montserrat, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif"
    fontSize: "26px"
    fontWeight: 700
    lineHeight: 1.25
    letterSpacing: "-0.015em"
  page-title-tools:
    fontFamily: "Montserrat, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif"
    fontSize: "28px"
    fontWeight: 700
    lineHeight: 1.25
    letterSpacing: "-0.015em"
  dialog-title:
    fontFamily: "Montserrat, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif"
    fontSize: "22px"
    fontWeight: 700
  card-title:
    fontFamily: "Montserrat, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif"
    fontSize: "17px"
    fontWeight: 700
  section-label:
    fontFamily: "Montserrat, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif"
    fontSize: "12px"
    fontWeight: 750
    letterSpacing: "0.08em"
  field-label:
    fontFamily: "Montserrat, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif"
    fontSize: "11.5px"
    fontWeight: 700
    letterSpacing: "0.07em"
  timer:
    fontFamily: "Montserrat, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif"
    fontSize: "44px"
    fontWeight: 800
    fontFeature: "tnum"
  body:
    fontFamily: "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.5
  reading:
    fontFamily: "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.65
  row-title:
    fontFamily: "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif"
    fontSize: "15px"
    fontWeight: 650
    lineHeight: 1.3
  control:
    fontFamily: "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif"
    fontSize: "13.5px"
    fontWeight: 650
    lineHeight: 1.3
  nav-label:
    fontFamily: "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif"
    fontSize: "11px"
    fontWeight: 650
  meta:
    fontFamily: "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif"
    fontSize: "12px"
    fontWeight: 650
    fontFeature: "tnum"
rounded:
  sm: "10px"
  control: "12px"
  md: "14px"
  lg: "20px"
  sheet: "24px"
  pill: "999px"
spacing:
  "1": "4px"
  "2": "8px"
  "3": "12px"
  "4": "16px"
  "5": "20px"
  "6": "24px"
  "8": "32px"
  "10": "40px"
components:
  button-primary:
    backgroundColor: "{colors.rojo-wesser}"
    textColor: "{colors.blanco}"
    rounded: "{rounded.md}"
    padding: "14px 18px"
    height: "52px"
  button-primary-hover:
    backgroundColor: "{colors.rojo-wesser-hondo}"
  button-secondary:
    backgroundColor: "{colors.blanco}"
    textColor: "{colors.tinta}"
    rounded: "{rounded.md}"
    padding: "14px 18px"
    height: "48px"
  button-secondary-hover:
    backgroundColor: "{colors.gris-niebla-wesser}"
  button-dark:
    backgroundColor: "{colors.tinta}"
    textColor: "{colors.blanco}"
    rounded: "{rounded.md}"
    padding: "14px 18px"
    height: "48px"
  button-dark-hover:
    backgroundColor: "{colors.tinta-media}"
  button-reset:
    backgroundColor: "{colors.ambar-reset}"
    textColor: "{colors.antracita-wesser}"
    rounded: "{rounded.md}"
    padding: "14px 18px"
    height: "52px"
  button-reset-hover:
    backgroundColor: "{colors.ambar-reset-hondo}"
  button-icon:
    backgroundColor: "transparent"
    textColor: "{colors.tinta-media}"
    rounded: "{rounded.control}"
    size: "44px"
  chip:
    backgroundColor: "{colors.blanco}"
    textColor: "{colors.tinta}"
    rounded: "{rounded.pill}"
    padding: "9px 14px"
    height: "44px"
  chip-selected:
    backgroundColor: "{colors.rojo-wesser-tinte}"
    textColor: "{colors.rojo-wesser-hondo}"
    rounded: "{rounded.pill}"
  input:
    backgroundColor: "{colors.blanco}"
    textColor: "{colors.tinta}"
    rounded: "{rounded.control}"
    padding: "12px 14px"
  card:
    backgroundColor: "{colors.blanco}"
    rounded: "{rounded.lg}"
    padding: "20px"
  tool-row:
    backgroundColor: "{colors.blanco}"
    textColor: "{colors.tinta}"
    rounded: "{rounded.md}"
    padding: "12px 16px 12px 12px"
    height: "72px"
  nav-tab:
    backgroundColor: "transparent"
    textColor: "{colors.tinta-media}"
    rounded: "{rounded.control}"
    height: "56px"
  nav-tab-active:
    backgroundColor: "{colors.rojo-wesser-tinte}"
    textColor: "{colors.rojo-wesser-hondo}"
  toast:
    backgroundColor: "{colors.antracita-wesser}"
    textColor: "{colors.blanco}"
    rounded: "{rounded.md}"
    padding: "12px 12px 12px 16px"
---

# Design System: Gestión emocional · Wesser

## Overview

**Creative North Star: "El botiquín de bolsillo"**

Cada herramienta está en su sitio, etiquetada y a un toque: se abre, se usa y se guarda. La app no decora ni entretiene. Ordena. El captador llega con el pulso alto, en mitad de un turno, y la interfaz le devuelve una estructura calmada. Superficies claras y limpias, un único rojo para la acción que importa y tonos apagados que distinguen compartimentos sin gritar.

La densidad es de consulta rápida: filas completas que se pulsan enteras, secciones plegables para lo largo y pantallas completas con su propia cabecera para cada herramienta o paso del Reset. Los componentes son **tranquilos y firmes**: borde fino, sombra casi imperceptible y nada que salte, rebote o se desplace al pasar el ratón. La marca Wesser vive en el logotipo, en el rojo de la acción principal y en Montserrat, no en adornos.

Sistema de la familia Wesser: comparte base con «Banco de objeciones» y «Biblioteca ONG» (reglas comunes en `../GUIA_DISENO_WESSER.md`). Tiene tema claro por defecto y oscuro opcional. El rasgo propio de esta app es la calma y el acompañamiento: accesos rápidos «¿Qué necesitas ahora?», tonos suaves por grupo de herramientas y un Reset en ámbar.

**Key Characteristics:**
- Un solo rojo de marca con función: acción principal, elemento activo y foco.
- Tonos apagados por compartimento (alivio, foco, anclaje, seguimiento), aplicados como icono en cuadrado tintado y punto de color.
- Ámbar reservado al Modo Reset y al Kit de Emergencia.
- Iconos SVG de línea (1,75 px) en sprite; nunca emojis en la interfaz.
- Montserrat para títulos, etiquetas y cifras; fuente del sistema para leer.
- Sin degradados, sin texturas, sin sombras marcadas.

## Colors

Neutros fríos de gris verdoso con un rojo corporativo único, cuatro tonos apagados por grupo y un ámbar exclusivo del Reset.

### Primary
- **Rojo Wesser**: botón primario de las secciones (uno por pantalla: «Guardar registro» del Diario, «Siguiente» de la bienvenida), tramo recorrido del deslizador, punto de «Reset a medias», anillo de foco y halo de campo enfocado. En oscuro pasa a **Rojo Wesser noche** para puntos, bordes y tintes.
- **Rojo Wesser hondo**: texto rojo sobre fondo claro o tintado (pestaña activa, chip seleccionado) y hover del botón primario. En oscuro su papel lo hace **Rosa Wesser noche**.
- **Tinte Rojo Wesser**: fondo de la pestaña activa y del chip seleccionado (rojo al 10 % sobre blanco; en oscuro, al 16 %).

### Secondary
- **Ámbar Reset**: botón principal del Reset y del Kit de Emergencia («Activar mi plan», «Preparar mi Kit», «Guardar mi plan» sin plan previo), siempre con texto Antracita Wesser (contraste 6,6:1). Su hover es **Ámbar Reset hondo**. Al 16–18 % tiñe la pestaña Reset, el acceso «Estoy en una mala racha», las insignias de paso y el bloque «Test completado».

### Tertiary
Tonos por grupo de herramientas. Cada uno tiene su versión «tinta», que cumple 4,5:1 para texto sobre su propio tinte:
- **Azul petróleo**: reinicio y regulación (alivio); también el círculo de respiración.
- **Índigo suave**: foco.
- **Verde pino**: anclaje y confirmaciones de «Qué ha funcionado» y check-in. Nunca como fondo de botón.
- **Ocre**: seguimiento del turno y todo el Modo Reset (su tinta colorea el título y las insignias del Reset).

### Neutral
- **Gris niebla Wesser**: fondo de la página y de las pantallas completas; relleno de bloques interiores (citas, mini-tarjetas, pasos del Kit).
- **Blanco**: tarjetas, filas, cabecera, barra inferior, campos.
- **Línea** y **Línea marcada**: bordes de tarjetas y separadores; bordes de campos, chips y botón secundario.
- **Tinta**, **Tinta media** y **Tinta suave**: texto principal; texto secundario e iconos de botón; etiquetas y metadatos (el mínimo permitido para texto).
- **Antracita Wesser**: aviso breve (toast), texto sobre ámbar y botón principal dentro de las herramientas.
- **Tema oscuro**: Carbón noche (fondo), Antracita noche (superficies), Línea noche, Línea marcada noche, Tinta noche, Tinta media noche y Tinta suave noche.

### Named Rules
**The One Primary Rule.** Un solo botón principal por pantalla, y su color dice dónde estás: **ámbar** en el Reset y el Kit, **rojo Wesser** en las secciones (Diario, bienvenida) y **antracita** dentro de las herramientas, que se usan en plena calle y piden calma. Cuando «Activar mi plan» acompaña a otra pantalla (barra compacta, columna lateral) va neutro con el rayo en ocre, para no competir con el principal de esa pantalla. El verde no es color de botón.

**The One Red Rule.** El rojo de marca marca la acción principal de las secciones y lo que está activo; el resto es neutro, tintado o antracita.

**The Amber Means Reset Rule.** El ámbar solo aparece en el Modo Reset, el Kit de Emergencia y sus accesos. Si algo es ámbar, lleva al Reset.

**The Tone Is a Dot Rule.** Los tonos de grupo se aplican en el cuadrado tintado del icono (tono al 12 %) y en un punto de 8 px junto al título de sección. Nunca como fondo sólido con texto blanco.

## Typography

**Display Font:** Montserrat (incrustada en base64, pesos 600–800; reserva system-ui)
**Body Font:** fuente del sistema (system-ui, -apple-system, Segoe UI, Roboto)

**Character:** Montserrat pone la voz de marca en títulos, etiquetas, pestañas de escritorio y cifras, firme y geométrica. La fuente del sistema se encarga de leer y de actuar (botones, chips, filas y barra inferior): es la que el móvil renderiza mejor a pleno sol y la más compacta.

### Hierarchy
- **Título de página** (Montserrat 700, 26 px, 1,25, −0,015em): Aprender, Bienestar, Diario. La Caja de Herramientas usa 28 px.
- **Título de diálogo** (Montserrat 700, 22 px): hoja inferior (ficha de emoción, Checkpoint) y confirmación.
- **Título de tarjeta** (Montserrat 700, 17 px): tarjetas de formulario y pasos del Reset. Subtítulos de 15 px.
- **Título de fila** (sistema 650, 15 px, 1,3): nombre de cada herramienta y fila plegable.
- **Lectura** (sistema 400, 15 px, 1,65, máx. 65–70ch): cuerpo de las fichas de Aprender, Bienestar y Ayuda.
- **Cuerpo** (sistema 400, 16 px, 1,5): texto base y campos (16 px evita el zoom en iOS).
- **Etiqueta de sección** (Montserrat 750, 12 px, 0,08em, MAYÚSCULAS, Tinta suave): con punto de color delante.
- **Etiqueta de campo** (Montserrat 700, 11,5 px, 0,07em, MAYÚSCULAS, Tinta media). Las preguntas largas usan texto normal de 15 px/650.
- **Cifra** (Montserrat 800, 44 px, cifras tabulares): temporizadores, contadores y la letra de cada paso de «Parar y decidir».
- **Control** (sistema 650, 13,5 px): botones compactos, chips, lanzador y mensajes de campo. La barra inferior usa 11 px (13,5 px en tablet vertical).

Todo tamaño sale de la escala (`--fs-xs` 12, `--fs-sm` 13,5, `--fs-md` 15, `--fs-lg` 17, `--fs-xl` 22, `--fs-2xl` 28, más 11, 11,5, 16, 26 y 44 de los papeles de arriba). No se escriben tamaños sueltos.

### Named Rules
**The Brand Speaks, the System Reads Rule.** Montserrat solo en pesos 600–800 y para lo que se escanea (títulos, etiquetas de sección y de campo, insignias, pestañas de escritorio y cifras). El texto corrido y los controles (botones, chips, filas, barra inferior) van en la fuente del sistema.

**The Short Caps Rule.** Mayúsculas espaciadas solo en etiquetas de una línea (sección, campo, insignia). Títulos y preguntas van en minúscula normal.

**The Steady Numbers Rule.** Todo número que cambia mientras se mira (temporizadores, contadores, valores de deslizador, metadatos) usa cifras tabulares. Los títulos se equilibran (`text-wrap: balance`) y los párrafos evitan viudas (`text-wrap: pretty`).

## Layout

- **Un solo borde:** cabecera y contenido comparten caja: 1224 px de contenido con 28 px de margen a partir de 601 px, y 16 px en móvil. Logo, pestañas, título y tarjetas empiezan en la misma línea vertical.
- **Contenedor:** las pantallas de lectura y el Diario van en una columna de 760 px alineada a la izquierda. La Caja de Herramientas ocupa todo el ancho de la caja en rejilla de filas `minmax(340px, 1fr)`.
- **Tablet en horizontal y escritorio (1024 px o más):** lectura a la izquierda (760 px) y «¿Qué necesitas ahora?» como **columna fija de 300 px a la derecha**, con los accesos abiertos en una columna, alineada con los botones de la cabecera; si no cabe, se desplaza dentro. En Herramientas el lanzador va arriba a todo el ancho.
- **Ritmo:** escala de 4 px (4, 8, 12, 16, 20, 24, 32, 40). 8 px entre filas de una lista, 24 px entre grupos, 16 px dentro de tarjetas pequeñas y 20 px en tarjetas de formulario.
- **Navegación según el ancho:**
  - Hasta 600 px y en tablet vertical (hasta 1023 px en vertical): barra inferior fija con cinco destinos (icono de 22 px y etiqueta de 11 px; 13,5 px en tablet, con la barra centrada a 720 px), botones de 56 px de alto, respetando el área segura y con 96 px de hueco al final del contenido.
  - En horizontal por encima de 600 px: pestañas con icono bajo la cabecera.
  - Móvil en horizontal (altura ≤ 500 px): marca, iconos y pestañas en una sola fila.
- **Lanzador «¿Qué necesitas ahora?»:** rejilla `minmax(125px, 1fr)`; en móvil, dos columnas. «Más situaciones» despliega el resto en su sitio.
- **Pantallas secundarias:** herramientas, pasos del Reset y Ayuda se abren a pantalla completa, con cabecera propia (icono y título a la izquierda, «Cerrar» a la derecha) y cuerpo de 900 px como máximo.
- **Sin desplazamiento horizontal nunca.** Todo hijo de rejilla lleva `min-width: 0`.

## Elevation & Depth

Casi plano: la profundidad la dan el cambio de superficie (blanco sobre Gris niebla y Gris niebla dentro del blanco) y los bordes finos. Las sombras son de ambiente y apenas se perciben; solo crecen en lo que flota por encima (hoja inferior, confirmación, aviso).

### Shadow Vocabulary
- **Reposo de fila** (`box-shadow: 0 1px 2px rgba(28,31,33,.04)`): filas de herramientas, accesos rápidos y fichas plegables.
- **Tarjeta** (`box-shadow: 0 1px 2px rgba(28,31,33,.04), 0 6px 20px rgba(28,31,33,.05)`): tarjetas de formulario y de paso. En oscuro: `0 1px 2px rgba(0,0,0,.3), 0 6px 20px rgba(0,0,0,.25)`.
- **Acción de color** (`box-shadow: 0 2px 8px rgba(204,46,52,.22)`, o ámbar `rgba(224,160,48,.25)`): solo bajo el botón primario y el botón del Reset.
- **Hoja inferior** (`box-shadow: 0 -8px 30px rgba(27,29,31,.18)`) y **confirmación** (`box-shadow: 0 12px 40px rgba(27,29,31,.25)`), sobre un velo `rgba(27,29,31,.55)`.

### Named Rules
**The Surface Before Shadow Rule.** Para separar, primero cambia la superficie o pon un borde de 1 px. Una sombra más fuerte solo se justifica en algo que flota por encima del resto.

**The No Nested Lift Rule.** Dentro de una tarjeta, los bloques van en Gris niebla, sin borde ni sombra. Nunca tarjeta con sombra dentro de tarjeta con sombra.

## Shapes

Esquinas amables y constantes, más cerradas cuanto más pequeño es el elemento: 10 px en cuadrados de icono pequeños y pasos, 12 px en campos, botones de icono y bloques interiores, 14 px en botones, filas y fichas, 20 px en tarjetas, 24 px en la hoja inferior y píldora en chips. Bordes siempre de 1 px. Los iconos van dentro de un cuadrado tintado (36–44 px; 60 px como protagonista de un paso). La flecha de las fichas plegables es un trazo en ángulo que gira 180° al abrir. El progreso del Reset y del Kit son barritas de 4 px de alto con la letra o el número debajo, no puntos. Píldoras y barras finas usan radio de 999 px.

## Components

### Buttons
Tranquilos y firmes: ancho completo en móvil, fuente del sistema 700 a 16 px (14 px en los pequeños) y un icono pequeño opcional delante.
- **Shape:** esquinas de 14 px; 52 px de alto el primario y el del Reset, 48 px el resto y 44 px como mínimo en los pequeños.
- **Primario:** Rojo Wesser con texto blanco y sombra de acción de color. Uno por pantalla, en las secciones (ver The One Primary Rule).
- **Secundario:** blanco con borde Línea marcada y texto Tinta.
- **Oscuro:** Tinta con texto blanco (en tema oscuro se invierte). Es el principal dentro de las herramientas («Vuelvo a calle», «Volver», «Guardar», «Estoy preparado»); «Repetir» va siempre como secundario.
- **Reset y Kit:** Ámbar Reset con texto Antracita Wesser.
- **Discreto (`.btn-quiet`):** texto subrayado sin borde, 44 px de alto, 13,5 px/650 en Tinta media. Para acciones secundarias que no deben competir (Deshacer, Ya he hecho las 10, Cerrar y seguir luego).
- **Peligro:** rojo de error con texto blanco, solo en confirmaciones de borrado.
- **Hover / Focus / Active:** el hover cambia fondo o borde en 0,15 s y nunca la posición. Foco con contorno de 2,5 px Rojo Wesser separado 2 px. Al pulsar, `scale(.98)`.
- **Deshabilitado:** opacidad del 50 %, siempre con una explicación visible.

### Chips
- **Style:** blanco, borde 1 px Línea marcada, texto Tinta de 13 px y peso 600, alto de 44 px, forma de píldora. Son `<button>` reales; los que seleccionan llevan `aria-pressed`.
- **State:** el seleccionado usa Tinte Rojo Wesser, borde Rojo Wesser y texto Rojo Wesser hondo en las secciones (Diario); dentro del Reset y del Kit, Tinte Ocre; dentro de las herramientas, Tinte antracita (tinta al 14 %, borde Tinta de 1,5 px). En un flujo de apoyo, lo elegido nunca va en rojo. En hover, el no seleccionado marca el borde en Tinta suave. Existe una variante en bloque (título y descripción, 14 px de radio) para la señal principal del Reset.

### Cards / Containers
- **Corner Style:** 20 px en tarjetas y 14 px en filas y fichas.
- **Background:** blanco sobre Gris niebla; bloques interiores en Gris niebla.
- **Shadow Strategy:** sombra de tarjeta; en filas, la de reposo (ver Elevation & Depth).
- **Border:** 1 px Línea.
- **Internal Padding:** 20 px en tarjetas y 12–16 px en filas.

### Inputs / Fields
- **Style:** blanco, borde 1 px Línea marcada, 12 px de radio, relleno de 12 × 14 px, texto de 16 px. Etiqueta encima en mayúsculas pequeñas.
- **Focus:** borde Rojo Wesser y halo de 3 px de rojo al 20 %.
- **Error:** borde de error, mensaje en rojo de error de 13,5 px/700 con icono de alerta de línea y `role="alert"` debajo del campo. Los grupos de chips con error llevan un contorno de 2 px. Los avisos no aparecen antes de que el usuario haya hecho algo. Un formulario con varios campos obligatorios lo dice antes de empezar, en una línea con icono de información (Diario: «Para guardar, completa los 4 pasos (S, E, P y A)…»). Superar un máximo de opciones («hasta 2», «hasta 3») se explica en línea, junto al grupo, en el tono del flujo (ocre en Reset, Kit y herramientas).

### Navigation
- **Cabecera:** blanca con borde inferior Línea. Logo Wesser (38 px; 32 px en móvil), una línea vertical, «GESTIÓN EMOCIONAL» en Montserrat 11 px de Tinta suave y debajo el subtítulo de 12 px. A la derecha, botones de icono de 44 px (Ayuda, Tema) con borde Línea.
- **Pestañas:** Montserrat 650 a 13 px en Tinta media, con icono de 18 px y fondo transparente. La activa usa Tinte Rojo Wesser y texto Rojo Wesser hondo; la pestaña Reset va siempre tintada de ámbar. Un punto rojo avisa de un Reset a medias.
- **Móvil:** barra inferior blanca con borde superior y sombra `0 -4px 16px rgba(28,31,33,.06)`. Cinco botones iguales de 56 px con etiqueta de 11 px en la fuente del sistema.

### Tool row (signature)
Toda la fila es el botón (72 px de alto como mínimo): cuadrado tintado de 44 px con el icono del grupo, título, una línea de descripción, metadato de duración («30–45 s») en cifras tabulares y un chevron en Tinta suave. En hover, el borde toma el tono del grupo al 40 %. Es el patrón de la Caja de Herramientas.

### Foldable sheet (signature)
Ficha de Aprender, Bienestar y Ayuda: fila de 64 px con cuadrado tintado de 36 px, título en Montserrat 15 px/650 y chevron que gira. El cuerpo se lee a 15 px/1,65 y admite citas, mini-tarjetas y diagramas de flujo en Gris niebla. Las fichas anidadas son más ligeras: Gris niebla, sin borde ni sombra.

### Quick launcher (signature)
«¿Qué necesitas ahora?»: botones compactos de 48 px con icono de 18 px y texto del sistema de 13,5 px/650. Neutros por defecto; «Activar mi plan» va en Ámbar Reset sólido (es el Kit), «Estoy en una mala racha» con tinte ámbar y «Qué ha funcionado» con tinte Verde pino. **Completo solo en Herramientas**; en Aprender, Bienestar y Diario se reduce a una fila de 48 px («¿Qué necesitas ahora?», que lleva a Herramientas) más «Activar mi plan» si hay plan guardado; ahí va **neutro, con el rayo en ocre**, para no competir con el título ni con «Guardar» (en el lanzador completo sigue en Ámbar sólido). En tablet horizontal y escritorio, fuera de Herramientas, el lanzador es la columna lateral fija (ver Layout); en Herramientas, filas de botones de 190 px como mínimo.

El lanzador completo va en dos grupos con rótulo en minúscula: **«Momentos del turno»** (Antes de salir, Volver a calle, Cierre de turno; tres columnas) y **«Ahora mismo»** (Activar mi plan si hay plan, Estoy en una mala racha y tres estados más, a la vista). «Más situaciones» es la última casilla de esa rejilla y despliega el resto; «Ahora mismo» muestra 4 casillas como máximo (con plan, «No sé qué necesito» pasa a «Más situaciones»). Con un test a medias, «Estoy en una mala racha» pasa a **«Seguir mi test · n/10»** y abre directamente el contador de paradas; en la fila compacta de las demás secciones aparece también, en tinte ámbar, ocupando el sitio de «Activar mi plan» mientras dure el test (a 360 px o menos, los dos botones se reparten el ancho). En la fila compacta, a 420 px o menos y con plan, se oculta el icono de «¿Qué necesitas ahora?» para que quepa en una fila sin cortar texto. No repite herramientas que ya están en la lista de debajo con el mismo nombre.

### Tool (pantalla completa) en móvil
La tarjeta de cada herramienta y su acción se anclan abajo, cerca del pulgar. En «Hecho» y en los resúmenes, el principal (antracita) es volver —«Vuelvo a calle» o «Volver»— y «Repetir» es secundario, encima. Si la herramienta se abrió desde «Activar mi plan», «Terminar» antes de tiempo también lleva a «Hecho» con el resto del plan (ajuste y persona de apoyo).

**Respuestas rápidas en las herramientas de calle** (Antes de salir, Volver a calle, Cierre de turno): cada pregunta con 4 opciones pulsables sacadas de la formación (microauditoría, relevo de aire, ritual de desconexión y de gratitud) y «Otra…» para escribir. El ajuste del Kit, si existe, es la primera opción de «¿Qué quiero cuidar?» y «¿Qué quiero hacer en la primera parada?», sin marcar. No se guardan; cerrar tras solo pulsar no pide confirmación, tras escribir sí («¿Cerrar? Lo que has escrito aquí no se guarda»).

### Tool row en móvil
Hasta 600 px, la fila baja a 64 px de alto como mínimo, con cuadrado tintado de 36 px y menos relleno: caben 3 herramientas bajo el lanzador sin cortar ningún texto.

### Reset step (signature)
Pantalla completa sobre Gris niebla con título en Ocre tinta y cabecera fija al desplazarse.
- **Entrada:** la acción primero. Tarjeta con la pregunta (22 px), una línea que tranquiliza y el botón «Empezar el Reset» en Ámbar Reset; debajo, «Mi Kit de Emergencia» e «Historial» al alcance del pulgar, y la explicación en fichas plegables. «Estoy en una mala racha» entra directo al primer paso.
- **Reanudar:** con un Reset a medias, la tarjeta dice dónde lo dejaste y qué elegiste: en el test, «Tu test está a medias», el ajuste en un bloque Gris niebla y «n de 10 paradas probadas»; en otro paso, «Ibas por *paso* con el ajuste *…*». El principal es «Seguir con mis paradas» / «Seguir donde lo dejé»; «Empezar de nuevo» (contorno) pide confirmación porque borra lo guardado.
- **Progreso R·E·S·E·T:** seis segmentos (R, E, S, E, T y cierre) con barra de 4 px y la letra debajo; el paso actual en Ocre tinta con su nombre visible. Sustituye a la insignia sobre el título.
- **Respuestas rápidas:** cada pregunta se responde con chips (una o varias opciones) y un chip «Otra…» que abre un campo para escribir con tus palabras. Nada obligatorio se escribe. Dentro del Reset, lo elegido va en tinte Ocre (nunca en rojo: en mala racha el rojo se lee como «error»); también los botones de opción, como «Lo mantengo / Lo ajusto / Pruebo otra cosa», que marcan la elección con fondo y borde Ocre (`.is-sel`).
- **Pocas opciones a la vista:** una decisión por pantalla y como máximo 3–4 sugerencias visibles. «Elige un solo ajuste» muestra los ajustes asociados a la señal elegida en R (y el del Kit) bajo «Para tu señal: *señal*» y pliega el resto en «Ver todos los ajustes», que no repite los sugeridos. Cualquier lista de más de 5 opciones muestra 4 y pliega el resto («Otras señales», «Más aspectos», «Más conductas»); en R, si vienes del check-in, a la vista solo lo que marcaste. Examina va en dos pantallas (contexto, luego forma de trabajar). La entrada ofrece «Repetir mi último ajuste».
- **Títulos con el verbo del paso:** Reconoce…, Examina…, Separa…, Elige…, Testea…, para que el progreso R·E·S·E·T y el título digan lo mismo.
- **Botones que dicen adónde llevan:** nunca «Continuar». Cada principal nombra el paso siguiente: «Examinar el contexto», «Ver cómo trabajo», «Ver qué funciona», «Elegir mi ajuste», «Empezar el test», «Ver lo aprendido» (en contorno y deshabilitado hasta llegar a 10; en ámbar al llegar), «Ver mi resumen», «Vuelvo a calle». Caben en una línea a 320 px; a 360 px o menos, «Atrás» queda solo con la flecha.
- **Testea cuenta hacia arriba:** la cifra (44 px), «paradas probadas» y diez marcas de 18 × 6 px que se rellenan en ocre; nunca «te faltan» ni un botón bloqueado. El principal de la barra fija es «+1 parada probada» (el foco se queda en él al sumar); «+3 paradas» va en la tarjeta, y debajo una fila discreta (`.btn-quiet`) con «Deshacer última», «Ya he hecho las 10» y «Cerrar y seguir luego». Al llegar a 10, la barra pasa a «Ver lo aprendido».
- **10/10, el momento propio:** al llegar a 10 desaparecen los contadores y aparece un bloque ámbar suave con sello de check (animación corta, nula con movimiento reducido), «10 / 10», «Test completado» (26 px) y una línea que separa sostener el ajuste del resultado de cada conversación. «Qué observar al terminar» se abre solo; el foco va al título.
- **Check-in:** un bloque por pantalla con barra de 4 segmentos (como el Kit), solo los títulos de las señales a la vista y sus explicaciones a demanda con un único interruptor («Ver qué significa cada señal»); la introducción, corta y solo en el primer bloque. Lo marcado, en ocre. Al pasar a R, el paso reconoce lo marcado («Has marcado N señales. Vamos a por una sola…»).
- **Barra de acciones:** siempre al fondo de la pantalla, también en los pasos cortos (`#resetBody` es una columna flexible y la barra lleva `margin-top:auto`): el botón principal queda a 12 px del borde inferior en todos los pasos del Reset y del Kit. Sobre Gris niebla con borde superior Línea; el botón de continuar nunca está deshabilitado sin motivo: si falta algo, lo dice en línea, **en Ocre tinta y con icono de información** (dentro del Reset, nunca en rojo).
- **Cabecera en móvil:** una sola fila; Kit e Historial como botones de icono de 44 px con nombre accesible.
- **Atrás:** en los pasos 1–7, «Atrás» (estrecho, contorno) va a la izquierda del botón principal en la barra fija; lo elegido se conserva. El gesto «atrás» del móvil hace lo mismo y, en la entrada, cierra el Reset en lugar de salir de la app (cada pantalla completa deja una entrada en el historial del navegador).
- **Cierre:** «Vuelve a calle con esto», con el ajuste elegido y lo que sigue funcionando en bloques Gris niebla; «Mi próximo paso (opcional)» va plegado, con el mismo estilo que las otras dos fichas, y se abre solo si ya tiene respuesta.

### Diario S-E-P-A
- **Emociones:** seis chips con su cara de línea, una sola parada de tabulador cada uno; las fichas, desde un único enlace discreto «¿Qué es cada emoción?» que abre la lista de las seis.
- **Historial:** cada registro con «Editar» y «Eliminar» en su propia fila al pie, separados 24 px; fechas recientes como «Hoy, 11:31» y «Ayer, 11:31».

### Kit de Emergencia
Dentro del Modo Reset, con su ocre.
- **Vista del plan:** «Mi protocolo personal» (Cuando noto → Me regulo con → Ajusto → Si sigo atascado, en bloques Gris niebla con flecha de icono) y «Mi regla de emergencia» una sola vez. «Activar mi plan» (ámbar) va en la barra fija junto a «Atrás»; «Editar mi plan» (contorno) bajo el protocolo. Sin plan, la barra ofrece «Preparar mi plan».
- **Preparar o editar:** cuatro pasos con barra de progreso numerada (Señales · Me regulo · Ajusto · Apoyo) y las mismas respuestas rápidas del Reset: 4 señales a la vista (hasta 3), 4 herramientas a la vista y «Otro recurso…», 4 ajustes sugeridos «Para tus señales» con «Ver todos los ajustes», y persona de apoyo con qué pedirá. Solo la herramienta es obligatoria. «Guardar mi plan» vuelve a la vista.

## Do's and Don'ts

### Do:
- **Do** usar un solo botón principal por pantalla, con el color de su contexto (ámbar en Reset y Kit, rojo Wesser en las secciones, antracita en las herramientas), y Rojo Wesser hondo para texto rojo sobre claro.
- **Do** dar color a un grupo con su tono en el cuadrado tintado (al 12 %) y en un punto de 8 px.
- **Do** reservar el ámbar al Modo Reset y al Kit de Emergencia.
- **Do** mantener 44 × 44 px como mínimo en todo lo táctil y 56 px en la barra inferior.
- **Do** usar iconos SVG de línea del sprite (`stroke-width: 1.75`) que heredan el color del texto. Las 6 emociones básicas tienen su propia cara de línea (`i-emo-alegria`, `i-emo-tristeza`, `i-emo-miedo`, `i-emo-ira`, `i-emo-sorpresa`, `i-emo-asco`) en el color de la emoción, siempre con el nombre al lado.
- **Do** cumplir 4,5:1 en todo texto, en claro y en oscuro. Tinta suave es el tono más claro permitido para texto.
- **Do** cambiar fondo o borde en el hover (0,15 s) y respetar `prefers-reduced-motion`.
- **Do** empezar la página con el enlace «Saltar al contenido» (oculto hasta recibir el foco con el primer Tab) que lleva el foco a `<main>`. No usar `scrollIntoView` al cargar: mueve el punto de partida del Tab; la pestaña activa se centra desplazando solo la barra.
- **Do** ofrecer una alternativa sin `color-mix()` para iOS anterior a 16.2 (bloque `@supports not`).

### Don't:
- **Don't** usar degradados, texturas, brillos ni sombras marcadas.
- **Don't** usar emojis en navegación, secciones, botones ni avisos.
- **Don't** poner pastillas de color saturado con texto blanco ni tonos de grupo como fondo sólido.
- **Don't** mover elementos al pasar el ratón (nada de `translateY` en hover).
- **Don't** anidar tarjetas con sombra ni poner una tarjeta con borde y sombra por cada elemento de una lista larga; usa filas o listas agrupadas.
- **Don't** escribir títulos en mayúsculas espaciadas ni texto largo en cursiva.
- **Don't** usar Montserrat por debajo de 600 ni cargar fuentes o librerías de internet.
- **Don't** bajar el texto funcional de 11 px.
- **Don't** poner una insignia o rótulo en mayúsculas encima de un título: el título habla solo; si hace falta situar al usuario, usa el progreso.
- **Don't** pedir texto escrito obligatorio en un flujo que se usa en calle: ofrece opciones pulsables y un «Otra…» opcional.
- **Don't** dejar un desplegable con una respuesta ya elegida: empieza en «Elige…» (opción vacía) y, si no se elige, se avisa en línea. Una opción preseleccionada se guarda sin que nadie la haya elegido.
- **Don't** usar el rojo de marca para medir o marcar estados del captador (fatiga, selección dentro del Reset, avisos de Reset a medias): deslizadores en Tinta media, selección y avisos del Reset en Ocre.
- **Don't** dejar que el contorno de error de un grupo pise su mensaje ni que la barra fija lo tape: el mensaje va a 14 px del contorno y el overlay reserva espacio de desplazamiento arriba y abajo.
