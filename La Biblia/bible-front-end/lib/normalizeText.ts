/**
 * Lowercase, strip combining marks (accents), collapse punctuation to spaces.
 * Used for search, Typesense `normalizedText`, and exact word keys.
 */
export function normalizeText(input: string): string {
  const base = input
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase();

  return base
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function tokenizeNormalized(input: string): string[] {
  if (!input) return [];
  return input.split(" ").filter(Boolean);
}

/**
 * Split original verse text into word-like tokens (Unicode letters/numbers).
 * `word` keeps surface spelling (may include accents); `normalizedWord` is accent/case/punctuation-free.
 */
export function extractWordsFromVerseText(text: string): { word: string; normalizedWord: string }[] {
  const out: { word: string; normalizedWord: string }[] = [];
  const re = /[\p{L}\p{N}]+/gu;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    const word = m[0];
    const normalizedWord = normalizeText(word);
    if (normalizedWord) out.push({ word, normalizedWord });
  }
  return out;
}
