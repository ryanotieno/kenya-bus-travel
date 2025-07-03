import { NextResponse } from "next/server"
import { db } from "@/lib/database"
import { sql } from "drizzle-orm"

export async function GET() {
  try {
    console.log("🏥 Health check with database status...")
    
    // Test database connection
    const connectionTest = await db.execute(sql`SELECT 1 as test`)
    console.log("✅ Database connection successful")
    
    // Check what tables exist
    let tables: string[] = []
    let sessionsExists = false
    let routesExists = false
    
    try {
      const tablesResult = await db.execute(sql`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
        ORDER BY table_name
      `)
      
      tables = tablesResult.map((row: any) => row.table_name)
      sessionsExists = tables.includes('sessions')
      routesExists = tables.includes('routes')
      
      console.log("📋 Available tables:", tables)
    } catch (error) {
      console.log("❌ Could not list tables:", error)
    }
    
    return NextResponse.json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      database: {
        connected: true,
        tables,
        sessionsExists,
        routesExists,
        totalTables: tables.length
      },
      environment: process.env.NODE_ENV || 'development',
      message: "Application is running with PostgreSQL database"
    })
    
  } catch (error) {
    console.error("❌ Health check failed:", error)
    return NextResponse.json({
      status: "unhealthy",
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : "Unknown error",
      database: {
        connected: false,
        tables: [],
        sessionsExists: false,
        routesExists: false,
        totalTables: 0
      },
      environment: process.env.NODE_ENV || 'development',
      message: "Application has database connection issues"
    }, { status: 500 })
  }
} 