import { notFound } from "next/navigation";
import { iglesiaGuideTopicPages } from "@/data/iglesiaGuideTopics";
import { getSaintsApologeticTopic } from "@/data/apologetics/saintsTopics";
import { ApologeticTopicLayout } from "@/components/apologetics/ApologeticTopicLayout";
import { SaintsCatholicArgumentsLayout } from "@/components/apologetics/SaintsCatholicArgumentsLayout";
import { SaintsCultExamplesLayout } from "@/components/apologetics/SaintsCultExamplesLayout";
import { SaintsRefutationsLayout } from "@/components/apologetics/SaintsRefutationsLayout";
import { getSaintsGuideTopicContent } from "@/data/saintsGuideTopicContent";
import { fixSpanishEncoding } from "@/lib/fixSpanishEncoding";
import { linkifyBibleReferencesInHtml } from "@/lib/linkifyBibleReferences";
import { getStaticBooks } from "@/lib/staticBible";

export function generateStaticParams() {
  return iglesiaGuideTopicPages.map((topic) => ({ topicSlug: topic.slug }));
}

export default async function SaintsGuideTopicPage({
  params,
}: {
  params: Promise<{ topicSlug: string }>;
}) {
  const { topicSlug } = await params;
  const topic = getSaintsApologeticTopic(topicSlug);
  if (!topic) notFound();
  const bibleBooks = await getStaticBooks("es");

  const books = bibleBooks.map((book) => ({ slug: book.slug, nameEs: book.nameEs }));
  const parsedTopic = {
    ...topic,
    sections: topic.sections.map((section) =>
      section.html
        ? {
            ...section,
            html: linkifyBibleReferencesInHtml(fixSpanishEncoding(section.html), books),
          }
        : section,
    ),
  };

  if (topicSlug === "ejemplo-de-culto-a-los-santos") {
    return (
      <SaintsCultExamplesLayout
        title={topic.title}
        subtitle={topic.subtitle}
        parent={topic.parent}
        backLabel={topic.backLabel}
      />
    );
  }

  if (topicSlug === "argumentos-de-la-iglesia-catolica-para-permitir-el-culto-a-los-santos") {
    return (
      <SaintsCatholicArgumentsLayout
        title={topic.title}
        subtitle={topic.subtitle}
        parent={topic.parent}
        backLabel={topic.backLabel}
        Icon={topic.icon}
        books={books}
      />
    );
  }

  if (topicSlug === "refutaciones-argumentos-iglesia-catolica") {
    const content = getSaintsGuideTopicContent(topicSlug);
    const html = content?.html ? fixSpanishEncoding(content.html) : "";

    return (
      <SaintsRefutationsLayout
        title={topic.title}
        subtitle={topic.subtitle}
        parent={topic.parent}
        backLabel={topic.backLabel}
        Icon={topic.icon}
        html={html}
        books={books}
      />
    );
  }

  return <ApologeticTopicLayout topic={parsedTopic} books={books} />;
}
