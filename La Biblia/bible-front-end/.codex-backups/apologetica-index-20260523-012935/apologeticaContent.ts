import type { LucideIcon } from "lucide-react";
import { BookOpen, Clock, History, ListTree, MessagesSquare, Play } from "lucide-react";
import {
  apologeticsArticles,
  apologeticsForums,
  apologeticsVideoLinks,
} from "@/data/seekContent";

export type ApologeticaTab = "guias" | "temas" | "debates" | "videos";

export type ApologeticaGuide = {
  slug: string;
  title: string;
  description: string;
  icon?: LucideIcon;
  /** Recorte del diseño (WebP/SVG) cuando no hay equivalente en Lucide */
  iconSrc?: string;
  iconAlt?: string;
};

const guideMeta: Record<
  string,
  Partial<Pick<ApologeticaGuide, "title">> &
    Pick<ApologeticaGuide, "description"> &
    Partial<Pick<ApologeticaGuide, "icon" | "iconSrc" | "iconAlt">>
> = {
  "la-iglesia-que-fundo-jesus-cristo": {
    description:
      "Un estudio bíblico sobre el origen, la naturaleza y el fundamento de la Iglesia establecida por nuestro Señor.",
    iconSrc: "/apologetica/icons/iglesia-icon.svg",
    iconAlt: "Iglesia — La Iglesia que fundó Jesús Cristo",
  },
  "no-conviene-a-la-iglesia-catolica-el-culto-a-los-santos": {
    title:
      "No conviene a la Iglesia Católica el culto a los santos ni a nada fuera de Dios.",
    description:
      "Un análisis bíblico que demuestra por qué la adoración y el culto deben dirigirse únicamente a Dios.",
    iconSrc: "/apologetica/icons/culto-santos-icon.svg",
    iconAlt: "Cruz con dos santos — culto reservado solo a Dios",
  },
};

export const apologeticaGuides: ApologeticaGuide[] = apologeticsArticles.map((article) => {
  const meta = guideMeta[article.slug] ?? {
    description: "Guía bíblica para defender la fe con fundamento en la Escritura.",
    icon: BookOpen,
  };
  return {
    slug: article.slug,
    title: meta.title ?? article.title,
    description: meta.description,
    icon: meta.icon,
    iconSrc: meta.iconSrc,
    iconAlt: meta.iconAlt,
  };
});

export type ApologeticaResource = {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
};

export const apologeticaMoreResources: ApologeticaResource[] = [
  {
    id: "debates",
    title: "Debates y respuestas",
    description: "Argumentos y refutaciones organizados por tema.",
    icon: MessagesSquare,
  },
  {
    id: "temas",
    title: "Temas frecuentes",
    description: "Índice de preguntas habituales en apologética.",
    icon: ListTree,
  },
  {
    id: "videos",
    title: "Videos apologéticos",
    description: "Conferencias y análisis en formato audiovisual.",
    icon: Play,
  },
  {
    id: "historico",
    title: "Historia de la Iglesia",
    description: "Evidencias y contexto para defender la fe con fundamento.",
    icon: History,
  },
];

export const apologeticaPageDescription =
  "Recursos para defender la fe cristiana con fundamento bíblico, histórico y razonable.";

export const apologeticaHeroQuote = {
  text: "Estad siempre preparados para presentar defensa con mansedumbre y reverencia ante todo el que os requiera razón de la esperanza que hay en vosotros.",
  reference: "1 Pedro 3:15",
};

export const apologeticaStats = {
  guides: apologeticsArticles.length,
  debates: apologeticsForums.reduce((n, forum) => n + forum.topics.length, 0),
  videos: apologeticsVideoLinks.length,
};

export const apologeticaTabs: { id: ApologeticaTab; label: string; icon: LucideIcon }[] = [
  { id: "guias", label: "Guías", icon: BookOpen },
  { id: "temas", label: "Temas", icon: ListTree },
  { id: "debates", label: "Debates", icon: MessagesSquare },
  { id: "videos", label: "Videos", icon: Play },
];

export { apologeticsForums, apologeticsVideoLinks };
