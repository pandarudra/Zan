import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const AUTH_ONLY = new Set(["/login", "/register"]);

function dashboardFor(role: unknown): "/client" | "/provider" {
  return role === "PROVIDER" ? "/provider" : "/client";
}

export async function proxy(request: NextRequest) {
  const { pathname, search, searchParams } = request.nextUrl;
  const token = await getToken({ req: request });

  if (AUTH_ONLY.has(pathname)) {
    return token
      ? NextResponse.redirect(new URL(dashboardFor(token.role), request.url))
      : NextResponse.next();
  }

  const hasWalletToken =
    pathname === "/wallet" && Boolean(searchParams.get("token"));

  if (!token && !hasWalletToken) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", `${pathname}${search}`);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/login",
    "/register",
    "/client/:path*",
    "/provider/:path*",
    "/stake",
    "/wallet",
  ],
};
