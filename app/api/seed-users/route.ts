import { NextResponse } from "next/server"
import { userService } from "@/lib/db-service"
import usersData from "@/data/users.json"

export async function GET() {
  try {
    console.log("Starting to seed users...")
    
    let seededCount = 0
    let skippedCount = 0

    for (const userData of usersData) {
      try {
        // Check if user already exists
        const existingUser = await userService.getByEmail(userData.email)
        
        if (existingUser) {
          console.log(`User ${userData.email} already exists, skipping...`)
          skippedCount++
          continue
        }

        // Create new user
        const newUser = await userService.create({
          firstName: userData.firstName,
          lastName: userData.lastName,
          email: userData.email,
          phone: userData.phone,
          password: userData.password,
          role: userData.role as "owner" | "user" | "driver",
          createdAt: new Date(userData.createdAt),
          updatedAt: new Date(),
          // Add owner-specific data if it exists
          ...(userData.ownerData && {
            companyName: userData.ownerData.companyName,
            businessLicense: userData.ownerData.businessLicense,
            address: userData.ownerData.address
          })
        })

        console.log(`Created user: ${newUser.email} (${newUser.role})`)
        seededCount++
      } catch (error) {
        console.error(`Error creating user ${userData.email}:`, error)
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: `Users seeded successfully. Created: ${seededCount}, Skipped: ${skippedCount}`,
      created: seededCount,
      skipped: skippedCount
    })
  } catch (error) {
    console.error("Error seeding users:", error)
    return NextResponse.json({ error: "Failed to seed users" }, { status: 500 })
  }
} 