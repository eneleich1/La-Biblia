export type SiteBlockType = "container" | "text" | "image";

export type BlockLayout = {
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
};

export type SiteBlock = {
  id: string;
  type: SiteBlockType;
  value: string;
  layout: BlockLayout;
  children?: SiteBlock[];
};

export type PageCanvas = {
  width: number;
  minHeight: number;
  padding: number;
};

export type SitePage = {
  id: string;
  title: string;
  route: string;
  status?: "PUBLISHED" | "DRAFT";
  blocks: SiteBlock[];
  canvas?: PageCanvas;
  parentHref?: string | null;
  parentLabel?: string | null;
  createdAt: string;
  updatedAt: string;
};

export const PAGE_ROOT_ID = "page-root";

/** Ancho de columna de contenido (`76rem`, igual que Predicaciones). */
export const SITE_PAGE_COLUMN_WIDTH = 1216;
/** @deprecated Use SITE_PAGE_COLUMN_WIDTH */
export const SITE_PAGE_DEFAULT_WIDTH = SITE_PAGE_COLUMN_WIDTH;

const DEFAULT_CANVAS: PageCanvas = {
  width: SITE_PAGE_COLUMN_WIDTH,
  minHeight: 520,
  padding: 0,
};

export const SITE_PAGES_STORAGE_KEY = "seekoftruth:site-pages";

const DEFAULT_LAYOUT: Record<SiteBlockType, BlockLayout> = {
  text: { x: 24, y: 24, width: 640, height: 120, zIndex: 1 },
  image: { x: 24, y: 24, width: 300, height: 200, zIndex: 1 },
  container: { x: 24, y: 24, width: 680, height: 280, zIndex: 1 },
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

function migrateLegacyBlock(block: Partial<SiteBlock>, index: number): SiteBlock {
  const type: SiteBlockType =
    block.type === "container" || block.type === "image" || block.type === "text"
      ? block.type
      : "text";

  const layout = block.layout ?? {
    ...DEFAULT_LAYOUT[type],
    y: 24 + index * 140,
  };

  return {
    id: block.id ?? `block-${Date.now()}-${index}`,
    type,
    value: block.value ?? "",
    layout: {
      x: layout.x ?? 24,
      y: layout.y ?? 24 + index * 140,
      width: layout.width ?? DEFAULT_LAYOUT[type].width,
      height: layout.height ?? DEFAULT_LAYOUT[type].height,
      zIndex: layout.zIndex ?? 1,
    },
    children:
      type === "container"
        ? (block.children ?? []).map((child, childIndex) => migrateLegacyBlock(child, childIndex))
        : undefined,
  };
}

export function normalizePageBlocks(blocks: SiteBlock[]): SiteBlock[] {
  return blocks.map((block, index) => migrateLegacyBlock(block, index));
}

export function sanitizePageRoute(route: string) {
  return normalizeRoute(route)
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9\-/]/g, "")
    .replace(/\/{2,}/g, "/")
    .replace(/\/$/, "");
}

export function createBlock(type: SiteBlockType, yOffset = 24): SiteBlock {
  const layout = { ...DEFAULT_LAYOUT[type], y: yOffset };
  return {
    id: `block-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
    type,
    value: "",
    layout,
    children: type === "container" ? [] : undefined,
  };
}

export function normalizeCanvas(canvas?: Partial<PageCanvas> | null): PageCanvas {
  return {
    width: SITE_PAGE_COLUMN_WIDTH,
    minHeight: canvas?.minHeight ?? DEFAULT_CANVAS.minHeight,
    padding: 0,
  };
}

export function sitePageInnerWidth(padding = DEFAULT_CANVAS.padding) {
  return SITE_PAGE_COLUMN_WIDTH - padding * 2;
}

export function pageHasRoot(page: SitePage) {
  return page.blocks.some((block) => block.id === PAGE_ROOT_ID && block.type === "container");
}

export function ensurePageStructure(page: SitePage): SitePage {
  const canvas = normalizeCanvas(page.canvas);
  const innerBlocks = page.blocks.filter((block) => block.id !== PAGE_ROOT_ID);
  const existingRoot = page.blocks.find((block) => block.id === PAGE_ROOT_ID && block.type === "container");
  const blocksForHeight = existingRoot?.children?.length ? existingRoot.children : innerBlocks;
  const contentHeight = Math.max(
    canvas.minHeight - canvas.padding * 2,
    blocksForHeight.reduce(
      (max, block) => Math.max(max, block.layout.y + block.layout.height + 16),
      120,
    ),
  );
  const innerWidth = sitePageInnerWidth(canvas.padding);
  const minRootHeight = Math.max(120, canvas.minHeight - canvas.padding * 2);

  const root: SiteBlock = existingRoot
    ? {
        ...existingRoot,
        layout: {
          ...existingRoot.layout,
          x: 0,
          y: 0,
          width: innerWidth,
          height: Math.max(minRootHeight, existingRoot.layout.height),
        },
        children: existingRoot.children ?? innerBlocks,
      }
    : {
        id: PAGE_ROOT_ID,
        type: "container",
        value: "",
        layout: {
          x: 0,
          y: 0,
          width: innerWidth,
          height: contentHeight,
          zIndex: 1,
        },
        children: innerBlocks.length ? innerBlocks : [createBlock("text", 24)],
      };

  return {
    ...page,
    canvas,
    blocks: [root],
  };
}

export function resolvePageParent(page: SitePage): { href: string; label: string } | null {
  if (page.parentHref?.trim() && page.parentLabel?.trim()) {
    return { href: page.parentHref.trim(), label: page.parentLabel.trim() };
  }

  const route = sanitizePageRoute(page.route);
  if (!route.startsWith("/apologetica/")) return null;

  const segments = route.split("/").filter(Boolean);
  if (segments.length < 2) {
    return { href: "/", label: "Volver al inicio" };
  }

  const slug = segments[1];
  const guideSlugs = new Set([
    "la-iglesia-que-fundo-jesus-cristo",
    "no-conviene-a-la-iglesia-catolica-el-culto-a-los-santos",
  ]);

  if (guideSlugs.has(slug)) {
    return { href: "/apologetica", label: "Volver a Apologética" };
  }

  return {
    href: "/apologetica/no-conviene-a-la-iglesia-catolica-el-culto-a-los-santos",
    label: "Volver a la guía principal",
  };
}

export function inferParentForRoute(route: string): { parentHref: string; parentLabel: string } | null {
  const normalized = sanitizePageRoute(route);
  if (!normalized.startsWith("/apologetica/")) return null;
  const segments = normalized.split("/").filter(Boolean);
  if (segments.length < 2) return null;
  const slug = segments[1];
  if (
    slug === "la-iglesia-que-fundo-jesus-cristo" ||
    slug === "no-conviene-a-la-iglesia-catolica-el-culto-a-los-santos"
  ) {
    return { parentHref: "/apologetica", parentLabel: "Volver a Apologética" };
  }
  return {
    parentHref: "/apologetica/no-conviene-a-la-iglesia-catolica-el-culto-a-los-santos",
    parentLabel: "Volver a la guía principal",
  };
}

export function buildEmptySitePage(): SitePage {
  const now = new Date().toISOString();
  return ensurePageStructure({
    id: `draft-${Date.now()}`,
    title: "",
    route: "",
    status: "PUBLISHED",
    blocks: [],
    createdAt: now,
    updatedAt: now,
  });
}
