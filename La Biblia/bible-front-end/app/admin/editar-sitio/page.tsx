"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowUp, ArrowDown, ImageIcon, Plus, Save, Trash2, Type, ShieldAlert } from "lucide-react";
import { readAuthSession } from "@/lib/clientAuth";
import {
  buildEmptySitePage,
  readSitePages,
  routeToSitePath,
  sanitizePageRoute,
  saveSitePages,
  type SiteBlock,
  type SitePage,
} from "@/lib/clientSiteBuilder";

function createBlock(type: SiteBlock["type"]): SiteBlock {
  return { id: `block-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`, type, value: "" };
}

export default function EditSitePage() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [pages, setPages] = useState<SitePage[]>([]);
  const [selectedPageId, setSelectedPageId] = useState<string>("");

  useEffect(() => {
    const admin = readAuthSession()?.role === "admin";
    setIsAdmin(admin);
    if (!admin) return;
    const loaded = readSitePages();
    setPages(loaded);
    setSelectedPageId(loaded[0]?.id ?? "");
  }, []);

  const selectedPage = useMemo(
    () => pages.find((page) => page.id === selectedPageId) ?? null,
    [pages, selectedPageId],
  );

  const updateSelectedPage = (patch: Partial<SitePage>) => {
    if (!selectedPage) return;
    const nextPages = pages.map((page) =>
      page.id === selectedPage.id ? { ...page, ...patch, updatedAt: new Date().toISOString() } : page,
    );
    setPages(nextPages);
  };

  const saveAll = () => {
    const normalized = pages
      .map((page) => ({ ...page, route: sanitizePageRoute(page.route) }))
      .filter((page) => page.title.trim() && page.route);
    saveSitePages(normalized);
    setPages(normalized);
    if (!normalized.find((page) => page.id === selectedPageId)) {
      setSelectedPageId(normalized[0]?.id ?? "");
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
                Solo administradores pueden acceder a esta sección.
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
    <main className="mx-auto w-full max-w-6xl">
      <header className="mb-6 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-card)]">
        <h1 className="font-serif-display text-2xl font-semibold text-[var(--text)]">Editar el sitio web</h1>
        <p className="mt-2 text-sm text-[var(--text-muted)]">
          Crea páginas con ruta propia, agrega bloques de texto o imagen y guarda para publicarlas.
        </p>
        <p className="mt-1 text-xs text-[var(--text-muted)]">
          Nota: las páginas creadas aquí se publican bajo <span className="font-semibold">/sitio/tu-ruta</span>.
        </p>
      </header>

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
              <li key={page.id}>
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
                  <p className="mt-1 truncate opacity-80">{routeToSitePath(page.route) || "Sin ruta"}</p>
                </button>
              </li>
            ))}
          </ul>
        </aside>

        <section className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[var(--shadow-card)]">
          {!selectedPage ? (
            <p className="text-sm text-[var(--text-muted)]">Selecciona o crea una página para comenzar.</p>
          ) : (
            <div className="space-y-4">
              <div className="grid gap-3 md:grid-cols-2">
                <label className="grid gap-1 text-xs font-semibold text-[var(--text-muted)]">
                  Título de la página
                  <input
                    value={selectedPage.title}
                    onChange={(event) => updateSelectedPage({ title: event.target.value })}
                    className="min-h-10 rounded-md border border-[var(--border)] bg-[var(--background-soft)] px-3 text-sm text-[var(--text)] outline-none focus:border-[var(--accent)]"
                  />
                </label>
                <label className="grid gap-1 text-xs font-semibold text-[var(--text-muted)]">
                  Ruta
                  <input
                    value={selectedPage.route}
                    onChange={(event) => updateSelectedPage({ route: event.target.value })}
                    placeholder="/mi-nueva-ruta"
                    className="min-h-10 rounded-md border border-[var(--border)] bg-[var(--background-soft)] px-3 text-sm text-[var(--text)] outline-none focus:border-[var(--accent)]"
                  />
                </label>
              </div>

              <p className="text-xs text-[var(--text-muted)]">
                URL final:{" "}
                <span className="font-semibold text-[var(--text)]">{routeToSitePath(selectedPage.route) || "-"}</span>
              </p>

              <div className="rounded-md border border-[var(--border)] p-3">
                <div className="mb-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => updateSelectedPage({ blocks: [...selectedPage.blocks, createBlock("text")] })}
                    className="inline-flex min-h-8 items-center gap-1 rounded-md border border-[var(--accent)]/45 px-2.5 text-xs font-semibold text-[var(--accent)] hover:bg-[var(--accent-soft)]"
                  >
                    <Type className="h-3.5 w-3.5" />
                    Texto
                  </button>
                  <button
                    type="button"
                    onClick={() => updateSelectedPage({ blocks: [...selectedPage.blocks, createBlock("image")] })}
                    className="inline-flex min-h-8 items-center gap-1 rounded-md border border-[var(--accent)]/45 px-2.5 text-xs font-semibold text-[var(--accent)] hover:bg-[var(--accent-soft)]"
                  >
                    <ImageIcon className="h-3.5 w-3.5" />
                    Imagen
                  </button>
                </div>

                <div className="space-y-3">
                  {selectedPage.blocks.map((block, index) => (
                    <div key={block.id} className="rounded-md border border-[var(--border)] bg-[var(--background-soft)] p-3">
                      <div className="mb-2 flex items-center justify-between gap-2">
                        <p className="text-xs font-semibold text-[var(--text)]">
                          Bloque {index + 1} - {block.type === "text" ? "Texto" : "Imagen"}
                        </p>
                        <div className="flex gap-1">
                          <button
                            type="button"
                            disabled={index === 0}
                            onClick={() => {
                              const blocks = [...selectedPage.blocks];
                              [blocks[index - 1], blocks[index]] = [blocks[index], blocks[index - 1]];
                              updateSelectedPage({ blocks });
                            }}
                            className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-[var(--border)] disabled:opacity-40"
                          >
                            <ArrowUp className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            disabled={index === selectedPage.blocks.length - 1}
                            onClick={() => {
                              const blocks = [...selectedPage.blocks];
                              [blocks[index + 1], blocks[index]] = [blocks[index], blocks[index + 1]];
                              updateSelectedPage({ blocks });
                            }}
                            className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-[var(--border)] disabled:opacity-40"
                          >
                            <ArrowDown className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              updateSelectedPage({
                                blocks: selectedPage.blocks.filter((item) => item.id !== block.id),
                              })
                            }
                            className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-red-200 bg-red-50 text-red-700"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>

                      {block.type === "text" ? (
                        <textarea
                          value={block.value}
                          onChange={(event) => {
                            const blocks = selectedPage.blocks.map((item) =>
                              item.id === block.id ? { ...item, value: event.target.value } : item,
                            );
                            updateSelectedPage({ blocks });
                          }}
                          rows={4}
                          className="w-full rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--text)] outline-none focus:border-[var(--accent)]"
                        />
                      ) : (
                        <input
                          value={block.value}
                          onChange={(event) => {
                            const blocks = selectedPage.blocks.map((item) =>
                              item.id === block.id ? { ...item, value: event.target.value } : item,
                            );
                            updateSelectedPage({ blocks });
                          }}
                          placeholder="https://..."
                          className="min-h-10 w-full rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 text-sm text-[var(--text)] outline-none focus:border-[var(--accent)]"
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const nextPages = pages.filter((page) => page.id !== selectedPage.id);
                    setPages(nextPages);
                    setSelectedPageId(nextPages[0]?.id ?? "");
                  }}
                  className="inline-flex min-h-10 items-center gap-2 rounded-md border border-red-200 bg-red-50 px-4 text-sm font-semibold text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                  Eliminar página
                </button>
                <button
                  type="button"
                  onClick={saveAll}
                  className="inline-flex min-h-10 items-center gap-2 rounded-md border border-[var(--accent)] bg-[var(--accent)] px-4 text-sm font-semibold text-[var(--accent-foreground)]"
                >
                  <Save className="h-4 w-4" />
                  Guardar
                </button>
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
