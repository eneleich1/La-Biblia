"use client";

import { useState } from "react";
import { Bold, ChevronDown, Strikethrough, Underline } from "lucide-react";

const FONT_SIZE_PRESETS = ["12", "14", "16", "18", "20", "24", "28", "32", "40", "48"];
const FONT_FAMILIES = [
  { label: "Inter (predeterminada)", value: "var(--font-sans), system-ui, sans-serif" },
  { label: "Lora Serif", value: "var(--font-serif), Georgia, serif" },
  { label: "Arial", value: "Arial, Helvetica, sans-serif" },
  { label: "Helvetica", value: "\"Helvetica Neue\", Helvetica, Arial, sans-serif" },
  { label: "Verdana", value: "Verdana, Geneva, sans-serif" },
  { label: "Tahoma", value: "Tahoma, Geneva, sans-serif" },
  { label: "Trebuchet MS", value: "\"Trebuchet MS\", Helvetica, sans-serif" },
  { label: "Times New Roman", value: "\"Times New Roman\", Times, serif" },
  { label: "Georgia", value: "Georgia, serif" },
  { label: "Garamond", value: "Garamond, Baskerville, serif" },
  { label: "Palatino", value: "\"Palatino Linotype\", Palatino, serif" },
  { label: "Courier New", value: "\"Courier New\", Courier, monospace" },
  { label: "Consolas", value: "Consolas, \"Liberation Mono\", Menlo, monospace" },
  { label: "Monaco", value: "Monaco, Menlo, monospace" },
  { label: "Comic Sans MS", value: "\"Comic Sans MS\", \"Comic Sans\", cursive" },
];

type Props = {
  onCommand: (command: string, value?: string) => void;
};

export function TextFormatToolbar({ onCommand }: Props) {
  const [fontSizeInput, setFontSizeInput] = useState("16");
  const [showFontSizeMenu, setShowFontSizeMenu] = useState(false);

  const applyFontSize = () => {
    const parsed = Number(fontSizeInput);
    if (!Number.isFinite(parsed) || parsed <= 0) return;
    onCommand("fontSize", `${parsed}px`);
  };

  return (
    <div
      className="flex flex-wrap items-center gap-1 rounded-md border border-[var(--border)] bg-[var(--surface)] p-1.5 shadow-lg"
      onMouseDown={(event) => event.stopPropagation()}
      onClick={(event) => event.stopPropagation()}
    >
      <div className="relative inline-flex items-center gap-1 rounded border border-[var(--border)] bg-[var(--background-soft)] px-2">
        <input
          type="text"
          inputMode="numeric"
          value={fontSizeInput}
          onChange={(event) => {
            const onlyDigits = event.target.value.replace(/[^\d]/g, "");
            setFontSizeInput(onlyDigits);
          }}
          onBlur={() => {
            applyFontSize();
            setShowFontSizeMenu(false);
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              applyFontSize();
              setShowFontSizeMenu(false);
            } else if (event.key === "ArrowDown") {
              event.preventDefault();
              setShowFontSizeMenu(true);
            } else if (event.key === "Escape") {
              setShowFontSizeMenu(false);
            }
          }}
          className="h-8 w-[2.8rem] bg-transparent text-xs outline-none"
          aria-label="Tamaño de fuente (px)"
        />
        <button
          type="button"
          aria-label="Abrir tamaños de fuente"
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => setShowFontSizeMenu((current) => !current)}
          className="inline-flex h-7 w-6 items-center justify-center rounded border border-[var(--border)] bg-[var(--surface)] text-[var(--text-muted)]"
        >
          <ChevronDown className="h-3.5 w-3.5" />
        </button>
        <span className="text-[11px] font-semibold text-[var(--text-muted)]">px</span>
        {showFontSizeMenu ? (
          <div className="absolute left-0 top-[calc(100%+0.35rem)] z-40 max-h-44 w-24 overflow-auto rounded-md border border-[var(--border)] bg-[var(--surface)] p-1 shadow-lg">
            {FONT_SIZE_PRESETS.map((size) => (
              <button
                key={size}
                type="button"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => {
                  setFontSizeInput(size);
                  onCommand("fontSize", `${size}px`);
                  setShowFontSizeMenu(false);
                }}
                className="block w-full rounded px-2 py-1 text-left text-xs text-[var(--text)] hover:bg-[var(--accent-soft)]"
              >
                {size}px
              </button>
            ))}
          </div>
        ) : null}
      </div>
      <select
        className="h-8 min-w-[13rem] rounded border border-[var(--border)] bg-[var(--background-soft)] px-2 text-xs"
        defaultValue="var(--font-sans), system-ui, sans-serif"
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
