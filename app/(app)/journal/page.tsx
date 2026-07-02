import { createClient } from "@/lib/supabase/server";

export default async function JournalPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const today = new Intl.DateTimeFormat("es-ES", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date());

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold capitalize">{today}</h1>
        <p className="text-sm text-foreground/60">
          Bienvenido de nuevo, {user?.email}
        </p>
      </div>

      <div className="rounded-md border p-4 text-sm text-foreground/60">
        Aquí aparecerán tus entradas del diario.
      </div>
    </div>
  );
}
