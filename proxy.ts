import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE_NAME } from "@/lib/auth/constants";

// Cheap redirect based on cookie *presence* only (no DB round trip on every
// navigation) — avoids rendering protected/auth pages when we already know
// which way the redirect should go. The authoritative check (is the session
// row still valid?) happens in app/admin/layout.tsx via getCurrentUser().
// (proxy.ts always runs on the Node.js runtime as of Next.js 16, so a DB call
// here would work fine too — this split is a perf/clarity choice, not a
// runtime constraint.)
export default function proxy(request: NextRequest) {
  const hasSessionCookie = request.cookies.has(SESSION_COOKIE_NAME);
  const { pathname } = request.nextUrl;

  const isAuthPage = pathname === "/login" || pathname === "/signup";
  const isAdminPage = pathname.startsWith("/admin");

  if (isAdminPage && !hasSessionCookie) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthPage && hasSessionCookie) {
    return NextResponse.redirect(new URL("/admin/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/login", "/signup"],
};
