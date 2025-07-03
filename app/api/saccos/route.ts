import { NextRequest, NextResponse } from "next/server"
import { saccoService, companyService, vehicleService, routeService } from "@/lib/db-service"
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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      ownerEmail, 
      saccoName, 
      routeStart, 
      routeEnd, 
      busStops, 
      companyName,
      businessLicense,
      address,
      phone
    } = body
    
    console.log("📝 Registering new sacco:", { ownerEmail, saccoName, routeStart, routeEnd })
    
    if (!ownerEmail || !saccoName) {
      return NextResponse.json({ 
        success: false, 
        error: "Owner email and sacco name are required." 
      }, { status: 400 })
    }

    // Find or create company for owner
    let companies = await companyService.getAll()
    let company = companies.find((c: any) => c.email === ownerEmail)
    
    if (!company) {
      console.log("🏢 Creating new company for owner:", ownerEmail)
      company = await companyService.create({
        name: companyName || `${ownerEmail.split('@')[0]} Transport Ltd`,
        businessLicense: businessLicense || "PENDING",
        address: address || "N/A",
        phone: phone || "",
        email: ownerEmail,
        ownerId: null,
      })
      console.log("✅ Created company:", company)
    }

    // Check if sacco already exists for this company
    let saccos = await saccoService.getByCompanyId(company.id)
    let existingSacco = saccos.find((s: any) => s.saccoName === saccoName)
    
    if (existingSacco) {
      return NextResponse.json({ 
        success: false, 
        error: "A sacco with this name already exists for your company." 
      }, { status: 409 })
    }

    // Create new sacco
    const route = routeStart && routeEnd ? `${routeStart} - ${routeEnd}` : ""
    const newSacco = await saccoService.create({
      saccoName,
      companyId: company.id,
      route: route,
    })
    
    console.log("✅ Created sacco:", newSacco)

    // Create route for this sacco if routeStart and routeEnd are provided
    if (routeStart && routeEnd) {
      try {
        const newRoute = await routeService.create({
          name: route,
          startLocation: routeStart,
          endLocation: routeEnd,
          distance: 0, // Would need to calculate
          estimatedTime: 0, // Would need to estimate
          fare: 0, // Would need to set
          saccoId: newSacco.id,
          status: 'active'
        })
        console.log("✅ Created route:", newRoute)
      } catch (routeError) {
        console.log("Routes table doesn't exist yet, skipping route creation:", routeError)
        // Continue without creating the route - the sacco will still be created
      }
    }

    // TODO: Handle bus stops if we have a busStops table
    if (busStops && busStops.length > 0) {
      console.log("📍 Bus stops to be added:", busStops)
      // Would need to create busStops table and service
    }

    return NextResponse.json({ 
      success: true, 
      message: "Sacco registered successfully!",
      data: {
        sacco: newSacco,
        company: company
      }
    })
    
  } catch (error) {
    console.error("❌ Error registering sacco:", error)
    return NextResponse.json({ 
      success: false, 
      error: "Failed to register sacco. Please try again." 
    }, { status: 500 })
  }
} 