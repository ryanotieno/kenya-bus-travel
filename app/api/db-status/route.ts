import { NextResponse } from "next/server"
import { db } from "@/lib/database"
import { sql } from "drizzle-orm"

export async function GET() {
  try {
    console.log("🔍 Checking database status...")
    
    const isProduction = process.env.NODE_ENV === 'production'
    const status: any = {
      environment: isProduction ? 'production' : 'development',
      database: 'PostgreSQL',
      tables: {},
      data: {},
      errors: []
    }
    
    // Check each table
    const tables = ['users', 'companies', 'saccos', 'vehicles', 'sessions']
    
    for (const table of tables) {
      try {
        const result = await db.execute(sql`SELECT COUNT(*) as count FROM ${sql.identifier(table)}`)
        const count = result[0]?.count || 0
        status.tables[table] = {
          exists: true,
          count: count
        }
        status.data[table] = count
      } catch (error) {
        status.tables[table] = {
          exists: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        }
        status.errors.push(`${table} table: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    }
    
    // Check for sample users
    try {
      const users = await db.execute(sql`
        SELECT id, first_name, last_name, email, role 
        FROM users 
        ORDER BY id 
        LIMIT 10
      `)
      status.sampleUsers = users
    } catch (error) {
      status.errors.push(`Could not fetch users: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
    
    // Check for sample saccos
    try {
      const saccos = await db.execute(sql`
        SELECT id, sacco_name, route 
        FROM saccos 
        ORDER BY id 
        LIMIT 10
      `)
      status.sampleSaccos = saccos
    } catch (error) {
      status.errors.push(`Could not fetch saccos: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
    
    // Overall status
    const existingTables = Object.values(status.tables).filter((t: any) => t.exists).length
    status.overall = {
      totalTables: tables.length,
      existingTables,
      missingTables: tables.length - existingTables,
      isReady: existingTables === tables.length && status.errors.length === 0
    }
    
    console.log("📊 Database status:", status)
    
    return NextResponse.json({
      success: true,
      status,
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error("❌ Database status check failed:", error)
    return NextResponse.json({
      success: false,
      error: "Failed to check database status",
      details: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
} 