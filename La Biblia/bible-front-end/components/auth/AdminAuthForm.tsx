"use client";

import { useRouter } from "next/navigation";
import type { FormEvent } from "react";
import { useState } from "react";
import { LogIn, ShieldCheck } from "lucide-react";
import { clearAuthSession, notifyAuthSessionChange, saveAuthSession } from "@/lib/clientAuth";
import { loginWithEmail, registerWithEmail } from "@/lib/sitePagesApi";

export function AdminAuthForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      setError("Debes indicar tu correo electrónico.");
      return;
    }
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(cleanEmail)) {
      setError("Debes introducir un correo electrónico válido.");
      return;
    }
    if (!password) {
      setError("Debes introducir la contraseña.");
      return;
    }

    try {
      if (isRegisterMode) {
        await registerWithEmail(cleanEmail, password);
        clearAuthSession();
        setError("");
        setSuccessMessage("Cuenta creada correctamente. Ahora puedes iniciar sesión.");
        setIsRegisterMode(false);
        setPassword("");
        notifyAuthSessionChange();
        return;
      }

      const response = await loginWithEmail(cleanEmail, password);
      saveAuthSession({ role: response.role, email: response.email });
      setError("");
      setSuccessMessage("");
      setPassword("");
      notifyAuthSessionChange();
      router.replace("/");
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "No se pudo iniciar sesión.");
      setSuccessMessage("");
    }
  };

  return (
    <main className="mx-auto w-full max-w-lg">
      <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[var(--shadow-card)]">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-full border border-[var(--accent)]/25 bg-[var(--background-soft)] text-[var(--accent)]">
            <ShieldCheck className="h-5 w-5" strokeWidth={1.7} aria-hidden />
          </span>
          <div>
            <h1 className="font-serif-display text-2xl font-semibold leading-tight text-[var(--text)]">
              Iniciar sesión
            </h1>
            <p className="mt-1 text-sm text-[var(--text-muted)]">
              Accede con correo electrónico y contraseña.
            </p>
          </div>
        </div>

        <form onSubmit={handleLogin} className="mt-6 grid gap-4">
          <label className="grid gap-1.5 text-xs font-semibold text-[var(--text-muted)]">
            Correo electrónico
            <input
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              type="email"
              required
              className="min-h-11 rounded-md border border-[var(--border)] bg-[var(--background-soft)] px-3 text-sm font-medium text-[var(--text)] outline-none transition focus:border-[var(--accent)]"
            />
          </label>

          <label className="grid gap-1.5 text-xs font-semibold text-[var(--text-muted)]">
            Contraseña
            <input
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              type="password"
              autoComplete="current-password"
              required
              className="min-h-11 rounded-md border border-[var(--border)] bg-[var(--background-soft)] px-3 text-sm font-medium text-[var(--text)] outline-none transition focus:border-[var(--accent)]"
            />
          </label>

          {error ? <p className="text-sm font-semibold text-red-700">{error}</p> : null}
          {successMessage ? <p className="text-sm font-semibold text-emerald-700">{successMessage}</p> : null}

          <button
            type="submit"
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--accent)] bg-[var(--accent)] px-4 text-sm font-semibold text-[var(--accent-foreground)] transition hover:opacity-90"
          >
            <LogIn className="h-4 w-4" strokeWidth={1.8} aria-hidden />
            {isRegisterMode ? "Crear cuenta" : "Iniciar sesión"}
          </button>
          <button
            type="button"
            onClick={() => {
              setIsRegisterMode((value) => !value);
              setError("");
              setSuccessMessage("");
            }}
            className="text-sm font-semibold text-[var(--accent)] hover:underline"
          >
            {isRegisterMode ? "Ya tengo cuenta" : "Crear una cuenta nueva"}
          </button>
        </form>
      </div>
    </main>
  );
}
