"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { readSitePages, sanitizePageRoute, type SitePage } from "@/lib/clientSiteBuilder";

export default function DynamicSitePage() {
  const params = useParams<{ slug?: string[] }>();
  const [pages, setPages] = useState<SitePage[]>([]);

  useEffect(() => {
    setPages(readSitePages());
  }, []);

  const route = useMemo(() => `/${(params.slug ?? []).join("/")}`, [params.slug]);
  const normalized = sanitizePageRoute(route);
  const page = pages.find((item) => sanitizePageRoute(item.route) === normalized);

  if (!page) {
    return (
      <main className="mx-auto w-full max-w-4xl">
        <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[var(--shadow-card)]">
          <h1 className="font-serif-display text-2xl font-semibold text-[var(--text)]">
            Página no encontrada
          </h1>
          <p className="mt-2 text-sm text-[var(--text-muted)]">
            Esta ruta no tiene contenido publicado todavía.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-4xl">
      <article className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[var(--shadow-card)]">
        <h1 className="font-serif-display text-3xl font-semibold text-[var(--text)]">{page.title}</h1>
        <div className="mt-5 space-y-4">
          {page.blocks.map((block) =>
            block.type === "text" ? (
              <p key={block.id} className="whitespace-pre-wrap text-[15px] leading-relaxed text-[var(--text)]">
                {block.value}
              </p>
            ) : block.value ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={block.id}
                src={block.value}
                alt=""
                className="h-auto w-full rounded-md border border-[var(--border)] object-cover"
              />
            ) : null,
          )}
        </div>
      </article>
    </main>
  );
}
