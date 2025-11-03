import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = !!req.auth;

  // Protect admin routes
  if (pathname.startsWith("/admin")) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    if (req.auth?.user?.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  // Redirect logged-in users away from auth pages
  if ((pathname.startsWith("/login") || pathname.startsWith("/register")) && isLoggedIn) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};

