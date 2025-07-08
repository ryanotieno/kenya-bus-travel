import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/database"
import { drivers, vehicles, saccos } from "@/lib/schema"
import { eq } from "drizzle-orm"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const driverEmail = searchParams.get('email')
    
    if (!driverEmail) {
      return NextResponse.json({ 
        error: "Driver email is required" 
      }, { status: 400 })
    }

    console.log("🔍 Fetching driver profile for:", driverEmail)

    // Get driver data with vehicle relationship
    const driverData = await db
      .select({
        // Driver fields
        id: drivers.id,
        firstName: drivers.firstName,
        lastName: drivers.lastName,
        email: drivers.email,
        phone: drivers.phone,
        licenseNumber: drivers.licenseNumber,
        licenseExpiry: drivers.licenseExpiry,
        vehicleId: drivers.vehicleId,
        status: drivers.status,
        createdAt: drivers.createdAt,
        // Vehicle fields
        vehicleName: vehicles.name,
        vehicleRegNumber: vehicles.regNumber,
        vehicleCapacity: vehicles.capacity,
        vehicleStatus: vehicles.status,
        saccoId: vehicles.saccoId
      })
      .from(drivers)
      .leftJoin(vehicles, eq(drivers.vehicleId, vehicles.id))
      .where(eq(drivers.email, driverEmail))
      .limit(1)

    if (driverData.length === 0) {
      return NextResponse.json({ 
        error: "Driver not found" 
      }, { status: 404 })
    }

    const driver = driverData[0]
    console.log("✅ Driver found:", { 
      email: driver.email, 
      vehicleId: driver.vehicleId,
      saccoId: driver.saccoId 
    })

    // If driver has a vehicle and vehicle has a sacco, get route information
    let routeInfo = null
    if (driver.saccoId) {
      console.log("🔍 Fetching route info for sacco ID:", driver.saccoId)
      
      const saccoData = await db
        .select()
        .from(saccos)
        .where(eq(saccos.id, driver.saccoId))
        .limit(1)

      if (saccoData.length > 0) {
        const sacco = saccoData[0]
        routeInfo = {
          saccoName: sacco.saccoName,
          route: sacco.route,
          routeStart: sacco.routeStart,
          routeEnd: sacco.routeEnd,
          busStops: sacco.busStops ? JSON.parse(sacco.busStops) : []
        }
        console.log("✅ Route info found:", routeInfo)
      }
    }

    // Structure the response
    const driverProfile = {
      // Driver information
      id: driver.id,
      firstName: driver.firstName,
      lastName: driver.lastName,
      email: driver.email,
      phone: driver.phone,
      licenseNumber: driver.licenseNumber,
      licenseExpiry: driver.licenseExpiry,
      status: driver.status,
      createdAt: driver.createdAt,
      
      // Vehicle information (if assigned)
      vehicle: driver.vehicleId ? {
        id: driver.vehicleId,
        name: driver.vehicleName,
        regNumber: driver.vehicleRegNumber,
        capacity: driver.vehicleCapacity,
        status: driver.vehicleStatus
      } : null,
      
      // Route information (if vehicle belongs to a sacco)
      route: routeInfo
    }

    console.log("✅ Complete driver profile assembled")
    return NextResponse.json({ 
      success: true, 
      driver: driverProfile 
    })

  } catch (error) {
    console.error("❌ Error fetching driver profile:", error)
    return NextResponse.json({ 
      error: "Failed to fetch driver profile",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
} 