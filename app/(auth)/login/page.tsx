"use client";

import { useState, type FormEvent, type MouseEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSignIn(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    router.push("/journal");
    router.refresh();
  }

  async function handleSignUp(e: MouseEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signUp({ email, password });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    router.push("/journal");
    router.refresh();
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

        <div className="flex flex-col gap-1">
          <label htmlFor="password" className="text-sm font-medium">
            Contraseña
          </label>
          <input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border rounded-md px-3 py-2 text-sm"
            placeholder="••••••••"
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="rounded-md bg-foreground text-background py-2 text-sm font-medium disabled:opacity-50"
        >
          {loading ? "Ingresando..." : "Iniciar sesión"}
        </button>

        <button
          type="button"
          onClick={handleSignUp}
          disabled={loading}
          className="rounded-md border py-2 text-sm font-medium disabled:opacity-50"
        >
          Crear cuenta
        </button>
      </form>
    </div>
  );
}
