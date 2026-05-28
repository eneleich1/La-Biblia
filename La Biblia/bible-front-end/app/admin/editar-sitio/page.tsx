"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Box, ImageIcon, Plus, Save, Trash2, Type, ShieldAlert } from "lucide-react";
import { readAuthSession } from "@/lib/clientAuth";
import { readLegacyLocalSitePages, clearLegacyLocalSitePages } from "@/lib/clientSiteBuilder";
import {
  buildEmptySitePage,
  createBlock,
  ensurePageStructure,
  inferParentForRoute,
  routeToSitePath,
  sanitizePageRoute,
  type SitePage,
} from "@/lib/sitePageTypes";
import {
  createSitePageApi,
  deleteSitePageApi,
  fetchSitePages,
  migrateLocalSitePages,
  persistBlocksMedia,
  updateSitePageApi,
} from "@/lib/sitePagesApi";
import { InlinePageEditor } from "@/components/site/InlinePageEditor";

export default function EditSitePage() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [pages, setPages] = useState<SitePage[]>([]);
  const [selectedPageId, setSelectedPageId] = useState<string>("");
  const [saveSuccess, setSaveSuccess] = useState("");
  const [saveError, setSaveError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pagePendingDelete, setPagePendingDelete] = useState<SitePage | null>(null);

  const loadPages = useCallback(async () => {
    setLoading(true);
    setSaveError("");
    try {
      const list = await fetchSitePages(true);
      setPages(list);
      setSelectedPageId((current) => current || list[0]?.id || "");
    } catch (error) {
      setSaveError(
        error instanceof Error
          ? error.message
          : "No se pudo cargar desde la base de datos. Verifica DATABASE_URL y migraciones.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const session = readAuthSession();
    setIsAdmin(session?.role === "admin");
    if (session?.role !== "admin") {
      setLoading(false);
      return;
    }

    (async () => {
      const legacy = readLegacyLocalSitePages();
      if (legacy.length) {
        try {
          await migrateLocalSitePages(legacy);
          clearLegacyLocalSitePages();
          setSaveSuccess(
            `Se migraron ${legacy.length} pagina(s) del navegador a la base de datos.`,
          );
        } catch {
          // loadPages will surface DB errors
        }
      }
      await loadPages();
    })();
  }, [loadPages]);

  const selectedPage = useMemo(
    () => pages.find((page) => page.id === selectedPageId) ?? null,
    [pages, selectedPageId],
  );

  const updateSelectedPage = (patch: Partial<SitePage>) => {
    if (!selectedPage) return;
    setSaveSuccess("");
    setSaveError("");
    setPages((current) =>
      current.map((page) =>
        page.id === selectedPage.id ? { ...page, ...patch, updatedAt: new Date().toISOString() } : page,
      ),
    );
  };

  const saveSelectedPage = async () => {
    if (!selectedPage) return;
    setSaving(true);
    setSaveSuccess("");
    setSaveError("");

    const route = sanitizePageRoute(selectedPage.route);
    if (!selectedPage.title.trim() || !route) {
      setSaveError("La página necesita título y ruta.");
      setSaving(false);
      return;
    }

    try {
      const inferred = inferParentForRoute(route);
      const structured = ensurePageStructure({
        ...selectedPage,
        route,
        parentHref: selectedPage.parentHref ?? inferred?.parentHref ?? null,
        parentLabel: selectedPage.parentLabel ?? inferred?.parentLabel ?? null,
      });
      const blocks = await persistBlocksMedia(structured.blocks);
      let saved: SitePage;
      if (selectedPage.id && !selectedPage.id.startsWith("draft-")) {
        saved = await updateSitePageApi(selectedPage.id, { ...structured, blocks });
      } else {
        saved = await createSitePageApi({ ...structured, blocks });
      }
      setPages((current) => {
        const without = current.filter((p) => p.id !== selectedPage.id && sanitizePageRoute(p.route) !== route);
        return [...without, saved];
      });
      setSelectedPageId(saved.id);
      setSaveSuccess("Cambios guardados en la base de datos. Visible para todos los visitantes.");
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : "No se pudo guardar.");
    } finally {
      setSaving(false);
    }
  };

  const appendBlock = (type: "text" | "image" | "container") => {
    if (!selectedPage) return;
    const yOffset =
      selectedPage.blocks.reduce(
        (max, block) => Math.max(max, block.layout.y + block.layout.height + 16),
        24,
      ) || 24;
    updateSelectedPage({ blocks: [...selectedPage.blocks, createBlock(type, yOffset)] });
  };

  const requestDeleteSelectedPage = () => {
    if (!selectedPage?.id || selectedPage.id.startsWith("draft-")) return;
    setPagePendingDelete(selectedPage);
  };

  const confirmDeleteSelectedPage = async () => {
    if (!pagePendingDelete?.id) return;
    try {
      await deleteSitePageApi(pagePendingDelete.id);
      const next = pages.filter((p) => p.id !== pagePendingDelete.id);
      setPages(next);
      setSelectedPageId((current) => (current === pagePendingDelete.id ? next[0]?.id ?? "" : current));
      setSaveSuccess("Página eliminada.");
      setSaveError("");
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : "No se pudo eliminar.");
    } finally {
      setPagePendingDelete(null);
    }
  };

  if (!isAdmin) {
    return (
      <main className="mx-auto w-full max-w-2xl">
        <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[var(--shadow-card)]">
          <div className="flex items-start gap-3">
            <ShieldAlert className="mt-0.5 h-5 w-5 text-red-600" />
            <div>
              <h1 className="font-serif-display text-2xl font-semibold text-[var(--text)]">
                Editar el sitio web
              </h1>
              <p className="mt-2 text-sm text-[var(--text-muted)]">
                Solo administradores pueden acceder. Inicia sesión como administrador (se valida en el servidor).
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
    <main className="mx-auto w-full max-w-[1840px] px-4 pb-10 sm:px-6 lg:px-8 xl:px-12">
      <header className="mb-6 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-card)]">
        <h1 className="font-serif-display text-2xl font-semibold text-[var(--text)]">Editar el sitio web</h1>
        <p className="mt-2 text-sm text-[var(--text-muted)]">
          Las páginas se guardan en la base de datos del servidor. Cualquier visitante las ve; solo el administrador
          puede editarlas.
        </p>
      </header>

      {loading ? (
        <p className="text-sm text-[var(--text-muted)]">Cargando páginas…</p>
      ) : (
        <div className="grid gap-5 lg:grid-cols-[18rem_minmax(0,1fr)]">
          <aside className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[var(--shadow-card)]">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-sm font-semibold text-[var(--text)]">Páginas</h2>
              <button
                type="button"
                onClick={() => {
                  const page = buildEmptySitePage();
                  setPages((current) => [...current, page]);
                  setSelectedPageId(page.id);
                }}
                className="inline-flex min-h-8 items-center gap-1 rounded-md border border-[var(--accent)]/45 px-2.5 text-xs font-semibold text-[var(--accent)] hover:bg-[var(--accent-soft)]"
              >
                <Plus className="h-3.5 w-3.5" />
                Nueva
              </button>
            </div>

            <ul className="mt-3 space-y-2">
              {pages.map((page) => (
                <li key={page.id || page.route}>
                  <button
                    type="button"
                    onClick={() => setSelectedPageId(page.id)}
                    className={`w-full rounded-md border px-2.5 py-2 text-left text-xs transition ${
                      selectedPageId === page.id
                        ? "border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)]"
                        : "border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--accent)]/35"
                    }`}
                  >
                    <p className="truncate font-semibold">{page.title || "Página sin título"}</p>
                    <p className="mt-1 truncate opacity-80">{page.route || "Sin ruta"}</p>
                  </button>
                </li>
              ))}
            </ul>
          </aside>

          <section className="space-y-5">
            {!selectedPage ? (
              <p className="text-sm text-[var(--text-muted)]">Selecciona o crea una página.</p>
            ) : (
              <>
                <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[var(--shadow-card)]">
                  <div className="grid gap-3 md:grid-cols-2">
                    <label className="grid gap-1 text-xs font-semibold text-[var(--text-muted)]">
                      Título
                      <input
                        value={selectedPage.title}
                        onChange={(event) => updateSelectedPage({ title: event.target.value })}
                        className="min-h-10 rounded-md border border-[var(--border)] bg-[var(--background-soft)] px-3 text-sm text-[var(--text)] outline-none focus:border-[var(--accent)]"
                      />
                    </label>
                    <label className="grid gap-1 text-xs font-semibold text-[var(--text-muted)]">
                      Ruta pública
                      <input
                        value={selectedPage.route}
                        onChange={(event) => updateSelectedPage({ route: event.target.value })}
                        placeholder="/apologetica/mi-tema"
                        className="min-h-10 rounded-md border border-[var(--border)] bg-[var(--background-soft)] px-3 text-sm text-[var(--text)] outline-none focus:border-[var(--accent)]"
                      />
                    </label>
                  </div>
                  <p className="mt-2 text-xs text-[var(--text-muted)]">
                    URL: <span className="font-semibold text-[var(--text)]">{selectedPage.route || "-"}</span>
                    {selectedPage.route ? (
                      <>
                        {" "}
                        · alternativa:{" "}
                        <span className="font-semibold">{routeToSitePath(selectedPage.route)}</span>
                      </>
                    ) : null}
                  </p>
                  <div className="mt-3 grid gap-3 md:grid-cols-2">
                    <label className="grid gap-1 text-xs font-semibold text-[var(--text-muted)]">
                      Enlace «volver» (ruta madre)
                      <input
                        value={selectedPage.parentHref ?? ""}
                        onChange={(event) => updateSelectedPage({ parentHref: event.target.value })}
                        placeholder="/apologetica/no-conviene-a-la-iglesia-catolica-el-culto-a-los-santos"
                        className="min-h-10 rounded-md border border-[var(--border)] bg-[var(--background-soft)] px-3 text-sm text-[var(--text)] outline-none focus:border-[var(--accent)]"
                      />
                    </label>
                    <label className="grid gap-1 text-xs font-semibold text-[var(--text-muted)]">
                      Texto del enlace
                      <input
                        value={selectedPage.parentLabel ?? ""}
                        onChange={(event) => updateSelectedPage({ parentLabel: event.target.value })}
                        placeholder="Volver a la guía principal"
                        className="min-h-10 rounded-md border border-[var(--border)] bg-[var(--background-soft)] px-3 text-sm text-[var(--text)] outline-none focus:border-[var(--accent)]"
                      />
                    </label>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <button type="button" onClick={() => appendBlock("text")} className="inline-flex min-h-8 items-center gap-1 rounded-md border border-[var(--accent)]/45 px-2.5 text-xs font-semibold text-[var(--accent)]">
                      <Type className="h-3.5 w-3.5" /> Texto
                    </button>
                    <button type="button" onClick={() => appendBlock("image")} className="inline-flex min-h-8 items-center gap-1 rounded-md border border-[var(--accent)]/45 px-2.5 text-xs font-semibold text-[var(--accent)]">
                      <ImageIcon className="h-3.5 w-3.5" /> Imagen
                    </button>
                    <button type="button" onClick={() => appendBlock("container")} className="inline-flex min-h-8 items-center gap-1 rounded-md border border-[var(--accent)]/45 px-2.5 text-xs font-semibold text-[var(--accent)]">
                      <Box className="h-3.5 w-3.5" /> Contenedor
                    </button>
                  </div>

                  <div className="mt-4 flex flex-wrap justify-end gap-2">
                    <button
                      type="button"
                      onClick={requestDeleteSelectedPage}
                      disabled={!selectedPage.id || selectedPage.id.startsWith("draft-")}
                      className="inline-flex min-h-10 items-center gap-2 rounded-md border border-red-200 bg-red-50 px-4 text-sm font-semibold text-red-700 disabled:opacity-50"
                    >
                      <Trash2 className="h-4 w-4" />
                      Eliminar página
                    </button>
                    <button
                      type="button"
                      onClick={saveSelectedPage}
                      disabled={saving}
                      className="inline-flex min-h-10 items-center gap-2 rounded-md border border-[var(--accent)] bg-[var(--accent)] px-4 text-sm font-semibold text-[var(--accent-foreground)] disabled:opacity-60"
                    >
                      <Save className="h-4 w-4" />
                      {saving ? "Guardando…" : "Guardar"}
                    </button>
                  </div>

                  {saveSuccess ? (
                    <p className="mt-3 rounded-md border border-emerald-300 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700">
                      {saveSuccess}
                    </p>
                  ) : null}
                  {saveError ? (
                    <p className="mt-3 rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">
                      {saveError}
                    </p>
                  ) : null}
                </div>

                <div>
                  <h2 className="mb-2 text-sm font-semibold text-[var(--text)]">Vista previa editable</h2>
                  <InlinePageEditor
                    page={selectedPage}
                    onPageChange={(next) => {
                      setPages((current) => current.map((p) => (p.id === selectedPage.id ? next : p)));
                    }}
                    onSave={saveSelectedPage}
                    saving={saving}
                    saveSuccess={saveSuccess}
                    saveError={saveError}
                  />
                </div>
              </>
            )}
          </section>
        </div>
      )}
      {pagePendingDelete ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-delete-page-title"
          onClick={() => setPagePendingDelete(null)}
        >
          <div
            className="w-full max-w-md rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5 shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <h3 id="confirm-delete-page-title" className="text-base font-semibold text-[var(--text)]">
              Confirmar eliminación
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-[var(--text-muted)]">
              ¿Eliminar la página &quot;{pagePendingDelete.title || "Página sin título"}&quot; de la base de
              datos?
            </p>
            <div className="mt-4 flex flex-wrap justify-end gap-2">
              <button
                type="button"
                onClick={() => setPagePendingDelete(null)}
                className="inline-flex min-h-9 items-center rounded-md border border-[var(--border)] bg-[var(--background-soft)] px-3 text-sm font-semibold text-[var(--text)] transition hover:border-[var(--accent)]/35 hover:bg-[var(--accent-soft)]"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmDeleteSelectedPage}
                className="inline-flex min-h-9 items-center rounded-md border border-red-300 bg-red-50 px-3 text-sm font-semibold text-red-700 transition hover:bg-red-100"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}
