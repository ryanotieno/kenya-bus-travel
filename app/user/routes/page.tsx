"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { SidebarWrapper } from "@/components/sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { MapPin, Search, ArrowRight } from "lucide-react"

interface Route {
  id: number
  origin_name: string
  destination_name: string
  distance: number
  duration: number
  fare: number
}

export default function RoutesPage() {
  const router = useRouter()
  const [routes, setRoutes] = useState<Route[]>([])
  const [filteredRoutes, setFilteredRoutes] = useState<Route[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    async function fetchRoutes() {
      try {
        setLoading(true)
        const res = await fetch("/api/routes")
        const data = await res.json()
        setRoutes(data.routes || [])
        setFilteredRoutes(data.routes || [])
      } catch (error) {
        console.error("Error fetching routes:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchRoutes()
  }, [])

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredRoutes(routes)
    } else {
      const term = searchTerm.toLowerCase()
      setFilteredRoutes(
        routes.filter(
          (route) =>
            route.origin_name.toLowerCase().includes(term) || route.destination_name.toLowerCase().includes(term),
        ),
      )
    }
  }, [searchTerm, routes])

  const handleViewRoute = (routeId: number) => {
    router.push(`/user/routes/${routeId}`)
  }

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <SidebarWrapper userType="user" userName="John Passenger" userEmail="passenger@example.com" />

      <div className="flex-1 flex flex-col">
        <Header userName="John Passenger" notificationCount={3} />

        <main className="flex-1 p-6">
          <div className="max-w-5xl mx-auto space-y-6">
            <div>
              <h1 className="text-2xl font-bold">All Routes</h1>
              <p className="text-muted-foreground">Browse all available bus routes</p>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search routes by origin or destination"
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-orange-500 border-r-transparent"></div>
                <p className="mt-4 text-gray-500">Loading routes...</p>
              </div>
            ) : filteredRoutes.length > 0 ? (
              <div className="grid gap-4">
                {filteredRoutes.map((route) => (
                  <Card key={route.id} className="hover:border-orange-500 transition-colors">
                    <CardContent className="p-4">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <MapPin className="h-5 w-5 text-orange-500" />
                            <h3 className="font-medium">
                              {route.origin_name} <ArrowRight className="inline h-4 w-4 mx-1" />{" "}
                              {route.destination_name}
                            </h3>
                          </div>
                          <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                            <span>{route.distance} km</span>
                            <span>•</span>
                            <span>
                              {Math.floor(route.duration / 60)} hrs {route.duration % 60} mins
                            </span>
                            <span>•</span>
                            <span>KSh {route.fare}</span>
                          </div>
                        </div>
                        <Button onClick={() => handleViewRoute(route.id)}>View Details</Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500">No routes found matching your search</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
