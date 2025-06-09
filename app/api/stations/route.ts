import { NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function GET() {
  try {
    const stations = await sql`
      SELECT id, name, location, latitude, longitude
      FROM stations
      ORDER BY name ASC
    `

    return NextResponse.json({ stations })
  } catch (error) {
    console.error("Error fetching stations:", error)
    return NextResponse.json({ error: "Failed to fetch stations" }, { status: 500 })
  }
}
