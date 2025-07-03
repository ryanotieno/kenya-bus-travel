import { NextResponse } from "next/server"
import { db } from "@/lib/database"
import { sql } from "drizzle-orm"

export async function GET() {
  try {
    console.log("🔧 Checking and fixing database tables...")
    
    // Check what tables exist
    const tablesResult = await db.execute(sql`
      SELECT table_name as name FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `)
    
    console.log("📋 Existing tables:", tablesResult)
    
    // Create sessions table if it doesn't exist
    console.log("🔧 Creating sessions table...")
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS sessions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER,
        token VARCHAR(255) NOT NULL UNIQUE,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)
    console.log("✅ Sessions table created/verified")
    
    // Create users table if it doesn't exist
    console.log("🔧 Creating users table...")
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
    console.log("✅ Users table created/verified")
    
    // Insert a test user if none exist
    const userCountResult = await db.execute(sql`SELECT COUNT(*) as count FROM users`)
    const userCount = userCountResult[0]?.count || 0
    
    if (userCount === 0) {
      console.log("👤 Inserting test user...")
      await db.execute(sql`
        INSERT INTO users (first_name, last_name, email, phone, password, role) VALUES
        ('Charles', 'Otieno', 'otieno.charles@gmail.com', '+254700123456', 'password123', 'owner')
      `)
      console.log("✅ Test user inserted")
    }
    
    // Check final table status
    const finalTablesResult = await db.execute(sql`
      SELECT table_name as name FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `)
    
    const finalUserCountResult = await db.execute(sql`SELECT COUNT(*) as count FROM users`)
    const finalUserCount = finalUserCountResult[0]?.count || 0
    
    return NextResponse.json({
      success: true,
      message: "Database tables fixed successfully!",
      initialTables: tablesResult,
      finalTables: finalTablesResult,
      userCount: finalUserCount,
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