import { formatBookTitle } from "@/lib/formatTitle";
import { fixSpanishEncoding } from "@/lib/fixSpanishEncoding";

type BookLookup = { slug: string; nameEs: string };

/**
 * Turns anchor labels like "[Genesis 17:7]" into "Génesis 17:7" when the slug is known.
 */
export function formatBibleReferenceLabel(
  referenceLabel: string,
  bookSlug: string | null,
  booksBySlug: Map<string, BookLookup>,
): string {
  const cleaned = fixSpanishEncoding(referenceLabel.replace(/^\[|\]$/g, "").trim());
  if (!bookSlug) return formatBookTitle(cleaned);

  const book = booksBySlug.get(bookSlug);
  if (!book) return formatBookTitle(cleaned);

  const bookName = formatBookTitle(book.nameEs);
  const remainder = cleaned
    .replace(/^[0-9]+\s+/i, "")
    .replace(new RegExp(`^${book.nameEs}\\s*`, "i"), "")
    .replace(/^genesis\s*/i, "")
    .replace(/^exodo\s*/i, "")
    .trim();

  if (!remainder) return bookName;
  if (/^\d/i.test(remainder)) return `${bookName} ${remainder}`;
  return `${bookName} ${remainder}`;
}
