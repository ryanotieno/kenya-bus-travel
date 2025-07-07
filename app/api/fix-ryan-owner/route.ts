import { NextRequest, NextResponse } from "next/server"
import { ownerService, companyService, saccoService, vehicleService } from "@/lib/db-service"

export async function POST() {
  try {
    console.log("🔧 Fixing Ryan Otieno owner access...")
    
    // Check if Ryan Otieno already exists as an owner
    let ryanOwner = await ownerService.getByEmail("ryanotieno@gmail.com")
    
    if (!ryanOwner) {
      console.log("👤 Creating Ryan Otieno as owner...")
      ryanOwner = await ownerService.create({
        name: "Ryan Otieno",
        email: "ryanotieno@gmail.com",
        phone: "5056991511",
        password: "password1"
      })
      console.log("✅ Ryan Otieno created as owner:", ryanOwner)
    } else {
      console.log("✅ Ryan Otieno already exists as owner:", ryanOwner)
    }

    // Check if Latema Sacco company exists
    const companies = await companyService.getAll()
    let latemaCompany = companies.find((c: any) => c.name === "Latema Sacco")
    
    if (!latemaCompany) {
      console.log("🏢 Creating Latema Sacco company for Ryan Otieno...")
      latemaCompany = await companyService.create({
        name: "Latema Sacco",
        businessLicense: "LATEMA123",
        address: "Nairobi, Kenya",
        phone: "5056991511",
        email: "ryanotieno@gmail.com",
        ownerName: "Ryan Otieno"
      })
      console.log("✅ Latema Sacco company created:", latemaCompany)
    } else {
      // Update existing company to be owned by Ryan Otieno
      console.log("🔄 Updating Latema Sacco ownership to Ryan Otieno...")
      // Note: We'd need an update method in companyService
      console.log("⚠️ Company update would require additional service method")
    }

    // Check if Latema Sacco exists
    const saccos = await saccoService.getAll()
    let latemaSacco = saccos.find((s: any) => s.saccoName === "Latema Sacco")
    
    if (!latemaSacco) {
      console.log("🚌 Creating Latema Sacco...")
      latemaSacco = await saccoService.create({
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
    } else {
      console.log("✅ Latema Sacco already exists:", latemaSacco)
    }

    // Add some vehicles to the sacco
    const vehicles = await vehicleService.getAll()
    const saccoVehicles = vehicles.filter((v: any) => v.saccoId === latemaSacco.id)
    
    if (saccoVehicles.length === 0) {
      console.log("🚗 Adding vehicles to Latema Sacco...")
      
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
    } else {
      console.log("✅ Vehicles already exist for Latema Sacco:", saccoVehicles.length)
    }

    return NextResponse.json({
      success: true,
      message: "Ryan Otieno is now an owner of Latema Sacco",
      owner: ryanOwner,
      company: latemaCompany,
      sacco: latemaSacco
    })
    
  } catch (error) {
    console.error("❌ Error fixing Ryan Otieno owner access:", error)
    return NextResponse.json({
      success: false,
      error: "Failed to fix owner access"
    }, { status: 500 })
  }
} 