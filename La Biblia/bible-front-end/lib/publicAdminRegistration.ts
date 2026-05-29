/** Server-side: public self-registration for admin users (off by default). */
export function isPublicAdminRegistrationEnabled(): boolean {
  return process.env.ALLOW_PUBLIC_ADMIN_REGISTRATION === "true";
}

/** Client-visible flag (must match server intent in production). */
export function isPublicAdminRegistrationEnabledClient(): boolean {
  return process.env.NEXT_PUBLIC_ALLOW_PUBLIC_ADMIN_REGISTRATION === "true";
}
