export type GuideSectionIconName =
  | "star"
  | "scroll-text"
  | "users"
  | "church"
  | "book-open"
  | "image-off"
  | "ban"
  | "shield"
  | "eye"
  | "hand"
  | "crown"
  | "scale";

export type GuideTag = {
  label: string;
  href: string;
};

export type GuideSection = {
  id: string;
  number: number;
  title: string;
  icon: GuideSectionIconName;
  tags: GuideTag[];
  body: string;
  quote?: {
    text: string;
    reference: string;
  };
};

export type GuideKeyPassage = {
  reference: string;
  description: string;
  href: string;
};

export type ApologeticaGuidePageData = {
  slug: string;
  title: string;
  description: string;
  heroQuote: {
    reference: string;
    text: string;
  };
  readingMinutes: string;
  sections: GuideSection[];
  keyPassages: GuideKeyPassage[];
};

export const CHURCH_SECTION_ICONS: GuideSectionIconName[] = [
  "star",
  "ban",
  "scroll-text",
  "scale",
  "book-open",
];

/** First five <h2> blocks: alianza → remanente (matches the guide mockup). */
export const CHURCH_GUIDE_SECTION_INDEXES = [0, 1, 2, 3, 4];

export type GuideSectionOverride = {
  body?: string;
  quote?: { text: string; reference: string };
  tags?: GuideTag[];
};

export const SAINTS_SECTION_ICONS: GuideSectionIconName[] = [
  "image-off",
  "ban",
  "shield",
  "eye",
  "hand",
  "crown",
  "scale",
];

function stripHtml(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function slugifyTitle(title: string): string {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 64);
}

function cleanSectionTitle(title: string): string {
  const cleaned = title
    .replace(/^\d+\s*-\s*/i, "")
    .replace(/\s+/g, " ")
    .trim();

  const fixes: Record<string, string> = {
    "Que es Idolatría": "Qué es idolatría",
    "Inicio de la Idolatría": "Inicio de la idolatría",
    "Gozar de buena reputacion": "Gozar de buena reputación",
  };
  return fixes[cleaned] ?? cleaned;
}

function extractReferenceFromParagraph(text: string): string | null {
  const bookMatch = text.match(
    /^([A-Za-zÁÉÍÓÚáéíóúñÑ0-9\s]+?\s+\d+(?::\d+(?:-\d+)?)?)/,
  );
  if (bookMatch) return bookMatch[1].trim();
  const inline = text.match(/([A-Za-zÁÉÍÓÚáéíóúñÑ]+\s+\d+:\d+)/);
  return inline?.[1] ?? null;
}

