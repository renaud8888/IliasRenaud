import { NextRequest, NextResponse } from "next/server";
import { requireCronAccessOrThrow } from "@/lib/auth";
import { getBaseData } from "@/lib/services/dashboard";
import { isWithinWeeklySendWindow, sendWeeklySummaryEmails } from "@/lib/services/emails";

export async function GET(request: NextRequest) {
  try {
    requireCronAccessOrThrow(request);
    const { settings } = await getBaseData();

    if (!settings.weekly_email_enabled) {
      return NextResponse.json({ success: true, skipped: true, reason: "weekly_email_disabled" });
    }

    if (!(await isWithinWeeklySendWindow(settings.weekly_email_hour_local))) {
      return NextResponse.json({
        success: true,
        skipped: true,
        reason: "outside_configured_local_hour",
        expectedLocalHour: settings.weekly_email_hour_local
      });
    }

    await sendWeeklySummaryEmails();
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Response) {
      return error;
    }

    return NextResponse.json({ error: "Envoi hebdomadaire impossible." }, { status: 500 });
  }
}
