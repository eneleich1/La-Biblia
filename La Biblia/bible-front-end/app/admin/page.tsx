"use client";

import Link from "next/link";
import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import { ArrowRight, LogIn, LogOut, ShieldCheck, User } from "lucide-react";
import {
  notifyAuthSessionChange,
  readAuthSession,
  saveAuthSession,
  clearAuthSession,
  type AuthRole,
} from "@/lib/clientAuth";

const ADMIN_USER = process.env.NEXT_PUBLIC_ADMIN_USER ?? "admin";
const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD ?? "admin";

export default function AdminPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<AuthRole>("user");
  const [sessionRole, setSessionRole] = useState<AuthRole | null>(null);
  const [sessionUser, setSessionUser] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const session = readAuthSession();
    setSessionRole(session?.role ?? null);
    setSessionUser(session?.username ?? "");
  }, []);

  const handleLogin = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const cleanUsername = username.trim();
    if (!cleanUsername) {
      setError("Debes indicar un usuario.");
      return;
    }

    if (role === "admin") {
      if (cleanUsername === ADMIN_USER && password === ADMIN_PASSWORD) {
        saveAuthSession({ role: "admin", username: cleanUsername });
        setSessionRole("admin");
        setSessionUser(cleanUsername);
        setError("");
        setPassword("");
        notifyAuthSessionChange();
        return;
      }
      setError("Credenciales de administrador incorrectas.");
      return;
    }

    saveAuthSession({ role: "user", username: cleanUsername });
    setSessionRole("user");
    setSessionUser(cleanUsername);
    setError("");
    setPassword("");
    notifyAuthSessionChange();
  };

  const handleLogout = () => {
    clearAuthSession();
    setSessionRole(null);
    setSessionUser("");
    setUsername("");
    setPassword("");
    setError("");
    notifyAuthSessionChange();
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
              Acceso para usuarios y administración del sitio.
            </p>
          </div>
        </div>

        {sessionRole ? (
          <div className="mt-6 rounded-lg border border-[var(--accent)]/25 bg-[var(--background-soft)] p-4">
            <p className="text-sm font-semibold text-[var(--text)]">
              Sesión iniciada como {sessionRole === "admin" ? "administrador" : "usuario"}.
            </p>
            <p className="mt-1 text-sm leading-relaxed text-[var(--text-muted)]">
              Usuario actual: <span className="font-semibold">{sessionUser}</span>
            </p>
            {sessionRole === "admin" ? (
              <Link
                href="/admin/dashboard"
                className="mt-4 inline-flex min-h-10 items-center gap-2 rounded-md border border-[var(--accent)] bg-[var(--accent)] px-4 text-sm font-semibold text-[var(--accent-foreground)] no-underline transition hover:opacity-90"
              >
                <ArrowRight className="h-4 w-4" strokeWidth={1.8} aria-hidden />
                Ir al panel de administración
              </Link>
            ) : null}
            <button
              type="button"
              onClick={handleLogout}
              className="mt-4 inline-flex min-h-10 items-center gap-2 rounded-md border border-[var(--border)] bg-[var(--surface)] px-4 text-sm font-semibold text-[var(--text-muted)] transition hover:border-[var(--accent)]/40 hover:text-[var(--text)]"
            >
              <LogOut className="h-4 w-4" strokeWidth={1.8} aria-hidden />
              Cerrar sesión
            </button>
          </div>
        ) : (
          <form onSubmit={handleLogin} className="mt-6 grid gap-4">
            <div className="grid gap-2 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => setRole("user")}
                className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-md border px-3 text-sm font-semibold transition ${
                  role === "user"
                    ? "border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)]"
                    : "border-[var(--border)] bg-[var(--surface)] text-[var(--text-muted)]"
                }`}
              >
                <User className="h-4 w-4" strokeWidth={1.8} aria-hidden />
                Usuario
              </button>
              <button
                type="button"
                onClick={() => setRole("admin")}
                className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-md border px-3 text-sm font-semibold transition ${
                  role === "admin"
                    ? "border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)]"
                    : "border-[var(--border)] bg-[var(--surface)] text-[var(--text-muted)]"
                }`}
              >
                <ShieldCheck className="h-4 w-4" strokeWidth={1.8} aria-hidden />
                Administrador
              </button>
            </div>
            <label className="grid gap-1.5 text-xs font-semibold text-[var(--text-muted)]">
              Usuario
              <input
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                autoComplete="username"
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
                required={role === "admin"}
                className="min-h-11 rounded-md border border-[var(--border)] bg-[var(--background-soft)] px-3 text-sm font-medium text-[var(--text)] outline-none transition focus:border-[var(--accent)]"
              />
            </label>

            {error ? <p className="text-sm font-semibold text-red-700">{error}</p> : null}

            <button
              type="submit"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--accent)] bg-[var(--accent)] px-4 text-sm font-semibold text-[var(--accent-foreground)] transition hover:opacity-90"
            >
              <LogIn className="h-4 w-4" strokeWidth={1.8} aria-hidden />
              {role === "admin" ? "Entrar como administrador" : "Entrar como usuario"}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
