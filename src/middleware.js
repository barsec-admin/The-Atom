// middleware.js
import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

export async function middleware(request) {
  console.log("Middleware processing URL:", request.nextUrl.pathname);
  
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  console.log("Middleware token:", token);
  console.log("Cookie header:", request.headers.get("cookie"));

  const isAdminPage = request.nextUrl.pathname.startsWith("/admin");
  const isLoginPage = request.nextUrl.pathname === "/admin/login";
  const isApiAuthRoute = request.nextUrl.pathname.startsWith("/api/auth");

  // Don't redirect API and auth routes
  if (isApiAuthRoute) {
    console.log("Allowing API/auth route:", request.nextUrl.pathname);
    return NextResponse.next();
  }

  if (isLoginPage && token) {
    console.log("Redirecting authenticated user from login to admin");
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  if (isAdminPage && !isLoginPage && !token) {
    console.log("Redirecting unauthenticated user to login");
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  const response = NextResponse.next();
  
  // Ensure proper headers for auth routes
  if (isApiAuthRoute) {
    response.headers.set("Cache-Control", "no-store, max-age=0");
    response.headers.set("Pragma", "no-cache");
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*"],
};
