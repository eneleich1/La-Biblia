export type FeaturedScripture = {
  lead: string;
  reference: string;
  verses: string[];
};

const BRACKET_REF_PATTERN = /\[([^\]]*\d+\s*:\s*[\d\-]+[^\]]*)\]/;
const INLINE_REF_PATTERN =
  /\b((?:[12]\s+)?[A-ZÁÉÍÓÚÑ][a-záéíóúñA-ZÁÉÍÓÚÑ]+(?:\s+(?:de\s+)?[a-záéíóúñA-ZÁÉÍÓÚÑ]+){0,4})\s+(\d+\s*:\s*\d+(?:\s*-\s*\d+)?)/;

const SCRIPTURE_CUE_PATTERN =
  /o[ií]d\s+(?:palabra\s+del\s+|al\s+)?señor|considerad\s+la\s+palabra|palabra\s+del\s+señor|cuidado\s+con\s+la\s+dureza|amonesta|a\s+tenor\s+de\s+la\s+escritura|he\s+aqu[ií]\s+el\s+culto|escritura\s+advierte|piedra\s+de\s+tropiezo|«[^»]*\d+:\d+/i;

const MIN_FEATURE_SCORE = 12;

function extractReference(text: string): string | null {
  const bracket = text.match(BRACKET_REF_PATTERN);
  if (bracket?.[1]) {
    return bracket[1].trim();
  }

  const inline = text.match(INLINE_REF_PATTERN);
  if (inline) {
    return `${inline[1].trim()} ${inline[2].replace(/\s+/g, "")}`;
  }

  const leading = text.trim().match(/^([A-Za-zÁ-úñÑ]+(?:\s+[A-Za-zÁ-úñÑ]+){0,4})\s+(\d+:\d+)/);
  if (leading) {
    return `${leading[1].trim()} ${leading[2]}`;
  }

  return null;
}

function stripReferenceFromLead(text: string, reference: string): string {
  return text
    .replace(/\[[^\]]+\]/g, "")
    .replace(new RegExp(escapeRegExp(reference), "i"), "")
    .replace(/\s*:\s*$/, "")
    .replace(/,\s*$/, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function extractQuotableLead(text: string): string {
  const cuePatterns = [
    /cuidado con la dureza de corazón y oíd palabra del señor/i,
    /considerad la palabra del señor/i,
    /oíd palabra del señor/i,
    /oíd al señor/i,
    /llama, pues!\s*¿habrá quien te responda\?/i,
  ];

  for (const pattern of cuePatterns) {
    const match = text.match(pattern);
    if (match) {
      const phrase = match[0].trim();
      return phrase.charAt(0).toUpperCase() + phrase.slice(1);
    }
  }

  const firstSentence = text.split(/(?<=[.!?])\s+/)[0]?.trim() ?? text;
  const cleaned = firstSentence.replace(/[,\s.]+$/, "").trim();
  if (cleaned.length <= 200) return cleaned;
  return `${cleaned.slice(0, 197).trim()}…`;
}

function collectVerseLines(paragraphs: string[], startIndex: number): string[] {
  const verses: string[] = [];
  let index = startIndex;
  while (index < paragraphs.length && /^\d+\.\s/.test(paragraphs[index])) {
    verses.push(paragraphs[index]);
    index += 1;
  }
  return verses;
}

function scoreScriptureParagraph(text: string, index: number, paragraphs: string[]): number {
  let score = 0;
  if (BRACKET_REF_PATTERN.test(text)) score += 10;
  if (INLINE_REF_PATTERN.test(text)) score += 6;
  if (SCRIPTURE_CUE_PATTERN.test(text)) score += 14;
  if (/cuidado con la dureza/i.test(text)) score += 8;
  if (/considerad la palabra/i.test(text)) score += 8;
  if (/he aqu[ií] el culto/i.test(text)) score += 6;
  if (collectVerseLines(paragraphs, index + 1).length > 0) score += 10;
  if (/^[1-3]?\s?[A-Za-zÁ-úñÑ]+(?:\s+[A-Za-zÁ-úñÑ]+){0,4}\s+\d+:\d+/.test(text.trim())) {
    score += 14;
  }
  if (/¡llama, pues!/i.test(text)) score += 10;
  return score;
}

type Candidate = {
  score: number;
  lead: string;
  reference: string;
  verses: string[];
  consumedParagraphIndexes: number[];
  pointIndex?: number;
};

function buildCandidateFromParagraph(
  paragraphs: string[],
  index: number,
): Candidate | null {
  const paragraph = paragraphs[index];
  const reference = extractReference(paragraph);
  if (!reference) return null;

  const score = scoreScriptureParagraph(paragraph, index, paragraphs);
  if (score < MIN_FEATURE_SCORE) return null;

  const verses = collectVerseLines(paragraphs, index + 1);
  const lead = extractQuotableLead(stripReferenceFromLead(paragraph, reference));
  if (!lead) return null;

  return {
    score: score + verses.length * 2,
    lead,
    reference,
    verses,
    consumedParagraphIndexes: [index, ...verses.map((_, verseIndex) => index + 1 + verseIndex)],
  };
}

function buildCandidateFromPoint(point: string, pointIndex: number): Candidate | null {
  const cleaned = point.replace(/^\[ok\]\s*\d+-/i, "").trim();
  const reference = extractReference(cleaned);
  if (!reference) return null;

  let score = scoreScriptureParagraph(cleaned, -1, []);
  if (score < MIN_FEATURE_SCORE) {
    score = MIN_FEATURE_SCORE;
  }

  const lead = extractQuotableLead(stripReferenceFromLead(cleaned, reference));
  if (!lead) return null;

  return {
    score,
    lead,
    reference,
    verses: [],
    consumedParagraphIndexes: [],
    pointIndex,
  };
}

export function extractFeaturedScripture(
  paragraphs: string[],
  numberedPoints?: string[],
): { featured?: FeaturedScripture; bodyParagraphs: string[]; bodyNumberedPoints?: string[] } {
  const candidates: Candidate[] = [];

  paragraphs.forEach((_, index) => {
    const candidate = buildCandidateFromParagraph(paragraphs, index);
    if (candidate) candidates.push(candidate);
  });

  numberedPoints?.forEach((point, pointIndex) => {
    const candidate = buildCandidateFromPoint(point, pointIndex);
    if (candidate) candidates.push(candidate);
  });

  if (!candidates.length) {
    return { bodyParagraphs: paragraphs, bodyNumberedPoints: numberedPoints };
  }

  const best = candidates.sort((left, right) => right.score - left.score)[0];
  const consumed = new Set(best.consumedParagraphIndexes);

  return {
    featured: {
      lead: best.lead,
      reference: best.reference,
      verses: best.verses,
    },
    bodyParagraphs: paragraphs.filter((_, index) => !consumed.has(index)),
    bodyNumberedPoints:
      best.pointIndex === undefined
        ? numberedPoints
        : numberedPoints?.filter((_, index) => index !== best.pointIndex),
  };
}
