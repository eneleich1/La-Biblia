import { NextRequest, NextResponse } from "next/server";
import {
  ADMIN_COOKIE_NAME,
  createSessionToken,
  verifySessionToken,
} from "@/lib/adminSession";
import {
  findUserByEmail,
  hashPassword,
  isValidEmail,
  normalizeEmail,
  toClientRole,
  verifyPassword,
} from "@/lib/authUsers";
import { prisma } from "@/lib/prisma";

const COOKIE_MAX_AGE = 60 * 60 * 24 * 7;

function adminCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: COOKIE_MAX_AGE,
  };
}

export async function GET(req: NextRequest) {
  const session = verifySessionToken(req.cookies.get(ADMIN_COOKIE_NAME)?.value);
  return NextResponse.json({
    isAuthenticated: Boolean(session),
    isAdmin: session?.role === "admin",
    email: session?.email ?? null,
    role: session?.role ?? null,
  });
}

export async function POST(req: NextRequest) {
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
}

export async function PUT(req: NextRequest) {
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
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(ADMIN_COOKIE_NAME, "", { ...adminCookieOptions(), maxAge: 0 });
  return response;
}
