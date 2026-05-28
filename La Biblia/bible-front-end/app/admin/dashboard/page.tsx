"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { LayoutDashboard, PencilRuler, ShieldAlert } from "lucide-react";
import { readAuthSession } from "@/lib/clientAuth";

export default function AdminDashboardPage() {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    setIsAdmin(readAuthSession()?.role === "admin");
  }, []);

  if (!isAdmin) {
    return (
      <main className="mx-auto w-full max-w-2xl">
        <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[var(--shadow-card)]">
          <div className="flex items-start gap-3">
            <ShieldAlert className="mt-0.5 h-5 w-5 text-red-600" />
            <div>
              <h1 className="font-serif-display text-2xl font-semibold text-[var(--text)]">
                Panel de administración
              </h1>
              <p className="mt-2 text-sm text-[var(--text-muted)]">
                Esta sección solo está disponible para administradores.
              </p>
              <Link href="/admin" className="mt-4 inline-flex text-sm font-semibold text-[var(--accent)] hover:underline">
                Ir a iniciar sesión
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-4xl">
      <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[var(--shadow-card)]">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-full border border-[var(--accent)]/25 bg-[var(--background-soft)] text-[var(--accent)]">
            <LayoutDashboard className="h-5 w-5" strokeWidth={1.8} />
          </span>
          <div>
            <h1 className="font-serif-display text-2xl font-semibold text-[var(--text)]">
              Panel de administración
            </h1>
            <p className="mt-1 text-sm text-[var(--text-muted)]">
              Gestiona contenido dinámico y edición del sitio.
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <Link
            href="/admin/editar-sitio"
            className="rounded-lg border border-[var(--border)] bg-[var(--background-soft)] p-4 no-underline transition hover:border-[var(--accent)]/45"
          >
            <div className="flex items-center gap-2">
              <PencilRuler className="h-4 w-4 text-[var(--accent)]" strokeWidth={1.8} />
              <p className="text-sm font-semibold text-[var(--text)]">Editar el sitio web</p>
            </div>
            <p className="mt-2 text-xs text-[var(--text-muted)]">
              Crea páginas con ruta personalizada y contenido por bloques.
            </p>
          </Link>
        </div>
      </div>
    </main>
  );
}
