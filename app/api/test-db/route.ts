import { NextResponse } from "next/server"
import { db } from "@/lib/database"
import { sql } from "drizzle-orm"

export async function GET() {
  try {
    console.log("🔍 Testing database connection and tables...")
    
    // Test 1: Check if we can connect
    console.log("📊 Testing database connection...")
    
    // Test 2: List all tables
    console.log("📋 Checking existing tables...")
    const tablesResult = await db.execute(sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `)
    
    const tables = tablesResult.map((row: any) => row.table_name)
    console.log("✅ Existing tables:", tables)
    
    // Test 3: Check if routes table exists specifically
    const routesExists = tables.includes('routes')
    console.log(`🔍 Routes table exists: ${routesExists}`)
    
    // Test 4: If routes table exists, try to query it
    let routesCount = 0
    if (routesExists) {
      try {
        const routesResult = await db.execute(sql`SELECT COUNT(*) as count FROM routes`)
        routesCount = routesResult[0]?.count || 0
        console.log(`📊 Routes table has ${routesCount} records`)
      } catch (error) {
        console.log("❌ Error querying routes table:", error)
      }
    }
    
    return NextResponse.json({
      success: true,
      tables,
      routesExists,
      routesCount,
      message: "Database test completed"
    })
    
  } catch (error) {
    console.error("❌ Database test failed:", error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      message: "Database test failed"
    }, { status: 500 })
  }
} 