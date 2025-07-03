import { NextRequest, NextResponse } from "next/server"
import { saccoService, companyService, vehicleService } from "@/lib/db-service"

export async function GET() {
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
    
    // If database tables don't exist, return sample data
    if (error instanceof Error && error.message.includes("no such table")) {
      console.log("📝 Returning sample saccos data")
      
      const sampleSaccos = [
        {
          id: 1,
          saccoName: "Latema Sacco",
          companyId: 1,
          route: "Nairobi - Mombasa",
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 2,
          saccoName: "Kiragi Sacco", 
          companyId: 2,
          route: "Nairobi - Kisumu",
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 3,
          saccoName: "KILE KILE",
          companyId: 3,
          route: "Nairobi - Nakuru",
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ]
      
      return NextResponse.json(sampleSaccos)
    }
    
    // For other errors, return empty array
    console.log("📝 Returning empty saccos array due to error")
    return NextResponse.json([])
  }
} 