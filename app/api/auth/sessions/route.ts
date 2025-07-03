import { NextRequest, NextResponse } from "next/server"
import { getSession, invalidateAllUserSessions, deleteSession } from "@/lib/auth"
import { sessionService } from "@/lib/db-service"

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get all sessions for the current user
    const userSessions = await sessionService.getByUserId(parseInt(session.id))
    
    return NextResponse.json({
      success: true,
      currentSession: {
        id: session.sessionId,
        lastActivity: session.lastActivity,
        role: session.role,
        email: session.email
      },
      allSessions: userSessions.map((s: any) => ({
        id: s.id,
        token: s.token.substring(0, 8) + "...", // Only show first 8 chars for security
        createdAt: s.createdAt,
        expiresAt: s.expiresAt,
        isCurrent: s.token === session.sessionId
      }))
    })
  } catch (error) {
    console.error("Error fetching sessions:", error)
    return NextResponse.json({ error: "Failed to fetch sessions" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getSession()
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const action = searchParams.get("action")

    if (action === "logout-all") {
      // Logout from all devices
      await invalidateAllUserSessions(session.id)
      await deleteSession()
      
      return NextResponse.json({ 
        success: true, 
        message: "Logged out from all devices" 
      })
    } else if (action === "logout-current") {
      // Logout from current device only
      await deleteSession()
      
      return NextResponse.json({ 
        success: true, 
        message: "Logged out from current device" 
      })
    } else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }
  } catch (error) {
    console.error("Error managing sessions:", error)
    return NextResponse.json({ error: "Failed to manage sessions" }, { status: 500 })
  }
} 