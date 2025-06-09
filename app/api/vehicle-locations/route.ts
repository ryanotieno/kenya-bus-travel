import { NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const busId = searchParams.get("busId")

    if (!busId) {
      return NextResponse.json({ error: "Bus ID is required" }, { status: 400 })
    }

    const locations = await sql`
      SELECT 
        vl.id,
        vl.bus_id,
        vl.latitude,
        vl.longitude,
        vl.speed,
        vl.heading,
        vl.timestamp,
        vl.next_stop_id,
        vl.estimated_arrival,
        s.name as next_stop_name
      FROM vehicle_locations vl
      LEFT JOIN stations s ON vl.next_stop_id = s.id
      WHERE vl.bus_id = ${Number.parseInt(busId)}
      ORDER BY vl.timestamp DESC
      LIMIT 1
    `

    if (locations.length === 0) {
      return NextResponse.json({ error: "No location data found for this vehicle" }, { status: 404 })
    }

    return NextResponse.json({ location: locations[0] })
  } catch (error) {
    console.error("Error fetching vehicle location:", error)
    return NextResponse.json({ error: "Failed to fetch vehicle location" }, { status: 500 })
  }
}
