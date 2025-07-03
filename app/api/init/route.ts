import { NextResponse } from "next/server"
import { db } from "@/lib/database"
import { sql } from "drizzle-orm"

export async function GET() {
  try {
    console.log("🚀 Starting database initialization...")
    
    const isProduction = process.env.NODE_ENV === 'production'
    console.log(`📊 Environment: ${isProduction ? 'Production' : 'Development'}`)
    
    // Step 1: Create tables
    console.log("📋 Creating database tables...")
    
    // Create users table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        phone TEXT,
        password TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'user',
        created_at INTEGER DEFAULT (unixepoch()),
        updated_at INTEGER DEFAULT (unixepoch())
      )
    `)
    
    // Create sessions table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        token TEXT NOT NULL UNIQUE,
        expires_at INTEGER NOT NULL,
        created_at INTEGER DEFAULT (unixepoch())
      )
    `)
    
    // Create companies table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS companies (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        business_license TEXT NOT NULL,
        address TEXT NOT NULL,
        phone TEXT,
        email TEXT,
        owner_id INTEGER,
        created_at INTEGER DEFAULT (unixepoch()),
        updated_at INTEGER DEFAULT (unixepoch())
      )
    `)
    
    // Create saccos table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS saccos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        sacco_name TEXT NOT NULL,
        company_id INTEGER,
        route TEXT,
        created_at INTEGER DEFAULT (unixepoch()),
        updated_at INTEGER DEFAULT (unixepoch())
      )
    `)
    
    // Create vehicles table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS vehicles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        reg_number TEXT NOT NULL UNIQUE,
        capacity INTEGER NOT NULL,
        sacco_id INTEGER,
        driver_id INTEGER,
        status TEXT DEFAULT 'active',
        created_at INTEGER DEFAULT (unixepoch()),
        updated_at INTEGER DEFAULT (unixepoch())
      )
    `)
    
    console.log("✅ Tables created successfully")
    
    // Step 2: Insert sample data
    console.log("📝 Inserting sample data...")
    
    // Insert users
    await db.execute(sql`
      INSERT OR IGNORE INTO users (id, first_name, last_name, email, phone, password, role) VALUES
      (1, 'Charles', 'Otieno', 'otieno.charles@gmail.com', '+254700123456', 'password123', 'owner'),
      (2, 'Ryan', 'Otieno', 'ryanotieno@gmail.com', '+254700123457', 'password1', 'driver'),
      (3, 'John', 'Doe', 'john.doe@example.com', '+254700123458', 'password123', 'owner')
    `)
    console.log("✅ Users inserted")
    
    // Insert companies
    await db.execute(sql`
      INSERT OR IGNORE INTO companies (id, name, business_license, address, phone, email, owner_id) VALUES
      (1, 'Latema Transport Ltd', 'LIC001', 'Nairobi, Kenya', '+254700123456', 'info@latema.co.ke', 1),
      (2, 'Kiragi Transport', 'LIC002', 'Kisumu, Kenya', '+254700123457', 'info@kiragi.co.ke', 3)
    `)
    console.log("✅ Companies inserted")
    
    // Insert saccos
    await db.execute(sql`
      INSERT OR IGNORE INTO saccos (id, sacco_name, company_id, route) VALUES
      (1, 'Latema Sacco', 1, 'Nairobi - Mombasa'),
      (2, 'Kiragi Sacco', 2, 'Nairobi - Kisumu')
    `)
    console.log("✅ Saccos inserted")
    
    // Insert vehicles
    await db.execute(sql`
      INSERT OR IGNORE INTO vehicles (id, name, reg_number, capacity, sacco_id, status) VALUES
      (1, 'Latema Bus 1', 'KCA 123A', 45, 1, 'active'),
      (2, 'Kiragi Bus 1', 'KCA 456B', 52, 2, 'active')
    `)
    console.log("✅ Vehicles inserted")
    
    // Step 3: Verify setup
    console.log("🔍 Verifying setup...")
    const userCountResult = await db.execute(sql`SELECT COUNT(*) as count FROM users`)
    const companyCountResult = await db.execute(sql`SELECT COUNT(*) as count FROM companies`)
    const saccoCountResult = await db.execute(sql`SELECT COUNT(*) as count FROM saccos`)
    const vehicleCountResult = await db.execute(sql`SELECT COUNT(*) as count FROM vehicles`)
    
    const userCount = userCountResult[0]?.count || 0
    const companyCount = companyCountResult[0]?.count || 0
    const saccoCount = saccoCountResult[0]?.count || 0
    const vehicleCount = vehicleCountResult[0]?.count || 0
    
    console.log("📊 Verification results:")
    console.log(`   Users: ${userCount}`)
    console.log(`   Companies: ${companyCount}`)
    console.log(`   Saccos: ${saccoCount}`)
    console.log(`   Vehicles: ${vehicleCount}`)
    
    return NextResponse.json({
      success: true,
      message: "Database initialized successfully!",
      environment: isProduction ? 'production' : 'development',
      data: {
        users: userCount,
        companies: companyCount,
        saccos: saccoCount,
        vehicles: vehicleCount
      },
      testAccounts: {
        owner: { email: "otieno.charles@gmail.com", password: "password123" },
        driver: { email: "ryanotieno@gmail.com", password: "password1" }
      },
      nextSteps: [
        "Try logging in with the test accounts above",
        "Or register a new user account",
        "Visit /api/db-status to check database health"
      ]
    })
    
  } catch (error) {
    console.error("❌ Database initialization failed:", error)
    return NextResponse.json({
      success: false,
      error: "Failed to initialize database",
      details: error instanceof Error ? error.message : "Unknown error",
      suggestions: [
        "Check if DATABASE_URL environment variable is set",
        "For local development, make sure SQLite file is writable",
        "For production, check Neon database connection"
      ]
    }, { status: 500 })
  }
} 