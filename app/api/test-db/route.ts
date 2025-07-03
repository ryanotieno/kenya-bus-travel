import { NextResponse } from "next/server"
import { db } from "@/lib/database"
import { sql } from "drizzle-orm"

export async function GET() {
  try {
    console.log("🧪 Testing database connectivity...")
    
    // Test basic database connection
    const result = await db.execute(sql`SELECT 1 as test`)
    console.log("✅ Database connection successful:", result)
    
    // Test if saccos table exists
    try {
      const saccosResult = await db.execute(sql`SELECT COUNT(*) as count FROM saccos`)
      console.log("✅ Saccos table exists with count:", saccosResult[0]?.count || 0)
    } catch (saccosError) {
      console.log("❌ Saccos table error:", saccosError)
    }
    
    // Test if users table exists
    try {
      const usersResult = await db.execute(sql`SELECT COUNT(*) as count FROM users`)
      console.log("✅ Users table exists with count:", usersResult[0]?.count || 0)
    } catch (usersError) {
      console.log("❌ Users table error:", usersError)
    }
    
    // List all tables
    try {
      const tablesResult = await db.execute(sql`
        SELECT table_name as name FROM information_schema.tables 
        WHERE table_schema = 'public' 
        ORDER BY table_name
      `)
      console.log("📋 Available tables:", tablesResult)
    } catch (tablesError) {
      console.log("❌ Could not list tables:", tablesError)
    }
    
    return NextResponse.json({
      status: "success",
      message: "Database test completed",
      connection: "working",
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error("❌ Database test failed:", error)
    return NextResponse.json({
      status: "error",
      error: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
} 