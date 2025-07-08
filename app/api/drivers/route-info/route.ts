import { NextRequest, NextResponse } from "next/server"
import { driverService } from "@/lib/db-service"
import { getSession } from "@/lib/auth"

export async function GET() {
  try {
    // Get the current session to identify the driver
    const sessionData = await getSession();
    
    if (!sessionData || sessionData.role !== 'driver') {
      return NextResponse.json({ 
        error: "Unauthorized - Driver access required" 
      }, { status: 401 });
    }

    const driverId = parseInt(sessionData.id);
    
    // Get driver's current route assignment
    const routeInfo = await driverService.getDriverRouteInfo(driverId);
    
    return NextResponse.json(routeInfo);
  } catch (error) {
    console.error("❌ Error getting driver route info:", error);
    return NextResponse.json({ 
      error: "Failed to get route information" 
    }, { status: 500 });
  }
} 