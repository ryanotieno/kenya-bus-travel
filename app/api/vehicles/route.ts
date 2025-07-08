import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/database"
import { vehicles } from "@/lib/schema"
import { eq } from "drizzle-orm"

export async function GET(request: NextRequest) {
  try {
    console.log("🚗 Fetching vehicles...")
    
    // Get all active vehicles
    const allVehicles = await db
      .select({
        id: vehicles.id,
        name: vehicles.name,
        regNumber: vehicles.regNumber,
        capacity: vehicles.capacity,
        status: vehicles.status
      })
      .from(vehicles)
      .where(eq(vehicles.status, 'active'))

    console.log("✅ Found vehicles:", allVehicles.length)

    return NextResponse.json(allVehicles)

  } catch (error) {
    console.error("❌ Error fetching vehicles:", error)
    return NextResponse.json({ 
      error: "Failed to fetch vehicles",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
} 