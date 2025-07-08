import { NextRequest, NextResponse } from "next/server"
import { userService, ownerService, companyService, saccoService, vehicleService, routeService, driverService } from "@/lib/db-service"
import { db } from "@/lib/database"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { firstName, lastName, email, phone, password, role, ...additionalData } = body

    console.log("🔐 Registration attempt:", { firstName, lastName, email, role, additionalData })

    // Validate required fields
    if (!firstName || !lastName || !email || !phone || !password || !role) {
      console.log("❌ Missing required fields:", { firstName, lastName, email, phone, password: !!password, role })
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 })
    }

    // Check if database tables exist, if not initialize them
    try {
      console.log("🔍 Checking if users table exists...")
      await userService.getByEmail("test@example.com")
      console.log("✅ Users table exists")
    } catch (dbError) {
      console.log("❌ Database tables missing, initializing...")
      if (dbError instanceof Error && dbError.message.includes("no such table")) {
        try {
          // Initialize database tables
          const initResponse = await fetch(`${request.nextUrl.origin}/api/init-database`)
          if (!initResponse.ok) {
            throw new Error("Failed to initialize database")
          }
          console.log("✅ Database initialized successfully")
        } catch (initError) {
          console.error("❌ Failed to initialize database:", initError)
          return NextResponse.json({ 
            error: "Database not available. Please try again later.",
            details: "Database initialization failed"
          }, { status: 503 })
        }
      } else {
        throw dbError
      }
    }

    // Handle registration based on role
    if (role === "owner") {
      console.log("🏢 Owner registration - creating owner and company...")
      
      // Check if owner already exists
      const existingOwner = await ownerService.getByEmail(email)
      if (existingOwner) {
        console.log("❌ Owner already exists:", email)
        return NextResponse.json({ error: "Owner with this email already exists." }, { status: 400 })
      }
      
      try {
        // Create owner in owners table
        const ownerName = `${firstName} ${lastName}`
        const newOwner = await ownerService.create({
          name: ownerName,
          email: email,
          phone: phone,
          password: password,
        })

        console.log("✅ Owner created:", { id: newOwner.id, name: newOwner.name })

        // Create company for owner
        const company = await companyService.create({
          name: additionalData.companyName || `${firstName} ${lastName} Company`,
          businessLicense: additionalData.businessLicense || "N/A",
          address: additionalData.address || "N/A",
          phone: phone,
          email: email,
          ownerName: ownerName,
        })

        console.log("✅ Company created for owner:", company)
        
        console.log("✅ Owner registration successful for:", email)
        
        return NextResponse.json({ 
          success: true, 
          message: "Owner registration successful",
          owner: {
            id: newOwner.id,
            name: newOwner.name,
            email: newOwner.email
          },
          company: {
            id: company.id,
            name: company.name
          }
        })
      } catch (ownerError) {
        console.error("❌ Failed to create owner/company:", ownerError)
        return NextResponse.json({ 
          error: "Owner registration failed. Please try again.",
          details: ownerError instanceof Error ? ownerError.message : "Unknown error"
        }, { status: 500 })
      }
    } else if (role === "driver") {
      // For drivers, create in drivers table
      console.log("🚗 Driver registration - creating driver...")
      
      // Check if driver already exists
      const existingDriver = await driverService.getByEmail(email)
      if (existingDriver) {
        console.log("❌ Driver already exists:", email)
        return NextResponse.json({ error: "Driver with this email already exists." }, { status: 400 })
      }

      // Check if license number already exists (if provided)
      if (additionalData.license) {
        const existingLicense = await driverService.getByLicenseNumber(additionalData.license)
        if (existingLicense) {
          console.log("❌ License number already exists:", additionalData.license)
          return NextResponse.json({ error: "Driver with this license number already exists." }, { status: 400 })
        }
      }

      console.log("✅ Creating driver in database...")
      
      // Create driver in database
      const newDriver = await driverService.create({
        firstName,
        lastName,
        email,
        phone,
        password, // In a real app, this should be hashed
        licenseNumber: additionalData.license || `TEMP_${Date.now()}`, // Temporary if not provided
        licenseExpiry: additionalData.licenseExpiry ? new Date(additionalData.licenseExpiry) : null,
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date()
      })

      console.log("✅ Driver created:", { id: newDriver.id, email: newDriver.email })

      // Handle vehicle assignment if provided
      if (additionalData.vehicle) {
        try {
          const vehicle = await vehicleService.getByRegNumber(additionalData.vehicle)
          if (vehicle) {
            await vehicleService.updateDriver(vehicle.id, newDriver.id)
            console.log("✅ Vehicle assigned to driver:", additionalData.vehicle)
          }
        } catch (vehicleError) {
          console.log("⚠️ Could not assign vehicle:", vehicleError)
        }
      }

      console.log("✅ Driver registration successful for:", email)

      return NextResponse.json({ 
        success: true, 
        message: "Driver registration successful",
        driver: {
          id: newDriver.id,
          firstName: newDriver.firstName,
          lastName: newDriver.lastName,
          email: newDriver.email,
          licenseNumber: newDriver.licenseNumber
        }
      })
    } else {
      // For regular users, create in users table
      console.log("👤 User registration - creating user...")
      
      // Check if user already exists
      const existingUser = await userService.getByEmail(email)
      if (existingUser) {
        console.log("❌ User already exists:", email)
        return NextResponse.json({ error: "User with this email already exists." }, { status: 400 })
      }

      console.log("✅ Creating user in database...")
      
      // Create user in database
      const newUser = await userService.create({
        firstName,
        lastName,
        email,
        phone,
        password, // In a real app, this should be hashed
        role,
      })

      console.log("✅ User created:", { id: newUser.id, email: newUser.email, role: newUser.role })

      console.log("✅ User registration successful for:", email)

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
    }

  } catch (err) {
    console.error("❌ Registration error:", err)
    return NextResponse.json({ 
      error: "Registration failed. Please try again.",
      details: err instanceof Error ? err.message : "Unknown error"
    }, { status: 500 })
  }
} 