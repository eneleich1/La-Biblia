"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
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
  Share2,
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

const MOBILE_USER_MENU_MIN_WIDTH_PX = 192;
const MOBILE_USER_MENU_VIEWPORT_MARGIN_PX = 8;

async function copyCurrentPageUrl() {
  const url = window.location.href;
  try {
    await navigator.clipboard.writeText(url);
    return true;
  } catch {
    try {
      const textarea = document.createElement("textarea");
      textarea.value = url;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(textarea);
      return ok;
    } catch {
      return false;
    }
  }
}

function getMobileUserMenuPosition(anchor: HTMLElement) {
  const rect = anchor.getBoundingClientRect();
  let left = rect.left;
  if (left + MOBILE_USER_MENU_MIN_WIDTH_PX > window.innerWidth - MOBILE_USER_MENU_VIEWPORT_MARGIN_PX) {
    left = window.innerWidth - MOBILE_USER_MENU_MIN_WIDTH_PX - MOBILE_USER_MENU_VIEWPORT_MARGIN_PX;
  }
  left = Math.max(MOBILE_USER_MENU_VIEWPORT_MARGIN_PX, left);
  return { top: rect.bottom + 6, left };
}

function MobileMenu({
  pathname,
  open,
  onClose,
  authLabel,
  authHref,
  isAdmin,
  shareCopied,
  onShare,
}: {
  pathname: string;
  open: boolean;
  onClose: () => void;
  authLabel: string;
  authHref: string;
  isAdmin: boolean;
  shareCopied: boolean;
  onShare: () => void;
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
        <button
          type="button"
          onClick={onShare}
          className={`inline-flex items-center gap-2 rounded-lg px-3 py-3 text-sm font-medium transition ${
            shareCopied
              ? "bg-[var(--accent-soft)] text-[var(--accent)]"
              : "text-[var(--text-muted)] hover:bg-[var(--accent-soft)] hover:text-[var(--text)]"
          }`}
          aria-live="polite"
        >
          <Share2 className="h-5 w-5" strokeWidth={1.6} aria-hidden />
          <span>{shareCopied ? "Enlace copiado" : "Compartir"}</span>
        </button>
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
  const [portalMounted, setPortalMounted] = useState(false);
  const [mobileUserMenuPosition, setMobileUserMenuPosition] = useState({ top: 0, left: 0 });
  const [shareCopied, setShareCopied] = useState(false);
  const userMenuRef = useRef<HTMLDivElement | null>(null);
  const shareTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mobileUserMenuRef = useRef<HTMLDivElement | null>(null);
  const mobileUserButtonRef = useRef<HTMLButtonElement | null>(null);
  const desktopUserMenuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setPortalMounted(true);
  }, []);

  useLayoutEffect(() => {
    if (!mobileUserMenuOpen || !mobileUserButtonRef.current) return;

    const updatePosition = () => {
      if (!mobileUserButtonRef.current) return;
      setMobileUserMenuPosition(getMobileUserMenuPosition(mobileUserButtonRef.current));
    };

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [mobileUserMenuOpen]);

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
      const target = event.target as Node;
      const insideMobileUser =
        userMenuRef.current?.contains(target) || mobileUserMenuRef.current?.contains(target);
      if (!insideMobileUser) {
        setMobileUserMenuOpen(false);
      }
      if (
        desktopUserMenuRef.current &&
        !desktopUserMenuRef.current.contains(target)
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

  useEffect(() => {
    return () => {
      if (shareTimeoutRef.current) clearTimeout(shareTimeoutRef.current);
    };
  }, []);

  const handleSharePage = async () => {
    const ok = await copyCurrentPageUrl();
    if (!ok) return;
    if (shareTimeoutRef.current) clearTimeout(shareTimeoutRef.current);
    setShareCopied(true);
    shareTimeoutRef.current = setTimeout(() => setShareCopied(false), 2000);
  };

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
    <header className="fixed inset-x-0 top-0 z-50 overflow-visible bg-[var(--background)] px-1">
      <div className="mx-auto max-w-[1840px] overflow-visible rounded-lg bg-white/90 px-4 shadow-[0_12px_36px_-28px_rgba(11,45,97,0.55)] sm:px-8 lg:px-12">
        <div className="flex min-h-[62px] flex-nowrap items-center justify-between gap-x-2 py-2 sm:gap-x-4 lg:min-h-[68px]">
          <Link
            href="/"
            className="group flex min-w-0 flex-1 items-center gap-2 text-[var(--text)] no-underline sm:gap-3 lg:max-w-[20rem] lg:flex-none"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-none text-[var(--accent)] transition sm:h-11 sm:w-11">
              <BookOpenCheck className="h-8 w-8 sm:h-10 sm:w-10" strokeWidth={1.65} aria-hidden />
            </span>
            <span className="min-w-0 overflow-hidden leading-tight">
              <span className="font-serif-display block truncate text-[1.1rem] font-semibold tracking-normal text-[var(--text)] sm:text-[1.48rem] lg:text-[1.55rem] xl:text-[1.62rem]">
                Seek of Truth
              </span>
              <span className="mt-0.5 block truncate text-[7px] font-semibold uppercase leading-snug tracking-[0.14em] text-[var(--accent)] sm:text-[10px] sm:tracking-[0.18em]">
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
                  <li className="shrink-0">
                    <button
                      type="button"
                      onClick={() => void handleSharePage()}
                      className={`group relative inline-flex items-center gap-1 whitespace-nowrap px-0 py-2 text-[11px] font-medium tracking-normal transition xl:text-[12px] 2xl:text-[13px] ${
                        shareCopied
                          ? "text-[var(--accent)]"
                          : "text-[var(--text-muted)] hover:text-[var(--text)]"
                      }`}
                      aria-live="polite"
                    >
                      <Share2
                        className="hidden h-3.5 w-3.5 shrink-0 opacity-80 xl:block"
                        strokeWidth={1.65}
                        aria-hidden
                      />
                      <span>{shareCopied ? "Copiado" : "Compartir"}</span>
                      <span
                        className={`absolute bottom-0 left-1.5 right-1.5 h-0.5 rounded-full bg-[var(--accent)] transition ${
                          shareCopied ? "opacity-100" : "opacity-0 group-hover:opacity-40"
                        }`}
                        aria-hidden
                      />
                    </button>
                  </li>
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

          <div className="ml-1 flex shrink-0 items-center gap-1 sm:gap-1.5 lg:hidden">
            <ThemeSettings />
            <div className="relative shrink-0" ref={userMenuRef}>
              <button
                ref={mobileUserButtonRef}
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  setDesktopUserMenuOpen(false);
                  setMobileUserMenuOpen((current) => !current);
                }}
                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[var(--border)] bg-white text-[var(--text)] shadow-[var(--shadow-card)] transition hover:border-[var(--accent)]/40 sm:h-11 sm:w-11"
                aria-expanded={mobileUserMenuOpen}
                aria-controls="mobile-user-menu"
                aria-label={hasSession ? `Cuenta: ${authLabel}` : "Iniciar sesión"}
              >
                <User className="h-5 w-5" strokeWidth={1.8} aria-hidden />
              </button>
              {portalMounted &&
                mobileUserMenuOpen &&
                createPortal(
                  <div
                    ref={mobileUserMenuRef}
                    id="mobile-user-menu"
                    className="fixed z-[2147483646] min-w-[12rem] rounded-lg border border-[var(--border)] bg-white p-1.5 shadow-[0_18px_36px_-24px_rgba(11,45,97,0.45)]"
                    style={{
                      top: mobileUserMenuPosition.top,
                      left: mobileUserMenuPosition.left,
                    }}
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
                  </div>,
                  document.body,
                )}
            </div>
            <button
              type="button"
              onClick={() => {
                setMobileUserMenuOpen(false);
                setDesktopUserMenuOpen(false);
                setMenuOpen((current) => !current);
              }}
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[var(--border)] bg-white text-[var(--text)] shadow-[var(--shadow-card)] transition hover:border-[var(--accent)]/40 sm:h-11 sm:w-11"
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
          shareCopied={shareCopied}
          onShare={() => void handleSharePage()}
        />
      </div>
    </header>
  );
}
