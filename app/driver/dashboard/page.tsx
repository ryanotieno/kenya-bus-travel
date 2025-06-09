"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { SidebarWrapper } from "@/components/sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Bus, Users, Clock, MapPin } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { useRouter } from "next/navigation"

export default function DriverDashboard() {
  const [tripProgress, setTripProgress] = useState(0)
  const [totalRevenue, setTotalRevenue] = useState(0)
  const [driverVehicle, setDriverVehicle] = useState<any>(null)
  const [shiftStarted, setShiftStarted] = useState(false)
  const [tripStarted, setTripStarted] = useState(false)
  const [showTripDialog, setShowTripDialog] = useState(false)
  const [passengerCount, setPassengerCount] = useState("")
  const [session, setSession] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  // Simulated stops and passengers
  const [stops, setStops] = useState<{
    id: number
    name: string
    distance: number
    passengers: number
  }[]>([])

  const [currentStopIndex, setCurrentStopIndex] = useState(0)
  const [pickupDialogOpen, setPickupDialogOpen] = useState(false)
  const [pickupCount, setPickupCount] = useState("")
  const [dropOffs, setDropOffs] = useState<{ stop: string }[]>([])
  const [onBoard, setOnBoard] = useState<{ dropOff: string }[]>([])

  // Track fares for each passenger as they are picked up
  const [fareRecords, setFareRecords] = useState<{ fare: number }[]>([])
  const [droppedCount, setDroppedCount] = useState(0)

  // New state for initial passenger assignment
  const [initialAssignmentOpen, setInitialAssignmentOpen] = useState(false)
  const [initialDropOffs, setInitialDropOffs] = useState<{ stop: string }[]>([])
  const [initialCount, setInitialCount] = useState(0)

  // Add state for drop-off counts per stop
  const [dropOffCounts, setDropOffCounts] = useState<{ [stop: string]: number }>({})
  const [initialDropOffCounts, setInitialDropOffCounts] = useState<{ [stop: string]: number }>({})

  // New state for trip summary
  const [showTripSummary, setShowTripSummary] = useState(false)

  // Fetch session and driver vehicle info on mount
  useEffect(() => {
    async function fetchSessionAndVehicle() {
      setLoading(true)
      const sessionRes = await fetch("/api/auth/session")
      if (!sessionRes.ok) {
        setSession(null)
        setLoading(false)
        return
      }
      const sessionData = await sessionRes.json()
      setSession(sessionData)
      // Now fetch driver vehicle
      const res = await fetch("/api/drivers")
      const drivers = await res.json()
      const driver = drivers.find((d: any) => d.email === sessionData.email)
      setDriverVehicle(driver)
      setLoading(false)
    }
    fetchSessionAndVehicle()
  }, [])

  // Generate stops when trip starts
  useEffect(() => {
    if (tripStarted) {
      // Simulate stops: CBD Terminal, Museum Hill, Westlands, Kileleshwa, Lavington (final drop-off)
      const stopNames = [
        "CBD Terminal",
        "Museum Hill",
        "Westlands",
        "Kileleshwa",
        "Lavington" // Final stop, drop-off only
      ]
      const simulatedStops = stopNames.slice(0, -1).map((name, i) => ({
        id: i + 1,
        name,
        distance: 2 + i * 3 + Math.floor(Math.random() * 2), // km from start
        passengers: 2 + Math.floor(Math.random() * 10)
      }))
      setStops(simulatedStops)
    } else {
      setStops([])
    }
  }, [tripStarted])

  // When trip starts, reset stop index and on-board list
  useEffect(() => {
    if (tripStarted) {
      setCurrentStopIndex(0)
      setOnBoard([])
      setDropOffs([])
    }
  }, [tripStarted])

  // Update trip progress whenever currentStopIndex or stops changes
  useEffect(() => {
    if (stops.length > 0) {
      // Progress is based on current stop index (including Lavington as the final stop)
      const totalStops = stops.length + 1 // +1 for Lavington
      setTripProgress(Math.round((currentStopIndex / (totalStops - 1)) * 100))
    } else {
      setTripProgress(0)
    }
  }, [currentStopIndex, stops])

  // Helper to get the current stop's distance (including Lavington)
  const getCurrentStopDistance = () => {
    if (currentStopIndex < stops.length) {
      return stops[currentStopIndex]?.distance ?? 0
    } else if (stops.length > 0) {
      // Lavington: last stop's distance + 3
      return stops[stops.length - 1].distance + 3
    }
    return 0
  }

  // Helper to get vehicle capacity
  const vehicleCapacity = driverVehicle?.vehicle?.capacity || 45
  const onBoardCount = onBoard.length

  // In pickup dialog, show counters for each stop ahead
  // Replace dropOffs with dropOffCounts
  const handleDropOffCountChange = (stop: string, value: number) => {
    setDropOffCounts(prev => ({ ...prev, [stop]: value }))
  }
  // In initial assignment dialog
  const handleInitialDropOffCountChange = (stop: string, value: number) => {
    setInitialDropOffCounts(prev => ({ ...prev, [stop]: value }))
  }

  // Confirm pickup with counters
  const handlePickupConfirm = (e: React.FormEvent) => {
    e.preventDefault()
    const count = Number(pickupCount)
    if (!count || count < 1) return
    // Validate total
    const totalAssigned = Object.values(dropOffCounts).reduce((a, b) => a + b, 0)
    if (totalAssigned !== count) return
    // Validate capacity
    if (onBoardCount + count > vehicleCapacity) return
    const currentDistance = getCurrentStopDistance()
    const dropOffOptions = getDropOffOptions()
    // Create onBoard and fare records
    let newOnBoard: { dropOff: string }[] = []
    let fares: { fare: number }[] = []
    for (const stop of Object.keys(dropOffCounts)) {
      const n = dropOffCounts[stop]
      if (n > 0) {
        let toDist: number | undefined
        if (stop === "Lavington") {
          toDist = (stops.length > 0 ? stops[stops.length - 1].distance + 3 : 0)
        } else {
          toDist = dropOffOptions.find(s => s.name === stop)?.distance
        }
        if (typeof toDist !== "number" || isNaN(toDist)) toDist = 0
        for (let i = 0; i < n; ++i) {
          newOnBoard.push({ dropOff: stop })
          fares.push({ fare: Math.max(0, toDist - currentDistance) * 5 })
        }
      }
    }
    setFareRecords(prev => [...prev, ...fares])
    setOnBoard([...onBoard, ...newOnBoard])
    setStops(prev => prev.map((s, i) =>
      i === currentStopIndex ? { ...s, passengers: Math.max(0, s.passengers - count) } : s
    ))
    setPickupDialogOpen(false)
    setDropOffCounts({})
  }

  // When dropping off, update total revenue immediately
  useEffect(() => {
    // Revenue is sum of all fares for dropped-off passengers
    const revenue = fareRecords.slice(0, droppedCount).reduce((sum, f) => sum + f.fare, 0)
    setTotalRevenue(revenue)
  }, [droppedCount, fareRecords])

  const handleStartDriving = () => {
    setShiftStarted(true)
  }

  const handleStartTrip = () => {
    setShowTripDialog(true)
  }

  const handleTripDialogSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setTripStarted(true)
    setShowTripDialog(false)
  }

  // End trip handler
  const handleEndTrip = () => {
    setTripStarted(false)
    setPassengerCount("")
    setStops([])
  }

  // End session handler
  const handleEndSession = () => {
    router.push("/logout")
  }

  // Handle pickup at current stop
  const handlePickup = () => {
    setPickupDialogOpen(true)
    setPickupCount("")
    setDropOffs([])
  }

  // Handle drop-off stop selection for each passenger
  const handleDropOffChange = (idx: number, value: string) => {
    setDropOffs(prev => {
      const updated = [...prev]
      updated[idx] = { stop: value }
      return updated
    })
  }

  // Move to next stop (including Lavington)
  const handleNextStop = () => {
    let stopName = null
    if (currentStopIndex < stops.length) {
      stopName = stops[currentStopIndex].name
    } else {
      stopName = "Lavington"
    }
    const departing = onBoard.filter(p => p.dropOff === stopName)
    const newDroppedCount = droppedCount + departing.length
    setDroppedCount(newDroppedCount)
    setOnBoard(prev => prev.filter(p => p.dropOff !== stopName))
    // If Lavington was just reached, end trip and show summary
    if (currentStopIndex >= stops.length) {
      setTripStarted(false)
      setShowTripSummary(true)
    } else {
      setCurrentStopIndex(idx => idx + 1)
    }
  }

  // In the pickup dialog and initial assignment, update drop-off options to include all stops ahead and Lavington
  const getDropOffOptions = () => {
    const aheadStops = stops.slice(currentStopIndex + 1).map(s => ({ name: s.name, distance: s.distance }))
    // Add Lavington as the final drop-off
    let lavingtonDistance = 0
    if (stops.length > 0) {
      const lastStop = stops[stops.length - 1]
      lavingtonDistance = lastStop.distance + 3
    }
    return [
      ...aheadStops,
      { name: "Lavington", distance: lavingtonDistance }
    ]
  }

  // When trip starts, if there are initial passengers at the first stop, prompt for drop-off assignment
  useEffect(() => {
    if (tripStarted && stops.length > 0 && stops[0].passengers > 0) {
      setInitialCount(stops[0].passengers)
      setInitialDropOffs(Array(stops[0].passengers).fill({ stop: "" }))
      setInitialAssignmentOpen(true)
    }
  }, [tripStarted, stops])

  // Handle drop-off selection for initial passengers
  const handleInitialDropOffChange = (idx: number, value: string) => {
    setInitialDropOffs(prev => {
      const updated = [...prev]
      updated[idx] = { stop: value }
      return updated
    })
  }

  // Confirm initial assignment with counters
  const handleInitialAssignmentConfirm = (e: React.FormEvent) => {
    e.preventDefault()
    const count = initialCount
    if (!count || count < 1) return
    // Validate total
    const totalAssigned = Object.values(initialDropOffCounts).reduce((a, b) => a + b, 0)
    if (totalAssigned !== count) return
    // Validate capacity
    if (onBoardCount + count > vehicleCapacity) return
    const currentDistance = getCurrentStopDistance()
    const dropOffOptions = getDropOffOptions()
    let newOnBoard: { dropOff: string }[] = []
    let fares: { fare: number }[] = []
    for (const stop of Object.keys(initialDropOffCounts)) {
      const n = initialDropOffCounts[stop]
      if (n > 0) {
        let toDist: number | undefined
        if (stop === "Lavington") {
          toDist = (stops.length > 0 ? stops[stops.length - 1].distance + 3 : 0)
        } else {
          toDist = dropOffOptions.find(s => s.name === stop)?.distance
        }
        if (typeof toDist !== "number" || isNaN(toDist)) toDist = 0
        for (let i = 0; i < n; ++i) {
          newOnBoard.push({ dropOff: stop })
          fares.push({ fare: Math.max(0, toDist - currentDistance) * 5 })
        }
      }
    }
    setFareRecords(prev => [...prev, ...fares])
    setOnBoard([...onBoard, ...newOnBoard])
    setStops(prev => prev.map((s, i) =>
      i === 0 ? { ...s, passengers: 0 } : s
    ))
    setInitialAssignmentOpen(false)
    setInitialDropOffCounts({})
  }

  // Handle start new trip
  const handleStartNewTrip = () => {
    setShowTripSummary(false)
    setTripStarted(false)
    setPassengerCount("")
    setStops([])
    setCurrentStopIndex(0)
    setOnBoard([])
    setDropOffs([])
    setFareRecords([])
    setDroppedCount(0)
    setPickupCount("")
    setDropOffCounts({})
    setInitialDropOffCounts({})
    setInitialAssignmentOpen(false)
    setInitialDropOffs([])
    setInitialCount(0)
  }

  if (loading) return <div className="p-8 text-center">Loading...</div>
  if (!session) return <div className="p-8 text-center text-red-600">Not logged in</div>

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <SidebarWrapper userType="driver" userName={session.name} userEmail={session.email} />

      <div className="flex-1 flex flex-col">
        <Header userName={session.name} notificationCount={2} />

        <main className="flex-1 p-6">
          <div className="max-w-5xl mx-auto space-y-6">
            <div>
              <h1 className="text-2xl font-bold">Current Trip</h1>
              <p className="text-muted-foreground">Monitor and manage your active trip</p>
            </div>

            {/* Vehicle Info */}
            {driverVehicle && (
              <Card>
                <CardHeader>
                  <CardTitle>Your Vehicle</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col gap-2">
                    <div><b>Sacco:</b> {driverVehicle.sacco}</div>
                    <div><b>Vehicle Reg:</b> {driverVehicle.vehicle}</div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Shift/Trip Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Driver Actions</CardTitle>
              </CardHeader>
              <CardContent>
                {!shiftStarted ? (
                  <Button className="w-full" onClick={handleStartDriving}>Start Driving</Button>
                ) : !tripStarted && !showTripSummary ? (
                  <Button className="w-full" onClick={handleStartTrip}>Start Trip</Button>
                ) : tripStarted ? (
                  <div className="text-green-600 font-semibold">Trip in progress with {passengerCount} passengers.</div>
                ) : null}
              </CardContent>
            </Card>

            {/* Trip Dialog */}
            <Dialog open={showTripDialog} onOpenChange={setShowTripDialog}>
              <DialogContent>
                <form onSubmit={handleTripDialogSubmit}>
                  <DialogHeader>
                    <DialogTitle>Start Trip</DialogTitle>
                  </DialogHeader>
                  <div className="py-4">
                    <label htmlFor="passengerCount" className="block mb-2">Number of Passengers</label>
                    <Input
                      id="passengerCount"
                      type="number"
                      min="0"
                      value={passengerCount}
                      onChange={e => setPassengerCount(e.target.value)}
                      required
                    />
                  </div>
                  <DialogFooter>
                    <Button type="submit">Start Trip</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>

            {/* Simulated Passenger List (only when trip started) */}
            {tripStarted && stops.length > 0 && !showTripSummary && (
              <Card>
                <CardHeader>
                  <CardTitle>Passengers Awaiting Pickup</CardTitle>
                </CardHeader>
                <CardContent>
                  {/* Do not display CBD Terminal in the pickup list */}
                  {stops.slice(1).map((stop, idx) => {
                    const realIdx = idx + 1 // offset for slice
                    return (
                      <div key={stop.id} className={`flex justify-between items-center border-b py-2 ${realIdx === currentStopIndex ? 'bg-orange-50' : ''}`}>
                        <div>
                          <span className="font-medium">{stop.name}</span>
                          <span className="ml-2 text-xs text-gray-500">({stop.distance} km)</span>
                          {realIdx === currentStopIndex && <span className="ml-2 text-xs text-orange-600 font-semibold">Current Stop</span>}
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-orange-500" />
                          <button
                            className={`font-bold px-2 py-1 rounded ${realIdx === currentStopIndex && stop.passengers > 0 ? 'bg-orange-500 text-white hover:bg-orange-600' : 'bg-gray-200 text-gray-700 cursor-default'}`}
                            disabled={realIdx !== currentStopIndex || stop.passengers === 0}
                            onClick={() => { if (realIdx === currentStopIndex && stop.passengers > 0) handlePickup() }}
                          >
                            {stop.passengers}
                          </button>
                          <span className="text-xs text-gray-500">awaiting</span>
                        </div>
                      </div>
                    )
                  })}
                  {/* On-board passengers list */}
                  <div className="mt-4">
                    <div className="font-semibold mb-2">On-board Passengers</div>
                    {onBoard.length === 0 ? (
                      <div className="text-gray-500">No passengers on board.</div>
                    ) : (
                      <ul className="list-disc ml-6">
                        {onBoard.map((p, i) => (
                          <li key={i}>Drop-off: {p.dropOff}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                  <div className="flex gap-4 mt-4">
                    <Button onClick={handleNextStop} disabled={currentStopIndex > stops.length}>Next Stop</Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Trip Summary after Lavington */}
            {showTripSummary && (
              <Card className="border-2 border-green-500">
                <CardHeader>
                  <CardTitle>Trip Complete!</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-lg font-semibold text-green-700 mb-2">Total Revenue: ${totalRevenue}</div>
                  <div className="text-lg font-semibold text-blue-700 mb-4">Total Passengers Picked: {fareRecords.length}</div>
                  <Button onClick={handleStartNewTrip}>Start New Trip</Button>
                </CardContent>
              </Card>
            )}

            {/* End Trip and End Session Buttons */}
            {(tripStarted || shiftStarted) && (
              <div className="flex gap-4 mt-4">
                {tripStarted && (
                  <Button variant="destructive" onClick={handleEndTrip} className="flex-1">End Trip</Button>
                )}
                {shiftStarted && (
                  <Button variant="outline" onClick={handleEndSession} className="flex-1">End Session</Button>
                )}
              </div>
            )}

            <div className="grid gap-6 md:grid-cols-3">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Trip ID</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">CBD-LAV-001</div>
                  <p className="text-xs text-muted-foreground mt-1">Bus ID: KBL 001A</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Passengers</CardTitle>
                </CardHeader>
                <CardContent className="flex items-baseline justify-between">
                  <div className="text-2xl font-bold">{passengerCount || 0}/45</div>
                  <div className="flex items-center gap-1 text-green-600">
                    <Users className="h-4 w-4" />
                    <span className="text-sm">{Math.round(((Number(passengerCount) || 0) / 45) * 100)}% Full</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Estimated Arrival</CardTitle>
                </CardHeader>
                <CardContent className="flex items-baseline justify-between">
                  <div className="text-2xl font-bold">10:30 AM</div>
                  <div className="flex items-center gap-1 text-orange-600">
                    <Clock className="h-4 w-4" />
                    <span className="text-sm">On Time</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Trip Progress</CardTitle>
                <CardDescription>CBD Terminal to Lavington • 10 km</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      <span>CBD Terminal</span>
                    </div>
                    <div>{tripProgress}% Complete</div>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      <span>Lavington</span>
                    </div>
                  </div>
                  <Progress value={tripProgress} className="h-2" />
                  <div className="mt-2 text-lg font-semibold text-green-700">Revenue Collected: ${totalRevenue}</div>

                  <div className="pt-4 grid gap-4 md:grid-cols-2">
                    <div className="border rounded-lg p-4">
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="font-medium">Current Location</h3>
                        <div className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">Live</div>
                      </div>
                      <p className="text-gray-600">Westlands</p>
                      <div className="mt-2 text-sm text-gray-500">Last updated: 5 minutes ago</div>
                    </div>

                    <div className="border rounded-lg p-4">
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="font-medium">Next Stop</h3>
                        <div className="text-xs bg-orange-100 text-orange-800 px-2 py-0.5 rounded">10 min</div>
                      </div>
                      <p className="text-gray-600">Kileleshwa</p>
                      <div className="mt-2 text-sm text-gray-500">Scheduled arrival: 10:20 AM</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Trip Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Route</span>
                      <span className="font-medium">CBD Terminal - Lavington</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Departure</span>
                      <span className="font-medium">10:00 AM, Today</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Arrival</span>
                      <span className="font-medium">10:30 AM, Today</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Distance</span>
                      <span className="font-medium">12 km</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Driver</span>
                      <span className="font-medium">{session.name}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    <Button className="w-full">
                      <Bus className="mr-2 h-4 w-4" />
                      Update Trip Status
                    </Button>
                    <Button variant="outline" className="w-full">
                      <Users className="mr-2 h-4 w-4" />
                      View Passenger List
                    </Button>
                    <Button variant="outline" className="w-full">
                      <Clock className="mr-2 h-4 w-4" />
                      Update ETA
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Pickup Dialog */}
            <Dialog open={pickupDialogOpen} onOpenChange={setPickupDialogOpen}>
              <DialogContent>
                <form onSubmit={handlePickupConfirm}>
                  <DialogHeader>
                    <DialogTitle>Pick Up Passengers at {stops[currentStopIndex]?.name}</DialogTitle>
                  </DialogHeader>
                  <div className="py-4 space-y-4">
                    <label htmlFor="pickupCount" className="block mb-2">How many passengers are you picking up?</label>
                    <Input
                      id="pickupCount"
                      type="number"
                      min="1"
                      max={stops[currentStopIndex]?.passengers || 1}
                      value={pickupCount}
                      onChange={e => {
                        setPickupCount(e.target.value)
                        setDropOffs(Array(Number(e.target.value) || 0).fill({ stop: "" }))
                      }}
                      required
                    />
                    {Number(pickupCount) > 0 && (
                      <div className="space-y-2">
                        <div className="font-medium">Assign drop-off count for each stop:</div>
                        {getDropOffOptions().map((s) => {
                          const value = dropOffCounts[s.name] || 0
                          const fare = Math.max(0, s.distance - getCurrentStopDistance()) * 5
                          return (
                            <div key={s.name} className="flex items-center gap-2">
                              <span>{s.name}:</span>
                              <Input
                                type="number"
                                min={0}
                                max={Number(pickupCount) - Object.values(dropOffCounts).reduce((a, b) => a + b, 0) + value}
                                value={value}
                                onChange={e => handleDropOffCountChange(s.name, Math.max(0, Math.min(Number(e.target.value), Number(pickupCount) - Object.values(dropOffCounts).reduce((a, b) => a + b, 0) + value)))}
                                className="w-20"
                              />
                              <span className="ml-2 text-green-700 font-semibold">${fare}</span>
                            </div>
                          )
                        })}
                        <div className="text-sm mt-2">Total assigned: {Object.values(dropOffCounts).reduce((a, b) => a + b, 0)} / {pickupCount}</div>
                        <div className="text-sm text-gray-500">Remaining vehicle capacity: {vehicleCapacity - onBoardCount}</div>
                      </div>
                    )}
                  </div>
                  <DialogFooter>
                    <Button type="submit" disabled={
                      !pickupCount ||
                      Object.values(dropOffCounts).reduce((a, b) => a + b, 0) !== Number(pickupCount) ||
                      (onBoardCount + Number(pickupCount)) > vehicleCapacity ||
                      Object.values(dropOffCounts).some(v => isNaN(v) || v < 0)
                    }>Confirm Pickup</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>

            {/* Initial Assignment Dialog */}
            <Dialog open={initialAssignmentOpen} onOpenChange={() => {}}>
              <DialogContent>
                <form onSubmit={handleInitialAssignmentConfirm}>
                  <DialogHeader>
                    <DialogTitle>Assign Drop-off for Initial Passengers at {stops[0]?.name}</DialogTitle>
                  </DialogHeader>
                  <div className="py-4 space-y-2">
                    <div className="font-medium">Assign drop-off count for each stop:</div>
                    {initialCount > 0 && (
                      <div className="space-y-2">
                        {getDropOffOptions().map((s) => {
                          const value = initialDropOffCounts[s.name] || 0
                          const fare = Math.max(0, s.distance - getCurrentStopDistance()) * 5
                          return (
                            <div key={s.name} className="flex items-center gap-2">
                              <span>{s.name}:</span>
                              <Input
                                type="number"
                                min={0}
                                max={initialCount - Object.values(initialDropOffCounts).reduce((a, b) => a + b, 0) + value}
                                value={value}
                                onChange={e => handleInitialDropOffCountChange(s.name, Math.max(0, Math.min(Number(e.target.value), initialCount - Object.values(initialDropOffCounts).reduce((a, b) => a + b, 0) + value)))}
                                className="w-20"
                              />
                              <span className="ml-2 text-green-700 font-semibold">${fare}</span>
                            </div>
                          )
                        })}
                        <div className="text-sm mt-2">Total assigned: {Object.values(initialDropOffCounts).reduce((a, b) => a + b, 0)} / {initialCount}</div>
                        <div className="text-sm text-gray-500">Remaining vehicle capacity: {vehicleCapacity - onBoardCount}</div>
                      </div>
                    )}
                  </div>
                  <DialogFooter>
                    <Button type="submit" disabled={
                      Object.values(initialDropOffCounts).reduce((a, b) => a + b, 0) !== initialCount ||
                      (onBoardCount + initialCount) > vehicleCapacity ||
                      Object.values(initialDropOffCounts).some(v => isNaN(v) || v < 0)
                    }>Confirm</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </main>
      </div>
    </div>
  )
}
