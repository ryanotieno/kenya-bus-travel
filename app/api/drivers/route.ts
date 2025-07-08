import { NextRequest, NextResponse } from "next/server"
import { driverService, vehicleService, saccoService } from "@/lib/db-service"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const driverEmail = searchParams.get('email')
    
    if (driverEmail) {
      // Get specific driver with their vehicle and route information
      const driver = await driverService.getByEmail(driverEmail)
      if (!driver) {
        return NextResponse.json({ success: false, error: "Driver not found" }, { status: 404 })
      }

      // Get detailed driver information with vehicle and sacco
      const driverDetails = await driverService.getWithVehicleAndSacco(driver.id)

      // If driver has a sacco, get route information
      if (driverDetails.sacco && driverDetails.sacco.busStops) {
        try {
          driverDetails.route = {
            stops: JSON.parse(driverDetails.sacco.busStops),
            routeStart: driverDetails.sacco.routeStart,
            routeEnd: driverDetails.sacco.routeEnd,
            route: driverDetails.sacco.route
          }
        } catch (e) {
          driverDetails.route = null
        }
      }

      return NextResponse.json({ success: true, driver: driverDetails })
    } else {
      // Get all drivers
      const drivers = await driverService.getAll()
      return NextResponse.json(drivers)
    }
  } catch (error) {
    console.error('Error in drivers API:', error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}



export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { driverEmail, vehicleRegNumber } = body
    
    if (!driverEmail || !vehicleRegNumber) {
      return NextResponse.json({ error: "Driver email and vehicle registration number are required" }, { status: 400 })
    }
    
    // Find the driver by email
    const driver = await driverService.getByEmail(driverEmail)
    if (!driver) {
      return NextResponse.json({ error: "Driver not found" }, { status: 404 })
    }
    
    // Find the vehicle by registration number
    const vehicle = await vehicleService.getByRegNumber(vehicleRegNumber)
    if (!vehicle) {
      return NextResponse.json({ error: "Vehicle not found" }, { status: 404 })
    }
    
    // Assign the vehicle to the driver
    await vehicleService.updateDriver(vehicle.id, driver.id)
    
    return NextResponse.json({ 
      success: true, 
      message: `Vehicle ${vehicleRegNumber} assigned to driver ${driverEmail}`,
      driver,
      vehicle
    })
  } catch (err) {
    console.error('Vehicle assignment error:', err)
    return NextResponse.json({ error: "Could not assign vehicle to driver." }, { status: 500 })
  }
} 