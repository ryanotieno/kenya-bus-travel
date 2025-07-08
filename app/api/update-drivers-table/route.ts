import { NextResponse } from 'next/server';
import { db } from '@/lib/database';

export async function POST() {
  try {
    // Remove sacco_id foreign key constraint if it exists
    await db.execute(`
      DO $$ 
      BEGIN
        IF EXISTS (SELECT 1 FROM information_schema.table_constraints 
                  WHERE constraint_name = 'drivers_sacco_id_fkey') THEN
          ALTER TABLE drivers DROP CONSTRAINT drivers_sacco_id_fkey;
        END IF;
      END $$;
    `);

    // Remove sacco_id column from drivers table
    await db.execute(`
      DO $$ 
      BEGIN
        IF EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'drivers' AND column_name = 'sacco_id') THEN
          ALTER TABLE drivers DROP COLUMN sacco_id;
        END IF;
      END $$;
    `);

    // Verify the updated table structure
    const driversTableInfo = await db.execute(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'drivers' 
      ORDER BY ordinal_position;
    `);

    return NextResponse.json({ 
      success: true, 
      message: 'Drivers table updated successfully - removed sacco_id column',
      updatedStructure: driversTableInfo.rows
    });

  } catch (error) {
    console.error('Error updating drivers table:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to update drivers table',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 