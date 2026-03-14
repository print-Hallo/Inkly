import { NextResponse } from "next/server";

export function middleware(request) {
  const { pathname } = request.nextUrl;

  // 1. Only run on protected routes (like /dashboard)
  if (pathname.startsWith('/dashboard')) {
    // 2. Manually grab the Better Auth session token
    const sessionToken = request.cookies.get("better-auth.session_token");

    // 3. If the cookie is missing, redirect to login
    if (!sessionToken) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return NextResponse.next();
}

// 4. Matcher to keep things fast
export const config = {
  matcher: ["/dashboard/:path*"],
};