import { formatBibleBookTitle } from "@/lib/formatTitle";
import { fixSpanishEncoding } from "@/lib/fixSpanishEncoding";

type BibleBookSummary = {
  slug: string;
  nameEs: string;
};

type BookAlias = {
  aliasVariants: string[];
  slugByNormalizedAlias: Map<string, string>;
};

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function normalizeText(value: string) {
  return value
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLocaleLowerCase("es")
    .replace(/[.]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function buildNumericBookAlias(name: string) {
  const normalized = normalizeText(name)
    .replace(/^primera\s+/i, "1 ")
    .replace(/^segunda\s+/i, "2 ")
    .replace(/^tercera\s+/i, "3 ")
    .replace(/^primera epistola a los\s+/i, "1 ")
    .replace(/^segunda epistola a los\s+/i, "2 ")
    .replace(/^tercera epistola a los\s+/i, "3 ")
    .replace(/^primera epistola de san\s+/i, "1 ")
    .replace(/^segunda epistola de san\s+/i, "2 ")
    .replace(/^tercera epistola de san\s+/i, "3 ")
    .replace(/^epistola a los\s+/i, "")
    .replace(/^epistola de san\s+/i, "")
    .replace(/^evangelio segun san\s+/i, "");

  return normalized;
}

function stripAccents(value: string) {
  return value.normalize("NFD").replace(/\p{M}/gu, "");
}

function buildBookAliases(books: BibleBookSummary[]): BookAlias {
  const aliasToSlug = new Map<string, string>();
  const variantSet = new Set<string>();

  for (const book of books) {
    const rawName = fixSpanishEncoding(book.nameEs).trim();
    const shortName = formatBibleBookTitle(rawName, book.slug, "short");
    const longName = formatBibleBookTitle(rawName, book.slug, "long");

    const candidates = [
      rawName,
      shortName,
      longName,
      rawName.replace(/^Libro\s+/i, ""),
      shortName.replace(/^Libro\s+/i, ""),
      buildNumericBookAlias(rawName),
      buildNumericBookAlias(shortName),
      buildNumericBookAlias(longName),
    ];

    for (const candidate of candidates) {
      const cleanCandidate = candidate.trim();
      if (cleanCandidate) {
        variantSet.add(cleanCandidate);
        variantSet.add(stripAccents(cleanCandidate));
      }
      const normalized = normalizeText(candidate);
      if (!normalized) continue;
      if (!aliasToSlug.has(normalized)) {
        aliasToSlug.set(normalized, book.slug);
      }
    }
  }

  return {
    aliasVariants: [...variantSet].filter(Boolean).sort((a, b) => b.length - a.length),
    slugByNormalizedAlias: aliasToSlug,
  };
}

function createBibleHref(slug: string, chapter: number, startVerse: number, endVerse: number) {
  const highlight = startVerse === endVerse ? String(startVerse) : `${startVerse}-${endVerse}`;
  return `/biblia/es/${slug}/${chapter}?highlight=${highlight}#V${startVerse}`;
}

function linkifyTextNode(text: string, aliases: BookAlias) {
  if (!aliases.aliasVariants.length) return text;
  const aliasAlternation = aliases.aliasVariants.map((variant) => escapeRegExp(variant)).join("|");
  const pattern = new RegExp(
    `(^|[\\s([{\\u00ab"'“])(${aliasAlternation})\\s+(\\d{1,3})\\s*[:]\\s*(\\d{1,3})(?:\\s*[-–—]\\s*(\\d{1,3}))?(?=\\b|[\\])}.,;:!?\\u00bb"'”])`,
    "gim",
  );

  return text.replace(
    pattern,
    (
      match,
      prefix: string,
      bookText: string,
      chapterRaw: string,
      startRaw: string,
      endRaw: string | undefined,
    ) => {
      const slug = aliases.slugByNormalizedAlias.get(normalizeText(bookText));
      if (!slug) return match;

      const chapter = Number(chapterRaw);
      const startVerse = Number(startRaw);
      const endVerse = endRaw ? Number(endRaw) : startVerse;
      if (!Number.isInteger(chapter) || !Number.isInteger(startVerse) || !Number.isInteger(endVerse)) {
        return match;
      }
      if (chapter < 1 || startVerse < 1 || endVerse < startVerse) {
        return match;
      }

      const href = createBibleHref(slug, chapter, startVerse, endVerse);
      const label = `${bookText} ${chapterRaw}:${startRaw}${endRaw ? `-${endRaw}` : ""}`;
      return `${prefix}<a href="${href}">${label}</a>`;
    },
  );
}

export function linkifyBibleReferencesInHtml(html: string, books: BibleBookSummary[]) {
  if (!html.trim()) return html;
  const aliases = buildBookAliases(books);
  if (!aliases.aliasVariants.length) return html;

  return html.replace(/>([^<]+)</g, (_match, textNode: string) => {
    const linked = linkifyTextNode(textNode, aliases);
    return `>${linked}<`;
  });
}
