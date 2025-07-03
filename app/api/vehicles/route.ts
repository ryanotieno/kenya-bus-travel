import { NextRequest, NextResponse } from "next/server"
import { vehicleService, saccoService } from "@/lib/db-service"

export async function GET() {
  try {
    console.log("🚗 Fetching all vehicles...")
    
    const vehicles = await vehicleService.getAll()
    console.log(`✅ Found ${vehicles.length} vehicles`)
    
    return NextResponse.json(vehicles)
  } catch (error) {
    console.error("❌ Error fetching vehicles:", error)
    return NextResponse.json({ error: "Failed to fetch vehicles" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, regNumber, capacity, saccoId, driverId, status = 'active' } = body
    
    console.log("🚗 Creating new vehicle:", { name, regNumber, capacity, saccoId })
    
    if (!name || !regNumber || !capacity || !saccoId) {
      return NextResponse.json({ 
        error: "Missing required fields: name, regNumber, capacity, saccoId" 
      }, { status: 400 })
    }
    
    // Check if registration number already exists
    const existingVehicles = await vehicleService.getAll()
    const existingVehicle = existingVehicles.find((v: any) => v.regNumber === regNumber)
    
    if (existingVehicle) {
      return NextResponse.json({ 
        error: "Vehicle with this registration number already exists" 
      }, { status: 409 })
    }
    
    // Verify sacco exists
    try {
      const saccos = await saccoService.getAll()
      const sacco = saccos.find((s: any) => s.id === saccoId)
      if (!sacco) {
        return NextResponse.json({ 
          error: "Sacco not found" 
        }, { status: 404 })
      }
    } catch (saccoError) {
      console.log("⚠️ Could not verify sacco, continuing with vehicle creation:", saccoError)
    }
    
    // Create vehicle
    const newVehicle = await vehicleService.create({
      name,
      regNumber,
      capacity: parseInt(capacity),
      saccoId: parseInt(saccoId),
      driverId: driverId ? parseInt(driverId) : null,
      status
    })
    
    console.log("✅ Vehicle created successfully:", newVehicle)
    
    return NextResponse.json({
      success: true,
      vehicle: newVehicle,
      message: "Vehicle registered successfully"
    })
    
  } catch (error) {
    console.error("❌ Error creating vehicle:", error)
    return NextResponse.json({ 
      error: "Failed to register vehicle" 
    }, { status: 500 })
  }
}
