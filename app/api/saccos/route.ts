import { NextRequest, NextResponse } from "next/server"
import { saccoService, companyService, vehicleService } from "@/lib/db-service"
import { db } from "@/lib/database"

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
    throw error // Re-throw the error so the client knows something went wrong
  }
} 