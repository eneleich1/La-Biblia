/** Lowercase, strip diacritics, collapse punctuation to spaces for search + counts. */
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
