import { NextRequest, NextResponse } from "next/server";
import { requireSiteAccessOrThrow } from "@/lib/auth";
import { getDashboardData } from "@/lib/services/dashboard";

export async function GET(request: NextRequest) {
  try {
    requireSiteAccessOrThrow(request);
    const data = await getDashboardData();
    return NextResponse.json(data);
  } catch (error) {
    if (error instanceof Response) {
      return error;
    }

    return NextResponse.json({ error: "Impossible de charger le dashboard." }, { status: 500 });
  }
}
