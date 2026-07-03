# Daily Journal

Journal personal diario — un ritual matutino de 5 minutos: gratitud,
intención, estado interno y un espacio libre. Construido como una app
estática simple con HTML, CSS y JavaScript (sin frameworks, sin build,
sin backend).

## Empezar

No requiere instalación ni dependencias. Abre `docs/index.html` en el
navegador, o sirve la carpeta con cualquier servidor estático:

```bash
npx serve docs
```

## Estructura

- `docs/index.html` — Estructura de la página.
- `docs/styles.css` — Estilos (tema "papel", tipografías Inter y Playfair Display).
- `docs/app.js` — Lógica: temporizador de 5 minutos, guardado de entradas e historial.

## Datos

Las entradas se guardan en el `localStorage` del navegador, así que
quedan solo en tu dispositivo — no hay cuenta, ni servidor, ni base de
datos. Borrar los datos del sitio en el navegador elimina el historial.

## GitHub Pages

Este repositorio se sirve directamente desde la carpeta `/docs` en
GitHub Pages (Settings → Pages → Branch: `main` / Folder: `/docs`).
