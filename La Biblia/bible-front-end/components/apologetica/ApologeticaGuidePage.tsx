"use client";

import Link from "next/link";
import type { ChangeEvent } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  Bookmark,
  BookOpen,
  Bold,
  Clock,
  Download,
  Edit3,
  Italic,
  ListTree,
  Plus,
  Save,
  Trash2,
  Underline,
  X,
} from "lucide-react";
import { isApologeticaGuideSlug } from "@/data/apologeticaGuidePages";
import {
  CHURCH_GUIDE_PARENT_SLUG,
  SAINTS_GUIDE_PARENT_SLUG,
  getCanonicalSaintsTopicHrefByTitle,
  iglesiaGuideDefaultTopics,
  type IglesiaGuideTopicItem,
} from "@/data/iglesiaGuideTopics";
import { getGuideSectionIcon } from "@/lib/apologeticaGuideIcons";
import { AUTH_SESSION_EVENT, readAuthSession } from "@/lib/clientAuth";
import type {
  ApologeticaGuidePageData,
  GuideContentBlock,
  GuideReference,
  GuideSection,
  GuideTextItem,
} from "@/lib/parseApologeticaGuide";

type Props = {
  guide: ApologeticaGuidePageData;
  bibleBooks: BibleReferenceBook[];
};

const GUIDE_STORAGE_PREFIX = "seekoftruth:guide-edits:";
const GUIDE_TOPICS_STORAGE_PREFIX = "seekoftruth:guide-topics:";

type GuideSectionDraft = {
  title: string;
  tags: string;
  contentBlocks: GuideContentBlockDraft[];
  quoteText: string;
  quoteReference: string;
  quoteHref: string;
};

type GuideContentBlockDraft = {
  id: string;
  body: string;
  tags: string;
  textItems: GuideTextItemDraft[];
};

type GuideTextItemDraft = {
  id: string;
  body: string;
  explanation: string;
  references: GuideReferenceDraft[];
};

type GuideReferenceDraft = {
  id: string;
  label: string;
  href: string;
  text?: string;
  formattedText?: string;
};

type BibleReferenceBook = {
  slug: string;
  title: string;
  testament: number;
  chapters: { number: number; verseCount: number }[];
};

type ParsedBibleReference = {
  label: string;
  href: string;
  book: BibleReferenceBook;
  chapter: number;
  startVerse: number;
  endVerse: number;
};

type SelectedGuideReference = {
  sectionId: string;
  label: string;
  href: string;
  text?: string;
  formattedText?: string;
};

type GuideTopicDraft = {
  title: string;
  href: string;
};

function renumberSections(sections: GuideSection[]): GuideSection[] {
  return sections.map((section, index) => ({ ...section, number: index + 1 }));
}

function ensureUniqueSectionIds(sections: GuideSection[]): GuideSection[] {
  const used = new Map<string, number>();
  return sections.map((section, index) => {
    const baseId = section.id?.trim() || `apartado-${index + 1}`;
    const seen = used.get(baseId) ?? 0;
    used.set(baseId, seen + 1);
    if (seen === 0) return section;
    return { ...section, id: `${baseId}-${seen + 1}` };
  });
}

function slugifySectionTitle(title: string) {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 64);
}

function createTextItemDraft(item?: GuideTextItem, fallback?: GuideContentBlock | GuideSection): GuideTextItemDraft {
  const references = item?.references ?? ("tags" in (fallback ?? {}) ? fallback?.tags : []) ?? [];
  return {
    id: item?.id ?? `texto-${Date.now()}`,
    body: item?.body ?? ("body" in (fallback ?? {}) ? fallback?.body : "") ?? "",
    explanation: item?.explanation ?? "",
    references: references.map((reference, index) => ({
      id: `${reference.href}-${index}`,
      label: reference.label,
      href: reference.href,
      text: "text" in reference ? (reference as GuideReference).text : undefined,
      formattedText:
        "formattedText" in reference ? (reference as GuideReference).formattedText : undefined,
    })),
  };
}

function createContentBlockDraft(block?: GuideContentBlock, fallback?: GuideSection): GuideContentBlockDraft {
  const textItems = block?.items?.length
    ? block.items.map((item) => createTextItemDraft(item))
    : [createTextItemDraft(undefined, block ?? fallback)];

  return {
    id: block?.id ?? `${fallback?.id ?? "contenido"}-content-${Date.now()}`,
    body: block?.body ?? fallback?.body ?? "",
    tags: (block?.tags ?? fallback?.tags ?? []).map((tag) => `${tag.label} | ${tag.href}`).join("\n"),
    textItems,
  };
}

function getSectionContentBlocks(section: GuideSection): GuideContentBlock[] {
  if (section.contentBlocks?.length) {
    return section.contentBlocks.map((block) =>
      block.items?.length
        ? block
        : {
            ...block,
            items: [
              {
                id: `${block.id}-text-1`,
                body: block.body ?? "",
                explanation: "",
                references: block.tags ?? [],
              },
            ],
          },
    );
  }
  return [
    {
      id: `${section.id}-content-1`,
      body: section.body,
      tags: section.tags,
      items: [
        {
          id: `${section.id}-content-1-text-1`,
          body: section.body,
          explanation: "",
          references: section.tags,
        },
      ],
    },
  ];
}

function ensureSectionContentBlocks(section: GuideSection): GuideSection {
  if (section.contentBlocks?.length) return section;
  return { ...section, contentBlocks: getSectionContentBlocks(section) };
}

function createSectionDraft(section?: GuideSection): GuideSectionDraft {
  const contentBlocks = section
    ? getSectionContentBlocks(section).map((block) => createContentBlockDraft(block, section))
    : [createContentBlockDraft()];

  return {
    title: section?.title ?? "",
    tags: "",
    contentBlocks,
    quoteText: section?.quote?.text ?? "",
    quoteReference: section?.quote?.reference ?? "",
    quoteHref: section?.quote?.href ?? "",
  };
}

function draftToSection(draft: GuideSectionDraft, section?: GuideSection): GuideSection {
  const title = draft.title.trim() || "Nuevo apartado";
  const contentBlocks = draft.contentBlocks.map((block, index) => ({
    id: block.id || `${section?.id ?? (slugifySectionTitle(title) || "apartado")}-content-${index + 1}`,
    items: block.textItems.map((item, itemIndex) => ({
      id: item.id || `${block.id}-text-${itemIndex + 1}`,
      body: item.body.trim(),
      explanation: item.explanation.trim() || undefined,
      references: item.references.map((reference) => ({
        label: reference.label,
        href: reference.href,
        text: reference.text,
        formattedText: reference.formattedText,
      })),
    })),
  }));
  const firstItem = contentBlocks[0]?.items?.[0];

  return {
    id: section?.id ?? `${slugifySectionTitle(title) || "apartado"}-${Date.now()}`,
    number: section?.number ?? 0,
    title,
    icon: section?.icon ?? "book-open",
    body: firstItem?.body || "",
    tags: firstItem?.references ?? [],
    contentBlocks,
    quote: section?.quote,
  };
}

function normalizeReferenceText(value: string) {
  return value
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLocaleLowerCase("es")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function createTopicDraft(topic?: IglesiaGuideTopicItem): GuideTopicDraft {
  return {
    title: topic?.title ?? "",
    href: topic?.href ?? "",
  };
}

function sanitizeTopicHref(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (trimmed.startsWith("/") || trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }
  return `/${trimmed}`;
}

function enforceSaintsTopicRoutes(topics: IglesiaGuideTopicItem[]): IglesiaGuideTopicItem[] {
  return topics.map((topic) => {
    const canonicalHref = getCanonicalSaintsTopicHrefByTitle(topic.title);
    return canonicalHref ? { ...topic, href: canonicalHref } : topic;
  });
}

function sanitizeRichBibleText(value: string) {
  const placeholders: string[] = [];
  const withPlaceholders = value
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(?:div|p)>/gi, "\n")
    .replace(/<(strong|b)>/gi, () => {
      placeholders.push("<strong>");
      return `__RICH_${placeholders.length - 1}__`;
    })
    .replace(/<\/(strong|b)>/gi, () => {
      placeholders.push("</strong>");
      return `__RICH_${placeholders.length - 1}__`;
    })
    .replace(/<(em|i)>/gi, () => {
      placeholders.push("<em>");
      return `__RICH_${placeholders.length - 1}__`;
    })
    .replace(/<\/(em|i)>/gi, () => {
      placeholders.push("</em>");
      return `__RICH_${placeholders.length - 1}__`;
    })
    .replace(/<u>/gi, () => {
      placeholders.push("<u>");
      return `__RICH_${placeholders.length - 1}__`;
    })
    .replace(/<\/u>/gi, () => {
      placeholders.push("</u>");
      return `__RICH_${placeholders.length - 1}__`;
    });

  const escaped = withPlaceholders
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/\n/g, "<br />");

  return escaped.replace(/__RICH_(\d+)__/g, (_match, index) => placeholders[Number(index)] ?? "");
}

