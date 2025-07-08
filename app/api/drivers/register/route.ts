import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/database"
import { drivers } from "@/lib/schema"
import { eq } from "drizzle-orm"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      firstName, 
      lastName, 
      email, 
      phone, 
      password, 
      licenseNumber, 
      licenseExpires, 
      vehicleId, 
      status = "active" 
    } = body

    console.log("🚗 Driver registration request:", { 
      firstName, 
      lastName, 
      email, 
      licenseNumber, 
      vehicleId 
    })

    // Validate required fields
    if (!firstName || !lastName || !email || !password || !licenseNumber) {
      return NextResponse.json({ 
        error: "Missing required fields: firstName, lastName, email, password, licenseNumber" 
      }, { status: 400 })
    }

    // Check if email already exists
    const existingDriverByEmail = await db
      .select()
      .from(drivers)
      .where(eq(drivers.email, email))
      .limit(1)

    if (existingDriverByEmail.length > 0) {
      return NextResponse.json({ 
        error: "Driver with this email already exists" 
      }, { status: 400 })
    }

    // Check if license number already exists
    const existingDriverByLicense = await db
      .select()
      .from(drivers)
      .where(eq(drivers.licenseNumber, licenseNumber))
      .limit(1)

    if (existingDriverByLicense.length > 0) {
      return NextResponse.json({ 
        error: "Driver with this license number already exists" 
      }, { status: 400 })
    }

    // Prepare data for insertion
    const driverData = {
      firstName,
      lastName,
      email,
      phone: phone || null,
      password, // In production, this should be hashed
      licenseNumber,
      licenseExpiry: licenseExpires ? new Date(licenseExpires) : null,
      vehicleId: vehicleId || null,
      status,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    console.log("📝 Inserting driver data:", driverData)

    // Insert into drivers table
    const result = await db
      .insert(drivers)
      .values(driverData)
      .returning()

    const newDriver = result[0]

    console.log("✅ Driver registered successfully:", { 
      id: newDriver.id, 
      email: newDriver.email,
      vehicleId: newDriver.vehicleId 
    })

    return NextResponse.json({ 
      success: true, 
      message: "Driver registered successfully",
      driver: {
        id: newDriver.id,
        firstName: newDriver.firstName,
        lastName: newDriver.lastName,
        email: newDriver.email,
        licenseNumber: newDriver.licenseNumber,
        vehicleId: newDriver.vehicleId,
        status: newDriver.status
      }
    })

  } catch (error) {
    console.error("❌ Driver registration error:", error)
    return NextResponse.json({ 
      error: "Registration failed. Please try again.",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
} 