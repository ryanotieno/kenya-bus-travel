import { NextResponse } from "next/server"
import { db } from "@/lib/database"
import { migrate } from "drizzle-orm/better-sqlite3/migrator"

export async function GET() {
  try {
    console.log("🔧 Initializing database with Drizzle migrations...")
    
    // Use Drizzle's migration system to create tables
    // This ensures the schema matches exactly what the ORM expects
    await migrate(db, { migrationsFolder: "./drizzle" })
    
    console.log("✅ Database tables created successfully with Drizzle")
    
    return NextResponse.json({ 
      success: true, 
      message: "Database initialized successfully with Drizzle migrations",
      tables: [
        "users", "sessions", "companies", "saccos", "vehicles", 
        "routes", "bus_stops", "trips", "tickets", 
        "vehicle_locations", "driver_performance"
      ]
    })
  } catch (error) {
    console.error("❌ Database initialization error:", error)
    
    // If migration fails, try creating tables manually with correct schema
    try {
      console.log("🔄 Migration failed, trying manual table creation...")
      
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

        -- Sessions table
        CREATE TABLE IF NOT EXISTS sessions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER REFERENCES users(id),
          token TEXT NOT NULL UNIQUE,
          expires_at INTEGER NOT NULL,
          created_at INTEGER DEFAULT (unixepoch())
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
          created_at INTEGER DEFAULT (unixepoch()),
          updated_at INTEGER DEFAULT (unixepoch())
        );

        -- Saccos table
        CREATE TABLE IF NOT EXISTS saccos (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          sacco_name TEXT NOT NULL,
          company_id INTEGER REFERENCES companies(id),
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
          sacco_id INTEGER REFERENCES saccos(id),
          driver_id INTEGER REFERENCES users(id),
          status TEXT DEFAULT 'active',
          created_at INTEGER DEFAULT (unixepoch()),
          updated_at INTEGER DEFAULT (unixepoch())
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
          created_at INTEGER DEFAULT (unixepoch()),
          updated_at INTEGER DEFAULT (unixepoch())
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
          created_at INTEGER DEFAULT (unixepoch()),
          updated_at INTEGER DEFAULT (unixepoch())
        );

        -- Trips table
        CREATE TABLE IF NOT EXISTS trips (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          route_id INTEGER REFERENCES routes(id),
          vehicle_id INTEGER REFERENCES vehicles(id),
          driver_id INTEGER REFERENCES users(id),
          start_time INTEGER,
          end_time INTEGER,
          status TEXT DEFAULT 'scheduled',
          total_passengers INTEGER DEFAULT 0,
          total_revenue REAL DEFAULT 0,
          created_at INTEGER DEFAULT (unixepoch()),
          updated_at INTEGER DEFAULT (unixepoch())
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
          booked_at INTEGER DEFAULT (unixepoch()),
          used_at INTEGER,
          created_at INTEGER DEFAULT (unixepoch()),
          updated_at INTEGER DEFAULT (unixepoch())
        );

        -- Vehicle locations table
        CREATE TABLE IF NOT EXISTS vehicle_locations (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          vehicle_id INTEGER REFERENCES vehicles(id),
          latitude REAL NOT NULL,
          longitude REAL NOT NULL,
          speed REAL,
          heading REAL,
          timestamp INTEGER DEFAULT (unixepoch())
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
          created_at INTEGER DEFAULT (unixepoch()),
          updated_at INTEGER DEFAULT (unixepoch())
        );
      `

      await db.run(createTablesSQL)
      console.log("✅ Manual table creation successful")
      
      return NextResponse.json({ 
        success: true, 
        message: "Database initialized successfully with manual table creation",
        tables: [
          "users", "sessions", "companies", "saccos", "vehicles", 
          "routes", "bus_stops", "trips", "tickets", 
          "vehicle_locations", "driver_performance"
        ]
      })
    } catch (manualError) {
      console.error("❌ Manual table creation also failed:", manualError)
      return NextResponse.json({ 
        error: "Failed to initialize database",
        details: error instanceof Error ? error.message : "Unknown error"
      }, { status: 500 })
    }
  }
} 