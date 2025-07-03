import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth"

export async function GET() {
  try {
    const session = await getSession()
    
    if (!session) {
      return NextResponse.json({ 
        authenticated: false, 
        message: "No active session found" 
      })
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        id: session.id,
        name: session.name,
        email: session.email,
        role: session.role,
        sessionId: session.sessionId,
        lastActivity: session.lastActivity
      },
      message: "Session is valid"
    })
  } catch (error) {
    console.error("Session check error:", error)
    return NextResponse.json({ 
      authenticated: false, 
      error: "Failed to check session",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
} 