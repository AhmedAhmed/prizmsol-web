import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function proxy(request: NextRequest) {
  const url = request.nextUrl;
  const hostname = request.headers.get("host") || "";
  const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
  
  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "localhost:3000";
  const subdomain = hostname.endsWith(`.${rootDomain}`)
    ? hostname.replace(`.${rootDomain}`, "")
    : null;

  if (url.pathname.startsWith("/ping")) {
    return new Response("pong", { status: 200 });
  }

  if (subdomain && subdomain !== "www") {
    return NextResponse.rewrite(new URL(`/site/${subdomain}${url.pathname}`, request.url));
  }

  const session = await auth.api.getSession({
    headers: request.headers,
  });

  const isLoggedIn = !!session;
  const isAuthPage = ["/login", "/verify"].includes(url.pathname);
  const isPublicPage = ["/pricing", "/home"].includes(url.pathname);
  const isStripeApiPath = url.pathname.startsWith("/api/stripe/");

  if (subdomain && subdomain !== "www") {
    return NextResponse.next();
  }

  if (!isLoggedIn) {
    if (isAuthPage || isPublicPage || isStripeApiPath) {
      return NextResponse.next();
    }
    const redirectUrl = encodeURIComponent(url.pathname);
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