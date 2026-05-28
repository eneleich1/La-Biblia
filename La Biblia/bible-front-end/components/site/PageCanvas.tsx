"use client";

import type { SiteBlock, SitePage } from "@/lib/sitePageTypes";
import { PAGE_ROOT_ID, ensurePageStructure, resolvePageParent } from "@/lib/sitePageTypes";
import { PageBackLink } from "@/components/site/PageBackLink";
import { SitePageContentColumn } from "@/components/site/SitePageContentColumn";

type Props = {
  page: SitePage;
  className?: string;
};

function BlockContent({ block }: { block: SiteBlock }) {
  if (block.type === "container") {
    return (
      <div className="relative h-full min-h-[8rem] w-full rounded-md border border-dashed border-[var(--border)]/80 bg-[var(--background-soft)]/40 p-2">
        {(block.children ?? []).map((child) => (
          <div
            key={child.id}
            className="absolute"
            style={{
              left: child.layout.x,
              top: child.layout.y,
              width: child.layout.width,
              height: child.layout.height,
              zIndex: child.layout.zIndex,
            }}
          >
            <BlockContent block={child} />
          </div>
        ))}
      </div>
    );
  }

  if (block.type === "image") {
    if (!block.value) {
      return (
        <div className="flex h-full w-full items-center justify-center rounded-md border border-dashed border-[var(--border)] bg-[var(--background-soft)] text-xs text-[var(--text-muted)]">
          Sin imagen
        </div>
      );
    }
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={block.value}
        alt=""
        className="h-full w-full rounded-md border border-[var(--border)] object-cover"
        draggable={false}
      />
    );
  }

  return (
    <div
      className="h-full w-full overflow-auto rounded-md px-1 text-[15px] leading-relaxed text-[var(--text)]"
      dangerouslySetInnerHTML={{
        __html: block.value || "<p style='color:var(--text-muted)'>Texto vacío</p>",
      }}
    />
  );
}

export function PageCanvas({ page: rawPage, className = "" }: Props) {
  const page = ensurePageStructure(rawPage);
  const parent = resolvePageParent(page);
  const root = page.blocks.find((block) => block.id === PAGE_ROOT_ID) ?? page.blocks[0];

  return (
    <SitePageContentColumn className={className}>
      {parent ? <PageBackLink href={parent.href} label={parent.label} /> : null}
      <header className="sermons-index-header">
        <h1>{page.title}</h1>
      </header>
      <div
        className="site-page-canvas"
        style={{ minHeight: root.layout.height, height: root.layout.height }}
      >
        <BlockContent block={root} />
      </div>
    </SitePageContentColumn>
  );
}
