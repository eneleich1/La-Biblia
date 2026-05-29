"use client";

import { Plus, Search } from "lucide-react";

type VideoSearchToolbarProps = {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  isAdmin: boolean;
  onAddClick?: () => void;
  placeholder?: string;
};

export function VideoSearchToolbar({
  searchTerm,
  onSearchChange,
  isAdmin,
  onAddClick,
  placeholder = "Buscar video por nombre...",
}: VideoSearchToolbarProps) {
  return (
    <div className="mb-4 flex items-center gap-2 sm:gap-3">
      <label className="relative min-w-0 flex-1">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]"
          strokeWidth={1.8}
          aria-hidden
        />
        <input
          type="search"
          value={searchTerm}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder={placeholder}
          className="h-10 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] pl-9 pr-3 text-sm text-[var(--text)] outline-none transition placeholder:text-[var(--text-muted)] focus:border-[var(--accent)]/45 focus:ring-2 focus:ring-[var(--accent)]/15"
          aria-label="Buscar videos por nombre"
        />
      </label>
      {isAdmin && onAddClick ? (
        <button
          type="button"
          onClick={onAddClick}
          className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[var(--accent)]/45 bg-[#f5efe6] text-[var(--accent)] transition hover:border-[var(--accent)]/60 sm:w-auto sm:gap-2 sm:px-3"
          title="Adicionar nuevo video"
          aria-label="Adicionar nuevo video"
        >
          <Plus className="h-4 w-4" strokeWidth={2} aria-hidden />
          <span className="hidden text-sm font-semibold md:inline">Adicionar nuevo video</span>
        </button>
      ) : null}
    </div>
  );
}
