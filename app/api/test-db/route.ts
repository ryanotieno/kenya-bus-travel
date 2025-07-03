import { NextResponse } from "next/server"
import { db } from "@/lib/database"

export async function GET() {
  try {
    console.log("🧪 Testing database connectivity...")
    
    // Test basic database connection
    const result = await db.run("SELECT 1 as test")
    console.log("✅ Database connection successful:", result)
    
    // Test if saccos table exists
    try {
      const saccosResult = await db.run("SELECT COUNT(*) as count FROM saccos")
      console.log("✅ Saccos table exists with count:", saccosResult)
    } catch (saccosError) {
      console.log("❌ Saccos table error:", saccosError)
    }
    
    // Test if users table exists
    try {
      const usersResult = await db.run("SELECT COUNT(*) as count FROM users")
      console.log("✅ Users table exists with count:", usersResult)
    } catch (usersError) {
      console.log("❌ Users table error:", usersError)
    }
    
    // List all tables
    try {
      const tablesResult = await db.run(`
        SELECT name FROM sqlite_master 
        WHERE type='table' 
        ORDER BY name
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