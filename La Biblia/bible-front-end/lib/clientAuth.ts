export const AUTH_SESSION_KEY = "seekoftruth:auth-session";
export const ADMIN_SESSION_KEY = "seekoftruth:admin-session";
export const AUTH_SESSION_EVENT = "seekoftruth-auth-session";

export type AuthRole = "admin" | "user";

export type AuthSession = {
  role: AuthRole;
  email: string;
};

export function readAuthSession(): AuthSession | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(AUTH_SESSION_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<AuthSession> & { username?: string };
      const email = (parsed.email ?? parsed.username ?? "").trim().toLowerCase();
      if (
        parsed &&
        (parsed.role === "admin" || parsed.role === "user") &&
        email
      ) {
        return { role: parsed.role, email };
      }
    }
  } catch {
    window.localStorage.removeItem(AUTH_SESSION_KEY);
  }

  return null;
}

export function saveAuthSession(session: AuthSession) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(
    AUTH_SESSION_KEY,
    JSON.stringify({ role: session.role, email: session.email.trim().toLowerCase() }),
  );
  window.localStorage.removeItem(ADMIN_SESSION_KEY);
}

export function clearAuthSession() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(AUTH_SESSION_KEY);
  window.localStorage.removeItem(ADMIN_SESSION_KEY);
}

export function notifyAuthSessionChange() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(AUTH_SESSION_EVENT));
  window.dispatchEvent(new Event("seekoftruth-admin-session"));
}
