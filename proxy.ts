import { getToken } from "next-auth/jwt";
import { type NextRequest, NextResponse } from "next/server";
import { isDevelopmentEnvironment } from "./lib/constants";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

  if (pathname.startsWith("/ping")) {
    return new Response("pong", { status: 200 });
  }

  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
    secureCookie: !isDevelopmentEnvironment,
  });

  const isAuthPage = ["/login", "/register"].includes(pathname);
  const isPublicPage = ["/pricing", "/home"].includes(pathname);
  const isStripeApiPath = pathname.startsWith("/api/stripe/");

  if (!token) {
    if (isAuthPage || isPublicPage || isStripeApiPath) return NextResponse.next();
    const redirectUrl = encodeURIComponent(pathname);
    return NextResponse.redirect(
      new URL(`${base}/login?redirectUrl=${redirectUrl}`, request.url)
    );
  }

  if (isAuthPage) {
    return NextResponse.redirect(new URL(`${base}/`, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all paths EXCEPT:
     * - _next/static, _next/image (Next.js internals)
     * - favicon, sitemap, robots (static files)
     * - api/auth (NextAuth routes — must be excluded)
     */
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|api/auth).*)",
  ],
};