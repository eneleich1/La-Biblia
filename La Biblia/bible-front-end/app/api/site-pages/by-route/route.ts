import { NextRequest, NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/adminSession";
import { getSitePageByRoute } from "@/lib/sitePagesServer";

export async function GET(req: NextRequest) {
  const route = req.nextUrl.searchParams.get("route") ?? "";
  const includeDrafts = req.nextUrl.searchParams.get("drafts") === "1" && isAdminRequest(req);

  try {
    const page = await getSitePageByRoute(route, includeDrafts);
    if (!page) return NextResponse.json({ error: "No encontrada." }, { status: 404 });
    return NextResponse.json({ page });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "No se pudo leer la base de datos." },
      { status: 503 },
    );
  }
}
