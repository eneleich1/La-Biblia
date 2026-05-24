import { fixSpanishEncoding } from "@/lib/fixSpanishEncoding";

export type TestamentKey = "ot" | "nt";

export type BiblicalNote = {
  id: string;
  testament: TestamentKey;
  text: string;
  href: string;
  referenceLabel: string;
  bookSlug: string | null;
  sortLetter: string;
  isExternal: boolean;
};

function stripHtml(html: string): string {
  return fixSpanishEncoding(
    html
      .replace(/<br\s*\/?>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim(),
  );
}

function extractBookSlug(href: string): string | null {
  const match = href.match(/\/biblia\/es\/([^/?#]+)/i);
  return match?.[1] ?? null;
}

function firstSortLetter(text: string): string {
  const trimmed = text.trim();
  if (!trimmed) return "#";
  const ch = trimmed[0].toLocaleUpperCase("es");
  if (ch === "Ñ") return "Ñ";
  if (/[A-ZÁÉÍÓÚÜ]/i.test(ch)) return ch.normalize("NFD").replace(/\p{M}/gu, "").toUpperCase();
  return "#";
}

function cleanReferenceLabel(raw: string): string {
  return raw.replace(/^\[|\]$/g, "").trim();
}

function detectTestament(chunk: string): TestamentKey | null {
  if (/Antiguo\s+Testamento/i.test(chunk)) return "ot";
  if (/Nuevo\s+Testamento/i.test(chunk)) return "nt";
  return null;
}

/**
 * Parses the WordPress HTML block for Notas bíblicas into structured rows.
 */
export function parseBiblicalNotesHtml(html: string): BiblicalNote[] {
  const notes: BiblicalNote[] = [];
  html = fixSpanishEncoding(html);
  let testament: TestamentKey = "ot";
  let index = 0;

  const chunks = html.split(/<h3[^>]*>/i).slice(1);
  for (const chunk of chunks) {
    const sectionTestament = detectTestament(chunk);
    if (sectionTestament) testament = sectionTestament;

    const liRegex = /<li[^>]*>([\s\S]*?)<\/li>/gi;
    let liMatch: RegExpExecArray | null;
    while ((liMatch = liRegex.exec(chunk)) !== null) {
      const liHtml = liMatch[1];
      const anchors = [...liHtml.matchAll(/<a[^>]+href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi)];
      if (!anchors.length) continue;

      const bibliaAnchor =
        anchors.find((a) => /\/biblia\/es\//i.test(a[1])) ?? anchors[anchors.length - 1];
      const href = bibliaAnchor[1].trim();
      const referenceLabel = cleanReferenceLabel(stripHtml(bibliaAnchor[2]));
      const isExternal = !/\/biblia\/es\//i.test(href);

      let text = stripHtml(liHtml);
      for (const a of anchors) {
        const label = stripHtml(a[2]);
        if (label) text = text.replace(label, "").trim();
      }
      text = text.replace(/\s+/g, " ").trim();
      if (!text) continue;

      index += 1;
      notes.push({
        id: `note-${index}`,
        testament,
        text,
        href,
        referenceLabel,
        bookSlug: extractBookSlug(href),
        sortLetter: firstSortLetter(text),
        isExternal,
      });
    }
  }

  return notes;
}

export function countNotesByTestament(notes: BiblicalNote[]) {
  return {
    ot: notes.filter((n) => n.testament === "ot").length,
    nt: notes.filter((n) => n.testament === "nt").length,
  };
}
