import { NextResponse } from "next/server"
import { db } from "@/lib/database"

export async function GET() {
  try {
    console.log("🔧 Setting up database with sample data...")
    
    const isProduction = process.env.NODE_ENV === 'production'
    console.log(`📊 Environment: ${isProduction ? 'Production (PostgreSQL)' : 'Development (SQLite)'}`)
    
    if (isProduction) {
      // For PostgreSQL, we'll use the schema directly
      console.log("📊 Using PostgreSQL schema")
      
      // Import the PostgreSQL schema
      const { users, companies, saccos, vehicles } = await import('@/lib/schema-pg')
      
      // For now, we'll assume tables exist in production
      // In a real setup, you'd run migrations first
      console.log("✅ Assuming PostgreSQL tables exist (run migrations if needed)")
      
    } else {
      // For SQLite, create tables manually
      console.log("📱 Using SQLite schema")
      
      const createTablesSQL = `
        -- Users table
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
        );

        -- Companies table
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
        );

        -- Saccos table
        CREATE TABLE IF NOT EXISTS saccos (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          sacco_name TEXT NOT NULL,
          company_id INTEGER,
          route TEXT,
          created_at INTEGER DEFAULT (unixepoch()),
          updated_at INTEGER DEFAULT (unixepoch())
        );

        -- Vehicles table
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
        );

        -- Sessions table
        CREATE TABLE IF NOT EXISTS sessions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER,
          token TEXT NOT NULL UNIQUE,
          expires_at INTEGER NOT NULL,
          created_at INTEGER DEFAULT (unixepoch())
        );
      `

      await db.run(createTablesSQL)
      console.log("✅ SQLite tables created successfully")
    }
    
    // Insert sample companies
    console.log("🏢 Inserting sample companies...")
    const companiesSQL = `
      INSERT OR IGNORE INTO companies (id, name, business_license, address, phone, email) VALUES
      (1, 'Latema Transport Ltd', 'LIC001', 'Nairobi, Kenya', '+254700123456', 'info@latema.co.ke'),
      (2, 'Kiragi Transport', 'LIC002', 'Kisumu, Kenya', '+254700123457', 'info@kiragi.co.ke'),
      (3, 'Kile Kile Transport', 'LIC003', 'Nakuru, Kenya', '+254700123458', 'info@kilekile.co.ke')
    `
    await db.run(companiesSQL)
    console.log("✅ Sample companies inserted")
    
    // Insert sample saccos
    console.log("🚌 Inserting sample saccos...")
    const saccosSQL = `
      INSERT OR IGNORE INTO saccos (id, sacco_name, company_id, route) VALUES
      (1, 'Latema Sacco', 1, 'Nairobi - Mombasa'),
      (2, 'Kiragi Sacco', 2, 'Nairobi - Kisumu'),
      (3, 'KILE KILE', 3, 'Nairobi - Nakuru')
    `
    await db.run(saccosSQL)
    console.log("✅ Sample saccos inserted")
    
    // Insert sample vehicles
    console.log("🚗 Inserting sample vehicles...")
    const vehiclesSQL = `
      INSERT OR IGNORE INTO vehicles (id, name, reg_number, capacity, sacco_id, status) VALUES
      (1, 'Latema Bus 1', 'KCA 123A', 45, 1, 'active'),
      (2, 'Kiragi Bus 1', 'KCA 456B', 52, 2, 'active'),
      (3, 'Kile Kile Bus 1', 'KCA 789C', 48, 3, 'active'),
      (4, 'Latema Bus 2', 'KCA 124A', 45, 1, 'active'),
      (5, 'Kiragi Bus 2', 'KCA 457B', 52, 2, 'active')
    `
    await db.run(vehiclesSQL)
    console.log("✅ Sample vehicles inserted")
    
    // Insert sample users (owners and drivers)
    console.log("👥 Inserting sample users...")
    const usersSQL = `
      INSERT OR IGNORE INTO users (id, first_name, last_name, email, phone, password, role) VALUES
      (1, 'Charles', 'Otieno', 'otieno.charles@gmail.com', '+254700123456', 'password123', 'owner'),
      (2, 'John', 'Doe', 'john.doe@example.com', '+254700123457', 'password123', 'owner'),
      (3, 'Jane', 'Smith', 'jane.smith@example.com', '+254700123458', 'password123', 'owner'),
      (4, 'Ryan', 'Otieno', 'ryanotieno@gmail.com', '+254700123459', 'password1', 'driver'),
      (5, 'Alice', 'Johnson', 'alice.johnson@example.com', '+254700123460', 'password1', 'driver')
    `
    await db.run(usersSQL)
    console.log("✅ Sample users inserted")
    
    // Update companies with owner IDs
    console.log("🔗 Linking companies to owners...")
    const updateCompaniesSQL = `
      UPDATE companies SET owner_id = 1 WHERE id = 1;
      UPDATE companies SET owner_id = 2 WHERE id = 2;
      UPDATE companies SET owner_id = 3 WHERE id = 3;
    `
    await db.run(updateCompaniesSQL)
    console.log("✅ Companies linked to owners")
    
    // Verify the setup
    console.log("🔍 Verifying database setup...")
    const userCount = await db.run("SELECT COUNT(*) as count FROM users")
    const companyCount = await db.run("SELECT COUNT(*) as count FROM companies")
    const saccoCount = await db.run("SELECT COUNT(*) as count FROM saccos")
    const vehicleCount = await db.run("SELECT COUNT(*) as count FROM vehicles")
    
    console.log("📊 Database verification results:")
    console.log(`   Users: ${userCount.count}`)
    console.log(`   Companies: ${companyCount.count}`)
    console.log(`   Saccos: ${saccoCount.count}`)
    console.log(`   Vehicles: ${vehicleCount.count}`)
    
    return NextResponse.json({
      success: true,
      message: "Database setup completed successfully",
      environment: isProduction ? 'production' : 'development',
      database: isProduction ? 'PostgreSQL' : 'SQLite',
      tables: ["users", "companies", "saccos", "vehicles", "sessions"],
      sampleData: {
        users: userCount.count,
        companies: companyCount.count,
        saccos: saccoCount.count,
        vehicles: vehicleCount.count
      },
      testAccounts: {
        owners: [
          { email: "otieno.charles@gmail.com", password: "password123" },
          { email: "john.doe@example.com", password: "password123" },
          { email: "jane.smith@example.com", password: "password123" }
        ],
        drivers: [
          { email: "ryanotieno@gmail.com", password: "password1" },
          { email: "alice.johnson@example.com", password: "password1" }
        ]
      },
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error("❌ Database setup failed:", error)
    return NextResponse.json({
      error: "Failed to setup database",
      details: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
} 