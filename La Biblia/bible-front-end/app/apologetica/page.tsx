import Link from "next/link";

export default function ApologeticaIndexPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-accent">Apologética</h1>
      <Link href="/apologetica/ejemplo" className="text-accent underline">
        Artículo de ejemplo
      </Link>
    </div>
  );
}
