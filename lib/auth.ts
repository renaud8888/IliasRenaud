import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { ACCESS_COOKIE_NAME } from "@/lib/constants";
import { getAuthEnv, getCronEnv } from "@/lib/env";

function createAccessToken() {
  return `site-access:${getAuthEnv().SESSION_SECRET}`;
}

export function verifySubmittedPassword(password: string) {
  return password === getAuthEnv().SITE_PASSWORD;
}

export function hasValidCookieToken(token?: string) {
  if (!token) {
    return false;
  }

  return token === createAccessToken();
}

export async function isAuthenticated() {
  const cookieStore = await cookies();
  return hasValidCookieToken(cookieStore.get(ACCESS_COOKIE_NAME)?.value);
}

export function setAuthCookie(response: NextResponse) {
  response.cookies.set(ACCESS_COOKIE_NAME, createAccessToken(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 31
  });
}

export function clearAuthCookie(response: NextResponse) {
  response.cookies.set(ACCESS_COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0
  });
}

export function requestHasSiteAccess(request: NextRequest) {
  return hasValidCookieToken(request.cookies.get(ACCESS_COOKIE_NAME)?.value);
}

export function requestHasCronAccess(request: NextRequest) {
  return request.headers.get("authorization") === `Bearer ${getCronEnv().CRON_SECRET}`;
}

export function requireSiteAccessOrThrow(request: NextRequest) {
  if (!requestHasSiteAccess(request)) {
    throw new Response(JSON.stringify({ error: "Accès refusé." }), {
      status: 401,
      headers: {
        "content-type": "application/json"
      }
    });
  }
}

export function requireCronAccessOrThrow(request: NextRequest) {
  if (!requestHasCronAccess(request)) {
    throw new Response(JSON.stringify({ error: "Cron non autorisé." }), {
      status: 401,
      headers: {
        "content-type": "application/json"
      }
    });
  }
}
