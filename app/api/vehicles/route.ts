import { NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const routeId = searchParams.get("routeId")

    let query = sql`
      SELECT 
        b.id,
        b.bus_number,
        b.model,
        b.capacity,
        b.route_id,
        r.id as route_id,
        origin.name as origin_name,
        destination.name as destination_name,
        u.name as driver_name
      FROM buses b
      LEFT JOIN routes r ON b.route_id = r.id
      LEFT JOIN stations origin ON r.origin_id = origin.id
      LEFT JOIN stations destination ON r.destination_id = destination.id
      LEFT JOIN users u ON b.driver_id = u.id
    `

    if (routeId) {
      query = sql`
        SELECT 
          b.id,
          b.bus_number,
          b.model,
          b.capacity,
          b.route_id,
          r.id as route_id,
          origin.name as origin_name,
          destination.name as destination_name,
          u.name as driver_name
        FROM buses b
        LEFT JOIN routes r ON b.route_id = r.id
        LEFT JOIN stations origin ON r.origin_id = origin.id
        LEFT JOIN stations destination ON r.destination_id = destination.id
        LEFT JOIN users u ON b.driver_id = u.id
        WHERE b.route_id = ${Number.parseInt(routeId)}
      `
    }

    const vehicles = await query

    return NextResponse.json({ vehicles })
  } catch (error) {
    console.error("Error fetching vehicles:", error)
    return NextResponse.json({ error: "Failed to fetch vehicles" }, { status: 500 })
  }
}
