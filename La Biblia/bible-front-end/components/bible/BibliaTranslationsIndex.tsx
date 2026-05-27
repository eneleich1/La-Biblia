import Link from "next/link";
import { ArrowRight, BookOpen, MessageCircle, Star } from "lucide-react";
import type { StaticTranslation } from "@/lib/staticBible";

function OrnamentLine({ className = "" }: { className?: string }) {
  return <span className={`biblia-ornament-line ${className}`.trim()} aria-hidden />;
}

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
    return "Traducción católica realizada a partir de los textos originales en hebreo, arameo y griego.";
  }

  return translation.edition
    ? `Edición ${translation.edition} para lectura y estudio.`
    : "Traducción disponible para lectura y estudio.";
}

function FeaturedTranslationCard({ translation }: { translation: StaticTranslation }) {
  return (
    <article className="biblia-featured-card">
      <span className="biblia-available-badge">
        <Star className="h-3 w-3 shrink-0" fill="currentColor" strokeWidth={2} aria-hidden />
        Activa
      </span>
      <div className="biblia-card-book-mark" aria-hidden>
        <BookOpen className="biblia-card-book-icon" strokeWidth={1.25} />
      </div>
      <div className="biblia-featured-card-body">
        <h3 className="biblia-featured-card-title">{formatTranslationTitle(translation)}</h3>
        <LineDiamondOrnament className="biblia-card-title-ornament" />
        <p className="biblia-featured-card-subtitle">{translationSubtitle(translation)}</p>
        <div className="biblia-featured-card-action">
          <Link href={`/biblia/${translation.language}`} className="biblia-open-button">
            Leer ahora
            <ArrowRight className="h-4 w-4 shrink-0" strokeWidth={1.85} aria-hidden />
          </Link>
        </div>
      </div>
    </article>
  );
}

function ComingSoonCard() {
  return (
    <article className="biblia-soon-card">
      <div className="biblia-soon-icon-wrap" aria-hidden>
        <BookOpen className="biblia-soon-icon" strokeWidth={1.2} />
      </div>
      <h3 className="biblia-soon-card-title">Próximamente</h3>
      <LineDiamondOrnament className="biblia-soon-card-ornament" />
      <p className="biblia-soon-card-text">Nuevas traducciones próximamente.</p>
      <span className="biblia-soon-button">Próximamente</span>
    </article>
  );
}

export function BibliaTranslationsIndex({
  translations,
}: {
  translations: StaticTranslation[];
}) {
  return (
    <div className="biblia-translations-page">
      <section className="biblia-translations-hero" aria-labelledby="biblia-translations-heading">
        <div className="biblia-translations-hero-inner">
          <header className="biblia-translations-intro">
            <IntroBookMark />
            <h1 id="biblia-translations-heading" className="page-title biblia-translations-title">
              La Biblia
            </h1>
            <p className="biblia-translations-lead">
              La Palabra de Dios en tu idioma. Lee, estudia y medita las Escrituras
              con traducciones confiables y fieles al texto.
            </p>
            <LineDiamondOrnament className="biblia-intro-title-ornament" />
          </header>
        </div>
      </section>

      <section className="biblia-translation-picker" aria-labelledby="biblia-picker-heading">
        <header className="biblia-picker-heading">
          <h2 id="biblia-picker-heading">Elige una traducción</h2>
          <p>
            Selecciona la traducción que deseas leer. Seguiremos añadiendo más
            traducciones en el futuro para que tengas acceso a la Palabra en
            diferentes idiomas y enfoques.
          </p>
        </header>

        <div className="biblia-translations-grid">
          {translations.map((translation) => (
            <FeaturedTranslationCard key={translation.language} translation={translation} />
          ))}
          <ComingSoonCard />
          <ComingSoonCard />
        </div>

        <div className="biblia-suggestion-banner">
          <div className="biblia-suggestion-icon" aria-hidden>
            <span>†</span>
          </div>
          <div className="biblia-suggestion-copy">
            <p>Nuestro deseo es poner la Palabra de Dios al alcance de todos.</p>
            <strong>Si tienes sugerencias de traducciones, háznoslo saber.</strong>
          </div>
          <Link href="#" className="biblia-suggestion-button">
            <MessageCircle className="h-4 w-4" strokeWidth={1.7} aria-hidden />
            Enviar sugerencia
          </Link>
        </div>
      </section>
    </div>
  );
}
