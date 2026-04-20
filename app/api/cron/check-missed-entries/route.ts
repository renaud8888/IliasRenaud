import { NextRequest, NextResponse } from "next/server";
import { requireCronAccessOrThrow } from "@/lib/auth";
import { sendMissedEntryReminders } from "@/lib/services/emails";

export async function GET(request: NextRequest) {
  try {
    requireCronAccessOrThrow(request);
    const result = await sendMissedEntryReminders();
    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    if (error instanceof Response) {
      return error;
    }

    return NextResponse.json({ error: "Vérification des oublis impossible." }, { status: 500 });
  }
}
