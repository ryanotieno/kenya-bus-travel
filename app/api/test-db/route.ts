import { NextResponse } from "next/server"
import { userService } from "@/lib/db-service"

export async function GET() {
  try {
    console.log("Testing database connection...")
    
    // Test getting all users
    const allUsers = await userService.getAll()
    console.log(`Found ${allUsers.length} users in database`)
    
    // Test getting specific users
    const driverUser = await userService.getByEmail("ryanotieno@gmail.com")
    const ownerUser = await userService.getByEmail("otieno.charles@gmail.com")
    
    return NextResponse.json({ 
      success: true,
      totalUsers: allUsers.length,
      users: allUsers.map(user => ({
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName
      })),
      driverUser: driverUser ? {
        id: driverUser.id,
        email: driverUser.email,
        role: driverUser.role,
        firstName: driverUser.firstName,
        lastName: driverUser.lastName
      } : null,
      ownerUser: ownerUser ? {
        id: ownerUser.id,
        email: ownerUser.email,
        role: ownerUser.role,
        firstName: ownerUser.firstName,
        lastName: ownerUser.lastName
      } : null
    })
  } catch (error) {
    console.error("Database test error:", error)
    return NextResponse.json({ 
      error: "Database test failed", 
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
} 