import { NextResponse } from "next/server"
import { userService, companyService } from "@/lib/db-service"

export async function GET() {
  try {
    console.log("🧪 Testing registration system...")
    
    // Test user creation
    const testUser = {
      firstName: "Test",
      lastName: "Owner",
      email: "test.owner@example.com",
      phone: "1234567890",
      password: "testpass123",
      role: "owner" as const
    }

    console.log("📝 Testing user creation...")
    
    // Check if test user already exists
    const existingUser = await userService.getByEmail(testUser.email)
    if (existingUser) {
      console.log("⚠️ Test user already exists, deleting...")
      await userService.delete(existingUser.id)
    }

    // Create test user
    const newUser = await userService.create(testUser)
    console.log("✅ Test user created:", { id: newUser.id, email: newUser.email, role: newUser.role })

    // Test company creation
    console.log("🏢 Testing company creation...")
    const testCompany = {
      name: "Test Company",
      businessLicense: "TEST123",
      address: "Test Address",
      phone: "1234567890",
      email: "test@company.com",
      ownerId: newUser.id
    }

    const newCompany = await companyService.create(testCompany)
    console.log("✅ Test company created:", { id: newCompany.id, name: newCompany.name })

    // Clean up test data
    console.log("🧹 Cleaning up test data...")
    await userService.delete(newUser.id)
    
    return NextResponse.json({
      success: true,
      message: "Registration system is working properly",
      tests: {
        userCreation: "✅ Passed",
        companyCreation: "✅ Passed",
        cleanup: "✅ Passed"
      }
    })
  } catch (error) {
    console.error("❌ Registration test failed:", error)
    return NextResponse.json({
      error: "Registration system test failed",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
} 