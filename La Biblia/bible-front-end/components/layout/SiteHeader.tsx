import Link from "next/link";

export function SiteHeader() {
  const links = [
    { href: "/", label: "Inicio" },
    { href: "/biblia", label: "Biblia" },
    { href: "/buscar", label: "Buscar" },
    { href: "/audio", label: "Audio" },
    { href: "/lecturas-del-dia", label: "Lecturas" },
    { href: "/estudios", label: "Estudios" },
    { href: "/apologetica", label: "Apologética" },
    { href: "/predicaciones", label: "Predicaciones" },
    { href: "/debates", label: "Debates" },
    { href: "/admin", label: "Admin" },
  ];

  return (
    <header className="border-b border-accent-soft bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-3">
        <Link href="/" className="text-lg font-semibold text-accent">
          Biblia · Plataforma
        </Link>
        <nav className="flex flex-wrap justify-end gap-x-4 gap-y-2 text-sm text-ink-muted">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="hover:text-accent"
            >
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
