import type { SiteBlock, SitePage } from "@/lib/sitePageTypes";

async function parseJson<T>(response: Response): Promise<T> {
  const data = (await response.json()) as T & { error?: string };
  if (!response.ok) {
    throw new Error((data as { error?: string }).error ?? "Error en la solicitud.");
  }
  return data;
}

export async function fetchAdminSession() {
  const response = await fetch("/api/auth/admin", { credentials: "include" });
  return parseJson<{ isAdmin: boolean }>(response);
}

export async function loginAdmin(username: string, password: string) {
  const response = await fetch("/api/auth/admin", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  return parseJson<{ ok: boolean }>(response);
}

export async function logoutAdmin() {
  await fetch("/api/auth/admin", { method: "DELETE", credentials: "include" });
}

export async function fetchSitePages(includeDrafts = false) {
  const response = await fetch(`/api/site-pages?drafts=${includeDrafts ? "1" : "0"}`, {
    credentials: "include",
  });
  return parseJson<{ pages: SitePage[] }>(response).then((data) => data.pages);
}

export async function fetchSitePageByRoute(route: string, includeDrafts = false) {
  const params = new URLSearchParams({
    route,
    drafts: includeDrafts ? "1" : "0",
  });
  const response = await fetch(`/api/site-pages/by-route?${params.toString()}`, {
    credentials: "include",
  });
  if (response.status === 404) return null;
  return parseJson<{ page: SitePage }>(response).then((data) => data.page);
}

export async function createSitePageApi(page: SitePage) {
  const response = await fetch("/api/site-pages", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(page),
  });
  return parseJson<{ page: SitePage }>(response).then((data) => data.page);
}

export async function updateSitePageApi(id: string, patch: Partial<SitePage>) {
  const response = await fetch(`/api/site-pages/${id}`, {
    method: "PUT",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(patch),
  });
  return parseJson<{ page: SitePage }>(response).then((data) => data.page);
}

export async function deleteSitePageApi(id: string) {
  await fetch(`/api/site-pages/${id}`, {
    method: "DELETE",
    credentials: "include",
  });
}

export async function uploadSiteImage(dataUrl: string) {
  const response = await fetch("/api/site-pages/upload", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ dataUrl }),
  });
  return parseJson<{ url: string }>(response).then((data) => data.url);
}

export async function migrateLocalSitePages(pages: SitePage[]) {
  const response = await fetch("/api/site-pages/migrate", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ pages }),
  });
  return parseJson<{ pages: SitePage[]; imported: number }>(response);
}

export async function persistBlocksMedia(blocks: SiteBlock[]): Promise<SiteBlock[]> {
  const walk = async (items: SiteBlock[]): Promise<SiteBlock[]> => {
    const next: SiteBlock[] = [];
    for (const block of items) {
      let value = block.value;
      if (block.type === "image" && value.startsWith("data:image/")) {
        value = await uploadSiteImage(value);
      }
      if (block.type === "container" && block.children?.length) {
        next.push({ ...block, value, children: await walk(block.children) });
      } else {
        next.push({ ...block, value });
      }
    }
    return next;
  };
  return walk(blocks);
}
