import { type NextRequest, NextResponse } from "next/server"
import { jwtVerify, SignJWT } from "jose"

// This would be an environment variable in a real app
const JWT_SECRET = new TextEncoder().encode("your-secret-key")

export async function middleware(request: NextRequest) {
  const session = request.cookies.get("session")?.value
  const url = request.nextUrl.pathname

  // BYPASS: Always create a valid session if there's no session
  if (!session) {
    // Determine which role to use based on the URL
    const role = url.startsWith("/driver") ? "driver" : "user"
    
    // Create a new session with demo user
    const user = {
      id: role === "driver" ? "driver-123" : "user-456",
      name: role === "driver" ? "David Driver" : "John Passenger",
      email: role === "driver" ? "driver@demo.com" : "user@demo.com",
      role: role
    }
    
    // Create the JWT token
    const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    const newSession = await new SignJWT({ ...user })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime(expires.getTime() / 1000)
      .sign(JWT_SECRET)
    
    // Create a response that allows the user to proceed
    const response = NextResponse.next()
    
    // Set the session cookie
    response.cookies.set("session", newSession, {
      expires,
      httpOnly: true,
      path: "/",
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    })
    
    return response
  }

  try {
    // Verify the session
    const { payload } = await jwtVerify(session, JWT_SECRET)
    const role = payload.role as string

    // Check if the user is accessing the correct role-based routes
    if (role === "user" && url.startsWith("/driver")) {
      return NextResponse.redirect(new URL("/user/dashboard", request.url))
    }

    if (role === "driver" && url.startsWith("/user")) {
      return NextResponse.redirect(new URL("/driver/dashboard", request.url))
    }

    return NextResponse.next()
  } catch (error) {
    // BYPASS: If the session is invalid, create a new one instead of redirecting
    const role = url.startsWith("/driver") ? "driver" : "user"
    
    // Create a new session with demo user
    const user = {
      id: role === "driver" ? "driver-123" : "user-456",
      name: role === "driver" ? "David Driver" : "John Passenger",
      email: role === "driver" ? "driver@demo.com" : "user@demo.com",
      role: role
    }
    
    // Create the JWT token
    const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    const newSession = await new SignJWT({ ...user })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime(expires.getTime() / 1000)
      .sign(JWT_SECRET)
    
    // Create a response that allows the user to proceed
    const response = NextResponse.next()
    
    // Set the session cookie
    response.cookies.set("session", newSession, {
      expires,
      httpOnly: true,
      path: "/",
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    })
    
    return response
  }
}

export const config = {
  matcher: ["/user/:path*", "/driver/:path*"],
}
