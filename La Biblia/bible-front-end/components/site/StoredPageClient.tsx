"use client";

import { useEffect, useMemo, useState } from "react";
import { sanitizePageRoute, type SitePage } from "@/lib/sitePageTypes";
import { fetchAdminSession, fetchSitePageByRoute } from "@/lib/sitePagesApi";
import { StoredPageView } from "@/components/site/StoredPageView";

type Props = {
  route: string;
  initialPage?: SitePage | null;
  initialCanEdit?: boolean;
};

/** Fallback cliente cuando la página no se resolvió en el servidor. */
export function StoredPageClient({ route, initialPage = null, initialCanEdit = false }: Props) {
  const [page, setPage] = useState<SitePage | null>(initialPage);
  const [canEdit, setCanEdit] = useState(initialCanEdit);
  const [loading, setLoading] = useState(!initialPage);
  const normalizedRoute = useMemo(() => sanitizePageRoute(route), [route]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [{ isAdmin }, loaded] = await Promise.all([
          fetchAdminSession(),
          fetchSitePageByRoute(normalizedRoute, false).catch(() => null),
        ]);
        if (cancelled) return;
        if (isAdmin) {
          const draft = await fetchSitePageByRoute(normalizedRoute, true);
          if (draft) setPage(draft);
          else if (loaded) setPage(loaded);
        } else {
          setPage(loaded);
        }
        setCanEdit(isAdmin);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [normalizedRoute]);

  if (loading) {
    return (
      <main className="mx-auto w-full">
        <p className="text-sm text-[var(--text-muted)]">Cargando página…</p>
      </main>
    );
  }

  if (!page) {
    return (
      <main className="mx-auto w-full">
        <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[var(--shadow-card)]">
          <h1 className="font-serif-display text-2xl font-semibold text-[var(--text)]">
            Página no encontrada
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-[var(--text-muted)]">
            Esta ruta no tiene contenido en la base de datos. Si la creaste antes solo en este navegador,
            entra como administrador en{" "}
            <a href="/admin/editar-sitio" className="font-semibold text-[var(--accent)] hover:underline">
              Editar el sitio web
            </a>{" "}
            para importarla o vuelve a guardarla ahí.
          </p>
        </div>
      </main>
    );
  }

  return <StoredPageView page={page} canEdit={canEdit} />;
}
