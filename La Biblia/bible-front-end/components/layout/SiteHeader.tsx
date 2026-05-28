"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  BookOpen,
  BookOpenCheck,
  GraduationCap,
  Headphones,
  Home,
  LogIn,
  LogOut,
  Menu,
  MessagesSquare,
  Mic,
  Search,
  ShieldCheck,
  User,
  X,
} from "lucide-react";
import { ThemeSettings } from "@/components/theme/ThemeSettings";
import {
  AUTH_SESSION_EVENT,
  clearAuthSession,
  notifyAuthSessionChange,
  readAuthSession,
} from "@/lib/clientAuth";
import { fetchAdminSession, logoutAdmin } from "@/lib/sitePagesApi";

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
      className="mx-auto max-w-[1840px] bg-white/95 px-4 py-4 shadow-[0_18px_36px_-32px_rgba(11,45,97,0.55)] lg:hidden"
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
            navIsActive(pathname, authHref)
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
  const [mobileUserMenuOpen, setMobileUserMenuOpen] = useState(false);
  const [desktopUserMenuOpen, setDesktopUserMenuOpen] = useState(false);
  const [authLabel, setAuthLabel] = useState("Iniciar sesión");
  const [authHref, setAuthHref] = useState("/admin");
  const [isAdmin, setIsAdmin] = useState(false);
  const [hasSession, setHasSession] = useState(false);
  const userMenuRef = useRef<HTMLDivElement | null>(null);
  const desktopUserMenuRef = useRef<HTMLDivElement | null>(null);

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
        setHasSession(false);
        return;
      }
      const admin = serverAdmin || session?.role === "admin";
      setAuthLabel(admin ? "Admin" : session?.email ?? "Usuario");
      setAuthHref("/");
      setIsAdmin(admin);
      setHasSession(true);
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

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (!userMenuRef.current) return;
      if (!userMenuRef.current.contains(event.target as Node)) {
        setMobileUserMenuOpen(false);
      }
      if (
        desktopUserMenuRef.current &&
        !desktopUserMenuRef.current.contains(event.target as Node)
      ) {
        setDesktopUserMenuOpen(false);
      }
    };
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMobileUserMenuOpen(false);
        setDesktopUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const handleHeaderLogout = async () => {
    try {
      await logoutAdmin();
    } catch {
      // ignore
    }
    clearAuthSession();
    notifyAuthSessionChange();
    setMobileUserMenuOpen(false);
    setDesktopUserMenuOpen(false);
    setMenuOpen(false);
  };

  return (
    <header className="fixed inset-x-0 top-0 z-50 bg-[var(--background)] px-1">
      <div className="mx-auto max-w-[1840px] rounded-lg bg-white/90 px-4 shadow-[0_12px_36px_-28px_rgba(11,45,97,0.55)] sm:px-8 lg:px-12">
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
                <div className="relative" ref={desktopUserMenuRef}>
                  {hasSession ? (
                    <button
                      type="button"
                      onClick={() => setDesktopUserMenuOpen((current) => !current)}
                      className="inline-flex items-center gap-1 rounded-md px-1.5 py-1.5 text-[11px] font-medium text-[var(--text-muted)] transition hover:bg-[var(--accent-soft)] xl:text-[12px] 2xl:text-[13px]"
                      aria-expanded={desktopUserMenuOpen}
                      aria-controls="desktop-user-menu"
                    >
                      <User className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden />
                      <span>{authLabel}</span>
                    </button>
                  ) : (
                    <Link
                      href={authHref}
                      className="inline-flex items-center gap-1 rounded-md px-1.5 py-1.5 text-[11px] font-medium text-[var(--text-muted)] no-underline visited:text-[var(--text-muted)] transition hover:bg-[var(--accent-soft)] xl:text-[12px] 2xl:text-[13px]"
                    >
                      <LogIn className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden />
                      <span>Iniciar sesión</span>
                    </Link>
                  )}
                  {hasSession && desktopUserMenuOpen ? (
                    <div
                      id="desktop-user-menu"
                      className="absolute right-0 top-[calc(100%+0.4rem)] z-50 min-w-[12rem] rounded-lg border border-[var(--border)] bg-white p-1.5 shadow-[0_18px_36px_-24px_rgba(11,45,97,0.45)]"
                      role="menu"
                      aria-label="Menú de usuario"
                    >
                      <button
                        type="button"
                        onClick={handleHeaderLogout}
                        className="flex w-full items-center gap-2 rounded-md px-3 py-2.5 text-left text-sm font-medium text-[var(--text-muted)] transition hover:bg-[var(--accent-soft)] hover:text-[var(--text)]"
                        role="menuitem"
                      >
                        <LogOut className="h-4 w-4" strokeWidth={1.7} aria-hidden />
                        <span>Cerrar sesión</span>
                      </button>
                    </div>
                  ) : null}
                </div>
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
            <div className="relative" ref={userMenuRef}>
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  setDesktopUserMenuOpen(false);
                  setMobileUserMenuOpen((current) => !current);
                }}
                className="group relative inline-flex h-11 w-11 items-center justify-center rounded-lg border border-[var(--border)] bg-white text-[var(--text)] shadow-[var(--shadow-card)] transition hover:border-[var(--accent)]/40"
                aria-expanded={mobileUserMenuOpen}
                aria-controls="mobile-user-menu"
                aria-label={hasSession ? `Cuenta: ${authLabel}` : "Cuenta"}
                title={hasSession ? authLabel : "Iniciar sesión"}
              >
                <User className="h-5 w-5" strokeWidth={1.8} aria-hidden />
                <span className="pointer-events-none absolute -bottom-8 left-1/2 hidden -translate-x-1/2 whitespace-nowrap rounded-md bg-[var(--text)] px-2 py-1 text-[11px] font-medium text-white shadow-md group-hover:block group-focus-visible:block">
                  {hasSession ? authLabel : "Iniciar sesión"}
                </span>
              </button>
              {mobileUserMenuOpen ? (
                <div
                  id="mobile-user-menu"
                  className="absolute right-0 top-[calc(100%+0.4rem)] z-50 min-w-[12rem] rounded-lg border border-[var(--border)] bg-white p-1.5 shadow-[0_18px_36px_-24px_rgba(11,45,97,0.45)]"
                  role="menu"
                  aria-label="Menú de usuario"
                >
                  {hasSession ? (
                    <button
                      type="button"
                      onClick={handleHeaderLogout}
                      className="flex w-full items-center gap-2 rounded-md px-3 py-2.5 text-left text-sm font-medium text-[var(--text-muted)] transition hover:bg-[var(--accent-soft)] hover:text-[var(--text)]"
                      role="menuitem"
                    >
                      <LogOut className="h-4 w-4" strokeWidth={1.7} aria-hidden />
                      <span>Cerrar sesión</span>
                    </button>
                  ) : (
                    <Link
                      href={authHref}
                      onClick={() => setMobileUserMenuOpen(false)}
                      className="flex items-center gap-2 rounded-md px-3 py-2.5 text-sm font-medium text-[var(--text-muted)] no-underline transition visited:text-[var(--text-muted)] hover:bg-[var(--accent-soft)] hover:text-[var(--text)]"
                      role="menuitem"
                    >
                      <LogIn className="h-4 w-4" strokeWidth={1.7} aria-hidden />
                      <span>Iniciar sesión</span>
                    </Link>
                  )}
                </div>
              ) : null}
            </div>
            <button
              type="button"
              onClick={() => {
                setMobileUserMenuOpen(false);
                setDesktopUserMenuOpen(false);
                setMenuOpen((current) => !current);
              }}
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
