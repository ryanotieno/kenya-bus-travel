import { NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { getSession } from "@/lib/auth"

export async function GET() {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const favorites = await sql`
      SELECT 
        fr.id,
        r.id as route_id,
        origin.name as origin_name,
        destination.name as destination_name,
        r.distance,
        r.duration,
        r.fare
      FROM favorite_routes fr
      JOIN routes r ON fr.route_id = r.id
      JOIN stations origin ON r.origin_id = origin.id
      JOIN stations destination ON r.destination_id = destination.id
      WHERE fr.user_id = ${Number.parseInt(session.id)}
      ORDER BY fr.created_at DESC
    `

    return NextResponse.json({ favorites })
  } catch (error) {
    console.error("Error fetching favorite routes:", error)
    return NextResponse.json({ error: "Failed to fetch favorite routes" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { routeId } = await request.json()

    await sql`
      INSERT INTO favorite_routes (user_id, route_id)
      VALUES (${Number.parseInt(session.id)}, ${routeId})
      ON CONFLICT (user_id, route_id) DO NOTHING
    `

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error adding favorite route:", error)
    return NextResponse.json({ error: "Failed to add favorite route" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { favoriteId } = await request.json()

    await sql`
      DELETE FROM favorite_routes
      WHERE id = ${favoriteId}
      AND user_id = ${Number.parseInt(session.id)}
    `

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error removing favorite route:", error)
    return NextResponse.json({ error: "Failed to remove favorite route" }, { status: 500 })
  }
}
