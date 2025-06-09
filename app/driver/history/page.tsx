"use client"

import { Header } from "@/components/header"
import { SidebarWrapper } from "@/components/sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, Download, Eye } from "lucide-react"

export default function TripHistory() {
  return (
    <div className="min-h-screen flex">
      <SidebarWrapper userType="driver" userName="David Driver" userEmail="driver@example.com" />

      <div className="flex-1 flex flex-col">
        <Header userName="David Driver" notificationCount={2} />

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
                  {[
                    {
                      id: "KBZ-123-456",
                      route: "Nairobi - Mombasa",
                      date: "Apr 8, 2025",
                      status: "In Progress",
                      passengers: 32,
                      revenue: "KSh 64,000",
                    },
                    {
                      id: "KBZ-789-012",
                      route: "Mombasa - Nairobi",
                      date: "Apr 6, 2025",
                      status: "Completed",
                      passengers: 45,
                      revenue: "KSh 90,000",
                    },
                    {
                      id: "KBZ-345-678",
                      route: "Nairobi - Kisumu",
                      date: "Apr 3, 2025",
                      status: "Completed",
                      passengers: 38,
                      revenue: "KSh 76,000",
                    },
                    {
                      id: "KBZ-901-234",
                      route: "Kisumu - Nairobi",
                      date: "Apr 1, 2025",
                      status: "Completed",
                      passengers: 42,
                      revenue: "KSh 84,000",
                    },
                  ].map((trip) => (
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
                  ))}
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
                    <div className="text-3xl font-bold">12</div>
                  </div>

                  <div className="border rounded-lg p-4">
                    <div className="text-sm text-gray-500 mb-1">Total Passengers</div>
                    <div className="text-3xl font-bold">486</div>
                  </div>

                  <div className="border rounded-lg p-4">
                    <div className="text-sm text-gray-500 mb-1">Total Revenue</div>
                    <div className="text-3xl font-bold">KSh 972,000</div>
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
