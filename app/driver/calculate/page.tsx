"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { SidebarWrapper } from "@/components/sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { 
  Calculator, 
  MapPin, 
  Users, 
  DollarSign, 
  TrendingUp,
  Route,
  Clock,
  Fuel,
  AlertCircle
} from "lucide-react"
import { useRouter } from "next/navigation"

export default function CalculateTrip() {
  const [session, setSession] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [origin, setOrigin] = useState("")
  const [destination, setDestination] = useState("")
  const [distance, setDistance] = useState("")
  const [passengers, setPassengers] = useState("")
  const [vehicleType, setVehicleType] = useState("")
  const [calculatedFare, setCalculatedFare] = useState<number | null>(null)
  const [totalRevenue, setTotalRevenue] = useState<number | null>(null)
  const [breakdown, setBreakdown] = useState<any>(null)
  const router = useRouter()

  // Fetch session on mount
  useEffect(() => {
    async function fetchSession() {
      setLoading(true)
      try {
        const sessionRes = await fetch("/api/auth/session")
        if (!sessionRes.ok) {
          setSession(null)
          setLoading(false)
          return
        }
        const sessionData = await sessionRes.json()
        // Handle both old and new session formats
        const user = sessionData.user || sessionData
        setSession(user)
      } catch (error) {
        console.error('Error fetching session:', error)
      }
      setLoading(false)
    }
    fetchSession()
  }, [])

  const handleCalculate = () => {
    const distanceNum = Number.parseFloat(distance)
    const passengersNum = Number.parseInt(passengers)

    if (distanceNum && passengersNum && origin && destination) {
      // Base fare calculation (KSh 2 per km)
      const baseFare = distanceNum * 2
      
      // Fuel surcharge (KSh 1 per km)
      const fuelSurcharge = distanceNum * 1
      
      // Vehicle type multiplier
      let vehicleMultiplier = 1.0
      switch (vehicleType) {
        case "luxury":
          vehicleMultiplier = 1.5
          break
        case "standard":
          vehicleMultiplier = 1.0
          break
        case "economy":
          vehicleMultiplier = 0.8
          break
        default:
          vehicleMultiplier = 1.0
      }
      
      // Fixed operational cost
      const operationalCost = 200
      
      // Calculate final fare
      const fare = (baseFare + fuelSurcharge + operationalCost) * vehicleMultiplier
      
      setCalculatedFare(Math.round(fare))
      setTotalRevenue(Math.round(fare * passengersNum))
      
      setBreakdown({
        baseFare: Math.round(baseFare),
        fuelSurcharge: Math.round(fuelSurcharge),
        operationalCost: Math.round(operationalCost),
        vehicleMultiplier: vehicleMultiplier,
        totalPerPassenger: Math.round(fare)
      })
    }
  }

  const handleReset = () => {
    setOrigin("")
    setDestination("")
    setDistance("")
    setPassengers("")
    setVehicleType("")
    setCalculatedFare(null)
    setTotalRevenue(null)
    setBreakdown(null)
  }

  const isFormValid = origin && destination && distance && passengers && vehicleType

  if (loading) return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading calculator...</p>
      </div>
    </div>
  )

  if (!session) return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-red-600 mb-2">Not Logged In</h2>
        <p className="text-gray-600">Please log in to access the fare calculator.</p>
        <Button onClick={() => router.push('/login')} className="mt-4">
          Go to Login
        </Button>
      </div>
    </div>
  )

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <SidebarWrapper userType="driver" userName={session.name} userEmail={session.email} />

      <div className="flex-1 flex flex-col">
        <Header userName={session.name} notificationCount={2} />

        <main className="flex-1 p-6 bg-gray-50">
          <div className="max-w-6xl mx-auto space-y-6">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Fare Calculator</h1>
                <p className="text-gray-600 mt-1">Calculate trip costs and revenue projections</p>
              </div>
              <Badge className="bg-blue-100 text-blue-800 flex items-center gap-2">
                <Calculator className="h-4 w-4" />
                Professional Calculator
              </Badge>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
              {/* Calculator Form */}
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Route className="h-5 w-5" />
                      Trip Details
                    </CardTitle>
                    <CardDescription>Enter trip information to calculate fares</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Origin and Destination */}
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="origin" className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          Origin
                        </Label>
                        <Select value={origin} onValueChange={setOrigin}>
                          <SelectTrigger id="origin">
                            <SelectValue placeholder="Select origin" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="nairobi">Nairobi CBD</SelectItem>
                            <SelectItem value="mombasa">Mombasa</SelectItem>
                            <SelectItem value="kisumu">Kisumu</SelectItem>
                            <SelectItem value="nakuru">Nakuru</SelectItem>
                            <SelectItem value="eldoret">Eldoret</SelectItem>
                            <SelectItem value="thika">Thika</SelectItem>
                            <SelectItem value="kakamega">Kakamega</SelectItem>
                            <SelectItem value="kericho">Kericho</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="destination" className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          Destination
                        </Label>
                        <Select value={destination} onValueChange={setDestination}>
                          <SelectTrigger id="destination">
                            <SelectValue placeholder="Select destination" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="nairobi">Nairobi CBD</SelectItem>
                            <SelectItem value="mombasa">Mombasa</SelectItem>
                            <SelectItem value="kisumu">Kisumu</SelectItem>
                            <SelectItem value="nakuru">Nakuru</SelectItem>
                            <SelectItem value="eldoret">Eldoret</SelectItem>
                            <SelectItem value="thika">Thika</SelectItem>
                            <SelectItem value="kakamega">Kakamega</SelectItem>
                            <SelectItem value="kericho">Kericho</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Distance and Passengers */}
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="distance" className="flex items-center gap-2">
                          <Route className="h-4 w-4" />
                          Distance (km)
                        </Label>
                        <Input
                          id="distance"
                          type="number"
                          placeholder="Enter distance"
                          value={distance}
                          onChange={(e) => setDistance(e.target.value)}
                          min="1"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="passengers" className="flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          Number of Passengers
                        </Label>
                        <Input
                          id="passengers"
                          type="number"
                          placeholder="Enter passenger count"
                          value={passengers}
                          onChange={(e) => setPassengers(e.target.value)}
                          min="1"
                          max="45"
                        />
                      </div>
                    </div>

                    {/* Vehicle Type */}
                    <div className="space-y-2">
                      <Label htmlFor="vehicleType" className="flex items-center gap-2">
                        <Fuel className="h-4 w-4" />
                        Vehicle Type
                      </Label>
                      <Select value={vehicleType} onValueChange={setVehicleType}>
                        <SelectTrigger id="vehicleType">
                          <SelectValue placeholder="Select vehicle type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="economy">Economy (20% discount)</SelectItem>
                          <SelectItem value="standard">Standard</SelectItem>
                          <SelectItem value="luxury">Luxury (50% premium)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-4 pt-4">
                      <Button 
                        onClick={handleCalculate} 
                        disabled={!isFormValid}
                        className="flex-1 h-12 text-lg"
                      >
                        <Calculator className="mr-2 h-5 w-5" />
                        Calculate Fare
                      </Button>
                      <Button 
                        onClick={handleReset} 
                        variant="outline"
                        className="h-12"
                      >
                        Reset
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Results */}
                {calculatedFare !== null && (
                  <Card className="border-l-4 border-l-green-500">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-green-600">
                        <DollarSign className="h-5 w-5" />
                        Calculation Results
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-6 md:grid-cols-2">
                        <div className="text-center p-6 bg-green-50 rounded-lg">
                          <div className="text-sm text-gray-500 mb-1">Fare per Passenger</div>
                          <div className="text-4xl font-bold text-green-600">KSh {calculatedFare.toLocaleString()}</div>
                        </div>

                        <div className="text-center p-6 bg-blue-50 rounded-lg">
                          <div className="text-sm text-gray-500 mb-1">Total Revenue</div>
                          <div className="text-4xl font-bold text-blue-600">KSh {totalRevenue?.toLocaleString()}</div>
                        </div>
                      </div>

                      {/* Fare Breakdown */}
                      {breakdown && (
                        <div className="mt-6 border-t pt-6">
                          <h3 className="font-medium mb-4 flex items-center gap-2">
                            <TrendingUp className="h-4 w-4" />
                            Fare Breakdown
                          </h3>
                          <div className="space-y-3">
                            <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                              <span className="text-gray-600">Base fare (KSh 2/km)</span>
                              <span className="font-medium">KSh {breakdown.baseFare.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                              <span className="text-gray-600">Fuel surcharge (KSh 1/km)</span>
                              <span className="font-medium">KSh {breakdown.fuelSurcharge.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                              <span className="text-gray-600">Operational cost</span>
                              <span className="font-medium">KSh {breakdown.operationalCost.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                              <span className="text-gray-600">Vehicle multiplier</span>
                              <span className="font-medium">{breakdown.vehicleMultiplier}x</span>
                            </div>
                            <div className="flex justify-between p-4 bg-green-50 rounded-lg border-l-4 border-l-green-500">
                              <span className="font-semibold">Total fare per passenger</span>
                              <span className="font-bold text-green-600">KSh {breakdown.totalPerPassenger.toLocaleString()}</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Quick Stats */}
                <Card>
                  <CardHeader>
                    <CardTitle>Quick Stats</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-blue-600" />
                        <span className="text-sm">Avg. Trip Time</span>
                      </div>
                      <span className="font-semibold">2.5h</span>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-green-600" />
                        <span className="text-sm">Avg. Revenue</span>
                      </div>
                      <span className="font-semibold">KSh 8,500</span>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-orange-600" />
                        <span className="text-sm">Avg. Passengers</span>
                      </div>
                      <span className="font-semibold">25</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Popular Routes */}
                <Card>
                  <CardHeader>
                    <CardTitle>Popular Routes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                        <div className="font-medium">Nairobi → Mombasa</div>
                        <div className="text-sm text-gray-600">480 km • KSh 1,200</div>
                      </div>
                      
                      <div className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                        <div className="font-medium">Nairobi → Kisumu</div>
                        <div className="text-sm text-gray-600">350 km • KSh 900</div>
                      </div>
                      
                      <div className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                        <div className="font-medium">Nairobi → Nakuru</div>
                        <div className="text-sm text-gray-600">160 km • KSh 500</div>
                      </div>
                      
                      <div className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                        <div className="font-medium">Nairobi → Eldoret</div>
                        <div className="text-sm text-gray-600">310 km • KSh 800</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Tips */}
                <Card>
                  <CardHeader>
                    <CardTitle>Tips for Better Revenue</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 text-sm">
                      <div className="flex items-start gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                        <p>Consider peak hours for higher demand</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                        <p>Luxury vehicles command premium prices</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                        <p>Weekend trips often have higher occupancy</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                        <p>Maintain good ratings for repeat customers</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
