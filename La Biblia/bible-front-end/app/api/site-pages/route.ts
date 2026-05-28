import { NextRequest, NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/adminSession";
import {
  createSitePage,
  listSitePages,
} from "@/lib/sitePagesServer";
import type { SitePage } from "@/lib/sitePageTypes";

export async function GET(req: NextRequest) {
  const includeDrafts = req.nextUrl.searchParams.get("drafts") === "1" && isAdminRequest(req);
  try {
    const pages = await listSitePages(includeDrafts);
    return NextResponse.json({ pages });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "No se pudo leer la base de datos. Ejecuta las migraciones de Prisma." },
      { status: 503 },
    );
  }
}

export async function POST(req: NextRequest) {
  if (!isAdminRequest(req)) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  try {
    const body = (await req.json()) as SitePage;
    const page = await createSitePage({
      ...body,
      status: body.status === "DRAFT" ? "DRAFT" : "PUBLISHED",
    });
    return NextResponse.json({ page }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "No se pudo crear la pagina." },
      { status: 500 },
    );
  }
}
