import { NextResponse } from "next/server";
import { setAuthCookie, verifySubmittedPassword } from "@/lib/auth";

export async function POST(request: Request) {
  const body = await request.json();
  const password = String(body.password ?? "");
  const next = typeof body.next === "string" && body.next.startsWith("/") ? body.next : "/";

  if (!verifySubmittedPassword(password)) {
    return NextResponse.json({ error: "Mot de passe incorrect." }, { status: 401 });
  }

  const response = NextResponse.json({ success: true, redirectTo: next });
  setAuthCookie(response);
  return response;
}
