import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  if (!code) {
    return NextResponse.json({ error: "Missing code" }, { status: 400 });
  }
  try {
    const result = await sql`
      SELECT * FROM tickets WHERE qr_code = ${code}
    `;
    if (!result[0]) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    }
    return NextResponse.json({ ticket: result[0] });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch ticket", details: error instanceof Error ? error.message : error }, { status: 500 });
  }
} 