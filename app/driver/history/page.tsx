"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { SidebarWrapper } from "@/components/sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, Download, Eye } from "lucide-react"

interface TripRecord {
  id: string
  route: string
  date: string
  status: string
  passengers: number
  revenue: string
}

export default function TripHistory() {
  const [session, setSession] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [tripRecords, setTripRecords] = useState<TripRecord[]>([])
  const [monthlyStats, setMonthlyStats] = useState({
    totalTrips: 0,
    totalPassengers: 0,
    totalRevenue: 0
  })

  useEffect(() => {
    const fetchSessionAndData = async () => {
      try {
        // Get current user session
        const sessionResponse = await fetch('/api/auth/session')
        if (!sessionResponse.ok) {
          console.error('Not logged in')
          return
        }
        const sessionData = await sessionResponse.json()
        // Handle both old and new session formats
        const user = sessionData.user || sessionData
        setSession(user)

        // For now, we'll use sample data based on the driver's sacco
        // In a real app, this would come from a trip history API
        const driversResponse = await fetch('/api/drivers')
        const drivers = await driversResponse.json()
        const currentDriver = drivers.find((d: any) => d.email === user.email)
        
        if (currentDriver) {
          // Generate sample trip records based on the driver's sacco
          const sampleTrips: TripRecord[] = [
            {
              id: `TRIP-${Date.now()}-001`,
              route: `${currentDriver.sacco} Route`,
              date: new Date().toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric', 
                year: 'numeric' 
              }),
              status: "Completed",
              passengers: Math.floor(Math.random() * 20) + 10,
              revenue: `KSh ${(Math.floor(Math.random() * 50000) + 20000).toLocaleString()}`,
            },
            {
              id: `TRIP-${Date.now()}-002`,
              route: `${currentDriver.sacco} Route`,
              date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric', 
                year: 'numeric' 
              }),
              status: "Completed",
              passengers: Math.floor(Math.random() * 20) + 10,
              revenue: `KSh ${(Math.floor(Math.random() * 50000) + 20000).toLocaleString()}`,
            },
            {
              id: `TRIP-${Date.now()}-003`,
              route: `${currentDriver.sacco} Route`,
              date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric', 
                year: 'numeric' 
              }),
              status: "Completed",
              passengers: Math.floor(Math.random() * 20) + 10,
              revenue: `KSh ${(Math.floor(Math.random() * 50000) + 20000).toLocaleString()}`,
            },
            {
              id: `TRIP-${Date.now()}-004`,
              route: `${currentDriver.sacco} Route`,
              date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric', 
                year: 'numeric' 
              }),
              status: "Completed",
              passengers: Math.floor(Math.random() * 20) + 10,
              revenue: `KSh ${(Math.floor(Math.random() * 50000) + 20000).toLocaleString()}`,
            },
          ]
          
          setTripRecords(sampleTrips)
          
          // Calculate monthly stats
          const totalTrips = sampleTrips.length
          const totalPassengers = sampleTrips.reduce((sum, trip) => sum + trip.passengers, 0)
          const totalRevenue = sampleTrips.reduce((sum, trip) => {
            const revenue = parseInt(trip.revenue.replace(/[^0-9]/g, ''))
            return sum + revenue
          }, 0)
          
          setMonthlyStats({
            totalTrips,
            totalPassengers,
            totalRevenue
          })
        }
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchSessionAndData()
  }, [])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading trip history...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-red-600 mb-2">Not Logged In</h2>
          <p className="text-gray-600">Please log in to view your trip history.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex">
      <SidebarWrapper userType="driver" userName={session.name} userEmail={session.email} />

      <div className="flex-1 flex flex-col">
        <Header userName={session.name} notificationCount={2} />

        <main className="flex-1 p-6">
          <div className="max-w-5xl mx-auto space-y-6">
            <div>
              <h1 className="text-2xl font-bold">Trip History</h1>
              <p className="text-muted-foreground">View your past and upcoming trips</p>
            </div>

            <div className="flex flex-col md:flex-row gap-4 justify-between">
              <div className="w-full md:w-1/3">
                <Select defaultValue="april">
                  <SelectTrigger>
                    <SelectValue placeholder="Select month" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="april">April 2025</SelectItem>
                    <SelectItem value="march">March 2025</SelectItem>
                    <SelectItem value="february">February 2025</SelectItem>
                    <SelectItem value="january">January 2025</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Tabs defaultValue="all" className="w-full md:w-auto">
                <TabsList>
                  <TabsTrigger value="all">All Trips</TabsTrigger>
                  <TabsTrigger value="completed">Completed</TabsTrigger>
                  <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Trip Records</CardTitle>
                <CardDescription>View and manage your trip records</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {tripRecords.length > 0 ? (
                    tripRecords.map((trip) => (
                      <div key={trip.id} className="border rounded-lg p-4 hover:border-orange-500 transition-colors">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-medium">{trip.route}</h3>
                              <div
                                className={`text-xs px-2 py-0.5 rounded ${
                                  trip.status === "Completed"
                                    ? "bg-green-100 text-green-800"
                                    : "bg-blue-100 text-blue-800"
                                }`}
                              >
                                {trip.status}
                              </div>
                            </div>
                            <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                              <Calendar className="h-4 w-4" />
                              <span>{trip.date}</span>
                            </div>
                          </div>

                          <div className="flex flex-col md:flex-row gap-4 md:items-center">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <div className="text-xs text-gray-500">Trip ID</div>
                                <div className="font-medium">{trip.id}</div>
                              </div>
                              <div>
                                <div className="text-xs text-gray-500">Passengers</div>
                                <div className="font-medium">{trip.passengers}</div>
                              </div>
                              <div className="col-span-2">
                                <div className="text-xs text-gray-500">Revenue</div>
                                <div className="font-medium">{trip.revenue}</div>
                              </div>
                            </div>

                            <div className="flex gap-2">
                              <Button variant="outline" size="sm">
                                <Eye className="h-4 w-4 mr-1" />
                                Details
                              </Button>
                              <Button variant="outline" size="sm">
                                <Download className="h-4 w-4 mr-1" />
                                Report
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      No trip records found for this month.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Monthly Summary</CardTitle>
                <CardDescription>April 2025</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-3">
                  <div className="border rounded-lg p-4">
                    <div className="text-sm text-gray-500 mb-1">Total Trips</div>
                    <div className="text-3xl font-bold">{monthlyStats.totalTrips}</div>
                  </div>

                  <div className="border rounded-lg p-4">
                    <div className="text-sm text-gray-500 mb-1">Total Passengers</div>
                    <div className="text-3xl font-bold">{monthlyStats.totalPassengers}</div>
                  </div>

                  <div className="border rounded-lg p-4">
                    <div className="text-sm text-gray-500 mb-1">Total Revenue</div>
                    <div className="text-3xl font-bold">KSh {monthlyStats.totalRevenue.toLocaleString()}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}