function parseSectionsFromHtml(
  html: string,
  icons: GuideSectionIconName[],
): Omit<GuideSection, "number">[] {
  const parts = html.split(/<h2>/i).slice(1);

  return parts.map((part, index) => {
    const [titleRaw, ...rest] = part.split(/<\/h2>/i);
    const title = cleanSectionTitle(titleRaw.replace(/\s+/g, " ").trim());
    const bodyHtml = rest.join("");

    const tags: GuideTag[] = [];
    const anchorRegex = /<a[^>]+href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
    let anchorMatch: RegExpExecArray | null;
    while ((anchorMatch = anchorRegex.exec(bodyHtml)) !== null) {
      const href = anchorMatch[1].trim();
      if (!/\/biblia\/es\//i.test(href)) continue;
      const label = stripHtml(anchorMatch[2]).replace(/^\[|\]$/g, "").trim();
      if (!label || tags.some((t) => t.href === href)) continue;
      tags.push({ href, label });
    }

    const paragraphs = [...bodyHtml.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)].map((m) =>
      stripHtml(m[1]),
    );

    const quoteParagraph = paragraphs.find(
      (p) => p.length >= 48 && (/«|»/.test(p) || /^\d+\s/.test(p)),
    );

    const isReferenceOnly = (p: string) =>
      tags.some((t) => t.label === p) || /^[A-Za-zÁÉÍÓÚáéíóúñÑ0-9\s]+:\d/.test(p);

    const bodyParagraph =
      paragraphs.find(
        (p) =>
          p.length >= 40 &&
          !isReferenceOnly(p) &&
          p !== quoteParagraph &&
          !/^[\d«]/.test(p.slice(0, 2)),
      ) ??
      paragraphs.find(
        (p) =>
          p.length >= 24 &&
          !isReferenceOnly(p) &&
          p !== quoteParagraph,
      );

    let body = bodyParagraph ?? "";
    if (!body || isReferenceOnly(body)) {
      const verseText = paragraphs.find(
        (p) =>
          p.length >= 48 &&
          p !== quoteParagraph &&
          !isReferenceOnly(p) &&
          (/«|»/.test(p) ? false : true),
      );
      body = verseText ?? "";
    }
    if (!body || isReferenceOnly(body)) {
      const explanatory = paragraphs.find(
        (p) => p.length >= 56 && p !== quoteParagraph && !isReferenceOnly(p),
      );
      body = explanatory ?? "";
    }
    if ((!body || isReferenceOnly(body)) && tags.length > 0) {
      const refs = tags.map((t) => t.label).join(", ");
      body = `La Escritura aborda este punto en ${refs}, mostrando por qué la adoración pertenece solo a Dios.`;
    } else if (!body) {
      body = "La Biblia ofrece el fundamento para comprender este punto de la guía.";
    }

    const quote = quoteParagraph
      ? {
          text: quoteParagraph.length > 220 ? `${quoteParagraph.slice(0, 217)}…` : quoteParagraph,
          reference: extractReferenceFromParagraph(quoteParagraph) ?? tags[0]?.label ?? title,
        }
      : undefined;

    if (quote && (isReferenceOnly(body) || body === quote.text || body.length < 40)) {
      if (tags.length > 0) {
        const refs = tags.map((t) => t.label).join(", ");
        body = `Este apartado se apoya en ${refs} para mostrar el fundamento bíblico del tema.`;
      } else {
        body = "La Escritura desarrolla este punto con claridad para quien busca agradar a Dios.";
      }
    }

    return {
      id: slugifyTitle(title) || `section-${index + 1}`,
      title,
      icon: icons[index % icons.length] ?? "book-open",
      tags: tags.slice(0, 4),
      body,
      quote,
    };
  });
}

function collectKeyPassages(sections: GuideSection[]): GuideKeyPassage[] {
  const seen = new Set<string>();
  const passages: GuideKeyPassage[] = [];

  for (const section of sections) {
    for (const tag of section.tags) {
      if (seen.has(tag.href)) continue;
      seen.add(tag.href);
      passages.push({
        reference: tag.label,
        description: section.title,
        href: tag.href,
      });
      if (passages.length >= 5) return passages;
    }
  }

  return passages;
}

export function buildApologeticaGuidePage(
  slug: string,
  title: string,
  html: string,
  meta: {
    description: string;
    heroQuote: { reference: string; text: string };
    readingMinutes: string;
    sectionIndexes?: number[];
    icons: GuideSectionIconName[];
    sectionOverrides?: GuideSectionOverride[];
    keyPassages?: GuideKeyPassage[];
  },
): ApologeticaGuidePageData {
  const parsed = parseSectionsFromHtml(html, meta.icons);
  const picked =
    meta.sectionIndexes?.map((i) => parsed[i]).filter(Boolean) ?? parsed;

  const sections: GuideSection[] = picked.map((section, index) => {
    const override = meta.sectionOverrides?.[index];
    return {
      ...section,
      number: index + 1,
      icon: meta.icons[index % meta.icons.length] ?? section.icon,
      body: override?.body ?? section.body,
      quote: override?.quote ?? section.quote,
      tags: override?.tags?.length ? override.tags : section.tags,
    };
  });

  return {
    slug,
    title,
    description: meta.description,
    heroQuote: meta.heroQuote,
    readingMinutes: meta.readingMinutes,
    sections,
    keyPassages: meta.keyPassages ?? collectKeyPassages(sections),
  };
}
