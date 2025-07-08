import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { saccos, vehicles } from "@/lib/schema"
import { eq } from "drizzle-orm"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const ownerName = searchParams.get('ownerName')
    
    if (!ownerName) {
      return NextResponse.json({
        success: false,
        error: "Owner name is required"
      }, { status: 400 })
    }

    console.log(`🔍 Searching for saccos owned by: ${ownerName}`)
    
    // Search for saccos where ownerName matches
    const userSaccos = await db
      .select()
      .from(saccos)
      .where(eq(saccos.ownerName, ownerName))

    console.log(`✅ Found ${userSaccos.length} saccos for ${ownerName}:`, userSaccos)

    // Get all vehicles to calculate vehicle counts for each sacco
    const allVehicles = await db.select().from(vehicles)
    
    // Transform saccos to include vehicle information
    const saccosWithVehicles = userSaccos.map((sacco: any) => {
      const saccoVehicles = allVehicles.filter((vehicle: any) => vehicle.saccoId === sacco.id)
      
      return {
        ...sacco,
        vehicles: saccoVehicles.map((vehicle: any) => ({
          id: vehicle.id,
          name: vehicle.name,
          regNumber: vehicle.regNumber,
          capacity: vehicle.capacity,
          status: vehicle.status
        }))
      }
    })

    return NextResponse.json({
      success: true,
      message: userSaccos.length > 0 
        ? `Found ${userSaccos.length} saccos owned by ${ownerName}` 
        : `No saccos found for ${ownerName}. You may need to register saccos first.`,
      data: {
        ownerName,
        saccos: saccosWithVehicles,
        count: userSaccos.length
      }
    })

  } catch (error) {
    console.error("❌ Error searching for user saccos:", error)
    return NextResponse.json({
      success: false,
      error: "Failed to search for user saccos"
    }, { status: 500 })
  }
} 