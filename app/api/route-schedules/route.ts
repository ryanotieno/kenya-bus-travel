import { NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const routeId = searchParams.get("routeId")

    if (!routeId) {
      return NextResponse.json({ error: "Route ID is required" }, { status: 400 })
    }

    const schedules = await sql`
      SELECT 
        id,
        route_id,
        departure_time,
        days_of_week,
        is_active
      FROM route_schedules
      WHERE route_id = ${Number.parseInt(routeId)}
      ORDER BY departure_time ASC
    `

    return NextResponse.json({ schedules })
  } catch (error) {
    console.error("Error fetching route schedules:", error)
    return NextResponse.json({ error: "Failed to fetch route schedules" }, { status: 500 })
  }
}
