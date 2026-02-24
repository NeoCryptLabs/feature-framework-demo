import { getToken } from "next-auth/jwt"
import { NextRequest, NextResponse } from "next/server"

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request })
  const { pathname } = request.nextUrl

  // Redirect authenticated users away from login
  if (pathname === "/login" && token) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  // Protect dashboard routes
  if (pathname.startsWith("/dashboard") || pathname.startsWith("/analytics") || pathname.startsWith("/settings")) {
    if (!token) {
      return NextResponse.redirect(new URL("/login", request.url))
    }

    // Restrict settings to ADMIN only
    if (pathname.startsWith("/settings") && token.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/dashboard/:path*", "/analytics/:path*", "/settings/:path*", "/login"],
}
