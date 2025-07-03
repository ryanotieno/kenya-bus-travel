import { NextResponse } from "next/server"
import { userService, saccoService, companyService, vehicleService } from "@/lib/db-service"

export async function GET() {
  try {
    console.log("🔍 Checking database tables...")
    
    const checks = {
      users: false,
      saccos: false,
      companies: false,
      vehicles: false,
      sessions: false
    }
    
    // Check each table
    try {
      await userService.getAll()
      checks.users = true
      console.log("✅ Users table exists")
    } catch (error) {
      console.log("❌ Users table missing")
    }
    
    try {
      await saccoService.getAll()
      checks.saccos = true
      console.log("✅ Saccos table exists")
    } catch (error) {
      console.log("❌ Saccos table missing")
    }
    
    try {
      await companyService.getAll()
      checks.companies = true
      console.log("✅ Companies table exists")
    } catch (error) {
      console.log("❌ Companies table missing")
    }
    
    try {
      await vehicleService.getAll()
      checks.vehicles = true
      console.log("✅ Vehicles table exists")
    } catch (error) {
      console.log("❌ Vehicles table missing")
    }
    
    // Check sessions table
    try {
      const { db } = await import("@/lib/database")
      await db.run("SELECT 1 FROM sessions LIMIT 1")
      checks.sessions = true
      console.log("✅ Sessions table exists")
    } catch (error) {
      console.log("❌ Sessions table missing")
    }
    
    const allTablesExist = Object.values(checks).every(exists => exists)
    
    return NextResponse.json({
      status: allTablesExist ? "ready" : "needs_initialization",
      tables: checks,
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error("❌ Database check failed:", error)
    return NextResponse.json({
      status: "error",
      error: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
} 