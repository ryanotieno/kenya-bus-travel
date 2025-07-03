import { NextRequest, NextResponse } from "next/server"
import { saccoService, companyService, vehicleService } from "@/lib/db-service"

export async function GET(request: NextRequest) {
  try {
    console.log("🔍 Fetching saccos from database...")
    
    // Try to get saccos from database
    const saccos = await saccoService.getAll()
    
    console.log(`✅ Found ${saccos.length} saccos in database`)
    
    const companies = await companyService.getAll()
    const vehicles = await vehicleService.getAll()
    
    // Transform data to include company and vehicle information
    const transformedSaccos = saccos.map((sacco: any) => {
      const company = companies.find((c: any) => c.id === sacco.companyId)
      const saccoVehicles = vehicles.filter((v: any) => v.saccoId === sacco.id)
      
      return {
        id: sacco.id,
        saccoName: sacco.saccoName,
        route: sacco.route,
        companyName: company?.name || "Unknown Company",
        companyEmail: company?.email || "",
        vehicles: saccoVehicles.map((vehicle: any) => ({
          id: vehicle.id,
          name: vehicle.name,
          regNumber: vehicle.regNumber,
          capacity: vehicle.capacity,
          status: vehicle.status
        }))
      }
    })
    
    return NextResponse.json(transformedSaccos)
  } catch (error) {
    console.error("❌ Error fetching saccos:", error)
    
    // If database tables don't exist, try to initialize them
    if (error instanceof Error && error.message.includes("no such table")) {
      console.log("🔧 Saccos table missing, attempting database initialization...")
      
      try {
        // Try to initialize database
        const initResponse = await fetch(`${request.nextUrl.origin}/api/init-database`)
        if (initResponse.ok) {
          console.log("✅ Database initialized, retrying saccos fetch...")
          // Retry fetching saccos after initialization
          const retrySaccos = await saccoService.getAll()
          return NextResponse.json(retrySaccos)
        }
      } catch (initError) {
        console.error("❌ Failed to initialize database:", initError)
      }
      
      console.log("📝 Returning sample saccos data")
      
      const sampleSaccos = [
        {
          id: 1,
          saccoName: "Latema Sacco",
          route: "Nairobi - Mombasa",
          companyName: "Latema Transport Ltd",
          companyEmail: "info@latema.co.ke",
          vehicles: [
            {
              id: 1,
              name: "Latema Bus 1",
              regNumber: "KCA 123A",
              capacity: 45,
              status: "active"
            }
          ]
        },
        {
          id: 2,
          saccoName: "Kiragi Sacco", 
          route: "Nairobi - Kisumu",
          companyName: "Kiragi Transport",
          companyEmail: "info@kiragi.co.ke",
          vehicles: [
            {
              id: 2,
              name: "Kiragi Bus 1",
              regNumber: "KCA 456B",
              capacity: 52,
              status: "active"
            }
          ]
        },
        {
          id: 3,
          saccoName: "KILE KILE",
          route: "Nairobi - Nakuru",
          companyName: "Kile Kile Transport",
          companyEmail: "info@kilekile.co.ke",
          vehicles: [
            {
              id: 3,
              name: "Kile Kile Bus 1",
              regNumber: "KCA 789C",
              capacity: 48,
              status: "active"
            }
          ]
        }
      ]
      
      return NextResponse.json(sampleSaccos)
    }
    
    // For other errors, return empty array
    console.log("📝 Returning empty saccos array due to error")
    return NextResponse.json([])
  }
} 