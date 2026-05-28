import { NextRequest, NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/adminSession";
import {
  deletePredicacionVideo,
  updatePredicacionVideo,
} from "@/lib/predicacionesVideosServer";

type Params = { params: Promise<{ id: string }> };

export async function PUT(req: NextRequest, { params }: Params) {
  if (!isAdminRequest(req)) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const { id } = await params;

  try {
    const body = (await req.json()) as Partial<{ title: string; url: string }>;
    const patch: Partial<{ title: string; url: string }> = {};
    if (typeof body.title === "string") patch.title = body.title;
    if (typeof body.url === "string") patch.url = body.url;

    const video = await updatePredicacionVideo(id, patch);
    return NextResponse.json({ video });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "No se pudo actualizar el video." },
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
    await deletePredicacionVideo(id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "No se pudo borrar el video." },
      { status: 500 },
    );
  }
}
