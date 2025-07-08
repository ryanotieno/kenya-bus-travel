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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { firstName, lastName, email, phone, password, licenseNumber, licenseExpiry, vehicleRegNumber } = body

    if (!firstName || !lastName || !email || !password || !licenseNumber) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 })
    }

    // Check if driver with this email already exists
    const existingDriver = await driverService.getByEmail(email)
    if (existingDriver) {
      return NextResponse.json({ success: false, error: "Driver with this email already exists" }, { status: 400 })
    }

    // Check if license number already exists
    const existingLicense = await driverService.getByLicenseNumber(licenseNumber)
    if (existingLicense) {
      return NextResponse.json({ success: false, error: "Driver with this license number already exists" }, { status: 400 })
    }

    // Create the driver
    const driverData = {
      firstName,
      lastName,
      email,
      phone,
      password, // In production, this should be hashed
      licenseNumber,
      licenseExpiry,
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    const newDriver = await driverService.create(driverData)

    // If vehicle registration number is provided, assign the vehicle
    if (vehicleRegNumber) {
      const targetVehicle = await vehicleService.getByRegNumber(vehicleRegNumber)
      if (!targetVehicle) {
        return NextResponse.json({ success: false, error: "Vehicle not found" }, { status: 404 })
      }

      // Assign vehicle to driver
      await vehicleService.updateDriver(targetVehicle.id, newDriver.id)
    }

    return NextResponse.json({ success: true, driver: newDriver })
  } catch (error) {
    console.error('Error creating driver:', error)
    return NextResponse.json({ success: false, error: "Failed to create driver" }, { status: 500 })
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