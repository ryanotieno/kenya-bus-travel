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
  const publicRoutes = ["/", "/login", "/register", "/api/auth/login", "/api/auth/register", "/api/auth/session", "/api/test", "/api/test-vehicle"]
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

    // Check if the user is accessing the correct role-based routes
    if (userRole === "driver") {
      // Drivers can only access driver routes
      if (!url.startsWith("/driver") && !url.startsWith("/api/drivers")) {
        console.log(`🚫 Driver ${userEmail} trying to access non-driver route: ${url}`)
        return NextResponse.redirect(new URL("/driver/dashboard", request.url))
      }
    } else if (userRole === "user") {
      // Regular users can only access user routes
      if (!url.startsWith("/user") && !url.startsWith("/api/")) {
        console.log(`🚫 User ${userEmail} trying to access non-user route: ${url}`)
        return NextResponse.redirect(new URL("/user/dashboard", request.url))
      }
    } else if (userRole === "owner") {
      // Owners can only access owner routes
      if (!url.startsWith("/owner") && !url.startsWith("/api/")) {
        console.log(`🚫 Owner ${userEmail} trying to access non-owner route: ${url}`)
        return NextResponse.redirect(new URL("/owner/dashboard", request.url))
      }
    }

    console.log(`✅ Access granted to ${userEmail} for ${url}`)
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
    // Protect all dashboard routes
    "/user/:path*",
    "/driver/:path*", 
    "/owner/:path*",
    // Protect specific API routes that need authentication
    "/api/drivers/:path*",
    "/api/companies/:path*",
    // "/api/vehicles/:path*", // Temporarily disabled for testing
    "/api/routes/:path*",
    "/api/trips/:path*",
    "/api/tickets/:path*",
  ],
}
