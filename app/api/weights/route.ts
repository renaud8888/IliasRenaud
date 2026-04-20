import { NextRequest, NextResponse } from "next/server";
import { requireSiteAccessOrThrow } from "@/lib/auth";
import { upsertWeightEntry } from "@/lib/services/weights";
import { weightInputSchema } from "@/lib/validators/weights";

export async function POST(request: NextRequest) {
  try {
    requireSiteAccessOrThrow(request);
    const payload = weightInputSchema.parse(await request.json());
    const result = await upsertWeightEntry(payload);
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof Response) {
      return error;
    }

    return NextResponse.json({ error: "Enregistrement impossible." }, { status: 400 });
  }
}
