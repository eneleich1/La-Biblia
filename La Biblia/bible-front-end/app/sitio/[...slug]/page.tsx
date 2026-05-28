import { notFound } from "next/navigation";
import { StoredPageView } from "@/components/site/StoredPageView";
import { isAdminServer } from "@/lib/adminSessionServer";
import { getSitePageByRoute } from "@/lib/sitePagesServer";

export default async function DynamicSitePage({
  params,
}: {
  params: Promise<{ slug?: string[] }>;
}) {
  const { slug } = await params;
  const route = `/${(slug ?? []).join("/")}`;
  const admin = await isAdminServer();
  let page = null;
  try {
    page = await getSitePageByRoute(route, admin);
  } catch {
    page = null;
  }

  if (!page) notFound();

  return <StoredPageView page={page} canEdit={admin} />;
}
