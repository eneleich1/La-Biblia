import { NextRequest, NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/adminSession";
import { deleteSaintsCultVideo, updateSaintsCultVideo } from "@/lib/saintsCultVideosServer";
import { isSaintsCultTopicId } from "@/data/saintsCultVideosDefaults";

type Params = { params: Promise<{ id: string }> };

export async function PUT(req: NextRequest, { params }: Params) {
  if (!isAdminRequest(req)) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const { id } = await params;

  try {
    const body = (await req.json()) as Partial<{
      topicId: string;
      title: string;
      url: string;
      tag: string | null;
    }>;
    const patch: Partial<{ topicId: string; title: string; url: string; tag: string | null }> = {};

    if (typeof body.topicId === "string") {
      if (!isSaintsCultTopicId(body.topicId.trim())) {
        return NextResponse.json({ error: "Tema no válido." }, { status: 400 });
      }
      patch.topicId = body.topicId.trim();
    }
    if (typeof body.title === "string") patch.title = body.title;
    if (typeof body.url === "string") patch.url = body.url;
    if (body.tag !== undefined) {
      patch.tag = body.tag === null ? null : String(body.tag).trim() || null;
    }

    const video = await updateSaintsCultVideo(id, patch);
    return NextResponse.json({ video });
  } catch (error) {
    console.error(error);
    const message =
      error instanceof Error ? error.message : "No se pudo actualizar el video.";
    const status = message.includes("Recarga la página") ? 409 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function DELETE(req: NextRequest, { params }: Params) {
  if (!isAdminRequest(req)) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const { id } = await params;

  try {
    await deleteSaintsCultVideo(id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    const message = error instanceof Error ? error.message : "No se pudo borrar el video.";
    const status = message.includes("Recarga la página") ? 409 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
