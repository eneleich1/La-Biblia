import { ExternalLink, Pencil, Play, Trash2 } from "lucide-react";
import { getYouTubeThumbnailUrl, getYouTubeVideoId } from "@/lib/youtube";

type YouTubeVideoCardProps = {
  title: string;
  url: string;
  tag?: string | null;
  isAdmin?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  onPlay?: () => void;
};

export function YouTubeVideoCard({ title, url, tag, isAdmin, onEdit, onDelete, onPlay }: YouTubeVideoCardProps) {
  const youtubeId = getYouTubeVideoId(url);
  const thumbnailUrl = getYouTubeThumbnailUrl(url);
  const canPlayInline = Boolean(youtubeId && onPlay);

  const adminButtons = isAdmin ? (
    <div className="flex shrink-0 items-center gap-0.5">
      <button
        type="button"
        className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface)] text-[var(--accent)] shadow-sm transition hover:border-[var(--accent)]/40 hover:bg-[var(--background-soft)]"
        aria-label={`Editar ${title}`}
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          onEdit?.();
        }}
      >
        <Pencil className="h-2.5 w-2.5" strokeWidth={2} aria-hidden />
      </button>
      <button
        type="button"
        className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface)] text-red-600 shadow-sm transition hover:border-red-200 hover:bg-red-50"
        aria-label={`Eliminar ${title}`}
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          onDelete?.();
        }}
      >
        <Trash2 className="h-2.5 w-2.5" strokeWidth={2} aria-hidden />
      </button>
    </div>
  ) : null;

  const thumbnailBlock = (
    <div className="relative aspect-video overflow-hidden bg-[#1a1a1a]">
      {thumbnailUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={thumbnailUrl}
          alt=""
          className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
        />
      ) : null}
      <div className="absolute inset-0 bg-black/35 transition group-hover:bg-black/45" />
      {tag ? (
        <span className="absolute right-2 top-1.5 z-10 max-w-[calc(100%-1rem)] truncate rounded-md bg-black/70 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-white sm:text-[10px]">
          {tag}
        </span>
      ) : null}
      <span className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-[var(--accent)] shadow-lg sm:h-11 sm:w-11">
          <Play className="ml-0.5 h-4 w-4 sm:h-5 sm:w-5" strokeWidth={1.9} aria-hidden />
        </span>
      </span>
    </div>
  );

  const metaBlock = (
    <div className="p-2.5 sm:p-3">
      <p className="line-clamp-2 text-xs font-semibold leading-snug text-[var(--text)] sm:text-sm">{title}</p>
      <div className="mt-1 flex items-center justify-between gap-2">
        <p className="text-[11px] text-[var(--text-muted)] sm:text-xs">YouTube</p>
        {adminButtons}
      </div>
    </div>
  );

  if (canPlayInline) {
    return (
      <div
        role="button"
        tabIndex={0}
        onClick={onPlay}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            onPlay?.();
          }
        }}
        className="group relative w-full cursor-pointer overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--surface)] text-left shadow-[var(--shadow-card)] transition hover:border-[var(--accent)]/40 hover:shadow-[var(--shadow-card-hover)]"
        aria-label={`Reproducir ${title}`}
      >
        {thumbnailBlock}
        {metaBlock}
      </div>
    );
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      className="group relative flex flex-col overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--surface)] no-underline transition hover:border-[var(--accent)]/35 hover:shadow-[var(--shadow-card)]"
    >
      {youtubeId ? (
        thumbnailBlock
      ) : (
        <div className="flex aspect-video items-center justify-center bg-[#e9dfd1] text-[var(--accent)]">
          <ExternalLink className="h-7 w-7" strokeWidth={1.8} aria-hidden />
        </div>
      )}
      <div className="p-2.5 sm:p-3">
        <p className="line-clamp-2 text-xs font-semibold leading-snug text-[var(--text)] sm:text-sm">{title}</p>
        <div className="mt-1 flex items-center justify-between gap-2">
          <p className="text-[11px] text-[var(--text-muted)] sm:text-xs">
            {youtubeId ? "YouTube" : "Abrir recurso"}
          </p>
          {adminButtons}
        </div>
      </div>
    </a>
  );
}
