"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  Bookmark,
  BookOpen,
  ChevronRight,
  Church,
  Clock,
  Pencil,
  ExternalLink,
  Home,
  MessagesSquare,
  Play,
  Search,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import {
  apologeticaGuides,
  apologeticaHeroQuote,
  apologeticaMoreResources,
  apologeticaPageDescription,
  apologeticaStats,
  apologeticaTabs,
  apologeticsForums,
  apologeticsVideoLinks,
  type ApologeticaGuide,
  type ApologeticaResource,
  type ApologeticaTab,
} from "@/data/apologeticaContent";
import { fetchAdminSession } from "@/lib/sitePagesApi";

type ApologeticaVideoItem = {
  id: string;
  title: string;
  url: string;
  position?: number;
};

function SectionTitle({ children }: { children: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="h-0.5 w-8 shrink-0 bg-[var(--accent)]" aria-hidden />
      <h2 className="font-serif-display text-xl font-semibold text-[var(--text)] sm:text-[1.35rem]">
        {children}
      </h2>
    </div>
  );
}

/** Ilustración de respaldo si aún no hay asset final */
function HeroImagePanel() {
  return (
    <div className="relative h-full min-h-[7rem] w-full overflow-hidden" aria-hidden>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/apologetica/hero.png"
        alt=""
        className="absolute inset-0 h-full w-full object-cover object-center"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-[#f7f1e8] via-[#f7f1e8]/70 to-transparent" />
      <div className="absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-[#f7f1e8] to-transparent" />
    </div>
  );
}

function HeroFeatureCard() {
  const statItems = [
    { icon: BookOpen, value: apologeticaStats.guides, label: "Guías disponibles" },
    { icon: MessagesSquare, value: apologeticaStats.debates, label: "Debates y respuestas" },
    { icon: Play, value: apologeticaStats.videos, label: "Videos apologéticos" },
    {
      icon: Church,
      value: null,
      label: "Más recursos",
      prefix: "Próximamente",
      muted: true,
    },
  ] as const;

  return (
    <div className="min-w-0 w-full flex-1 overflow-hidden rounded-md border border-[var(--border)] bg-[#f7f1e8] shadow-[var(--shadow-card)]">
      <div className="grid min-h-[7.5rem] lg:grid-cols-[minmax(0,1fr)_16rem_minmax(9rem,10.75rem)] lg:items-stretch">
        <blockquote className="relative z-10 min-w-0 px-6 py-5">
          <span
            className="pointer-events-none font-serif-display text-[2.25rem] leading-none text-[var(--accent)]/30"
            aria-hidden
          >
            “
          </span>
          <p className="-mt-2 max-w-[28rem] font-serif-display text-[12px] italic leading-[1.55] text-[var(--text)] sm:text-[13px]">
            {apologeticaHeroQuote.text}
          </p>
          <footer className="mt-2 text-[11px] font-medium text-[var(--text-muted)] sm:text-xs">
            — {apologeticaHeroQuote.reference}
          </footer>
        </blockquote>

        <div className="relative hidden min-h-full lg:block">
          <HeroImagePanel />
        </div>

        <ul className="flex flex-col justify-center gap-2.5 border-t border-[var(--border)]/70 bg-[var(--surface)] px-4 py-3 lg:border-l lg:border-t-0">
          {statItems.map(({ icon: Icon, value, label, ...rest }) => (
            <li key={label} className="flex items-center gap-2">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[var(--border)] bg-white text-[var(--accent)]">
                <Icon className="h-3.5 w-3.5" strokeWidth={1.65} aria-hidden />
              </span>
              <p
                className={`text-[11px] leading-snug ${
                  "muted" in rest && rest.muted
                    ? "text-[var(--text-muted)]"
                    : "text-[var(--text)]"
                }`}
              >
                {"prefix" in rest && rest.prefix ? (
                  <>
                    <span className="font-semibold">{rest.prefix}</span> {label}
                  </>
                ) : (
                  <>
                    <span className="font-semibold">{value}</span> {label}
                  </>
                )}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function TabBar({
  active,
  onChange,
}: {
  active: ApologeticaTab;
  onChange: (tab: ApologeticaTab) => void;
}) {
  return (
    <div className="w-full border-b border-[var(--border)]">
      <div
        className="flex flex-wrap items-end gap-1.5"
        role="tablist"
        aria-label="Secciones de apologética"
      >
        {apologeticaTabs.map(({ id, label, icon: Icon }) => {
          const isActive = active === id;
          return (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => onChange(id)}
              className={`-mb-px inline-flex items-center gap-2 rounded-t-md border px-3.5 py-2 text-xs font-semibold transition sm:px-4 ${
                isActive
                  ? "border-[var(--accent)]/45 border-b-[#f5efe6] bg-[#f5efe6] text-[var(--text)]"
                  : "border-[var(--border)] bg-[var(--surface)] text-[var(--text-muted)] hover:border-[var(--accent)]/25 hover:text-[var(--text)]"
              }`}
            >
              <Icon
                className={`h-3.5 w-3.5 shrink-0 ${isActive ? "text-[var(--accent)]" : ""}`}
                strokeWidth={1.75}
                aria-hidden
              />
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function GuideIcon({ guide }: { guide: ApologeticaGuide }) {
  const sizeClass = "h-[4.75rem] w-[4.75rem] shrink-0 sm:h-[5.25rem] sm:w-[5.25rem]";

  if (guide.iconSrc) {
    return (
      <div
        className={`relative flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#f5efe6] ${sizeClass}`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={guide.iconSrc}
          alt={guide.iconAlt ?? guide.title}
          width={80}
          height={80}
          className="h-full w-full object-contain"
        />
      </div>
    );
  }

  const Icon = guide.icon ?? BookOpen;
  return (
    <div
      className={`flex items-center justify-center rounded-full bg-[#f5efe6] ring-1 ring-[var(--accent)]/15 ${sizeClass}`}
    >
      <Icon className="h-9 w-9 text-[var(--accent)] sm:h-10 sm:w-10" strokeWidth={1.5} aria-hidden />
    </div>
  );
}

function GuideCard({ guide }: { guide: ApologeticaGuide }) {
  return (
    <Link
      href={`/apologetica/${guide.slug}`}
      className="group relative flex gap-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-card)] transition hover:border-[var(--accent)]/35 hover:shadow-[var(--shadow-card-hover)] no-underline sm:gap-5"
    >
      <Bookmark
        className="absolute right-4 top-4 h-4 w-4 text-[var(--accent)]"
        strokeWidth={1.75}
        aria-hidden
      />
      <GuideIcon guide={guide} />
      <div className="min-w-0 flex-1 pr-5">
        <h3 className="font-serif-display text-lg font-semibold leading-snug text-[var(--text)] sm:text-xl">
          {guide.title}
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-[var(--text-muted)] sm:text-[15px]">
          {guide.description}
        </p>
        <span className="mt-4 inline-flex items-center gap-0.5 text-sm font-semibold text-[var(--accent)] transition group-hover:gap-1">
          Abrir tema
          <ChevronRight className="h-4 w-4" strokeWidth={2} aria-hidden />
        </span>
      </div>
    </Link>
  );
}

function ResourceCard({
  resource,
  onOpenVideos,
}: {
  resource: ApologeticaResource;
  onOpenVideos: () => void;
}) {
  const Icon = resource.icon;
  const isVideosCard = resource.id === "videos";
  return (
    <article className="flex h-full flex-col rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-card)]">
      <div className="flex items-start gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#f5efe6] text-[var(--accent)]">
          <Icon className="h-5 w-5" strokeWidth={1.65} aria-hidden />
        </span>
        <div className="min-w-0">
          <h3 className="font-serif-display text-base font-semibold leading-snug text-[var(--text)]">
            {resource.title}
          </h3>
          <p className="mt-1.5 text-sm leading-relaxed text-[var(--text-muted)]">
            {resource.description}
          </p>
        </div>
      </div>
      {isVideosCard ? (
        <button
          type="button"
          onClick={onOpenVideos}
          className="mt-auto inline-flex w-fit items-center justify-center gap-1.5 rounded-md border border-[var(--accent)]/35 bg-[#f5efe6] px-3 py-1.5 text-xs font-semibold text-[var(--accent)] transition hover:border-[var(--accent)]/55"
        >
          <Play className="h-3.5 w-3.5 shrink-0" strokeWidth={1.75} aria-hidden />
          Ver videos
        </button>
      ) : (
        <span className="mt-auto inline-flex w-fit items-center justify-center gap-1.5 rounded-md border border-[var(--border)] bg-[var(--background-soft)] px-3 py-1.5 text-xs font-medium text-[var(--text-muted)]">
          <Clock className="h-3.5 w-3.5 shrink-0" strokeWidth={1.75} aria-hidden />
          Próximamente
        </span>
      )}
    </article>
  );
}

function ComingSoonPanel({ title }: { title: string }) {
  return (
    <div className="rounded-xl border border-dashed border-[var(--border)] bg-[var(--surface-muted)] px-6 py-12 text-center">
      <Clock className="mx-auto h-8 w-8 text-[var(--accent)]" strokeWidth={1.5} aria-hidden />
      <p className="mt-4 font-serif-display text-lg font-semibold text-[var(--text)]">{title}</p>
      <p className="mt-2 text-sm text-[var(--text-muted)]">
        Esta sección estará disponible próximamente.
      </p>
    </div>
  );
}

function DebatesPanel() {
  if (!apologeticsForums.length) {
    return <ComingSoonPanel title="Debates y respuestas" />;
  }
  return (
    <ul className="grid gap-4 sm:grid-cols-2">
      {apologeticsForums.map((forum) => (
        <li key={forum.slug}>
          <Link
            href={`/apologetica/${forum.slug}`}
            className="flex items-center justify-between gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-card)] transition hover:border-[var(--accent)]/40 no-underline"
          >
            <div className="min-w-0">
              <h3 className="font-serif-display text-lg font-semibold text-[var(--text)]">
                {forum.title}
              </h3>
              <p className="mt-1 text-sm text-[var(--text-muted)]">
                {forum.topics.length} tópico{forum.topics.length === 1 ? "" : "s"}
              </p>
            </div>
            <ArrowRight className="h-5 w-5 shrink-0 text-[var(--accent)]" strokeWidth={2} aria-hidden />
          </Link>
        </li>
      ))}
    </ul>
  );
}

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
  initialVideo: ApologeticaVideoItem | null;
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
      aria-label={mode === "create" ? "Adicionar nuevo video" : "Editar video"}
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
              {mode === "create" ? "Adicionar nuevo video" : "Actualizar video"}
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
            <span className="text-sm font-semibold text-[var(--text)]">Titulo del video</span>
            <input
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              className="h-11 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 text-sm text-[var(--text)] outline-none transition focus:border-[var(--accent)]/45 focus:ring-2 focus:ring-[var(--accent)]/15"
              placeholder="Ej: Luis Toro: Purgatorio"
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

function VideosPanel() {
  const [videos, setVideos] = useState<ApologeticaVideoItem[]>(
    apologeticsVideoLinks.map((video, index) => ({
      id: `default-${index}`,
      title: video.title,
      url: video.url,
      position: index,
    })),
  );
  const [isAdmin, setIsAdmin] = useState(false);
  const [loadingVideos, setLoadingVideos] = useState(true);
  const [loadingError, setLoadingError] = useState<string | null>(null);
  const [activeVideoUrl, setActiveVideoUrl] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [editorMode, setEditorMode] = useState<"create" | "edit" | null>(null);
  const [editingVideo, setEditingVideo] = useState<ApologeticaVideoItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ApologeticaVideoItem | null>(null);
  const [savingVideo, setSavingVideo] = useState(false);
  const [savingError, setSavingError] = useState<string | null>(null);
  const [deletingVideo, setDeletingVideo] = useState(false);
  const [deletingError, setDeletingError] = useState<string | null>(null);
  const activeVideo = videos.find((video) => video.url === activeVideoUrl) ?? null;
  const activeYoutubeId = activeVideo ? getYouTubeVideoId(activeVideo.url) : null;

  const reloadVideos = async () => {
    try {
      setLoadingError(null);
      const response = await fetch("/api/apologetica/videos", { credentials: "include" });
      const data = (await response.json()) as { videos?: ApologeticaVideoItem[]; error?: string };
      if (!response.ok || !data.videos) {
        throw new Error(data.error ?? "No se pudieron cargar los videos.");
      }
      if (data.videos.length) {
        setVideos(data.videos);
      }
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
  const filteredVideos = !normalizedSearch
    ? videos
    : videos.filter((video) => video.title.toLowerCase().includes(normalizedSearch));

  if (!videos.length && !loadingVideos && !loadingError) {
    return <ComingSoonPanel title="Videos apologéticos" />;
  }
  return (
    <>
      <div className="mb-4 flex items-center gap-2 sm:gap-3">
        <label className="relative min-w-0 max-w-[38rem] flex-1">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]"
            strokeWidth={1.8}
            aria-hidden
          />
          <input
            type="search"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Buscar video por nombre..."
            className="h-10 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] pl-9 pr-3 text-sm text-[var(--text)] outline-none transition placeholder:text-[var(--text-muted)] focus:border-[var(--accent)]/45 focus:ring-2 focus:ring-[var(--accent)]/15"
            aria-label="Buscar videos por nombre"
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
            title="Adicionar nuevo video"
            aria-label="Adicionar nuevo video"
          >
            <Plus className="h-4 w-4" strokeWidth={2} aria-hidden />
            <span className="hidden text-sm font-semibold md:inline">Adicionar nuevo video</span>
          </button>
        ) : null}
      </div>

      {loadingError && !videos.length ? (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {loadingError}
        </div>
      ) : null}

      {loadingVideos ? (
        <p className="mb-3 text-xs font-medium text-[var(--text-muted)]">
          Actualizando videos...
        </p>
      ) : null}

      {filteredVideos.length ? (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {filteredVideos.map((video) => {
          const youtubeId = getYouTubeVideoId(video.url);
          const thumbnailUrl = youtubeId
            ? `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`
            : null;
          return (
            <li key={video.url}>
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
                  className="group relative w-full overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)] text-left shadow-[var(--shadow-card)] transition hover:border-[var(--accent)]/40 hover:shadow-[var(--shadow-card-hover)]"
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
                  <div className="relative aspect-square overflow-hidden bg-[#ddd2c2]">
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
                  <div className="space-y-1 p-3">
                    <p className="line-clamp-2 text-xs font-semibold leading-snug text-[var(--text)] sm:text-sm">
                      {video.title}
                    </p>
                    <p className="text-xs text-[var(--text-muted)]">YouTube</p>
                  </div>
                </div>
              ) : (
                <a
                  href={video.url}
                  className="group block overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)] no-underline shadow-[var(--shadow-card)] transition hover:border-[var(--accent)]/40 hover:shadow-[var(--shadow-card-hover)]"
                  target="_blank"
                  rel="noreferrer"
                >
                  <div className="flex aspect-square items-center justify-center bg-[#e9dfd1] text-[var(--accent)]">
                    <ExternalLink className="h-7 w-7" strokeWidth={1.8} aria-hidden />
                  </div>
                  <div className="space-y-1 p-3">
                    <p className="line-clamp-2 text-xs font-semibold leading-snug text-[var(--text)] sm:text-sm">
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
          <p className="text-sm font-medium text-[var(--text)]">No se encontraron videos con ese nombre.</p>
          <p className="mt-1 text-xs text-[var(--text-muted)]">
            Intenta otra palabra o borra la búsqueda.
          </p>
        </div>
      )}

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
                ? `/api/apologetica/videos/${editingVideo.id}`
                : "/api/apologetica/videos";
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
            <h3 className="font-serif-display text-lg font-semibold text-[var(--text)]">Eliminar video</h3>
            <p className="mt-2 text-sm text-[var(--text-muted)]">
              Se eliminara <span className="font-semibold text-[var(--text)]">{deleteTarget.title}</span>.
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
                    const response = await fetch(`/api/apologetica/videos/${deleteTarget.id}`, {
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
    </>
  );
}

export function ApologeticaIndex({ initialTab = "guias" }: { initialTab?: ApologeticaTab }) {
  const [activeTab, setActiveTab] = useState<ApologeticaTab>(initialTab);

  return (
    <div className="sermons-index-page space-y-8 lg:space-y-10">
      <nav className="text-sm text-[var(--text-muted)]" aria-label="Migas de pan">
        <ol className="flex flex-wrap items-center gap-1.5">
          <li>
            <Link
              href="/"
              className="inline-flex items-center transition hover:text-[var(--accent)]"
              aria-label="Inicio"
            >
              <Home className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
            </Link>
          </li>
          <li aria-hidden className="text-[var(--text-muted)]/50">
            /
          </li>
          <li>
            <Link href="/" className="transition hover:text-[var(--accent)]">
              Inicio
            </Link>
          </li>
          <li aria-hidden className="text-[var(--text-muted)]/50">
            /
          </li>
          <li className="font-medium text-[var(--text)]" aria-current="page">
            Apologética
          </li>
        </ol>
      </nav>

      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:gap-8">
        <header className="w-full shrink-0 space-y-2 lg:w-[min(100%,20rem)] lg:pt-1">
          <h1 className="page-title">
            Apologética
          </h1>
          <p className="max-w-[20rem] text-base leading-relaxed text-[var(--text-muted)] sm:text-[17px]">
            {apologeticaPageDescription}
          </p>
        </header>
        <HeroFeatureCard />
      </div>

      <TabBar active={activeTab} onChange={setActiveTab} />

      {activeTab === "guias" ? (
        <>
          <section className="space-y-5" aria-labelledby="guias-apologetica">
            <SectionTitle>Guías bíblicas para apologética</SectionTitle>
            <div id="guias-apologetica" className="grid gap-4 lg:grid-cols-2">
              {apologeticaGuides.map((guide) => (
                <GuideCard key={guide.slug} guide={guide} />
              ))}
            </div>
          </section>

          <section className="space-y-5" aria-labelledby="mas-recursos-apologetica">
            <SectionTitle>Más recursos de apologética</SectionTitle>
            <div
              id="mas-recursos-apologetica"
              className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
            >
              {apologeticaMoreResources.map((resource) => (
                <ResourceCard
                  key={resource.id}
                  resource={resource}
                  onOpenVideos={() => setActiveTab("videos")}
                />
              ))}
            </div>
          </section>
        </>
      ) : null}

      {activeTab === "temas" ? <ComingSoonPanel title="Temas frecuentes" /> : null}
      {activeTab === "debates" ? <DebatesPanel /> : null}
      {activeTab === "videos" ? <VideosPanel /> : null}
    </div>
  );
}
