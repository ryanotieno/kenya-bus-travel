"use client";

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  User, 
  Car, 
  MapPin, 
  Route, 
  Users, 
  Clock, 
  Star,
  TrendingUp,
  Navigation,
  Fuel,
  Settings,
  BarChart3,
  Activity,
  Zap,
  Shield,
  Award,
  Target
} from "lucide-react"
import { QrReader } from "react-qr-reader";

interface DriverProfile {
  id: number
  firstName: string
  lastName: string
  email: string
  phone: string
  licenseNumber: string
  licenseExpiry: string
  status: string
  vehicle: {
    id: number
    name: string
    regNumber: string
    capacity: number
    status: string
  } | null
  route: {
    saccoName: string
    route: string
    routeStart: string
    routeEnd: string
    busStops: string[]
  } | null
}

export default function DriverDashboard() {
  const [driverProfile, setDriverProfile] = useState<DriverProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [animateCards, setAnimateCards] = useState(false)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [scanModal, setScanModal] = useState(false);
  const [scannedTicket, setScannedTicket] = useState<any>(null);
  const [scanError, setScanError] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);

  // Performance metrics (mock data)
  const performanceMetrics = {
    tripsToday: 8,
    revenue: 12500,
    rating: 4.8,
    onTimePercentage: 94,
    fuelEfficiency: 12.5,
    passengersSatisfaction: 96
  }

  const handleScan = async (data: string | null) => {
    if (data && !scanning) {
      setScanning(true);
      setScanError(null);
      // Fetch ticket details from API
      try {
        const res = await fetch(`/api/tickets/scan?code=${encodeURIComponent(data)}`);
        const json = await res.json();
        if (json.ticket) {
          setScannedTicket(json.ticket);
          setScanModal(false);
        } else {
          setScannedTicket(null);
          setScanError(json.error || "Ticket not found");
        }
      } catch (err) {
        setScanError("Failed to fetch ticket details");
      } finally {
        setScanning(false);
      }
    }
  };

  const handleError = (err: any) => {
    setScanError("QR scan error: " + (err?.message || err));
  };

  useEffect(() => {
    // Fetch real driver profile data
    const fetchDriverProfile = async () => {
      try {
        const response = await fetch('/api/drivers/profile')
        if (response.ok) {
          const data = await response.json()
          console.log("✅ Driver profile loaded:", data)
          setDriverProfile(data)
        } else {
          console.error('Failed to fetch driver profile:', response.status)
          const errorData = await response.json()
          console.error('Error details:', errorData)
        }
      } catch (error) {
        console.error('Error fetching driver profile:', error)
      } finally {
        setLoading(false)
        setAnimateCards(true)
      }
    }

    fetchDriverProfile()

    // Update time every second
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  if (!driverProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-gray-600">Driver profile not found</p>
          <p className="text-sm text-gray-500 mt-2">Please contact support or try logging in again</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header Section */}
        <div className={`transform transition-all duration-1000 ${animateCards ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Driver Dashboard
              </h1>
              <p className="text-gray-600 mt-2">
                Welcome back, {driverProfile.firstName}! Here's your performance overview.
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {currentTime.toLocaleDateString()} • {currentTime.toLocaleTimeString()}
              </p>
            </div>
            <div className="flex gap-3 mt-4 md:mt-0">
              <Button variant="outline" className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Settings
              </Button>
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                <Activity className="w-4 h-4 mr-2" />
                Start Trip
              </Button>
            </div>
          </div>
        </div>

        {/* Quick Stats Row */}
        <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 transform transition-all duration-1000 delay-200 ${animateCards ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">Trips Today</p>
                  <p className="text-3xl font-bold">{performanceMetrics.tripsToday}</p>
                </div>
                <Route className="w-8 h-8 text-blue-200" />
              </div>
              <div className="mt-4 flex items-center text-blue-100">
                <TrendingUp className="w-4 h-4 mr-1" />
                <span className="text-sm">+12% from yesterday</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm">Revenue</p>
                  <p className="text-3xl font-bold">KSh {performanceMetrics.revenue.toLocaleString()}</p>
                </div>
                <Target className="w-8 h-8 text-green-200" />
              </div>
              <div className="mt-4 flex items-center text-green-100">
                <TrendingUp className="w-4 h-4 mr-1" />
                <span className="text-sm">+8% from yesterday</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-500 to-orange-500 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-yellow-100 text-sm">Rating</p>
                  <div className="flex items-center gap-2">
                    <p className="text-3xl font-bold">{performanceMetrics.rating}</p>
                    <Star className="w-6 h-6 text-yellow-200 fill-current" />
                  </div>
                </div>
                <Award className="w-8 h-8 text-yellow-200" />
              </div>
              <div className="mt-4 flex items-center text-yellow-100">
                <span className="text-sm">Excellent performance!</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm">On-Time %</p>
                  <p className="text-3xl font-bold">{performanceMetrics.onTimePercentage}%</p>
                </div>
                <Clock className="w-8 h-8 text-purple-200" />
              </div>
              <div className="mt-4 flex items-center text-purple-100">
                <Shield className="w-4 h-4 mr-1" />
                <span className="text-sm">Very reliable</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Driver Profile Card */}
          <Card className={`lg:col-span-1 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105 transform ${animateCards ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'} delay-300`}>
            <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg">
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Driver Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="text-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4 shadow-lg">
                    {driverProfile.firstName[0]}{driverProfile.lastName[0]}
                  </div>
                  <h3 className="text-xl font-bold text-gray-800">
                    {driverProfile.firstName} {driverProfile.lastName}
                  </h3>
                  <Badge variant="outline" className="mt-2">
                    {driverProfile.status}
                  </Badge>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-600">Email</span>
                    <span className="font-medium text-gray-800">{driverProfile.email}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-600">Phone</span>
                    <span className="font-medium text-gray-800">{driverProfile.phone}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-600">License</span>
                    <span className="font-medium text-gray-800">{driverProfile.licenseNumber}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Vehicle Details Card */}
          <Card className={`lg:col-span-1 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105 transform ${animateCards ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'} delay-400`}>
            <CardHeader className="bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-t-lg">
              <CardTitle className="flex items-center gap-2">
                <Car className="w-5 h-5" />
                Assigned Vehicle
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {driverProfile.vehicle ? (
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-teal-600 rounded-full flex items-center justify-center text-white mx-auto mb-4 shadow-lg">
                      <Car className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800">{driverProfile.vehicle.name}</h3>
                    <p className="text-gray-600">{driverProfile.vehicle.regNumber}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-green-50 rounded-lg text-center">
                      <Users className="w-6 h-6 text-green-600 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-green-800">{driverProfile.vehicle.capacity}</p>
                      <p className="text-sm text-green-600">Capacity</p>
                    </div>
                    <div className="p-3 bg-blue-50 rounded-lg text-center">
                      <Shield className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                      <p className="text-lg font-bold text-blue-800 capitalize">{driverProfile.vehicle.status}</p>
                      <p className="text-sm text-blue-600">Status</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-600 flex items-center gap-2">
                        <Fuel className="w-4 h-4" />
                        Fuel Efficiency
                      </span>
                      <span className="font-medium text-gray-800">{performanceMetrics.fuelEfficiency} km/L</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-500">
                  <Car className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No vehicle assigned</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Route Information Card */}
          <Card className={`lg:col-span-1 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105 transform ${animateCards ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'} delay-500`}>
            <CardHeader className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-t-lg">
              <CardTitle className="flex items-center gap-2">
                <Navigation className="w-5 h-5" />
                Route Information
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {driverProfile.route ? (
                <div className="space-y-4">
                  <div className="text-center">
                    <h3 className="text-lg font-bold text-gray-800">{driverProfile.route.saccoName}</h3>
                    <p className="text-gray-600">{driverProfile.route.route}</p>
                  </div>
                  
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-purple-600" />
                        <span className="font-medium text-purple-800">Start</span>
                      </div>
                      <span className="text-purple-700">{driverProfile.route.routeStart}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-purple-600" />
                        <span className="font-medium text-purple-800">End</span>
                      </div>
                      <span className="text-purple-700">{driverProfile.route.routeEnd}</span>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-800 mb-3 flex items-center gap-2">
                      <Route className="w-4 h-4" />
                      Bus Stops ({driverProfile.route.busStops.length})
                    </h4>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {driverProfile.route.busStops.map((stop, index) => (
                        <div key={index} className="flex items-center gap-3 p-2 bg-gray-50 rounded">
                          <div className="w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                            {index + 1}
                          </div>
                          <span className="text-gray-700">{stop}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-500">
                  <Navigation className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No route assigned</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Performance Chart Section */}
        <Card className={`shadow-xl hover:shadow-2xl transition-all duration-500 transform ${animateCards ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'} delay-600`}>
          <CardHeader className="bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-t-lg">
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Performance Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-24 h-24 mx-auto mb-4 relative">
                  <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" className="text-gray-200" />
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" 
                            strokeDasharray={`${performanceMetrics.onTimePercentage * 0.628} 62.8`}
                            className="text-blue-600" />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-bold text-blue-600">{performanceMetrics.onTimePercentage}%</span>
                  </div>
                </div>
                <h4 className="font-semibold text-gray-800">On-Time Performance</h4>
                <p className="text-sm text-gray-600">Excellent reliability</p>
              </div>

              <div className="text-center">
                <div className="w-24 h-24 mx-auto mb-4 relative">
                  <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" className="text-gray-200" />
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" 
                            strokeDasharray={`${performanceMetrics.passengersSatisfaction * 0.628} 62.8`}
                            className="text-green-600" />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-bold text-green-600">{performanceMetrics.passengersSatisfaction}%</span>
                  </div>
                </div>
                <h4 className="font-semibold text-gray-800">Passenger Satisfaction</h4>
                <p className="text-sm text-gray-600">Outstanding service</p>
              </div>

              <div className="text-center">
                <div className="w-24 h-24 mx-auto mb-4 relative">
                  <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" className="text-gray-200" />
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" 
                            strokeDasharray={`${(performanceMetrics.rating / 5) * 62.8} 62.8`}
                            className="text-yellow-500" />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-bold text-yellow-600">{performanceMetrics.rating}</span>
                  </div>
                </div>
                <h4 className="font-semibold text-gray-800">Driver Rating</h4>
                <p className="text-sm text-gray-600">Top performer</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className={`flex flex-wrap gap-4 justify-center transform transition-all duration-1000 delay-700 ${animateCards ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300">
            <Zap className="w-5 h-5 mr-2" />
            Start New Trip
          </Button>
          <Button size="lg" variant="outline" className="shadow-lg hover:shadow-xl transition-all duration-300">
            <BarChart3 className="w-5 h-5 mr-2" />
            View Full Analytics
          </Button>
          <Button size="lg" variant="outline" className="shadow-lg hover:shadow-xl transition-all duration-300">
            <Settings className="w-5 h-5 mr-2" />
            Account Settings
          </Button>
        </div>

      </div>
      {/* Floating Scan QR Button */}
      <button
        className="fixed bottom-8 right-8 z-50 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg p-5 flex items-center justify-center text-2xl"
        onClick={() => setScanModal(true)}
        title="Scan Ticket QR"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9V5.25A2.25 2.25 0 016 3h3.75M14.25 3H18a2.25 2.25 0 012.25 2.25V9m0 6v3.75A2.25 2.25 0 0118 21h-3.75M9.75 21H6a2.25 2.25 0 01-2.25-2.25V15" />
        </svg>
      </button>
      {/* QR Scanner Modal */}
      {scanModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full relative">
            <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-600" onClick={() => setScanModal(false)}>×</button>
            <h2 className="text-xl font-bold mb-4">Scan Ticket QR Code</h2>
            <div style={{ width: 350, height: 350, margin: "0 auto", background: "#000", borderRadius: 12, overflow: "hidden", border: "2px solid #eee" }}>
              <QrReader
                constraints={{ facingMode: "environment" }}
                onResult={(result: any, error: any) => {
                  if (!!result) handleScan(result.getText());
                  if (!!error) handleError(error);
                }}
                videoContainerStyle={{
                  width: "100%",
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}
                videoStyle={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover"
                }}
              />
            </div>
            <div className="text-xs text-gray-500 mt-2">If you don't see the camera preview, check your browser permissions.</div>
            {scanError && <div className="text-red-600 mt-2">{scanError}</div>}
          </div>
        </div>
      )}
      {/* Ticket Details Modal */}
      {scannedTicket && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full relative">
            <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-600" onClick={() => { setScannedTicket(null); setScanning(false); }}>×</button>
            <h2 className="text-xl font-bold mb-4">Ticket Details</h2>
            <div className="space-y-2">
              <div><b>From:</b> {scannedTicket.from_stop}</div>
              <div><b>To:</b> {scannedTicket.to_stop}</div>
              <div><b>Status:</b> {scannedTicket.status}</div>
              <div><b>Fare:</b> KES {scannedTicket.fare}</div>
              <div><b>Booked At:</b> {scannedTicket.booked_at}</div>
              <div><b>Ticket ID:</b> {scannedTicket.id}</div>
              <div><b>QR Code:</b> {scannedTicket.qr_code}</div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button className="btn btn-secondary" onClick={() => { setScannedTicket(null); setScanning(false); }}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 