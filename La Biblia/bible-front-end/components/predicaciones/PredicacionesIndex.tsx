"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  BookOpenText,
  Cross,
  ExternalLink,
  Pencil,
  Play,
  Plus,
  ScrollText,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { fetchAdminSession } from "@/lib/sitePagesApi";
import { getSermonPage, sermonPages, type SermonPage } from "@/data/sermons";

type PredicacionVideoItem = {
  id: string;
  title: string;
  url: string;
  position?: number;
};

const sermons = sermonPages
  .map((page) => getSermonPage(page.slug))
  .filter((page): page is SermonPage => Boolean(page));

function getYouTubeVideoId(url: string) {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace("www.", "");
    if (host === "youtu.be") {
      return parsed.pathname.replace("/", "") || null;
    }
    if (host.includes("youtube.com")) {
      const byQuery = parsed.searchParams.get("v");
      if (byQuery) return byQuery;
      const segments = parsed.pathname.split("/").filter(Boolean);
      if (segments[0] === "embed" && segments[1]) return segments[1];
      if (segments[0] === "shorts" && segments[1]) return segments[1];
    }
    return null;
  } catch {
    return null;
  }
}

function VideoFormModal({
  mode,
  initialVideo,
  submitting,
  error,
  onClose,
  onSubmit,
}: {
  mode: "create" | "edit";
  initialVideo: PredicacionVideoItem | null;
  submitting: boolean;
  error: string | null;
  onClose: () => void;
  onSubmit: (payload: { title: string; url: string }) => Promise<void>;
}) {
  const [title, setTitle] = useState(initialVideo?.title ?? "");
  const [url, setUrl] = useState(initialVideo?.url ?? "");

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/55 p-4"
      role="dialog"
      aria-modal="true"
      aria-label={mode === "create" ? "Agregar video de predicacion" : "Editar video de predicacion"}
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-2xl sm:p-6"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--accent)]">
              {mode === "create" ? "Nuevo video" : "Editar video"}
            </p>
            <h3 className="mt-1 font-serif-display text-xl font-semibold text-[var(--text)]">
              {mode === "create" ? "Agregar video de predicación" : "Actualizar video de predicación"}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border)] text-[var(--text-muted)] transition hover:text-[var(--text)]"
            aria-label="Cerrar formulario"
          >
            <X className="h-4 w-4" strokeWidth={2} aria-hidden />
          </button>
        </div>

        <form
          className="space-y-4"
          onSubmit={async (event) => {
            event.preventDefault();
            await onSubmit({ title, url });
          }}
        >
          <label className="block space-y-1.5">
            <span className="text-sm font-semibold text-[var(--text)]">Título del video</span>
            <input
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              className="h-11 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 text-sm text-[var(--text)] outline-none transition focus:border-[var(--accent)]/45 focus:ring-2 focus:ring-[var(--accent)]/15"
              placeholder="Ej: Predicación del evangelio de Marcos"
              required
            />
          </label>

          <label className="block space-y-1.5">
            <span className="text-sm font-semibold text-[var(--text)]">Enlace del video</span>
            <input
              type="url"
              value={url}
              onChange={(event) => setUrl(event.target.value)}
              className="h-11 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 text-sm text-[var(--text)] outline-none transition focus:border-[var(--accent)]/45 focus:ring-2 focus:ring-[var(--accent)]/15"
              placeholder="https://youtu.be/..."
              required
            />
          </label>

          {error ? (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-700">
              {error}
            </p>
          ) : null}

          <div className="flex flex-wrap justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-10 items-center rounded-lg border border-[var(--border)] px-4 text-sm font-medium text-[var(--text-muted)] transition hover:text-[var(--text)]"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex h-10 items-center rounded-lg border border-[var(--accent)] bg-[var(--accent)] px-4 text-sm font-semibold text-[var(--accent-foreground)] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "Guardando..." : "Guardar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function PredicacionesIndex() {
  const featuredSermon = sermons[0];
  const [videos, setVideos] = useState<PredicacionVideoItem[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [loadingVideos, setLoadingVideos] = useState(true);
  const [loadingError, setLoadingError] = useState<string | null>(null);
  const [activeVideoUrl, setActiveVideoUrl] = useState<string | null>(null);
  const [editorMode, setEditorMode] = useState<"create" | "edit" | null>(null);
  const [editingVideo, setEditingVideo] = useState<PredicacionVideoItem | null>(null);
  const [savingVideo, setSavingVideo] = useState(false);
  const [savingError, setSavingError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<PredicacionVideoItem | null>(null);
  const [deletingVideo, setDeletingVideo] = useState(false);
  const [deletingError, setDeletingError] = useState<string | null>(null);
  const activeVideo = videos.find((video) => video.url === activeVideoUrl) ?? null;
  const activeYoutubeId = activeVideo ? getYouTubeVideoId(activeVideo.url) : null;

  const reloadVideos = async () => {
    try {
      setLoadingError(null);
      const response = await fetch("/api/predicaciones/videos", { credentials: "include" });
      const data = (await response.json()) as { videos?: PredicacionVideoItem[]; error?: string };
      if (!response.ok || !data.videos) {
        throw new Error(data.error ?? "No se pudieron cargar los videos.");
      }
      setVideos(data.videos);
    } catch (error) {
      setLoadingError(error instanceof Error ? error.message : "No se pudieron cargar los videos.");
    } finally {
      setLoadingVideos(false);
    }
  };

  useEffect(() => {
    let cancelled = false;

    fetchAdminSession()
      .then((session) => {
        if (cancelled) return;
        setIsAdmin(Boolean(session.isAuthenticated && session.isAdmin));
      })
      .catch(() => {
        if (cancelled) return;
        setIsAdmin(false);
      });

    reloadVideos();

    return () => {
      cancelled = true;
    };
  }, []);

  const normalizedSearch = searchTerm.trim().toLowerCase();
  const filteredTextSermons = useMemo(() => {
    if (!normalizedSearch) return sermons;
    return sermons.filter((sermon) =>
      [sermon.title, sermon.reference, sermon.subtitle].some((value) =>
        value.toLowerCase().includes(normalizedSearch),
      ),
    );
  }, [normalizedSearch]);

  const filteredVideos = useMemo(() => {
    if (!normalizedSearch) return videos;
    return videos.filter((video) => video.title.toLowerCase().includes(normalizedSearch));
  }, [normalizedSearch, videos]);

  const totalAvailable = sermons.length + videos.length;
  const totalFiltered = filteredTextSermons.length + filteredVideos.length;

  if (!featuredSermon) return null;

  return (
    <div className="sermons-index-page">
      <header className="sermons-index-header">
        <h1>Predicaciones</h1>
        <p>Reflexiones y enseñanzas para edificación y crecimiento espiritual.</p>
      </header>

      <section className="sermons-feature-banner" aria-label="Llamado a predicar">
        <span className="sermons-feature-icon" aria-hidden="true">
          <Cross />
        </span>
        <span className="sermons-feature-copy">
          <span className="sermons-feature-title">Cristo nos mandó a predicar su Palabra.</span>
          <span className="sermons-feature-text">
            La predicación anuncia el Evangelio, llama al arrepentimiento y edifica a la iglesia
            para permanecer firme en la verdad.
          </span>
          <span className="sermons-feature-reference">
            <BookOpenText aria-hidden="true" />
            Marcos 16:15
          </span>
        </span>
      </section>

      <section className="sermons-list-section" aria-labelledby="sermons-list-title">
        <div className="sermons-list-heading">
          <h2 id="sermons-list-title">Predicaciones disponibles</h2>
          <span>
            Mostrando {totalFiltered} de {totalAvailable}
          </span>
        </div>

        <div className="mb-4 flex items-center gap-2 sm:gap-3">
          <label className="relative min-w-0 max-w-[42rem] flex-1">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]"
              strokeWidth={1.8}
              aria-hidden
            />
            <input
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Buscar predicaciones en texto o video..."
              className="h-10 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] pl-9 pr-3 text-sm text-[var(--text)] outline-none transition placeholder:text-[var(--text-muted)] focus:border-[var(--accent)]/45 focus:ring-2 focus:ring-[var(--accent)]/15"
              aria-label="Buscar predicaciones disponibles"
            />
          </label>
          {isAdmin ? (
            <button
              type="button"
              onClick={() => {
                setSavingError(null);
                setEditorMode("create");
                setEditingVideo(null);
              }}
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[var(--accent)]/45 bg-[#f5efe6] text-[var(--accent)] transition hover:border-[var(--accent)]/60 sm:w-auto sm:gap-2 sm:px-3"
              title="Agregar video de predicación"
              aria-label="Agregar video de predicación"
            >
              <Plus className="h-4 w-4" strokeWidth={2} aria-hidden />
              <span className="hidden text-sm font-semibold md:inline">
                Agregar video de predicación
              </span>
            </button>
          ) : null}
        </div>

        {loadingError && !videos.length ? (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {loadingError}
          </div>
        ) : null}
        {loadingVideos ? (
          <p className="mb-3 text-xs font-medium text-[var(--text-muted)]">Actualizando videos...</p>
        ) : null}

        {filteredTextSermons.length || filteredVideos.length ? (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredTextSermons.map((sermon) => (
              <li key={sermon.slug}>
                <Link href={`/predicaciones/${sermon.slug}`} className="sermons-card h-full">
                  <span className="sermons-card-icon" aria-hidden="true">
                    <ScrollText />
                  </span>
                  <span className="sermons-card-body">
                    <span className="sermons-card-title">{sermon.title}</span>
                    <span className="sermons-card-reference">{sermon.reference}</span>
                    <span className="sermons-card-summary">{sermon.subtitle}</span>
                    <span className="sermons-card-action">
                      Leer predicación
                      <ArrowRight aria-hidden="true" />
                    </span>
                  </span>
                </Link>
              </li>
            ))}
            {filteredVideos.map((video) => {
                const youtubeId = getYouTubeVideoId(video.url);
                const thumbnailUrl = youtubeId
                  ? `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`
                  : null;
                return (
                  <li key={video.id}>
                    {youtubeId ? (
                      <div
                        role="button"
                        tabIndex={0}
                        onClick={() => setActiveVideoUrl(video.url)}
                        onKeyDown={(event) => {
                          if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault();
                            setActiveVideoUrl(video.url);
                          }
                        }}
                        className="group relative flex h-full min-h-[13.5rem] w-full flex-col overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)] text-left shadow-[var(--shadow-card)] transition hover:border-[var(--accent)]/40 hover:shadow-[var(--shadow-card-hover)]"
                        aria-label={`Reproducir ${video.title}`}
                      >
                        {isAdmin ? (
                          <div className="absolute right-2 top-2 z-20 flex items-center gap-1.5">
                            <button
                              type="button"
                              className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/95 text-[var(--accent)] shadow ring-1 ring-[var(--border)] transition hover:scale-105"
                              aria-label={`Editar ${video.title}`}
                              onClick={(event) => {
                                event.preventDefault();
                                event.stopPropagation();
                                setSavingError(null);
                                setEditingVideo(video);
                                setEditorMode("edit");
                              }}
                            >
                              <Pencil className="h-3.5 w-3.5" strokeWidth={1.9} aria-hidden />
                            </button>
                            <button
                              type="button"
                              className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/95 text-red-700 shadow ring-1 ring-[var(--border)] transition hover:scale-105"
                              aria-label={`Eliminar ${video.title}`}
                              onClick={(event) => {
                                event.preventDefault();
                                event.stopPropagation();
                                setDeletingError(null);
                                setDeleteTarget(video);
                              }}
                            >
                              <Trash2 className="h-3.5 w-3.5" strokeWidth={1.9} aria-hidden />
                            </button>
                          </div>
                        ) : null}
                        <div className="relative aspect-video overflow-hidden bg-[#ddd2c2]">
                          {thumbnailUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={thumbnailUrl}
                              alt=""
                              className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
                            />
                          ) : null}
                          <div className="absolute inset-0 bg-black/35 transition group-hover:bg-black/45" />
                          <span className="absolute inset-0 flex items-center justify-center">
                            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white/90 text-[var(--accent)] shadow-lg">
                              <Play className="ml-0.5 h-6 w-6" strokeWidth={1.9} aria-hidden />
                            </span>
                          </span>
                        </div>
                        <div className="flex flex-1 flex-col justify-between space-y-1 p-3">
                          <p className="line-clamp-2 min-h-[2.6rem] text-xs font-semibold leading-snug text-[var(--text)] sm:text-sm">
                            {video.title}
                          </p>
                          <p className="text-xs text-[var(--text-muted)]">YouTube</p>
                        </div>
                      </div>
                    ) : (
                      <a
                        href={video.url}
                        className="group flex h-full min-h-[13.5rem] flex-col overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)] no-underline shadow-[var(--shadow-card)] transition hover:border-[var(--accent)]/40 hover:shadow-[var(--shadow-card-hover)]"
                        target="_blank"
                        rel="noreferrer"
                      >
                        <div className="flex aspect-video items-center justify-center bg-[#e9dfd1] text-[var(--accent)]">
                          <ExternalLink className="h-7 w-7" strokeWidth={1.8} aria-hidden />
                        </div>
                        <div className="flex flex-1 flex-col justify-between space-y-1 p-3">
                          <p className="line-clamp-2 min-h-[2.6rem] text-xs font-semibold leading-snug text-[var(--text)] sm:text-sm">
                            {video.title}
                          </p>
                          <p className="text-xs text-[var(--text-muted)]">Abrir recurso</p>
                        </div>
                      </a>
                    )}
                  </li>
                );
              })}
          </ul>
        ) : (
          <div className="rounded-xl border border-dashed border-[var(--border)] bg-[var(--surface-muted)] px-5 py-8 text-center">
            <p className="text-sm font-medium text-[var(--text)]">
              No se encontraron predicaciones con esa búsqueda.
            </p>
          </div>
        )}

      </section>

      {activeVideo && activeYoutubeId ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          role="dialog"
          aria-modal="true"
          aria-label={activeVideo.title}
          onClick={() => setActiveVideoUrl(null)}
        >
          <div
            className="relative w-full max-w-5xl overflow-hidden rounded-xl border border-white/15 bg-black shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setActiveVideoUrl(null)}
              className="absolute right-3 top-3 z-10 inline-flex h-9 w-9 items-center justify-center rounded-full bg-black/60 text-white transition hover:bg-black/80"
              aria-label="Cerrar reproductor"
            >
              <X className="h-5 w-5" strokeWidth={2} aria-hidden />
            </button>

            <div className="aspect-video w-full">
              <iframe
                src={`https://www.youtube.com/embed/${activeYoutubeId}?autoplay=1&rel=0`}
                title={activeVideo.title}
                className="h-full w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      ) : null}

      {editorMode ? (
        <VideoFormModal
          mode={editorMode}
          initialVideo={editorMode === "edit" ? editingVideo : null}
          submitting={savingVideo}
          error={savingError}
          onClose={() => {
            if (savingVideo) return;
            setEditorMode(null);
            setEditingVideo(null);
            setSavingError(null);
          }}
          onSubmit={async (payload) => {
            const title = payload.title.trim();
            const url = payload.url.trim();
            if (!title || !url) {
              setSavingError("Debes completar titulo y enlace.");
              return;
            }

            try {
              setSavingVideo(true);
              setSavingError(null);
              const isEdit = editorMode === "edit" && editingVideo;
              const target = isEdit
                ? `/api/predicaciones/videos/${editingVideo.id}`
                : "/api/predicaciones/videos";
              const method = isEdit ? "PUT" : "POST";

              const response = await fetch(target, {
                method,
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title, url }),
              });

              const data = (await response.json()) as { error?: string };
              if (!response.ok) {
                throw new Error(data.error ?? "No se pudo guardar el video.");
              }

              await reloadVideos();
              setEditorMode(null);
              setEditingVideo(null);
            } catch (error) {
              setSavingError(error instanceof Error ? error.message : "No se pudo guardar el video.");
            } finally {
              setSavingVideo(false);
            }
          }}
        />
      ) : null}

      {deleteTarget ? (
        <div
          className="fixed inset-0 z-[71] flex items-center justify-center bg-black/55 p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Confirmar eliminacion de video"
          onClick={() => {
            if (deletingVideo) return;
            setDeleteTarget(null);
            setDeletingError(null);
          }}
        >
          <div
            className="w-full max-w-md rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <h3 className="font-serif-display text-lg font-semibold text-[var(--text)]">
              Eliminar video de predicación
            </h3>
            <p className="mt-2 text-sm text-[var(--text-muted)]">
              Se eliminará <span className="font-semibold text-[var(--text)]">{deleteTarget.title}</span>.
            </p>
            {deletingError ? (
              <p className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-700">
                {deletingError}
              </p>
            ) : null}
            <div className="mt-4 flex flex-wrap justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  if (deletingVideo) return;
                  setDeleteTarget(null);
                  setDeletingError(null);
                }}
                className="inline-flex h-10 items-center rounded-lg border border-[var(--border)] px-4 text-sm font-medium text-[var(--text-muted)]"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={deletingVideo}
                onClick={async () => {
                  try {
                    setDeletingVideo(true);
                    setDeletingError(null);
                    const response = await fetch(`/api/predicaciones/videos/${deleteTarget.id}`, {
                      method: "DELETE",
                      credentials: "include",
                    });
                    const data = (await response.json()) as { error?: string };
                    if (!response.ok) {
                      throw new Error(data.error ?? "No se pudo eliminar el video.");
                    }
                    setDeleteTarget(null);
                    await reloadVideos();
                  } catch (error) {
                    setDeletingError(
                      error instanceof Error ? error.message : "No se pudo eliminar el video.",
                    );
                  } finally {
                    setDeletingVideo(false);
                  }
                }}
                className="inline-flex h-10 items-center gap-1.5 rounded-lg border border-red-300 bg-red-50 px-4 text-sm font-semibold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-70"
              >
                <Trash2 className="h-4 w-4" strokeWidth={1.9} aria-hidden />
                {deletingVideo ? "Eliminando..." : "Eliminar"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
