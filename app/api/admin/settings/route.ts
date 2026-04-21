import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import { requireSiteAccessOrThrow } from "@/lib/auth";
import { saveAdminSettings } from "@/lib/services/admin";

export async function PUT(request: NextRequest) {
  try {
    requireSiteAccessOrThrow(request);
    await saveAdminSettings(await request.json());
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Response) {
      return error;
    }

    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          error: `Données admin invalides: ${error.issues.map((issue) => issue.message).join(" | ")}`
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Sauvegarde admin impossible." },
      { status: 400 }
    );
  }
}
