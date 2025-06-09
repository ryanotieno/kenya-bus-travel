import { NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    let query
    if (id) {
      query = sql`
        SELECT 
          r.id, 
          origin.name as origin_name, 
          destination.name as destination_name,
          r.distance,
          r.duration,
          r.fare
        FROM routes r
        JOIN stations origin ON r.origin_id = origin.id
        JOIN stations destination ON r.destination_id = destination.id
        WHERE r.id = ${Number.parseInt(id)}
      `
    } else {
      query = sql`
        SELECT 
          r.id, 
          origin.name as origin_name, 
          destination.name as destination_name,
          r.distance,
          r.duration,
          r.fare
        FROM routes r
        JOIN stations origin ON r.origin_id = origin.id
        JOIN stations destination ON r.destination_id = destination.id
        ORDER BY origin_name, destination_name
      `
    }

    const routes = await query

    return NextResponse.json({ routes })
  } catch (error) {
    console.error("Error fetching routes:", error)
    return NextResponse.json({ error: "Failed to fetch routes" }, { status: 500 })
  }
}
