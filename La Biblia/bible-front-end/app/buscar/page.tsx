import { BibleSearchClient } from "@/components/search/BibleSearchClient";
import { formatBookTitle } from "@/lib/formatTitle";
import { getStaticBook, getStaticBooks } from "@/lib/staticBible";

export const dynamic = "force-static";

export default async function BuscarPage() {
  const books = await getStaticBooks("es");
  const booksWithChapters = await Promise.all(
    books.map(async (book) => ({
      ...book,
      chapters: (await getStaticBook("es", book.slug)).chapters,
    })),
  );

  const bookOptions = booksWithChapters.map((book) => ({
    slug: book.slug,
    title: formatBookTitle(book.nameEs),
    testament: book.testament,
    chapters: book.chapters.map((chapter) => ({
      number: chapter.number,
      verseCount: chapter.verses.length,
    })),
  }));

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 pb-4">
      <header>
        <h1 className="page-title">Buscar en la Biblia</h1>
        <p className="mt-3 max-w-2xl text-base leading-relaxed text-[var(--text-muted)] sm:text-lg">
          Encuentra palabras, frases o referencias con una busqueda clara y rapida.
        </p>
      </header>
      <BibleSearchClient books={bookOptions} />
    </div>
  );
}
