import { createHmac, timingSafeEqual } from "crypto";
import type { NextRequest } from "next/server";

export const ADMIN_COOKIE_NAME = "sot_admin";

export const SESSION_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

export type SessionRole = "admin" | "user";
export type SessionPayload = {
  role: SessionRole;
  email: string;
  issuedAt: number;
};

export class AdminSessionConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AdminSessionConfigError";
  }
}

function getSessionSecret(): string {
  const secret = process.env.ADMIN_SESSION_SECRET?.trim();
  if (process.env.NODE_ENV === "production") {
    if (!secret || secret.length < 32) {
      throw new AdminSessionConfigError(
        "ADMIN_SESSION_SECRET must be set to at least 32 characters in production.",
      );
    }
    return secret;
  }
  if (!secret || secret.length < 32) {
    throw new AdminSessionConfigError(
      "ADMIN_SESSION_SECRET must be set to at least 32 characters (see .env.example).",
    );
  }
  return secret;
}

function sign(payload: string) {
  return createHmac("sha256", getSessionSecret()).update(payload).digest("base64url");
}

function trySign(payload: string): string | null {
  try {
    return sign(payload);
  } catch (error) {
    if (error instanceof AdminSessionConfigError) return null;
    throw error;
  }
}

export function adminCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict" as const,
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  };
}

export function createSessionToken(session: { role: SessionRole; email: string }) {
  const payload = Buffer.from(
    JSON.stringify({
      role: session.role,
      email: session.email,
      issuedAt: Date.now(),
    } satisfies SessionPayload),
  ).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

function isSessionExpired(issuedAt: number): boolean {
  return Date.now() - issuedAt > SESSION_MAX_AGE_MS;
}

export function verifySessionToken(token: string | undefined | null): SessionPayload | null {
  if (!token) return null;
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return null;
  const expected = trySign(payload);
  if (!expected) return null;
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
      const issuedAt = typeof decoded.issuedAt === "number" ? decoded.issuedAt : 0;
      if (!issuedAt || isSessionExpired(issuedAt)) return null;
      return {
        role: decoded.role,
        email: decoded.email.trim().toLowerCase(),
        issuedAt,
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
