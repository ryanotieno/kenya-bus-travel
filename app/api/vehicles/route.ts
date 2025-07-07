import { NextRequest, NextResponse } from "next/server"
import { vehicleService, saccoService } from "@/lib/db-service"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const saccoId = searchParams.get('saccoId')
    let vehicles
    if (saccoId) {
      vehicles = await vehicleService.getAll()
      vehicles = vehicles.filter(v => v.saccoId === Number(saccoId))
    } else {
      vehicles = await vehicleService.getAll()
    }
    return NextResponse.json({ success: true, vehicles })
  } catch (error) {
    console.error("Error fetching vehicles:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch vehicles" }, { status: 500 })
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
      capacity,
      saccoId,
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
    return NextResponse.json({ success: false, error: "Failed to add vehicle" }, { status: 500 })
  }
}
