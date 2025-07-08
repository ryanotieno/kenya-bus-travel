import { NextResponse } from 'next/server';
import { db } from '@/lib/database';

export async function GET() {
  try {
    // Get list of all tables
    const result = await db.execute(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);

    // Get drivers table structure specifically
    const driversTableInfo = await db.execute(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'drivers' 
      ORDER BY ordinal_position;
    `);

    // Check if drivers table has any data
    const driversCount = await db.execute(`
      SELECT COUNT(*) as count FROM drivers;
    `);

    return NextResponse.json({ 
      success: true, 
      tables: result.rows,
      driversTableStructure: driversTableInfo.rows,
      driversCount: driversCount.rows[0]?.count || 0
    });

  } catch (error) {
    console.error('Error checking tables:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to check tables',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 