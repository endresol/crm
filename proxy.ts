import { NextResponse, type NextRequest } from "next/server";
import { PORTAL_SESSION_COOKIE_NAME, SESSION_COOKIE_NAME } from "@/lib/auth/constants";

// Cheap redirect based on cookie *presence* only (no DB round trip on every
// navigation) — avoids rendering protected pages when we already know a
// visitor has no session at all. The authoritative check (is the session row
// still valid?) happens in app/admin/layout.tsx and app/portal/(app)/
// layout.tsx via getCurrentUser()/getCurrentContact(). (proxy.ts always runs
// on the Node.js runtime as of Next.js 16, so a DB call here would work fine
// too — this split is a perf/clarity choice, not a runtime constraint.)
//
// Deliberately one-directional: this only ever redirects *out of* a
// protected area when a cookie is missing, never *into* the dashboard from a
// login page just because a cookie is present. That second direction used to
// exist here too, and it's an infinite-redirect trap waiting to happen — a
// cookie can be present but stale (its session row deleted, e.g. by
// features/contacts/service.ts's setContactPortalPassword revoking a
// disabled Contact's portal sessions without clearing their browser's
// cookie). A stale cookie makes this middleware wave the request straight
// through past a bare presence check, but the destination page's own
// authoritative getCurrentUser()/getCurrentContact() call then finds no
// valid session and redirects back to login — which this middleware would
// then bounce right back to the destination, forever. Bouncing an
// already-logged-in visitor away from /login or /portal/login is instead
// each login page's own job (it already has to call getCurrentUser()/
// getCurrentContact() to render anything), where the check is authoritative
// and a stale cookie safely just shows the login form instead of looping.
export default function proxy(request: NextRequest) {
  const hasSessionCookie = request.cookies.has(SESSION_COOKIE_NAME);
  const hasPortalCookie = request.cookies.has(PORTAL_SESSION_COOKIE_NAME);
  const { pathname, search } = request.nextUrl;

  const isAuthPage = pathname === "/login" || pathname === "/signup";
  const isAdminPage = pathname.startsWith("/admin");
  const isPortalPage = pathname.startsWith("/portal");
  const isPortalLoginPage = pathname === "/portal/login";

  // Domain separation (roadmap #20): in production, PORTAL_HOST is set to
  // the Client Portal's own subdomain (e.g. client.normadicstudio.com) —
  // configured as a second custom domain on the Vercel project, with a CNAME
  // for it at the DNS registrar; see .env.example. Once set, the admin app
  // and the portal only exist at their own hostnames: a client on the admin
  // host bounces to the portal, and vice versa, so the portal is never
  // reachable (or discoverable) from the agency's own domain. Without it
  // (local dev, preview deploys with no custom domain attached) both live on
  // one host, gated by path alone, so the portal stays testable without any
  // DNS setup.
  const portalHost = process.env.PORTAL_HOST;
  if (portalHost) {
    const onPortalHost = request.headers.get("host") === portalHost;
    if (onPortalHost && (isAdminPage || isAuthPage)) {
      return NextResponse.redirect(new URL("/portal/login", request.url));
    }
    if (!onPortalHost && isPortalPage) {
      return NextResponse.redirect(`https://${portalHost}${pathname}${search}`);
    }
  }

  if (isAdminPage && !hasSessionCookie) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isPortalPage && !isPortalLoginPage && !hasPortalCookie) {
    return NextResponse.redirect(new URL("/portal/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/login", "/signup", "/portal/:path*"],
};
