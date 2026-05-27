import {
  iglesiaGuideKeyPassages,
  iglesiaGuideSectionOverrides,
} from "@/data/iglesiaGuideContent";
import { apologeticsArticles } from "@/data/seekContent";
import {
  buildApologeticaGuidePage,
  CHURCH_GUIDE_SECTION_INDEXES,
  CHURCH_SECTION_ICONS,
  SAINTS_SECTION_ICONS,
  type ApologeticaGuidePageData,
  type GuideKeyPassage,
  type GuideSectionIconName,
  type GuideSectionOverride,
} from "@/lib/parseApologeticaGuide";

type GuidePageMeta = {
  description: string;
  heroQuote: { reference: string; text: string };
  readingMinutes: string;
  sectionIndexes?: number[];
  icons: GuideSectionIconName[];
  sectionOverrides?: GuideSectionOverride[];
  keyPassages?: GuideKeyPassage[];
};

const guidePageMeta: Record<string, GuidePageMeta> = {
  "la-iglesia-que-fundo-jesus-cristo": {
    description:
      "Recorrido bíblico sobre la alianza, la infidelidad de Israel, el llamado al arrepentimiento y la promesa del remanente fiel.",
    heroQuote: {
      reference: "Jeremías 31:33",
      text: "Pondré mi Ley en su interior y sobre sus corazones la escribiré, y yo seré su Dios y ellos serán mi pueblo.",
    },
    readingMinutes: "15-20",
    sectionIndexes: CHURCH_GUIDE_SECTION_INDEXES,
    icons: CHURCH_SECTION_ICONS,
    sectionOverrides: iglesiaGuideSectionOverrides,
    keyPassages: iglesiaGuideKeyPassages,
  },
  "no-conviene-a-la-iglesia-catolica-el-culto-a-los-santos": {
    description:
      "Por qué el culto a imágenes y a los santos no conviene a la Iglesia: la idolatría, los mandamientos de Dios y el testimonio de la Escritura.",
    heroQuote: {
      reference: "Éxodo 20:3-5",
      text: "No tendrás otros dioses delante de mí. No te harás escultura ni imagen alguna para postrarte ante ella.",
    },
    readingMinutes: "12-18",
    icons: SAINTS_SECTION_ICONS,
  },
};

const builtGuides = new Map<string, ApologeticaGuidePageData>();

for (const article of apologeticsArticles) {
  const meta = guidePageMeta[article.slug];
  if (!meta) continue;
  builtGuides.set(
    article.slug,
    buildApologeticaGuidePage(article.slug, article.title, article.html, meta),
  );
}

export function getApologeticaGuidePage(slug: string): ApologeticaGuidePageData | undefined {
  return builtGuides.get(slug);
}

export function isApologeticaGuideSlug(slug: string): boolean {
  return builtGuides.has(slug);
}
