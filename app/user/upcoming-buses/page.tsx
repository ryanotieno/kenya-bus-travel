"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { SidebarWrapper } from "@/components/sidebar"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MapPin } from "lucide-react"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function UpcomingBuses() {
  const [selectedStation, setSelectedStation] = useState<string>("")
  const [showDropdown, setShowDropdown] = useState(false)

  const handleStationSelect = (value: string) => {
    setSelectedStation(value)
    setShowDropdown(false)
  }

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <SidebarWrapper userType="user" userName="John Passenger" userEmail="passenger@example.com" />

      <div className="flex-1 flex flex-col">
        <Header userName="John Passenger" notificationCount={3} />

        <main className="flex-1 p-6">
          <div className="max-w-5xl mx-auto space-y-6">
            <div>
              <h1 className="text-2xl font-bold">Upcoming Buses</h1>
              <p className="text-muted-foreground">View schedule and information about upcoming buses</p>
            </div>

            <div className="flex flex-col md:flex-row gap-4 justify-between">
              <div className="relative w-full md:w-1/2">
                <Select onValueChange={handleStationSelect} value={selectedStation}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Bus Station" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="nairobi-central">Nairobi Central Station</SelectItem>
                    <SelectItem value="westlands">Westlands Terminal</SelectItem>
                    <SelectItem value="karen">Karen Bus Terminal</SelectItem>
                  </SelectContent>
                </Select>

                {showDropdown && (
                  <div className="absolute z-10 mt-1 w-full bg-white border rounded-md shadow-lg">
                    <div className="p-2">
                      <div className="font-medium mb-2">Select a station</div>
                      {["Nairobi Central Station", "Westlands Terminal", "Karen Bus Terminal"].map((station) => (
                        <div
                          key={station}
                          className="p-2 hover:bg-gray-100 rounded cursor-pointer"
                          onClick={() => handleStationSelect(station)}
                        >
                          {station}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <Tabs defaultValue="today" className="w-full md:w-auto">
                  <TabsList>
                    <TabsTrigger value="today">Today</TabsTrigger>
                    <TabsTrigger value="tomorrow">Tomorrow</TabsTrigger>
                    <TabsTrigger value="weekend">Weekend</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </div>

            {!selectedStation ? (
              <div className="border rounded-lg p-12 text-center">
                <MapPin className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-xl font-medium mb-2">Select a Station</h3>
                <p className="text-gray-500 mb-6">
                  Choose a bus station from the dropdown above to see upcoming buses.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid gap-4">
                  {[
                    {
                      id: 1,
                      route: "Nairobi - Mombasa",
                      busId: "KBZ 123C",
                      departure: "11:30 AM",
                      arrival: "5:45 PM",
                      price: "KSh 1,200",
                      seatsAvailable: 23,
                    },
                    {
                      id: 2,
                      route: "Nairobi - Kisumu",
                      busId: "KCA 456D",
                      departure: "12:15 PM",
                      arrival: "6:30 PM",
                      price: "KSh 1,000",
                      seatsAvailable: 8,
                    },
                    {
                      id: 3,
                      route: "Nairobi - Nakuru",
                      busId: "KBY 789E",
                      departure: "1:00 PM",
                      arrival: "3:30 PM",
                      price: "KSh 600",
                      seatsAvailable: 15,
                    },
                  ].map((bus) => (
                    <div key={bus.id} className="border rounded-lg p-4 hover:border-orange-500 transition-colors">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                          <h3 className="font-medium text-lg">{bus.route}</h3>
                          <p className="text-sm text-gray-500">Bus ID: {bus.busId}</p>
                        </div>
                        <div className="flex flex-col md:flex-row gap-4 md:items-center">
                          <div className="text-center">
                            <div className="text-sm text-gray-500">Departure</div>
                            <div className="font-medium">{bus.departure}</div>
                          </div>
                          <div className="hidden md:block text-gray-300">→</div>
                          <div className="text-center">
                            <div className="text-sm text-gray-500">Arrival</div>
                            <div className="font-medium">{bus.arrival}</div>
                          </div>
                          <div className="text-center">
                            <div className="text-sm text-gray-500">Price</div>
                            <div className="font-medium">{bus.price}</div>
                          </div>
                          <div>
                            <Button className="w-full md:w-auto">Book Seat</Button>
                          </div>
                        </div>
                      </div>
                      <div className="mt-2 text-sm">
                        <span className="text-green-600 font-medium">{bus.seatsAvailable} seats available</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
