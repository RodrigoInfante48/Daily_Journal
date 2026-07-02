# Daily Journal

Journal personal diario construido con Next.js 14 (App Router), TypeScript, Tailwind CSS y Supabase.

## Empezar

1. Copia `.env.local.example` a `.env.local` y completa las credenciales de tu proyecto de Supabase:

   ```bash
   cp .env.local.example .env.local
   ```

2. Instala las dependencias:

   ```bash
   npm install
   ```

3. Levanta el servidor de desarrollo:

   ```bash
   npm run dev
   ```

## Estructura

- `app/(auth)/login` — Ruta de inicio de sesión mediante magic link (correo, sin contraseña).
- `app/auth/callback` — Route handler que intercambia el código del magic link por una sesión.
- `app/(app)/journal` — Ruta principal del diario, protegida por sesión.
- `lib/supabase/client.ts` — Cliente de Supabase para Client Components.
- `lib/supabase/server.ts` — Cliente de Supabase para Server Components, usando cookies de `next/headers`.
- `lib/supabase/middleware.ts` — Helper que refresca la sesión y redirige a `/login` si no hay sesión al acceder a `/journal`.
- `middleware.ts` — Middleware de Next.js que llama al helper anterior en cada request.

## Autenticación

El único método de inicio de sesión es **magic link**: el usuario ingresa su
correo en `/login`, Supabase le envía un enlace, y al abrirlo se procesa en
`/auth/callback`, que crea la sesión y redirige a `/journal`.

En el dashboard de Supabase, en Authentication → URL Configuration, agrega
`http://localhost:3000/auth/callback` (y la URL de producción equivalente) a
la lista de Redirect URLs para que el enlace funcione correctamente.
