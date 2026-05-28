import { createHmac, timingSafeEqual } from "crypto";
import type { NextRequest } from "next/server";

export const ADMIN_COOKIE_NAME = "sot_admin";

const SECRET = process.env.ADMIN_SESSION_SECRET ?? "seekoftruth-dev-session-secret";

export type SessionRole = "admin" | "user";
export type SessionPayload = {
  role: SessionRole;
  email: string;
  issuedAt: number;
};

function sign(payload: string) {
  return createHmac("sha256", SECRET).update(payload).digest("base64url");
}

export function createSessionToken(session: { role: SessionRole; email: string }) {
  const payload = Buffer.from(
    JSON.stringify({ role: session.role, email: session.email, issuedAt: Date.now() } satisfies SessionPayload),
  ).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

export function verifySessionToken(token: string | undefined | null): SessionPayload | null {
  if (!token) return null;
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return null;
  const expected = sign(payload);
  try {
    const a = Buffer.from(signature);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
    const decoded = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as Partial<SessionPayload>;
    if (
      (decoded.role === "admin" || decoded.role === "user") &&
      typeof decoded.email === "string" &&
      decoded.email.trim()
    ) {
      return {
        role: decoded.role,
        email: decoded.email.trim().toLowerCase(),
        issuedAt: typeof decoded.issuedAt === "number" ? decoded.issuedAt : Date.now(),
      };
    }
    return null;
  } catch {
    return null;
  }
}

export function isAdminRequest(req: NextRequest) {
  return verifySessionToken(req.cookies.get(ADMIN_COOKIE_NAME)?.value)?.role === "admin";
}
