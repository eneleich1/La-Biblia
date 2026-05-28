/** @deprecated Import from @/lib/sitePageTypes — kept for backwards compatibility */
export {
  SITE_PAGES_STORAGE_KEY,
  buildEmptySitePage,
  createBlock,
  normalizePageBlocks,
  routeToSitePath,
  sanitizePageRoute,
  type BlockLayout,
  type SiteBlock,
  type SiteBlockType,
  type SitePage,
} from "@/lib/sitePageTypes";

import { normalizePageBlocks, sanitizePageRoute, SITE_PAGES_STORAGE_KEY, type SitePage } from "@/lib/sitePageTypes";

/** Lee páginas antiguas del navegador (solo para migración única a la base de datos). */
export function readLegacyLocalSitePages(): SitePage[] {
  if (typeof window === "undefined") return [];
  const raw = window.localStorage.getItem(SITE_PAGES_STORAGE_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as SitePage[];
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((page) => page && typeof page.route === "string")
      .map((page) => ({
        ...page,
        route: sanitizePageRoute(page.route),
        title: page.title?.trim() || "Pagina sin titulo",
        blocks: normalizePageBlocks(Array.isArray(page.blocks) ? page.blocks : []),
      }))
      .filter((page) => page.route);
  } catch {
    return [];
  }
}

export function clearLegacyLocalSitePages() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(SITE_PAGES_STORAGE_KEY);
}
