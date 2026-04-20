import { NextRequest, NextResponse } from "next/server";
import { requireSiteAccessOrThrow } from "@/lib/auth";
import { deleteWeightEntry, updateWeightEntry } from "@/lib/services/weights";
import { adminWeightUpdateSchema } from "@/lib/validators/weights";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ entryId: string }> }
) {
  try {
    requireSiteAccessOrThrow(request);
    const payload = adminWeightUpdateSchema.parse(await request.json());
    const { entryId } = await params;
    await updateWeightEntry(entryId, payload);
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Response) {
      return error;
    }

    return NextResponse.json({ error: "Correction impossible." }, { status: 400 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ entryId: string }> }
) {
  try {
    requireSiteAccessOrThrow(request);
    const { entryId } = await params;
    await deleteWeightEntry(entryId);
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Response) {
      return error;
    }

    return NextResponse.json({ error: "Suppression impossible." }, { status: 400 });
  }
}
