import { extractFeaturedScripture, type FeaturedScripture } from "@/lib/extractRefutationFeaturedScripture";

export type RefutationCommandment = {
  number: number;
  text: string;
};

export type { FeaturedScripture };

export type ParsedRefutation = {
  number: number;
  paragraphs: string[];
  featuredScripture?: FeaturedScripture;
  commandments?: RefutationCommandment[];
  numberedPoints?: string[];
};

function stripHtmlTags(text: string): string {
  return text.replace(/<[^>]+>/g, "").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");
}

function extractParagraphs(fragment: string): string[] {
  const matches = fragment.matchAll(/<p>([\s\S]*?)<\/p>/gi);
  return Array.from(matches, (match) => stripHtmlTags(match[1]).trim()).filter(Boolean);
}

function parseCommandmentParagraph(text: string): RefutationCommandment | null {
  const match = text.match(/^\((\d+)\)\s*([\s\S]+)$/);
  if (!match) return null;
  return { number: Number(match[1]), text: match[2].trim() };
}

function parseNumberedPoints(paragraphs: string[]): {
  numberedPoints?: string[];
  remaining: string[];
} {
  const numbered = paragraphs.filter((paragraph) => /^\[?ok\]?\s*\d+-/i.test(paragraph));
  if (!numbered.length) {
    return { remaining: paragraphs };
  }

  const remaining = paragraphs.filter((paragraph) => !/^\[?ok\]?\s*\d+-/i.test(paragraph));
  const numberedPoints = numbered.map((paragraph) =>
    paragraph.replace(/^\[ok\]\s*/i, "").trim(),
  );

  return { numberedPoints, remaining };
}

function parseRefutationBlock(number: number, htmlFragment: string): ParsedRefutation {
  let paragraphs = extractParagraphs(htmlFragment);

  let commandments: RefutationCommandment[] | undefined;
  let numberedPoints: string[] | undefined;

  if (number === 2) {
    const commandmentParagraphs = paragraphs
      .map(parseCommandmentParagraph)
      .filter((item): item is RefutationCommandment => item !== null);
    if (commandmentParagraphs.length) {
      commandments = commandmentParagraphs;
      paragraphs = paragraphs.filter((paragraph) => !parseCommandmentParagraph(paragraph));
    }
  }

  if (number === 3) {
    const parsedPoints = parseNumberedPoints(paragraphs);
    numberedPoints = parsedPoints.numberedPoints;
    paragraphs = parsedPoints.remaining;
  }

  const featured = extractFeaturedScripture(paragraphs, numberedPoints);

  return {
    number,
    paragraphs: featured.bodyParagraphs,
    featuredScripture: featured.featured,
    commandments,
    numberedPoints: featured.bodyNumberedPoints,
  };
}

export function parseSaintsRefutationsHtml(html: string): ParsedRefutation[] {
  const cleaned = html.replace(/<p><strong>Refutaciones a los argumentos de la Iglesia Católica<\/strong><\/p>\s*/i, "");
  const parts = cleaned.split(/<h2>\s*Refutación al argumento\s+(\d+)\s*<\/h2>/i);

  if (parts.length < 2) {
    return [];
  }

  const refutations: ParsedRefutation[] = [];
  for (let index = 1; index < parts.length; index += 2) {
    const number = Number(parts[index]);
    const fragment = parts[index + 1] ?? "";
    refutations.push(parseRefutationBlock(number, fragment));
  }

  return refutations;
}
