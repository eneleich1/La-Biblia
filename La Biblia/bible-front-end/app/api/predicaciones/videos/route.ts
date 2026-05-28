import { NextRequest, NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/adminSession";
import {
  createPredicacionVideo,
  listPredicacionesVideos,
} from "@/lib/predicacionesVideosServer";

export async function GET() {
  try {
    const videos = await listPredicacionesVideos();
    return NextResponse.json({ videos });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ videos: [] });
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

    const video = await createPredicacionVideo({ title, url });
    return NextResponse.json({ video }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "No se pudo crear el video." },
      { status: 500 },
    );
  }
}
