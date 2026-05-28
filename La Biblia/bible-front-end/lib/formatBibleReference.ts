import { formatBibleBookTitle, formatBookTitle, type BookTitleMode } from "@/lib/formatTitle";
import { fixSpanishEncoding } from "@/lib/fixSpanishEncoding";

type BookLookup = { slug: string; nameEs: string };

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function normalizeForMatch(value: string) {
  return value
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLocaleLowerCase("es")
    .replace(/\s+/g, " ")
    .trim();
}

function stripLeadingBookNames(value: string, book: BookLookup) {
  const candidates = [
    book.nameEs,
    formatBookTitle(book.nameEs),
    formatBibleBookTitle(book.nameEs, book.slug, "short"),
    formatBibleBookTitle(book.nameEs, book.slug, "long"),
  ]
    .map((item) => fixSpanishEncoding(item).trim())
    .filter(Boolean);

  let result = value.trim();

  // Remove duplicated book names like "Levitico Levitico 18:22" (accent-insensitive).
  for (let i = 0; i < 4; i++) {
    const next = candidates.reduce((current, candidate) => {
      const compactCurrent = normalizeForMatch(current);
      const compactCandidate = normalizeForMatch(candidate);
      if (!compactCurrent.startsWith(`${compactCandidate} `)) return current;
      const pattern = new RegExp(`^${escapeRegExp(candidate)}\\s*`, "i");
      return current.replace(pattern, "").trim();
    }, result);
    if (next === result) break;
    result = next.trim();
  }

  return result;
}

function parseInternalBibleHref(href: string) {
  const match = href.match(/\/biblia\/es\/([^/?#]+)\/(\d+)(?:\?([^#]+))?(?:#(.*))?/i);
  if (!match) return null;
  const [, slug, chapter, queryRaw, hashRaw] = match;
  const query = new URLSearchParams(queryRaw ?? "");
  const highlight = (query.get("highlight") ?? "").trim();
  const hashVerse = (hashRaw ?? "").replace(/^V/i, "").trim();
  return { slug, chapter, highlight, hashVerse };
}

function normalizeVerseSegment(value: string) {
  return value
    .replace(/\s+/g, "")
    .replace(/[;，]/g, ",")
    .replace(/[–—]/g, "-")
    .replace(/,+/g, ",")
    .replace(/^,|,$/g, "");
}

/**
 * Turns anchor labels like "[Genesis 17:7]" into "Génesis 17:7" when the slug is known.
 */
export function formatBibleReferenceLabel(
  referenceLabel: string,
  href: string,
  bookSlug: string | null,
  booksBySlug: Map<string, BookLookup>,
  mode: BookTitleMode = "short",
): string {
  const cleaned = fixSpanishEncoding(referenceLabel.replace(/^\[|\]$/g, "").trim());
  const hrefData = parseInternalBibleHref(href);
  const resolvedSlug = bookSlug ?? hrefData?.slug ?? null;
  if (!resolvedSlug) return formatBookTitle(cleaned);

  const book = booksBySlug.get(resolvedSlug);
  if (!book) return formatBookTitle(cleaned);

  const bookName = formatBibleBookTitle(book.nameEs, book.slug, mode);
  const labelRemainder = stripLeadingBookNames(cleaned, book);
  const normalizedLabelRemainder = labelRemainder.replace(/\s+/g, " ").trim();

  if (hrefData?.highlight) {
    const verses = normalizeVerseSegment(hrefData.highlight);
    if (verses) return `${bookName} ${hrefData.chapter}:${verses}`;
  }

  if (hrefData?.hashVerse) {
    const verse = normalizeVerseSegment(hrefData.hashVerse);
    if (verse) return `${bookName} ${hrefData.chapter}:${verse}`;
  }

  if (hrefData?.chapter) {
    const chapterPattern = new RegExp(`^${hrefData.chapter}(\\b|[:\\-])`, "i");
    if (!normalizedLabelRemainder) return `${bookName} ${hrefData.chapter}`;
    if (chapterPattern.test(normalizedLabelRemainder)) return `${bookName} ${normalizedLabelRemainder}`;
    if (/^\d+[:\-]/.test(normalizedLabelRemainder)) return `${bookName} ${normalizedLabelRemainder}`;
    if (/^\d+$/.test(normalizedLabelRemainder)) return `${bookName} ${normalizedLabelRemainder}`;
    return `${bookName} ${hrefData.chapter}`;
  }

  const remainder = normalizedLabelRemainder;

  if (!remainder) return bookName;
  if (/^\d/i.test(remainder)) return `${bookName} ${remainder}`;
  return `${bookName} ${remainder}`;
}
