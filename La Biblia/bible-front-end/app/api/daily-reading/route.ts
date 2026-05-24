import { NextRequest, NextResponse } from "next/server";
import { getDailyReading, getTodayDateKey } from "@/lib/dailyReading";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const requestedDate = request.nextUrl.searchParams.get("date");
  const date = requestedDate && /^\d{4}-\d{2}-\d{2}$/.test(requestedDate)
    ? requestedDate
    : getTodayDateKey();

  try {
    const reading = await getDailyReading(date);
    return NextResponse.json(reading);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load daily reading";

    return NextResponse.json(
      {
        error: message,
        date,
        displayDate: date,
        celebration: "Lecturas del día no disponibles",
        sections: [],
      },
      { status: 503 },
    );
  }
}
