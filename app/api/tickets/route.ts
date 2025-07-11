import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { v4 as uuidv4 } from "uuid";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");
  if (!userId) {
    return NextResponse.json({ error: "Missing userId" }, { status: 400 });
  }
  try {
    const tickets = await sql`
      SELECT * FROM tickets WHERE passenger_id = ${Number(userId)}
    `;
    return NextResponse.json({ tickets });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch tickets", details: error instanceof Error ? error.message : error }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tripId, passengerId, fromStop, toStop, fare, status = "booked" } = body;
    if (!tripId || !passengerId || !fromStop || !toStop || !fare) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    const qrCode = uuidv4();
    const result = await sql`
      INSERT INTO tickets (trip_id, passenger_id, from_stop, to_stop, fare, status, booked_at, created_at, updated_at, qr_code)
      VALUES (${tripId}, ${passengerId}, ${fromStop}, ${toStop}, ${fare}, ${status}, NOW(), NOW(), NOW(), ${qrCode})
      RETURNING *
    `;
    return NextResponse.json({ ticket: result[0] });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create ticket", details: error instanceof Error ? error.message : error }, { status: 500 });
  }
} 