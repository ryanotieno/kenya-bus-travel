import { NextResponse } from "next/server"
import { db } from "@/lib/database"

export async function GET() {
  try {
    console.log("🔧 Checking and fixing database tables...")
    
    // Check what tables exist
    const tablesResult = await db.run(`
      SELECT name FROM sqlite_master 
      WHERE type='table' 
      ORDER BY name
    `)
    
    console.log("📋 Existing tables:", tablesResult)
    
    // Create sessions table if it doesn't exist
    console.log("🔧 Creating sessions table...")
    await db.run(`
      CREATE TABLE IF NOT EXISTS sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        token TEXT NOT NULL UNIQUE,
        expires_at INTEGER NOT NULL,
        created_at INTEGER DEFAULT (unixepoch())
      )
    `)
    console.log("✅ Sessions table created/verified")
    
    // Create users table if it doesn't exist
    console.log("🔧 Creating users table...")
    await db.run(`
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
    console.log("✅ Users table created/verified")
    
    // Insert a test user if none exist
    const userCount = await db.run("SELECT COUNT(*) as count FROM users")
    if (userCount.count === 0) {
      console.log("👤 Inserting test user...")
      await db.run(`
        INSERT INTO users (first_name, last_name, email, phone, password, role) VALUES
        ('Charles', 'Otieno', 'otieno.charles@gmail.com', '+254700123456', 'password123', 'owner')
      `)
      console.log("✅ Test user inserted")
    }
    
    // Check final table status
    const finalTablesResult = await db.run(`
      SELECT name FROM sqlite_master 
      WHERE type='table' 
      ORDER BY name
    `)
    
    const finalUserCount = await db.run("SELECT COUNT(*) as count FROM users")
    
    return NextResponse.json({
      success: true,
      message: "Database tables fixed successfully!",
      initialTables: tablesResult,
      finalTables: finalTablesResult,
      userCount: finalUserCount.count,
      testAccount: {
        email: "otieno.charles@gmail.com",
        password: "password123"
      },
      nextSteps: [
        "Try logging in with the test account above",
        "Or register a new user account"
      ]
    })
    
  } catch (error) {
    console.error("❌ Database fix failed:", error)
    return NextResponse.json({
      success: false,
      error: "Failed to fix database",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
} 