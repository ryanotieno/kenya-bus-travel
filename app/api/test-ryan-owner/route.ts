import { NextResponse } from "next/server"
import { ownerService, companyService, saccoService, vehicleService } from "@/lib/db-service"

export async function GET() {
  try {
    console.log("🧪 Testing Ryan Otieno owner status...")
    
    // Check if Ryan Otieno exists as an owner
    const owners = await ownerService.getAll()
    console.log("All owners:", owners.map((o: any) => ({ name: o.name, email: o.email })))
    
    let ryanOwner = owners.find((o: any) => o.email === "ryanotieno@gmail.com")
    
    if (!ryanOwner) {
      console.log("❌ Ryan Otieno not found as owner, creating...")
      ryanOwner = await ownerService.create({
        name: "Ryan Otieno",
        email: "ryanotieno@gmail.com",
        phone: "5056991511",
        password: "password1"
      })
      console.log("✅ Ryan Otieno created as owner:", ryanOwner)
    } else {
      console.log("✅ Ryan Otieno found as owner:", ryanOwner)
    }

    // Check companies
    const companies = await companyService.getAll()
    console.log("All companies:", companies.map((c: any) => ({ name: c.name, ownerName: c.ownerName })))
    
    let latemaCompany = companies.find((c: any) => c.name === "Latema Sacco")
    
    if (!latemaCompany) {
      console.log("🏢 Creating Latema Sacco company...")
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
      console.log("✅ Latema Sacco company found:", latemaCompany)
    }

    // Check saccos
    const saccos = await saccoService.getAll()
    console.log("All saccos:", saccos.map((s: any) => ({ saccoName: s.saccoName, ownerName: s.ownerName })))
    
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
      console.log("✅ Latema Sacco found:", latemaSacco)
    }

    // Check vehicles
    const vehicles = await vehicleService.getAll()
    const saccoVehicles = vehicles.filter((v: any) => v.saccoId === latemaSacco.id)
    console.log(`Latema Sacco has ${saccoVehicles.length} vehicles:`, saccoVehicles.map((v: any) => v.regNumber))
    
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
    }

    return NextResponse.json({
      success: true,
      message: "Ryan Otieno owner status checked and fixed",
      data: {
        owner: ryanOwner,
        company: latemaCompany,
        sacco: latemaSacco,
        vehicles: saccoVehicles
      }
    })
    
  } catch (error) {
    console.error("❌ Error testing Ryan Otieno:", error)
    return NextResponse.json({
      success: false,
      error: "Failed to test Ryan Otieno owner status"
    }, { status: 500 })
  }
} 