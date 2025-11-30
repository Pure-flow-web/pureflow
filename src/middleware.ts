import { NextResponse, type NextRequest } from "next/server";

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // This is a placeholder for a real auth check.
  // In a real app, you'd check a secure, httpOnly cookie.
  const sessionToken = request.cookies.get('firebaseAuthToken'); 

  const isAppRoute = pathname.startsWith('/app');
  const isAuthRoute = pathname === '/';

  if (!sessionToken && isAppRoute) {
    // If not authenticated and trying to access a protected route,
    // redirect to the login page.
    return NextResponse.redirect(new URL('/', request.url));
  }

  if (sessionToken && isAuthRoute) {
    // If authenticated and on the login page,
    // redirect to the dashboard.
    return NextResponse.redirect(new URL('/app', request.url));
  }
  
  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
