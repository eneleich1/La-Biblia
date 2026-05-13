import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    message: "Daily reading API placeholder.",
    items: [] as unknown[],
  });
}
