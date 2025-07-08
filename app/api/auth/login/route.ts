import { type NextRequest, NextResponse } from "next/server"
import { createSession } from "@/lib/auth"
import { userService, ownerService, driverService } from "@/lib/db-service"
import type { UserRole } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()
    
    console.log(`🔐 Login attempt for email: ${email}`)

    if (!email || !password) {
      console.log("❌ Missing email or password")
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    // Check credentials against the database - try drivers table FIRST for drivers
    let user = null
    let userRole: UserRole | null = null
    
    // First check drivers table
    const driver = await driverService.getByEmail(email)
    if (driver) {
      // Convert driver to user format for session
      user = {
        id: driver.id,
        firstName: driver.firstName,
        lastName: driver.lastName,
        email: driver.email,
        phone: driver.phone,
        password: driver.password,
        role: 'driver' as any,
        createdAt: driver.createdAt,
        updatedAt: driver.updatedAt
      }
      userRole = 'driver'
      console.log(`👤 Found driver: ${driver.email}`)
    }
    
    if (!user) {
      // Check owners table
      const owner = await ownerService.getByEmail(email)
      if (owner) {
        // Convert owner to user format for session
        user = {
          id: owner.id,
          firstName: owner.name.split(' ')[0] || owner.name,
          lastName: owner.name.split(' ').slice(1).join(' ') || '',
          email: owner.email,
          phone: owner.phone,
          password: owner.password,
          role: 'owner' as any,
          createdAt: owner.createdAt,
          updatedAt: owner.updatedAt
        }
        userRole = 'owner'
        console.log(`👤 Found owner: ${owner.email}`)
      }
    }
    
    if (!user) {
      // Check users table last
      const regularUser = await userService.getByEmail(email)
      if (regularUser) {
        user = regularUser
        userRole = 'user'
        console.log(`👤 Found regular user: ${regularUser.email}`)
      }
    }
    
    console.log(`👤 User lookup result:`, user ? `Found ${userRole} ${user.email}` : "User not found")

    if (!user || !userRole) {
      console.log("❌ User not found in any table")
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    console.log(`🔑 Password check: provided="${password}", stored="${user.password}"`)
    
    if (user.password !== password) {
      console.log("❌ Password mismatch")
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    console.log(`✅ Creating session for ${userRole} ${user.email}`)
    
    const userAgent = request.headers.get("user-agent") || "unknown"
    const ipAddress = request.headers.get("x-forwarded-for") || "unknown"
    
    await createSession({
      id: user.id.toString(),
      name: `${user.firstName} ${user.lastName}`,
      email: user.email,
      role: userRole,
    }, userAgent, ipAddress)

    console.log(`✅ Session created successfully for ${userRole}`)
    
    // Return success with user object for proper redirection
    return NextResponse.json({ 
      success: true, 
      user: {
        id: user.id,
        name: `${user.firstName} ${user.lastName}`,
        email: user.email,
        role: userRole
      }
    })
  } catch (error) {
    console.error("❌ Authentication error:", error)
    return NextResponse.json({ 
      error: "Authentication failed", 
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 401 })
  }
}
