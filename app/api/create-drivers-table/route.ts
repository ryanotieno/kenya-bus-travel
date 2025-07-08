import { NextResponse } from 'next/server';
import { db } from '@/lib/database';

export async function POST() {
  try {
    // Create drivers table if it doesn't exist
    await db.execute(`
      CREATE TABLE IF NOT EXISTS drivers (
        id SERIAL PRIMARY KEY,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        phone TEXT,
        password TEXT NOT NULL,
        license_number TEXT NOT NULL UNIQUE,
        license_expires TIMESTAMP,
        vehicle_id INTEGER,
        sacco_id INTEGER,
        status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Add foreign key constraints if they don't exist
    await db.execute(`
      DO $$ 
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                      WHERE constraint_name = 'drivers_vehicle_id_fkey') THEN
          ALTER TABLE drivers 
          ADD CONSTRAINT drivers_vehicle_id_fkey 
          FOREIGN KEY (vehicle_id) REFERENCES vehicles(id);
        END IF;
      END $$;
    `);

    await db.execute(`
      DO $$ 
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                      WHERE constraint_name = 'drivers_sacco_id_fkey') THEN
          ALTER TABLE drivers 
          ADD CONSTRAINT drivers_sacco_id_fkey 
          FOREIGN KEY (sacco_id) REFERENCES saccos(id);
        END IF;
      END $$;
    `);

    // Update vehicles table to reference drivers if column doesn't exist
    await db.execute(`
      DO $$ 
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                      WHERE table_name = 'vehicles' AND column_name = 'driver_id') THEN
          ALTER TABLE vehicles ADD COLUMN driver_id INTEGER;
        END IF;
      END $$;
    `);

    await db.execute(`
      DO $$ 
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                      WHERE constraint_name = 'vehicles_driver_id_fkey') THEN
          ALTER TABLE vehicles 
          ADD CONSTRAINT vehicles_driver_id_fkey 
          FOREIGN KEY (driver_id) REFERENCES drivers(id);
        END IF;
      END $$;
    `);

    // Update sessions table to support drivers if columns don't exist
    await db.execute(`
      DO $$ 
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                      WHERE table_name = 'sessions' AND column_name = 'driver_id') THEN
          ALTER TABLE sessions ADD COLUMN driver_id INTEGER;
        END IF;
      END $$;
    `);

    await db.execute(`
      DO $$ 
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                      WHERE table_name = 'sessions' AND column_name = 'user_type') THEN
          ALTER TABLE sessions ADD COLUMN user_type TEXT DEFAULT 'user' 
          CHECK (user_type IN ('user', 'driver', 'owner'));
        END IF;
      END $$;
    `);

    await db.execute(`
      DO $$ 
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                      WHERE constraint_name = 'sessions_driver_id_fkey') THEN
          ALTER TABLE sessions 
          ADD CONSTRAINT sessions_driver_id_fkey 
          FOREIGN KEY (driver_id) REFERENCES drivers(id);
        END IF;
      END $$;
    `);

    return NextResponse.json({ 
      success: true, 
      message: 'Drivers table created successfully with all necessary constraints' 
    });

  } catch (error) {
    console.error('Error creating drivers table:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to create drivers table',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 