"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { SidebarWrapper } from "@/components/sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Bell, Shield, User, MapPin, Bus } from "lucide-react"

interface Driver {
  firstName: string
  lastName: string
  email: string
  phone: string
  license: string
  experience: string
  sacco: string
  vehicle: string
  registeredAt: string
}

interface Vehicle {
  name: string
  regNumber: string
  capacity: number
  id: number
}

interface Sacco {
  saccoName: string
  route?: string
  routeStart?: string
  routeEnd?: string
  vehicles: Vehicle[]
}

interface Company {
  ownerEmail: string
  ownerName?: string
  companyName?: string
  saccos: Sacco[]
}

export default function DriverSettings() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)
  const [locationSharing, setLocationSharing] = useState(true)
  const [driver, setDriver] = useState<Driver | null>(null)
  const [vehicle, setVehicle] = useState<Vehicle | null>(null)
  const [sacco, setSacco] = useState<Sacco | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDriverData = async () => {
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
        const userEmail = user.email
        
        // Fetch drivers data
        const driversResponse = await fetch('/api/drivers')
        const drivers: Driver[] = await driversResponse.json()
        const currentDriver = drivers.find(d => d.email === userEmail)
        
        if (currentDriver) {
          setDriver(currentDriver)
          
          // Fetch companies data to get vehicle and sacco details
          const companiesResponse = await fetch('/api/companies')
          const companies: Company[] = await companiesResponse.json()
          
          // Find the sacco and vehicle for this driver
          for (const company of companies) {
            for (const saccoData of company.saccos) {
              if (saccoData.saccoName === currentDriver.sacco) {
                setSacco(saccoData)
                
                // Find the specific vehicle
                const vehicleData = saccoData.vehicles.find(v => v.regNumber === currentDriver.vehicle)
                if (vehicleData) {
                  setVehicle(vehicleData)
                }
                break
              }
            }
          }
        }
      } catch (error) {
        console.error('Error fetching driver data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchDriverData()
  }, [])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading driver information...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <SidebarWrapper 
        userType="driver" 
        userName={driver ? `${driver.firstName} ${driver.lastName}` : ''} 
        userEmail={driver?.email || ''} 
      />

      <div className="flex-1 flex flex-col">
        <Header 
          userName={driver ? `${driver.firstName} ${driver.lastName}` : ''} 
          notificationCount={2} 
        />

        <main className="flex-1 p-6">
          <div className="max-w-4xl mx-auto space-y-6">
            <div>
              <h1 className="text-2xl font-bold">Settings</h1>
              <p className="text-muted-foreground">Manage your account settings and preferences</p>
            </div>

            <Tabs defaultValue="profile" className="space-y-6">
              <TabsList className="grid grid-cols-4 w-full">
                <TabsTrigger value="profile">Profile</TabsTrigger>
                <TabsTrigger value="vehicle">Vehicle</TabsTrigger>
                <TabsTrigger value="notifications">Notifications</TabsTrigger>
                <TabsTrigger value="privacy">Privacy</TabsTrigger>
              </TabsList>

              <TabsContent value="profile" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Driver Information</CardTitle>
                    <CardDescription>Update your personal information</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-center mb-6">
                      <div className="relative">
                        <div className="h-24 w-24 rounded-full bg-orange-100 text-orange-800 flex items-center justify-center text-3xl font-semibold">
                          {driver?.firstName?.charAt(0) || 'D'}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="absolute -bottom-2 -right-2 rounded-full h-8 w-8 p-0"
                        >
                          <User className="h-4 w-4" />
                          <span className="sr-only">Change avatar</span>
                        </Button>
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="first-name">First name</Label>
                        <Input id="first-name" defaultValue={driver?.firstName || ''} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="last-name">Last name</Label>
                        <Input id="last-name" defaultValue={driver?.lastName || ''} />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" defaultValue={driver?.email || ''} />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone number</Label>
                      <Input id="phone" type="tel" defaultValue={driver?.phone || ''} />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="license">Driver's License Number</Label>
                      <Input id="license" defaultValue={driver?.license || ''} />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="experience">Years of Experience</Label>
                      <Select defaultValue={driver?.experience || '1'}>
                        <SelectTrigger id="experience">
                          <SelectValue placeholder="Select years" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1 year</SelectItem>
                          <SelectItem value="2">2 years</SelectItem>
                          <SelectItem value="3">3 years</SelectItem>
                          <SelectItem value="4">4 years</SelectItem>
                          <SelectItem value="5">5+ years</SelectItem>
                          <SelectItem value="10">10+ years</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="sacco">Sacco</Label>
                      <Input id="sacco" defaultValue={driver?.sacco || ''} disabled />
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-end gap-2">
                    <Button variant="outline">Cancel</Button>
                    <Button>Save Changes</Button>
                  </CardFooter>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Change Password</CardTitle>
                    <CardDescription>Update your password to keep your account secure</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="current-password">Current password</Label>
                      <Input id="current-password" type="password" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="new-password">New password</Label>
                      <Input id="new-password" type="password" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirm-password">Confirm new password</Label>
                      <Input id="confirm-password" type="password" />
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-end gap-2">
                    <Button variant="outline">Cancel</Button>
                    <Button>Update Password</Button>
                  </CardFooter>
                </Card>
              </TabsContent>

              <TabsContent value="vehicle" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Vehicle Information</CardTitle>
                    <CardDescription>Your assigned vehicle details</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="bus-id">Bus Registration Number</Label>
                      <Input id="bus-id" defaultValue={vehicle?.regNumber || driver?.vehicle || ''} disabled />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="bus-model">Bus Model</Label>
                      <Input id="bus-model" defaultValue={vehicle?.name || ''} disabled />
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="capacity">Passenger Capacity</Label>
                        <Input id="capacity" type="number" defaultValue={vehicle?.capacity?.toString() || ''} disabled />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="route">Assigned Route</Label>
                        <Input id="route" defaultValue={sacco?.route || `${sacco?.routeStart || ''} - ${sacco?.routeEnd || ''}`} disabled />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="sacco-name">Sacco Name</Label>
                      <Input id="sacco-name" defaultValue={sacco?.saccoName || driver?.sacco || ''} disabled />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="last-maintenance">Last Maintenance Date</Label>
                      <Input id="last-maintenance" type="date" defaultValue="2025-03-15" />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="next-maintenance">Next Scheduled Maintenance</Label>
                      <Input id="next-maintenance" type="date" defaultValue="2025-06-15" />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="amenities">Amenities</Label>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="flex items-center space-x-2">
                          <Switch id="wifi" defaultChecked />
                          <Label htmlFor="wifi">WiFi</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch id="ac" defaultChecked />
                          <Label htmlFor="ac">Air Conditioning</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch id="usb" defaultChecked />
                          <Label htmlFor="usb">USB Charging</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch id="tv" />
                          <Label htmlFor="tv">TV Screens</Label>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-end gap-2">
                    <Button variant="outline">Cancel</Button>
                    <Button>Save Vehicle Information</Button>
                  </CardFooter>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Vehicle Documentation</CardTitle>
                    <CardDescription>Manage your vehicle documents</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="insurance">Insurance Expiry Date</Label>
                      <Input id="insurance" type="date" defaultValue="2025-12-31" />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="inspection">Last Vehicle Inspection Date</Label>
                      <Input id="inspection" type="date" defaultValue="2025-02-10" />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="license-expiry">Vehicle License Expiry</Label>
                      <Input id="license-expiry" type="date" defaultValue="2026-01-15" />
                    </div>

                    <div className="border rounded-lg p-4 mt-4">
                      <h3 className="font-medium mb-2">Upload Documents</h3>
                      <div className="grid gap-4 md:grid-cols-2">
                        <Button variant="outline" className="w-full">
                          <Bus className="mr-2 h-4 w-4" />
                          Upload Insurance
                        </Button>
                        <Button variant="outline" className="w-full">
                          <Bus className="mr-2 h-4 w-4" />
                          Upload Registration
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-end gap-2">
                    <Button variant="outline">Cancel</Button>
                    <Button>Save Documentation</Button>
                  </CardFooter>
                </Card>
              </TabsContent>

              <TabsContent value="notifications" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Notification Preferences</CardTitle>
                    <CardDescription>Manage how you receive notifications</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <Bell className="h-5 w-5 text-orange-500" />
                          <h3 className="font-medium">All Notifications</h3>
                        </div>
                        <p className="text-sm text-muted-foreground">Enable or disable all notifications</p>
                      </div>
                      <Switch checked={notificationsEnabled} onCheckedChange={setNotificationsEnabled} />
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-sm font-medium">Notification Types</h4>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="trip-notifications" className="flex items-center gap-2 cursor-pointer">
                            <span>Trip assignments</span>
                          </Label>
                          <Switch id="trip-notifications" defaultChecked disabled={!notificationsEnabled} />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label htmlFor="passenger-notifications" className="flex items-center gap-2 cursor-pointer">
                            <span>Passenger updates</span>
                          </Label>
                          <Switch id="passenger-notifications" defaultChecked disabled={!notificationsEnabled} />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label htmlFor="maintenance-notifications" className="flex items-center gap-2 cursor-pointer">
                            <span>Maintenance reminders</span>
                          </Label>
                          <Switch id="maintenance-notifications" defaultChecked disabled={!notificationsEnabled} />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label htmlFor="schedule-notifications" className="flex items-center gap-2 cursor-pointer">
                            <span>Schedule changes</span>
                          </Label>
                          <Switch id="schedule-notifications" defaultChecked disabled={!notificationsEnabled} />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-end">
                    <Button>Save Preferences</Button>
                  </CardFooter>
                </Card>
              </TabsContent>

              <TabsContent value="privacy" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Privacy Settings</CardTitle>
                    <CardDescription>Manage your privacy preferences</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-5 w-5 text-orange-500" />
                          <h3 className="font-medium">Location Sharing</h3>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Share your location with passengers during trips
                        </p>
                      </div>
                      <Switch checked={locationSharing} onCheckedChange={setLocationSharing} />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <Shield className="h-5 w-5 text-orange-500" />
                          <h3 className="font-medium">Data Collection</h3>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Allow collection of driving patterns for service improvement
                        </p>
                      </div>
                      <Switch defaultChecked />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <User className="h-5 w-5 text-orange-500" />
                          <h3 className="font-medium">Profile Visibility</h3>
                        </div>
                        <p className="text-sm text-muted-foreground">Show your profile information to passengers</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-end">
                    <Button>Save Settings</Button>
                  </CardFooter>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  )
}
