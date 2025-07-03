import { NextResponse } from "next/server"
import { db } from "@/lib/database"
import { sql } from "drizzle-orm"

export async function GET() {
  try {
    console.log("🔧 Initializing database...")
    
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
    
    // Create sessions table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS sessions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
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
        owner_id INTEGER REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)
    
    // Create saccos table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS saccos (
        id SERIAL PRIMARY KEY,
        sacco_name VARCHAR(255) NOT NULL,
        company_id INTEGER REFERENCES companies(id),
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
        sacco_id INTEGER REFERENCES saccos(id),
        driver_id INTEGER REFERENCES users(id),
        status VARCHAR(50) DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)
    
    console.log("✅ Database tables created successfully")
    
    return NextResponse.json({ 
      success: true, 
      message: "Database initialized successfully with PostgreSQL syntax",
      environment: process.env.NODE_ENV === 'production' ? 'production' : 'development',
      database: "PostgreSQL",
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