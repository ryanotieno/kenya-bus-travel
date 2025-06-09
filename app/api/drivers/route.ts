import { NextRequest, NextResponse } from "next/server"
import { promises as fs } from "fs"
import path from "path"

const dataFile = path.join(process.cwd(), "data", "drivers.json")

export async function GET() {
  try {
    const data = await fs.readFile(dataFile, "utf-8")
    const drivers = JSON.parse(data)
    return NextResponse.json(drivers)
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
    // Read existing drivers
    let drivers = []
    try {
      const data = await fs.readFile(dataFile, "utf-8")
      drivers = JSON.parse(data)
    } catch {}
    // Add new driver
    drivers.push({ ...body, registeredAt: new Date().toISOString() })
    await fs.writeFile(dataFile, JSON.stringify(drivers, null, 2))
    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: "Could not save driver data." }, { status: 500 })
  }
} 