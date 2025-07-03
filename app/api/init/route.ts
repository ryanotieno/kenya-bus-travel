// VERSION 2.0 - PostgreSQL syntax fix - force complete rebuild
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
    
    // Create routes table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS routes (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        start_location VARCHAR(255) NOT NULL,
        end_location VARCHAR(255) NOT NULL,
        distance REAL,
        estimated_time INTEGER,
        fare REAL NOT NULL DEFAULT 0,
        sacco_id INTEGER,
        status VARCHAR(50) DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)
    
    // Create bus_stops table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS bus_stops (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        location VARCHAR(255) NOT NULL,
        latitude REAL,
        longitude REAL,
        route_id INTEGER,
        stop_order INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)
    
    // Create trips table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS trips (
        id SERIAL PRIMARY KEY,
        route_id INTEGER,
        vehicle_id INTEGER,
        driver_id INTEGER,
        start_time TIMESTAMP,
        end_time TIMESTAMP,
        status VARCHAR(50) DEFAULT 'scheduled',
        total_passengers INTEGER DEFAULT 0,
        total_revenue REAL DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)
    
    // Create tickets table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS tickets (
        id SERIAL PRIMARY KEY,
        trip_id INTEGER,
        passenger_id INTEGER,
        from_stop VARCHAR(255) NOT NULL,
        to_stop VARCHAR(255) NOT NULL,
        fare REAL NOT NULL,
        status VARCHAR(50) DEFAULT 'booked',
        booked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        used_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)
    
    // Create vehicle_locations table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS vehicle_locations (
        id SERIAL PRIMARY KEY,
        vehicle_id INTEGER,
        latitude REAL NOT NULL,
        longitude REAL NOT NULL,
        speed REAL,
        heading REAL,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)
    
    // Create driver_performance table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS driver_performance (
        id SERIAL PRIMARY KEY,
        driver_id INTEGER,
        date VARCHAR(10) NOT NULL,
        trips_completed INTEGER DEFAULT 0,
        total_revenue REAL DEFAULT 0,
        total_distance REAL DEFAULT 0,
        on_time_performance REAL DEFAULT 0,
        safety_score REAL DEFAULT 0,
        customer_rating REAL DEFAULT 0,
        fuel_efficiency REAL DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)
    
    console.log("✅ Tables created successfully")
    
    // Step 2: Insert sample data
    console.log("📝 Inserting sample data...")
    
    // Insert users
    await db.execute(sql`
      INSERT INTO users (first_name, last_name, email, phone, password, role) VALUES
      ('Charles', 'Otieno', 'otieno.charles@gmail.com', '+254700123456', 'password123', 'owner'),
      ('Ryan', 'Otieno', 'ryanotieno@gmail.com', '+254700123457', 'password1', 'driver'),
      ('John', 'Doe', 'john.doe@example.com', '+254700123458', 'password123', 'owner')
      ON CONFLICT (email) DO NOTHING
    `)
    console.log("✅ Users inserted")
    
    // Insert companies - we'll get the user IDs first
    const charlesUser = await db.execute(sql`SELECT id FROM users WHERE email = 'otieno.charles@gmail.com'`)
    const johnUser = await db.execute(sql`SELECT id FROM users WHERE email = 'john.doe@example.com'`)
    
    const charlesId = charlesUser[0]?.id
    const johnId = johnUser[0]?.id
    
    if (charlesId && johnId) {
      await db.execute(sql`
        INSERT INTO companies (name, business_license, address, phone, email, owner_id) VALUES
        ('Latema Transport Ltd', 'LIC001', 'Nairobi, Kenya', '+254700123456', 'info@latema.co.ke', ${charlesId}),
        ('Kiragi Transport', 'LIC002', 'Kisumu, Kenya', '+254700123457', 'info@kiragi.co.ke', ${johnId})
        ON CONFLICT (business_license) DO NOTHING
      `)
    }
    console.log("✅ Companies inserted")
    
    // Insert saccos - we'll get the company IDs first
    const latemaCompany = await db.execute(sql`SELECT id FROM companies WHERE business_license = 'LIC001'`)
    const kiragiCompany = await db.execute(sql`SELECT id FROM companies WHERE business_license = 'LIC002'`)
    
    const latemaId = latemaCompany[0]?.id
    const kiragiId = kiragiCompany[0]?.id
    
    if (latemaId && kiragiId) {
      await db.execute(sql`
        INSERT INTO saccos (sacco_name, company_id, route) VALUES
        ('Latema Sacco', ${latemaId}, 'Nairobi - Mombasa'),
        ('Kiragi Sacco', ${kiragiId}, 'Nairobi - Kisumu')
        ON CONFLICT (sacco_name) DO NOTHING
      `)
    }
    console.log("✅ Saccos inserted")
    
    // Insert vehicles - we'll get the sacco IDs first
    const latemaSacco = await db.execute(sql`SELECT id FROM saccos WHERE sacco_name = 'Latema Sacco'`)
    const kiragiSacco = await db.execute(sql`SELECT id FROM saccos WHERE sacco_name = 'Kiragi Sacco'`)
    
    const latemaSaccoId = latemaSacco[0]?.id
    const kiragiSaccoId = kiragiSacco[0]?.id
    
    if (latemaSaccoId && kiragiSaccoId) {
      await db.execute(sql`
        INSERT INTO vehicles (name, reg_number, capacity, sacco_id, status) VALUES
        ('Latema Bus 1', 'KCA 123A', 45, ${latemaSaccoId}, 'active'),
        ('Kiragi Bus 1', 'KCA 456B', 52, ${kiragiSaccoId}, 'active')
        ON CONFLICT (reg_number) DO NOTHING
      `)
    }
    console.log("✅ Vehicles inserted")
    
    // Step 3: Verify setup
    console.log("🔍 Verifying setup...")
    const userCountResult = await db.execute(sql`SELECT COUNT(*) as count FROM users`)
    const companyCountResult = await db.execute(sql`SELECT COUNT(*) as count FROM companies`)
    const saccoCountResult = await db.execute(sql`SELECT COUNT(*) as count FROM saccos`)
    const vehicleCountResult = await db.execute(sql`SELECT COUNT(*) as count FROM vehicles`)
    const routeCountResult = await db.execute(sql`SELECT COUNT(*) as count FROM routes`)
    
    const userCount = userCountResult[0]?.count || 0
    const companyCount = companyCountResult[0]?.count || 0
    const saccoCount = saccoCountResult[0]?.count || 0
    const vehicleCount = vehicleCountResult[0]?.count || 0
    const routeCount = routeCountResult[0]?.count || 0
    
    console.log("📊 Verification results:")
    console.log(`   Users: ${userCount}`)
    console.log(`   Companies: ${companyCount}`)
    console.log(`   Saccos: ${saccoCount}`)
    console.log(`   Vehicles: ${vehicleCount}`)
    console.log(`   Routes: ${routeCount}`)
    
    return NextResponse.json({
      success: true,
      message: "Database initialized successfully!",
      environment: isProduction ? 'production' : 'development',
      data: {
        users: userCount,
        companies: companyCount,
        saccos: saccoCount,
        vehicles: vehicleCount,
        routes: routeCount
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