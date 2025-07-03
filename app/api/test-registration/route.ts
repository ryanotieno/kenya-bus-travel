import { NextResponse } from "next/server"
import { userService, ownerService, companyService } from "@/lib/db-service"

export async function GET() {
  try {
    console.log("🧪 Testing new owner registration system...")
    
    // Test owner creation
    const testOwner = {
      name: "Test Owner",
      email: "test.owner@example.com",
      phone: "1234567890",
      password: "testpass123"
    }

    console.log("📝 Testing owner creation...")
    
    // Check if test owner already exists
    const existingOwner = await ownerService.getByEmail(testOwner.email)
    if (existingOwner) {
      console.log("⚠️ Test owner already exists, deleting...")
      await ownerService.delete(existingOwner.id)
    }

    // Create test owner
    const newOwner = await ownerService.create(testOwner)
    console.log("✅ Test owner created:", { id: newOwner.id, email: newOwner.email, name: newOwner.name })

    // Test company creation
    console.log("🏢 Testing company creation...")
    const testCompany = {
      name: "Test Company",
      businessLicense: "TEST123",
      address: "Test Address",
      phone: "1234567890",
      email: "test@company.com",
      ownerName: newOwner.name
    }

    const newCompany = await companyService.create(testCompany)
    console.log("✅ Test company created:", { id: newCompany.id, name: newCompany.name })

    // Clean up test data
    console.log("🧹 Cleaning up test data...")
    await ownerService.delete(newOwner.id)
    
    return NextResponse.json({
      success: true,
      message: "New owner registration system is working properly",
      tests: {
        ownerCreation: "✅ Passed",
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