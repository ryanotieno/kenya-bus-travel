import { NextRequest, NextResponse } from "next/server"
import { companyService, ownerService, saccoService, vehicleService } from "@/lib/db-service"
import { getSession } from "@/lib/auth"

export async function GET() {
  try {
    console.log("🔍 Starting GET request for /api/companies/my")
    
    // Get current session
    const session = await getSession()
    console.log("Session data:", session)
    
    if (!session) {
      console.log("❌ No session found")
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    console.log("🔍 Fetching companies for owner:", session.email)

    // Get all data
    const companies = await companyService.getAll()
    const owners = await ownerService.getAll()
    const saccos = await saccoService.getAll()
    const vehicles = await vehicleService.getAll()
    
    // Find the owner by email
    const owner = owners.find((o: any) => o.email === session.email)
    if (!owner) {
      console.log("❌ Owner not found for email:", session.email)
      return NextResponse.json([])
    }

    console.log("✅ Found owner:", owner.name)

    // Filter companies for this owner
    const ownerCompanies = companies.filter((company: any) => company.ownerName === owner.name)
    
    // Also find saccos directly owned by this owner
    const ownerSaccos = saccos.filter((sacco: any) => sacco.ownerName === owner.name)
    
    console.log(`✅ Found ${ownerCompanies.length} companies and ${ownerSaccos.length} saccos for owner`)

    // Transform data to match dashboard format
    let transformedCompanies = ownerCompanies.map((company: any) => {
      const companySaccos = saccos.filter((sacco: any) => sacco.companyId === company.id)
      
      return {
        ownerEmail: owner.email,
        ownerName: owner.name,
        companyName: company.name,
        saccos: companySaccos.map((sacco: any) => {
          const saccoVehicles = vehicles.filter((vehicle: any) => vehicle.saccoId === sacco.id)
          
          console.log(`Sacco ${sacco.saccoName} has ${saccoVehicles.length} vehicles:`, saccoVehicles)
          
          return {
            saccoName: sacco.saccoName,
            route: sacco.route || "",
            routeStart: sacco.routeStart || "",
            routeEnd: sacco.routeEnd || "",
            busStops: sacco.busStops ? JSON.parse(sacco.busStops) : [],
            vehicles: saccoVehicles.map((vehicle: any) => ({
              id: vehicle.id,
              name: vehicle.name,
              regNumber: vehicle.regNumber,
              capacity: vehicle.capacity
            }))
          }
        })
      }
    })

    // If no companies found but owner has saccos, create a virtual company
    if (transformedCompanies.length === 0 && ownerSaccos.length > 0) {
      console.log("🏢 Creating virtual company for owner's saccos")
      transformedCompanies = [{
        ownerEmail: owner.email,
        ownerName: owner.name,
        companyName: `${owner.name}'s Company`,
        saccos: ownerSaccos.map((sacco: any) => {
          const saccoVehicles = vehicles.filter((vehicle: any) => vehicle.saccoId === sacco.id)
          
          console.log(`Sacco ${sacco.saccoName} has ${saccoVehicles.length} vehicles:`, saccoVehicles)
          
          return {
            saccoName: sacco.saccoName,
            route: sacco.route || "",
            routeStart: sacco.routeStart || "",
            routeEnd: sacco.routeEnd || "",
            busStops: sacco.busStops ? JSON.parse(sacco.busStops) : [],
            vehicles: saccoVehicles.map((vehicle: any) => ({
              id: vehicle.id,
              name: vehicle.name,
              regNumber: vehicle.regNumber,
              capacity: vehicle.capacity
            }))
          }
        })
      }]
    }
    
    console.log("✅ Returning companies:", transformedCompanies)
    return NextResponse.json(transformedCompanies)
  } catch (err) {
    console.error("Error reading owner companies:", err)
    return NextResponse.json([])
  }
} 