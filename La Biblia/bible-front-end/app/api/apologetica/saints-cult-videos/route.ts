import { NextRequest, NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/adminSession";
import {
  createSaintsCultVideo,
  listSaintsCultVideos,
  saintsCultVideosFallback,
} from "@/lib/saintsCultVideosServer";
import { isSaintsCultTopicId } from "@/data/saintsCultVideosDefaults";

export async function GET() {
  try {
    const videos = await listSaintsCultVideos();
    return NextResponse.json({ videos });
  } catch (error) {
    console.error(error);
    const message = error instanceof Error ? error.message : String(error);
    const prismaOutdated =
      message.includes("saintsCultExampleVideo") ||
      message.includes("Cannot read properties of undefined");
    return NextResponse.json({
      videos: saintsCultVideosFallback(),
      fallback: true,
      error: prismaOutdated
        ? "Reinicia el servidor de desarrollo (npm run dev) para activar la base de datos de videos."
        : undefined,
    });
  }
}

export async function POST(req: NextRequest) {
  if (!isAdminRequest(req)) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  try {
    const body = (await req.json()) as Partial<{
      topicId: string;
      title: string;
      url: string;
      tag: string | null;
    }>;
    const topicId = (body.topicId ?? "").trim();
    const title = (body.title ?? "").trim();
    const url = (body.url ?? "").trim();

    if (!topicId || !title || !url) {
      return NextResponse.json(
        { error: "Debes indicar tema, título y enlace." },
        { status: 400 },
      );
    }

    if (!isSaintsCultTopicId(topicId)) {
      return NextResponse.json({ error: "Tema no válido." }, { status: 400 });
    }

    const tag =
      body.tag === undefined || body.tag === null ? null : String(body.tag).trim() || null;

    const video = await createSaintsCultVideo({ topicId, title, url, tag });
    return NextResponse.json({ video }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "No se pudo crear el video." }, { status: 500 });
  }
}
