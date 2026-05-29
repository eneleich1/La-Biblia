"use client";

import { useState } from "react";
import { X } from "lucide-react";
import type { ManagedVideoItem } from "@/components/videos/types";

export type VideoFormPayload = {
  title: string;
  url: string;
  topicId?: string;
  tag?: string | null;
};

type TopicOption = { id: string; label: string };

type VideoFormModalProps = {
  mode: "create" | "edit";
  initialVideo: ManagedVideoItem | null;
  submitting: boolean;
  error: string | null;
  onClose: () => void;
  onSubmit: (payload: VideoFormPayload) => Promise<void>;
  topicOptions?: TopicOption[];
  initialTopicId?: string;
  showTagField?: boolean;
  initialTag?: string | null;
};

export function VideoFormModal({
  mode,
  initialVideo,
  submitting,
  error,
  onClose,
  onSubmit,
  topicOptions,
  initialTopicId,
  showTagField = false,
  initialTag = null,
}: VideoFormModalProps) {
  const [title, setTitle] = useState(initialVideo?.title ?? "");
  const [url, setUrl] = useState(initialVideo?.url ?? "");
  const [topicId, setTopicId] = useState(initialTopicId ?? topicOptions?.[0]?.id ?? "");
  const [tag, setTag] = useState(initialTag ?? "");

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
            await onSubmit({
              title,
              url,
              topicId: topicOptions?.length ? topicId : undefined,
              tag: showTagField ? tag.trim() || null : undefined,
            });
          }}
        >
          {topicOptions?.length ? (
            <label className="block space-y-1.5">
              <span className="text-sm font-semibold text-[var(--text)]">Sección</span>
              <select
                value={topicId}
                onChange={(event) => setTopicId(event.target.value)}
                className="h-11 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 text-sm text-[var(--text)] outline-none transition focus:border-[var(--accent)]/45 focus:ring-2 focus:ring-[var(--accent)]/15"
                required
              >
                {topicOptions.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          ) : null}

          <label className="block space-y-1.5">
            <span className="text-sm font-semibold text-[var(--text)]">Título del video</span>
            <input
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              className="h-11 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 text-sm text-[var(--text)] outline-none transition focus:border-[var(--accent)]/45 focus:ring-2 focus:ring-[var(--accent)]/15"
              placeholder="Ej: Procesión San Lázaro"
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

          {showTagField ? (
            <label className="block space-y-1.5">
              <span className="text-sm font-semibold text-[var(--text)]">Etiqueta (opcional)</span>
              <input
                type="text"
                value={tag}
                onChange={(event) => setTag(event.target.value)}
                className="h-11 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 text-sm text-[var(--text)] outline-none transition focus:border-[var(--accent)]/45 focus:ring-2 focus:ring-[var(--accent)]/15"
                placeholder="Ej: Sincretismo"
              />
            </label>
          ) : null}

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
