import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/database"

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Debug database configuration...');
    console.log('📊 DATABASE_URL:', process.env.DATABASE_URL ? 'SET' : 'NOT SET');
    console.log('📊 NODE_ENV:', process.env.NODE_ENV);
    
    // Test database connection
    const result = await db.select().from({ dummy: 'dummy' }).limit(1);
    console.log('📊 Database test result:', result);
    
    return NextResponse.json({ 
      success: true, 
      databaseUrl: process.env.DATABASE_URL ? 'SET' : 'NOT SET',
      nodeEnv: process.env.NODE_ENV,
      message: "Database configuration debug info"
    });
    
  } catch (error) {
    console.error("❌ Database debug error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ 
      success: false, 
      error: errorMessage,
      databaseUrl: process.env.DATABASE_URL ? 'SET' : 'NOT SET',
      nodeEnv: process.env.NODE_ENV
    }, { status: 500 });
  }
} 