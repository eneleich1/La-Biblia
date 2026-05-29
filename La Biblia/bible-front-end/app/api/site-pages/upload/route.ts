import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { NextRequest, NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/adminSession";

const MAX_BYTES = 2 * 1024 * 1024;

const ALLOWED_MIME: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/webp": "webp",
};

export async function POST(req: NextRequest) {
  if (!isAdminRequest(req)) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  let dataUrl: string | undefined;
  try {
    const body = await req.json();
    dataUrl = body.dataUrl;
  } catch {
    return NextResponse.json({ error: "Solicitud invalida." }, { status: 400 });
  }

  if (!dataUrl?.startsWith("data:image/")) {
    return NextResponse.json({ error: "Imagen invalida." }, { status: 400 });
  }

  const match = /^data:(image\/[\w.+-]+);base64,(.+)$/i.exec(dataUrl);
  if (!match) {
    return NextResponse.json({ error: "Formato de imagen no soportado." }, { status: 400 });
  }

  const mime = match[1].toLowerCase();
  const extension = ALLOWED_MIME[mime];
  if (!extension) {
    return NextResponse.json(
      { error: "Solo se permiten imágenes PNG, JPEG o WEBP." },
      { status: 400 },
    );
  }

  let buffer: Buffer;
  try {
    buffer = Buffer.from(match[2], "base64");
  } catch {
    return NextResponse.json({ error: "Imagen corrupta." }, { status: 400 });
  }

  if (buffer.length > MAX_BYTES) {
    return NextResponse.json({ error: "La imagen no puede superar 2 MB." }, { status: 400 });
  }

  const fileName = `${randomUUID()}.${extension}`;
  const uploadDir = path.join(process.cwd(), "public", "uploads", "site");
  await mkdir(uploadDir, { recursive: true });
  await writeFile(path.join(uploadDir, fileName), buffer);

  return NextResponse.json({ url: `/uploads/site/${fileName}` });
}
