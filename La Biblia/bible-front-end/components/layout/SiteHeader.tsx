"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  BookOpen,
  BookOpenCheck,
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
import { AUTH_SESSION_EVENT, readAuthSession } from "@/lib/clientAuth";
import { fetchAdminSession } from "@/lib/sitePagesApi";

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
  authLabel,
  authHref,
  isAdmin,
}: {
  pathname: string;
  open: boolean;
  onClose: () => void;
  authLabel: string;
  authHref: string;
  isAdmin: boolean;
}) {
  if (!open) return null;

  return (
    <nav
      className="mx-auto max-w-[1840px] border-t border-[var(--border)]/70 bg-white/95 px-4 py-4 shadow-[0_18px_36px_-32px_rgba(11,45,97,0.55)] lg:hidden"
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
          href={authHref}
          onClick={onClose}
          className={`inline-flex items-center gap-2 rounded-lg px-3 py-3 text-sm font-medium no-underline transition visited:text-[var(--text-muted)] ${
            navIsActive(pathname, "/admin")
              ? "bg-[var(--accent-soft)] text-[var(--accent)]"
              : "text-[var(--text-muted)] hover:bg-[var(--accent-soft)] hover:text-[var(--text)]"
          }`}
        >
          <User className="h-5 w-5" strokeWidth={1.6} aria-hidden />
          <span>{authLabel}</span>
        </Link>
        {isAdmin ? (
          <Link
            href="/admin/dashboard"
            onClick={onClose}
            className={`inline-flex items-center gap-2 rounded-lg px-3 py-3 text-sm font-medium no-underline transition visited:text-[var(--text-muted)] ${
              navIsActive(pathname, "/admin/dashboard")
                ? "bg-[var(--accent-soft)] text-[var(--accent)]"
                : "text-[var(--text-muted)] hover:bg-[var(--accent-soft)] hover:text-[var(--text)]"
            }`}
          >
            <ShieldCheck className="h-5 w-5" strokeWidth={1.6} aria-hidden />
            <span>Panel admin</span>
          </Link>
        ) : null}
      </div>
    </nav>
  );
}

export function SiteHeader() {
  const pathname = usePathname() ?? "/";
  const [menuOpen, setMenuOpen] = useState(false);
  const [authLabel, setAuthLabel] = useState("Iniciar sesión");
  const [authHref, setAuthHref] = useState("/admin");
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const syncSession = async () => {
      const session = readAuthSession();
      let serverAdmin = false;
      try {
        const data = await fetchAdminSession();
        serverAdmin = data.isAdmin;
      } catch {
        serverAdmin = false;
      }

      if (!session && !serverAdmin) {
        setAuthLabel("Iniciar sesión");
        setAuthHref("/admin");
        setIsAdmin(false);
        return;
      }
      const admin = serverAdmin || session?.role === "admin";
      setAuthLabel(admin ? "Admin" : session?.username ?? "Usuario");
      setAuthHref("/admin");
      setIsAdmin(admin);
    };

    void syncSession();
    window.addEventListener("storage", syncSession);
    window.addEventListener(AUTH_SESSION_EVENT, syncSession);
    window.addEventListener("seekoftruth-admin-session", syncSession);
    return () => {
      window.removeEventListener("storage", syncSession);
      window.removeEventListener(AUTH_SESSION_EVENT, syncSession);
      window.removeEventListener("seekoftruth-admin-session", syncSession);
    };
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-[var(--background)]/85 px-1 pt-1 backdrop-blur-xl">
      <div className="mx-auto max-w-[1840px] rounded-lg border border-white/80 bg-white/90 px-4 shadow-[0_12px_36px_-28px_rgba(11,45,97,0.55)] sm:px-8 lg:px-12">
        <div className="flex min-h-[62px] flex-wrap items-center justify-between gap-x-4 gap-y-2 py-2 lg:min-h-[68px] lg:flex-nowrap lg:gap-y-0">
          <Link
            href="/"
            className="group flex max-w-full shrink-0 items-center gap-2.5 text-[var(--text)] no-underline sm:gap-3 lg:max-w-[20rem]"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-none text-[var(--accent)] transition sm:h-11 sm:w-11">
              <BookOpenCheck className="h-9 w-9 sm:h-10 sm:w-10" strokeWidth={1.65} aria-hidden />
            </span>
            <span className="min-w-0 leading-tight">
              <span className="font-serif-display block text-[1.28rem] font-semibold tracking-normal text-[var(--text)] sm:text-[1.48rem] lg:text-[1.55rem] xl:text-[1.62rem]">
                Seek of Truth
              </span>
              <span className="mt-0.5 block text-[8px] font-semibold uppercase leading-snug tracking-[0.17em] text-[var(--accent)] sm:text-[10px] sm:tracking-[0.18em]">
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
                  href={authHref}
                  className="inline-flex items-center gap-1 rounded-md px-1.5 py-1.5 text-[11px] font-medium text-[var(--text-muted)] no-underline visited:text-[var(--text-muted)] transition hover:bg-[var(--accent-soft)] xl:text-[12px] 2xl:text-[13px]"
                >
                  <User className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden />
                  <span>{authLabel}</span>
                </Link>
                {isAdmin ? (
                  <Link
                    href="/admin/dashboard"
                    className="inline-flex items-center gap-1 rounded-md px-1.5 py-1.5 text-[11px] font-medium text-[var(--text-muted)] no-underline visited:text-[var(--text-muted)] transition hover:bg-[var(--accent-soft)] xl:text-[12px] 2xl:text-[13px]"
                  >
                    <ShieldCheck className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden />
                    <span>Panel admin</span>
                  </Link>
                ) : null}
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
          authLabel={authLabel}
          authHref={authHref}
          isAdmin={isAdmin}
        />
      </div>
    </header>
  );
}
