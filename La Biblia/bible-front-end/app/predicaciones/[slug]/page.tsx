import Link from "next/link";
import { notFound } from "next/navigation";
import { BookOpen, Cross, HandHeart, Hourglass } from "lucide-react";
import { getSermonPage } from "@/data/sermons";

const sectionIcons = {
  hourglass: Hourglass,
  book: BookOpen,
  cross: Cross,
  hands: HandHeart,
};

export default async function PredicacionPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const sermon = getSermonPage(slug);
  if (!sermon) notFound();

  return (
    <article className="mx-auto max-w-[1500px] space-y-5">
      <Link href="/predicaciones" className="scripture-back-link">
        Predicaciones
      </Link>
      <div className="sermon-sheet">
        <header className="sermon-header">
          <div className="scripture-flourish" aria-hidden="true">
            <span />
          </div>
          <p className="sermon-kicker">Predicación 1</p>
          <h1>
            <span>Predicación 1:</span> {sermon.reference}
          </h1>
          <div className="sermon-title-rule" aria-hidden="true" />
          <p className="sermon-subtitle">{sermon.subtitle}</p>
        </header>

        <div className="sermon-section-stack">
          {sermon.sections.map((section, index) => {
            const Icon = sectionIcons[section.icon];

            return (
              <section className="sermon-section" key={section.title}>
                <div className="sermon-section-icon" aria-hidden="true">
                  <Icon />
                </div>
                <div className="sermon-section-body">
                  <h2>
                    {index + 1}. {section.title}
                  </h2>
                  <ul
                    className="sermon-points"
                    data-columns={section.columns ?? 1}
                  >
                    {section.items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              </section>
            );
          })}
        </div>
      </div>
    </article>
  );
}
