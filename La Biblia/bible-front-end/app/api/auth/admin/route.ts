import { NextRequest, NextResponse } from "next/server";
import {
  ADMIN_COOKIE_NAME,
  AdminSessionConfigError,
  adminCookieOptions,
  createSessionToken,
  verifySessionToken,
} from "@/lib/adminSession";
import { getClientIp, isLoginRateLimited, loginRateLimitRetryAfterSeconds } from "@/lib/loginRateLimit";
import { isPublicAdminRegistrationEnabled } from "@/lib/publicAdminRegistration";
import {
  findUserByEmail,
  hashPassword,
  isValidEmail,
  normalizeEmail,
  toClientRole,
  verifyPassword,
} from "@/lib/authUsers";
import { prisma } from "@/lib/prisma";

function sessionConfigErrorResponse(error: AdminSessionConfigError) {
  return NextResponse.json(
    {
      error:
        "El servidor no tiene configurado ADMIN_SESSION_SECRET (mínimo 32 caracteres). Revisa .env.example.",
      code: "ADMIN_SESSION_SECRET_MISSING",
    },
    { status: 503 },
  );
}

function internalErrorResponse() {
  return NextResponse.json({ error: "Error interno del servidor." }, { status: 500 });
}

export async function GET(req: NextRequest) {
  try {
    const session = verifySessionToken(req.cookies.get(ADMIN_COOKIE_NAME)?.value);
    return NextResponse.json({
      isAuthenticated: Boolean(session),
      isAdmin: session?.role === "admin",
      email: session?.email ?? null,
      role: session?.role ?? null,
      allowRegistration: isPublicAdminRegistrationEnabled(),
    });
  } catch (error) {
    if (error instanceof AdminSessionConfigError) return sessionConfigErrorResponse(error);
    console.error(error);
    return internalErrorResponse();
  }
}

export async function POST(req: NextRequest) {
  try {
  const ip = getClientIp(req);
  if (isLoginRateLimited(ip)) {
    const retryAfter = loginRateLimitRetryAfterSeconds(ip);
    return NextResponse.json(
      { error: "Demasiados intentos. Espera un momento e inténtalo de nuevo." },
      {
        status: 429,
        headers: { "Retry-After": String(retryAfter) },
      },
    );
  }

  let body: { email?: string; password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Solicitud invalida." }, { status: 400 });
  }

  const email = normalizeEmail(body.email ?? "");
  const password = body.password ?? "";
  if (!isValidEmail(email) || !password) {
    return NextResponse.json({ error: "Debes indicar correo y contraseña válidos." }, { status: 400 });
  }

  const user = await findUserByEmail(email);
  if (!user || !user.passwordHash || !verifyPassword(password, user.passwordHash)) {
    return NextResponse.json({ error: "Credenciales incorrectas." }, { status: 401 });
  }

  const role = toClientRole(user.role);
  const token = createSessionToken({ role, email: user.email });
  const response = NextResponse.json({ ok: true, role, email: user.email, isAdmin: role === "admin" });
  response.cookies.set(ADMIN_COOKIE_NAME, token, adminCookieOptions());
  return response;
  } catch (error) {
    if (error instanceof AdminSessionConfigError) return sessionConfigErrorResponse(error);
    console.error(error);
    return internalErrorResponse();
  }
}

export async function PUT(req: NextRequest) {
  try {
  if (!isPublicAdminRegistrationEnabled()) {
    return NextResponse.json({ error: "El registro público está deshabilitado." }, { status: 403 });
  }

  let body: { email?: string; password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Solicitud invalida." }, { status: 400 });
  }

  const email = normalizeEmail(body.email ?? "");
  const password = body.password ?? "";
  if (!isValidEmail(email)) {
    return NextResponse.json({ error: "El correo electrónico no es válido." }, { status: 400 });
  }
  if (password.length < 8) {
    return NextResponse.json({ error: "La contraseña debe tener al menos 8 caracteres." }, { status: 400 });
  }

  const exists = await findUserByEmail(email);
  if (exists) {
    return NextResponse.json({ error: "Ya existe un usuario con este correo." }, { status: 409 });
  }

  const created = await prisma.adminUser.create({
    data: {
      email,
      passwordHash: hashPassword(password),
      role: "USER",
    },
  });

  const role = toClientRole(created.role);
  return NextResponse.json({ ok: true, role, email: created.email, isAdmin: false });
  } catch (error) {
    if (error instanceof AdminSessionConfigError) return sessionConfigErrorResponse(error);
    console.error(error);
    return internalErrorResponse();
  }
}

export async function DELETE() {
  try {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(ADMIN_COOKIE_NAME, "", { ...adminCookieOptions(), maxAge: 0 });
  return response;
  } catch (error) {
    if (error instanceof AdminSessionConfigError) return sessionConfigErrorResponse(error);
    console.error(error);
    return internalErrorResponse();
  }
}
