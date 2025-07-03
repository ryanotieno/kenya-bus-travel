import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/database";
import { owners, companies } from "@/lib/schema";
import { eq } from "drizzle-orm";

// Register a new owner
export async function POST(request: NextRequest) {
  const { name, email, phone, password, companyName, businessLicense, address } = await request.json();

  if (!name || !email || !password || !companyName || !businessLicense || !address) {
    return NextResponse.json({ 
      success: false, 
      error: "Name, email, password, company name, business license, and address are required" 
    }, { status: 400 });
  }

  // Check if owner already exists
  const existing = await db.select().from(owners).where(eq(owners.name, name)).limit(1);
  if (existing.length > 0) {
    return NextResponse.json({ success: false, error: "Owner already exists" }, { status: 409 });
  }

  // Check if email already exists
  const existingEmail = await db.select().from(owners).where(eq(owners.email, email)).limit(1);
  if (existingEmail.length > 0) {
    return NextResponse.json({ success: false, error: "Email already registered" }, { status: 409 });
  }

  // Insert new owner
  const [newOwner] = await db.insert(owners).values({ name, email, phone, password }).returning();

  // Insert company info, referencing owner by name
  const [newCompany] = await db.insert(companies).values({
    name: companyName,
    businessLicense,
    address,
    phone,
    email,
    ownerName: name
  }).returning();

  return NextResponse.json({ success: true, owner: newOwner, company: newCompany });
}

// List all owners
export async function GET() {
  const allOwners = await db.select().from(owners);
  return NextResponse.json(allOwners);
} 