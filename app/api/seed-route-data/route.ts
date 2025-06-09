import { NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function GET() {
  try {
    // Seed route_stops for Nairobi to Mombasa route (route_id 1)
    await sql`
      INSERT INTO route_stops (route_id, station_id, stop_order, distance_from_start, estimated_time)
      VALUES 
        (1, 1, 0, 0, 0),           -- Nairobi Central Station (start)
        (1, 9, 1, 232, 180),       -- Mtito Andei Station
        (1, 5, 2, 485, 390)        -- Mombasa Terminal (end)
      ON CONFLICT (route_id, station_id) DO NOTHING
    `

    // Seed route_stops for Nairobi to Kisumu route (route_id 2)
    await sql`
      INSERT INTO route_stops (route_id, station_id, stop_order, distance_from_start, estimated_time)
      VALUES 
        (1, 1, 0, 0, 0),           -- Nairobi Central Station (start)
        (2, 7, 1, 158, 150),       -- Nakuru Central
        (2, 6, 2, 344, 300)        -- Kisumu Bus Terminal (end)
      ON CONFLICT (route_id, station_id) DO NOTHING
    `

    // Assign routes to buses
    await sql`
      UPDATE buses SET route_id = 1 WHERE id = 1;  -- KBZ 123C assigned to Nairobi-Mombasa
      UPDATE buses SET route_id = 2 WHERE id = 2;  -- KCA 456D assigned to Nairobi-Kisumu
      UPDATE buses SET route_id = 3 WHERE id = 3;  -- KBY 789E assigned to Nairobi-Nakuru
      UPDATE buses SET route_id = 4 WHERE id = 4;  -- KBY 456G assigned to Nairobi-Eldoret
      UPDATE buses SET route_id = 5 WHERE id = 5;  -- KDZ 789H assigned to Mombasa-Nairobi
      UPDATE buses SET route_id = 8 WHERE id = 6;  -- KCA 789F assigned to Mtito Andei-Mombasa
    `

    // Add route schedules
    await sql`
      INSERT INTO route_schedules (route_id, departure_time, days_of_week, is_active)
      VALUES
        (1, '07:30:00', '1111100', true),  -- Nairobi-Mombasa: Weekdays at 7:30 AM
        (1, '11:30:00', '1111111', true),  -- Nairobi-Mombasa: Daily at 11:30 AM
        (1, '15:00:00', '1111100', true),  -- Nairobi-Mombasa: Weekdays at 3:00 PM
        (1, '21:00:00', '1111111', true),  -- Nairobi-Mombasa: Daily at 9:00 PM (Night travel)
        (2, '08:00:00', '1111100', true),  -- Nairobi-Kisumu: Weekdays at 8:00 AM
        (2, '12:15:00', '1111111', true),  -- Nairobi-Kisumu: Daily at 12:15 PM
        (2, '16:30:00', '1111100', true)   -- Nairobi-Kisumu: Weekdays at 4:30 PM
      ON CONFLICT DO NOTHING
    `

    // Add vehicle locations
    await sql`
      INSERT INTO vehicle_locations (bus_id, latitude, longitude, speed, heading, next_stop_id, estimated_arrival)
      VALUES
        (1, -2.1, 37.5, 75.5, 135, 9, 45),  -- KBZ 123C on the way to Mtito Andei
        (2, -0.9, 35.8, 65.2, 270, 7, 30),  -- KCA 456D on the way to Nakuru
        (3, -1.1, 36.5, 70.0, 315, 7, 20)   -- KBY 789E on the way to Nakuru
    `

    return NextResponse.json({ success: true, message: "Route data seeded successfully" })
  } catch (error) {
    console.error("Error seeding route data:", error)
    return NextResponse.json({ error: "Failed to seed route data" }, { status: 500 })
  }
}
