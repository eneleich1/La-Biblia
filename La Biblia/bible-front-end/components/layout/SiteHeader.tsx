"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  BookOpen,
  BookOpenCheck,
  CalendarDays,
  GraduationCap,
  Headphones,
  Home,
  Menu,
  MessagesSquare,
  Mic,
  Search,
  ShieldCheck,
  User,
  X,
} from "lucide-react";
import { ThemeSettings } from "@/components/theme/ThemeSettings";

type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
};

const mainNav: NavItem[] = [
  { href: "/", label: "Inicio", icon: Home },
  { href: "/biblia", label: "Biblia", icon: BookOpen },
  { href: "/buscar", label: "Buscar", icon: Search },
  { href: "/audio", label: "Audio", icon: Headphones },
  { href: "/lecturas-del-dia", label: "Lecturas", icon: CalendarDays },
  { href: "/estudios", label: "Estudios", icon: GraduationCap },
  { href: "/apologetica", label: "Apologética", icon: ShieldCheck },
  { href: "/predicaciones", label: "Predicaciones", icon: Mic },
  { href: "/debates", label: "Debates", icon: MessagesSquare },
];

function navIsActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function MobileMenu({
  pathname,
  open,
  onClose,
}: {
  pathname: string;
  open: boolean;
  onClose: () => void;
}) {
  if (!open) return null;

  return (
    <nav
      className="mx-auto max-w-[1500px] border-t border-[var(--border)]/70 bg-white/95 px-4 py-4 shadow-[0_18px_36px_-32px_rgba(11,45,97,0.55)] lg:hidden"
      aria-label="Principal"
    >
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {mainNav.map(({ href, label, icon: Icon }) => {
          const active = navIsActive(pathname, href);
          return (
            <Link
              key={href}
              href={href}
              onClick={onClose}
              className={`inline-flex items-center gap-2 rounded-lg px-3 py-3 text-sm font-medium no-underline transition visited:text-[var(--text-muted)] ${
                active
                  ? "bg-[var(--accent-soft)] text-[var(--accent)]"
                  : "text-[var(--text-muted)] hover:bg-[var(--accent-soft)] hover:text-[var(--text)]"
              }`}
            >
              <Icon className="h-5 w-5" strokeWidth={1.6} aria-hidden />
              <span>{label}</span>
            </Link>
          );
        })}
        <Link
          href="/admin"
          onClick={onClose}
          className={`inline-flex items-center gap-2 rounded-lg px-3 py-3 text-sm font-medium no-underline transition visited:text-[var(--text-muted)] ${
            navIsActive(pathname, "/admin")
              ? "bg-[var(--accent-soft)] text-[var(--accent)]"
              : "text-[var(--text-muted)] hover:bg-[var(--accent-soft)] hover:text-[var(--text)]"
          }`}
        >
          <User className="h-5 w-5" strokeWidth={1.6} aria-hidden />
          <span>Admin</span>
        </Link>
      </div>
    </nav>
  );
}

export function SiteHeader() {
  const pathname = usePathname() ?? "/";
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-[var(--background)]/85 px-1 pt-2 backdrop-blur-xl">
      <div className="mx-auto max-w-[1500px] rounded-lg border border-white/80 bg-white/90 px-4 shadow-[0_12px_36px_-28px_rgba(11,45,97,0.55)] sm:px-8 lg:px-12">
        <div className="flex min-h-[86px] flex-wrap items-center justify-between gap-x-5 gap-y-3 py-3 lg:min-h-[92px] lg:flex-nowrap lg:gap-y-0">
          <Link
            href="/"
            className="group flex max-w-full shrink-0 items-center gap-3.5 text-[var(--text)] no-underline sm:gap-4 lg:max-w-[22rem]"
          >
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-none text-[var(--accent)] transition sm:h-14 sm:w-14">
              <BookOpenCheck className="h-11 w-11 sm:h-12 sm:w-12" strokeWidth={1.65} aria-hidden />
            </span>
            <span className="min-w-0 leading-tight">
              <span className="font-serif-display block text-[1.55rem] font-semibold tracking-normal text-[var(--text)] sm:text-[2rem] lg:text-[2rem] xl:text-[2.15rem]">
                Seek of Truth
              </span>
              <span className="mt-0.5 block text-[9px] font-semibold uppercase leading-snug tracking-[0.19em] text-[var(--accent)] sm:text-[11px] sm:tracking-[0.2em]">
                Plataforma Bíblica Cristiana
              </span>
            </span>
          </Link>

          <div className="hidden min-w-0 flex-1 basis-0 items-center justify-end gap-x-3 lg:flex">
            <nav className="min-w-0" aria-label="Principal">
                <ul className="flex items-center justify-end gap-x-2.5 xl:gap-x-3.5 2xl:gap-x-4">
                  {mainNav.map(({ href, label, icon: Icon }) => {
                    const active = navIsActive(pathname, href);
                    return (
                      <li key={href} className="shrink-0">
                        <Link
                          href={href}
                          className={`group relative inline-flex items-center gap-1 whitespace-nowrap px-0 py-2 text-[11px] font-medium tracking-normal text-[var(--text)] no-underline visited:text-[var(--text)] transition xl:text-[12px] 2xl:text-[13px] ${
                            active
                              ? "text-[var(--accent)]"
                              : "text-[var(--text-muted)] hover:text-[var(--text)]"
                          }`}
                        >
                          <Icon
                            className="hidden h-3.5 w-3.5 shrink-0 opacity-80 xl:block"
                            strokeWidth={1.65}
                            aria-hidden
                          />
                          <span>{label}</span>
                          <span
                            className={`absolute bottom-0 left-1.5 right-1.5 h-0.5 rounded-full bg-[var(--accent)] transition ${
                              active ? "opacity-100" : "opacity-0 group-hover:opacity-40"
                            }`}
                            aria-hidden
                          />
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </nav>

              <div className="flex shrink-0 items-center justify-end gap-2 border-[var(--border)] lg:border-l lg:pl-3">
                <ThemeSettings />
                <Link
                  href="/admin"
                  className="inline-flex items-center gap-1 rounded-md px-1.5 py-1.5 text-[11px] font-medium text-[var(--text-muted)] no-underline visited:text-[var(--text-muted)] transition hover:bg-[var(--accent-soft)] xl:text-[12px] 2xl:text-[13px]"
                >
                  <User className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden />
                  <span>Admin</span>
                </Link>
              </div>
          </div>

          <div className="flex shrink-0 items-center gap-1.5 lg:hidden">
            <ThemeSettings />
            <button
              type="button"
              onClick={() => setMenuOpen((current) => !current)}
              className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-[var(--border)] bg-white text-[var(--text)] shadow-[var(--shadow-card)] transition hover:border-[var(--accent)]/40"
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
            >
              {menuOpen ? (
                <X className="h-5 w-5" strokeWidth={1.8} aria-hidden />
              ) : (
                <Menu className="h-5 w-5" strokeWidth={1.8} aria-hidden />
              )}
            </button>
          </div>
        </div>
      </div>

      <div id="mobile-menu">
        <MobileMenu
          pathname={pathname}
          open={menuOpen}
          onClose={() => setMenuOpen(false)}
        />
      </div>
    </header>
  );
}
