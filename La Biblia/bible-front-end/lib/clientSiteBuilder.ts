export const SITE_PAGES_STORAGE_KEY = "seekoftruth:site-pages";

export type SiteBlockType = "text" | "image";

export type SiteBlock = {
  id: string;
  type: SiteBlockType;
  value: string;
};

export type SitePage = {
  id: string;
  title: string;
  route: string;
  blocks: SiteBlock[];
  createdAt: string;
  updatedAt: string;
};

function normalizeRoute(route: string) {
  const trimmed = route.trim();
  if (!trimmed) return "";
  return trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
}

export function routeToSitePath(route: string) {
  const normalized = normalizeRoute(route);
  return normalized ? `/sitio${normalized}` : "";
}

export function readSitePages(): SitePage[] {
  if (typeof window === "undefined") return [];
  const raw = window.localStorage.getItem(SITE_PAGES_STORAGE_KEY);
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw) as SitePage[];
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((page) => page && typeof page.id === "string" && typeof page.route === "string")
      .map((page) => ({
        ...page,
        route: normalizeRoute(page.route),
        title: page.title?.trim() || "Pagina sin titulo",
        blocks: Array.isArray(page.blocks) ? page.blocks : [],
      }))
      .filter((page) => page.route);
  } catch {
    window.localStorage.removeItem(SITE_PAGES_STORAGE_KEY);
    return [];
  }
}

export function saveSitePages(pages: SitePage[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(SITE_PAGES_STORAGE_KEY, JSON.stringify(pages));
}

export function buildEmptySitePage(): SitePage {
  const now = new Date().toISOString();
  return {
    id: `site-page-${Date.now()}`,
    title: "",
    route: "",
    blocks: [{ id: `block-${Date.now()}`, type: "text", value: "" }],
    createdAt: now,
    updatedAt: now,
  };
}

export function sanitizePageRoute(route: string) {
  return normalizeRoute(route)
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9\-/]/g, "")
    .replace(/\/{2,}/g, "/")
    .replace(/\/$/, "");
}
