import { NextRequest, NextResponse } from "next/server";
import { requireSiteAccessOrThrow } from "@/lib/auth";
import {
  applyScenario,
  clearAllWeights,
  deleteTestData,
  exportSnapshot,
  generateFakeWeights,
  previewMissedReminderEmails,
  previewWeeklyEmails,
  resetDefaultData,
  restoreInitialConfiguration,
  sendReminderEmailsForTest,
  sendWeeklyEmailsForTest,
  setSimulatedDate,
  resetToSystemDate
} from "@/lib/dev-tools";
import { ensureDevToolsEnabled } from "@/lib/runtime";

export async function POST(request: NextRequest) {
  try {
    requireSiteAccessOrThrow(request);
    ensureDevToolsEnabled();

    const body = await request.json();
    const action = String(body.action ?? "");

    switch (action) {
      case "set-simulated-date":
        return NextResponse.json(
          await setSimulatedDate({
            enabled: Boolean(body.enabled),
            simulatedNow: typeof body.simulatedNow === "string" ? body.simulatedNow : null
          })
        );
      case "use-system-date":
        return NextResponse.json(await resetToSystemDate());
      case "generate-data":
        return NextResponse.json(await generateFakeWeights(body.payload));
      case "apply-scenario":
        return NextResponse.json(await applyScenario(String(body.scenarioKey)));
      case "delete-test-data":
        return NextResponse.json(await deleteTestData());
      case "reset-default-data":
        return NextResponse.json(await resetDefaultData());
      case "clear-weights":
        return NextResponse.json(await clearAllWeights());
      case "restore-initial-configuration":
        return NextResponse.json(await restoreInitialConfiguration());
      case "preview-weekly-email":
        return NextResponse.json({ items: await previewWeeklyEmails() });
      case "preview-reminder-email":
        return NextResponse.json({ items: await previewMissedReminderEmails() });
      case "send-test-weekly-email":
        return NextResponse.json(await sendWeeklyEmailsForTest());
      case "send-test-reminder-email":
        return NextResponse.json(await sendReminderEmailsForTest());
      case "export-snapshot":
        return NextResponse.json(await exportSnapshot());
      default:
        return NextResponse.json({ error: "Action dev inconnue." }, { status: 400 });
    }
  } catch (error) {
    if (error instanceof Response) {
      return error;
    }

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Erreur inconnue dans les outils de simulation."
      },
      { status: 500 }
    );
  }
}
