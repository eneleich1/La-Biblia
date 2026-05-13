import Link from "next/link";

export default function PredicacionesIndexPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-accent">Predicaciones</h1>
      <Link href="/predicaciones/ejemplo" className="text-accent underline">
        Sermón de ejemplo
      </Link>
    </div>
  );
}
