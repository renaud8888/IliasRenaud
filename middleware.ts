import { NextRequest, NextResponse } from "next/server";
import { requestHasSiteAccess } from "@/lib/auth";

const PUBLIC_PATHS = ["/login", "/api/auth/login", "/api/cron/weekly-summary", "/api/cron/check-missed-entries"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/favicon.ico") ||
    PUBLIC_PATHS.some((path) => pathname.startsWith(path))
  ) {
    return NextResponse.next();
  }

  if (requestHasSiteAccess(request)) {
    return NextResponse.next();
  }

  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("next", pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"]
};
