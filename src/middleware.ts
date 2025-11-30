import { NextResponse, type NextRequest } from "next/server";

// This is a placeholder token name. In a real app, you'd get this from your Firebase setup.
const AUTH_COOKIE_NAME = "firebase-auth-token";

export function middleware(request: NextRequest) {
  const token = request.cookies.get(AUTH_COOKIE_NAME);
  const { pathname } = request.nextUrl;

  const isAuthRoute = pathname === "/login" || pathname === "/signup";

  // If the user has no auth token and is trying to access a protected route,
  // redirect them to the login page.
  if (!token && !isAuthRoute) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  // If the user has an auth token and is trying to access an auth route
  // (like login or signup), redirect them to the main app page (e.g., tasks).
  if (token && isAuthRoute) {
    const appUrl = new URL("/tasks", request.url);
    return NextResponse.redirect(appUrl);
  }

  // Allow the request to proceed if none of the above conditions are met.
  return NextResponse.next();
}

export const config = {
  // This matcher ensures the middleware runs on all routes
  // except for internal Next.js assets and static files.
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};