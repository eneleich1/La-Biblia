import { NextRequest, NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/adminSession";
import { upsertSitePages } from "@/lib/sitePagesServer";
import type { SitePage } from "@/lib/sitePageTypes";

export async function POST(req: NextRequest) {
  if (!isAdminRequest(req)) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  try {
    const body = await req.json();
    const pages = (body.pages ?? []) as SitePage[];
    const saved = await upsertSitePages(pages);
    return NextResponse.json({ pages: saved, imported: saved.length });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Migracion fallida." },
      { status: 500 },
    );
  }
}
