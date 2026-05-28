"use client";

import { Bold, Strikethrough, Underline } from "lucide-react";

const FONT_SIZES = ["14px", "16px", "18px", "22px", "28px", "36px"];
const FONT_FAMILIES = [
  { label: "Sans (predeterminada)", value: "sans" },
  { label: "Serif", value: "serif" },
  { label: "Monoespaciada", value: "mono" },
];

type Props = {
  onCommand: (command: string, value?: string) => void;
};

export function TextFormatToolbar({ onCommand }: Props) {
  return (
    <div
      className="flex flex-wrap items-center gap-1 rounded-md border border-[var(--border)] bg-[var(--surface)] p-1.5 shadow-lg"
      onMouseDown={(event) => event.stopPropagation()}
      onClick={(event) => event.stopPropagation()}
    >
      <select
        className="h-8 min-w-[4.9rem] rounded border border-[var(--border)] bg-[var(--background-soft)] px-2 text-xs"
        defaultValue="16px"
        onChange={(event) => onCommand("fontSize", event.target.value)}
        aria-label="Tamaño de fuente"
      >
        {FONT_SIZES.map((size) => (
          <option key={size} value={size}>
            {size}
          </option>
        ))}
      </select>
      <select
        className="h-8 min-w-[11rem] rounded border border-[var(--border)] bg-[var(--background-soft)] px-2 text-xs"
        defaultValue="sans"
        onChange={(event) => onCommand("fontFamily", event.target.value)}
        aria-label="Fuente"
      >
        {FONT_FAMILIES.map((font) => (
          <option key={font.value} value={font.value}>
            {font.label}
          </option>
        ))}
      </select>
      <button
        type="button"
        title="Negrita"
        onMouseDown={(event) => event.preventDefault()}
        onClick={() => onCommand("bold")}
        className="inline-flex h-8 w-8 items-center justify-center rounded border border-[var(--border)] hover:bg-[var(--accent-soft)]"
      >
        <Bold className="h-3.5 w-3.5" />
      </button>
      <button
        type="button"
        title="Subrayado"
        onMouseDown={(event) => event.preventDefault()}
        onClick={() => onCommand("underline")}
        className="inline-flex h-8 w-8 items-center justify-center rounded border border-[var(--border)] hover:bg-[var(--accent-soft)]"
      >
        <Underline className="h-3.5 w-3.5" />
      </button>
      <button
        type="button"
        title="Tachado"
        onMouseDown={(event) => event.preventDefault()}
        onClick={() => onCommand("strikeThrough")}
        className="inline-flex h-8 w-8 items-center justify-center rounded border border-[var(--border)] hover:bg-[var(--accent-soft)]"
      >
        <Strikethrough className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
