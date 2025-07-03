import { NextResponse } from "next/server"
import { db } from "@/lib/database"
import { sql } from "drizzle-orm"

export async function GET() {
  try {
    console.log("🔧 Setting up database with sample data...")
    
    const isProduction = process.env.NODE_ENV === 'production'
    console.log('📊 Environment: Production (PostgreSQL)')
    
    // Create tables using PostgreSQL syntax
    console.log("📋 Creating database tables...")
    
    // Create users table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        first_name VARCHAR(255) NOT NULL,
        last_name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        phone VARCHAR(20),
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL DEFAULT 'user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)
    
    // Create companies table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS companies (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        business_license VARCHAR(255) NOT NULL,
        address TEXT NOT NULL,
        phone VARCHAR(20),
        email VARCHAR(255),
        owner_id INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)
    
    // Create saccos table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS saccos (
        id SERIAL PRIMARY KEY,
        sacco_name VARCHAR(255) NOT NULL,
        company_id INTEGER,
        route VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)
    
    // Create vehicles table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS vehicles (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        reg_number VARCHAR(20) NOT NULL UNIQUE,
        capacity INTEGER NOT NULL,
        sacco_id INTEGER,
        driver_id INTEGER,
        status VARCHAR(50) DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)
    
    // Create sessions table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS sessions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER,
        token VARCHAR(255) NOT NULL UNIQUE,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)
    
    console.log("✅ Database tables created successfully")
    
    // Insert sample companies
    console.log("🏢 Inserting sample companies...")
    await db.execute(sql`
      INSERT INTO companies (id, name, business_license, address, phone, email) VALUES
      (1, 'Latema Transport Ltd', 'LIC001', 'Nairobi, Kenya', '+254700123456', 'info@latema.co.ke'),
      (2, 'Kiragi Transport', 'LIC002', 'Kisumu, Kenya', '+254700123457', 'info@kiragi.co.ke'),
      (3, 'Kile Kile Transport', 'LIC003', 'Nakuru, Kenya', '+254700123458', 'info@kilekile.co.ke')
      ON CONFLICT (id) DO NOTHING
    `)
    console.log("✅ Sample companies inserted")
    
    // Insert sample saccos
    console.log("🚌 Inserting sample saccos...")
    await db.execute(sql`
      INSERT INTO saccos (id, sacco_name, company_id, route) VALUES
      (1, 'Latema Sacco', 1, 'Nairobi - Mombasa'),
      (2, 'Kiragi Sacco', 2, 'Nairobi - Kisumu'),
      (3, 'KILE KILE', 3, 'Nairobi - Nakuru')
      ON CONFLICT (id) DO NOTHING
    `)
    console.log("✅ Sample saccos inserted")
    
    // Insert sample vehicles
    console.log("🚗 Inserting sample vehicles...")
    await db.execute(sql`
      INSERT INTO vehicles (id, name, reg_number, capacity, sacco_id, status) VALUES
      (1, 'Latema Bus 1', 'KCA 123A', 45, 1, 'active'),
      (2, 'Kiragi Bus 1', 'KCA 456B', 52, 2, 'active'),
      (3, 'Kile Kile Bus 1', 'KCA 789C', 48, 3, 'active'),
      (4, 'Latema Bus 2', 'KCA 124A', 45, 1, 'active'),
      (5, 'Kiragi Bus 2', 'KCA 457B', 52, 2, 'active')
      ON CONFLICT (id) DO NOTHING
    `)
    console.log("✅ Sample vehicles inserted")
    
    // Insert sample users (owners and drivers)
    console.log("👥 Inserting sample users...")
    await db.execute(sql`
      INSERT INTO users (id, first_name, last_name, email, phone, password, role) VALUES
      (1, 'Charles', 'Otieno', 'otieno.charles@gmail.com', '+254700123456', 'password123', 'owner'),
      (2, 'John', 'Doe', 'john.doe@example.com', '+254700123457', 'password123', 'owner'),
      (3, 'Jane', 'Smith', 'jane.smith@example.com', '+254700123458', 'password123', 'owner'),
      (4, 'Ryan', 'Otieno', 'ryanotieno@gmail.com', '+254700123459', 'password1', 'driver'),
      (5, 'Alice', 'Johnson', 'alice.johnson@example.com', '+254700123460', 'password1', 'driver')
      ON CONFLICT (id) DO NOTHING
    `)
    console.log("✅ Sample users inserted")
    
    // Update companies with owner IDs
    console.log("🔗 Linking companies to owners...")
    await db.execute(sql`UPDATE companies SET owner_id = 1 WHERE id = 1`)
    await db.execute(sql`UPDATE companies SET owner_id = 2 WHERE id = 2`)
    await db.execute(sql`UPDATE companies SET owner_id = 3 WHERE id = 3`)
    console.log("✅ Companies linked to owners")
    
    // Verify the setup
    console.log("🔍 Verifying database setup...")
    const userCountResult = await db.execute(sql`SELECT COUNT(*) as count FROM users`)
    const companyCountResult = await db.execute(sql`SELECT COUNT(*) as count FROM companies`)
    const saccoCountResult = await db.execute(sql`SELECT COUNT(*) as count FROM saccos`)
    const vehicleCountResult = await db.execute(sql`SELECT COUNT(*) as count FROM vehicles`)
    
    const userCount = userCountResult[0]?.count || 0
    const companyCount = companyCountResult[0]?.count || 0
    const saccoCount = saccoCountResult[0]?.count || 0
    const vehicleCount = vehicleCountResult[0]?.count || 0
    
    console.log("📊 Database verification results:")
    console.log(`   Users: ${userCount}`)
    console.log(`   Companies: ${companyCount}`)
    console.log(`   Saccos: ${saccoCount}`)
    console.log(`   Vehicles: ${vehicleCount}`)
    
    return NextResponse.json({
      success: true,
      message: "Database setup completed successfully",
      environment: isProduction ? 'production' : 'development',
      database: 'PostgreSQL',
      tables: ["users", "companies", "saccos", "vehicles", "sessions"],
      sampleData: {
        users: userCount,
        companies: companyCount,
        saccos: saccoCount,
        vehicles: vehicleCount
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