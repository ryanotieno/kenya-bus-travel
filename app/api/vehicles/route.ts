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
    console.log("📊 Request body:", body)
    
    if (!name || !regNumber || !capacity || !saccoId) {
      console.log("❌ Missing required fields")
      return NextResponse.json({ 
        error: "Missing required fields: name, regNumber, capacity, saccoId" 
      }, { status: 400 })
    }
    
    // Check if registration number already exists
    console.log("🔍 Checking for existing vehicles...")
    const existingVehicles = await vehicleService.getAll()
    console.log("📋 Found existing vehicles:", existingVehicles.length)
    const existingVehicle = existingVehicles.find((v: any) => v.regNumber === regNumber)
    
    if (existingVehicle) {
      console.log("❌ Vehicle with registration number already exists:", regNumber)
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
    console.log("🚀 Attempting to create vehicle in database...")
    const vehicleData = {
      name,
      regNumber,
      capacity: parseInt(capacity),
      saccoId: parseInt(saccoId),
      driverId: driverId ? parseInt(driverId) : null,
      status
    }
    console.log("📝 Vehicle data to insert:", vehicleData)
    
    const newVehicle = await vehicleService.create(vehicleData)
    
    console.log("✅ Vehicle created successfully:", newVehicle)
    
    return NextResponse.json({
      success: true,
      vehicle: newVehicle,
      message: "Vehicle registered successfully"
    })
    
  } catch (error) {
    console.error("❌ Error creating vehicle:", error)
    
    // Check if it's a table not found error
    if (error instanceof Error && error.message.includes("relation") && error.message.includes("does not exist")) {
      console.log("🔧 Database table missing - vehicles table not created yet")
      return NextResponse.json({ 
        error: "Database not initialized. Please initialize the database first.",
        details: "Vehicles table does not exist"
      }, { status: 503 })
    }
    
    return NextResponse.json({ 
      error: "Failed to register vehicle",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}
