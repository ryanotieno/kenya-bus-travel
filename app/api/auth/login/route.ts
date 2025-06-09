import { type NextRequest, NextResponse } from "next/server"
import { createSession } from "@/lib/auth"
import { sql } from "@/lib/db"
import { promises as fs } from "fs"
import path from "path"

const driversFile = path.join(process.cwd(), "data", "drivers.json")

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    // Check for registered driver credentials
    if (email && password) {
      try {
        const data = await fs.readFile(driversFile, "utf-8")
        const drivers = JSON.parse(data)
        const driver = drivers.find((d: any) => d.email === email && d.password === password)
        if (driver) {
          await createSession({
            id: driver.email, // or a unique id if available
            name: `${driver.firstName} ${driver.lastName}`,
            email: driver.email,
            role: "driver",
          })
          return NextResponse.json({ success: true })
        }
      } catch {}
    }

    // Check for demo credentials first for backward compatibility
    if (email === "driver@demo.com" && password === "driver123") {
      await createSession({
        id: "driver-123",
        name: "David Driver",
        email: "driver@demo.com",
        role: "driver",
      })
      return NextResponse.json({ success: true })
    }

    if (email === "user@demo.com" && password === "user123") {
      await createSession({
        id: "user-456",
        name: "John Passenger",
        email: "user@demo.com",
        role: "user",
      })
      return NextResponse.json({ success: true })
    }

    if (email === "owner@demo.com" && password === "owner123") {
      await createSession({
        id: "owner-789",
        name: "Olivia Owner",
        email: "owner@demo.com",
        role: "owner",
      })
      return NextResponse.json({ success: true })
    }

    // In development mode, avoid database queries if using demo accounts
    try {
      // Check credentials against the database
      const users = await sql`
        SELECT id, name, email, password, role
        FROM users
        WHERE email = ${email}
        LIMIT 1
      `

      if (users.length === 0) {
        return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
      }

      const user = users[0]

      // In a real app, you would verify the password hash
      // For demo purposes, we're accepting the password as is
      // const passwordMatch = await bcrypt.compare(password, user.password);
      // if (!passwordMatch) {
      //   return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
      // }

      await createSession({
        id: user.id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
      })

      return NextResponse.json({ success: true })
    } catch (dbError) {
      console.error("Database error:", dbError)
      // Return authentication failed for non-demo users
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }
  } catch (error) {
    console.error("Authentication error:", error)
    return NextResponse.json({ error: "Authentication failed" }, { status: 401 })
  }
}
