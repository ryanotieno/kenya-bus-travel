import { NextResponse } from "next/server"
import { db } from "@/lib/database"

export async function GET() {
  try {
    console.log("🔧 Initializing database...")
    
    // Create tables if they don't exist
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
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      -- Sessions table
      CREATE TABLE IF NOT EXISTS sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER REFERENCES users(id),
        token TEXT NOT NULL UNIQUE,
        expires_at DATETIME NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      -- Companies table
      CREATE TABLE IF NOT EXISTS companies (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        business_license TEXT NOT NULL,
        address TEXT NOT NULL,
        phone TEXT,
        email TEXT,
        owner_id INTEGER REFERENCES users(id),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      -- Saccos table
      CREATE TABLE IF NOT EXISTS saccos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        sacco_name TEXT NOT NULL,
        company_id INTEGER REFERENCES companies(id),
        route TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      -- Vehicles table
      CREATE TABLE IF NOT EXISTS vehicles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        reg_number TEXT NOT NULL UNIQUE,
        capacity INTEGER NOT NULL,
        sacco_id INTEGER REFERENCES saccos(id),
        driver_id INTEGER REFERENCES users(id),
        status TEXT DEFAULT 'active',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      -- Routes table
      CREATE TABLE IF NOT EXISTS routes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        start_location TEXT NOT NULL,
        end_location TEXT NOT NULL,
        distance REAL,
        estimated_time INTEGER,
        fare REAL NOT NULL,
        sacco_id INTEGER REFERENCES saccos(id),
        status TEXT DEFAULT 'active',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      -- Bus stops table
      CREATE TABLE IF NOT EXISTS bus_stops (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        location TEXT NOT NULL,
        latitude REAL,
        longitude REAL,
        route_id INTEGER REFERENCES routes(id),
        stop_order INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      -- Trips table
      CREATE TABLE IF NOT EXISTS trips (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        route_id INTEGER REFERENCES routes(id),
        vehicle_id INTEGER REFERENCES vehicles(id),
        driver_id INTEGER REFERENCES users(id),
        start_time DATETIME,
        end_time DATETIME,
        status TEXT DEFAULT 'scheduled',
        total_passengers INTEGER DEFAULT 0,
        total_revenue REAL DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      -- Tickets table
      CREATE TABLE IF NOT EXISTS tickets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        trip_id INTEGER REFERENCES trips(id),
        passenger_id INTEGER REFERENCES users(id),
        from_stop TEXT NOT NULL,
        to_stop TEXT NOT NULL,
        fare REAL NOT NULL,
        status TEXT DEFAULT 'booked',
        booked_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        used_at DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      -- Vehicle locations table
      CREATE TABLE IF NOT EXISTS vehicle_locations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        vehicle_id INTEGER REFERENCES vehicles(id),
        latitude REAL NOT NULL,
        longitude REAL NOT NULL,
        speed REAL,
        heading REAL,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      -- Driver performance table
      CREATE TABLE IF NOT EXISTS driver_performance (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        driver_id INTEGER REFERENCES users(id),
        date TEXT NOT NULL,
        trips_completed INTEGER DEFAULT 0,
        total_revenue REAL DEFAULT 0,
        total_distance REAL DEFAULT 0,
        on_time_performance REAL DEFAULT 0,
        safety_score REAL DEFAULT 0,
        customer_rating REAL DEFAULT 0,
        fuel_efficiency REAL DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `

    // Execute the SQL to create tables
    await db.run(createTablesSQL)
    
    console.log("✅ Database tables created successfully")
    
    return NextResponse.json({ 
      success: true, 
      message: "Database initialized successfully",
      tables: [
        "users", "sessions", "companies", "saccos", "vehicles", 
        "routes", "bus_stops", "trips", "tickets", 
        "vehicle_locations", "driver_performance"
      ]
    })
  } catch (error) {
    console.error("❌ Database initialization error:", error)
    return NextResponse.json({ 
      error: "Failed to initialize database",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
} 