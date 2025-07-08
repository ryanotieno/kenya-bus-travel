import { NextRequest, NextResponse } from "next/server"
import { vehicleService, saccoService } from "@/lib/db-service"

export async function GET(request: NextRequest) {
  try {
    console.log('🚀 GET /api/vehicles called');
    const { searchParams } = new URL(request.url)
    const saccoId = searchParams.get('saccoId')
    console.log('📥 SaccoId from params:', saccoId);
    
    let vehicles
    if (saccoId) {
      vehicles = await vehicleService.getAll()
      vehicles = vehicles.filter(v => v.saccoId === Number(saccoId))
    } else {
      vehicles = await vehicleService.getAll()
    }
    console.log('✅ Vehicles fetched:', vehicles.length);
    return NextResponse.json({ success: true, vehicles })
  } catch (error) {
    console.error("❌ Error fetching vehicles:", error)
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ success: false, error: errorMessage || "Failed to fetch vehicles" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  console.log('🚀 POST /api/vehicles called');
  try {
    const body = await request.json()
    console.log('📥 Request body:', body);
    
    const { name, regNumber, capacity, saccoId, status } = body
    if (!name || !regNumber || !capacity || !saccoId) {
      console.log('❌ Missing required fields:', { name, regNumber, capacity, saccoId });
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 })
    }
    
    console.log('✅ All required fields present');
    const vehicleData = {
      name,
      regNumber,
      capacity: Number(capacity),
      saccoId: Number(saccoId),
      status: status || 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    console.log('📤 Creating vehicle with data:', vehicleData);
    
    const vehicle = await vehicleService.create(vehicleData)
    console.log('✅ Vehicle created successfully:', vehicle);
    return NextResponse.json({ success: true, vehicle })
  } catch (error) {
    console.error("❌ Error adding vehicle:", error)
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    const errorStack = error instanceof Error ? error.stack : "No stack trace";
    console.error("❌ Error details:", errorMessage);
    console.error("❌ Error stack:", errorStack);
    return NextResponse.json({ success: false, error: errorMessage || "Failed to add vehicle" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  console.log('🚀 DELETE /api/vehicles called');
  try {
    const { searchParams } = new URL(request.url)
    const vehicleId = searchParams.get('id')
    
    if (!vehicleId) {
      console.log('❌ Missing vehicle ID');
      return NextResponse.json({ success: false, error: "Vehicle ID is required" }, { status: 400 })
    }
    
    console.log('📥 Deleting vehicle with ID:', vehicleId);
    
    const deletedVehicle = await vehicleService.deleteById(Number(vehicleId))
    
    if (deletedVehicle) {
      console.log('✅ Vehicle deleted successfully:', deletedVehicle);
      return NextResponse.json({ success: true, message: "Vehicle deleted successfully" })
    } else {
      console.log('❌ Vehicle not found');
      return NextResponse.json({ success: false, error: "Vehicle not found" }, { status: 404 })
    }
  } catch (error) {
    console.error("❌ Error deleting vehicle:", error)
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ success: false, error: errorMessage || "Failed to delete vehicle" }, { status: 500 })
  }
}
