import { randomBytes, scryptSync, timingSafeEqual } from "crypto";
import { prisma } from "@/lib/prisma";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type AuthUserRole = "admin" | "user";

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function isValidEmail(email: string) {
  return EMAIL_PATTERN.test(normalizeEmail(email));
}

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, encoded: string) {
  const [salt, stored] = encoded.split(":");
  if (!salt || !stored) return false;
  const hash = scryptSync(password, salt, 64);
  const storedBuffer = Buffer.from(stored, "hex");
  if (hash.length !== storedBuffer.length) return false;
  return timingSafeEqual(hash, storedBuffer);
}

export async function findUserByEmail(email: string) {
  return prisma.adminUser.findUnique({ where: { email: normalizeEmail(email) } });
}

export function toClientRole(role: "ADMIN" | "USER"): AuthUserRole {
  return role === "ADMIN" ? "admin" : "user";
}
