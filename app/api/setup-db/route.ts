import { NextResponse } from "next/server"
import { db } from "@/lib/database"

export async function GET() {
  try {
    console.log("🔧 Setting up database with sample data...")
    
    // Create all necessary tables
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
    console.log("✅ Tables created successfully")
    
    // Insert sample companies
    const companiesSQL = `
      INSERT OR IGNORE INTO companies (id, name, business_license, address, phone, email) VALUES
      (1, 'Latema Transport Ltd', 'LIC001', 'Nairobi, Kenya', '+254700123456', 'info@latema.co.ke'),
      (2, 'Kiragi Transport', 'LIC002', 'Kisumu, Kenya', '+254700123457', 'info@kiragi.co.ke'),
      (3, 'Kile Kile Transport', 'LIC003', 'Nakuru, Kenya', '+254700123458', 'info@kilekile.co.ke')
    `
    await db.run(companiesSQL)
    console.log("✅ Sample companies inserted")
    
    // Insert sample saccos
    const saccosSQL = `
      INSERT OR IGNORE INTO saccos (id, sacco_name, company_id, route) VALUES
      (1, 'Latema Sacco', 1, 'Nairobi - Mombasa'),
      (2, 'Kiragi Sacco', 2, 'Nairobi - Kisumu'),
      (3, 'KILE KILE', 3, 'Nairobi - Nakuru')
    `
    await db.run(saccosSQL)
    console.log("✅ Sample saccos inserted")
    
    // Insert sample vehicles
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
    
    // Insert sample users (owners)
    const usersSQL = `
      INSERT OR IGNORE INTO users (id, first_name, last_name, email, phone, password, role) VALUES
      (1, 'Charles', 'Otieno', 'otieno.charles@gmail.com', '+254700123456', 'password123', 'owner'),
      (2, 'John', 'Doe', 'john.doe@example.com', '+254700123457', 'password123', 'owner'),
      (3, 'Jane', 'Smith', 'jane.smith@example.com', '+254700123458', 'password123', 'owner')
    `
    await db.run(usersSQL)
    console.log("✅ Sample users inserted")
    
    // Update companies with owner IDs
    const updateCompaniesSQL = `
      UPDATE companies SET owner_id = 1 WHERE id = 1;
      UPDATE companies SET owner_id = 2 WHERE id = 2;
      UPDATE companies SET owner_id = 3 WHERE id = 3;
    `
    await db.run(updateCompaniesSQL)
    console.log("✅ Companies updated with owner IDs")
    
    return NextResponse.json({
      success: true,
      message: "Database setup completed successfully",
      tables: ["users", "companies", "saccos", "vehicles", "sessions"],
      sampleData: {
        companies: 3,
        saccos: 3,
        vehicles: 5,
        users: 3
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