import { notFound } from "next/navigation";
import { iglesiaGuideTopicPages } from "@/data/iglesiaGuideTopics";
import { getSaintsApologeticTopic } from "@/data/apologetics/saintsTopics";
import { ApologeticTopicLayout } from "@/components/apologetics/ApologeticTopicLayout";
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

  return <ApologeticTopicLayout topic={parsedTopic} books={books} />;
}
