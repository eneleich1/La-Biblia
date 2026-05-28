import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { NextRequest, NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/adminSession";

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

  const match = /^data:image\/([\w+]+);base64,(.+)$/.exec(dataUrl);
  if (!match) {
    return NextResponse.json({ error: "Formato de imagen no soportado." }, { status: 400 });
  }

  const extension = match[1] === "jpeg" ? "jpg" : match[1].replace("svg+xml", "svg");
  const buffer = Buffer.from(match[2], "base64");
  const fileName = `${randomUUID()}.${extension === "webp" ? "webp" : extension}`;
  const uploadDir = path.join(process.cwd(), "public", "uploads", "site");
  await mkdir(uploadDir, { recursive: true });
  await writeFile(path.join(uploadDir, fileName), buffer);

  return NextResponse.json({ url: `/uploads/site/${fileName}` });
}
