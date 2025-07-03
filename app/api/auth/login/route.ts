import { type NextRequest, NextResponse } from "next/server"
import { createSession } from "@/lib/auth"
import { userService, ownerService } from "@/lib/db-service"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()
    
    console.log(`🔐 Login attempt for email: ${email}`)

    if (!email || !password) {
      console.log("❌ Missing email or password")
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }



    // Check credentials against the database - try users table first, then owners table
    let user = await userService.getByEmail(email)
    let isOwner = false
    
    if (!user) {
      // Check owners table
      const owner = await ownerService.getByEmail(email)
      if (owner) {
        isOwner = true
        // Convert owner to user format for session
        user = {
          id: owner.id,
          firstName: owner.name.split(' ')[0] || owner.name,
          lastName: owner.name.split(' ').slice(1).join(' ') || '',
          email: owner.email,
          phone: owner.phone,
          password: owner.password,
          role: 'owner' as const,
          createdAt: owner.createdAt,
          updatedAt: owner.updatedAt
        }
      }
    }
    
    console.log(`👤 User lookup result:`, user ? `Found ${isOwner ? 'owner' : 'user'} ${user.email} (${user.role})` : "User not found")

    if (!user) {
      console.log("❌ User not found in database")
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    // In a real app, you would verify the password hash
    // For demo purposes, we're accepting the password as is
    // const passwordMatch = await bcrypt.compare(password, user.password);
    // if (!passwordMatch) {
    //   return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    // }

    console.log(`🔑 Password check: provided="${password}", stored="${user.password}"`)
    
    if (user.password !== password) {
      console.log("❌ Password mismatch")
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    console.log(`✅ Creating session for ${isOwner ? 'owner' : 'user'} ${user.email} (${user.role})`)
    
    const userAgent = request.headers.get("user-agent") || "unknown"
    const ipAddress = request.headers.get("x-forwarded-for") || "unknown"
    
    await createSession({
      id: user.id.toString(),
      name: `${user.firstName} ${user.lastName}`,
      email: user.email,
      role: user.role,
    }, userAgent, ipAddress)

    console.log(`✅ Session created successfully`)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("❌ Authentication error:", error)
    return NextResponse.json({ 
      error: "Authentication failed", 
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 401 })
  }
}
