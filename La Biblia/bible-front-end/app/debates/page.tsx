import Link from "next/link";

export default function DebatesIndexPage() {
  return (
    <div className="space-y-4">
      <h1 className="page-title">Debates</h1>
      <Link href="/debates/ejemplo" className="text-accent underline">
        Debate de ejemplo
      </Link>
    </div>
  );
}
