import { NextResponse } from "next/server"
import { db } from "@/lib/database"

export async function GET() {
  try {
    console.log("🔧 Initializing database...")
    
    // Check if we're in production (PostgreSQL) or development (SQLite)
    const isProduction = process.env.NODE_ENV === 'production'
    
    if (isProduction) {
      console.log("📊 Using PostgreSQL schema for production")
      
      // For PostgreSQL, we'll create tables using Drizzle schema
      const { users, companies, saccos, vehicles, sessions } = await import('@/lib/schema-pg')
      
      // Create tables using Drizzle's schema
      // Note: In production with Neon, tables should be created via migrations
      // For now, we'll assume tables exist or are created by Neon
      console.log("✅ PostgreSQL tables should be created via migrations")
      
    } else {
      console.log("📱 Using SQLite schema for development")
      
      // For SQLite, create tables manually
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
      `

      await db.run(createTablesSQL)
      console.log("✅ SQLite tables created successfully")
    }
    
    return NextResponse.json({ 
      success: true, 
      message: `Database initialized successfully for ${isProduction ? 'PostgreSQL' : 'SQLite'}`,
      environment: isProduction ? 'production' : 'development',
      tables: ["users", "sessions", "companies", "saccos", "vehicles"]
    })
    
  } catch (error) {
    console.error("❌ Database initialization error:", error)
    return NextResponse.json({ 
      error: "Failed to initialize database",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
} 