import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { sanitizeRichHtml } from "@/lib/sanitizeRichHtml";
import {
  ensurePageStructure,
  normalizePageBlocks,
  sanitizePageRoute,
  type PageCanvas,
  type SiteBlock,
  type SitePage,
} from "@/lib/sitePageTypes";

type DbSitePage = {
  id: string;
  route: string;
  title: string;
  status: string;
  blocks: unknown;
  canvas: unknown;
  parentHref: string | null;
  parentLabel: string | null;
  createdAt: Date;
  updatedAt: Date;
};

function toSitePage(row: DbSitePage): SitePage {
  return ensurePageStructure({
    id: row.id,
    route: row.route,
    title: row.title,
    status: row.status === "DRAFT" ? "DRAFT" : "PUBLISHED",
    blocks: normalizePageBlocks((row.blocks as SiteBlock[]) ?? []),
    canvas: row.canvas ? (row.canvas as PageCanvas) : undefined,
    parentHref: row.parentHref,
    parentLabel: row.parentLabel,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  });
}

function sanitizeBlocks(blocks: SiteBlock[]): SiteBlock[] {
  return blocks.map((block) => ({
    ...block,
    value: block.type === "text" ? sanitizeRichHtml(block.value) : block.value,
    children: block.children?.length ? sanitizeBlocks(block.children) : block.children,
  }));
}

function pageToDbData(page: SitePage) {
  const structured = ensurePageStructure(page);
  const blocks = sanitizeBlocks(structured.blocks);
  return {
    title: structured.title.trim() || "Pagina sin titulo",
    route: sanitizePageRoute(structured.route),
    status: structured.status ?? "PUBLISHED",
    blocks: blocks as Prisma.InputJsonValue,
    canvas: structured.canvas as Prisma.InputJsonValue,
    parentHref: structured.parentHref ?? null,
    parentLabel: structured.parentLabel ?? null,
  };
}

export async function listSitePages(includeDrafts = false) {
  const rows = await prisma.sitePage.findMany({
    where: includeDrafts ? undefined : { status: "PUBLISHED" },
    orderBy: { updatedAt: "desc" },
  });
  return rows.map(toSitePage);
}

export async function getSitePageByRoute(route: string, includeDrafts = false) {
  const normalized = sanitizePageRoute(route);
  if (!normalized) return null;
  const row = await prisma.sitePage.findUnique({
    where: { route: normalized },
  });
  if (!row) return null;
  if (!includeDrafts && row.status !== "PUBLISHED") return null;
  return toSitePage(row);
}

export async function getSitePageById(id: string) {
  const row = await prisma.sitePage.findUnique({ where: { id } });
  return row ? toSitePage(row) : null;
}

export async function createSitePage(input: SitePage) {
  const data = pageToDbData(input);
  if (!data.route) throw new Error("Ruta invalida.");
  const row = await prisma.sitePage.create({ data });
  return toSitePage(row);
}

export async function updateSitePage(id: string, input: Partial<SitePage>) {
  const existing = await prisma.sitePage.findUnique({ where: { id } });
  if (!existing) throw new Error("Pagina no encontrada.");

  const merged = ensurePageStructure({
    ...toSitePage(existing),
    ...input,
    id,
  });
  const data = pageToDbData(merged);

  const row = await prisma.sitePage.update({
    where: { id },
    data: {
      title: data.title,
      route: data.route,
      status: data.status,
      blocks: data.blocks,
      canvas: data.canvas,
      parentHref: data.parentHref,
      parentLabel: data.parentLabel,
    },
  });
  return toSitePage(row);
}

export async function deleteSitePage(id: string) {
  await prisma.sitePage.delete({ where: { id } });
}

export async function upsertSitePages(pages: SitePage[]) {
  const results: SitePage[] = [];
  for (const page of pages) {
    const route = sanitizePageRoute(page.route);
    if (!route || !page.title.trim()) continue;
    const existing = await prisma.sitePage.findUnique({ where: { route } });
    if (existing) {
      results.push(await updateSitePage(existing.id, { ...page, route }));
    } else {
      results.push(await createSitePage({ ...page, route }));
    }
  }
  return results;
}
