import { NextRequest, NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/adminSession";
import { deleteSitePage, getSitePageById, updateSitePage } from "@/lib/sitePagesServer";
import type { SitePage } from "@/lib/sitePageTypes";

type Params = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, { params }: Params) {
  const { id } = await params;
  try {
    const page = await getSitePageById(id);
    if (!page) return NextResponse.json({ error: "No encontrada." }, { status: 404 });
    if (page.status === "DRAFT" && !isAdminRequest(req)) {
      return NextResponse.json({ error: "No encontrada." }, { status: 404 });
    }
    return NextResponse.json({ page });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error de base de datos." }, { status: 503 });
  }
}

export async function PUT(req: NextRequest, { params }: Params) {
  if (!isAdminRequest(req)) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const { id } = await params;
  try {
    const body = (await req.json()) as Partial<SitePage>;
    const page = await updateSitePage(id, body);
    return NextResponse.json({ page });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "No se pudo actualizar." },
      { status: 500 },
    );
  }
}

export async function DELETE(req: NextRequest, { params }: Params) {
  if (!isAdminRequest(req)) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const { id } = await params;
  try {
    await deleteSitePage(id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "No se pudo eliminar." }, { status: 500 });
  }
}
