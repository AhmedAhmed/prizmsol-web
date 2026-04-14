import { type NextRequest, NextResponse } from "next/server";
 import { auth } from "@/lib/auth";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

  // Health check
  if (pathname.startsWith("/ping")) {
    return new Response("pong", { status: 200 });
  }

  // 🔐 Replace next-auth getToken with BetterAuth session
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  const isLoggedIn = !!session;

  const isAuthPage = ["/login", "/verify"].includes(pathname);
  const isPublicPage = ["/pricing", "/home"].includes(pathname);
  const isStripeApiPath = pathname.startsWith("/api/stripe/");

  if (!isLoggedIn) {
    if (isAuthPage || isPublicPage || isStripeApiPath) {
      return NextResponse.next();
    }

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
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|api/auth).*)",
  ],
};