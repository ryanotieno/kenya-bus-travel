import { NextRequest, NextResponse } from "next/server"
import { userService, vehicleService, saccoService } from "@/lib/db-service"

export async function GET() {
  try {
    const drivers = await userService.getAll()
    // Only return users with role 'driver'
    const driverList = drivers.filter((u) => u.role === 'driver')
    return NextResponse.json(driverList)
  } catch (err) {
    return NextResponse.json([], { status: 200 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    // Validate required fields
    const required = [
      "firstName", "lastName", "email", "phone", "license", "experience", "sacco", "vehicle", "password"
    ]
    for (const field of required) {
      if (!body[field]) {
        return NextResponse.json({ error: `Missing field: ${field}` }, { status: 400 })
      }
    }
    
    // Create driver user
    const newDriver = await userService.create({
      firstName: body.firstName,
      lastName: body.lastName,
      email: body.email,
      phone: body.phone,
      password: body.password,
      role: 'driver',
    })
    
    // Find the sacco by name
    const allSaccos = await saccoService.getAll()
    const targetSacco = allSaccos.find(s => s.saccoName === body.sacco)
    
    if (!targetSacco) {
      return NextResponse.json({ error: "Sacco not found" }, { status: 400 })
    }
    
    // Find the vehicle by registration number
    const targetVehicle = await vehicleService.getByRegNumber(body.vehicle)
    
    if (!targetVehicle) {
      return NextResponse.json({ error: "Vehicle not found" }, { status: 400 })
    }
    
    // Assign the vehicle to the driver
    await vehicleService.updateDriver(targetVehicle.id, newDriver.id)
    
    return NextResponse.json({ 
      success: true, 
      driver: newDriver,
      vehicle: targetVehicle,
      sacco: targetSacco
    })
  } catch (err) {
    console.error('Driver creation error:', err)
    return NextResponse.json({ error: "Could not save driver data." }, { status: 500 })
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
    const driver = await userService.getByEmail(driverEmail)
    if (!driver || driver.role !== 'driver') {
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