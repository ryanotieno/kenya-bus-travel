// Version 1.2.3 - Removed routes dependency to fix database errors
import { NextRequest, NextResponse } from "next/server"
import { companyService, saccoService, vehicleService } from "@/lib/db-service"

export async function GET() {
  try {
    const companies = await companyService.getAll()
    const saccos = await saccoService.getAll()
    const vehicles = await vehicleService.getAll()
    
    // Routes table not available yet - using empty array
    const routes: any[] = []
    console.log("✅ Using empty routes array - routes table not available")
    
    // Transform database data to match dashboard format
    const transformedCompanies = companies.map((company: any) => {
      const companySaccos = saccos.filter((sacco: any) => sacco.companyId === company.id)
      
      return {
        ownerEmail: company.email,
        ownerName: company.name,
        companyName: company.name,
        saccos: companySaccos.map((sacco: any) => {
          const saccoVehicles = vehicles.filter((vehicle: any) => vehicle.saccoId === sacco.id)
          const saccoRoutes = routes.filter((route: any) => route.saccoId === sacco.id)
          
          // Get the first route for route info
          const firstRoute = saccoRoutes[0] || null
          
          console.log(`Sacco ${sacco.saccoName} has ${saccoVehicles.length} vehicles:`, saccoVehicles)
          
          return {
            saccoName: sacco.saccoName,
            route: sacco.route || (firstRoute ? `${firstRoute.startLocation} - ${firstRoute.endLocation}` : ""),
            routeStart: firstRoute?.startLocation || "",
            routeEnd: firstRoute?.endLocation || "",
            busStops: [], // Would need to fetch from busStops table
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
    
    return NextResponse.json(transformedCompanies)
  } catch (err) {
    console.error("Error reading companies:", err)
    return NextResponse.json([])
  }
}

// POST body: { ownerEmail, saccoName, route, routeStart, routeEnd, busStops, vehicles }
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      ownerName,
      name, 
      businessLicense, 
      address, 
      phone, 
      email
    } = body
    
    if (!ownerName || !name) {
      return NextResponse.json({ 
        success: false, 
        error: "Owner name and company name are required." 
      }, { status: 400 })
    }

    // Create new company
    const newCompany = await companyService.create({
      name,
      businessLicense,
      address,
      phone,
      email,
      ownerName,
    })

    // Check if sacco already exists
    let saccos = await saccoService.getByCompanyId(newCompany.id)
    let sacco = saccos.find((s: any) => s.saccoName === body.saccoName)
    
    if (!sacco) {
      // Create new sacco
      sacco = await saccoService.create({
        saccoName: body.saccoName,
        companyId: newCompany.id,
        route: body.route || (body.routeStart && body.routeEnd ? `${body.routeStart} - ${body.routeEnd}` : ""),
      })

      // Route creation skipped - routes table not available yet
      console.log("Skipping route creation - routes table not available")

      // Create vehicles for this sacco
      if (body.vehicles && body.vehicles.length > 0) {
        for (const vehicleData of body.vehicles) {
          console.log('Creating new vehicle:', vehicleData)
          const newVehicle = await vehicleService.create({
            name: vehicleData.name,
            regNumber: vehicleData.regNumber,
            capacity: vehicleData.capacity,
            saccoId: sacco.id,
            status: 'active'
          })
          console.log('Created vehicle:', newVehicle)
        }
      }
    } else if (sacco) {
      // Update existing sacco - handle vehicle updates
      if (body.vehicles && body.vehicles.length > 0) {
        // Get existing vehicles for this sacco
        const existingVehicles = await vehicleService.getAll()
        const saccoVehicles = existingVehicles.filter((v: any) => v.saccoId === (sacco as any).id)
        
        // Remove vehicles that are no longer in the list
        for (const existingVehicle of saccoVehicles) {
          const stillExists = body.vehicles.find((v: any) => v.id === existingVehicle.id)
          if (!stillExists) {
            // Note: We'd need a delete method in vehicleService
            console.log("Would delete vehicle:", existingVehicle.id)
          }
        }
        
        // Add new vehicles
        for (const vehicleData of body.vehicles) {
          console.log('Processing vehicle:', vehicleData)
          if (!vehicleData.id || vehicleData.id.toString().startsWith('temp')) {
            // This is a new vehicle
            console.log('Creating new vehicle:', vehicleData)
            const newVehicle = await vehicleService.create({
              name: vehicleData.name,
              regNumber: vehicleData.regNumber,
              capacity: vehicleData.capacity,
              saccoId: (sacco as any).id,
              status: 'active'
            })
            console.log('Created vehicle:', newVehicle)
          }
        }
      }
    }

    return NextResponse.json({ success: true, company: newCompany, sacco })
  } catch (err) {
    console.error("Error saving company:", err)
    return NextResponse.json({ error: "Could not save company data." }, { status: 500 })
  }
} 