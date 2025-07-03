import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { jwtVerify } from "jose"

// Use environment variable for JWT secret, fallback to a default for development
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "your-secret-key-for-development-only"
)

export async function GET(request: NextRequest) {
  try {
    const sessionCookie = request.cookies.get("session")?.value
    
    console.log("🔍 Debug Session Request")
    console.log("🍪 Session cookie present:", !!sessionCookie)
    console.log("🔑 JWT_SECRET set:", !!process.env.JWT_SECRET)
    console.log("🌍 NODE_ENV:", process.env.NODE_ENV)
    
    if (!sessionCookie) {
      return NextResponse.json({
        error: "No session cookie found",
        authenticated: false,
        cookiePresent: false
      })
    }

    // Try to verify the JWT directly
    try {
      const { payload } = await jwtVerify(sessionCookie, JWT_SECRET)
      console.log("✅ JWT verification successful:", payload)
      
      return NextResponse.json({
        authenticated: true,
        jwtPayload: payload,
        cookiePresent: true,
        jwtValid: true
      })
    } catch (jwtError) {
      console.log("❌ JWT verification failed:", jwtError)
      
      return NextResponse.json({
        authenticated: false,
        error: "JWT verification failed",
        jwtError: jwtError instanceof Error ? jwtError.message : "Unknown error",
        cookiePresent: true,
        jwtValid: false
      })
    }
  } catch (error) {
    console.error("Debug session error:", error)
    return NextResponse.json({
      error: "Debug failed",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
} 