"use client";

import { X } from "lucide-react";

type YouTubeVideoPlayerModalProps = {
  title: string;
  youtubeId: string;
  onClose: () => void;
};

export function YouTubeVideoPlayerModal({ title, youtubeId, onClose }: YouTubeVideoPlayerModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-5xl overflow-hidden rounded-xl border border-white/15 bg-black shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 z-10 inline-flex h-9 w-9 items-center justify-center rounded-full bg-black/60 text-white transition hover:bg-black/80"
          aria-label="Cerrar reproductor"
        >
          <X className="h-5 w-5" strokeWidth={2} aria-hidden />
        </button>

        <div className="aspect-video w-full">
          <iframe
            src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&rel=0`}
            title={title}
            className="h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>
      </div>
    </div>
  );
}
