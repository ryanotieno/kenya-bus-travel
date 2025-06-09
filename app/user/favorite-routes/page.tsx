"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { SidebarWrapper } from "@/components/sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Heart, MapPin, Clock, AlertTriangle } from "lucide-react"

interface FavoriteRoute {
  id: number
  route_id: number
  origin_name: string
  destination_name: string
  distance: number
  duration: number
  fare: number
}

export default function FavoriteRoutes() {
  const [favorites, setFavorites] = useState<FavoriteRoute[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchFavorites() {
      try {
        setLoading(true)
        const res = await fetch("/api/favorite-routes")
        const data = await res.json()
        setFavorites(data.favorites || [])
      } catch (error) {
        console.error("Error fetching favorites:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchFavorites()
  }, [])

  const removeFromFavorites = async (id: number) => {
    try {
      const res = await fetch("/api/favorite-routes", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ favoriteId: id }),
      })

      if (res.ok) {
        setFavorites(favorites.filter((route) => route.id !== id))
      }
    } catch (error) {
      console.error("Error removing favorite:", error)
    }
  }

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <SidebarWrapper userType="user" userName="John Passenger" userEmail="passenger@example.com" />

      <div className="flex-1 flex flex-col">
        <Header userName="John Passenger" notificationCount={3} />

        <main className="flex-1 p-6">
          <div className="max-w-5xl mx-auto space-y-6">
            <div>
              <h1 className="text-2xl font-bold">Favorite Routes</h1>
              <p className="text-muted-foreground">Quick access to your most frequently used bus routes</p>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-orange-500 border-r-transparent"></div>
                <p className="mt-4 text-gray-500">Loading your favorite routes...</p>
              </div>
            ) : favorites.length > 0 ? (
              <div className="grid gap-4">
                {favorites.map((route) => (
                  <Card key={route.id} className="hover:border-orange-500 transition-colors">
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <Heart className="h-5 w-5 text-red-500 fill-red-500" />
                            <h3 className="font-medium text-lg">
                              {route.origin_name} - {route.destination_name}
                            </h3>
                          </div>
                          <p className="text-sm text-gray-500">
                            {route.distance} km • {Math.floor(route.duration / 60)} hrs {route.duration % 60} mins
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <Clock className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-600">Next departure: 11:30 AM Today</span>
                          </div>
                        </div>

                        <div className="flex flex-col md:flex-row gap-3">
                          <Button variant="outline" className="flex-1">
                            <MapPin className="mr-2 h-4 w-4" />
                            View Route
                          </Button>
                          <Button className="flex-1">Book Ticket</Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-gray-500 hover:text-red-500"
                            onClick={() => removeFromFavorites(route.id)}
                          >
                            <Heart className="h-5 w-5 fill-red-500" />
                            <span className="sr-only">Remove from favorites</span>
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle className="text-center">No Favorite Routes</CardTitle>
                </CardHeader>
                <CardContent className="text-center py-6">
                  <AlertTriangle className="h-12 w-12 mx-auto text-orange-500 mb-4" />
                  <p className="text-gray-500 mb-6">You haven't added any routes to your favorites yet.</p>
                  <Button>Browse Routes</Button>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Suggested Routes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  {[
                    {
                      id: 4,
                      route: "Nairobi - Eldoret",
                      stations: "Nairobi Central Station → Eldoret Terminal",
                      frequency: "Daily",
                      nextDeparture: "2:30 PM Today",
                    },
                    {
                      id: 5,
                      route: "Mombasa - Malindi",
                      stations: "Mombasa Terminal → Malindi Bus Stop",
                      frequency: "Weekends",
                      nextDeparture: "9:15 AM Tomorrow",
                    },
                  ].map((route) => (
                    <div key={route.id} className="border rounded-lg p-4 hover:border-orange-500 transition-colors">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium">{route.route}</h3>
                          <p className="text-sm text-gray-500">{route.stations}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <Clock className="h-4 w-4 text-gray-400" />
                            <span className="text-xs text-gray-600">{route.nextDeparture}</span>
                          </div>
                        </div>
                        <Button variant="ghost" size="icon" className="text-gray-400 hover:text-red-500">
                          <Heart className="h-5 w-5" />
                          <span className="sr-only">Add to favorites</span>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}
