import { NextResponse } from "next/server"
import { userService } from "@/lib/db-service"

export async function GET() {
  try {
    console.log("🏥 Health check - checking database...")
    
    // Try to access the users table
    await userService.getAll()
    
    console.log("✅ Database is healthy")
    
    return NextResponse.json({
      status: "healthy",
      database: "connected",
      tables: "available",
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error("❌ Health check failed:", error)
    
    if (error instanceof Error && error.message.includes("no such table")) {
      return NextResponse.json({
        status: "unhealthy",
        database: "connected",
        tables: "missing",
        error: "Database tables not initialized",
        timestamp: new Date().toISOString()
      }, { status: 503 })
    }
    
    return NextResponse.json({
      status: "unhealthy",
      database: "disconnected",
      error: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString()
    }, { status: 503 })
  }
} 