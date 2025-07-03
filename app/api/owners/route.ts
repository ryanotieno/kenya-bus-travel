import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/database";
import { owners } from "@/lib/schema";
import { eq } from "drizzle-orm";

// Register a new owner
export async function POST(request: NextRequest) {
  const { name, email, phone } = await request.json();

  // Check if owner already exists
  const existing = await db.select().from(owners).where(eq(owners.name, name)).limit(1);
  if (existing.length > 0) {
    return NextResponse.json({ success: false, error: "Owner already exists" }, { status: 409 });
  }

  // Insert new owner
  const [newOwner] = await db.insert(owners).values({ name, email, phone }).returning();
  return NextResponse.json({ success: true, owner: newOwner });
}

// List all owners
export async function GET() {
  const allOwners = await db.select().from(owners);
  return NextResponse.json(allOwners);
} 