import { SAINTS_GUIDE_PARENT_SLUG } from "@/data/iglesiaGuideTopics";

const parentBase = `/apologetica/${SAINTS_GUIDE_PARENT_SLUG}/topicos`;

export type SaintsGuideTopicNavItem = {
  slug: string;
  label: string;
  href: string;
};

/** Navegación lateral compartida entre subpáginas de la guía sobre culto a los santos. */
export const saintsGuideTopicNavigation: SaintsGuideTopicNavItem[] = [
  {
    slug: "argumentos-de-la-iglesia-catolica-para-permitir-el-culto-a-los-santos",
    label: "Argumentos de la Iglesia Católica para permitir el culto a los santos",
    href: `${parentBase}/argumentos-de-la-iglesia-catolica-para-permitir-el-culto-a-los-santos`,
  },
  {
    slug: "ejemplo-de-culto-a-los-santos",
    label: "Ejemplos del culto a los santos",
    href: `${parentBase}/ejemplo-de-culto-a-los-santos`,
  },
  {
    slug: "manifestaciones-de-culto-a-los-santos-en-la-iglesia-catolica",
    label: "Manifestaciones del culto a los santos",
    href: `${parentBase}/manifestaciones-de-culto-a-los-santos-en-la-iglesia-catolica`,
  },
  {
    slug: "que-es-idolatria",
    label: "Qué es la idolatría",
    href: `${parentBase}/que-es-idolatria`,
  },
  {
    slug: "refutaciones-argumentos-iglesia-catolica",
    label: "Refutaciones a los argumentos de la Iglesia Católica",
    href: `${parentBase}/refutaciones-argumentos-iglesia-catolica`,
  },
];

export const saintsGuideParentHref = `/apologetica/${SAINTS_GUIDE_PARENT_SLUG}`;
