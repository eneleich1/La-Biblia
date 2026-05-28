import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AdminAuthForm } from "@/components/auth/AdminAuthForm";
import { ADMIN_COOKIE_NAME, verifySessionToken } from "@/lib/adminSession";

export default async function AdminPage() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(ADMIN_COOKIE_NAME)?.value;

  if (verifySessionToken(sessionToken)) {
    redirect("/");
  }

  return <AdminAuthForm />;
}
