"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { SidebarWrapper } from "@/components/sidebar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MapPin } from "lucide-react"
import { useRouter } from "next/navigation"

interface Station {
  id: number
  name: string
  location: string
  latitude: number
  longitude: number
}

interface Route {
  id: number
  origin_name: string
  destination_name: string
  distance: number
  duration: number
  fare: number
}

export default function UserDashboard() {
  const [session, setSession] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [stations, setStations] = useState<Station[]>([])
  const [routes, setRoutes] = useState<Route[]>([])
  const [searchRadius, setSearchRadius] = useState("10")
  const router = useRouter()
  const [destination, setDestination] = useState("")
  const [matchingSaccos, setMatchingSaccos] = useState<{saccoName: string, route: string}[]>([])
  const [searching, setSearching] = useState(false)
  const [selectedSacco, setSelectedSacco] = useState<{saccoName: string, route: string} | null>(null)
  const [selectedVehicles, setSelectedVehicles] = useState<{name: string, regNumber: string, capacity: number}[]>([])

  useEffect(() => {
    async function fetchSessionAndData() {
      try {
        setLoading(true)

        // Get current user session
        const sessionResponse = await fetch('/api/auth/session')
        if (!sessionResponse.ok) {
          console.error('Not logged in')
          setSession(null)
          setLoading(false)
          return
        }
        const sessionData = await sessionResponse.json()
        // Handle both old and new session formats
        const user = sessionData.user || sessionData
        setSession(user)

        // Fetch stations
        const stationsRes = await fetch("/api/stations")
        const stationsData = await stationsRes.json()

        // Fetch routes
        const routesRes = await fetch("/api/routes")
        const routesData = await routesRes.json()

        setStations(stationsData.stations || [])
        setRoutes(routesData.routes || [])
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchSessionAndData()
  }, [])

  const handleRefresh = () => {
    setLoading(true)
    // Simulate loading
    setTimeout(() => {
      setLoading(false)
    }, 1500)
  }

  // Get the nearest station (in a real app, this would use geolocation)
  const nearestStation = stations.length > 0 ? stations[0] : null

  // Get popular destinations based on routes
  const popularDestinations = routes.filter((route) => route.origin_name === "Nairobi Central Station").slice(0, 6)

  const handleDestinationSearch = async () => {
    if (!destination.trim()) {
      setMatchingSaccos([])
      return
    }
    setSearching(true)
    const res = await fetch("/api/companies")
    const companies = await res.json()
    const matches: {saccoName: string, route: string}[] = []
    for (const company of companies) {
      for (const sacco of company.saccos) {
        // New model: single route
        if (typeof sacco.route === 'string' && sacco.route.toLowerCase().includes(destination.trim().toLowerCase())) {
          matches.push({ saccoName: sacco.saccoName, route: sacco.route })
        }
        // Old model: multiple routes
        if (Array.isArray(sacco.routes)) {
          for (const r of sacco.routes) {
            if (r.toLowerCase().includes(destination.trim().toLowerCase())) {
              matches.push({ saccoName: sacco.saccoName, route: r })
            }
          }
        }
      }
    }
    setMatchingSaccos(matches)
    setSearching(false)
  }

  const handleSaccoClick = async (saccoName: string, route: string) => {
    setSelectedSacco({ saccoName, route })
    // Fetch companies and find vehicles for this sacco/route
    const res = await fetch("/api/companies")
    const companies = await res.json()
    let vehicles: {name: string, regNumber: string, capacity: number}[] = []
    for (const company of companies) {
      for (const sacco of company.saccos) {
        // New model
        if (sacco.saccoName === saccoName && sacco.route === route) {
          vehicles = sacco.vehicles || []
        }
        // Old model
        if (sacco.saccoName === saccoName && Array.isArray(sacco.routes) && sacco.routes.includes(route)) {
          vehicles = sacco.vehicles || []
        }
      }
    }
    setSelectedVehicles(vehicles)
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-red-600 mb-2">Not Logged In</h2>
          <p className="text-gray-600">Please log in to access the user dashboard.</p>
          <Button onClick={() => router.push('/login')} className="mt-4">
            Go to Login
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <SidebarWrapper userType="user" userName={session.name} userEmail={session.email} />

      <div className="flex-1 flex flex-col">
        <Header userName={session.name} notificationCount={3} />

        <main className="flex-1 p-6">
          <div className="max-w-5xl mx-auto space-y-6">
            {/* Destination Search Section */}
            <Card className="border-orange-200 bg-gradient-to-r from-orange-50 to-white">
              <CardContent className="p-6">
                <div className="text-center mb-6">
                  <h1 className="text-2xl md:text-3xl font-bold mb-2">Where would you like to go today?</h1>
                  <p className="text-gray-500">Find the best routes and buses to your destination</p>
                </div>

                <div className="flex flex-col md:flex-row gap-3 max-w-2xl mx-auto">
                  <div className="flex-1">
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Enter your destination"
                        className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        value={destination}
                        onChange={e => setDestination(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleDestinationSearch(); } }}
                      />
                    </div>
                  </div>
                  <Button className="whitespace-nowrap" onClick={handleDestinationSearch} disabled={searching}>
                    {searching ? "Searching..." : "Find Routes"}
                  </Button>
                </div>
                {/* Matching Saccos Results */}
                {destination && (
                  <div className="mt-6 max-w-2xl mx-auto">
                    <h3 className="text-lg font-semibold mb-2">Available Saccos for "{destination}"</h3>
                    {matchingSaccos.length === 0 ? (
                      <div className="text-gray-500">No Saccos found for this destination.</div>
                    ) : (
                      <ul className="space-y-2">
                        {matchingSaccos.map((sacco, idx) => (
                          <li
                            key={idx}
                            className={`border rounded p-3 flex flex-col md:flex-row md:items-center md:justify-between cursor-pointer hover:bg-orange-50 ${selectedSacco && selectedSacco.saccoName === sacco.saccoName && selectedSacco.route === sacco.route ? 'border-orange-500' : ''}`}
                            onClick={() => handleSaccoClick(sacco.saccoName, sacco.route)}
                          >
                            <div>
                              <span className="font-bold text-orange-700">{sacco.saccoName}</span>
                              <span className="ml-2 text-gray-600">({sacco.route})</span>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Vehicles for selected sacco/route */}
            {selectedSacco && (
              <div className="mt-6 max-w-2xl mx-auto">
                <h4 className="text-md font-semibold mb-2">Vehicles for {selectedSacco.saccoName} ({selectedSacco.route})</h4>
                {selectedVehicles.length === 0 ? (
                  <div className="text-gray-500">No vehicles registered for this route.</div>
                ) : (
                  <table className="min-w-full border text-sm">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="border p-2 text-left">Vehicle</th>
                        <th className="border p-2 text-left">Registration</th>
                        <th className="border p-2 text-left">Capacity</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedVehicles.map((vehicle, idx) => (
                        <tr key={idx} className="hover:bg-gray-50">
                          <td className="border p-2">{vehicle.name}</td>
                          <td className="border p-2">{vehicle.regNumber}</td>
                          <td className="border p-2">{vehicle.capacity} seats</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}

            {/* Popular Destinations Section */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Popular Destinations Near You</h2>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">Search radius:</span>
                  <select
                    className="text-sm border rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    value={searchRadius}
                    onChange={(e) => setSearchRadius(e.target.value)}
                  >
                    <option value="5">5 km</option>
                    <option value="10">10 km</option>
                    <option value="20">20 km</option>
                    <option value="50">50 km</option>
                  </select>
                </div>
              </div>

              {loading ? (
                <div className="text-center py-12">
                  <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-orange-500 border-r-transparent"></div>
                  <p className="mt-4 text-gray-500">Loading destinations...</p>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {popularDestinations.map((route) => (
                    <Card key={route.id} className="overflow-hidden hover:border-orange-500 transition-colors">
                      <div className="h-20 bg-gray-100 relative">
                        <img
                          src={`/placeholder.svg?height=80&width=120&text=${route.destination_name}`}
                          alt={route.destination_name}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                        <h3 className="absolute bottom-2 left-3 text-white font-medium">{route.destination_name}</h3>
                      </div>
                      <CardContent className="p-3">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm text-gray-500">{route.distance} km</span>
                          <span className="font-medium">KSh {route.fare}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-500">Next bus: 11:30 AM</span>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 text-xs"
                            onClick={() => router.push(`/user/routes/${route.id}`)}
                          >
                            View Route
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              <div className="mt-4 text-center">
                <Button variant="outline">Show More Destinations</Button>
              </div>
            </div>

            {/* Nearest Bus Stop Section */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Nearest Bus Stations</h2>
              {nearestStation && (
                <Card className="border-orange-200 mb-6">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-orange-500" />
                      Nearest Bus Stop
                    </CardTitle>
                    <CardDescription>Based on your current location</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col md:flex-row justify-between gap-4">
                      <div>
                        <h3 className="text-xl font-semibold">{nearestStation.name}</h3>
                        <p className="text-sm text-gray-500">{nearestStation.location}</p>
                        <div className="mt-2 flex items-center gap-2">
                          <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-50">
                            1.2 km away
                          </Badge>
                          <span className="text-sm text-gray-500">• 15 min walk</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <MapPin className="mr-2 h-4 w-4" />
                          Get Directions
                        </Button>
                        <Button size="sm">View Schedule</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {stations.slice(1, 4).map((station) => (
                  <div key={station.id} className="border rounded-lg p-4 hover:border-orange-500 transition-colors">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium">{station.name}</h3>
                        <p className="text-sm text-gray-500">{station.location}</p>
                      </div>
                      <div className="bg-orange-100 text-orange-800 text-xs font-medium px-2 py-1 rounded">
                        {Math.floor(Math.random() * 10) + 2} buses
                      </div>
                    </div>
                    <div className="mt-4">
                      <Button variant="outline" size="sm" className="w-full">
                        View Details
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
