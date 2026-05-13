/** Public site origin without trailing slash (for canonical links in search, Typesense, etc.). */
export function getPublicSiteBase(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  return raw.replace(/\/+$/, "");
}
