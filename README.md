# Daily Journal

Journal personal diario — un ritual matutino de 5 minutos: gratitud,
intención, estado interno y un espacio libre. Construido como una app
estática simple con HTML, CSS y JavaScript (sin frameworks, sin build,
sin backend).

Antes de entrar al journal, una landing tranquila presenta el ritual y
ofrece iniciar sesión con Google (o continuar sin cuenta, guardando
localmente en el navegador).

## Empezar

No requiere instalación ni dependencias. Abre `docs/index.html` en el
navegador, o sirve la carpeta con cualquier servidor estático:

```bash
npx serve docs
```

## Estructura

- `docs/index.html` — Landing: presenta el ritual e inicia sesión con Google.
- `docs/landing.css` / `docs/landing.js` — Estilos y lógica de la landing.
- `docs/journal.html` — El journal en sí (las 4 secciones + temporizador).
- `docs/styles.css` — Estilos del journal (tema "papel", tipografías Inter y Playfair Display).
- `docs/app.js` — Lógica del journal: temporizador de 5 minutos, guardado de entradas e historial.
- `docs/firebase.js` — Configuración compartida de Firebase (Auth + Firestore).

## Datos

Si inicias sesión con Google, las entradas se guardan en Firestore,
asociadas a tu cuenta. Si continúas sin cuenta, se guardan en el
`localStorage` del navegador, así que quedan solo en tu dispositivo —
borrar los datos del sitio en el navegador elimina ese historial.

## GitHub Pages

Este repositorio se sirve directamente desde la carpeta `/docs` en
GitHub Pages. Cada push a la rama por defecto republica el sitio
automáticamente — no hace falta ningún workflow de Actions.

Configuración (una sola vez, en el repo de GitHub):
Settings → Pages → Build and deployment → Source: `Deploy from a branch`
→ Branch: la rama por defecto del repo, carpeta `/docs` → Save.

Para que "Iniciar sesión con Google" funcione en la URL pública, la
URL de Pages (`<usuario>.github.io/<repo>`) debe agregarse en
Firebase Console → Authentication → Settings → Authorized domains
del proyecto `journal-2f983`.
