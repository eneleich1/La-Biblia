import { BibliaTranslationsIndex } from "@/components/bible/BibliaTranslationsIndex";
import { getStaticTranslations } from "@/lib/staticBible";

export const dynamic = "force-static";

export default async function BibliaIndexPage() {
  const langs = await getStaticTranslations();

  if (langs.length === 0) {
    return (
      <div className="mx-auto w-full max-w-6xl rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        No hay traducciones estaticas generadas. Ejecuta{" "}
        <code className="rounded bg-white px-1">npm run bible:static</code>.
      </div>
    );
  }

  return <BibliaTranslationsIndex translations={langs} />;
}
