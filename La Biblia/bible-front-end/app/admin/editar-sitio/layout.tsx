import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_COOKIE_NAME, verifySessionToken } from "@/lib/adminSession";

export default async function EditSiteAdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const session = verifySessionToken(cookieStore.get(ADMIN_COOKIE_NAME)?.value);
  if (!session || session.role !== "admin") {
    redirect("/admin");
  }
  return children;
}
