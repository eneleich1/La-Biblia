import Link from "next/link";
import { ArrowRight, BookOpenText, Cross, ScrollText } from "lucide-react";
import { getSermonPage, sermonPages, type SermonPage } from "@/data/sermons";

const sermons = sermonPages
  .map((page) => getSermonPage(page.slug))
  .filter((page): page is SermonPage => Boolean(page));

export default function PredicacionesIndexPage() {
  const featuredSermon = sermons[0];

  return (
    <div className="sermons-index-page">
      <header className="sermons-index-header">
        <h1>Predicaciones</h1>
        <p>Reflexiones y enseñanzas para edificación y crecimiento espiritual.</p>
      </header>

      {featuredSermon ? (
        <>
          <section className="sermons-feature-banner" aria-label="Llamado a predicar">
            <span className="sermons-feature-icon" aria-hidden="true">
              <Cross />
            </span>
            <span className="sermons-feature-copy">
              <span className="sermons-feature-title">
                Cristo nos mandó a predicar su Palabra.
              </span>
              <span className="sermons-feature-text">
                La predicación anuncia el Evangelio, llama al arrepentimiento y edifica
                a la iglesia para permanecer firme en la verdad.
              </span>
              <span className="sermons-feature-reference">
                <BookOpenText aria-hidden="true" />
                Marcos 16:15
              </span>
            </span>
          </section>

          <section className="sermons-list-section" aria-labelledby="sermons-list-title">
            <div className="sermons-list-heading">
              <h2 id="sermons-list-title">Predicaciones disponibles</h2>
              <span>Mostrando {sermons.length} de {sermons.length}</span>
            </div>

            <ul className="sermons-card-grid">
              {sermons.map((sermon) => (
                <li key={sermon.slug}>
                  <Link href={`/predicaciones/${sermon.slug}`} className="sermons-card">
                    <span className="sermons-card-icon" aria-hidden="true">
                      <ScrollText />
                    </span>
                    <span className="sermons-card-body">
                      <span className="sermons-card-title">{sermon.title}</span>
                      <span className="sermons-card-reference">{sermon.reference}</span>
                      <span className="sermons-card-summary">
                        La obediencia trae vida y seguridad. Dios nos edifica cuando
                        permanecemos en su Palabra.
                      </span>
                      <span className="sermons-card-action">
                        Leer predicación
                        <ArrowRight aria-hidden="true" />
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        </>
      ) : null}
    </div>
  );
}
