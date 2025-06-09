"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, Clock, Navigation } from "lucide-react"

interface VehicleLocation {
  id: number
  bus_id: number
  latitude: number
  longitude: number
  speed: number
  heading: number
  timestamp: string
  next_stop_id: number
  estimated_arrival: number
  next_stop_name: string
}

interface VehicleTrackerProps {
  busId: number
  busNumber: string
  routeName: string
}

export function VehicleTracker({ busId, busNumber, routeName }: VehicleTrackerProps) {
  const [location, setLocation] = useState<VehicleLocation | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchVehicleLocation() {
      try {
        setLoading(true)
        setError(null)

        const res = await fetch(`/api/vehicle-locations?busId=${busId}`)

        if (!res.ok) {
          const data = await res.json()
          throw new Error(data.error || "Failed to fetch vehicle location")
        }

        const data = await res.json()
        setLocation(data.location)
      } catch (error) {
        console.error("Error fetching vehicle location:", error)
        setError(error instanceof Error ? error.message : "Failed to fetch vehicle location")
      } finally {
        setLoading(false)
      }
    }

    fetchVehicleLocation()

    // Set up polling to update location every 30 seconds
    const interval = setInterval(fetchVehicleLocation, 30000)

    return () => clearInterval(interval)
  }, [busId])

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Navigation className="h-5 w-5 text-orange-500" />
            <span>Bus {busNumber}</span>
          </div>
          <Badge variant="outline">{routeName}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-4">
            <div className="inline-block h-6 w-6 animate-spin rounded-full border-4 border-solid border-orange-500 border-r-transparent"></div>
            <p className="mt-2 text-sm text-gray-500">Loading vehicle location...</p>
          </div>
        ) : error ? (
          <div className="text-center py-4">
            <p className="text-sm text-red-500">{error}</p>
          </div>
        ) : location ? (
          <div className="space-y-4">
            <div className="h-40 bg-gray-100 rounded-md flex items-center justify-center">
              <p className="text-gray-500">Map would display here</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="border rounded-lg p-3">
                <div className="text-xs text-gray-500 mb-1">Current Speed</div>
                <div className="font-medium">{location.speed} km/h</div>
              </div>

              <div className="border rounded-lg p-3">
                <div className="text-xs text-gray-500 mb-1">Last Updated</div>
                <div className="font-medium">{formatTimestamp(location.timestamp)}</div>
              </div>
            </div>

            <div className="border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="h-4 w-4 text-orange-500" />
                <h3 className="font-medium">Next Stop: {location.next_stop_name}</h3>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-600">Arriving in {location.estimated_arrival} minutes</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-sm text-gray-500">No location data available for this vehicle</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
