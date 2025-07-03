import { NextRequest, NextResponse } from "next/server"
import { companyService, saccoService, vehicleService, routeService } from "@/lib/db-service"

export async function GET() {
  try {
    const companies = await companyService.getAll()
    const saccos = await saccoService.getAll()
    const vehicles = await vehicleService.getAll()
    
    // Try to get routes, but handle the case where the table doesn't exist yet
    let routes: any[] = []
    try {
      routes = await routeService.getAll()
    } catch (routeError) {
      console.log("Routes table doesn't exist yet, continuing without routes:", routeError)
      routes = []
    }
    
    console.log("✅ Successfully handled routes table check")
    
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
    const { ownerEmail, saccoName, route, routeStart, routeEnd, busStops, vehicles } = body
    
    if (!ownerEmail || !saccoName) {
      return NextResponse.json({ error: "Invalid data." }, { status: 400 })
    }

    // Find or create company for owner
    let companies = await companyService.getAll()
    let company = companies.find((c: any) => c.email === ownerEmail)
    
    if (!company) {
      company = await companyService.create({
        name: ownerEmail.split('@')[0] + " Company",
        businessLicense: "N/A",
        address: "N/A",
        phone: "",
        email: ownerEmail,
        ownerId: null,
      })
    }

    // Check if sacco already exists
    let saccos = await saccoService.getByCompanyId(company.id)
    let sacco = saccos.find((s: any) => s.saccoName === saccoName)
    
    if (!sacco) {
      // Create new sacco
      sacco = await saccoService.create({
        saccoName,
        companyId: company.id,
        route: route || (routeStart && routeEnd ? `${routeStart} - ${routeEnd}` : ""),
      })

      // Create route for this sacco if routeStart and routeEnd are provided
      if (routeStart && routeEnd) {
        try {
          await routeService.create({
            name: `${routeStart} - ${routeEnd}`,
            startLocation: routeStart,
            endLocation: routeEnd,
            distance: 0, // Would need to calculate
            estimatedTime: 0, // Would need to estimate
            fare: 0, // Would need to set
            saccoId: sacco.id,
            status: 'active'
          })
        } catch (routeError) {
          console.log("Routes table doesn't exist yet, skipping route creation:", routeError)
          // Continue without creating the route - the sacco will still be created
        }
      }

      // Create vehicles for this sacco
      if (vehicles && vehicles.length > 0) {
        for (const vehicleData of vehicles) {
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
      if (vehicles && vehicles.length > 0) {
        // Get existing vehicles for this sacco
        const existingVehicles = await vehicleService.getAll()
        const saccoVehicles = existingVehicles.filter((v: any) => v.saccoId === (sacco as any).id)
        
        // Remove vehicles that are no longer in the list
        for (const existingVehicle of saccoVehicles) {
          const stillExists = vehicles.find((v: any) => v.id === existingVehicle.id)
          if (!stillExists) {
            // Note: We'd need a delete method in vehicleService
            console.log("Would delete vehicle:", existingVehicle.id)
          }
        }
        
        // Add new vehicles
        for (const vehicleData of vehicles) {
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

    return NextResponse.json({ success: true, company, sacco })
  } catch (err) {
    console.error("Error saving company:", err)
    return NextResponse.json({ error: "Could not save company data." }, { status: 500 })
  }
} 