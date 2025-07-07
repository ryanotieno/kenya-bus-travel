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
  try {
    const body = await request.json()
    const { name, regNumber, capacity, saccoId, status } = body
    if (!name || !regNumber || !capacity || !saccoId) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 })
    }
    const vehicle = await vehicleService.create({
      name,
      regNumber,
      capacity,
      saccoId,
      status: status || 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    return NextResponse.json({ success: true, vehicle })
  } catch (error) {
    console.error("Error adding vehicle:", error)
    return NextResponse.json({ success: false, error: "Failed to add vehicle" }, { status: 500 })
  }
}
