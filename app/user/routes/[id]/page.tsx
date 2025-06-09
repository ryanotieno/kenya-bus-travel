"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Header } from "@/components/header"
import { SidebarWrapper } from "@/components/sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Clock, Bus, Calendar, Heart } from "lucide-react"

interface RouteStop {
  id: number
  route_id: number
  stop_order: number
  distance_from_start: number
  estimated_time: number
  station_id: number
  station_name: string
  location: string
  latitude: number
  longitude: number
}

interface Vehicle {
  id: number
  bus_number: string
  model: string
  capacity: number
  route_id: number
  origin_name: string
  destination_name: string
  driver_name: string
}

interface RouteSchedule {
  id: number
  route_id: number
  departure_time: string
  days_of_week: string
  is_active: boolean
}

interface RouteDetails {
  id: number
  origin_name: string
  destination_name: string
  distance: number
  duration: number
  fare: number
}

export default function RouteDetailsPage() {
  const params = useParams()
  const routeId = params.id as string

  const [loading, setLoading] = useState(true)
  const [routeDetails, setRouteDetails] = useState<RouteDetails | null>(null)
  const [routeStops, setRouteStops] = useState<RouteStop[]>([])
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [schedules, setSchedules] = useState<RouteSchedule[]>([])
  const [isFavorite, setIsFavorite] = useState(false)

  useEffect(() => {
    async function fetchRouteData() {
      try {
        setLoading(true)

        // Fetch route details
        const routeRes = await fetch(`/api/routes?id=${routeId}`)
        const routeData = await routeRes.json()

        if (routeData.routes && routeData.routes.length > 0) {
          setRouteDetails(routeData.routes[0])
        }

        // Fetch route stops
        const stopsRes = await fetch(`/api/route-stops?routeId=${routeId}`)
        const stopsData = await stopsRes.json()
        setRouteStops(stopsData.stops || [])

        // Fetch vehicles on this route
        const vehiclesRes = await fetch(`/api/vehicles?routeId=${routeId}`)
        const vehiclesData = await vehiclesRes.json()
        setVehicles(vehiclesData.vehicles || [])

        // Fetch route schedules
        const schedulesRes = await fetch(`/api/route-schedules?routeId=${routeId}`)
        const schedulesData = await schedulesRes.json()
        setSchedules(schedulesData.schedules || [])

        // Check if route is in favorites
        const favoritesRes = await fetch(`/api/favorite-routes`)
        const favoritesData = await favoritesRes.json()
        const favorites = favoritesData.favorites || []
        setIsFavorite(favorites.some((fav: any) => fav.route_id === Number.parseInt(routeId)))
      } catch (error) {
        console.error("Error fetching route data:", error)
      } finally {
        setLoading(false)
      }
    }

    if (routeId) {
      fetchRouteData()
    }
  }, [routeId])

  const toggleFavorite = async () => {
    try {
      if (isFavorite) {
        // Find the favorite ID
        const favoritesRes = await fetch(`/api/favorite-routes`)
        const favoritesData = await favoritesRes.json()
        const favorites = favoritesData.favorites || []
        const favorite = favorites.find((fav: any) => fav.route_id === Number.parseInt(routeId))

        if (favorite) {
          const res = await fetch("/api/favorite-routes", {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ favoriteId: favorite.id }),
          })

          if (res.ok) {
            setIsFavorite(false)
          }
        }
      } else {
        const res = await fetch("/api/favorite-routes", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ routeId: Number.parseInt(routeId) }),
        })

        if (res.ok) {
          setIsFavorite(true)
        }
      }
    } catch (error) {
      console.error("Error toggling favorite:", error)
    }
  }

  const formatDaysOfWeek = (daysString: string) => {
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    return daysString
      .split("")
      .map((day, index) => (day === "1" ? days[index] : null))
      .filter(Boolean)
      .join(", ")
  }

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col md:flex-row">
        <SidebarWrapper userType="user" userName="John Passenger" userEmail="passenger@example.com" />
        <div className="flex-1 flex flex-col">
          <Header userName="John Passenger" notificationCount={3} />
          <main className="flex-1 p-6">
            <div className="max-w-5xl mx-auto">
              <div className="text-center py-12">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-orange-500 border-r-transparent"></div>
                <p className="mt-4 text-gray-500">Loading route details...</p>
              </div>
            </div>
          </main>
        </div>
      </div>
    )
  }

  if (!routeDetails) {
    return (
      <div className="flex min-h-screen flex-col md:flex-row">
        <SidebarWrapper userType="user" userName="John Passenger" userEmail="passenger@example.com" />
        <div className="flex-1 flex flex-col">
          <Header userName="John Passenger" notificationCount={3} />
          <main className="flex-1 p-6">
            <div className="max-w-5xl mx-auto">
              <div className="text-center py-12">
                <p className="text-gray-500">Route not found</p>
                <Button className="mt-4" onClick={() => window.history.back()}>
                  Go Back
                </Button>
              </div>
            </div>
          </main>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <SidebarWrapper userType="user" userName="John Passenger" userEmail="passenger@example.com" />

      <div className="flex-1 flex flex-col">
        <Header userName="John Passenger" notificationCount={3} />

        <main className="flex-1 p-6">
          <div className="max-w-5xl mx-auto space-y-6">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-bold">
                  {routeDetails.origin_name} - {routeDetails.destination_name}
                </h1>
                <p className="text-muted-foreground">
                  {routeDetails.distance} km • {Math.floor(routeDetails.duration / 60)} hrs {routeDetails.duration % 60}{" "}
                  mins
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={toggleFavorite}>
                  <Heart className={`mr-2 h-4 w-4 ${isFavorite ? "fill-red-500 text-red-500" : ""}`} />
                  {isFavorite ? "Remove from Favorites" : "Add to Favorites"}
                </Button>
                <Button>Book Ticket</Button>
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Route Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-3">
                  <div className="border rounded-lg p-4">
                    <div className="text-sm text-gray-500 mb-1">Fare</div>
                    <div className="text-2xl font-bold">KSh {routeDetails.fare}</div>
                  </div>

                  <div className="border rounded-lg p-4">
                    <div className="text-sm text-gray-500 mb-1">Distance</div>
                    <div className="text-2xl font-bold">{routeDetails.distance} km</div>
                  </div>

                  <div className="border rounded-lg p-4">
                    <div className="text-sm text-gray-500 mb-1">Travel Time</div>
                    <div className="text-2xl font-bold">
                      {Math.floor(routeDetails.duration / 60)} hrs {routeDetails.duration % 60} mins
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Tabs defaultValue="stops">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="stops">Stops</TabsTrigger>
                <TabsTrigger value="vehicles">Vehicles</TabsTrigger>
                <TabsTrigger value="schedule">Schedule</TabsTrigger>
              </TabsList>

              <TabsContent value="stops" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Route Stops</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-1">
                      {routeStops.length > 0 ? (
                        routeStops.map((stop, index) => (
                          <div key={stop.id} className="relative pl-8 pb-8">
                            {/* Vertical line connecting stops */}
                            {index < routeStops.length - 1 && (
                              <div className="absolute left-4 top-4 bottom-0 w-0.5 bg-gray-200"></div>
                            )}

                            {/* Stop marker */}
                            <div className="absolute left-0 top-0 flex items-center justify-center w-8 h-8">
                              <div
                                className={`w-4 h-4 rounded-full ${index === 0 ? "bg-green-500" : index === routeStops.length - 1 ? "bg-red-500" : "bg-orange-500"}`}
                              ></div>
                            </div>

                            <div className="border rounded-lg p-4">
                              <div className="flex justify-between items-start">
                                <div>
                                  <h3 className="font-medium">{stop.station_name}</h3>
                                  <p className="text-sm text-gray-500">{stop.location}</p>
                                </div>
                                <div className="flex flex-col items-end">
                                  <Badge variant="outline" className="mb-1">
                                    Stop {stop.stop_order + 1}
                                  </Badge>
                                  <span className="text-sm text-gray-500">
                                    {Math.floor(stop.estimated_time / 60)} hrs {stop.estimated_time % 60} mins from
                                    start
                                  </span>
                                </div>
                              </div>
                              <div className="mt-2 text-sm text-gray-500">
                                {stop.distance_from_start} km from origin
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-6">
                          <p className="text-gray-500">No stops information available for this route</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="vehicles" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Vehicles on this Route</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {vehicles.length > 0 ? (
                      <div className="space-y-4">
                        {vehicles.map((vehicle) => (
                          <div
                            key={vehicle.id}
                            className="border rounded-lg p-4 hover:border-orange-500 transition-colors"
                          >
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                              <div>
                                <div className="flex items-center gap-2">
                                  <Bus className="h-5 w-5 text-orange-500" />
                                  <h3 className="font-medium">{vehicle.bus_number}</h3>
                                </div>
                                <p className="text-sm text-gray-500 mt-1">
                                  {vehicle.model} • Capacity: {vehicle.capacity} passengers
                                </p>
                                <p className="text-sm text-gray-500 mt-1">Driver: {vehicle.driver_name}</p>
                              </div>
                              <Button variant="outline" size="sm">
                                Track Vehicle
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6">
                        <p className="text-gray-500">No vehicles currently assigned to this route</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="schedule" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Route Schedule</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {schedules.length > 0 ? (
                      <div className="space-y-4">
                        {schedules.map((schedule) => (
                          <div key={schedule.id} className="border rounded-lg p-4">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                              <div>
                                <div className="flex items-center gap-2">
                                  <Clock className="h-5 w-5 text-orange-500" />
                                  <h3 className="font-medium">Departs at {schedule.departure_time}</h3>
                                </div>
                                <div className="flex items-center gap-2 mt-1">
                                  <Calendar className="h-4 w-4 text-gray-400" />
                                  <span className="text-sm text-gray-600">
                                    {formatDaysOfWeek(schedule.days_of_week)}
                                  </span>
                                </div>
                              </div>
                              <Badge variant={schedule.is_active ? "default" : "secondary"}>
                                {schedule.is_active ? "Active" : "Inactive"}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6">
                        <p className="text-gray-500">No schedule information available for this route</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  )
}
