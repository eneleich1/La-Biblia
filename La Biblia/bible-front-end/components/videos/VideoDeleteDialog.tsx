"use client";

import { Trash2 } from "lucide-react";
import type { ManagedVideoItem } from "@/components/videos/types";

type VideoDeleteDialogProps = {
  video: ManagedVideoItem;
  deleting: boolean;
  error: string | null;
  onClose: () => void;
  onConfirm: () => Promise<void>;
};

export function VideoDeleteDialog({ video, deleting, error, onClose, onConfirm }: VideoDeleteDialogProps) {
  return (
    <div
      className="fixed inset-0 z-[71] flex items-center justify-center bg-black/55 p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Confirmar eliminación de video"
      onClick={() => {
        if (deleting) return;
        onClose();
      }}
    >
      <div
        className="w-full max-w-md rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <h3 className="font-serif-display text-lg font-semibold text-[var(--text)]">Eliminar video</h3>
        <p className="mt-2 text-sm text-[var(--text-muted)]">
          Se eliminará <span className="font-semibold text-[var(--text)]">{video.title}</span>.
        </p>
        {error ? (
          <p className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-700">
            {error}
          </p>
        ) : null}
        <div className="mt-4 flex flex-wrap justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={deleting}
            className="inline-flex h-10 items-center rounded-lg border border-[var(--border)] px-4 text-sm font-medium text-[var(--text-muted)]"
          >
            Cancelar
          </button>
          <button
            type="button"
            disabled={deleting}
            onClick={() => void onConfirm()}
            className="inline-flex h-10 items-center gap-1.5 rounded-lg border border-red-300 bg-red-50 px-4 text-sm font-semibold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-70"
          >
            <Trash2 className="h-4 w-4" strokeWidth={1.9} aria-hidden />
            {deleting ? "Eliminando..." : "Eliminar"}
          </button>
        </div>
      </div>
    </div>
  );
}
