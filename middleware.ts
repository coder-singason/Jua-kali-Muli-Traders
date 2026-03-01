import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

function hasSessionCookie(req: NextRequest): boolean {
  const cookieNames = [
    "__Secure-authjs.session-token",
    "authjs.session-token",
    "__Secure-next-auth.session-token",
    "next-auth.session-token",
  ];

  return cookieNames.some((cookieName) => req.cookies.has(cookieName));
}

function resolveAuthRedirectTarget(callbackUrl: string | null, role?: string): string {
  let target = callbackUrl && callbackUrl.startsWith("/") ? callbackUrl : "/";

  if (target.startsWith("/admin") && role !== "ADMIN") {
    return "/";
  }

  if (target.startsWith("/login") || target.startsWith("/register")) {
    target = role === "ADMIN" ? "/admin/dashboard" : "/";
  }

  if (role === "ADMIN" && target === "/") {
    return "/admin/dashboard";
  }

  return target;
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const authSecret = process.env.NEXTAUTH_SECRET ?? process.env.AUTH_SECRET;
  const token = await getToken({
    req,
    secret: authSecret,
  });
  const isLoggedIn = !!token;
  const hasSession = hasSessionCookie(req);

  // Protect admin routes
  if (pathname.startsWith("/admin")) {
    if (!isLoggedIn) {
      // Fallback for edge token decode mismatches: let server-side auth() decide.
      if (hasSession) {
        return NextResponse.next();
      }

      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (token?.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  // Redirect logged-in users away from auth pages
  if ((pathname.startsWith("/login") || pathname.startsWith("/register")) && isLoggedIn) {
    const callbackUrl = req.nextUrl.searchParams.get("callbackUrl");
    const target = resolveAuthRedirectTarget(callbackUrl, token?.role as string | undefined);
    return NextResponse.redirect(new URL(target, req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
