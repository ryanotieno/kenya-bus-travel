import { NextResponse } from "next/server"
import { userService } from "@/lib/db-service"
import usersData from "@/data/users.json"
import driversData from "@/data/drivers.json"

export async function GET() {
  try {
    console.log("Starting to seed users and drivers...")
    
    let seededCount = 0
    let skippedCount = 0

    // Seed owners and regular users
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

    // Seed drivers
    for (const driverData of driversData) {
      try {
        // Check if driver already exists
        const existingDriver = await userService.getByEmail(driverData.email)
        
        if (existingDriver) {
          console.log(`Driver ${driverData.email} already exists, skipping...`)
          skippedCount++
          continue
        }

        // Create new driver
        const newDriver = await userService.create({
          firstName: driverData.firstName,
          lastName: driverData.lastName,
          email: driverData.email,
          phone: driverData.phone,
          password: driverData.password,
          role: "driver",
          createdAt: new Date(driverData.registeredAt),
          updatedAt: new Date()
        })

        console.log(`Created driver: ${newDriver.email} (${newDriver.role})`)
        seededCount++
      } catch (error) {
        console.error(`Error creating driver ${driverData.email}:`, error)
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: `Users and drivers seeded successfully. Created: ${seededCount}, Skipped: ${skippedCount}`,
      created: seededCount,
      skipped: skippedCount
    })
  } catch (error) {
    console.error("Error seeding users and drivers:", error)
    return NextResponse.json({ error: "Failed to seed users and drivers" }, { status: 500 })
  }
} 