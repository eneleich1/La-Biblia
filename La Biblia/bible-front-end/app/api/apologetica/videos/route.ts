import { NextRequest, NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/adminSession";
import {
  createApologeticaVideo,
  listApologeticaVideos,
} from "@/lib/apologeticaVideosServer";
import { apologeticaVideosDefaults } from "@/data/apologeticaVideosDefaults";

export async function GET() {
  try {
    const videos = await listApologeticaVideos();
    return NextResponse.json({ videos });
  } catch (error) {
    console.error(error);
    // Fallback: if DB/migration is not ready, still return default videos.
    const fallbackVideos = apologeticaVideosDefaults.map((video, index) => ({
      id: `fallback-${index}`,
      title: video.title,
      url: video.url,
      position: index,
      createdAt: new Date(0).toISOString(),
      updatedAt: new Date(0).toISOString(),
    }));
    return NextResponse.json({ videos: fallbackVideos, fallback: true });
  }
}

export async function POST(req: NextRequest) {
  if (!isAdminRequest(req)) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  try {
    const body = (await req.json()) as Partial<{ title: string; url: string }>;
    const title = (body.title ?? "").trim();
    const url = (body.url ?? "").trim();

    if (!title || !url) {
      return NextResponse.json(
        { error: "Debes indicar titulo y enlace." },
        { status: 400 },
      );
    }

    const video = await createApologeticaVideo({ title, url });
    return NextResponse.json({ video }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "No se pudo crear el video." },
      { status: 500 },
    );
  }
}
