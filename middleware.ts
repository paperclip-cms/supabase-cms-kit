import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow access to onboarding, API routes, and static files
  if (
    pathname.startsWith("/onboarding") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/brand") ||
    pathname === "/favicon.ico"
  ) {
    return NextResponse.next();
  }

  // Check onboarding status
  try {
    // Only check if env vars are set (can't check DB from middleware reliably)
    const hasEnvVars =
      !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
      !!process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY &&
      !!process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!hasEnvVars) {
      const url = request.nextUrl.clone();
      url.pathname = "/onboarding";
      return NextResponse.redirect(url);
    }

    // If env vars are set, allow access
    // The onboarding page will handle checking the other steps
    return NextResponse.next();
  } catch {
    // On error, allow access
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
