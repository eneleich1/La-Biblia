import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    body = null;
  }
  return NextResponse.json({
    ok: true,
    message: "Contact endpoint placeholder. No email has been sent yet.",
    received: body,
  });
}
