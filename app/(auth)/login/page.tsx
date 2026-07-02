"use client";

import { useState, type FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSignIn(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    setSent(true);
  }

  if (sent) {
    return (
      <div className="flex min-h-screen items-center justify-center p-8">
        <div className="w-full max-w-sm flex flex-col gap-4 text-center">
          <h1 className="text-2xl font-semibold">Revisa tu correo</h1>
          <p className="text-sm text-foreground/60">
            Te enviamos un enlace mágico a <strong>{email}</strong>. Ábrelo
            para iniciar sesión.
          </p>
          <button
            type="button"
            onClick={() => setSent(false)}
            className="text-sm underline"
          >
            Usar otro correo
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-8">
      <form
        onSubmit={handleSignIn}
        className="w-full max-w-sm flex flex-col gap-4"
      >
        <h1 className="text-2xl font-semibold text-center">
          Mi Diario Personal
        </h1>
        <p className="text-sm text-foreground/60 text-center">
          Ingresa tu correo y te enviaremos un enlace para iniciar sesión sin
          contraseña.
        </p>

        <div className="flex flex-col gap-1">
          <label htmlFor="email" className="text-sm font-medium">
            Correo electrónico
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border rounded-md px-3 py-2 text-sm"
            placeholder="tu@correo.com"
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="rounded-md bg-foreground text-background py-2 text-sm font-medium disabled:opacity-50"
        >
          {loading ? "Enviando..." : "Enviar enlace mágico"}
        </button>
      </form>
    </div>
  );
}
