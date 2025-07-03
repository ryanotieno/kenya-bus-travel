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



    // Check credentials against the database (if available)
    try {
      const user = await userService.getByEmail(email)
      
      console.log(`👤 User lookup result:`, user ? `Found user ${user.email} (${user.role})` : "User not found")

      if (user) {
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
      }
    } catch (dbError) {
      console.log("❌ Database error during user lookup:", dbError)
      // Continue to hardcoded credentials if database is not available
    }

    // If we reach here, either user not found or database error
    // Check hardcoded credentials as fallback
    console.log("🔄 Checking hardcoded credentials...")
    
    if (email === "ryanotieno@gmail.com" && password === "password1") {
      console.log("✅ Using hardcoded driver login")
      const userAgent = request.headers.get("user-agent") || "unknown"
      const ipAddress = request.headers.get("x-forwarded-for") || "unknown"
      
      await createSession({
        id: "1",
        name: "Ryan Otieno",
        email: "ryanotieno@gmail.com",
        role: "driver",
      }, userAgent, ipAddress)
      return NextResponse.json({ success: true })
    }
    
    if (email === "otieno.charles@gmail.com" && password === "owner123") {
      console.log("✅ Using hardcoded owner login")
      const userAgent = request.headers.get("user-agent") || "unknown"
      const ipAddress = request.headers.get("x-forwarded-for") || "unknown"
      
      await createSession({
        id: "2",
        name: "Charles Otieno",
        email: "otieno.charles@gmail.com",
        role: "owner",
      }, userAgent, ipAddress)
      return NextResponse.json({ success: true })
    }

    console.log("❌ No valid credentials found")
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
  } catch (error) {
    console.error("❌ Authentication error:", error)
    return NextResponse.json({ 
      error: "Authentication failed", 
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 401 })
  }
}
