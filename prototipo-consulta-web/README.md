# Prototipo HTML — Consulta de controles de carga

Prototipo independiente y editable, sin React, servidor ni dependencias.

## Abrir

Abra `index.html` en un navegador. También puede servir la carpeta con cualquier
servidor estático si el navegador aplica restricciones locales.

## Estructura

- `index.html`: estructura general y puntos de montaje.
- `styles.css`: sistema visual, grilla y comportamiento responsive.
- `data.js`: camiones, controles, advertencias y snapshots de documentos.
- `app.js`: selección, búsqueda, filas desplegables y renderizado.

## Dónde modificar

- Para agregar casos de negocio o camiones, edite `data.js`.
- Para cambiar colores, tipografía y espaciado, use las variables `:root` de
  `styles.css`.
- Para cambiar interacciones o cómo se presenta la información, edite `app.js`.

## Supuesto importante

`controlledDocument` representa el snapshot inmutable del comprobante utilizado
al iniciar el control. `currentRemito` representa el estado documental actual.
Ambos deben persistirse por separado en el desarrollo definitivo.
