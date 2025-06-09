import { NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const routeId = searchParams.get("routeId")

    if (!routeId) {
      return NextResponse.json({ error: "Route ID is required" }, { status: 400 })
    }

    const stops = await sql`
      SELECT 
        rs.id,
        rs.route_id,
        rs.stop_order,
        rs.distance_from_start,
        rs.estimated_time,
        s.id as station_id,
        s.name as station_name,
        s.location,
        s.latitude,
        s.longitude
      FROM route_stops rs
      JOIN stations s ON rs.station_id = s.id
      WHERE rs.route_id = ${Number.parseInt(routeId)}
      ORDER BY rs.stop_order ASC
    `

    return NextResponse.json({ stops })
  } catch (error) {
    console.error("Error fetching route stops:", error)
    return NextResponse.json({ error: "Failed to fetch route stops" }, { status: 500 })
  }
}
