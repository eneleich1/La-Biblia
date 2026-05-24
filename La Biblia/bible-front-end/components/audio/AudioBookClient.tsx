"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  ChevronsLeft,
  ChevronsRight,
  Headphones,
  Info,
} from "lucide-react";
import { formatBookTitle } from "@/lib/formatTitle";
import { youtubeEmbedUrl } from "@/lib/youtube";
import type { AudioChapterLink } from "@/lib/audio";

type ChapterLinkMap = Record<number, AudioChapterLink | undefined>;

type AudioBookClientProps = {
  language: string;
  bookSlug: string;
  bookTitle: string;
  chapterNumbers: number[];
  initialChapter: number;
  chapterLinks: ChapterLinkMap;
  prevBookSlug: string | null;
  nextBookSlug: string | null;
};

export function AudioBookClient({
  language,
  bookSlug,
  bookTitle,
  chapterNumbers,
  initialChapter,
  chapterLinks,
  prevBookSlug,
  nextBookSlug,
}: AudioBookClientProps) {
  const router = useRouter();
  const displayTitle = formatBookTitle(bookTitle);
  const chapters = chapterNumbers;
  const activeChapter = initialChapter;
  const chapterIndex = chapters.indexOf(activeChapter);
  const prevChapterNumber = chapterIndex > 0 ? chapters[chapterIndex - 1]! : null;
  const nextChapterNumber =
    chapterIndex >= 0 && chapterIndex < chapters.length - 1 ? chapters[chapterIndex + 1]! : null;
  const activeLink = chapterLinks[activeChapter];
  const embedSrc = activeLink
    ? youtubeEmbedUrl(activeLink.youtubeVideoId, activeLink.startSecond ?? undefined)
    : null;

  function goToChapter(nextBookSlug: string, chapter: number) {
    router.push(`/audio/${language}/${nextBookSlug}/${chapter}`);
  }

  return (
    <article className="audio-book-page scripture-reader-shell">
      <nav className="audio-breadcrumb" aria-label="Migas de pan">
        <Link href="/">Inicio</Link>
        <span aria-hidden>&gt;</span>
        <Link href={`/audio/${language}`}>Biblia en audio</Link>
        <span aria-hidden>&gt;</span>
        <span aria-current="page">{displayTitle}</span>
      </nav>

      <div className="scripture-reader-layout audio-book-layout">
        <aside className="scripture-reader-aside audio-book-sidebar" aria-label="Capítulos del libro">
          <div className="scripture-reader-aside-card">
            <Link href={`/audio/${language}`} className="scripture-back-link">
              Inicio
            </Link>

            <div className="scripture-aside-title-block">
              <p className="scripture-aside-kicker">Libro</p>
              <div className="scripture-aside-title-row">
                <div>
                  <h2>{displayTitle}</h2>
                  <p className="audio-sidebar-meta">
                    {chapters.length} capítulo{chapters.length === 1 ? "" : "s"}
                  </p>
                </div>
                <div className="scripture-aside-actions" aria-label="Navegación de capítulos">
                  {prevChapterNumber !== null ? (
                    <button
                      type="button"
                      onClick={() => goToChapter(bookSlug, prevChapterNumber)}
                      aria-label="Capítulo anterior"
                      title="Capítulo anterior"
                    >
                      <ArrowLeft aria-hidden />
                    </button>
                  ) : (
                    <span aria-label="Capítulo anterior no disponible" title="Capítulo anterior">
                      <ArrowLeft aria-hidden />
                    </span>
                  )}
                  {nextChapterNumber !== null ? (
                    <button
                      type="button"
                      onClick={() => goToChapter(bookSlug, nextChapterNumber)}
                      aria-label="Capítulo siguiente"
                      title="Capítulo siguiente"
                    >
                      <ArrowRight aria-hidden />
                    </button>
                  ) : (
                    <span aria-label="Capítulo siguiente no disponible" title="Capítulo siguiente">
                      <ArrowRight aria-hidden />
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="scripture-chapter-grid" aria-label="Capítulos">
              {chapters.map((chapter) => (
                <button
                  key={chapter}
                  type="button"
                  onClick={() => goToChapter(bookSlug, chapter)}
                  aria-current={chapter === activeChapter ? "page" : undefined}
                >
                  {String(chapter).padStart(2, "0")}
                </button>
              ))}
            </div>

            <div className="scripture-book-rail">
              {prevBookSlug ? (
                <button
                  type="button"
                  onClick={() => goToChapter(prevBookSlug, 1)}
                  aria-label="Libro anterior"
                  title="Libro anterior"
                >
                  <ChevronsLeft aria-hidden />
                </button>
              ) : null}
              {nextBookSlug ? (
                <button
                  type="button"
                  onClick={() => goToChapter(nextBookSlug, 1)}
                  aria-label="Libro siguiente"
                  title="Libro siguiente"
                >
                  <ChevronsRight aria-hidden />
                </button>
              ) : null}
            </div>

            <div className="audio-sidebar-about">
              <Headphones className="audio-sidebar-about-icon" strokeWidth={1.6} aria-hidden />
              <div>
                <p className="audio-sidebar-about-title">Acerca de la Biblia en audio</p>
                <p className="audio-sidebar-about-text">
                  El contenido de audio proviene de YouTube y se reproduce directamente desde su
                  plataforma.
                </p>
              </div>
            </div>
          </div>
        </aside>

        <div className="scripture-reader-main audio-book-main">
          <header className="audio-book-header">
            <h1>{displayTitle}</h1>
            <p className="audio-book-subtitle">Versión en audio</p>
          </header>

          <div className="audio-player-wrap">
            {embedSrc ? (
              <iframe
                key={embedSrc}
                src={embedSrc}
                title={`${displayTitle} — Capítulo ${activeChapter}`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="audio-player-iframe"
              />
            ) : (
              <div className="audio-player-empty" role="status">
                <p className="audio-player-empty-title">
                  {displayTitle} — Capítulo {activeChapter}
                </p>
                <p className="audio-player-empty-text">
                  Aún no hay un vídeo de YouTube enlazado para este capítulo.
                </p>
              </div>
            )}
          </div>

          <div className="audio-info-banner" role="note">
            <Info className="audio-info-banner-icon" strokeWidth={1.75} aria-hidden />
            <p>
              Si el audio no se reproduce, asegúrate de tener una conexión a internet activa.
            </p>
          </div>
        </div>
      </div>
    </article>
  );
}
