import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // No agregar lógica entre createServerClient y supabase.auth.getUser().
  // Un error aquí puede causar problemas muy difíciles de depurar con
  // usuarios siendo desconectados aleatoriamente.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (
    !user &&
    !request.nextUrl.pathname.startsWith("/login") &&
    !request.nextUrl.pathname.startsWith("/auth")
  ) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // IMPORTANTE: Debes devolver el objeto supabaseResponse tal cual.
  // Si necesitas crear una nueva response, asegúrate de:
  // 1. Pasar el request:
  //    const myNewResponse = NextResponse.next({ request })
  // 2. Copiar las cookies:
  //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
  // 3. Modificar myNewResponse según necesites, evitando cambiar las cookies.
  // 4. Devolver myNewResponse

  return supabaseResponse;
}
