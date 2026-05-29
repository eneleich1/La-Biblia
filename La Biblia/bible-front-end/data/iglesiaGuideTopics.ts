import {
  getSaintsGuideTopicContent,
  saintsGuideTopicContent,
} from "@/data/saintsGuideTopicContent";

export const CHURCH_GUIDE_PARENT_SLUG = "la-iglesia-que-fundo-jesus-cristo";
export const SAINTS_GUIDE_PARENT_SLUG = "no-conviene-a-la-iglesia-catolica-el-culto-a-los-santos";

export type IglesiaGuideTopicItem = {
  id: string;
  title: string;
  href: string;
};

export const iglesiaGuideDefaultTopics: IglesiaGuideTopicItem[] = [
  {
    id: "topic-idolatria",
    title: "Que es Idolatria",
    href: "/apologetica/no-conviene-a-la-iglesia-catolica-el-culto-a-los-santos/topicos/que-es-idolatria",
  },
  {
    id: "topic-manifestaciones-culto",
    title: "Manifestaciones de Culto a los Santos en la Iglesia Catolica",
    href: "/apologetica/no-conviene-a-la-iglesia-catolica-el-culto-a-los-santos/topicos/manifestaciones-de-culto-a-los-santos-en-la-iglesia-catolica",
  },
  {
    id: "topic-ejemplo-culto",
    title: "Ejemplo de Culto a los Santos",
    href: "/apologetica/no-conviene-a-la-iglesia-catolica-el-culto-a-los-santos/topicos/ejemplo-de-culto-a-los-santos",
  },
  {
    id: "topic-argumentos-culto",
    title: "Argumentos de la Iglesia Católica para permitir el culto a los santos",
    href: "/apologetica/no-conviene-a-la-iglesia-catolica-el-culto-a-los-santos/topicos/argumentos-de-la-iglesia-catolica-para-permitir-el-culto-a-los-santos",
  },
  {
    id: "topic-refutaciones",
    title: "Refutaciones a los argumentos de la Iglesia Católica",
    href: "/apologetica/no-conviene-a-la-iglesia-catolica-el-culto-a-los-santos/topicos/refutaciones-argumentos-iglesia-catolica",
  },
];

/** @deprecated Use getSaintsGuideTopicContent — kept for static params and redirects. */
export const iglesiaGuideTopicPages = saintsGuideTopicContent.map((topic) => ({
  slug: topic.slug,
  title: topic.title,
}));

export function getIglesiaGuideTopicPage(topicSlug: string) {
  return getSaintsGuideTopicContent(topicSlug);
}

function normalizeTopicValue(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export function getCanonicalSaintsTopicHrefByTitle(title: string): string | null {
  const normalizedTitle = normalizeTopicValue(title);
  const byTitle = iglesiaGuideDefaultTopics.find(
    (topic) => normalizeTopicValue(topic.title) === normalizedTitle,
  );
  return byTitle?.href ?? null;
}
