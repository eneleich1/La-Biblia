import { ApologeticaIndex } from "@/components/apologetica/ApologeticaIndex";
import type { ApologeticaTab } from "@/data/apologeticaContent";

const validTabs: ApologeticaTab[] = ["guias", "temas", "debates", "videos"];

export default async function ApologeticaIndexPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const params = await searchParams;
  const tab = params.tab;
  const initialTab = validTabs.includes(tab as ApologeticaTab) ? (tab as ApologeticaTab) : "guias";
  return <ApologeticaIndex initialTab={initialTab} />;
}
