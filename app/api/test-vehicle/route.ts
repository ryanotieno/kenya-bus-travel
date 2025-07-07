import { NextRequest, NextResponse } from "next/server"
import { vehicleService } from "@/lib/db-service"

export async function POST(request: NextRequest) {
  console.log('🧪 Test vehicle creation endpoint called');
  
  try {
    // Test data
    const testVehicle = {
      name: "Test Vehicle",
      regNumber: "TEST" + Date.now(), // Unique registration number
      capacity: 30,
      saccoId: 1, // Assuming sacco with ID 1 exists
      status: 'active' as const,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    console.log('📤 Creating test vehicle:', testVehicle);
    
    const vehicle = await vehicleService.create(testVehicle);
    console.log('✅ Test vehicle created successfully:', vehicle);
    
    return NextResponse.json({ 
      success: true, 
      message: "Test vehicle created successfully",
      vehicle 
    });
    
  } catch (error) {
    console.error("❌ Test vehicle creation failed:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ 
      success: false, 
      error: errorMessage 
    }, { status: 500 });
  }
} 