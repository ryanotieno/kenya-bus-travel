"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { SidebarWrapper } from "@/components/sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calculator } from "lucide-react"

export default function CalculateTrip() {
  const [origin, setOrigin] = useState("nairobi")
  const [destination, setDestination] = useState("")
  const [distance, setDistance] = useState("")
  const [passengers, setPassengers] = useState("")
  const [calculatedFare, setCalculatedFare] = useState<number | null>(null)
  const [totalRevenue, setTotalRevenue] = useState<number | null>(null)

  const handleCalculate = () => {
    // Simple calculation logic for demo purposes
    const distanceNum = Number.parseFloat(distance)
    const passengersNum = Number.parseInt(passengers)

    if (distanceNum && passengersNum) {
      // Base fare calculation (example: 2 KSh per km)
      const baseFare = distanceNum * 2

      // Add a fixed fee
      const fare = baseFare + 200

      setCalculatedFare(fare)
      setTotalRevenue(fare * passengersNum)
    }
  }

  return (
    <div className="min-h-screen flex">
      <SidebarWrapper userType="driver" userName="David Driver" userEmail="driver@example.com" />

      <div className="flex-1 flex flex-col">
        <Header userName="David Driver" notificationCount={2} />

        <main className="flex-1 p-6">
          <div className="max-w-3xl mx-auto space-y-6">
            <div>
              <h1 className="text-2xl font-bold">Calculate Trip Cost</h1>
              <p className="text-muted-foreground">Calculate fare and revenue for a trip</p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Trip Details</CardTitle>
                <CardDescription>Enter the trip details to calculate the fare</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="origin">Origin</Label>
                      <Select value={origin} onValueChange={setOrigin}>
                        <SelectTrigger id="origin">
                          <SelectValue placeholder="Select origin" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="nairobi">Nairobi</SelectItem>
                          <SelectItem value="mombasa">Mombasa</SelectItem>
                          <SelectItem value="kisumu">Kisumu</SelectItem>
                          <SelectItem value="nakuru">Nakuru</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="destination">Destination</Label>
                      <Select value={destination} onValueChange={setDestination}>
                        <SelectTrigger id="destination">
                          <SelectValue placeholder="Select destination" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="nairobi">Nairobi</SelectItem>
                          <SelectItem value="mombasa">Mombasa</SelectItem>
                          <SelectItem value="kisumu">Kisumu</SelectItem>
                          <SelectItem value="nakuru">Nakuru</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="distance">Distance (km)</Label>
                      <Input
                        id="distance"
                        type="number"
                        placeholder="Enter distance"
                        value={distance}
                        onChange={(e) => setDistance(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="passengers">Number of Passengers</Label>
                      <Input
                        id="passengers"
                        type="number"
                        placeholder="Enter passenger count"
                        value={passengers}
                        onChange={(e) => setPassengers(e.target.value)}
                      />
                    </div>
                  </div>

                  <Button onClick={handleCalculate} className="w-full md:w-auto">
                    <Calculator className="mr-2 h-4 w-4" />
                    Calculate Fare
                  </Button>
                </div>
              </CardContent>
            </Card>

            {calculatedFare !== null && (
              <Card>
                <CardHeader>
                  <CardTitle>Calculation Results</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="border rounded-lg p-4">
                      <div className="text-sm text-gray-500 mb-1">Fare per Passenger</div>
                      <div className="text-3xl font-bold">KSh {calculatedFare.toLocaleString()}</div>
                    </div>

                    <div className="border rounded-lg p-4">
                      <div className="text-sm text-gray-500 mb-1">Total Revenue</div>
                      <div className="text-3xl font-bold">KSh {totalRevenue?.toLocaleString()}</div>
                    </div>
                  </div>

                  <div className="mt-6 border-t pt-6">
                    <h3 className="font-medium mb-4">Fare Breakdown</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Base fare (KSh 2/km)</span>
                        <span>KSh {(Number.parseFloat(distance) * 2).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Fixed fee</span>
                        <span>KSh 200</span>
                      </div>
                      <div className="flex justify-between font-medium pt-2 border-t">
                        <span>Total fare per passenger</span>
                        <span>KSh {calculatedFare.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
