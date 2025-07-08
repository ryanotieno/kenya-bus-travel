import { NextResponse } from 'next/server';
import { driverService } from '@/lib/db-service';

export async function GET() {
  try {
    console.log('🧪 Testing drivers table queries...');
    
    // Test getting all drivers
    const allDrivers = await driverService.getAll();
    console.log('✅ Successfully retrieved drivers:', allDrivers);

    // Test getting a specific driver by ID if any exist
    let specificDriver = null;
    if (allDrivers.length > 0) {
      specificDriver = await driverService.getById(allDrivers[0].id);
      console.log('✅ Successfully retrieved driver by ID:', specificDriver);
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Drivers table queries working correctly',
      driversCount: allDrivers.length,
      drivers: allDrivers,
      testDriver: specificDriver
    });

  } catch (error) {
    console.error('❌ Error testing drivers:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Driver query failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 