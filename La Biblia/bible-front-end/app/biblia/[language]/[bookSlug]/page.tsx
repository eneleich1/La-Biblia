import { notFound, redirect } from "next/navigation";
import {
  getStaticBookSummary,
  getStaticBooks,
  getSupportedStaticLanguages,
  resolveStaticBookSlug,
} from "@/lib/staticBible";

export const dynamic = "force-static";

export async function generateStaticParams() {
  const params = await Promise.all(
    getSupportedStaticLanguages().map(async (language) => {
      const books = await getStaticBooks(language);
      return books.map((book) => ({ language, bookSlug: book.slug }));
    }),
  );
  return params.flat();
}

export default async function BookChaptersPage({
  params,
}: {
  params: Promise<{ language: string; bookSlug: string }>;
}) {
  const { language, bookSlug } = await params;
  const canonicalSlug = resolveStaticBookSlug(bookSlug);
  if (canonicalSlug !== bookSlug) {
    redirect(`/biblia/${language}/${canonicalSlug}/1`);
  }
  const book = await getStaticBookSummary(language, canonicalSlug);
  if (!book) notFound();
  redirect(`/biblia/${language}/${canonicalSlug}/1`);
}
