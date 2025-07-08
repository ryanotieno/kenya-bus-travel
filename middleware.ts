import { type NextRequest, NextResponse } from "next/server"
import { jwtVerify } from "jose"

// Use environment variable for JWT secret, fallback to a default for development
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "your-secret-key-for-development-only"
)

export async function middleware(request: NextRequest) {
  const session = request.cookies.get("session")?.value
  const url = request.nextUrl.pathname

  console.log(`🔍 Middleware called for: ${url}`)
  console.log(`🍪 Session cookie: ${session ? 'Present' : 'Missing'}`)

  // Public routes that don't require authentication
  const publicRoutes = [
    "/", 
    "/login", 
    "/register", 
    "/api/auth/login", 
    "/api/auth/register", 
    "/api/auth/session", 
    "/api/test", 
    "/api/test-vehicle",
    "/api/drivers/register",
    "/api/vehicles",
    "/drivers/register"
  ]
  const isPublicRoute = publicRoutes.some(route => url === route || url.startsWith(route + "/"))

  // If it's a public route, allow access
  if (isPublicRoute) {
    console.log(`✅ Public route accessed: ${url}`)
    return NextResponse.next()
  }

  // If no session, redirect to login
  if (!session) {
    console.log(`🔒 No session found, redirecting to login from: ${url}`)
    const loginUrl = new URL("/login", request.url)
    // Preserve the intended destination
    loginUrl.searchParams.set("redirect", url)
    return NextResponse.redirect(loginUrl)
  }

  try {
    // Verify the session
    const { payload } = await jwtVerify(session, JWT_SECRET)
    const userRole = payload.role as string
    const userEmail = payload.email as string

    console.log(`🔐 Session verified for ${userEmail} (${userRole}) accessing ${url}`)

    // STRICT role-based routing - drivers can ONLY access driver routes
    if (userRole === "driver") {
      // Drivers can ONLY access driver routes or driver API endpoints
      if (!url.startsWith("/driver") && !url.startsWith("/api/drivers")) {
        console.log(`🚫 Driver ${userEmail} redirected from ${url} to driver dashboard`)
        return NextResponse.redirect(new URL("/driver/dashboard", request.url))
      }
    } else if (userRole === "owner") {
      // Owners can ONLY access owner routes or general API endpoints
      if (!url.startsWith("/owner") && !url.startsWith("/api/owners") && !url.startsWith("/api/")) {
        console.log(`🚫 Owner ${userEmail} redirected from ${url} to owner dashboard`)
        return NextResponse.redirect(new URL("/owner/dashboard", request.url))
      }
    } else if (userRole === "user") {
      // Regular users can ONLY access user routes or general API endpoints
      if (!url.startsWith("/user") && !url.startsWith("/api/")) {
        console.log(`🚫 User ${userEmail} redirected from ${url} to user dashboard`)
        return NextResponse.redirect(new URL("/user/dashboard", request.url))
      }
    } else {
      // Unknown role, redirect to login
      console.log(`🚫 Unknown role ${userRole} for ${userEmail}, redirecting to login`)
      return NextResponse.redirect(new URL("/login", request.url))
    }

    console.log(`✅ Access granted to ${userEmail} (${userRole}) for ${url}`)
    return NextResponse.next()
  } catch (error) {
    // Invalid session, redirect to login
    console.log(`❌ Invalid session, redirecting to login from: ${url}`)
    console.log(`❌ Error:`, error)
    const loginUrl = new URL("/login", request.url)
    loginUrl.searchParams.set("redirect", url)
    return NextResponse.redirect(loginUrl)
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
}
