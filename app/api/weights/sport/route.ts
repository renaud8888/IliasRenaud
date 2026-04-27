import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireSiteAccessOrThrow } from "@/lib/auth";
import { updateSportForWeightEntry } from "@/lib/services/weights";
import { sportUpdateSchema } from "@/lib/validators/weights";

export async function PATCH(request: NextRequest) {
  try {
    requireSiteAccessOrThrow(request);
    const payload = sportUpdateSchema.parse(await request.json());
    const result = await updateSportForWeightEntry(payload);
    revalidatePath("/");
    revalidatePath("/admin");
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof Response) {
      return error;
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Mise à jour du sport impossible." },
      { status: 400 }
    );
  }
}
