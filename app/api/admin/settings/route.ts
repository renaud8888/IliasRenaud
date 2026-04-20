import { NextRequest, NextResponse } from "next/server";
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

    return NextResponse.json({ error: "Sauvegarde admin impossible." }, { status: 400 });
  }
}
