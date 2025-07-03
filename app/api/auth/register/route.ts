import { NextRequest, NextResponse } from "next/server"
import { userService, companyService, saccoService, vehicleService, routeService } from "@/lib/db-service"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { firstName, lastName, email, phone, password, role, ...additionalData } = body

    // Validate required fields
    if (!firstName || !lastName || !email || !phone || !password || !role) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 })
    }

    // Check if user already exists
    const existingUser = await userService.getByEmail(email)
    if (existingUser) {
      return NextResponse.json({ error: "User with this email already exists." }, { status: 400 })
    }

    // Create user in database
    const newUser = await userService.create({
      firstName,
      lastName,
      email,
      phone,
      password, // In a real app, this should be hashed
      role,
    })

    // Handle role-specific data
    if (role === "driver") {
      // For drivers, we need to associate them with an existing sacco
      // This would typically be done by an admin or through a different flow
      console.log("Driver registration - would need sacco assignment logic")
    } else if (role === "owner") {
      // Create company for owner
      const company = await companyService.create({
        name: additionalData.companyName || `${firstName} ${lastName} Company`,
        businessLicense: additionalData.businessLicense || "N/A",
        address: additionalData.address || "N/A",
        phone: phone,
        email: email,
        ownerId: newUser.id,
      })

      console.log("Owner registration - company created:", company)
    }

    return NextResponse.json({ 
      success: true, 
      message: "Registration successful",
      user: {
        id: newUser.id,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: newUser.email,
        role: newUser.role
      }
    })

  } catch (err) {
    console.error("Registration error:", err)
    return NextResponse.json({ error: "Registration failed. Please try again." }, { status: 500 })
  }
} 