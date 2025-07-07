import { NextResponse } from "next/server"
import { ownerService, companyService, saccoService, vehicleService } from "@/lib/db-service"

export async function GET() {
  try {
    console.log("🌱 Seeding Ryan Otieno as owner...")
    
    // Create Ryan Otieno as owner
    const ryanOwner = await ownerService.create({
      name: "Ryan Otieno",
      email: "ryanotieno@gmail.com",
      phone: "5056991511",
      password: "password1"
    })
    console.log("✅ Ryan Otieno created as owner:", ryanOwner)

    // Create Latema Sacco company
    const latemaCompany = await companyService.create({
      name: "Latema Sacco",
      businessLicense: "LATEMA123",
      address: "Nairobi, Kenya",
      phone: "5056991511",
      email: "ryanotieno@gmail.com",
      ownerName: "Ryan Otieno"
    })
    console.log("✅ Latema Sacco company created:", latemaCompany)

    // Create Latema Sacco
    const latemaSacco = await saccoService.create({
      saccoName: "Latema Sacco",
      companyId: latemaCompany.id,
      route: "CBD terminal - Lavington",
      routeStart: "CBD terminal",
      routeEnd: "Lavington",
      busStops: JSON.stringify([
        "CBD",
        "Museum Hill", 
        "City Mortuary",
        "Office Park",
        "Kasuku",
        "Kwa Kidero",
        "Kileleshwa Academy",
        "Methodist",
        "Quickmart Lavington"
      ]),
      ownerName: "Ryan Otieno"
    })
    console.log("✅ Latema Sacco created:", latemaSacco)

    // Add vehicles to the sacco
    const vehicle1 = await vehicleService.create({
      name: "Toyota Quantum",
      regNumber: "KBW 138P",
      capacity: 14,
      saccoId: latemaSacco.id,
      status: 'active'
    })
    
    const vehicle2 = await vehicleService.create({
      name: "Toyota Quantum", 
      regNumber: "KDA 882P",
      capacity: 14,
      saccoId: latemaSacco.id,
      status: 'active'
    })
    
    console.log("✅ Vehicles added:", vehicle1, vehicle2)

    return NextResponse.json({
      success: true,
      message: "Ryan Otieno is now an owner of Latema Sacco",
      data: {
        owner: ryanOwner,
        company: latemaCompany,
        sacco: latemaSacco,
        vehicles: [vehicle1, vehicle2]
      }
    })
    
  } catch (error) {
    console.error("❌ Error seeding Ryan Otieno:", error)
    return NextResponse.json({
      success: false,
      error: "Failed to seed Ryan Otieno as owner"
    }, { status: 500 })
  }
} 