import { redirect } from "next/navigation";
import { getStaticBooks, getSupportedStaticLanguages } from "@/lib/staticBible";

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

export default async function AudioBookRedirectPage({
  params,
}: {
  params: Promise<{ language: string; bookSlug: string }>;
}) {
  const { language, bookSlug } = await params;
  redirect(`/audio/${language}/${bookSlug}/1`);
}