function stripRichBibleText(value: string) {
  return value
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function getBookSearchNames(book: BibleReferenceBook) {
  return [
    book.title,
    book.slug.replace(/-/g, " "),
    book.title.replace(/^(evangelio segun san|epistola a los|epistola a|epistola de san|primera epistola a los|segunda epistola a los|primera epistola de san|segunda epistola de san|tercera epistola de san)\s+/i, ""),
  ].map(normalizeReferenceText);
}

function parseBibleReference(
  input: string,
  books: BibleReferenceBook[],
): ParsedBibleReference | null {
  const normalizedInput = normalizeReferenceText(input);
  if (!normalizedInput) return null;

  const matches = books
    .flatMap((book) =>
      getBookSearchNames(book).map((name) => ({
        book,
        name,
      })),
    )
    .filter(({ name }) => normalizedInput === name || normalizedInput.startsWith(`${name} `))
    .sort((a, b) => b.name.length - a.name.length);

  const match = matches[0];
  if (!match) return null;

  const rest = normalizedInput.slice(match.name.length).trim();
  const refMatch = /^(\d+)(?:\s+(\d+)(?:\s+(?:-|,|al|a)\s*(\d+))?)?$/.exec(rest);
  if (!refMatch) return null;

  const chapter = Number(refMatch[1]);
  const startVerse = Number(refMatch[2]);
  const endVerse = Number(refMatch[3] ?? refMatch[2]);
  const chapterInfo = match.book.chapters.find((item) => item.number === chapter);
  if (!chapterInfo || !Number.isInteger(startVerse)) return null;

  const low = Math.min(startVerse, endVerse);
  const high = Math.max(startVerse, endVerse);
  if (low < 1 || high > chapterInfo.verseCount) return null;

  const versePart = low === high ? String(low) : `${low}-${high}`;
  const label = `${match.book.title} ${chapter}:${versePart}`;
  const href = `/biblia/es/${match.book.slug}/${chapter}?highlight=${versePart}#V${low}`;

  return {
    label,
    href,
    book: match.book,
    chapter,
    startVerse: low,
    endVerse: high,
  };
}

async function fetchBibleReferenceText(reference: ParsedBibleReference) {
  const params = new URLSearchParams({
    language: "es",
    bookSlug: reference.book.slug,
    chapter: String(reference.chapter),
    start: String(reference.startVerse),
    end: String(reference.endVerse),
  });
  const response = await fetch(`/api/bible-reference?${params.toString()}`);
  const data = (await response.json()) as { text?: string; error?: string };
  if (!response.ok || !data.text) throw new Error(data.error ?? "No se pudo leer el versiculo.");
  return data.text;
}

async function fetchBibleReferenceTextFromHref(href: string) {
  const url = new URL(href, window.location.origin);
  const [, bibleRoot, language, bookSlug, chapter] = url.pathname.split("/");
  if (bibleRoot !== "biblia" || !language || !bookSlug || !chapter) {
    throw new Error("Referencia biblica invalida.");
  }
  const highlight = url.searchParams.get("highlight") ?? url.hash.replace(/^#V/, "");
  const [start, end = start] = highlight.split("-");
  const params = new URLSearchParams({
    language,
    bookSlug,
    chapter,
    start,
    end,
  });
  const response = await fetch(`/api/bible-reference?${params.toString()}`);
  const data = (await response.json()) as { text?: string; error?: string };
  if (!response.ok || !data.text) throw new Error(data.error ?? "No se pudo leer el versiculo.");
  return data.text;
}

function repairKnownGuideReferences(section: GuideSection): GuideSection {
  const normalizedTitle = normalizeReferenceText(section.title);
  const byTitle: Record<string, Pick<GuideSection, "tags" | "quote">> = {
    "promesa a abraham": {
      tags: [
        { label: "Genesis 13:14-16", href: "/biblia/es/genesis/13?highlight=14-16#V14" },
        { label: "Genesis 22:17-18", href: "/biblia/es/genesis/22?highlight=17-18#V17" },
      ],
      quote: section.quote
        ? { ...section.quote, href: "/biblia/es/genesis/22?highlight=17-18#V17" }
        : undefined,
    },
    "cosas malas que hizo el pueblo de israel": {
      tags: [
        { label: "Exodo 32:4-6", href: "/biblia/es/exodo/32?highlight=4-6#V4" },
        { label: "Jeremias 44:17", href: "/biblia/es/jeremias/44?highlight=17#V17" },
        {
          label: "2 Reyes 21:2-3",
          href: "/biblia/es/libro-segundo-de-los-reyes/21?highlight=2-3#V2",
        },
      ],
      quote: section.quote
        ? {
            ...section.quote,
            href: "/biblia/es/libro-segundo-de-las-cronicas/24?highlight=18-19#V18",
          }
        : undefined,
    },
    "envio profetas para que se arrepintieran": {
      tags: [
        {
          label: "2 Cronicas 24:18-19",
          href: "/biblia/es/libro-segundo-de-las-cronicas/24?highlight=18-19#V18",
        },
      ],
      quote: section.quote
        ? {
            ...section.quote,
            href: "/biblia/es/libro-segundo-de-las-cronicas/24?highlight=19#V19",
          }
        : undefined,
    },
  };

  const replacement = byTitle[normalizedTitle];
  if (!replacement) return section;
  const contentBlocks = section.contentBlocks?.length
    ? section.contentBlocks.map((block, index) =>
        index === 0 && replacement.tags
          ? {
              ...block,
              tags: replacement.tags,
              items: block.items?.map((item, itemIndex) =>
                itemIndex === 0 ? { ...item, references: replacement.tags ?? [] } : item,
              ),
            }
          : block,
      )
    : undefined;
  return { ...section, ...replacement, contentBlocks };
}

function HeroIllustration() {
  return (
    <div className="relative h-full min-h-[7rem] w-full overflow-hidden" aria-hidden>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/apologetica/hero.png"
        alt=""
        className="absolute inset-0 h-full w-full object-cover object-center"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-[#f7f1e8]/90 via-[#f7f1e8]/45 to-transparent" />
    </div>
  );
}

function SectionQuote({
  text,
  reference,
  href,
  formattedText,
}: {
  text: string;
  reference: string;
  href?: string;
  formattedText?: string;
}) {
  const richText = formattedText ? sanitizeRichBibleText(formattedText) : null;
  return (
    <aside className="guide-section-quote hidden w-full max-w-[19rem] shrink-0 border-l border-[var(--accent)]/35 pl-5 xl:block">
      <span
        className="font-serif-display text-4xl leading-none text-[var(--accent)]/55"
        aria-hidden
      >
        &ldquo;
      </span>
      {richText ? (
        <p
          className="-mt-3 text-[13px] leading-relaxed text-[var(--text)]/80"
          dangerouslySetInnerHTML={{ __html: richText }}
        />
      ) : (
        <p className="-mt-3 text-[13px] leading-relaxed text-[var(--text)]/80">{text}</p>
      )}
      {href ? (
        <Link href={href} className="mt-2 block text-xs font-semibold text-[var(--accent)] hover:underline">
          {reference}
        </Link>
      ) : (
        <p className="mt-2 text-xs font-semibold text-[var(--accent)]">{reference}</p>
      )}
    </aside>
  );
}

function GuideSidebar({
  guide,
  activeSectionId,
  progress,
  onSelectSection,
}: {
  guide: ApologeticaGuidePageData;
  activeSectionId: string;
  progress: number;
  onSelectSection: (id: string) => void;
}) {
  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-card)]">
      <div>
        <div className="flex items-center gap-2">
          <ListTree className="h-4 w-4 text-[var(--accent)]" strokeWidth={1.75} aria-hidden />
          <h2 className="text-sm font-semibold text-[var(--text)]">En esta guía</h2>
        </div>
        <nav className="mt-4" aria-label="Secciones de la guía">
          <ul className="relative space-y-1 pl-2 before:absolute before:bottom-3 before:left-[0.44rem] before:top-3 before:w-px before:bg-[var(--border)]">
            {guide.sections.map((section) => {
              const isActive = activeSectionId === section.id;
              return (
                <li key={section.id}>
                  <button
                    type="button"
                    onClick={() => onSelectSection(section.id)}
                    className={`relative flex w-full items-start gap-3 rounded-md px-2 py-2 text-left text-[13px] leading-snug transition ${
                      isActive
                        ? "font-semibold text-[var(--accent)]"
                        : "text-[var(--text-muted)] hover:bg-[var(--background-soft)] hover:text-[var(--text)]"
                    }`}
                  >
                    <span
                      className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full border bg-[var(--surface)] ${
                        isActive
                          ? "border-[var(--accent)] ring-2 ring-[var(--accent-soft)]"
                          : "border-[var(--accent)]/45"
                      }`}
                      aria-hidden
                    />
                    <span>{section.title}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>

      <div className="mt-5 border-t border-[var(--border)] pt-5">
        <div className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-[var(--accent)]" strokeWidth={1.65} aria-hidden />
          <p className="font-serif-display text-base font-semibold text-[var(--text)]">
            Tu lectura
          </p>
        </div>
        <p className="mt-3 text-xs text-[var(--text-muted)]">{progress}% completado</p>
        <div
          className="mt-2 h-2 overflow-hidden rounded-full bg-[var(--background-soft)]"
          role="progressbar"
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            className="h-full rounded-full bg-[var(--accent)] transition-[width] duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="mt-5 inline-flex items-center gap-2 text-xs text-[var(--text-muted)]">
          <Clock className="h-3.5 w-3.5 text-[var(--text-muted)]" strokeWidth={1.75} aria-hidden />
          Tiempo estimado: {guide.readingMinutes} min
        </p>
      </div>
    </div>
  );
}

function KeyPassages({ guide }: { guide: ApologeticaGuidePageData }) {
  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-card)]">
      <div className="flex items-center gap-2">
        <Bookmark className="h-5 w-5 text-[var(--accent)]" strokeWidth={1.65} aria-hidden />
        <h3 className="font-serif-display text-lg font-semibold text-[var(--text)]">
          Pasajes clave
        </h3>
      </div>
      <ul className="mt-4 space-y-3.5">
        {guide.keyPassages.map((passage) => (
          <li key={passage.href}>
            <Link
              href={passage.href}
              className="group flex gap-3 rounded-md py-0.5 transition hover:bg-[var(--background-soft)] no-underline"
            >
              <BookOpen
                className="mt-0.5 h-4 w-4 shrink-0 text-[var(--accent)]"
                strokeWidth={1.65}
                aria-hidden
              />
              <div className="min-w-0">
                <p className="text-sm font-semibold leading-snug text-[var(--accent)] group-hover:underline">
                  {passage.reference}
                </p>
                <p className="mt-0.5 text-xs leading-snug text-[var(--text-muted)]">
                  {passage.description}
                </p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function GuideTopicsCard({
  topics,
  canManage,
  editingTopicId,
  topicDraft,
  draggingTopicId,
  onStartAdd,
  onStartEdit,
  onCancelEdit,
  onChangeDraft,
  onSaveDraft,
  onDelete,
  onDragStart,
  onDragEnd,
  onDropOnTopic,
}: {
  topics: IglesiaGuideTopicItem[];
  canManage: boolean;
  editingTopicId: string | null;
  topicDraft: GuideTopicDraft;
  draggingTopicId: string | null;
  onStartAdd: () => void;
  onStartEdit: (topic: IglesiaGuideTopicItem) => void;
  onCancelEdit: () => void;
  onChangeDraft: (draft: GuideTopicDraft) => void;
  onSaveDraft: () => void;
  onDelete: (topicId: string) => void;
  onDragStart: (topicId: string) => void;
  onDragEnd: () => void;
  onDropOnTopic: (targetTopicId: string) => void;
}) {
  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-card)]">
      <div className="flex items-center justify-between gap-2">
        <h3 className="font-serif-display text-lg font-semibold text-[var(--text)]">Topicos</h3>
        {canManage ? (
          <button
            type="button"
            onClick={onStartAdd}
            className="inline-flex min-h-8 items-center gap-1 rounded-md border border-[var(--accent)]/45 bg-[var(--surface)] px-2.5 text-xs font-semibold text-[var(--accent)] transition hover:bg-[var(--accent-soft)]"
          >
            <Plus className="h-3.5 w-3.5" strokeWidth={1.9} aria-hidden />
            Agregar
          </button>
        ) : null}
      </div>

      {topics.length ? (
        <ul className="mt-4 space-y-2.5">
          {topics.map((topic) => {
            const isEditing = editingTopicId === topic.id;
            const isDragging = draggingTopicId === topic.id;

            return (
              <li
                key={topic.id}
                draggable={canManage}
                onDragStart={() => onDragStart(topic.id)}
                onDragEnd={onDragEnd}
                onDragOver={(event) => {
                  if (!canManage) return;
                  event.preventDefault();
                }}
                onDrop={() => onDropOnTopic(topic.id)}
                className={`rounded-md border border-[var(--border)] p-2.5 transition ${
                  canManage ? "cursor-grab active:cursor-grabbing" : ""
                } ${
                  isDragging ? "cursor-grabbing opacity-50" : ""
                }`}
              >
                {isEditing ? (
                  <div className="space-y-2">
                    <label className="grid gap-1 text-xs font-semibold text-[var(--text-muted)]">
                      Titulo
                      <input
                        value={topicDraft.title}
                        onChange={(event) =>
                          onChangeDraft({
                            ...topicDraft,
                            title: event.target.value,
                          })
                        }
                        className="min-h-9 rounded-md border border-[var(--border)] bg-[var(--background-soft)] px-2.5 text-sm text-[var(--text)] outline-none transition focus:border-[var(--accent)]"
                      />
                    </label>
                    <label className="grid gap-1 text-xs font-semibold text-[var(--text-muted)]">
                      Enlace (href)
                      <input
                        value={topicDraft.href}
                        onChange={(event) =>
                          onChangeDraft({
                            ...topicDraft,
                            href: event.target.value,
                          })
                        }
                        placeholder="/apologetica/..."
                        className="min-h-9 rounded-md border border-[var(--border)] bg-[var(--background-soft)] px-2.5 text-sm text-[var(--text)] outline-none transition focus:border-[var(--accent)]"
                      />
                    </label>
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={onCancelEdit}
                        className="inline-flex min-h-8 items-center rounded-md border border-[var(--border)] bg-[var(--background-soft)] px-2.5 text-xs font-semibold text-[var(--text)] transition hover:border-[var(--accent)]/35 hover:bg-[var(--accent-soft)]"
                      >
                        Cancelar
                      </button>
                      <button
                        type="button"
                        onClick={onSaveDraft}
                        className="inline-flex min-h-8 items-center rounded-md border border-[var(--accent)] bg-[var(--accent)] px-2.5 text-xs font-semibold text-[var(--accent-foreground)] transition hover:opacity-90"
                      >
                        Guardar
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start justify-between gap-2">
                    <Link
                      href={topic.href}
                      className="min-w-0 flex-1 text-xs leading-snug text-[var(--text)] transition hover:text-[var(--accent)] hover:underline sm:text-[13px]"
                    >
                      {topic.title}
                    </Link>
                    {canManage ? (
                      <div className="flex shrink-0 gap-1">
                        <button
                          type="button"
                          onClick={() => onStartEdit(topic)}
                          title="Editar topico"
                          aria-label="Editar topico"
                          className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-[var(--border)] bg-[var(--background-soft)] text-[var(--accent)] transition hover:border-[var(--accent)]/35"
                        >
                          <Edit3 className="h-3.5 w-3.5" strokeWidth={1.8} aria-hidden />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDelete(topic.id)}
                          title="Eliminar topico"
                          aria-label="Eliminar topico"
                          className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-red-200 bg-red-50 text-red-700 transition hover:bg-red-100"
                        >
                          <Trash2 className="h-3.5 w-3.5" strokeWidth={1.8} aria-hidden />
                        </button>
                      </div>
                    ) : null}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      ) : canManage ? null : (
        <p className="mt-3 text-sm text-[var(--text-muted)]">No hay topicos todavia.</p>
      )}

      {canManage ? (
        <p className="mt-3 text-xs text-[var(--text-muted)]">
          Puedes reordenar arrastrando cada item en la lista.
        </p>
      ) : null}
    </div>
  );
}

function DownloadGuide() {
  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-card)]">
      <div className="flex items-center gap-2">
        <Download className="h-5 w-5 text-[var(--accent)]" strokeWidth={1.65} aria-hidden />
        <h3 className="font-serif-display text-lg font-semibold text-[var(--text)]">
          Descargar guía
        </h3>
      </div>
      <p className="mt-2 text-sm leading-relaxed text-[var(--text-muted)]">
        Guía completa en PDF. Para estudio y referencia personal.
      </p>
      <button
        type="button"
        disabled
        className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-md border border-[var(--accent)]/55 bg-transparent px-4 py-2 text-sm font-semibold text-[var(--accent)] opacity-70"
        title="Próximamente"
      >
        Descargar PDF
        <Download className="h-4 w-4" strokeWidth={2} aria-hidden />
      </button>
    </div>
  );
}

function BibleReferencePicker({
  books,
  onAddReference,
  onAddTag,
  onUseQuote,
}: {
  books: BibleReferenceBook[];
  onAddReference?: (reference: ParsedBibleReference, text: string) => void;
  onAddTag?: (reference: ParsedBibleReference) => void;
  onUseQuote?: (reference: ParsedBibleReference, text: string) => void;
}) {
  void onUseQuote;
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const parsed = parseBibleReference(query, books);

  const addReference = async () => {
    if (!parsed) return;
    setLoading(true);
    setError("");
    try {
      const text = await fetchBibleReferenceText(parsed);
      if (onAddReference) onAddReference(parsed, text);
      else onAddTag?.(parsed);
      setQuery("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo leer el versiculo.");
    } finally {
      setLoading(false);
    }
  };

  const suggestions = query.trim()
    ? books
        .filter((book) =>
          getBookSearchNames(book).some((name) =>
            name.includes(normalizeReferenceText(query).split(" ")[0] ?? ""),
          ),
        )
        .slice(0, 5)
    : books.slice(0, 5);

  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3">
      <label className="grid gap-1.5 text-xs font-semibold text-[var(--text-muted)]">
        Buscar referencia
        <input
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setError("");
          }}
          placeholder="Ej. Mateo 16:18 o Genesis 22:17-18"
          className="min-h-10 rounded-md border border-[var(--border)] bg-[var(--background-soft)] px-3 text-sm font-medium text-[var(--text)] outline-none transition focus:border-[var(--accent)]"
        />
      </label>

      {parsed ? (
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-md border border-[var(--accent)]/25 bg-[var(--background-soft)] px-3 py-2">
          <span className="text-sm font-semibold text-[var(--text)]">{parsed.label}</span>
          <span className="text-xs text-[var(--text-muted)]">{parsed.href}</span>
        </div>
      ) : (
        <div className="mt-3 flex flex-wrap gap-2">
          {suggestions.map((book) => (
            <button
              key={book.slug}
              type="button"
              onClick={() => setQuery(`${book.title} `)}
              className="rounded-full border border-[var(--border)] bg-[var(--background-soft)] px-2.5 py-1 text-xs font-semibold text-[var(--accent)] transition hover:border-[var(--accent)]/45"
            >
              {book.title}
            </button>
          ))}
        </div>
      )}

      {error ? <p className="mt-2 text-xs font-semibold text-red-700">{error}</p> : null}

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          disabled={!parsed || loading}
          onClick={addReference}
          className="inline-flex min-h-9 items-center gap-2 rounded-md border border-[var(--accent)]/45 bg-[var(--surface)] px-3 text-sm font-semibold text-[var(--accent)] transition hover:bg-[var(--accent-soft)] disabled:cursor-not-allowed disabled:opacity-45"
        >
          <Plus className="h-4 w-4" strokeWidth={1.9} aria-hidden />
          {loading ? "Agregando..." : "Agregar referencia"}
        </button>
      </div>
    </div>
  );
}

function RichBibleTextEditor({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const editorRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const editor = editorRef.current;
    if (!editor || editor === document.activeElement) return;
    editor.innerHTML = sanitizeRichBibleText(value);
  }, [value]);

  const applyFormat = (command: "bold" | "italic" | "underline") => {
    const editor = editorRef.current;
    if (!editor) return;
    editor.focus();
    document.execCommand(command);
    onChange(sanitizeRichBibleText(editor.innerHTML));
  };

  return (
    <div className="relative rounded-md border border-[var(--border)] bg-[var(--background-soft)]">
      <div className="absolute right-2 top-2 z-10 flex overflow-hidden rounded-md border border-[var(--border)] bg-[var(--surface)] shadow-sm">
        <button
          type="button"
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => applyFormat("bold")}
          title="Negrita"
          className="inline-flex h-7 w-7 items-center justify-center text-[var(--text-muted)] transition hover:bg-[var(--accent-soft)] hover:text-[var(--accent)]"
        >
          <Bold className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
        </button>
        <button
          type="button"
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => applyFormat("italic")}
          title="Cursiva"
          className="inline-flex h-7 w-7 items-center justify-center border-l border-[var(--border)] text-[var(--text-muted)] transition hover:bg-[var(--accent-soft)] hover:text-[var(--accent)]"
        >
          <Italic className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
        </button>
        <button
          type="button"
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => applyFormat("underline")}
          title="Subrayado"
          className="inline-flex h-7 w-7 items-center justify-center border-l border-[var(--border)] text-[var(--text-muted)] transition hover:bg-[var(--accent-soft)] hover:text-[var(--accent)]"
        >
          <Underline className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
        </button>
      </div>
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={(event) => onChange(sanitizeRichBibleText(event.currentTarget.innerHTML))}
        onBlur={(event) => onChange(sanitizeRichBibleText(event.currentTarget.innerHTML))}
        className="min-h-24 rounded-md px-3 pb-3 pt-11 text-sm leading-relaxed text-[var(--text)] outline-none focus:ring-1 focus:ring-[var(--accent)]"
        dangerouslySetInnerHTML={{ __html: sanitizeRichBibleText(value) }}
      />
    </div>
  );
}

// Deprecated editor kept temporarily to avoid touching saved migration logic in this pass.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function GuideSectionEditor({
  draft,
  onChange,
  onCancel,
  onSave,
  bibleBooks,
}: {
  draft: GuideSectionDraft;
  onChange: (draft: GuideSectionDraft) => void;
  onCancel: () => void;
  onSave: () => void;
  bibleBooks: BibleReferenceBook[];
}) {
  const updateField =
    (field: "title" | "tags" | "quoteText" | "quoteReference" | "quoteHref") =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      onChange({ ...draft, [field]: event.target.value });
    };
  const updateBlock = (blockId: string, patch: Partial<GuideContentBlockDraft>) => {
    onChange({
      ...draft,
      contentBlocks: draft.contentBlocks.map((block) =>
        block.id === blockId ? { ...block, ...patch } : block,
      ),
    });
  };
  const removeBlock = (blockId: string) => {
    if (draft.contentBlocks.length <= 1) return;
    onChange({
      ...draft,
      contentBlocks: draft.contentBlocks.filter((block) => block.id !== blockId),
    });
  };
  const addBlock = () => {
    onChange({
      ...draft,
      contentBlocks: [
        ...draft.contentBlocks,
        createContentBlockDraft({ id: `content-${Date.now()}`, body: "", tags: [] }),
      ],
    });
  };

  return (
    <div className="mt-5 rounded-lg border border-[var(--accent)]/25 bg-[var(--background-soft)] p-4 sm:ml-[5.5rem]">
      <div className="grid gap-3">
        <label className="grid gap-1.5 text-xs font-semibold text-[var(--text-muted)]">
          Título
          <input
            value={draft.title}
            onChange={updateField("title")}
            className="min-h-10 rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 text-sm font-medium text-[var(--text)] outline-none transition focus:border-[var(--accent)]"
          />
        </label>

        <div className="grid gap-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-semibold text-[var(--text-muted)]">
              Contenido por referencia
            </span>
            <button
              type="button"
              onClick={addBlock}
              className="inline-flex min-h-8 items-center gap-1.5 rounded-md border border-[var(--accent)]/45 bg-[var(--surface)] px-2.5 text-xs font-semibold text-[var(--accent)] transition hover:bg-[var(--accent-soft)]"
            >
              <Plus className="h-3.5 w-3.5" strokeWidth={1.9} aria-hidden />
              Agregar contenido
            </button>
          </div>

          {draft.contentBlocks.map((block, blockIndex) => (
            <div
              key={block.id}
              className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3"
            >
              <div className="mb-3 flex items-center justify-between gap-2">
                <p className="text-sm font-semibold text-[var(--text)]">
                  Contenido {blockIndex + 1}
                </p>
                {draft.contentBlocks.length > 1 ? (
                  <button
                    type="button"
                    onClick={() => removeBlock(block.id)}
                    className="inline-flex min-h-8 items-center gap-1.5 rounded-md border border-red-200 bg-red-50 px-2.5 text-xs font-semibold text-red-700 transition hover:border-red-300 hover:bg-red-100"
                  >
                    <Trash2 className="h-3.5 w-3.5" strokeWidth={1.8} aria-hidden />
                    Eliminar
                  </button>
                ) : null}
              </div>

              <label className="grid gap-1.5 text-xs font-semibold text-[var(--text-muted)]">
                Texto
                <textarea
                  value={block.body}
                  onChange={(event) => updateBlock(block.id, { body: event.target.value })}
                  rows={3}
                  className="min-h-24 rounded-md border border-[var(--border)] bg-[var(--background-soft)] px-3 py-2 text-sm leading-relaxed text-[var(--text)] outline-none transition focus:border-[var(--accent)]"
                />
              </label>

              <div className="mt-3 grid gap-2">
                <span className="text-xs font-semibold text-[var(--text-muted)]">
                  Referencias de este contenido
                </span>
                <BibleReferencePicker
                  books={bibleBooks}
                  onAddTag={(reference) => {
                    const current = block.tags
                      .split("\n")
                      .map((line) => line.trim())
                      .filter(Boolean);
                    const nextLine = `${reference.label} | ${reference.href}`;
                    if (!current.includes(nextLine)) {
                      updateBlock(block.id, { tags: [...current, nextLine].join("\n") });
                    }
                  }}
                  onUseQuote={(reference, text) => {
                    onChange({
                      ...draft,
                      quoteText: text,
                      quoteReference: reference.label,
                      quoteHref: reference.href,
                    });
                  }}
                />
                {block.tags.trim() ? (
                  <div className="flex flex-wrap gap-2">
                    {block.tags
                      .split("\n")
                      .map((line) => line.trim())
                      .filter(Boolean)
                      .map((line) => {
                        const [label] = line.split("|").map((part) => part.trim());
                        return (
                          <button
                            key={line}
                            type="button"
                            onClick={() =>
                              updateBlock(block.id, {
                                tags: block.tags
                                  .split("\n")
                                  .map((item) => item.trim())
                                  .filter((item) => item && item !== line)
                                  .join("\n"),
                              })
                            }
                            className="inline-flex items-center gap-1.5 rounded-full border border-[var(--accent)]/35 bg-transparent px-3 py-1 text-xs font-semibold text-[var(--accent)] transition hover:bg-[var(--accent-soft)]"
                          >
                            {label}
                            <X className="h-3.5 w-3.5" strokeWidth={1.8} aria-hidden />
                          </button>
                        );
                      })}
                  </div>
                ) : null}
              </div>
            </div>
          ))}
        </div>

        <div className="hidden">
          <span className="text-xs font-semibold text-[var(--text-muted)]">
            Pasajes / etiquetas
          </span>
          <BibleReferencePicker
            books={bibleBooks}
            onAddTag={(reference) => {
              const current = draft.tags
                .split("\n")
                .map((line) => line.trim())
                .filter(Boolean);
              const nextLine = `${reference.label} | ${reference.href}`;
              if (!current.includes(nextLine)) {
                onChange({ ...draft, tags: [...current, nextLine].join("\n") });
              }
            }}
            onUseQuote={(reference, text) => {
              onChange({
                ...draft,
                quoteText: text,
                quoteReference: reference.label,
                quoteHref: reference.href,
              });
            }}
          />
          {draft.tags.trim() ? (
            <div className="flex flex-wrap gap-2">
              {draft.tags
                .split("\n")
                .map((line) => line.trim())
                .filter(Boolean)
                .map((line) => {
                  const [label] = line.split("|").map((part) => part.trim());
                  return (
                    <button
                      key={line}
                      type="button"
                      onClick={() =>
                        onChange({
                          ...draft,
                          tags: draft.tags
                            .split("\n")
                            .map((item) => item.trim())
                            .filter((item) => item && item !== line)
                            .join("\n"),
                        })
                      }
                      className="inline-flex items-center gap-1.5 rounded-full border border-[var(--accent)]/35 bg-transparent px-3 py-1 text-xs font-semibold text-[var(--accent)] transition hover:bg-[var(--accent-soft)]"
                    >
                      {label}
                      <X className="h-3.5 w-3.5" strokeWidth={1.8} aria-hidden />
                    </button>
                  );
                })}
            </div>
          ) : null}
        </div>

        <label className="hidden gap-1.5 text-xs font-semibold text-[var(--text-muted)]">
          Pasajes / etiquetas
          <textarea
            value={draft.tags}
            onChange={updateField("tags")}
            rows={3}
            placeholder="Génesis 22 | /biblia/es/genesis/22"
            className="min-h-20 rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm leading-relaxed text-[var(--text)] outline-none transition placeholder:text-[var(--text-muted)]/55 focus:border-[var(--accent)]"
          />
        </label>

        <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_14rem]">
          <label className="grid gap-1.5 text-xs font-semibold text-[var(--text-muted)]">
            Verso bíblico
            <textarea
              value={draft.quoteText}
              onChange={updateField("quoteText")}
              rows={3}
              className="min-h-20 rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm leading-relaxed text-[var(--text)] outline-none transition focus:border-[var(--accent)]"
            />
          </label>

          <label className="grid gap-1.5 text-xs font-semibold text-[var(--text-muted)]">
            Referencia
            <input
              value={draft.quoteReference}
              onChange={updateField("quoteReference")}
              className="min-h-10 rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 text-sm font-medium text-[var(--text)] outline-none transition focus:border-[var(--accent)]"
            />
          </label>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex min-h-9 items-center gap-2 rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 text-sm font-semibold text-[var(--text-muted)] transition hover:border-[var(--accent)]/40 hover:text-[var(--text)]"
        >
          <X className="h-4 w-4" strokeWidth={1.8} aria-hidden />
          Cancelar
        </button>
        <button
          type="button"
          onClick={onSave}
          className="inline-flex min-h-9 items-center gap-2 rounded-md border border-[var(--accent)] bg-[var(--accent)] px-3 text-sm font-semibold text-[var(--accent-foreground)] transition hover:opacity-90"
        >
          <Save className="h-4 w-4" strokeWidth={1.8} aria-hidden />
          Guardar
        </button>
      </div>
    </div>
  );
}

function GuideSectionStructuredEditor({
  draft,
  onChange,
  onCancel,
  onSave,
  bibleBooks,
}: {
  draft: GuideSectionDraft;
  onChange: (draft: GuideSectionDraft) => void;
  onCancel: () => void;
  onSave: () => void;
  bibleBooks: BibleReferenceBook[];
}) {
  const updateTitle = (event: ChangeEvent<HTMLInputElement>) => {
    onChange({ ...draft, title: event.target.value });
  };
  const updateBlock = (blockId: string, patch: Partial<GuideContentBlockDraft>) => {
    onChange({
      ...draft,
      contentBlocks: draft.contentBlocks.map((block) =>
        block.id === blockId ? { ...block, ...patch } : block,
      ),
    });
  };
  const updateTextItem = (
    blockId: string,
    itemId: string,
    patch: Partial<GuideTextItemDraft>,
  ) => {
    onChange({
      ...draft,
      contentBlocks: draft.contentBlocks.map((block) =>
        block.id === blockId
          ? {
              ...block,
              textItems: block.textItems.map((item) =>
                item.id === itemId ? { ...item, ...patch } : item,
              ),
            }
          : block,
      ),
    });
  };
  const addBlock = () => {
    onChange({
      ...draft,
      contentBlocks: [
        ...draft.contentBlocks,
        createContentBlockDraft({ id: `content-${Date.now()}` }),
      ],
    });
  };
  const removeBlock = (blockId: string) => {
    onChange({
      ...draft,
      contentBlocks: draft.contentBlocks.filter((block) => block.id !== blockId),
    });
  };
  const addTextItem = (blockId: string) => {
    const block = draft.contentBlocks.find((item) => item.id === blockId);
    if (!block) return;
    updateBlock(blockId, {
      textItems: [
        ...block.textItems,
        createTextItemDraft({ id: `texto-${Date.now()}`, body: "", explanation: "", references: [] }),
      ],
    });
  };
  const removeTextItem = (blockId: string, itemId: string) => {
    const block = draft.contentBlocks.find((item) => item.id === blockId);
    if (!block) return;
    updateBlock(blockId, {
      textItems: block.textItems.filter((item) => item.id !== itemId),
    });
  };
  const addReference = (
    blockId: string,
    itemId: string,
    reference: ParsedBibleReference,
    text: string,
  ) => {
    const block = draft.contentBlocks.find((item) => item.id === blockId);
    const textItem = block?.textItems.find((item) => item.id === itemId);
    if (!textItem || textItem.references.some((item) => item.href === reference.href)) return;
    updateTextItem(blockId, itemId, {
      references: [
        ...textItem.references,
        {
          id: reference.href,
          label: reference.label,
          href: reference.href,
          text,
          formattedText: sanitizeRichBibleText(text),
        },
      ],
    });
  };
  const removeReference = (blockId: string, itemId: string, referenceId: string) => {
    const block = draft.contentBlocks.find((item) => item.id === blockId);
    const textItem = block?.textItems.find((item) => item.id === itemId);
    if (!textItem) return;
    const nextReferences = textItem.references.filter((reference) => reference.id !== referenceId);
    updateTextItem(blockId, itemId, { references: nextReferences });
    if (nextReferences.length === textItem.references.length) {
      updateTextItem(blockId, itemId, {
        references: textItem.references.filter((reference) => reference.href !== referenceId),
      });
    }
  };
  const updateReference = (
    blockId: string,
    itemId: string,
    referenceId: string,
    patch: Partial<GuideReferenceDraft>,
  ) => {
    const block = draft.contentBlocks.find((item) => item.id === blockId);
    const textItem = block?.textItems.find((item) => item.id === itemId);
    if (!textItem) return;
    updateTextItem(blockId, itemId, {
      references: textItem.references.map((reference) =>
        reference.id === referenceId ? { ...reference, ...patch } : reference,
      ),
    });
  };

  return (
    <div className="mt-5 rounded-lg border border-[var(--accent)]/25 bg-[var(--background-soft)] p-4 sm:ml-[5.5rem]">
      <div className="grid gap-4">
        <label className="grid gap-1.5 text-xs font-semibold text-[var(--text-muted)]">
          Titulo
          <input
            value={draft.title}
            onChange={updateTitle}
            className="min-h-10 rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 text-sm font-medium text-[var(--text)] outline-none transition focus:border-[var(--accent)]"
          />
        </label>

        <div className="grid gap-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-semibold text-[var(--text-muted)]">Contenidos</span>
            <button
              type="button"
              onClick={addBlock}
              className="inline-flex min-h-9 items-center gap-2 rounded-md border border-[var(--accent)]/45 bg-[var(--surface)] px-3 text-sm font-semibold text-[var(--accent)] transition hover:bg-[var(--accent-soft)]"
            >
              <Plus className="h-4 w-4" strokeWidth={1.9} aria-hidden />
              Agregar contenido
            </button>
          </div>

          {draft.contentBlocks.map((block, blockIndex) => (
            <div key={block.id} className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-semibold text-[var(--text)]">Contenido {blockIndex + 1}</p>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => addTextItem(block.id)}
                    className="inline-flex min-h-8 items-center gap-1.5 rounded-md border border-[var(--accent)]/35 bg-[var(--background-soft)] px-2.5 text-xs font-semibold text-[var(--accent)] transition hover:bg-[var(--accent-soft)]"
                  >
                    <Plus className="h-3.5 w-3.5" strokeWidth={1.8} aria-hidden />
                    Adicionar texto
                  </button>
                  <button
                    type="button"
                    onClick={() => removeBlock(block.id)}
                    className="inline-flex min-h-8 items-center gap-1.5 rounded-md border border-red-200 bg-red-50 px-2.5 text-xs font-semibold text-red-700 transition hover:bg-red-100"
                  >
                    <Trash2 className="h-3.5 w-3.5" strokeWidth={1.8} aria-hidden />
                    Eliminar contenido
                  </button>
                </div>
              </div>

              <div className="grid gap-3">
                {block.textItems.map((item, itemIndex) => (
                  <div key={item.id} className="rounded-md border border-[var(--border)] bg-[var(--background-soft)] p-3">
                    <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                      <p className="text-xs font-semibold text-[var(--text-muted)]">Texto {itemIndex + 1}</p>
                      <button
                        type="button"
                        onClick={() => removeTextItem(block.id, item.id)}
                        className="inline-flex min-h-7 items-center gap-1.5 rounded-md border border-red-200 bg-red-50 px-2 text-xs font-semibold text-red-700 transition hover:bg-red-100"
                      >
                        <Trash2 className="h-3.5 w-3.5" strokeWidth={1.8} aria-hidden />
                        Eliminar texto
                      </button>
                    </div>

                    <label className="grid gap-1.5 text-xs font-semibold text-[var(--text-muted)]">
                      Texto
                      <textarea
                        value={item.body}
                        onChange={(event) => updateTextItem(block.id, item.id, { body: event.target.value })}
                        rows={3}
                        className="min-h-24 rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm leading-relaxed text-[var(--text)] outline-none transition focus:border-[var(--accent)]"
                      />
                    </label>

                    <label className="mt-3 grid gap-1.5 text-xs font-semibold text-[var(--text-muted)]">
                      Explicacion libre
                      <textarea
                        value={item.explanation}
                        onChange={(event) =>
                          updateTextItem(block.id, item.id, { explanation: event.target.value })
                        }
                        rows={3}
                        placeholder="Ej. Si la fundo Cristo y no puede ser destruida..."
                        className="min-h-20 rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm leading-relaxed text-[var(--text)] outline-none transition placeholder:text-[var(--text-muted)]/55 focus:border-[var(--accent)]"
                      />
                    </label>

                    <div className="mt-3 grid gap-2">
                      <span className="text-xs font-semibold text-[var(--text-muted)]">Referencias</span>
                      <BibleReferencePicker
                        books={bibleBooks}
                        onAddReference={(reference, text) => addReference(block.id, item.id, reference, text)}
                      />
                      {item.references.length > 0 ? (
                        <div className="grid gap-2">
                          {item.references.map((reference) => (
                            <div key={reference.id} className="rounded-md border border-[var(--accent)]/25 bg-[var(--surface)] px-3 py-2">
                              <div className="flex flex-wrap items-center justify-between gap-2">
                                <Link href={reference.href} className="text-sm font-semibold text-[var(--accent)] hover:underline">
                                  {reference.label}
                                </Link>
                                <button
                                  type="button"
                                  onClick={() => removeReference(block.id, item.id, reference.id || reference.href)}
                                  className="inline-flex min-h-7 items-center gap-1 rounded-md px-2 text-xs font-semibold text-red-700 transition hover:bg-red-50"
                                >
                                  <X className="h-3.5 w-3.5" strokeWidth={1.8} aria-hidden />
                                  Quitar
                                </button>
                              </div>
                              {reference.text ? (
                                <div className="mt-2">
                                  <RichBibleTextEditor
                                    value={reference.formattedText ?? reference.text}
                                    onChange={(formattedText) =>
                                      updateReference(block.id, item.id, reference.id, {
                                        formattedText,
                                        text: stripRichBibleText(formattedText),
                                      })
                                    }
                                  />
                                </div>
                              ) : null}
                            </div>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex min-h-9 items-center gap-2 rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 text-sm font-semibold text-[var(--text-muted)] transition hover:border-[var(--accent)]/40 hover:text-[var(--text)]"
        >
          <X className="h-4 w-4" strokeWidth={1.8} aria-hidden />
          Cancelar
        </button>
        <button
          type="button"
          onClick={onSave}
          className="inline-flex min-h-9 items-center gap-2 rounded-md border border-[var(--accent)] bg-[var(--accent)] px-3 text-sm font-semibold text-[var(--accent-foreground)] transition hover:opacity-90"
        >
          <Save className="h-4 w-4" strokeWidth={1.8} aria-hidden />
          Guardar
        </button>
      </div>
    </div>
  );
}

export function ApologeticaGuidePage({ guide, bibleBooks }: Props) {
  const isChurchGuide = guide.slug === CHURCH_GUIDE_PARENT_SLUG;
  const isSaintsGuide = guide.slug === SAINTS_GUIDE_PARENT_SLUG;
  const showGuideTopics = isChurchGuide || isSaintsGuide;
  const initialSections = ensureUniqueSectionIds(
    renumberSections(guide.sections.map(repairKnownGuideReferences).map(ensureSectionContentBlocks)),
  );
  const [sections, setSections] = useState(() =>
    initialSections,
  );
  const [activeSectionId, setActiveSectionId] = useState(initialSections[0]?.id ?? "");
  const [isAdmin, setIsAdmin] = useState(false);
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
  const [addingBeforeSectionId, setAddingBeforeSectionId] = useState<string | "__end__" | null>(
    null,
  );
  const [sectionPendingDelete, setSectionPendingDelete] = useState<GuideSection | null>(null);
  const [topics, setTopics] = useState<IglesiaGuideTopicItem[]>(() =>
    isSaintsGuide ? iglesiaGuideDefaultTopics : [],
  );
  const [editingTopicId, setEditingTopicId] = useState<string | null>(null);
  const [topicDraft, setTopicDraft] = useState<GuideTopicDraft>(() => createTopicDraft());
  const [draggingTopicId, setDraggingTopicId] = useState<string | null>(null);
  const [editingDraft, setEditingDraft] = useState<GuideSectionDraft | null>(null);
  const [newSectionDraft, setNewSectionDraft] = useState<GuideSectionDraft>(() =>
    createSectionDraft(),
  );
  const [selectedReference, setSelectedReference] = useState<SelectedGuideReference | null>(null);
  const [progress, setProgress] = useState(0);
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});
  const storageKey = `${GUIDE_STORAGE_PREFIX}${guide.slug}`;
  const topicsStorageKey = `${GUIDE_TOPICS_STORAGE_PREFIX}${guide.slug}`;

  const saveSections = useCallback(
    (nextSections: GuideSection[]) => {
      const numbered = ensureUniqueSectionIds(renumberSections(nextSections));
      setSections(numbered);
      window.localStorage.setItem(storageKey, JSON.stringify(numbered));
    },
    [storageKey],
  );

  const updateProgress = useCallback(() => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    if (docHeight <= 0) {
      setProgress(0);
      return;
    }
    setProgress(Math.min(100, Math.round((scrollTop / docHeight) * 100)));
  }, []);

  const saveTopics = useCallback(
    (nextTopics: IglesiaGuideTopicItem[]) => {
      const normalizedTopics = isSaintsGuide ? enforceSaintsTopicRoutes(nextTopics) : nextTopics;
      setTopics(normalizedTopics);
      window.localStorage.setItem(topicsStorageKey, JSON.stringify(normalizedTopics));
    },
    [isSaintsGuide, topicsStorageKey],
  );

  useEffect(() => {
    updateProgress();
    window.addEventListener("scroll", updateProgress, { passive: true });
    return () => window.removeEventListener("scroll", updateProgress);
  }, [updateProgress]);

  useEffect(() => {
    setIsAdmin(readAuthSession()?.role === "admin");

    const saved = window.localStorage.getItem(storageKey);
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as GuideSection[];
        if (Array.isArray(parsed)) {
          const repaired = ensureUniqueSectionIds(
            renumberSections(parsed.map(repairKnownGuideReferences).map(ensureSectionContentBlocks)),
          );
          setSections(repaired);
          window.localStorage.setItem(storageKey, JSON.stringify(repaired));
        }
      } catch {
        window.localStorage.removeItem(storageKey);
      }
    }

    if (showGuideTopics) {
      const savedTopics = window.localStorage.getItem(topicsStorageKey);
      if (savedTopics) {
        try {
          const parsedTopics = JSON.parse(savedTopics) as IglesiaGuideTopicItem[];
          if (Array.isArray(parsedTopics)) {
            const normalizedTopics = parsedTopics.filter(
              (item) =>
                item &&
                typeof item.id === "string" &&
                typeof item.title === "string" &&
                typeof item.href === "string",
            );
            const isLegacyChurchSeed =
              isChurchGuide &&
              normalizedTopics.length === iglesiaGuideDefaultTopics.length &&
              normalizedTopics.every((topic) =>
                topic.href.startsWith("/apologetica/la-iglesia-que-fundo-jesus-cristo/topicos/"),
              );
            const repairedTopics = isLegacyChurchSeed
              ? []
              : isSaintsGuide
                ? enforceSaintsTopicRoutes(normalizedTopics)
                : normalizedTopics;
            setTopics(repairedTopics);
            window.localStorage.setItem(topicsStorageKey, JSON.stringify(repairedTopics));
          }
        } catch {
          window.localStorage.removeItem(topicsStorageKey);
        }
      } else {
        window.localStorage.setItem(
          topicsStorageKey,
          JSON.stringify(isSaintsGuide ? iglesiaGuideDefaultTopics : []),
        );
      }
    }

    const syncAdminSession = () => {
      setIsAdmin(readAuthSession()?.role === "admin");
    };
    window.addEventListener("storage", syncAdminSession);
    window.addEventListener("seekoftruth-admin-session", syncAdminSession);
    window.addEventListener(AUTH_SESSION_EVENT, syncAdminSession);
    return () => {
      window.removeEventListener("storage", syncAdminSession);
      window.removeEventListener("seekoftruth-admin-session", syncAdminSession);
      window.removeEventListener(AUTH_SESSION_EVENT, syncAdminSession);
    };
  }, [isChurchGuide, isSaintsGuide, showGuideTopics, storageKey, topicsStorageKey]);

  useEffect(() => {
    const elements = sections
      .map((s) => sectionRefs.current[s.id])
      .filter((el): el is HTMLElement => el != null);
    if (!elements.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]?.target.id) setActiveSectionId(visible[0].target.id);
      },
      { rootMargin: "-18% 0px -58% 0px", threshold: [0, 0.2, 0.45, 0.7] },
    );

    for (const el of elements) observer.observe(el);
    return () => observer.disconnect();
  }, [sections]);

  useEffect(() => {
    if (!sectionPendingDelete) return;
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSectionPendingDelete(null);
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [sectionPendingDelete]);

  useEffect(() => {
    if (!draggingTopicId) return;
    const previousCursor = document.body.style.cursor;
    document.body.style.cursor = "grabbing";
    return () => {
      document.body.style.cursor = previousCursor;
    };
  }, [draggingTopicId]);

  const scrollToSection = (id: string) => {
    sectionRefs.current[id]?.scrollIntoView({ behavior: "smooth", block: "start" });
    setActiveSectionId(id);
  };

  const startEditingSection = (section: GuideSection) => {
    setAddingBeforeSectionId(null);
    setEditingSectionId(section.id);
    setEditingDraft(createSectionDraft(section));
  };

  const saveEditedSection = (sectionId: string) => {
    if (!editingDraft) return;
    saveSections(
      sections.map((section) =>
        section.id === sectionId ? draftToSection(editingDraft, section) : section,
      ),
    );
    setEditingSectionId(null);
    setEditingDraft(null);
  };

  const startAddingSection = (sectionId: string | "__end__") => {
    setEditingSectionId(null);
    setEditingDraft(null);
    setAddingBeforeSectionId(sectionId);
    setNewSectionDraft(createSectionDraft());
  };

  const saveNewSection = () => {
    const newSection = draftToSection(newSectionDraft);
    const insertIndex =
      addingBeforeSectionId === "__end__" || addingBeforeSectionId == null
        ? sections.length
        : sections.findIndex((section) => section.id === addingBeforeSectionId);
    const nextSections = [...sections];
    nextSections.splice(insertIndex < 0 ? sections.length : insertIndex, 0, newSection);
    saveSections(nextSections);
    setAddingBeforeSectionId(null);
    setNewSectionDraft(createSectionDraft());
    setActiveSectionId(newSection.id);
  };

  const requestDeleteSection = (sectionId: string) => {
    const section = sections.find((item) => item.id === sectionId);
    if (!section) return;
    setSectionPendingDelete(section);
  };

  const deleteSection = (sectionId: string) => {
    const nextSections = sections.filter((item) => item.id !== sectionId);
    saveSections(nextSections);
    if (activeSectionId === sectionId) setActiveSectionId(nextSections[0]?.id ?? "");
    if (editingSectionId === sectionId) {
      setEditingSectionId(null);
      setEditingDraft(null);
    }
    setSectionPendingDelete(null);
  };

  const canManageGuideTopics = showGuideTopics && isAdmin;

  const startAddingTopic = () => {
    setEditingTopicId("__new__");
    setTopicDraft(createTopicDraft());
  };

  const startEditingTopic = (topic: IglesiaGuideTopicItem) => {
    setEditingTopicId(topic.id);
    setTopicDraft(createTopicDraft(topic));
  };

  const cancelTopicEdition = () => {
    setEditingTopicId(null);
    setTopicDraft(createTopicDraft());
  };

  const saveTopicDraft = () => {
    const title = topicDraft.title.trim();
    const href = sanitizeTopicHref(topicDraft.href);
    if (!title || !href) return;

    if (editingTopicId === "__new__") {
      const newTopic: IglesiaGuideTopicItem = {
        id: `topic-${Date.now()}`,
        title,
        href,
      };
      saveTopics([...topics, newTopic]);
      setEditingTopicId(null);
      setTopicDraft(createTopicDraft());
      return;
    }

    if (!editingTopicId) return;
    const nextTopics = topics.map((topic) =>
      topic.id === editingTopicId ? { ...topic, title, href } : topic,
    );
    saveTopics(nextTopics);
    setEditingTopicId(null);
    setTopicDraft(createTopicDraft());
  };

  const deleteTopic = (topicId: string) => {
    const nextTopics = topics.filter((topic) => topic.id !== topicId);
    saveTopics(nextTopics);
    if (editingTopicId === topicId) cancelTopicEdition();
  };

  const handleDragStartTopic = (topicId: string) => {
    setDraggingTopicId(topicId);
  };

  const handleDropTopic = (targetTopicId: string) => {
    if (!draggingTopicId || draggingTopicId === targetTopicId) return;
    const sourceIndex = topics.findIndex((topic) => topic.id === draggingTopicId);
    const targetIndex = topics.findIndex((topic) => topic.id === targetTopicId);
    if (sourceIndex < 0 || targetIndex < 0) return;

    const reordered = [...topics];
    const [moved] = reordered.splice(sourceIndex, 1);
    reordered.splice(targetIndex, 0, moved);
    saveTopics(reordered);
    setDraggingTopicId(null);
  };

  const getDefaultSectionReference = (section: GuideSection): SelectedGuideReference | null => {
    for (const block of getSectionContentBlocks(section)) {
      for (const item of block.items ?? []) {
        const reference = item.references[0];
        if (reference) {
          return {
            sectionId: section.id,
            label: reference.label,
            href: reference.href,
            text: reference.text ?? section.quote?.text,
            formattedText: reference.formattedText,
          };
        }
      }
    }
    return section.quote
      ? {
          sectionId: section.id,
          label: section.quote.reference,
          href: section.quote.href ?? "",
          text: section.quote.text,
        }
      : null;
  };

  const persistResolvedReferenceText = useCallback(
    (sectionId: string, href: string, text: string) => {
      setSections((currentSections) => {
        const nextSections = currentSections.map((section) => {
          if (section.id !== sectionId) return section;
          return {
            ...section,
            contentBlocks: getSectionContentBlocks(section).map((block) => ({
              ...block,
              items: (block.items ?? []).map((item) => ({
                ...item,
                references: item.references.map((reference) =>
                  reference.href === href
                    ? { ...reference, text, formattedText: reference.formattedText ?? sanitizeRichBibleText(text) }
                    : reference,
                ),
              })),
            })),
          };
        });
        const numbered = renumberSections(nextSections);
        window.localStorage.setItem(storageKey, JSON.stringify(numbered));
        return numbered;
      });
    },
    [storageKey],
  );

  const selectReference = async (
    sectionId: string,
    reference: GuideReference,
  ) => {
    setSelectedReference({
      sectionId,
      label: reference.label,
      href: reference.href,
      text: reference.text ?? "Leyendo versiculo...",
      formattedText: reference.formattedText,
    });
    if (reference.text) return;
    try {
      const text = await fetchBibleReferenceTextFromHref(reference.href);
      setSelectedReference({
        sectionId,
        label: reference.label,
        href: reference.href,
        text,
        formattedText: sanitizeRichBibleText(text),
      });
      persistResolvedReferenceText(sectionId, reference.href, text);
    } catch (error) {
      setSelectedReference({
        sectionId,
        label: reference.label,
        href: reference.href,
        text: error instanceof Error ? error.message : "No se pudo leer el versiculo.",
      });
    }
  };

  const visibleGuide = { ...guide, sections };
  const canEditGuide = isAdmin && isApologeticaGuideSlug(guide.slug);

  return (
    <div className="apologetica-guide mx-auto w-full max-w-[1640px] pb-8">
      <nav className="text-sm text-[var(--text-muted)]" aria-label="Migas de pan">
        <ol className="flex flex-wrap items-center gap-1.5">
          <li>
            <Link href="/" className="transition hover:text-[var(--accent)]">
              Inicio
            </Link>
          </li>
          <li aria-hidden className="opacity-40">
            /
          </li>
          <li>
            <Link href="/apologetica" className="transition hover:text-[var(--accent)]">
              Apologética
            </Link>
          </li>
          <li aria-hidden className="opacity-40">
            /
          </li>
          <li className="text-[var(--text-muted)]" aria-current="page">
            {guide.title}
          </li>
        </ol>
      </nav>

      <Link
        href="/apologetica"
        className="mt-8 inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--accent)] transition hover:underline"
      >
        <ArrowLeft className="h-4 w-4" strokeWidth={2} aria-hidden />
        Volver a Apologética
      </Link>

      <header className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(27rem,38rem)] lg:items-start lg:gap-8">
        <div className="flex min-w-0 flex-col space-y-2 pt-0 lg:pr-4">
          <h1 className="page-title">{guide.title}</h1>
          <p className="max-w-2xl text-base leading-relaxed text-[var(--text-muted)] sm:text-lg">
            {guide.description}
          </p>
        </div>

        <div className="guide-hero-quote flex h-[10rem] overflow-hidden rounded-lg border border-[var(--border)] bg-[#f7f1e8] shadow-[var(--shadow-card)] sm:h-[11.25rem]">
          <div className="flex min-w-0 flex-1 flex-col justify-center px-7 py-5">
            <span className="font-serif-display text-5xl leading-none text-[var(--accent)]/35" aria-hidden>
              &ldquo;
            </span>
            <p className="-mt-2 text-base font-semibold leading-tight text-[var(--accent)]">
              {guide.heroQuote.reference}
            </p>
            <p className="mt-2 line-clamp-3 overflow-hidden text-ellipsis font-serif-display text-[13px] leading-relaxed text-[var(--text)] sm:text-[15px]">
              {guide.heroQuote.text}
            </p>
          </div>
          <div className="hidden w-[43%] min-w-[13.5rem] shrink-0 self-stretch sm:block">
            <HeroIllustration />
          </div>
        </div>
      </header>

      <div className="mt-8 lg:hidden">
        <GuideSidebar
          guide={visibleGuide}
          activeSectionId={activeSectionId}
          progress={progress}
          onSelectSection={scrollToSection}
        />
      </div>

      <div className="mt-4 space-y-4 lg:hidden">
        <KeyPassages guide={guide} />
        {showGuideTopics ? (
          <GuideTopicsCard
            topics={
              editingTopicId === "__new__"
                ? [
                    ...topics,
                    {
                      id: "__new__",
                      title: topicDraft.title || "Nuevo topico",
                      href: topicDraft.href || "/apologetica/",
                    },
                  ]
                : topics
            }
            canManage={canManageGuideTopics}
            editingTopicId={editingTopicId}
            topicDraft={topicDraft}
            draggingTopicId={draggingTopicId}
            onStartAdd={startAddingTopic}
            onStartEdit={startEditingTopic}
            onCancelEdit={cancelTopicEdition}
            onChangeDraft={setTopicDraft}
            onSaveDraft={saveTopicDraft}
            onDelete={deleteTopic}
            onDragStart={handleDragStartTopic}
            onDragEnd={() => setDraggingTopicId(null)}
            onDropOnTopic={handleDropTopic}
          />
        ) : null}
        <DownloadGuide />
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[16rem_minmax(0,1fr)] lg:items-start xl:grid-cols-[16rem_minmax(0,1fr)_18rem] xl:gap-6">
        <aside className="hidden lg:block">
          <div className="sticky top-24">
            <GuideSidebar
              guide={visibleGuide}
              activeSectionId={activeSectionId}
              progress={progress}
              onSelectSection={scrollToSection}
            />
          </div>
        </aside>

        <main className="min-w-0">
          <ol className="overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-card)]">
            {sections.map((section, index) => {
              const Icon = getGuideSectionIcon(section.icon);
              const selectedSectionReference =
                selectedReference?.sectionId === section.id
                  ? selectedReference
                  : getDefaultSectionReference(section);
              return (
                <li
                  key={section.id}
                  id={section.id}
                  ref={(el) => {
                    sectionRefs.current[section.id] = el;
                  }}
                  className={`scroll-mt-28 px-5 py-5 sm:px-7 sm:py-5 ${
                    index < sections.length - 1 ? "border-b border-[var(--border)]" : ""
                  }`}
                >
                  <article>
                    {canEditGuide ? (
                      <div className="mb-4 flex flex-wrap justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => startAddingSection(section.id)}
                          className="inline-flex min-h-8 items-center gap-1.5 rounded-md border border-[var(--border)] bg-[var(--background-soft)] px-2.5 text-xs font-semibold text-[var(--accent)] transition hover:border-[var(--accent)]/45 hover:bg-[var(--accent-soft)]"
                        >
                          <Plus className="h-3.5 w-3.5" strokeWidth={1.9} aria-hidden />
                          Agregar antes
                        </button>
                        <button
                          type="button"
                          onClick={() => startEditingSection(section)}
                          className="inline-flex min-h-8 items-center gap-1.5 rounded-md border border-[var(--border)] bg-[var(--background-soft)] px-2.5 text-xs font-semibold text-[var(--accent)] transition hover:border-[var(--accent)]/45 hover:bg-[var(--accent-soft)]"
                          aria-expanded={editingSectionId === section.id}
                        >
                          <Edit3 className="h-3.5 w-3.5" strokeWidth={1.9} aria-hidden />
                          Editar
                        </button>
                        <button
                          type="button"
                          onClick={() => requestDeleteSection(section.id)}
                          className="inline-flex min-h-8 items-center gap-1.5 rounded-md border border-red-200 bg-red-50 px-2.5 text-xs font-semibold text-red-700 transition hover:border-red-300 hover:bg-red-100"
                        >
                          <Trash2 className="h-3.5 w-3.5" strokeWidth={1.9} aria-hidden />
                          Eliminar
                        </button>
                      </div>
                    ) : null}

                    {canEditGuide && addingBeforeSectionId === section.id ? (
                      <GuideSectionStructuredEditor
                        draft={newSectionDraft}
                        onChange={setNewSectionDraft}
                        bibleBooks={bibleBooks}
                        onCancel={() => setAddingBeforeSectionId(null)}
                        onSave={saveNewSection}
                      />
                    ) : null}

                    <div className="grid gap-5 sm:grid-cols-[4.25rem_minmax(0,1fr)] sm:items-start xl:grid-cols-[4.5rem_minmax(0,1fr)_19rem]">
                      <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-[var(--accent)]/20 bg-[var(--background-soft)] text-[var(--accent)] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.7)] sm:h-16 sm:w-16">
                        <Icon className="h-7 w-7 sm:h-8 sm:w-8" strokeWidth={1.45} aria-hidden />
                      </span>
                      <div className="min-w-0 flex-1">
                        <h2 className="font-serif-display text-xl font-semibold leading-snug text-[var(--text)] sm:text-[1.65rem]">
                          {section.number}. {section.title}
                        </h2>

                        <div className="mt-3 space-y-4">
                          {getSectionContentBlocks(section).map((block, blockIndex) => (
                            <div
                              key={block.id}
                              className={blockIndex > 0 ? "border-t border-[var(--border)] pt-4" : ""}
                            >
                              <div className="space-y-4">
                                {(block.items ?? []).map((item, itemIndex) => (
                                  <div
                                    key={item.id}
                                    className={itemIndex > 0 ? "border-t border-[var(--border)]/70 pt-4" : ""}
                                  >
                                    {item.body ? (
                                      <p className="text-[15px] leading-relaxed text-[var(--text)]/90">
                                        {item.body}
                                      </p>
                                    ) : null}
                                    {item.explanation ? (
                                      <p className="mt-2 text-[14px] leading-relaxed text-[var(--text-muted)]">
                                        {item.explanation}
                                      </p>
                                    ) : null}

                                    {item.references.length > 0 ? (
                                      <div className="mt-3 flex flex-wrap gap-2">
                                        {item.references.map((reference) => (
                                          <button
                                            key={reference.href}
                                            type="button"
                                            onClick={() => selectReference(section.id, reference)}
                                            className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold transition ${
                                              selectedSectionReference?.href === reference.href
                                                ? "border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)]"
                                                : "border-[var(--accent)]/35 bg-transparent text-[var(--accent)] hover:border-[var(--accent)]/55 hover:bg-[var(--accent-soft)]"
                                            }`}
                                          >
                                            {reference.label}
                                          </button>
                                        ))}
                                      </div>
                                    ) : null}
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {selectedSectionReference ? (
                        <SectionQuote
                          text={selectedSectionReference.text ?? ""}
                          reference={selectedSectionReference.label}
                          href={selectedSectionReference.href || undefined}
                          formattedText={selectedSectionReference.formattedText}
                        />
                      ) : section.quote ? (
                        <SectionQuote
                          text={section.quote.text}
                          reference={section.quote.reference}
                          href={section.quote.href}
                        />
                      ) : (
                        <span className="hidden xl:block" />
                      )}
                    </div>

                    {selectedSectionReference ? (
                      <blockquote className="guide-section-quote mt-4 rounded-lg border border-[var(--border)] bg-[var(--background-soft)] px-4 py-3.5 xl:hidden sm:ml-[5.5rem]">
                        <span
                          className="font-serif-display text-3xl leading-none text-[var(--accent)]/40"
                          aria-hidden
                        >
                          &ldquo;
                        </span>
                        {selectedSectionReference.formattedText ? (
                          <p
                            className="-mt-2 text-sm leading-relaxed text-[var(--text)]"
                            dangerouslySetInnerHTML={{
                              __html: sanitizeRichBibleText(selectedSectionReference.formattedText),
                            }}
                          />
                        ) : (
                          <p className="-mt-2 text-sm leading-relaxed text-[var(--text)]">
                            {selectedSectionReference.text}
                          </p>
                        )}
                        <footer className="mt-2 text-xs font-semibold text-[var(--accent)]">
                          {selectedSectionReference.href ? (
                            <Link href={selectedSectionReference.href} className="hover:underline">
                              {selectedSectionReference.label}
                            </Link>
                          ) : (
                            selectedSectionReference.label
                          )}
                        </footer>
                      </blockquote>
                    ) : section.quote ? (
                      <blockquote className="guide-section-quote mt-4 rounded-lg border border-[var(--border)] bg-[var(--background-soft)] px-4 py-3.5 xl:hidden sm:ml-[5.5rem]">
                        <span
                          className="font-serif-display text-3xl leading-none text-[var(--accent)]/40"
                          aria-hidden
                        >
                          &ldquo;
                        </span>
                        <p className="-mt-2 text-sm leading-relaxed text-[var(--text)]">
                          {section.quote.text}
                        </p>
                        <footer className="mt-2 text-xs font-semibold text-[var(--accent)]">
                          {section.quote.href ? (
                            <Link href={section.quote.href} className="hover:underline">
                              {section.quote.reference}
                            </Link>
                          ) : (
                            section.quote.reference
                          )}
                        </footer>
                      </blockquote>
                    ) : null}

                    {canEditGuide && editingSectionId === section.id && editingDraft ? (
                      <GuideSectionStructuredEditor
                        draft={editingDraft}
                        onChange={setEditingDraft}
                        bibleBooks={bibleBooks}
                        onCancel={() => {
                          setEditingSectionId(null);
                          setEditingDraft(null);
                        }}
                        onSave={() => saveEditedSection(section.id)}
                      />
                    ) : null}
                  </article>
                </li>
              );
            })}
          </ol>
          {canEditGuide ? (
            <div className="mt-4 rounded-lg border border-dashed border-[var(--accent)]/35 bg-[var(--background-soft)] p-4">
              {addingBeforeSectionId !== "__end__" ? (
                <button
                  type="button"
                  onClick={() => startAddingSection("__end__")}
                  className="inline-flex min-h-9 items-center gap-2 rounded-md border border-[var(--accent)]/45 bg-[var(--surface)] px-3 text-sm font-semibold text-[var(--accent)] transition hover:bg-[var(--accent-soft)]"
                >
                  <Plus className="h-4 w-4" strokeWidth={1.9} aria-hidden />
                  Agregar apartado al final
                </button>
              ) : null}

              {addingBeforeSectionId === "__end__" ? (
                <GuideSectionStructuredEditor
                  draft={newSectionDraft}
                  onChange={setNewSectionDraft}
                  bibleBooks={bibleBooks}
                  onCancel={() => setAddingBeforeSectionId(null)}
                  onSave={saveNewSection}
                />
              ) : null}
            </div>
          ) : null}
        </main>

        <aside className="hidden min-w-0 space-y-4 lg:block xl:col-span-1">
          <div className="lg:sticky lg:top-24 lg:space-y-4">
            <KeyPassages guide={guide} />
            {showGuideTopics ? (
              <GuideTopicsCard
                topics={
                  editingTopicId === "__new__"
                    ? [
                        ...topics,
                        {
                          id: "__new__",
                          title: topicDraft.title || "Nuevo topico",
                          href: topicDraft.href || "/apologetica/",
                        },
                      ]
                    : topics
                }
                canManage={canManageGuideTopics}
                editingTopicId={editingTopicId}
                topicDraft={topicDraft}
                draggingTopicId={draggingTopicId}
                onStartAdd={startAddingTopic}
                onStartEdit={startEditingTopic}
                onCancelEdit={cancelTopicEdition}
                onChangeDraft={setTopicDraft}
                onSaveDraft={saveTopicDraft}
                onDelete={deleteTopic}
                onDragStart={handleDragStartTopic}
                onDragEnd={() => setDraggingTopicId(null)}
                onDropOnTopic={handleDropTopic}
              />
            ) : null}
            <DownloadGuide />
          </div>
        </aside>
      </div>
      {sectionPendingDelete ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-delete-title"
          onClick={() => setSectionPendingDelete(null)}
        >
          <div
            className="w-full max-w-md rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5 shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <h3 id="confirm-delete-title" className="text-base font-semibold text-[var(--text)]">
              Confirmar eliminacion
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-[var(--text-muted)]">
              ¿Eliminar &quot;{sectionPendingDelete.title}&quot;?
            </p>
            <div className="mt-4 flex flex-wrap justify-end gap-2">
              <button
                type="button"
                onClick={() => setSectionPendingDelete(null)}
                className="inline-flex min-h-9 items-center rounded-md border border-[var(--border)] bg-[var(--background-soft)] px-3 text-sm font-semibold text-[var(--text)] transition hover:border-[var(--accent)]/35 hover:bg-[var(--accent-soft)]"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => deleteSection(sectionPendingDelete.id)}
                className="inline-flex min-h-9 items-center rounded-md border border-red-300 bg-red-50 px-3 text-sm font-semibold text-red-700 transition hover:bg-red-100"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
