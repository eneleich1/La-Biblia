"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
export type LinkedCatholicChurchArgument = {
  id: string;
  title: string;
  bodyHtml: string;
};

type ArgumentsAccordionProps = {
  arguments: LinkedCatholicChurchArgument[];
};

export function ArgumentsAccordion({ arguments: items }: ArgumentsAccordionProps) {
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <ol className="space-y-2">
      {items.map((item, index) => {
        const isOpen = openId === item.id;
        const panelId = `${item.id}-panel`;
        const buttonId = `${item.id}-button`;

        return (
          <li key={item.id}>
            <div className="overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-card)]">
              <button
                id={buttonId}
                type="button"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => setOpenId(isOpen ? null : item.id)}
                className="flex w-full items-start gap-3 px-4 py-3.5 text-left transition hover:bg-[var(--background-soft)]"
              >
                <span
                  className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-[var(--accent)]/30 bg-[#fbf6ee] text-xs font-semibold text-[var(--accent)]"
                  aria-hidden
                >
                  {index + 1}
                </span>
                <span className="min-w-0 flex-1 text-sm font-semibold leading-snug text-[var(--text)] sm:text-base">
                  {item.title}
                </span>
                <ChevronDown
                  className={`mt-0.5 h-5 w-5 shrink-0 text-[var(--text-muted)] transition-transform ${isOpen ? "rotate-180" : ""}`}
                  strokeWidth={2}
                  aria-hidden
                />
              </button>
              <div
                id={panelId}
                role="region"
                aria-labelledby={buttonId}
                hidden={!isOpen}
                className="border-t border-[var(--border)] bg-[#fdfbf7] px-4 py-3.5 sm:px-5"
              >
                <p
                  className="text-sm leading-relaxed text-[var(--text)]/90 [&_a]:font-semibold [&_a]:text-[var(--accent)] [&_a]:hover:underline"
                  dangerouslySetInnerHTML={{ __html: item.bodyHtml }}
                />
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
