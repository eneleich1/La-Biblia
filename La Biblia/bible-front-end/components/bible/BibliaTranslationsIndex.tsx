import Link from "next/link";
import { ArrowRight, BookOpen, Lock, Star } from "lucide-react";
import type { StaticTranslation } from "@/lib/staticBible";

function OrnamentLine({ className = "" }: { className?: string }) {
  return <span className={`biblia-ornament-line ${className}`.trim()} aria-hidden />;
}

/** Rombo delineado (afinado), sin relleno — como en el diseño */
function OutlineDiamond({ className = "" }: { className?: string }) {
  return (
    <span className={`biblia-outline-diamond ${className}`.trim()} aria-hidden>
      <svg viewBox="0 0 12 14" className="biblia-outline-diamond-svg">
        <path
          d="M6 1.25 10.75 7 6 12.75 1.25 7Z"
          fill="none"
          stroke="currentColor"
          strokeWidth="0.95"
          strokeLinejoin="miter"
        />
      </svg>
    </span>
  );
}

/** Rayita corta con rombo delineado en el centro */
function LineDiamondOrnament({ className = "" }: { className?: string }) {
  return (
    <div className={`biblia-line-diamond ${className}`.trim()} aria-hidden>
      <span className="biblia-line-diamond-segment" />
      <OutlineDiamond />
      <span className="biblia-line-diamond-segment" />
    </div>
  );
}

function IntroBookMark() {
  return (
    <div className="biblia-intro-mark">
      <OrnamentLine />
      <BookOpen className="biblia-intro-book-icon" strokeWidth={1.45} aria-hidden />
      <OrnamentLine />
    </div>
  );
}

function formatTranslationTitle(translation: StaticTranslation) {
  const name = translation.name.replace(/Jerusalen/i, "Jerusalén");
  return `${name} (${translation.abbreviation})`;
}

function translationSubtitle(translation: StaticTranslation) {
  if (translation.language === "es") {
    return "Edición en español para lectura y estudio.";
  }
  return translation.edition
    ? `Edición ${translation.edition} para lectura y estudio.`
    : "Traducción disponible para lectura y estudio.";
}

function FeaturedTranslationCard({ translation }: { translation: StaticTranslation }) {
  return (
    <article className="biblia-featured-card">
      <div className="biblia-featured-card-media" aria-hidden>
        {/* Placeholder: sustituir por imagen cuando esté disponible */}
      </div>
      <div className="biblia-featured-card-body">
        <span className="biblia-available-badge">
          <Star className="h-3 w-3 shrink-0" strokeWidth={2} aria-hidden />
          Disponible
        </span>
        <h2 className="biblia-featured-card-title">{formatTranslationTitle(translation)}</h2>
        <p className="biblia-featured-card-subtitle">{translationSubtitle(translation)}</p>
        <div className="biblia-featured-card-action">
          <Link href={`/biblia/${translation.language}`} className="biblia-open-button">
            <BookOpen className="h-4 w-4 shrink-0" strokeWidth={1.85} aria-hidden />
            Abrir traducción
          </Link>
          <ArrowRight
            className="h-5 w-5 shrink-0 text-[var(--accent)]"
            strokeWidth={1.75}
            aria-hidden
          />
        </div>
      </div>
    </article>
  );
}

function ComingSoonCard() {
  return (
    <article className="biblia-soon-card">
      <Lock className="h-5 w-5 text-[var(--accent)]" strokeWidth={1.65} aria-hidden />
      <h3 className="biblia-soon-card-title">Próximamente</h3>
      <LineDiamondOrnament className="biblia-soon-card-ornament" />
      <p className="biblia-soon-card-text">
        Estamos trabajando para traerte más traducciones.
      </p>
    </article>
  );
}

export function BibliaTranslationsIndex({
  translations,
}: {
  translations: StaticTranslation[];
}) {
  return (
    <div className="mx-auto w-full max-w-6xl">
      <div className="biblia-translations-page">
        <section className="biblia-translations-hero" aria-labelledby="biblia-translations-heading">
          <header className="biblia-translations-intro">
            <IntroBookMark />
            <h1 id="biblia-translations-heading" className="biblia-translations-title">
              La Biblia
            </h1>
            <LineDiamondOrnament className="biblia-intro-title-ornament" />
            <p className="biblia-translations-lead">
              Elige un idioma o traducción disponible para comenzar a leer.
            </p>
          </header>

          <div className="biblia-translations-featured">
            {translations.map((translation) => (
              <FeaturedTranslationCard key={translation.language} translation={translation} />
            ))}
          </div>
        </section>

        <div className="biblia-translations-divider" role="presentation">
          <span>Otras traducciones en preparación</span>
        </div>

        <section className="biblia-translations-soon" aria-label="Traducciones próximamente">
          <div className="biblia-translations-soon-grid">
            <ComingSoonCard />
            <ComingSoonCard />
            <ComingSoonCard />
          </div>
        </section>
      </div>
    </div>
  );
}
