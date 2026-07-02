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

- `app/(auth)/login` — Ruta de inicio de sesión / registro.
- `app/(app)/journal` — Ruta principal del diario, protegida por sesión.
- `lib/supabase/client.ts` — Cliente de Supabase para Client Components.
- `lib/supabase/server.ts` — Cliente de Supabase para Server Components, usando cookies de `next/headers`.
- `lib/supabase/middleware.ts` — Helper para refrescar la sesión en el middleware.
- `middleware.ts` — Middleware de Next.js que llama al helper anterior en cada request.
