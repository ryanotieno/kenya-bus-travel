import { type NextRequest, NextResponse } from "next/server"
import { createSession } from "@/lib/auth"
import { userService } from "@/lib/db-service"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()
    
    console.log(`🔐 Login attempt for email: ${email}`)

    if (!email || !password) {
      console.log("❌ Missing email or password")
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    // TEMPORARY: Hardcoded login for testing
    // This bypasses database issues while we fix them
    if (email === "ryanotieno@gmail.com" && password === "password1") {
      console.log("✅ Using hardcoded driver login")
      await createSession({
        id: "1",
        name: "Ryan Otieno",
        email: "ryanotieno@gmail.com",
        role: "driver",
      })
      return NextResponse.json({ success: true })
    }
    
    if (email === "otieno.charles@gmail.com" && password === "owner123") {
      console.log("✅ Using hardcoded owner login")
      await createSession({
        id: "2",
        name: "Charles Otieno",
        email: "otieno.charles@gmail.com",
        role: "owner",
      })
      return NextResponse.json({ success: true })
    }

    // Check credentials against the database
    const user = await userService.getByEmail(email)
    
    console.log(`👤 User lookup result:`, user ? `Found user ${user.email} (${user.role})` : "User not found")

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

    console.log(`✅ Creating session for user ${user.email} (${user.role})`)
    
    await createSession({
      id: user.id.toString(),
      name: `${user.firstName} ${user.lastName}`,
      email: user.email,
      role: user.role,
    })

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
